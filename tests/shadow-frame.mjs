import assert from 'node:assert/strict';
import {inspectionShadowFrame} from '../dist/camera-range.mjs';
for(const surfaceDistance of [.008,.03,.2,.6])for(const aspect of [1,1.5,2]){
 const eye=[3,8,5],forward=[0,0,-1],frame=inspectionShadowFrame({eye,forward,surfaceDistance,radius:Math.max(.16,surfaceDistance+.08),aspect,sceneRadius:12});
 assert(Math.abs(frame.target[2]-(eye[2]-surfaceDistance))<1e-10,'Shadow focus overshoots the nearby surface');
 assert.equal(frame.depth,15,'Macro cropping must retain the scene depth for distant occluders');
 const pixel=2*surfaceDistance*Math.tan(.3)/800,texel=2*frame.scale/2048;
 assert(texel<pixel*2.1,'Close-up shadow texels remain much larger than screen pixels');
 assert(frame.scale>surfaceDistance*Math.tan(.3)*aspect,'Shadow crop must contain the visible patch');
}
console.log('Close-up shadow focus and texel scale follow the nearby surface while retaining distant occluders');
