"""Render the real shadow sampler against adversarial map edges and slopes."""
from pathlib import Path
import re
import numpy as np
import moderngl

source=(Path(__file__).resolve().parent.parent/'dist/app.js').read_text()
fragment=re.search(r'const fs=`(.*?)`;',source,re.S)[1]
start=fragment.index('float shadowVisibility(')
helper=fragment[start:fragment.index('void main(){bool underSurface=',start)]
legacy='''float legacyVisibility(vec3 p,vec3 dx,vec3 dy){float sum=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)sum+=p.z-.0015<=textureLod(shadow,p.xy+vec2(x,y)/64.,0.).r?1.:0.;return sum/9.;}'''
ctx=moderngl.create_standalone_context(backend='egl')
vertex='#version 330\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}'
prefix='#version 330\nuniform sampler2D shadow;uniform int mode;out float value;\n'
body='''void main(){vec2 uv=gl_FragCoord.xy/64.;vec3 dx=vec3(1./64.,0.,.22/64.),dy=vec3(0.,1./64.,.18/64.);vec3 p=mode==0?vec3(uv*2.-.5,.6):vec3(uv,.35+.22*uv.x+.18*uv.y);value=SAMPLER(p,dx,dy);}'''
programs=[ctx.program(vertex_shader=vertex,fragment_shader=prefix+helper+body.replace('SAMPLER','shadowVisibility')),ctx.program(vertex_shader=vertex,fragment_shader=prefix+legacy+body.replace('SAMPLER','legacyVisibility'))]
depth=ctx.depth_texture((64,64));depth.compare_func='';depth.repeat_x=False;depth.repeat_y=False;depth.filter=(moderngl.NEAREST,moderngl.NEAREST);depth.use(0)
texture=ctx.texture((64,64),1,dtype='f4');frame=ctx.framebuffer(color_attachments=[texture]);frame.use();ctx.viewport=(0,0,64,64)
def render(program,data,mode):
    depth.write(np.asarray(data,dtype='f4').tobytes());program['shadow'].value=0;program['mode'].value=mode
    ctx.vertex_array(program,[]).render(vertices=3)
    return np.frombuffer(frame.read(components=1,dtype='f4'),dtype='f4').reshape(64,64).copy()

# Occluders touch each map border. Repeating a clamped border depth creates
# exactly the long dark strips seen outside a focused inspection shadow map.
occluders=np.ones((64,64),dtype='f4');occluders[:4,:]=.2;occluders[-4:,:]=.2;occluders[:,:4]=.2;occluders[:,-4:]=.2;occluders[20:44,20:44]=.2
fixed=render(programs[0],occluders,0);broken=render(programs[1],occluders,0)
yy,xx=np.mgrid[:64,:64];uvx=(xx+.5)/64*2-.5;uvy=(yy+.5)/64*2-.5
outside=(uvx<0)|(uvx>1)|(uvy<0)|(uvy>1)
assert np.all(fixed[outside]>.999),'Shadow-map edge extrudes across the unshadowed scene'
assert np.mean(broken[outside]<.1)>.5,'Negative control did not reproduce border streaks'
assert np.max(fixed[29:35,29:35])<.01,'Fix erased legitimate occluder shadows'

# A receiver on the same sloping plane as the stored depth must not shadow
# itself when neighbouring PCF taps are compared against its local plane.
u=(xx+.5)/64;v=(yy+.5)/64;plane=.35+.22*u+.18*v
smooth=render(programs[0],plane,1);acne=render(programs[1],plane,1)
assert np.min(smooth)>.999,'PCF self-shadow acne remains on a sloping receiver'
assert np.mean(acne)<.95,'Slope negative control did not reproduce self-shadowing'
print('Actual GLSL sampler removes out-of-map streaks and sloped-plane acne while preserving occluder shadows')

# Execute the real WGSL helper too; this catches coordinate/depth convention
# differences between the two renderer paths, rather than comparing source text.
import wgpu
from array import array
device=wgpu.gpu.request_adapter_sync().request_device_sync()
wgsl=re.search(r'const shader=`(.*?)`;',source,re.S)[1]
start=wgsl.index('fn shadowVisibility(')
helper_wgsl=wgsl[start:wgsl.index('@fragment fn fs(',start)]
triangle='''@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4f{
 let p=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));return vec4f(p[i],0,1);}
'''
depth_module=device.create_shader_module(code=triangle+'''
@group(0) @binding(0) var<storage,read> values:array<f32>;
@fragment fn fs(@builtin(position) p:vec4f)->@builtin(frag_depth) f32{return values[u32(p.y)*64u+u32(p.x)];}
''')
depth_pipeline=device.create_render_pipeline(layout='auto',vertex={'module':depth_module,'entry_point':'vs'},fragment={'module':depth_module,'entry_point':'fs','targets':[]},primitive={'topology':'triangle-list'},depth_stencil={'format':'depth32float','depth_write_enabled':True,'depth_compare':'always'})
depth_texture=device.create_texture(size=(64,64,1),format='depth32float',usage=wgpu.TextureUsage.RENDER_ATTACHMENT|wgpu.TextureUsage.TEXTURE_BINDING)
values=device.create_buffer(size=64*64*4,usage=wgpu.BufferUsage.STORAGE|wgpu.BufferUsage.COPY_DST)
depth_bind=device.create_bind_group(layout=depth_pipeline.get_bind_group_layout(0),entries=[{'binding':0,'resource':{'buffer':values}}])
module=device.create_shader_module(code='''@group(0) @binding(1) var shadow:texture_depth_2d;
@group(0) @binding(2) var smp:sampler_comparison;
@group(0) @binding(3) var<uniform> mode:vec4u;
'''+triangle+helper_wgsl+'''
@fragment fn fs(@builtin(position) pos:vec4f)->@location(0) vec4f{
 let uv=pos.xy/64.0;var p=vec3f(uv*2.0-.5,.6);if(mode.x==1u){p=vec3f(uv,.35+.22*uv.x+.18*uv.y);}
 let v=shadowVisibility(p,vec3f(1.0/64.0,0,.22/64.0),vec3f(0,1.0/64.0,.18/64.0));return vec4f(v,v,v,1);}
''')
pipeline=device.create_render_pipeline(layout='auto',vertex={'module':module,'entry_point':'vs'},fragment={'module':module,'entry_point':'fs','targets':[{'format':'rgba16float'}]},primitive={'topology':'triangle-list'})
mode_buffer=device.create_buffer(size=16,usage=wgpu.BufferUsage.UNIFORM|wgpu.BufferUsage.COPY_DST)
sampler=device.create_sampler(compare='less-equal',mag_filter='nearest',min_filter='nearest')
bind=device.create_bind_group(layout=pipeline.get_bind_group_layout(0),entries=[{'binding':1,'resource':depth_texture.create_view()},{'binding':2,'resource':sampler},{'binding':3,'resource':{'buffer':mode_buffer}}])
target=device.create_texture(size=(64,64,1),format='rgba16float',usage=wgpu.TextureUsage.RENDER_ATTACHMENT|wgpu.TextureUsage.COPY_SRC)
for mode,data,expected in [(0,occluders,fixed),(1,plane,smooth)]:
    device.queue.write_buffer(values,0,np.asarray(data,dtype='f4').tobytes());device.queue.write_buffer(mode_buffer,0,array('I',[mode,0,0,0]))
    encoder=device.create_command_encoder()
    render_pass=encoder.begin_render_pass(color_attachments=[],depth_stencil_attachment={'view':depth_texture.create_view(),'depth_clear_value':1.,'depth_load_op':'clear','depth_store_op':'store'})
    render_pass.set_pipeline(depth_pipeline);render_pass.set_bind_group(0,depth_bind);render_pass.draw(3);render_pass.end()
    render_pass=encoder.begin_render_pass(color_attachments=[{'view':target.create_view(),'clear_value':(0,0,0,1),'load_op':'clear','store_op':'store'}])
    render_pass.set_pipeline(pipeline);render_pass.set_bind_group(0,bind);render_pass.draw(3);render_pass.end();device.queue.submit([encoder.finish()])
    actual=np.frombuffer(device.queue.read_texture({'texture':target},{'bytes_per_row':64*8,'rows_per_image':64},(64,64,1)),dtype='f2').astype('f4').reshape(64,64,4)[:,:,0]
    assert np.max(np.abs(actual-expected))<.001,'WGSL and GLSL shadow visibility differ'
device.destroy()
print('Native WGSL and GLSL shadow visibility match for border occluders and sloping receivers')
