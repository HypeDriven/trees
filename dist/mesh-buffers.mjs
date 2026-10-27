// Keep triangle boundaries intact and respect the adapter's per-buffer limit.
export function uploadGeometry(device,vertices,{stride=14,groundVertices=6,maxPartBytes=64*1024*1024,usage=globalThis.GPUBufferUsage.VERTEX|globalThis.GPUBufferUsage.COPY_DST}={}){
 const bytesPerVertex=stride*Float32Array.BYTES_PER_ELEMENT,count=vertices.length/stride,limit=Math.min(maxPartBytes,device.limits.maxBufferSize),perPart=Math.floor(limit/(bytesPerVertex*3))*3;
 if(!Number.isInteger(count)||count%3||perPart<3)throw Error('Invalid triangle mesh or GPU buffer limit');
 const parts=[];try{for(let start=0;start<count;start+=perPart){let vertexCount=Math.min(perPart,count-start),buffer=device.createBuffer({size:vertexCount*bytesPerVertex,usage}),shadowCount=Math.min(vertexCount,Math.max(0,count-groundVertices-start));parts.push({buffer,vertexCount,shadowCount});device.queue.writeBuffer(buffer,0,vertices.buffer,vertices.byteOffset+start*bytesPerVertex,vertexCount*bytesPerVertex)}}catch(e){for(let p of parts)p.buffer.destroy();throw e}
 return {parts,destroy(){for(let p of parts)p.buffer.destroy()}};
}
