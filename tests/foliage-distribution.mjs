import assert from 'node:assert/strict';
import {SPECIES,buildSpecimen} from '../dist/botany.mjs';
import {shootGrowth,leafDevelopment} from '../dist/foliage-growth.mjs';
import {buildTreeArchitecture} from '../dist/architecture.mjs';
const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
for(const [type,species] of Object.entries(SPECIES)){
 const cfg={type,view:'tree',seed:2847,height:10,leafSize:species.length,season:'spring'};
 const young=shootGrowth(cfg,41,{relativeAge:.1,crownHeight:.6}),older=shootGrowth(cfg,41,{relativeAge:.9,crownHeight:.6});
 assert(older.lengthScale>young.lengthScale&&older.vigor>young.vigor,type+' position affects shoot growth');
 const a=leafDevelopment(cfg,species,young,1,7),b=leafDevelopment(cfg,species,older,1,7);
 assert(b.expansion>a.expansion&&b.length>=a.length,type+' local age affects apical expansion');
 assert.equal(shootGrowth(cfg,41).active,true,type+' regional spring flush');
 const samples=Array.from({length:50},(_,key)=>{
  const shoot=shootGrowth(cfg,key,{relativeAge:key/49,crownHeight:.6});
  return leafDevelopment(cfg,species,shoot,.5,4);
 });
 assert(new Set(samples.map(x=>x.roll.toFixed(2))).size>15,type+' varied blade rotations');
 assert(new Set(samples.map(x=>x.length.toFixed(6))).size>15,type+' varied shoot leaf sizes');
 for(const x of samples){assert(x.matureLength>=species.leaf[0]&&x.matureLength<=species.leaf[1]);assert(Math.abs(x.roll)<=.95&&Math.abs(x.yaw)<.5);}
 const adult={...cfg,season:'autumn'},shoot=shootGrowth(adult,41,{relativeAge:.1});
 assert.equal(leafDevelopment(adult,species,shoot,1,7).expansion,1,type+' set leaves finish expanding');
}
const base={view:'tree',seed:2847,height:6,spread:1,levels:2,shoots:2,density:8,season:'summer',maturity:.65,reproductive:false,rootBranching:1,fineRoots:false,rootDepth:1.2,rootSpread:1};
const architecture=buildTreeArchitecture({...base,type:'oak'});
for(const r of architecture.records){assert(r.relativeAge>=0&&r.relativeAge<=1);if(r.parent!==null){const parent=architecture.records[r.parent];assert(Math.abs(r.relativeAge-(parent.relativeAge*.3+(1-r.attachment)*.7))<1e-12);}}
const alternating=Object.entries(SPECIES).filter(([,p])=>p.twoRanked&&!p.whorl&&!p.compound).slice(0,3);
assert(alternating.length);
for(const [type,species] of alternating){
 const s=buildSpecimen({...base,type,view:'shoot',shootStage:'set',leafSize:species.length},{preview:false,detail:'far'}),leaves=s.stats.organGrowth;
 assert(leaves.length>2);assert(dot(leaves[0].axis,leaves[1].axis)<0,type+' two-ranked leaves alternate sides');
}
const signature=specimen=>specimen.stats.organGrowth.map(({length,matureLength,expansion,shootAge,roll,yaw,pitch,shootKey})=>({length,matureLength,expansion,shootAge,roll,yaw,pitch,shootKey}));
for(const type of ['oak','maple','sweetthorn','fagus-sylvatica','olea-europaea']){
 if(!SPECIES[type])continue;
 const cfg={...base,type,leafSize:SPECIES[type].length},low=buildSpecimen(cfg,{preview:false,detail:'far',omitBuried:true}),high=buildSpecimen(cfg,{preview:false,detail:'near',omitBuried:true});
 assert.deepEqual(signature(low),signature(high),type+' detail must not reseed developmental pose');
 assert.deepEqual(low.rootSystem.segments,high.rootSystem.segments,type+' foliage detail cannot move roots');
 assert(low.vertices.every(Number.isFinite));assert.equal(low.stats.coveredTips,low.stats.terminalTips);
}
console.log('All species: position/age-dependent shoot sizes and blade rotations, regional growth, two-ranked alternation and LOD identity passed.');
// Inspect final blade frames and continuous surfaces, not just the random
// parameters of one outer shoot. This includes leaflets sharing a rachis plane.
let audited=0;
for(const [type,species] of Object.entries(SPECIES)){
 const cfg={...base,type,view:'shoot',shootStage:'set',season:'summer',leafSize:species.length},specimen=buildSpecimen(cfg,{preview:false,detail:'far'}),poses=specimen.stats.bladePoses;
 if(!poses.length)continue; // solid needles are audited by pine fascicle tests
 assert(poses.every(p=>p.normal.every(Number.isFinite)&&Math.abs(Math.hypot(...p.normal)-1)<1e-8),type+' orthonormal blade frame');
 const shapes=new Set(poses.map(({form:f})=>[f.camber,f.twist,f.sweep,f.asymmetry].map(x=>x.toFixed(4)).join('/')));
 assert(shapes.size>poses.length*.85,type+' repeats relative blade shapes');
 if(poses.some(p=>p.compoundPart)){
  const normals=poses.filter(p=>p.compoundPart).map(p=>p.normal),spread=Math.max(...normals.map(n=>Math.acos(Math.max(-1,Math.min(1,dot(n,normals[0]))))));
  assert(spread>.12,type+' leaflets are confined to a shared plane');
 }
 // At the adult size bounds, hard clamping must not erase all size variation.
 for(const leafSize of species.leaf){
  const lengths=Array.from({length:24},(_,i)=>leafDevelopment({...cfg,leafSize},species,shootGrowth(cfg,i),.5,i).length);
  if(species.leaf[1]>species.leaf[0])assert(new Set(lengths.map(x=>x.toFixed(7))).size>12,type+' clipped identical leaf sizes');
 }
 audited++;
}
console.log(`${audited} species: final blade frames, independent leaflet curvature and variation at adult size limits passed.`);
