import assert from 'node:assert/strict';
import {woodTube,barkGeometryHeight} from '../dist/wood.mjs';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {bipinnateCoverage} from '../dist/compound-lod.mjs';
function cylinder(type,r=.10){const vertices=[],m={v(p,n,c,k,age,radius,uv){vertices.push({p,n,k,uv})},preview:{push(){}}};woodTube(m,[[0,0,0],[0,.30,0]],r,r,type,{fine:true,maturity:1,preview:false});return vertices;}
const oak=cylinder('oak'),smooth=cylinder('sakura'),twig=cylinder('oak',.003),span=a=>Math.max(...a.map(v=>Math.hypot(v.p[0],v.p[2])))-Math.min(...a.map(v=>Math.hypot(v.p[0],v.p[2])));
assert(span(oak)>.005,'Coarse bark must change the actual silhouette');assert(span(oak)>span(smooth)*2);assert(span(twig)<.001,'Fine twigs must not inherit thick trunk plates');
assert(oak.filter(v=>{const r=Math.hypot(v.p[0],v.p[2]);return Math.abs((v.p[0]*v.n[0]+v.p[2]*v.n[2])/r)<.96}).length>oak.length*.10,'Displaced ridges need displaced-surface normals');
assert(oak.length>96*96*6,'Rough bark studies need raised plate geometry');
assert.equal(barkGeometryHeight('oak',[.03,.04],1,.003),0);
for(const type of['sweetthorn','fevertree']){
 const r=buildSpecimen({type,view:'leaf',height:10,seed:2847,leafSize:SPECIES[type].length,season:'summer',maturity:.65,density:68},{preview:false}),p=r.stats.compoundRecords[0].pinnaRecords;
 const middle=p.filter(q=>q.position>.3&&q.position<.7),distal=p.filter(q=>q.position>.9);assert(Math.max(...distal.map(q=>q.length))<Math.max(...middle.map(q=>q.length))*.8,'The compound leaf must taper at its ends');
 const pairs=type==='sweetthorn'?5:7,leaflets=type==='sweetthorn'?9:13,width=(lo,hi)=>{let max=0;for(let y=lo;y<hi;y+=.002)for(let x=.5;x<1;x+=.002)if(bipinnateCoverage(x,y,pairs,leaflets))max=Math.max(max,(x-.5)*2);return max;};
 assert(width(.76,.92)<width(.36,.60)*.9,'Canopy and export masks must preserve the tapered outline');
}
console.log('Physical bark silhouette, surface normals, lifted plates, smooth young twigs and tapered thorn-tree foliage passed');
