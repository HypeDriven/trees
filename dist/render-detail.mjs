import {MAXIMUM_DETAIL} from './maximum-detail.mjs?v=24';
// Screen-space choices change tessellation, never organ counts or seeded growth.
export function selectRenderDetail({view,distance,height=800,leafLength=.09,mode='auto',current=null}){
 if(mode==='full')return'full';
 const field=Math.max(.00001,2*distance*Math.tan(.3)),pixels=leafLength*height/field;
 let value;
 if(view==='tree')value=pixels<18?'far':pixels<65?'balanced':pixels<160?'near':'full';
 else if(view==='bark'||view==='wood')value=field>.75?'far':field>.40?'balanced':field>.20?'near':'full';
 else if(view==='leaf'||view==='shoot')value=field>.65?'far':field>.24?'balanced':field>.065?'near':'full';
 else if(view==='surface')value=field>.10?'balanced':field>.035?'near':'full';
 else value='full';
 // A small dead band prevents repeated mesh rebuilds at zoom boundaries.
 if(current&&current!==value){const other=selectRenderDetail({view,distance:distance*(view==='tree'?1.12:1.10),height,leafLength,mode});const another=selectRenderDetail({view,distance:distance/(view==='tree'?1.12:1.10),height,leafLength,mode});if(other!==another)return current;}
 return value;
}
export const DETAIL_GRID={full:{rows:MAXIMUM_DETAIL.leafRows,columns:MAXIMUM_DETAIL.leafColumns,barkSides:MAXIMUM_DETAIL.barkSides,barkRows:MAXIMUM_DETAIL.barkRows},near:{rows:32,columns:4,barkSides:256,barkRows:128},balanced:{rows:16,columns:4,barkSides:128,barkRows:72},far:{rows:8,columns:2,barkSides:96,barkRows:48}};
export function omitBuriedTriangles(vertices,stride=14){
 let count=0;for(let i=0;i<vertices.length;i+=stride*3)if(!(vertices[i+9]<0&&vertices[i+1]<-.003&&vertices[i+stride+1]<-.003&&vertices[i+stride*2+1]<-.003))count+=stride*3;
 if(count===vertices.length)return vertices;const result=new Float32Array(count);let n=0;for(let i=0;i<vertices.length;i+=stride*3)if(!(vertices[i+9]<0&&vertices[i+1]<-.003&&vertices[i+stride+1]<-.003&&vertices[i+stride*2+1]<-.003)){result.set(vertices.subarray(i,i+stride*3),n);n+=stride*3;}return result;
}
