import assert from 'node:assert/strict';
import {barkSample,woodTube,woodRadius} from '../dist/wood.mjs';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
assert.equal(woodRadius(.1,.02,0),.1);assert.equal(woodRadius(.1,.02,1),.02);
for(const type of Object.keys(SPECIES)){
 let signatures=[];
 for(let i=0;i<100;i++){
  const uv=[i*.0013,i*.0037],zone=type==='birch'?.04:0,a=barkSample(type,uv,.8,zone),b=barkSample(type,uv,.8,zone);
  assert.deepEqual(a,b);assert(Object.values(a).every(Number.isFinite));assert(a.roughness>=.45&&a.roughness<=.95);signatures.push(a.height);
 }
 assert(Math.max(...signatures)-Math.min(...signatures)>.0001,`${type} has no physical relief`);
 let r=buildSpecimen({type,view:'wood',woodPart:'junction',height:10,leafSize:SPECIES[type].length,maturity:.7,seed:2847,barkPosition:.44},{preview:false});
 assert.equal(r.stats.leaves,0);assert.equal(r.stats.wood.rootFlares,1);assert.equal(r.stats.wood.collars,1);assert(r.vertices.every(Number.isFinite));assert(r.vertices.length/14>10000);assert(r.inspectFocus.every(Number.isFinite));
 console.log(`${type}: deterministic relief, wood junction geometry and finite physical coordinates passed`);
}
let vertices=[],mesh={v(p,n,c,kind,phase,flutter,uv){vertices.push({p,n,uv})},preview:[]};
woodTube(mesh,[[0,0,0],[0,1,0]],.1,.07,'oak',{preview:false});
let start=vertices.find(v=>v.uv[1]===0&&Math.abs(v.uv[0])<1e-8),end=vertices.find(v=>v.uv[1]===0&&v.uv[0]>.62);assert(start&&end);assert.deepEqual(start.p,end.p,'Geometric circumference seam must close exactly');
assert(barkSample('pine',[.012,.031],.8,.06).roughness<barkSample('pine',[.012,.031],.8,0).roughness);
console.log('Taper endpoints, closed circumference and pine upper/basal material distinction passed');
