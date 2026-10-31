import assert from 'node:assert/strict';
import {REGIONS,REGIONAL_SPECIES,REGIONAL_PRESETS} from '../dist/regional-species.mjs';
import {SPECIES,buildSpecimen} from '../dist/botany.mjs';
import {ROOT_PROFILES} from '../dist/roots.mjs';
import {LEAF_ANATOMY} from '../dist/leaf-anatomy.mjs';
import {WOOD_NOTES} from '../dist/wood.mjs';
const defaults={levels:2,shoots:1,maturity:.65,rootSpread:1,rootBranching:1,fineRoots:false,seed:2847,season:'summer',view:'leaf',density:15,wind:0,gust:0,direction:55,rootDepth:1,fruitStage:'mature',shootStage:'set',springProgress:.78};
assert.equal(REGIONS.length,25);
assert.equal(Object.keys(REGIONAL_SPECIES).length,125);
assert.equal(new Set(Object.values(REGIONAL_SPECIES).map(s=>s.latin)).size,125);
for(const region of REGIONS){
 assert.equal(region.species.length,5);
 for(const {id} of region.species){
  const sp=SPECIES[id],p=REGIONAL_PRESETS[id];
  assert.equal(sp.regionId,region.id);
  assert(p.height>=sp.heightRange[0]&&p.height<=sp.heightRange[1]);
  assert(p.leafSize>=sp.leaf[0]&&p.leafSize<=sp.leaf[1]);
  assert(ROOT_PROFILES[id]&&LEAF_ANATOMY[id]&&WOOD_NOTES[id]);
  for(const view of ['leaf','tree','roots','bark']){
   const result=buildSpecimen({...defaults,...p,density:15,type:id,view,reproductive:true},{preview:false,detail:'far'});
   assert(result.vertices.length>0,`${id} ${view} has geometry`);
   assert(result.vertices.every(Number.isFinite),`${id} ${view} is finite`);
   if(view==='tree')assert(result.stats.fruits>0,`${id}: attached summer fruit`);
  }
 }
 console.log(`${region.id}. ${region.name}: five presets render`);
}
