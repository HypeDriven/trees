// Keep maximum detail visible at three times the original camera distance.
export const HIGH_DETAIL_DISTANCE_SCALE=3;
// Shared by attached organs and detached studies. Maximum is a geometry
// profile, independent of the view, whole-tree LOD or species size control.
export const MAXIMUM_DETAIL=Object.freeze({leafRows:96,leafColumns:8,fanColumns:32,contourSubdivisions:4,needleRows:96,barkSides:512,barkRows:224});
export function maximumLeafGrid(type){return{rows:MAXIMUM_DETAIL.leafRows,columns:type==='ginkgo'?MAXIMUM_DETAIL.fanColumns:MAXIMUM_DETAIL.leafColumns};}
export function inspectionEquivalent(a,b){
 if(!a||!b)return a===b;
 const ac=a.camera??a.center,bc=b.camera??b.center;
 return Math.hypot(...ac.map((v,k)=>v-bc[k]))<.003&&Math.hypot(...a.center.map((v,k)=>v-b.center[k]))<.003&&(!a.forward||!b.forward||a.forward.reduce((s,v,k)=>s+v*b.forward[k],0)>.9995);
}
