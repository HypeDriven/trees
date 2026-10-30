import {buildSpecimen} from './botany.mjs?v=23';

// Keep camera-driven anatomy generation off the render thread.
self.onmessage=({data:{id,cfg,options}})=>{
 try{const start=performance.now(),result=buildSpecimen(cfg,options);result.generationMs=performance.now()-start;self.postMessage({id,result},[result.vertices.buffer]);}
 catch(error){self.postMessage({id,error:error.message??String(error)});}
};
