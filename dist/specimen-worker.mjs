import {buildSpecimen} from './botany.mjs?v=25';
let retained=null,active=new Set();
// Keep the specimen's growth recipes in this worker. A camera job replays a
// local recipe, rather than regenerating thousands of distant flowers/leaves.
self.onmessage=({data:{id,cfg,options,operation,partId,region,activeIds=[]}})=>{
 try{const start=performance.now();let result;
  if(operation==='part'){
   if(!retained)throw Error('The retained specimen is unavailable');
   const next=new Set(activeIds);for(const old of active)if(!next.has(old))retained.parts[old]?.reset?.();active=next;
   result=retained.parts[partId].build(region);
  }else{
   result=buildSpecimen(cfg,{...options,retainParts:operation==='base'});retained=result.detailParts;active.clear();
   if(retained)result.detailParts={parts:retained.parts.map(({build,reset,...part})=>part)};
  }
  result.generationMs=performance.now()-start;self.postMessage({id,result},[result.vertices.buffer]);
 }catch(error){self.postMessage({id,error:error.message??String(error)});}
};
