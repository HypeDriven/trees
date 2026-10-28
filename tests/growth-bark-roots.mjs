import assert from 'node:assert/strict';
import {shootGrowth,leafDevelopment} from '../dist/foliage-growth.mjs';
import {pineBarkStyle,barkSample,woodTube} from '../dist/wood.mjs';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
const length=p=>Math.hypot(...p),sub=(a,b)=>a.map((v,i)=>v-b[i]),arc=pts=>pts.slice(1).reduce((s,p,i)=>s+length(sub(p,pts[i])),0),mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
for(const [type,species] of Object.entries(SPECIES)){
 const cfg={type,seed:2847,leafSize:species.length,season:'spring'},g=shootGrowth(cfg,4);
 const middle=leafDevelopment(cfg,species,g,.5),tip=leafDevelopment(cfg,species,g,1);
 assert(tip.length<middle.length*.55,'Expanding tip should be smaller than mature median leaves');
 assert(tip.length<tip.matureLength*.5);assert.deepEqual(tip,leafDevelopment(cfg,species,g,1));
 const adult={...cfg,season:'autumn'},ag=shootGrowth(adult,4),adultTip=leafDevelopment(adult,species,ag,1),adultMid=leafDevelopment(adult,species,ag,.5);
 assert.equal(adultTip.expansion,1);assert(adultTip.length>adultMid.length*.75,'Mature tips must not be universally miniaturized');
 const potentials=[];for(let s=0;s<60;s++)for(let n=0;n<12;n++){
  const x=leafDevelopment(cfg,species,shootGrowth(cfg,s),n/11,n);assert(x.matureLength>=species.leaf[0]&&x.matureLength<=species.leaf[1]);assert(x.expansion>=.27&&x.expansion<=1);potentials.push(x.matureLength);
 }
 assert(Math.max(...potentials)/Math.min(...potentials)>1.25,'Need variation between shoots and leaf positions');
 const spring=buildSpecimen({...cfg,view:'shoot',density:32,maturity:.65,reproductive:false});
 assert(spring.stats.organGrowth.some(x=>x.expansion<.5));
 if(type==='pine')for(let i=0;i<spring.stats.leafLengths.length;i+=2)assert(Math.abs(spring.stats.leafLengths[i]/spring.stats.leafLengths[i+1]-1)<.04,'Needles in one fascicle need strongly correlated, slightly varied lengths');
 console.log(type+': developing apical organs, adult ranges, shoot variation and seasonal expansion passed');
}

// A trunk that starts at grade must match a branch attached halfway up it.
function pineMesh(points,r0,r1){const vertices=[],mesh={v(p,n,c,kind,age,r,uv){vertices.push({p,c,kind,uv})},preview:[]};woodTube(mesh,points,r0,r1,'pine',{treeHeight:10,preview:false});return vertices;}
const trunk=pineMesh([[0,0,0],[0,8,0]],.16,.05),branch=pineMesh([[0,4,0],[1,5,0]],.04,.015),at=trunk.find(v=>Math.abs(v.uv[1]-4)<1e-6&&v.uv[0]===0);
assert(at);for(let i=0;i<3;i++)assert(Math.abs(at.c[i]-branch[0].c[i])<1e-6,'Pine junction has a branch-wide colour preset jump');
assert(Math.max(...trunk.map(v=>v.kind))>Math.min(...trunk.map(v=>v.kind))+.04,'Trunk must participate in the upper-bark transition');
for(const threshold of [.05,.075]){
 const a=barkSample('pine',[.012,.031],.8,threshold-1e-6),b=barkSample('pine',[.012,.031],.8,threshold+1e-6);assert(Math.abs(a.height-b.height)<.00001);assert(Math.abs(a.roughness-b.roughness)<.001);
}
assert.deepEqual(pineBarkStyle(4,.1,10).color,pineBarkStyle(4,.02,10).color);
console.log('Pine trunk/branch junction colour continuity and smoothly blended material zones passed');

for(const type of Object.keys(SPECIES)){
 const cfg={type,seed:2847,height:10,spread:1,levels:3,shoots:3,view:'roots',rootSpread:1,rootDepth:1.3,rootBranching:3,fineRoots:true,maturity:.65,leafSize:SPECIES[type].length};
 const a=buildSpecimen(cfg,{preview:false}),roots=a.rootSystem,primary=roots.segments.filter(s=>s.kind==='primary');
 const tortuosity=primary.map(s=>arc(s.points)/length(sub(s.points.at(-1),s.points[0])));assert(mean(tortuosity)>1.035,'Root network still consists of straight spokes');
 const angles=primary.map(s=>Math.atan2(s.points[0][2],s.points[0][0])).sort((a,b)=>a-b),gaps=angles.map((a,i)=>(angles[(i+1)%angles.length]-a+Math.PI*2)%(Math.PI*2));assert(Math.max(...gaps)/Math.min(...gaps)>1.5,'Root emergence is too evenly spaced');
 const lengths=primary.map(s=>arc(s.points));assert(Math.max(...lengths)/Math.min(...lengths)>1.35);
 const deflections=primary.map(s=>{let a=sub(s.points[1],s.points[0]),b=sub(s.points[5],s.points[4]);return Math.abs(Math.atan2(a[2],a[0])-Math.atan2(b[2],b[0]));});assert(mean(deflections)>.08,'Root collar still has long straight initial sections');
 for(const c of roots.stats.connections)assert(roots.segments[c.parent].points.some(p=>p.every((v,i)=>v===c.start[i])));
 assert(roots.stats.depth<=cfg.rootDepth+1e-8);assert(a.vertices.every(Number.isFinite));
 const b=buildSpecimen(cfg,{preview:false});assert.deepEqual(roots.segments,b.rootSystem.segments);
 console.log(type+': winding root paths, irregular emergence, exact forks and deterministic geometry passed');
}
