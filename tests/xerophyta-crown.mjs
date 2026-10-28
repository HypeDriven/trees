import assert from 'node:assert/strict';
import {buildSpecimen} from '../dist/botany.mjs';
import {buildXerophytaArchitecture,GARDEN_PRESETS} from '../dist/garden-species.mjs';
const cfg={...GARDEN_PRESETS.monkeytail,type:'monkeytail',view:'tree',levels:4,shoots:3,seed:2847,season:'spring',reproductive:true,maturity:.65,rootDepth:.25,rootBranching:1,fineRoots:false,shootStage:'extending'};
const length=a=>Math.hypot(...a),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const habits=new Set();
for(const seed of[1,19,73,2847,91821])for(const height of[.3,1.1,1.8]){
 const c={...cfg,seed,height},architecture=buildXerophytaArchitecture(c),plant=buildSpecimen(c,{preview:false}),s=plant.stats;
 assert(architecture.records.every(r=>r.crown),'The main stem must retain a living terminal crown even when it has lateral branches');
 assert(!architecture.records.some(r=>r.role==='continuation'),'No appended, abruptly narrowed wooden extension');
 assert.equal(s.rosettes.length,architecture.records.length);assert.equal(s.coveredTips,s.structuralTips);
 assert(plant.vertices.every(Number.isFinite));assert(plant.vertices.byteLength<24*1024*1024);
 habits.add(architecture.records.length);
 for(const crown of s.rosettes){
  assert(crown.closedCrown&&crown.domeHeight>crown.radius*.30,'The thick axis needs a rounded, covered end');
  assert(crown.leaves>=3&&crown.leaves<=7);assert.equal(crown.sheaths.length,crown.leaves);
  assert(crown.oldBases.length>=12&&crown.oldBases.length<=16);
  for(const sheath of[...crown.oldBases,...crown.sheaths])assert(sheath.length>=.030&&sheath.length<=.060);
  for(let i=0;i<crown.leaves;i++)assert.deepEqual(crown.sheaths[i].tip,crown.leafRecords[i].base,'A live blade must meet its own sheath');
  const bases=crown.leafRecords.map(r=>r.base),heights=bases.map(p=>dot(sub(p,crown.apex),crown.axis));
  assert(Math.max(...heights)-Math.min(...heights)>crown.domeHeight*.30,'Leaf bases should be staggered along the crown');
  assert(bases.every((p,i)=>bases.every((q,j)=>i===j||length(sub(p,q))>.001)),'Leaves must not converge at one exposed point');
 }
 assert.equal(s.flowerDetails.length,s.rosettes.length);
 for(const cluster of s.flowerDetails){
  assert(cluster.flowers>=1&&cluster.flowers<=3);assert.equal(cluster.tepals,cluster.flowers*6);assert.equal(cluster.stamens,cluster.flowers*6);
  for(const f of cluster.flowerRecords){
   assert(f.peduncleLength>=.075&&f.peduncleLength<=.150);assert(f.ovaryLength>=.004&&f.ovaryLength<=.008);
   assert(f.axis[1]>.65,'Stalks should retain the erect/flexuous habit');
   assert(length(sub(f.base,cluster.attachment))<.016,'Flower stalks must emerge within the crown');
   const chord=sub(f.stalk.at(-1),f.stalk[0]),middle=sub(f.stalk[4],f.stalk[0]),projection=dot(middle,chord)/dot(chord,chord),bend=length(sub(middle,chord.map(v=>v*projection)));
   assert(bend>1e-7,'Peduncles need a small coherent flexure');
  }
 }
}
assert(habits.size>1,'Every seed should not force the same upper forks');
for(const season of['spring','summer','autumn','winter']){
 const shoot=buildSpecimen({...cfg,season,view:'shoot'},{preview:false}),s=shoot.stats;
 assert(s.wood.tubes===1,'Shoot study must use the fibrous stem geometry');
 assert(!shoot.vertices.some((v,i)=>i%14===9&&v>.11&&v<.13),'A living crown must not have exposed cut end grain');
 assert(s.rosettes[0].oldBases.length>=12,'Persistent sheaths remain in the dry phase');
 assert.equal(s.leaves===0,season==='winter');assert.equal(s.flowers===0,['autumn','winter'].includes(season));
 if(season==='summer')assert(s.flowerDetails[0].flowers<=2&&s.fruits===1,'Flowers and retained capsule should occupy separate slender stalks');
}
const hidden=buildSpecimen({...cfg,reproductive:false},{preview:false});assert.equal(hidden.stats.flowers,0);assert.equal(hidden.stats.fruits,0);assert(hidden.stats.leaves>0);
const a=buildSpecimen({...cfg,view:'shoot'},{preview:false}),b=buildSpecimen({...cfg,view:'shoot'},{preview:true});assert.deepEqual(a.vertices,b.vertices,'Software and GPU must receive identical crown anatomy');
console.log('Monkey’s-tail connected crowns, sheath lattice, staggered blades, slender flexuous stalks, variable branching and seasonal persistence passed');
