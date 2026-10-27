// Keep depth precision at the scale being inspected. A near plane intended
// for leaf macros must not be reused for a whole tree and its soil contact.
export function cameraDepthRange(distance,sceneRadius){
 return{near:Math.max(.0001,distance/150,distance-sceneRadius*1.8),far:Math.max(1,distance*2,distance+sceneRadius*6)};
}
