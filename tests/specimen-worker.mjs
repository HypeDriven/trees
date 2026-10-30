import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
const url=new URL('../dist/specimen-worker.mjs',import.meta.url).href;
const worker=new Worker(`const {parentPort}=require('node:worker_threads');globalThis.self={postMessage:(message,transfer)=>parentPort.postMessage(message,transfer)};import(${JSON.stringify(url)}).then(()=>parentPort.on('message',data=>self.onmessage({data})));`,{eval:true});
const cfg={type:'oak',view:'tree',height:10,spread:1,leafSize:.09,seed:2847,levels:2,shoots:0,density:8,season:'summer',maturity:.65,reproductive:false,rootBranching:1,fineRoots:false,shootStage:'extending'};
try{
 const response=new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);});worker.postMessage({id:7,cfg,options:{preview:false,detail:'far',inspection:{center:[.2,.5,0],radius:.035}}});const {id,result,error}=await response;
 assert.equal(error,undefined);assert.equal(id,7);assert(result.vertices instanceof Float32Array&&result.vertices.length>100000);assert(result.stats.inspection.wood>0);assert(result.generationMs>0);assert.equal(result.preview.length,0);console.log('Actual specimen module generated and transferred local full-detail geometry from a worker');
}finally{await worker.terminate();}
