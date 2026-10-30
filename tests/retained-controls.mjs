import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {RetainedRefiner,sortedExclusions,visibleRanges,drawGeometry} from '../dist/retained-detail.mjs';
const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),posts=[],uploads=[],elements=new Map();
class Worker{postMessage(data){posts.push(data);}terminate(){this.stopped=true;}}
const V={add:(a,b)=>a.map((v,k)=>v+b[k]),sub:(a,b)=>a.map((v,k)=>v-b[k]),mul:(a,s)=>a.map(v=>v*s),norm:a=>a.map(v=>v/(Math.hypot(...a)||1))};
const ctx={Worker,URL,Math,Map,Set,Float32Array,Promise,Error,console,setTimeout,RetainedRefiner,sortedExclusions,visibleRanges,V,retainedWorker:null,retainedRefiner:null,retainedBasePending:false,retainedChunks:[],retainedExclusions:[],retainedMeshes:new Map(),retainedCallbacks:new Map(),retainedSequence:0,retainedPending:false,generationRevision:1,hidden:false,performanceMode:'auto',activeDetail:'far',activeInspection:null,shadowRevision:0,vertexCount:15,renderMetrics:{},cfg:{type:'sakura',view:'tree'},mesh:null,glRenderer:{setDetails:chunks=>uploads.push(chunks),refreshMaterials(){}},workerDisabled:false,updateRenderStats(){},toast(){},$:(key)=>{if(!elements.has(key))elements.set(key,{style:{},textContent:''});return elements.get(key);},generate(options){assert(options.prepared);ctx.botanical=options.prepared;ctx.setupRetainedDetail();}};
vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function stopRetainedDetail()'),source.indexOf('function cameraEye()')).replaceAll('import.meta.url',JSON.stringify(new URL('../dist/app.js',import.meta.url).href)),ctx);
ctx.startRetainedSpecimen({detail:'far'});assert(ctx.retainedBasePending);assert.equal(posts[0].operation,'base');
const part={id:0,kind:'reproductive',start:3,count:3,min:[-.02,-.02,0],max:[.02,.02,.04],sensitive:false};
ctx.retainedWorker.onmessage({data:{id:posts[0].id,result:{vertices:new Float32Array(126),detailParts:{parts:[part]}}}});assert(!ctx.retainedBasePending);assert(ctx.retainedRefiner);
const region=x=>({center:[x,0,.05],camera:[x,0,.05],radius:.16,forward:[0,0,-1],cone:.7});ctx.retainedRefiner.update(region(0));assert.equal(posts[1].operation,'part');ctx.retainedRefiner.update(region(.012));
ctx.retainedWorker.onmessage({data:{id:posts[1].id,result:{...part,vertices:new Float32Array(84),pollen:320}}});await new Promise(r=>setImmediate(r));assert.equal(ctx.retainedChunks[0].pollen,320);assert(uploads.some(chunks=>chunks[0]?.pollen===320));assert.equal(posts.filter(p=>p.operation==='base').length,1);assert.deepEqual(JSON.parse(JSON.stringify(ctx.retainedExclusions)),[{start:3,count:3}]);
const worker=ctx.retainedWorker;ctx.stopRetainedDetail();ctx.generationRevision++;worker.onmessage({data:{id:posts[1].id,result:{}}});assert(worker.stopped);assert.equal(ctx.retainedChunks.length,0);
const draws=[],pass={setVertexBuffer(){},setIndexBuffer(){},drawIndexed(count,instances,start){draws.push({count,start});}};drawGeometry(pass,{parts:[{buffer:{},indexBuffer:{},sourceStart:6,indexCount:12,shadowCount:9}]},[{start:9,count:3}],true);assert.deepEqual(draws,[{count:3,start:0},{count:3,start:6}]);
console.log('Actual app retained-worker routing, moving-camera acceptance, local uploads, source exclusions and stale-specimen disposal passed');
