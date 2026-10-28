import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES,bladeWidth} from '../dist/botany.mjs';
import {EAST_ASIAN_PRESETS} from '../dist/east-asia.mjs';
import {buildTreeArchitecture} from '../dist/architecture.mjs';
const cfg=(type,view,changes={})=>({...EAST_ASIAN_PRESETS[type],type,view,seed:2847,levels:3,shoots:3,maturity:.65,reproductive:true,rootBranching:2,season:'summer',...changes});
const build=(type,view,changes={})=>buildSpecimen(cfg(type,view,changes),{preview:false});
for(const type of Object.keys(EAST_ASIAN_PRESETS)){
 const r=build(type,'leaf');assert(r.vertices.every(Number.isFinite));assert.deepEqual(r.vertices,build(type,'leaf').vertices);
 const fruit=build(type,'fruit');assert(fruit.inspectFocus.every(Number.isFinite));for(const f of fruit.stats.fruitDetails)for(const v of Object.values(f))if(typeof v==='number')assert(Number.isFinite(v));
 const winter=build(type,'shoot',{season:'winter'});assert.equal(winter.stats.leaves>0,!!SPECIES[type].evergreen);
 const a=buildTreeArchitecture(cfg(type,'tree'));assert.equal(a.stats.profile,type);assert(a.stats.apicalContinuations>0);
 console.log(type+': reproducible natural-scale anatomy, winter habit and distinct architecture passed');
}
const maple=build('maple','shoot');assert.equal(maple.stats.leaves,maple.stats.oppositePairs.length*2);assert(bladeWidth('maple',.53)>bladeWidth('maple',.68)*2);
const samara=build('maple','fruit').stats.fruitDetails[0];assert.equal(samara.samaras,2);assert.equal(samara.wingedSeeds,2);assert(samara.length>=.025&&samara.length<=.030);
const sakura=build('sakura','shoot',{season:'spring'}).stats.flowerDetails[0];assert.equal(sakura.petals,sakura.flowers*5);assert.equal(sakura.stamens,sakura.flowers*25);assert(sakura.notchedPetals);assert.equal(build('sakura','shoot').stats.flowers,0);
const fan=build('ginkgo','leaf'),petiole=(SPECIES.ginkgo.petiole[0]+SPECIES.ginkgo.petiole[1])*.5,edge=[];
for(let i=0;i<fan.vertices.length;i+=14)if(fan.vertices[i+9]===1&&fan.vertices[i+13]===1){const uv=fan.vertices[i+12],radius=Math.hypot(fan.vertices[i],fan.vertices[i+1]-petiole,fan.vertices[i+2]);edge.push({uv,radius});}
assert(Math.max(...edge.filter(v=>Math.abs(v.uv-.5)<.001).map(v=>v.radius))<Math.min(...edge.filter(v=>v.uv>.35&&v.uv<.45).map(v=>v.radius))*.94,'The fan needs a real central notch');
const ovules=build('ginkgo','shoot',{season:'spring'});assert.equal(ovules.stats.flowers,0);assert(ovules.stats.flowerDetails[0].ovules===2);assert(build('ginkgo','shoot').stats.spurs.every(s=>s.leaves===3));assert.equal(build('ginkgo','fruit').stats.fruitDetails[0].fleshySeeds,1);
const spray=build('dawnredwood','shoot');assert.equal(spray.stats.leaves,spray.stats.oppositePairs.length*2);assert(new Set(spray.stats.oppositePairs.map(p=>p.axis)).size===1,'Redwood blades must be two-ranked');
const bare=build('dawnredwood','tree',{season:'winter'});assert.equal(bare.stats.leaves,0);assert(bare.stats.deciduousSprays>0);
const cone=build('dawnredwood','fruit').stats.fruitDetails[0];assert(cone.oppositeDecussate&&cone.scales===24);
const pine=build('chinesepine','shoot');assert(pine.stats.fascicleSizes.every(n=>n===2));const pc=build('chinesepine','fruit').stats.fruitDetails[0];assert(pc.length>=.045&&pc.length<=.085);assert(pc.scaleRecords.every(s=>s.spine));
assert(bladeWidth('sweetgum',.42)>bladeWidth('sweetgum',.60)*2);const ball=build('sweetgum','fruit').stats.fruitDetails[0];assert(ball.capsules===36&&ball.persistentStyles===72);
const buds=build('redbud','tree',{season:'spring'});assert(buds.stats.flowers>0,'Redbud flowers must reach older woody axes');const pod=build('redbud','fruit',{fruitStage:'released'}).stats.fruitDetails[0];assert(pod.valves===2&&pod.seeds>0);
console.log('Maple samaras, five-petal sakura, fan leaves/ovules, deciduous redwood sprays, pine fascicles, capsule heads and cauliflorous redbud passed');
