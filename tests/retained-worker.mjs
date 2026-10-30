import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Worker} from 'node:worker_threads';
import {createSurfaceProximity,inspectionRegion} from '../dist/inspection.mjs';
import {studyWindPosition} from '../dist/software-study.mjs';
import {EAST_ASIAN_PRESETS} from '../dist/east-asia.mjs';
import {RetainedRefiner,composeGeometry} from '../dist/retained-detail.mjs';
const cfg={height:10,spread:1,levels:4,density:68,shoots:3,rootSpread:1,rootDepth:1.5,rootBranching:3,fineRoots:true,leafSize:.09,maturity:.65,reproductive:true,view:'tree',surfacePosition:.55,lightAngle:25,woodPart:'junction',fruitStage:'mature',coneOpening:.45,barkPosition:.44,wind:1.2,gust:.6,direction:55,seed:2847,type:'sakura',season:'summer',springProgress:.78,flowerLayout:'single',flowerStage:'open',flowerSex:'male',shootStage:'extending',needleFace:'convex',...EAST_ASIAN_PRESETS.sakura};
const url=new URL('../dist/specimen-worker.mjs',import.meta.url).href,worker=new Worker(`const {parentPort}=require('node:worker_threads');globalThis.self={postMessage:(message,transfer)=>parentPort.postMessage(message,transfer)};import(${JSON.stringify(url)}).then(()=>parentPort.on('message',data=>self.onmessage({data})));`,{eval:true});
let id=0,baseRequests=0,partRequests=0,refiner;const pending=new Map();worker.on('message',data=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result);});worker.on('error',error=>{for(const p of pending.values())p.reject(error);});
const request=data=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});worker.postMessage({id:next,...data});});
try{
 baseRequests++;const base=await request({operation:'base',cfg,options:{preview:false,detail:'far',omitBuried:true}});assert(base.stats.flowers>15000,'Test must exercise the actual dense Sakura preset');assert(base.detailParts.parts.length>1000);assert(base.vertices instanceof Float32Array);
 const cluster=base.stats.flowerDetails.find(d=>d.oldWood&&d.flowerRecords[0].opening>.8),head=cluster.flowerRecords[0],focus=head.throat.map((v,k)=>v+head.axis[k]*.004),origin=studyWindPosition(head.throat,.3,0,0,cfg,20),camera=t=>origin.map((v,k)=>v+head.axis[k]*(.035-t*.012)),proximity=createSurfaceProximity(base.vertices,base.aboveGroundBounds),region=t=>inspectionRegion({eye:camera(t),direction:head.axis.map(v=>-v),height:800,cfg,time:20+t*2,proximity});
 const started=performance.now();let finish,fail;const pollenVisible=new Promise((resolve,reject)=>{finish=resolve;fail=reject;});let frame=0;
 refiner=new RetainedRefiner(base.detailParts.parts,{build:(part,region,activeIds)=>{partRequests++;return request({operation:'part',partId:part.id,region,activeIds});},apply:(chunks,state)=>{const found=chunks.find(p=>p.pollen>0);if(found)finish({chunks,found});},error:fail});
 refiner.update(region(0));frame=.7;refiner.update(region(frame));const zoom=setInterval(()=>{frame=Math.min(1,frame+.035);refiner.update(region(frame));},150);
 let output;try{output=await pollenVisible;}finally{clearInterval(zoom);refiner.stop();}
 const flower=output.found.flowers.find(f=>f.seed===cluster.seed)??output.found.flowers[0];assert(flower.maximumDetail);assert.equal(flower.pollenGrains,flower.flowers*320);
 let grains=0,petals=0;for(let i=0;i<output.found.vertices.length;i+=14){const kind=output.found.vertices[i+9];if(Math.abs(kind-.313)<1e-5)grains++;if(Math.abs(kind-.306)<1e-5)petals++;}assert(grains>=320*90);assert(petals>15000);assert.equal(baseRequests,1,'Zoom regenerated the whole tree');assert(frame>0,'Camera did not move during the real worker refinement');
 if(process.env.RETAINED_FIXTURE){const all=composeGeometry(base.vertices,output.chunks),key=process.env.RETAINED_FIXTURE;fs.writeFileSync(key+'.bin',Buffer.from(all.buffer));fs.writeFileSync(key+'.json',JSON.stringify({cfg,bounds:base.aboveGroundBounds,focus,distance:.027,angle:Math.atan2(head.axis[0],head.axis[2]),elevation:Math.asin(head.axis[1]),cache:false,atlas:{width:1,height:1,layers:12},sun:head.axis,time:0}));}
 console.log(JSON.stringify({flowers:base.stats.flowers,baseRequests,partRequests,pollen:flower.pollenGrains,firstPollenMs:Math.round(performance.now()-started),baseBuildMs:Math.round(base.generationMs),cameraMoved:true}));
}finally{refiner?.stop();await worker.terminate();}
