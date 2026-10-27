import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {GARDEN_PRESETS,buildXerophytaArchitecture} from '../dist/garden-species.mjs';
import {ROOT_PROFILES} from '../dist/roots.mjs';
import {woodTube} from '../dist/wood.mjs';
import {bipinnateCoverage} from '../dist/compound-lod.mjs';

const build=(type,view,changes={})=>buildSpecimen({...GARDEN_PRESETS[type],season:'summer',type,view,seed:2847,levels:4,shoots:3,maturity:.65,reproductive:true,rootBranching:2,fruitStage:'mature',...changes},{preview:false});
const jac=build('jacaranda','leaf'),leaf=jac.stats.compoundRecords[0];
assert.equal(leaf.pinnae,leaf.pairs*2+1,'Jacaranda requires an unpaired terminal pinna');
assert.equal(jac.stats.spinePairs,0);
const lateralPinnae=leaf.pinnaRecords.filter(p=>!p.terminal),middle=lateralPinnae.filter(p=>p.position>.25&&p.position<.5),distal=lateralPinnae.filter(p=>p.position>.9);
for(let i=0;i<lateralPinnae.length;i+=2)assert.equal(lateralPinnae[i].leafletPairs,lateralPinnae[i+1].leafletPairs,'Paired pinnae should have correlated leaflet counts');
assert(Math.max(...distal.map(p=>p.length))<Math.min(...middle.map(p=>p.length))*.5,'Distal pinnae must taper the full compound leaf');
assert(jac.stats.leafLengths.some(l=>l<.004)&&jac.stats.leafLengths.some(l=>l>.006),'Pinnules should vary within the natural range');
const maskWidth=(lo,hi)=>{let width=0;for(let y=lo;y<hi;y+=.001)for(let x=.5;x<1;x+=.001)if(bipinnateCoverage(x,y,12,16,true))width=Math.max(width,(x-.5)*2);return width;};
assert(maskWidth(.76,.89)<maskWidth(.34,.55)*.65,'Whole-tree and exported masks must have a tapered apex, not a rectangular ladder');

let terminalZ=[];
for(let i=0;i<jac.vertices.length;i+=14)if(jac.vertices[i+1]>leaf.length*.86&&jac.vertices[i+1]<leaf.length*.97&&jac.vertices[i+9]>.9)terminalZ.push(jac.vertices[i+2]);
assert(Math.max(...terminalZ)-Math.min(...terminalZ)>.006,'Terminal pinna needs spreading lateral leaflets, not an axial spike');
assert(maskWidth(.9,.98)>.025,'Cutout geometry must resolve the terminal pinna');
const spring=build('jacaranda','shoot',{season:'spring'}),summer=build('jacaranda','shoot');
assert(spring.stats.flowers>0&&summer.stats.flowers===0);
assert(summer.stats.oppositePairs.length>0);assert.equal(summer.stats.compoundLeaves,summer.stats.oppositePairs.length*2);
const capsule=build('jacaranda','fruit',{fruitStage:'released'}).stats.fruitDetails[0];
assert(capsule.flattened&&capsule.valves===2&&capsule.wingedSeeds>0);
console.log('Jacaranda terminal pinnae, opposite leaves, spring flowers and winged-seed capsules passed');

const plant=build('monkeytail','tree'),s=plant.stats;
assert(GARDEN_PRESETS.monkeytail.height<=1.8&&SPECIES.monkeytail.growthForm==='xerophyte');
assert(s.rosettes.length>1&&s.rosettes.every(r=>r.leaves>=3&&r.leaves<=7));
assert.equal(s.petioles,0);assert.equal(s.buds,0);assert.equal(s.wood.collars,0);
assert.equal(build('monkeytail','shoot',{season:'winter'}).stats.leaves,0);
const bloom=build('monkeytail','shoot',{season:'spring'}).stats.flowerDetails[0];
assert.equal(bloom.tepals,bloom.flowers*6);assert.equal(bloom.stamens,bloom.flowers*6);
const bristly=build('monkeytail','fruit',{fruitStage:'released'}).stats.fruitDetails[0];
assert.equal(bristly.valves,3);assert(bristly.surfaceHairs>=100&&bristly.seeds>0);
const skeleton=buildXerophytaArchitecture({height:1.1,seed:2847,levels:4,shoots:3,spread:1});
assert(skeleton.records.length<20&&skeleton.baseRadius<=.028);
assert(ROOT_PROFILES.monkeytail.fibrous&&!ROOT_PROFILES.monkeytail.tap);
assert(plant.rootSystem.segments.filter(r=>r.kind==='primary').every(r=>r.r0<.002));
for(let i=0;i<plant.vertices.length;i+=14)if(plant.vertices[i+1]<-.01)assert(plant.vertices[i+9]<0,'Underground fibrous roots must remain stationary');
console.log('Monkey’s-tail rosettes, fibrous stems/roots, six-part flowers and bristly capsules passed');

const gum=build('eucalyptus','shoot'),umbel=gum.stats.flowerDetails[0];
assert(umbel.flowers+umbel.buds>=7&&umbel.flowers+umbel.buds<=11);assert(umbel.stamens>=umbel.flowers*30);
assert.equal(gum.stats.oppositePairs.length,0,'Adult eucalyptus leaves are alternate');
assert(build('eucalyptus','shoot',{season:'winter'}).stats.leaves>0);
const nuts=build('eucalyptus','fruit',{fruitStage:'released'}),n=nuts.stats.fruitDetails[0];
assert(n.length>=.0055&&n.length<=.008);assert.equal(n.raisedRims,n.capsules);assert.equal(n.valves,n.capsules*4);assert(n.projectingValves&&n.seeds>0);
for(const f of nuts.stats.fruitDetails)for(const v of Object.values(f))if(typeof v==='number')assert(Number.isFinite(v));
// Tiny fruit-bearing twigs must not grow full-size peeling bark sheets.
const points=[],mesh={v(p){points.push(p)},preview:{push(){}}};
woodTube(mesh,[[0,0,0],[0,.03,0]],.003,.002,'eucalyptus',{fine:true,preview:false});
assert(Math.max(...points.map(p=>Math.hypot(p[0],p[2])))<.005);
assert(SPECIES.eucalyptus.introduced&&SPECIES.jacaranda.introduced&&!SPECIES.monkeytail.introduced);
assert(nuts.vertices.every(Number.isFinite));
console.log('River-red-gum adult foliage, evergreen habit, stamen umbels and raised four-valve gum nuts passed');

const largest=build('eucalyptus','tree',{height:35,levels:5,shoots:4,density:100,maturity:1,rootBranching:4});
assert(largest.vertices.byteLength<320*1024*1024,'Tall, densely branched gums must respect the whole-tree mesh budget');
assert.equal(largest.stats.coveredTips,largest.stats.terminalTips);
assert(largest.stats.fruitDetails.every(f=>f.capsules>=7&&f.valves===f.capsules*4));
console.log('Maximum-height eucalyptus retains terminal foliage and natural umbel counts within the mesh budget');
