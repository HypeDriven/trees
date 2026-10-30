// Keep depth precision at the scale being inspected. A near plane intended
// for leaf macros must not be reused for a whole tree and its soil contact.
export function cameraDepthRange(distance,sceneRadius,{surfaceDistance=null}={}){
 const base=Math.max(.0001,distance/150,distance-sceneRadius*1.8);return{near:surfaceDistance===null?base:Math.min(base,Math.max(.0001,surfaceDistance*.05)),far:Math.max(1,distance*2,distance+sceneRadius*6)};
}
// Fit close-up shadow texels to the visible surface, independently of a distant
// orbit pivot. Keep the full scene depth so distant occluders can still cast.
export function inspectionShadowFrame({eye,forward,surfaceDistance,radius,aspect=1,sceneRadius}){
 const reach=Math.max(.006,surfaceDistance??Math.max(.006,radius-.08)),scale=Math.max(.004,reach*Math.tan(.3)*Math.max(1,aspect)*2.5);
 return{target:eye.map((v,k)=>v+forward[k]*reach),scale,depth:Math.max(sceneRadius*1.25,scale)};
}
