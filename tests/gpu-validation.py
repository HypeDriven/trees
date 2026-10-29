import re,wgpu
from pathlib import Path
s=(Path(__file__).resolve().parent.parent / 'dist/app.js').read_text();code=re.search(r'const shader=`(.*?)`;',s,re.S)[1]
a=wgpu.gpu.request_adapter_sync();d=a.request_device_sync()
m=d.create_shader_module(code=code)
attrs=[{'shader_location':i,'offset':off,'format':fmt} for i,off,fmt in [(0,0,'float32x3'),(1,12,'float32x3'),(2,24,'float32x3'),(3,36,'float32'),(4,40,'float32'),(5,44,'float32'),(6,48,'float32x2')]]
buffers=[{'array_stride':56,'attributes':attrs}]
p=d.create_render_pipeline(layout='auto',vertex={'module':m,'entry_point':'vs','buffers':buffers},fragment={'module':m,'entry_point':'fs','targets':[{'format':'rgba8unorm'}]},primitive={'topology':'triangle-list','cull_mode':'none'},depth_stencil={'format':'depth24plus','depth_write_enabled':True,'depth_compare':'less'},multisample={'count':4,'alpha_to_coverage_enabled':True})
sp=d.create_render_pipeline(layout='auto',vertex={'module':m,'entry_point':'vsShadow','buffers':buffers},fragment={'module':m,'entry_point':'fsShadow','targets':[]},primitive={'topology':'triangle-list','cull_mode':'none'},depth_stencil={'format':'depth32float','depth_write_enabled':True,'depth_compare':'less','depth_bias':2,'depth_bias_slope_scale':2})
main_pipeline=p
print('WebGPU main and shadow pipelines compiled successfully')

# Exercise the actual wind function: roots and the basal trunk must remain
# coincident under gusts, while branches above the anchor still move.
from array import array
probe_code=code+'''
@group(0) @binding(3) var<storage,read_write> probe:array<vec4f>;
@compute @workgroup_size(1) fn checkWind(@builtin(global_invocation_id) id:vec3u){
 var v:In;v.p=vec3f(.2,.2,0);v.kind=0;
 if(id.x==1u){v.kind=-.04;}
 if(id.x==2u){v.p.y=3;}
 probe[id.x]=vec4f(windPosition(v),1);
}
'''
cm=d.create_shader_module(code=probe_code)
cp=d.create_compute_pipeline(layout='auto',compute={'module':cm,'entry_point':'checkWind'})
u=array('f',[0]*48);u[35]=1.3;u[36]=4;u[37]=1.5;u[38]=.95;u[44]=10;u[47]=.09
ub=d.create_buffer_with_data(data=u,usage=wgpu.BufferUsage.UNIFORM|wgpu.BufferUsage.COPY_DST)
out=d.create_buffer(size=48,usage=wgpu.BufferUsage.STORAGE|wgpu.BufferUsage.COPY_SRC)
bind=d.create_bind_group(layout=cp.get_bind_group_layout(0),entries=[{'binding':0,'resource':{'buffer':ub}},{'binding':3,'resource':{'buffer':out}}])
e=d.create_command_encoder();p=e.begin_compute_pass();p.set_pipeline(cp);p.set_bind_group(0,bind);p.dispatch_workgroups(3);p.end();d.queue.submit([e.finish()])
result=array('f');result.frombytes(bytes(d.queue.read_buffer(out)))
assert abs(result[0]-.2)<1e-7 and abs(result[1]-.2)<1e-7 and abs(result[2])<1e-7
assert result[:4]==result[4:8], 'Root and basal trunk separate under gusts'
assert abs(result[8]-.2)+abs(result[10])>1e-4, 'Above-base branch wind was disabled'
print('Native GPU roots/basal trunk remain aligned under strong wind; upper branches still move')

# Exercise real indexed draws, texture-array bindings and cached material paths,
# including the shadow pipeline. Compilation alone cannot catch binding errors.
u=array('f',[0]*48)
for offset in [0,16]:
 for i in [0,5,10,15]:u[offset+i]=1
u[32:36]=array('f',[0,0,2,0]);u[36:40]=array('f',[0,.6,.95,1]);u[40:44]=array('f',[1,1,1,0]);u[44:48]=array('f',[10,0,.65,.09])
d.queue.write_buffer(ub,0,u)
verts=array('f')
for x,y,tu,tv in [(-.8,-.8,0,0),(.8,-.8,1,0),(.8,.8,1,1),(-.8,.8,0,1)]:
 verts.extend([x,y,.5,0,0,1,.2,.4,.1,.98,0,0,tu,tv])
vb=d.create_buffer_with_data(data=verts,usage=wgpu.BufferUsage.VERTEX)
ib=d.create_buffer_with_data(data=array('I',[0,1,2,0,2,3]),usage=wgpu.BufferUsage.INDEX)
atlas=d.create_texture(size=(4,4,12),format='rgba8unorm',usage=wgpu.TextureUsage.TEXTURE_BINDING|wgpu.TextureUsage.COPY_DST)
d.queue.write_texture({'texture':atlas},bytes([128,128,180,190])*4*4*12,{'bytes_per_row':16,'rows_per_image':4},(4,4,12))
atlas_view=atlas.create_view(dimension='2d-array');sampler=d.create_sampler(mag_filter='linear',min_filter='linear',mipmap_filter='linear')
depth=d.create_texture(size=(64,64,1),format='depth32float',usage=wgpu.TextureUsage.RENDER_ATTACHMENT|wgpu.TextureUsage.TEXTURE_BINDING)
shared=[{'binding':0,'resource':{'buffer':ub}},{'binding':5,'resource':atlas_view},{'binding':6,'resource':sampler}]
bg=d.create_bind_group(layout=main_pipeline.get_bind_group_layout(0),entries=shared+[{'binding':1,'resource':depth.create_view()},{'binding':2,'resource':d.create_sampler(compare='less-equal')}])
sbg=d.create_bind_group(layout=sp.get_bind_group_layout(0),entries=shared)
color=d.create_texture(size=(64,64,1),format='rgba8unorm',sample_count=4,usage=wgpu.TextureUsage.RENDER_ATTACHMENT)
target=d.create_texture(size=(64,64,1),format='rgba8unorm',usage=wgpu.TextureUsage.RENDER_ATTACHMENT|wgpu.TextureUsage.COPY_SRC)
z=d.create_texture(size=(64,64,1),format='depth24plus',sample_count=4,usage=wgpu.TextureUsage.RENDER_ATTACHMENT)
e=d.create_command_encoder()
rp=e.begin_render_pass(color_attachments=[],depth_stencil_attachment={'view':depth.create_view(),'depth_clear_value':1,'depth_load_op':'clear','depth_store_op':'store'})
rp.set_pipeline(sp);rp.set_bind_group(0,sbg);rp.set_vertex_buffer(0,vb);rp.set_index_buffer(ib,'uint32');rp.draw_indexed(6);rp.end()
rp=e.begin_render_pass(color_attachments=[{'view':color.create_view(),'resolve_target':target.create_view(),'clear_value':(0,0,0,1),'load_op':'clear','store_op':'discard'}],depth_stencil_attachment={'view':z.create_view(),'depth_clear_value':1,'depth_load_op':'clear','depth_store_op':'discard'})
rp.set_pipeline(main_pipeline);rp.set_bind_group(0,bg);rp.set_vertex_buffer(0,vb);rp.set_index_buffer(ib,'uint32');rp.draw_indexed(6);rp.end();d.queue.submit([e.finish()])
pixels=bytes(d.queue.read_texture({'texture':target},{'bytes_per_row':256,'rows_per_image':64},(64,64,1)))
assert sum(pixels[0::4])>10000,'Cached native indexed draw produced no leaf pixels'
print('Native indexed colour/shadow passes rendered with the cached texture-array material')
