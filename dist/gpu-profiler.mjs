// Optional, asynchronous pass timings. Never stall a frame for readback.
export function createGPUProfiler(device,onResult){
 if(!device.features.has('timestamp-query'))return{begin(){},writes(){return undefined;},resolve(){},read(){}};
 const queries=device.createQuerySet({type:'timestamp',count:4}),resolve=device.createBuffer({size:32,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),read=device.createBuffer({size:32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});let frame=0,active=false,pending=false,shadow=false,ready=false;
 return{
  begin(){active=!pending&&++frame%30===0;shadow=false;ready=false;},
  writes(pass){if(!active)return undefined;if(pass===0)shadow=true;return{querySet:queries,beginningOfPassWriteIndex:pass*2,endOfPassWriteIndex:pass*2+1};},
  resolve(encoder){if(!active)return;encoder.resolveQuerySet(queries,0,4,resolve,0);encoder.copyBufferToBuffer(resolve,0,read,0,32);ready=true;},
  read(){if(!ready)return;pending=true;const hadShadow=shadow;read.mapAsync(GPUMapMode.READ).then(()=>{const times=new BigUint64Array(read.getMappedRange()),result={shadowMs:hadShadow?Number(times[1]-times[0])/1e6:0,mainMs:Number(times[3]-times[2])/1e6};read.unmap();onResult(result);}).catch(()=>{}).finally(()=>{pending=false;});}
 };
}
