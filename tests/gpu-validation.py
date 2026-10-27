import re,wgpu
from pathlib import Path
s=(Path(__file__).resolve().parent.parent / 'dist/app.js').read_text();code=re.search(r'const shader=`(.*?)`;',s,re.S)[1]
a=wgpu.gpu.request_adapter_sync();d=a.request_device_sync()
m=d.create_shader_module(code=code)
attrs=[{'shader_location':i,'offset':off,'format':fmt} for i,off,fmt in [(0,0,'float32x3'),(1,12,'float32x3'),(2,24,'float32x3'),(3,36,'float32'),(4,40,'float32'),(5,44,'float32'),(6,48,'float32x2')]]
buffers=[{'array_stride':56,'attributes':attrs}]
p=d.create_render_pipeline(layout='auto',vertex={'module':m,'entry_point':'vs','buffers':buffers},fragment={'module':m,'entry_point':'fs','targets':[{'format':'rgba8unorm'}]},primitive={'topology':'triangle-list','cull_mode':'none'},depth_stencil={'format':'depth24plus','depth_write_enabled':True,'depth_compare':'less'},multisample={'count':4})
sp=d.create_render_pipeline(layout='auto',vertex={'module':m,'entry_point':'vsShadow','buffers':buffers},fragment={'module':m,'entry_point':'fsShadow','targets':[]},primitive={'topology':'triangle-list','cull_mode':'none'},depth_stencil={'format':'depth32float','depth_write_enabled':True,'depth_compare':'less','depth_bias':2,'depth_bias_slope_scale':2})
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
ub=d.create_buffer_with_data(data=u,usage=wgpu.BufferUsage.UNIFORM)
out=d.create_buffer(size=48,usage=wgpu.BufferUsage.STORAGE|wgpu.BufferUsage.COPY_SRC)
bind=d.create_bind_group(layout=cp.get_bind_group_layout(0),entries=[{'binding':0,'resource':{'buffer':ub}},{'binding':3,'resource':{'buffer':out}}])
e=d.create_command_encoder();p=e.begin_compute_pass();p.set_pipeline(cp);p.set_bind_group(0,bind);p.dispatch_workgroups(3);p.end();d.queue.submit([e.finish()])
result=array('f');result.frombytes(bytes(d.queue.read_buffer(out)))
assert abs(result[0]-.2)<1e-7 and abs(result[1]-.2)<1e-7 and abs(result[2])<1e-7
assert result[:4]==result[4:8], 'Root and basal trunk separate under gusts'
assert abs(result[8]-.2)+abs(result[10])>1e-4, 'Above-base branch wind was disabled'
print('Native GPU roots/basal trunk remain aligned under strong wind; upper branches still move')
