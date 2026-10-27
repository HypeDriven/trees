import re,wgpu
from pathlib import Path
s=(Path(__file__).resolve().parent.parent / 'dist/app.js').read_text();code=re.search(r'const shader=`(.*?)`;',s,re.S)[1]
a=wgpu.gpu.request_adapter_sync();d=a.request_device_sync()
m=d.create_shader_module(code=code)
attrs=[{'shader_location':i,'offset':off,'format':fmt} for i,off,fmt in [(0,0,'float32x3'),(1,12,'float32x3'),(2,24,'float32x3'),(3,36,'float32'),(4,40,'float32'),(5,44,'float32'),(6,48,'float32x2')]]
buffers=[{'array_stride':56,'attributes':attrs}]
p=d.create_render_pipeline(layout='auto',vertex={'module':m,'entry_point':'vs','buffers':buffers},fragment={'module':m,'entry_point':'fs','targets':[{'format':'rgba8unorm'}]},primitive={'topology':'triangle-list','cull_mode':'none'},depth_stencil={'format':'depth24plus','depth_write_enabled':True,'depth_compare':'less'},multisample={'count':4})
sp=d.create_render_pipeline(layout='auto',vertex={'module':m,'entry_point':'vsShadow','buffers':buffers},primitive={'topology':'triangle-list','cull_mode':'none'},depth_stencil={'format':'depth32float','depth_write_enabled':True,'depth_compare':'less','depth_bias':2,'depth_bias_slope_scale':2})
print('WebGPU main and shadow pipelines compiled successfully')
