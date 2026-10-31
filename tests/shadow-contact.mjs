import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {cameraDepthRange} from '../dist/camera-range.mjs';
import {inspectionRegion} from '../dist/inspection.mjs';

const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const context={Math,cameraDepthRange,distance:20,sceneRadius:12,elapsed:0,
 cfg:{view:'tree',lightAngle:25,wind:0,gust:.6,direction:55},paused:true,
 activeInspection:null,shadowRevision:0,lastShadowKey:'',
 width:1200,height:800,$:()=>({getBoundingClientRect:()=>({width:context.width,height:context.height})}),target:[0,5,0],angle:.4,elevation:.2,cardFlutterFactor:()=>1,
 restCamera:eye=>eye,cameraEye:()=>[0,1,0],inspectionTarget:()=>context.target};
vm.createContext(context);
for(const [start,end] of [['function shadowNeedsUpdate()','function updateRenderStats()'],['function renderDepthRange()','function checkRenderDetail()']]){
 vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end)),context);
}
const update=()=>vm.runInContext('shadowNeedsUpdate()',context),range=()=>vm.runInContext('renderDepthRange()',context);
assert(update());assert(!update(),'Paused stationary scene should reuse its shadow map');
context.target=[1,5,0];assert(update(),'Panning while paused must refresh light projection');assert(!update());
context.activeInspection=inspectionRegion({eye:[0,1,0],cfg:{wind:0},proximity:{nearest:()=>.4}});
assert.equal(context.activeInspection.surfaceDistance,.4,'Retained inspection must carry the measured distance');
assert(range().near>.019&&range().near<.021,'Retained close-up must not force the near plane to 0.1 mm');
assert(update(),'Entering close-up changes the light projection');assert(!update());
context.activeInspection={...context.activeInspection,radius:.6};assert(update(),'A changed light box must refresh shadows');
context.width=1600;assert(update(),'Resizing the inspection light crop must refresh shadows');assert(!update());
context.activeInspection={...context.activeInspection,surfaceDistance:.35};assert(update(),'Changing surface focus must refresh shadows');
context.cameraEye=()=>[0,1,.399];assert.equal(range().near,.0001,'Moving onto the surface must still allow macro viewing');
context.activeInspection=null;assert(range().near>.1,'Leaving close-up restores orbit depth precision');
// The physical root/soil gap must remain resolvable at ordinary orbit distances.
for(const distance of [8,25,65]){
 const {near,far}=cameraDepthRange(distance,6),depth=z=>far/(far-near)-far*near/((far-near)*z);
 assert((depth(distance+.0005)-depth(distance))*2**24>2);
}
console.log('Paused shadow invalidation, retained surface distance, macro clipping and root/soil depth precision passed.');
