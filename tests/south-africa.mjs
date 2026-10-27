import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {SOUTH_AFRICAN_PRESETS} from '../dist/south-africa.mjs';
import {bipinnateCoverage} from '../dist/compound-lod.mjs';

const base={height:10,spread:1,levels:3,shoots:3,density:45,seed:2847,maturity:.65,season:'summer',reproductive:true,fruitStage:'mature',view:'shoot'};
const build=(type,changes={})=>buildSpecimen({...base,...SOUTH_AFRICAN_PRESETS[type],type,...changes},{preview:false});
for(const type of Object.keys(SOUTH_AFRICAN_PRESETS)){
 const a=build(type);assert(a.vertices.every(Number.isFinite));
 const winter=build(type,{season:'winter'});assert.equal(winter.stats.leaves>0,!!SPECIES[type].evergreen);
 for(const stage of ['developing','mature','released']){
  const fruit=build(type,{view:'fruit',fruitStage:stage}),f=fruit.stats.fruitDetails[0];assert(fruit.vertices.every(Number.isFinite));assert(fruit.inspectFocus.every(Number.isFinite));
  if(type==='sweetthorn'){assert.equal(f.valves,2);assert.equal(f.sutures,2);assert(f.length>=.05&&f.length<.16);assert.equal(f.seeds>0,stage==='released');}
  if(type==='yellowwood'){assert.equal(f.exposedSeeds,1);assert.equal(f.receptacles,1);assert(f.length<.03);assert.equal(f.scales,0);}
  if(type==='wildolive')assert(f.length>=.008&&f.length<=.012);
  if(type==='marula'){assert(f.length>=.03&&f.length<=.045);assert.equal(f.detachedRipe,stage!=='developing');}
 }
 if(type==='marula'){assert(a.stats.compoundRecords.every(r=>r.terminalLeaflet&&r.leaflets===r.pairs*2+1));assert(a.stats.fruitDetails.every(f=>f.stage==='developing'),'Attached marula fruit must stay green');}
 if(type==='sweetthorn'){
  assert(a.stats.spinePairs>0);assert(a.stats.compoundRecords.every(r=>!r.terminalLeaflet&&r.pinnae===r.pairs*2&&r.leaflets>r.pinnae*10));
  const organ=build(type,{view:'leaf'}),surface=build(type,{view:'surface'});assert(organ.stats.leaves>70);assert.equal(surface.stats.leaves,1);assert(organ.bounds.max[1]-organ.bounds.min[1]>.07);assert(surface.bounds.max[1]-surface.bounds.min[1]<.025);
 }
 if(type==='wildolive'){
  assert.equal(a.stats.leaves,a.stats.oppositePairs.length*2);
  for(let i=1;i<a.stats.oppositePairs.length;i++)assert(Math.abs(a.stats.oppositePairs[i].axis-a.stats.oppositePairs[i-1].axis-Math.PI*.5)<1e-10,'Successive opposite leaf pairs must be decussate');
 }
 console.log(type+': compound anatomy / leaf attachment, winter retention and reproductive stages passed');
}
for(const pairs of [3,4,5]){
 let filled=0,total=0;
 for(let y=0;y<300;y++)for(let x=0;x<200;x++){filled+=bipinnateCoverage((x+.5)/200,(y+.5)/300,pairs);total++;}
 assert(filled/total>.12&&filled/total<.40,'Cutout must retain leaflet gaps rather than an opaque card');
 assert.equal(bipinnateCoverage(0,.5,pairs),0);assert.equal(bipinnateCoverage(.5,.5,pairs),1);
}
const canopy=build('sweetthorn',{view:'tree',reproductive:false}),cards=canopy.stats.compoundRecords;
assert(cards.every(r=>r.lod==='cutout'));assert.equal(canopy.stats.leaves,cards.reduce((n,r)=>n+r.leaflets,0));assert(canopy.stats.leaves>1000000);assert(canopy.vertices.byteLength<256*1024*1024);assert(canopy.vertices.every(Number.isFinite));
assert.equal(canopy.stats.coveredTips,canopy.stats.terminalTips);
console.log('Dense bipinnate canopy keeps physical leaflet scale within the geometry budget');
