import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {selectRenderDetail} from '../dist/render-detail.mjs';
import {inspectionRegion} from '../dist/inspection.mjs';
import {inspectionEquivalent} from '../dist/maximum-detail.mjs';
import {bladeWidth} from '../dist/botany.mjs';
const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),posts=[],applied=[];
class Worker {postMessage(data){posts.push(data);}terminate(){this.terminated=true;}}
const canvas={getBoundingClientRect:()=>({left:0,top:0,width:1000,height:800}),addEventListener(){},setPointerCapture(){}},V={add:(a,b)=>a.map((v,k)=>v+b[k]),sub:(a,b)=>a.map((v,k)=>v-b[k]),mul:(a,s)=>a.map(v=>v*s),norm:a=>a.map(v=>v/(Math.hypot(...a)||1))};
const context={Worker,URL,Math,JSON,bladeWidth,performance:{now:()=>1000},setTimeout:()=>1,clearTimeout(){},V,$:()=>canvas,inspectionTarget:()=>context.treeTarget,selectRenderDetail,inspectionRegion,inspectionEquivalent,updateRenderStats(){},cameraDepthRange(){},activeInspection:null,queuedInspection:null,proximity:{nearest:()=>.1},lastDetailCheck:0,detailWorker:null,workerJob:null,pendingJob:null,workerDisabled:false,generationRevision:0,detailJobID:0,queuedDetail:null,lodTimer:null,rendererEpoch:1,performanceMode:'auto',activeDetail:'far',glRenderer:null,cfg:{view:'tree',type:'oak',height:10,leafSize:.09,wind:0,gust:0,direction:0,seed:2847},hidden:false,distance:20,angle:0,elevation:0,treeTarget:[0,5,0],elapsed:0,pointer:null,treeCenter:5,botanical:{vertices:new Float32Array(42)},cardFlutterFactor:()=>1,pickSurface:()=>({point:[3,8,1],kind:1}),generate(options){applied.push(options);context.activeInspection=options.inspection;context.activeDetail=options.detail;if(!options.prepared)context.generationRevision++;}};
vm.createContext(context);const helpers=source.slice(source.indexOf('function cameraEye('),source.indexOf('\n\nlet rendererEpoch')).replace('import.meta.url',JSON.stringify(new URL('../dist/app.js',import.meta.url).href));vm.runInContext(helpers,context);
const region={center:[0,5,20],radius:.44};context.requestDisplayDetail({detail:'far',inspection:region});assert.equal(posts.length,1);
context.requestDisplayDetail({detail:'far',inspection:{center:[.001,5,20],radius:.44}});assert.equal(context.pendingJob,null,'Equivalent requests must not queue duplicate builds');
context.treeTarget=[2,5,0];context.requestDisplayDetail({detail:'far',inspection:{center:[2,5,20],radius:.44}});assert.equal(posts.length,1,'Only one worker build may run at a time');
context.detailWorker.onmessage({data:{id:posts[0].id,result:{vertices:new Float32Array(42)}}});assert.equal(applied.length,0,'A close-up moved away from must not be applied');assert.equal(posts.length,2);
context.detailWorker.onmessage({data:{id:posts[1].id,result:{vertices:new Float32Array(84)}}});assert.equal(applied.length,1);assert(applied[0].preserveCamera&&applied[0].prepared);
context.requestDisplayDetail({detail:'far',inspection:{center:[2,5,20],radius:.44}});context.cfg.seed++;context.detailWorker.onmessage({data:{id:posts.at(-1).id,result:{}}});assert.equal(applied.length,1,'Old specimen jobs must not replace a newly seeded tree');

// Wind shifts the rest-space inspection centre while the world camera stays
// still. A completed maximum-detail job must not be discarded for that motion.
context.cfg.wind=4;context.cfg.gust=1.5;context.elapsed=0;
const windRegion=inspectionRegion({eye:context.cameraEye(),direction:[0,0,-1],cfg:context.cfg,time:0,proximity:context.proximity});
context.requestDisplayDetail({detail:'far',inspection:windRegion});context.elapsed=2;
context.detailWorker.onmessage({data:{id:posts.at(-1).id,result:{vertices:new Float32Array(84)}}});assert.equal(applied.length,2,'Wind alone must not discard completed detail');
context.cfg.wind=0;context.cfg.gust=0;

vm.runInContext(source.slice(source.indexOf('function bindCanvasControls()'),source.indexOf('\nfunction freshCanvas()')),context);
canvas.onpointerdown({clientX:100,clientY:200,button:0,shiftKey:true,target:canvas,pointerId:1});canvas.onpointermove({clientX:180,clientY:240});assert(context.treeTarget[0]<2&&context.treeTarget[1]>5);assert.equal(context.angle,0,'Panning must preserve orbit direction');canvas.onpointerup();
canvas.onpointerdown({clientX:100,clientY:200,button:0,target:canvas,pointerId:1});canvas.onpointermove({clientX:140,clientY:220});assert(context.angle<0&&context.elevation>0);canvas.onpointerup();
canvas.ondblclick({clientX:500,clientY:400});assert.deepEqual(Array.from(context.treeTarget),[3,8,1]);assert(context.distance<.4,'Double-click must focus at leaf inspection distance');
const previousAngle=context.angle,previousX=context.treeTarget[0],previousDistance=context.distance;
canvas.onpointerdown({clientX:200,clientY:200,button:0,pointerType:'touch',pointerId:1,target:canvas});canvas.onpointerdown({clientX:300,clientY:200,button:0,pointerType:'touch',pointerId:2,target:canvas});canvas.onpointermove({clientX:220,clientY:220,pointerType:'touch',pointerId:1});assert.equal(context.angle,previousAngle);assert(context.treeTarget[0]!==previousX&&context.distance>previousDistance,'Two-finger gesture must pan and pinch without orbiting');canvas.onpointerup({pointerType:'touch',pointerId:1});canvas.onpointerup({pointerType:'touch',pointerId:2});assert.equal(context.pointer,null);
console.log('Worker coalescing, stale camera/specimen rejection, camera-preserving updates, desktop/touch panning, pinch zoom and focus passed');
