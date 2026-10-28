import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES,bladeWidth} from '../dist/botany.mjs';
const defaults={height:10,spread:1,levels:3,density:28,seed:2847,season:'summer',maturity:.65,reproductive:true,view:'shoot',surfacePosition:.55};
for(const [type,species] of Object.entries(SPECIES)){
 const cfg={...defaults,type,leafSize:species.length},pineLike=type==='pine'||!!species.needles;
 const a=buildSpecimen(cfg),b=buildSpecimen(cfg);
 assert.deepEqual(a.vertices,b.vertices,`${type} must be reproducible`);
 assert(a.vertices.every(Number.isFinite),`${type} has nonfinite vertices`);
 assert(a.stats.leafLengths.every(l=>l>=species.leaf[0]*.27&&l<=species.leaf[1]));
 assert(a.stats.petioleLengths.every(l=>l>=species.petiole[0]*.55&&l<=species.petiole[1]));
 const winter=buildSpecimen({...cfg,season:'winter'});
 if(pineLike){
  assert(winter.stats.leaves>0,'Scots pine must retain winter foliage');
  assert(a.stats.fascicleSizes.every(n=>n===2));
  assert.equal(a.stats.leaves,a.stats.fascicles*2);
 }else if(species.evergreen)assert(winter.stats.leaves>0,`${type} must retain evergreen foliage`);else assert.equal(winter.stats.leaves,0,`${type} should lose winter leaves`);
 if(type==='willow')assert.equal(a.stats.terminalBuds,0,'Willow lacks a true terminal bud');
 if(type==='oak')assert(a.stats.terminalBuds>=4,'Oak needs clustered terminal buds');
 const still=buildSpecimen({...cfg,reproductive:false});assert.equal(still.stats.flowers,0);assert.equal(still.stats.fruits,0);
 const leaf=buildSpecimen({...cfg,view:'surface'});
 assert(leaf.inspectFocus||pineLike);
 if(!pineLike){
  let upper=0,lower=0;for(let i=9;i<leaf.vertices.length;i+=14){if(leaf.vertices[i]===1)upper++;if(Math.abs(leaf.vertices[i]-1.02)<.001)lower++}
  assert(upper>0&&lower>0,'Finite blade needs separate upper and lower faces');
  assert(leaf.bounds.max[1]-leaf.bounds.min[1]<(species.organStudySpan??(species.compound?.33:.18)),'Anatomy must remain at natural scale');
 }
 console.log(`${type}: seeded geometry, natural dimensions, winter behavior, and organ anatomy passed`);
}
let peaks=0,old=0,prev=0;for(let i=1;i<999;i++){let w=bladeWidth('oak',i/1000);let d=Math.sign(w-prev);if(d<0&&old>0)peaks++;old=d;prev=w}assert(peaks>=4&&peaks<=7,'Oak must have multiple rounded lobes');
