import re,moderngl
from pathlib import Path
s=(Path(__file__).resolve().parent.parent/'dist/app.js').read_text()
vs=re.search(r'const vs=`(.*?)`;',s,re.S)[1];fs=re.search(r'const fs=`(.*?)`;',s,re.S)[1]
vs=vs.replace('#version 300 es','#version 330').replace('precision highp float;','');fs=fs.replace('#version 300 es','#version 330').replace('precision highp float;','')
c=moderngl.create_standalone_context(backend='egl');p=c.program(vertex_shader=vs,fragment_shader=fs);print('Compatibility GLSL vertex and fragment programs compiled successfully')
