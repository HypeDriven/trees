import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
const cfg={type:'pine',view:'fruit',height:10,maturity:.65,seed:2847,leafSize:.06,fruitStage:'mature',coneOpening:0,reproductive:true};
const generate=changes=>buildSpecimen({...cfg,...changes},{preview:false});
const span=(r,kind,k)=>{let min=Infinity,max=-Infinity;for(let i=0;i<r.vertices.length;i+=14)if(Math.abs(r.vertices[i+9]-kind)<.001){min=Math.min(min,r.vertices[i+k]);max=Math.max(max,r.vertices[i+k]);}return max-min;};
let closed=generate({}),cone=closed.stats.fruitDetails[0];
assert.equal(closed.stats.fruits,1);assert.equal(closed.stats.leaves,0);assert.equal(cone.scales,88);assert(cone.length>=.0254&&cone.length<=.065);assert(cone.stalkLength>=.004&&cone.stalkLength<=.008);
assert(cone.scaleRecords.every(s=>s.thickness>.0003&&s.keel>0&&s.umbo>0&&!s.spine));
for(let i=1;i<cone.scaleRecords.length;i++)assert(Math.abs(cone.scaleRecords[i].azimuth-cone.scaleRecords[i-1].azimuth-Math.PI*(3-Math.sqrt(5)))<1e-10,'Cone scales must spiral rather than form a painted grid');
const phases=new Set();let scaleVertices=0;for(let i=0;i<closed.vertices.length;i+=14)if(Math.abs(closed.vertices[i+9]-.32)<.001){scaleVertices++;phases.add(closed.vertices[i+10].toFixed(4));assert(Math.abs(closed.vertices[i+12])<.1&&Math.abs(closed.vertices[i+13])<.1,'Fruit UVs should be physical metres');}
assert(scaleVertices>200000);assert(phases.size>=88,'Individual scales need independent micrograin');assert(closed.inspectFocus.every(Number.isFinite));
const open=generate({coneOpening:1});assert(span(open,.32,0)>span(closed,.32,0)*1.12,'Opening must move physical scale geometry outward');
const released=generate({fruitStage:'released'});assert(released.stats.fruitDetails[0].seedPairs>0);assert.equal(released.stats.fruitDetails[0].wingedSeeds,released.stats.fruitDetails[0].seedPairs*2);
const young=generate({fruitStage:'developing',coneOpening:1});assert(young.stats.fruitDetails[0].length<cone.length*.7);assert.equal(young.stats.fruitDetails[0].opening,0);
assert.deepEqual(closed.vertices,generate({}).vertices,'Cone geometry must reproduce from the recipe seed');
closed=null;
for(const type of Object.keys(SPECIES).filter(type=>SPECIES[type].reproductiveModel!==false)){
 const r=generate({type,leafSize:SPECIES[type].length,fruitStage:type==='willow'?'released':'mature'}),f=r.stats.fruitDetails[0];assert(r.vertices.every(Number.isFinite));assert(r.stats.fruits>0);assert(r.bounds.max[1]-r.bounds.min[1]<(SPECIES[type].fruitStudySpan??.16),'Fruit study must stay at natural scale');
 if(type==='oak'){assert(f.cupCoverage>=.25&&f.cupCoverage<=1/3);assert(f.scales>=80);}
 if(type==='willow'){assert(f.capsules>=30);assert(f.silkyHairs>=300);assert.equal(f.seeds,f.capsules);}
 if(type==='birch'){assert(f.bracts>=60);assert(f.wingedSeeds>0);const release=generate({type,fruitStage:'released'});assert(release.stats.fruitDetails[0].bracts<f.bracts,'Released birch catkins should partially disintegrate');}
 const reference=generate({type,reproductive:false});assert.equal(reference.stats.fruits,1,'Detached fruit study must remain inspectable with seasonal reproduction off');
 console.log(type+': finite natural-scale fruit, attachment, separate structures and stage anatomy passed');
}
console.log('Separate spiral cone scales, opening geometry, scale relief, paired seeds and deterministic export geometry passed');
