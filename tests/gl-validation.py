import re,moderngl
from pathlib import Path
s=(Path(__file__).resolve().parent.parent/'dist/app.js').read_text()
vs=re.search(r'const vs=`(.*?)`;',s,re.S)[1];fs=re.search(r'const fs=`(.*?)`;',s,re.S)[1]
vs=vs.replace('#version 300 es','#version 330').replace('precision highp float;','');fs=fs.replace('#version 300 es','#version 330').replace('precision highp float;','')
c=moderngl.create_standalone_context(backend='egl');p=c.program(vertex_shader=vs,fragment_shader=fs);print('Compatibility GLSL vertex and fragment programs compiled successfully')

# Check the actual colour and shadow cutout functions against the JavaScript
# mask used by OBJ textures. A rectangle or a mismatched shadow must fail here.
import json,subprocess,numpy as np
depth=re.search(r'const depthFS=`(.*?)`;',s,re.S)[1]
actual_shadow=c.program(vertex_shader=vs,fragment_shader=depth.replace('#version 300 es','#version 330').replace('precision highp float;',''))
root=Path(__file__).resolve().parent.parent
w,h=192,320
kinds=[1.23,1.34,1.41,1.46,1.48,1.49,1.191,1.192,1.193,1.194,1.195,1.196,1.197,1.198]
js=f"""import {{bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage}} from {json.dumps((root/'dist/compound-lod.mjs').as_uri())};
const kinds={json.dumps(kinds)},w={w},h={h},a=new Uint8Array(kinds.length*w*h);let i=0;
for(const kind of kinds){{const jac=kind>1.4,fever=kind>1.3&&!jac,pairs=jac?Math.round((kind-1.4)*100)+6:Math.round((kind-(fever?1.3:1.2))*100);
for(let y=0;y<h;y++)for(let x=0;x<w;x++)a[i++]=kind<1.2?pineSprayCoverage((x+.5)/w,(y+.5)/h,Math.round((kind-1.191)*1000)):kind>1.485?redwoodSprayCoverage((x+.5)/w,(y+.5)/h):bipinnateCoverage((x+.5)/w,(y+.5)/h,pairs,jac?16:fever?13:9,jac);}}
process.stdout.write(Buffer.from(a));"""
expected=np.frombuffer(subprocess.run(['node','--input-type=module','-e',js],cwd=root,stdout=subprocess.PIPE,check=True).stdout,dtype='u1').reshape(len(kinds),h,w)
results=[]
for shader in [fs,depth]:
 start=shader.index('float jacarandaPinnaScale(')
 end=shader.index('\n',shader.index('float cardCoverage(',start))
 coverage=shader[start:end]
 probe=c.program(vertex_shader='#version 330\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}',fragment_shader='#version 330\nuniform float kind;out float mask;\n'+coverage+f'\nvoid main(){{mask=cardCoverage(gl_FragCoord.xy/vec2({w}.,{h}.),kind);}}')
 texture=c.texture((w,h),1,dtype='f4');frame=c.framebuffer(color_attachments=[texture]);frame.use();c.viewport=(0,0,w,h);vao=c.vertex_array(probe,[])
 outputs=[]
 for index,kind in enumerate(kinds):
  probe['kind'].value=kind;vao.render(vertices=3)
  actual=(np.frombuffer(frame.read(components=1,dtype='f4'),dtype='f4').reshape(h,w)>.5).astype('u1')
  assert np.count_nonzero(actual!=expected[index])<w*h*.002,'GPU/OBJ cutout silhouettes differ'
  outputs.append(actual)
 results.append(np.array(outputs))
assert np.array_equal(*results),'Colour and shadow silhouettes must match'
print('Thorn-tree, jacaranda, pine and dawn-redwood colour/shadow masks match exported opacity textures')
