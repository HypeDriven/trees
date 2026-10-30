import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {createSurfaceProximity,createInspectionField,inspectionRegion,restCamera,pickSurface} from '../dist/inspection.mjs';
import {studyWindPosition} from '../dist/software-study.mjs';
import {woodTube} from '../dist/wood.mjs';
import {cameraDepthRange} from '../dist/camera-range.mjs';
const cfg=type=>({type,view:'tree',height:type==='monkeytail'?1.1:10,spread:1,leafSize:SPECIES[type].length,seed:2847,levels:2,shoots:0,density:8,season:'summer',maturity:.65,reproductive:false,rootBranching:1,fineRoots:false,rootDepth:1.5,rootSpread:1,shootStage:'extending',wind:0,gust:.6,direction:55});
// The camera can be close to the middle of a branch many metres from the pivot.
const triangle=new Float32Array(42);for(const [i,p]of[[0,[2,8,0]],[1,[12,8,0]],[2,[7,8.02,0]]])triangle.set([...p,0,0,1,.2,.3,.1,0,0,0,0,0],i*14);
const proximity=createSurfaceProximity(triangle,{min:[2,8,0],max:[12,8.02,0]}),eye=[7,8.01,.10],c=cfg('oak');assert(Math.abs(proximity.nearest(eye)-.1)<1e-6,'Proximity must measure the triangle, not its grid cell');
const region=inspectionRegion({eye,cfg:c,proximity});assert(region,'A branch far from the pivot must trigger close-up detail');assert.strictEqual(inspectionRegion({eye:[7.001,8.01,.10],cfg:c,proximity,current:region}),region,'Small camera movements should not regenerate the tree');assert.equal(inspectionRegion({eye:[20,8,5],cfg:c,proximity,current:region}),null);
const windy={...c,wind:4,gust:1.5};for(const p of[[.2,.1,0],[3,5,-2],[-4,10,1]])for(const time of[0,1.3,4.1]){const moved=studyWindPosition(p,0,0,0,windy,time),rest=restCamera(moved,windy,time);assert(Math.hypot(...rest.map((v,k)=>v-p[k]))<.00001,'Inspection volume fails to follow wind-deformed surfaces');}
assert(cameraDepthRange(20,12,{surfaceDistance:0}).near<=.0001,'A distant orbit pivot must not clip a nearby leaf');
const hit=pickSurface(triangle,[7,8.01,1],[0,0,-1],c);assert(hit&&Math.abs(hit.point[2])<1e-6&&Math.abs(hit.distance-1)<1e-6);
const hole=triangle.slice();for(let i=0;i<hole.length;i+=14){hole[i+9]=1.23;hole[i+12]=.99;hole[i+13]=.99;}assert.equal(pickSurface(hole,[7,8.01,1],[0,0,-1],c),null,'Focus picking must pass through transparent leaf-card gaps');
const cone=createInspectionField({center:[0,0,0],radius:1,forward:[0,0,1],cone:.7});assert(cone.near([0,0,.3]));assert(!cone.near([0,0,-.3]));assert(!cone.near([.8,0,.2]));assert(cone.path([[0,0,-.2],[0,0,.5]],.01).near,'A branch crossing the view cone still needs refinement');
// Nearby bark gets the same physical sample spacing as Bark study, at the
// actual branch position, without cut end caps or a detached study model.
let emitted=0;const mesh={v(){emitted++;},preview:{push(){}}},wood=woodTube(mesh,[[0,0,0],[0,1,0]],.16,.16,'oak',{preview:false,inspection:createInspectionField({center:[.18,.44,0],radius:.15})});assert(wood.inspected&&wood.study);assert(wood.study.axialSpacing<.0014&&wood.study.circumferentialSpacing<.0021);assert(emitted>150000);assert(wood.study.sides>=320);

for(const type of Object.keys(SPECIES)){
 const c=cfg(type),coarse=buildSpecimen(c,{preview:false,detail:'far'}),organ=coarse.stats.organGrowth[0]??coarse.stats.rosettes[0]?.leafRecords[0],base=organ?.base??coarse.stats.rosettes[0]?.apex;assert(base,`${type}: missing specimen organ`);
 const axis=organ.axis??[0,1,0],center=base.map((v,k)=>v+axis[k]*c.leafSize*.45),close=buildSpecimen(c,{preview:false,detail:'far',inspection:{center,radius:.055}});
 assert(close.stats.inspection.leaves>0,`${type}: close-up retained simplified foliage`);assert(close.vertices.length>coarse.vertices.length,`${type}: close-up did not add geometry`);assert(close.vertices.every(Number.isFinite));
 for(const a of close.stats.leafAnatomy){if(a.maximumDetail){if(a.contour)assert.equal(a.subdivisions,4);else{assert.equal(a.rows,96);assert.equal(a.columns,type==='ginkgo'?32:8);}}}
 assert.equal(close.stats.leaves,coarse.stats.leaves,`${type}: camera changed botanical leaf count`);assert.deepEqual(close.stats.leafLengths,coarse.stats.leafLengths,`${type}: refinement consumed growth RNG`);assert.equal(close.stats.coveredTips,coarse.stats.coveredTips);assert.deepEqual(close.rootSystem.segments,coarse.rootSystem.segments);
 if(['sweetthorn','fevertree','jacaranda'].includes(type))assert(close.stats.inspection.compoundCards>0,'Close compound leaves must have real pinnae and leaflets');
 if(['pine','chinesepine'].includes(type)){assert(close.stats.inspection.needleCards>0);assert(close.stats.leafAnatomy.some(a=>a.crossSection==='semicircular'&&a.longitudinalRows>=96&&a.geometricStomata),'Close pine retained flat cohort cards');}
 if(type==='dawnredwood')assert(close.stats.inspection.sprays>0,'Close redwood spray retained a flat mask');
 console.log(type+': local full geometry, stable seeded organ sizes/counts and connected roots');
}
for(const type of['sakura','jacaranda','maple','redbud']){
 const c={...cfg(type),season:'spring',reproductive:true},base=buildSpecimen(c,{preview:false,detail:'far'}),site=base.stats.flowerDetails[0]?.attachment;assert(site);
 const close=buildSpecimen(c,{preview:false,detail:'far',inspection:{center:site,radius:.035}});assert(close.stats.inspection.reproductive>0);assert.equal(close.stats.flowers,base.stats.flowers,`${type}: camera changed flower cluster density`);assert.deepEqual(close.stats.leafLengths,base.stats.leafLengths);
 if(type==='sakura')for(const d of close.stats.flowerDetails.filter(d=>d.maximumDetail)){assert.equal(d.pollenGrains,d.flowers*320,'Attached blooms must retain study pollen');assert(d.hairs>=d.flowers*200);}
 console.log(type+': full floral anatomy without changing cluster density');
}
console.log('Surface proximity, wind tracking, camera clipping, focus picking and whole-tree local anatomy passed');
