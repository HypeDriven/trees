import assert from 'node:assert/strict';
import {buildTreeArchitecture,sampleBranch} from '../dist/architecture.mjs';
import {cameraDepthRange} from '../dist/camera-range.mjs';
const base={height:10,spread:1,levels:4,seed:2847,shoots:3,maturity:.65};
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),length=a=>Math.hypot(...a);
const arclength=p=>p.slice(1).reduce((s,v,i)=>s+length(sub(v,p[i])),0);
function onPolyline(point,points){return points.slice(1).some((b,i)=>{const a=points[i],v=sub(b,a),w=sub(point,a),t=dot(w,v)/dot(v,v);return t>=-1e-7&&t<=1+1e-7&&length(w.map((x,k)=>x-v[k]*t))<1e-7})}
function span(a,k){const p=a.records.flatMap(r=>r.points.map(v=>v[k]));return Math.max(...p)-Math.min(...p)}
for(const type of ['willow','oak','pine','birch']){
 const cfg={...base,type},a=buildTreeArchitecture(cfg);assert.deepEqual(a,buildTreeArchitecture(cfg));assert.notDeepEqual(a.records,buildTreeArchitecture({...cfg,seed:2848}).records);
 assert(Math.abs(span(a,1)-cfg.height)<1e-7);assert(a.records.flatMap(r=>r.points.flat()).every(Number.isFinite));
 for(const r of a.records){
  if(r.parent===null)continue;
  const parent=a.records[r.parent];assert(onPolyline(r.points[0],parent.points),`${type}: disconnected branch`);
  if(r.role==='continuation'){
   assert(length(sub(r.points[0],parent.points.at(-1)))<1e-7,'Continuation must occupy parent apex');
   const d0=sampleBranch(parent.points,1).direction,d1=sampleBranch(r.points,0).direction;assert(dot(d0,d1)>.995,'Apex has an abrupt direction change');
  }
 }
 const scaffolds=a.records.filter(r=>r.role==='scaffold'),curvature=scaffolds.map(r=>arclength(r.points)/length(sub(r.points.at(-1),r.points[0]))),lens=scaffolds.map(r=>arclength(r.points));
 assert(Math.max(...lens)/Math.min(...lens)>1.25,'Identical scaffold lengths make a mechanical crown');
 assert(curvature.reduce((s,x)=>s+x,0)/curvature.length>1.015,'Scaffolds must form arcs rather than straight rods');
 const wide=buildTreeArchitecture({...cfg,spread:1.6}),narrow=buildTreeArchitecture({...cfg,spread:.4});assert(Math.abs(span(wide,0)/span(narrow,0)-4)<1e-6,'Spread must scale the crown, not just branch angles');
 if(type==='willow'){assert(a.stats.trunkHeight<5);assert(a.stats.pendulousTips/a.stats.terminals>.8);assert(span(a,0)>10);}
 if(type==='oak'){assert(a.stats.trunkHeight<5);assert(a.stats.upturnedTips/a.stats.terminals>.7);}
 if(type==='birch'){assert(a.stats.trunkHeight>9);assert(a.stats.pendulousTips/a.stats.terminals>.7);assert(scaffolds.every(r=>r.points[1][1]>r.points[0][1]));}
 if(type==='pine'){
  assert(a.stats.trunkHeight>9);assert(a.stats.upturnedTips/a.stats.terminals>.9);
  const young=buildTreeArchitecture({...cfg,maturity:0}),old=buildTreeArchitecture({...cfg,maturity:1});
  const low=a=>Math.min(...a.records.filter(r=>r.role==='scaffold').map(r=>r.points[0][1]));assert(low(old)>low(young)+1,'Mature pine must open its lower crown');
 }
 console.log(type+': connected, curved, asymmetric species architecture and apical continuity passed');
}
// At normal orbit distance, two surfaces 0.5 mm apart must not quantize to
// the same 24-bit perspective depth, including when viewed obliquely.
for(const distance of [8,25,65]){
 const {near,far}=cameraDepthRange(distance,6),depth=z=>(far/(far-near)-far*near/((far-near)*z));
 for(const angle of [0,.4,.8]){const z=distance+Math.sin(angle)*.2;assert(Math.abs(depth(z+.0005)-depth(z))*2**24>2,'Insufficient root/ground depth precision');}
 assert(near<distance&&far>distance+6);
}
const macro=cameraDepthRange(.03,.06);assert(macro.near<.001&&macro.far>.03);
console.log('Millimetre root-contact depth separation and macro camera clipping passed');
for(const type of ['willow','oak','pine','birch']){
 const a=buildTreeArchitecture({...base,type,seed:999999,height:5,levels:5,maturity:1,spread:1.6});
 for(const r of a.records)for(const p of r.points)assert(p[1]>=0,'Extreme seed grew a canopy branch beneath the soil');
}
console.log('Deep-crown, low-branch soil-clearance regression passed');
