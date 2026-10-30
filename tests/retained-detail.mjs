import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {visibleRanges,composeGeometry,sortedExclusions,RetainedRefiner} from '../dist/retained-detail.mjs';

assert.deepEqual(visibleRanges(30,[{start:3,count:6},{start:18,count:9}]),[{start:0,count:3},{start:9,count:9},{start:27,count:3}]);
assert.deepEqual(visibleRanges(12,[{start:3,count:6},{start:18,count:9}],12),[{start:0,count:6}]);
const base=new Float32Array(42*10).map((_,i)=>i),patch={start:6,count:6,vertices:new Float32Array(42).fill(-1)},composed=composeGeometry(base,[patch]);assert.deepEqual(composed.slice(0,84),base.slice(0,84));assert(composed.slice(84,126).every(x=>x===-1));assert.deepEqual(composed.slice(126),base.slice(168));

// Continuous zoom used to invalidate each entire-tree worker result. A local
// part remains useful when the camera moves, and missing pollen takes priority
// over repeatedly rebuilding already fine bark.
const parts=[{id:0,kind:'wood',start:0,count:3,min:[-.02,-.02,0],max:[.02,.02,.04],sensitive:true},{id:1,kind:'foliage',start:3,count:3,min:[-.02,-.02,0],max:[.02,.02,.04],sensitive:false}],pending=[],applied=[];
const refiner=new RetainedRefiner(parts,{build:(part,region)=>new Promise(resolve=>pending.push({part,region,resolve})),apply:(chunks,state)=>applied.push({chunks,state})});
const region=x=>({center:[x,0,.05],camera:[x,0,.05],radius:.16,forward:[0,0,-1],cone:.7});refiner.update(region(0));assert.equal(pending[0].part.id,0);refiner.update(region(.009));pending[0].resolve({...parts[0],vertices:new Float32Array(42)});await new Promise(r=>setImmediate(r));assert.equal(pending[1].part.id,1,'Missing flower anatomy must not starve behind moving bark focus');refiner.update(region(.018));pending[1].resolve({...parts[1],vertices:new Float32Array(42),pollen:320});await new Promise(r=>setImmediate(r));assert(applied.some(a=>a.chunks.some(p=>p.pollen===320)),'Camera movement discarded useful pollen');refiner.stop();

const cfg=type=>({type,view:'tree',height:type==='monkeytail'?1.1:10,spread:1,leafSize:SPECIES[type].length,seed:2847,levels:2,shoots:0,density:8,season:'summer',maturity:.65,reproductive:false,rootBranching:1,fineRoots:false,rootDepth:1.5,rootSpread:1,shootStage:'extending',wind:0});
for(const type of Object.keys(SPECIES)){
 const c=cfg(type),plain=buildSpecimen(c,{preview:false,detail:'far',omitBuried:true}),retained=buildSpecimen(c,{preview:false,detail:'far',omitBuried:true,retainParts:true});assert.deepEqual(retained.vertices,plain.vertices,`${type}: retaining recipes changed the base specimen`);
 const organ=retained.stats.organGrowth.find(o=>o.base)??retained.stats.rosettes[0]?.leafRecords[0],base=organ.base,axis=organ.axis??[0,1,0],center=base.map((v,k)=>v+axis[k]*c.leafSize*.45),region={center,radius:.055,height:800},selected=retained.detailParts.select(region),part=selected.find(p=>p.kind==='foliage');assert(part,`${type}: nearby foliage has no retained recipe`);
 const lengths=[...retained.stats.leafLengths],counts=retained.stats.leaves;let chunk;for(const candidate of selected.filter(p=>p.kind==='foliage')){chunk=candidate.build(region);if(chunk.inspection.leaves>0)break;}assert(chunk.vertices.every(Number.isFinite));assert(chunk.inspection.leaves>0,`${type}: a retained shoot kept coarse foliage`);assert.deepEqual(retained.stats.leafLengths,lengths);assert.equal(retained.stats.leaves,counts);assert.deepEqual(retained.rootSystem.segments,plain.rootSystem.segments);
 if(['pine','chinesepine'].includes(type))assert(chunk.leafAnatomy.some(n=>n.geometricStomata));
 else assert(chunk.leafAnatomy.some(n=>n.rows===96||n.subdivisions===4));
 assert(sortedExclusions([chunk])[0].count>0);console.log(type+': retained base is identical; local anatomy replays without changing growth');
}
