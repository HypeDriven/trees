// Hash exact Float32 words. Material kind, UV, normal and wind attributes are
// part of the key, so sharp edges and pinned leaf joints cannot merge wrongly.
export function indexGeometry(input,stride=14){
 const count=input.length/stride;if(!Number.isInteger(count)||count%3)throw Error('Invalid triangle geometry');
 let capacity=16;while(capacity<count*1.5)capacity*=2;
 const table=new Uint32Array(capacity),words=new Uint32Array(input.buffer,input.byteOffset,input.length),unique=new Uint32Array(input.length),indices=new Uint32Array(count),mask=capacity-1;let used=0;
 for(let i=0;i<count;i++){
  const o=i*stride;let hash=2166136261;for(let k=0;k<stride;k++)hash=Math.imul(hash^words[o+k],16777619);let slot=(hash^(hash>>>16))&mask,index;
  for(;;){const entry=table[slot];if(!entry){index=used++;table[slot]=index+1;unique.set(words.subarray(o,o+stride),index*stride);break;}index=entry-1;let equal=true;for(let k=0;k<stride;k++)if(unique[index*stride+k]!==words[o+k]){equal=false;break;}if(equal)break;slot=(slot+1)&mask;}
  indices[i]=index;
 }
 const packed=unique.slice(0,used*stride);return{vertices:new Float32Array(packed.buffer),indices,vertexCount:used,triangleCount:count/3,bytes:packed.byteLength+indices.byteLength};
}
