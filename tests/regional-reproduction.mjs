import assert from 'node:assert/strict';
import {REGIONAL_SPECIES,REGIONAL_PRESETS} from '../dist/regional-species.mjs';
import {REGIONAL_REPRODUCTION} from '../dist/regional-reproduction.mjs';
import {buildSpecimen,FLOWER_NOTES,FRUIT_NOTES} from '../dist/botany.mjs';
import {buildFlowers} from '../dist/flowers.mjs';
import {buildFruit} from '../dist/fruit.mjs';
function collector(){return{count:0,hash:0,min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity],kinds:new Set(),preview:{push(){}},v(p,n,c,k,phase,flutter,uv){assert([...p,...n,...c,k,phase,flutter,...uv].every(Number.isFinite));this.count++;this.hash=(this.hash+Math.round((p[0]+p[1]*3+p[2]*7+k)*1e7))%2147483647;this.kinds.add(k);for(let i=0;i<3;i++){this.min[i]=Math.min(this.min[i],p[i]);this.max[i]=Math.max(this.max[i],p[i]);}}};}
const defaults={height:8,spread:1,levels:2,shoots:0,maturity:.65,density:8,rootSpread:1,rootDepth:1,rootBranching:1,fineRoots:false,seed:2847,season:'summer',leafSize:.08,view:'tree',reproductive:true,fruitStage:'mature',flowerLayout:'single',flowerStage:'open',flowerSex:'male',springProgress:.35,shootStage:'set'};
for(const [type,p] of Object.entries(REGIONAL_REPRODUCTION)){
 const cfg={...defaults,...REGIONAL_PRESETS[type],type},flowerMesh=collector(),flower=buildFlowers(flowerMesh,cfg,{study:true}),repeat=collector();
 const repeated=buildFlowers(repeat,cfg,{study:true});assert.deepEqual(repeated,flower);assert.equal(flowerMesh.hash,repeat.hash);assert.equal(flowerMesh.count,repeat.count);assert(flower.flowers>0);assert(flowerMesh.count>0);assert(FLOWER_NOTES[type]&&FRUIT_NOTES[type]);assert(flower.focus.every(Number.isFinite));
 if(p.sexed){const m=collector(),f=buildFlowers(m,{...cfg,flowerSex:'female'},{study:true});assert.equal(f.stamens,0);assert(f.styles>0);assert.notEqual(m.hash,flowerMesh.hash);}
 for(const stage of ['developing','mature','released']){const m=collector(),f=buildFruit(m,cfg,{stage});assert(m.count>0);assert.equal(f.form,p.fruitForm);assert.equal(f.length,p.fruitLength*(stage==='developing'?.62:1));assert.equal(f.opening,stage==='released'&&p.release?1:0);if(!p.release)assert.equal(f.indehiscent,true);assert(f.focus.every(Number.isFinite));}
 const fruit=buildSpecimen({...cfg,view:'fruit'},{preview:false,detail:'far'});assert.equal(fruit.stats.fruits,1);assert.equal(fruit.stats.fruitDetails[0].form,p.fruitForm);assert(fruit.vertices.every(Number.isFinite));assert(fruit.bounds.max[1]-fruit.bounds.min[1]<REGIONAL_SPECIES[type].fruitStudySpan);
 console.log(type+': seeded flowers, sexual anatomy, three fruit stages and detached fruit study');
}
// Check the actual full-detail anatomy of every morphological builder.
const forms=new Map();for(const [id,p]of Object.entries(REGIONAL_REPRODUCTION))if(!forms.has(p.flowerForm))forms.set(p.flowerForm,id);
for(const [form,type]of forms){const cfg={...defaults,...REGIONAL_PRESETS[type],type,view:'flower'},m=collector(),f=buildFlowers(m,cfg,{fine:true,maximum:true,study:true});assert(m.count>0);assert(f.maximumDetail);assert(f.focus.every(Number.isFinite));if(f.stamens)assert(f.pollenGrains>0);if(f.petals)assert(m.kinds.has(.306)&&m.kinds.has(.307));console.log(form+': finite maximum-detail reproductive tissues');}
// Full-tree and retained geometry use the same builders and seasonal toggles.
for(const type of ['fagus-sylvatica','salix-polaris','ficus-sycomorus','vachellia-tortilis','rhizophora-racemosa','cassia-fistula']){
 const cfg={...defaults,...REGIONAL_PRESETS[type],type,density:8};
 const spring=buildSpecimen({...cfg,season:'spring'},{preview:false,detail:'far'}),summer=buildSpecimen({...cfg,season:'summer'},{preview:false,detail:'far',retainParts:true}),off=buildSpecimen({...cfg,season:'summer',reproductive:false},{preview:false,detail:'far'});
 assert(spring.stats.flowers>0,type+' attached flowers');assert(summer.stats.fruits>0,type+' attached fruit');assert.equal(off.stats.fruits,0);assert.equal(off.stats.flowers,0);assert(summer.detailParts?.parts.length);
 console.log(type+': seasonal attached flowers/fruit and reproductive toggle');
}
