import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {buildFruit} from '../dist/fruit.mjs';
import {buildGardenFlowers} from '../dist/garden-flowers.mjs';
import {buildFlowers} from '../dist/flowers.mjs';
import {createInspectionField} from '../dist/inspection.mjs';

const selected=process.argv.slice(2),flowersOnly=selected.includes('--flowers'),include=type=>!selected.length||selected.includes(type);
const cfg=type=>({type,view:'tree',height:type==='monkeytail'?1.1:10,spread:1,leafSize:SPECIES[type].length,seed:type==='sakura'?2848:2847,levels:2,shoots:0,density:8,season:['willow','monkeytail','karee','marula'].includes(type)?'summer':'autumn',maturity:.65,reproductive:true,rootBranching:1,fineRoots:false,rootDepth:1.5,rootSpread:1,shootStage:'set',wind:0,gust:.6,direction:55});
function assertGeometry(result,record,builder,c){
 let count=0;const start=record.geometryStartVertex*14;
 const reference={preview:{push(){}},v(p,n,col,kind,phase,flutter,uv){
  const values=[...p,...n,...col,kind,phase,flutter,...uv];
  for(let k=0;k<14;k++)assert.equal(result.vertices[start+count*14+k],Math.fround(values[k]),`${c.type}: attached maximum geometry differs from the finest organ builder`);
  count++;
 }};
 const detail=builder(reference,c,{base:record.attachment,axis:record.axis,seed:record.seed,stage:record.stage,crownRadius:record.crownRadius,fine:true,layoutFine:false,maximum:true});
 assert.equal(count,record.geometryVertices,`${c.type}: a coarse organ mesh survived close-up refinement`);
 return detail;
}

// A long pendant organ may be metres from its attachment. Surface selection
// must inspect its emitted triangles, rather than a fixed attachment radius.
const field=createInspectionField({center:[0,-1.7,.001],radius:.015});
const triangle=new Float32Array(42);for(const [i,p]of[[0,[-.03,-1.8,0]],[1,[.03,-1.8,0]],[2,[0,-1.6,0]]])triangle.set(p,i*14);
assert(field.geometryNear(triangle));assert(!field.near([0,0,0],.22));

function surfaceEye(result,record,focus){let best=Infinity,eye=null;const start=record.geometryStartVertex*14,end=start+record.geometryVertices*14;focus??=Array.from(result.vertices.subarray(start+Math.floor(record.geometryVertices/6)*42,start+Math.floor(record.geometryVertices/6)*42+3));for(let i=start;i<end;i+=14){const d=Math.hypot(...focus.map((v,k)=>v-result.vertices[i+k]));if(d<best){best=d;eye=[0,1,2].map(k=>result.vertices[i+k]+result.vertices[i+3+k]*.001);}}return eye;}
for(const type of Object.keys(SPECIES).filter(t=>SPECIES[t].reproductiveModel!==false&&!flowersOnly&&include(t))){
 const c=cfg(type),base=buildSpecimen(c,{preview:false,detail:'far'}),site=base.stats.fruitDetails[0];assert(site,`${type}: test specimen has no fruit`);
 const eye=surfaceEye(base,site,site.focus);
 const close=buildSpecimen(c,{preview:false,detail:'far',inspection:{center:eye,radius:.004,height:800}}),fruit=close.stats.fruitDetails.find(d=>d.seed===site.seed);
 assert(fruit?.maximumDetail,`${type}: nearby fruit retained reduced detail`);
 const expected=assertGeometry(close,fruit,buildFruit,c);
 assert.equal(close.stats.fruits,base.stats.fruits);assert.deepEqual(close.stats.leafLengths,base.stats.leafLengths);assert.deepEqual(close.rootSystem.segments,base.rootSystem.segments);
 if(type==='pine')assert.equal(expected.scales,88);
 if(type==='chinesepine')assert.equal(expected.scales,80);
 if(type==='oak')assert.equal(expected.scales,96);
 if(type==='willow')assert.equal(expected.silkyHairs,340);
 console.log(type+': attached fruit matches every emitted maximum-detail vertex');
}

// Verify the actual petals, pollen, anthers, calyces and other reproductive
// organs, not just a fine-detail flag or a higher total tree triangle count.
for(const type of ['sakura','maple','redbud','sweetgum','ginkgo','dawnredwood','chinesepine','jacaranda','monkeytail','eucalyptus',...Object.keys(SPECIES).filter(type=>SPECIES[type].collection==='regional')].filter(include)){
 const c={...cfg(type),season:'spring'},base=buildSpecimen(c,{preview:false,detail:'far'}),site=base.stats.flowerDetails[0];assert(site);
 const record=site.flowerRecords?.[0],focus=record?.throat??site.focus,eye=surfaceEye(base,site,focus);
 const close=buildSpecimen(c,{preview:false,detail:'far',inspection:{center:eye,radius:.008,height:800}}),flower=close.stats.flowerDetails.find(d=>d.seed===site.seed);
 assert(flower?.maximumDetail,`${type}: attached reproductive anatomy was not promoted`);
 const expected=assertGeometry(close,flower,['jacaranda','monkeytail','eucalyptus'].includes(type)?buildGardenFlowers:buildFlowers,c);
 if(type==='sakura'){
  assert.equal(expected.pollenGrains,expected.flowers*320);
  const start=flower.geometryStartVertex*14,end=start+flower.geometryVertices*14;let pollen=0,petals=0;
  for(let i=start;i<end;i+=14){if(Math.abs(close.vertices[i+9]-.313)<1e-5)pollen++;if(Math.abs(close.vertices[i+9]-.306)<1e-5)petals++;}
  assert.equal(pollen,expected.pollenGrains*90);assert(petals>expected.petals*3000);
 }
 assert.equal(close.stats.flowers,base.stats.flowers);
 console.log(type+': attached floral geometry matches the maximum study profile');
}
