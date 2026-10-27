import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {SOUTH_AFRICAN_PRESETS} from '../dist/south-africa.mjs';
import {buildTreeArchitecture} from '../dist/architecture.mjs';
import {bipinnateCoverage} from '../dist/compound-lod.mjs';

const types=['baobab','fevertree','sausagetree','karee'];
const build=(type,view,changes={})=>buildSpecimen({...SOUTH_AFRICAN_PRESETS[type],type,view,seed:2847,season:'summer',maturity:.65,levels:3,shoots:3,reproductive:true,fruitStage:'mature',...changes},{preview:false});
for(const type of types){
 const leaf=build(type,'leaf'),r=leaf.stats.compoundRecords[0];assert(leaf.vertices.every(Number.isFinite));
 assert.equal(build(type,'surface').stats.leaves,1,'Surface study must isolate a natural-scale leaflet');
 assert.equal(build(type,'shoot',{season:'winter'}).stats.leaves>0,!!SPECIES[type].evergreen);
 if(type==='baobab'||type==='karee'){
  assert(type==='baobab'?[5,7].includes(r.leaflets):r.leaflets===3);
  assert(r.attachments.every(p=>p.every((x,i)=>x===r.hub[i])),'Palmate/trifoliate leaflets must share one petiole-tip attachment');
 }
 if(type==='fevertree'){
  assert(r.pairs>=4&&r.pairs<=7);assert.equal(r.pinnae,r.pairs*2);assert(r.leaflets>=r.pinnae*20&&r.leaflets<=r.pinnae*34);
  const release=build(type,'fruit',{fruitStage:'released'});assert(release.stats.fruitDetails[0].seeds>0);assert.equal(release.stats.fruitDetails[0].valves,2);
 }
 if(type==='sausagetree'){
  assert(r.pairs>=2&&r.pairs<=5);assert.equal(r.leaflets,r.pairs*2+1);
  const shoot=build(type,'shoot');assert(shoot.stats.whorls.length>0);assert(shoot.stats.whorls.every(w=>w.members===3));assert.equal(shoot.stats.compoundLeaves,shoot.stats.whorls.length*3);
 }
 const mature=build(type,'fruit'),detail=mature.stats.fruitDetails[0];assert(mature.vertices.every(Number.isFinite));assert(mature.inspectFocus.every(Number.isFinite));
 if(type==='baobab'||type==='sausagetree'){
  assert(detail.indehiscent&&detail.woodyShell);assert.deepEqual(mature.vertices,build(type,'fruit',{fruitStage:'released'}).vertices,'Closed fruit must not invent opening valves at seed release');
  if(type==='baobab'){assert(detail.length>=.13&&detail.length<=.25);assert(detail.surfaceHairs>=600);}
  else{assert(detail.length>=.32&&detail.length<=.65);assert(detail.stalkLength>=.45&&detail.stalkLength<=.75);}
 }
 if(type==='karee'){assert.equal(detail.drupes,18);assert(detail.length>=.004&&detail.length<=.005);}
 console.log(type+': reference-scale organ layout, winter habit and reproductive structure passed');
}
// The two bipinnate presets need different leaflet spacing in both rendering
// and the exported alpha atlas; finer fever-tree pinnae have more leaflets.
for(const pairs of [4,5,6,7]){
 let sweet=0,fever=0;for(let y=0;y<240;y++)for(let x=0;x<160;x++){sweet+=bipinnateCoverage((x+.5)/160,(y+.5)/240,pairs,9);fever+=bipinnateCoverage((x+.5)/160,(y+.5)/240,pairs,13);}
 assert(sweet>0&&fever>0);assert.notEqual(sweet,fever);
}
const baobab=buildTreeArchitecture({...SOUTH_AFRICAN_PRESETS.baobab,type:'baobab',seed:2847,levels:3,shoots:3,maturity:.65});
assert(baobab.baseRadius>.06*SOUTH_AFRICAN_PRESETS.baobab.height,'Baobab needs a swollen adult bole');
console.log('Baobab proportions and separate fine-leaflet canopy coverage passed');
