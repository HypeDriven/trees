import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {EAST_ASIAN_PRESETS} from '../dist/east-asia.mjs';
const cfg=(type,view,extra={})=>({...EAST_ASIAN_PRESETS[type],type,view,seed:2847,levels:2,shoots:2,maturity:.65,reproductive:true,rootBranching:1,fineRoots:false,...extra});
const build=(type,view,extra)=>buildSpecimen(cfg(type,view,extra),{preview:false});
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
function covers(mesh,point){
 const a=mesh.vertices;for(let i=0;i<a.length;i+=42){if(Math.abs(a[i+9]-1)>.0001)continue;const p=[0,1,2].map(k=>[(a[i+k*14+12]-.5)*1.2,a[i+k*14+13]]),d=p.map((v,k)=>cross(v,p[(k+1)%3],point));if(d.every(v=>v>=-1e-7)||d.every(v=>v<=1e-7))return true;}return false;
}
// Probe the actual triangles, so a correct outline function cannot hide a
// fan which bridges the concave sinuses or a stale renderer silhouette.
const maple=build('maple','leaf');
for(const p of [[0,.94],[.52,.65],[-.52,.65],[.34,.105],[-.34,.105]])assert(covers(maple,p),'A maple lobe is missing');
for(const p of [[.265,.585],[-.265,.585],[.31,.27],[-.31,.27]])assert(!covers(maple,p),'Triangles bridge a maple sinus');
assert.equal(maple.stats.leafAnatomy[0].primaryVeins.length,5);
const cherryLeaf=build('sakura','leaf');assert.equal(cherryLeaf.stats.leafGlands,2);assert(cherryLeaf.stats.leafHairs>=40);
const early=build('sakura','tree',{season:'spring',springProgress:0}),overlap=build('sakura','tree',{season:'spring',springProgress:.78}),late=build('sakura','tree',{season:'spring',springProgress:1});
assert.equal(early.stats.leaves,0);assert(early.stats.flowers>overlap.stats.flowers);
assert(overlap.stats.leaves>1000&&overlap.stats.flowers>0,'The default sakura must show both leaves and remaining blossom');
assert(late.stats.leaves>0&&late.stats.flowers===0);assert(overlap.stats.organGrowth.some(o=>o.expansion<.5));
assert(build('redbud','tree').stats.leaves>0,'The redbud preset must open with its characteristic leaves visible');
const spur=build('ginkgo','shoot');assert(spur.stats.spurs.every(s=>s.length>=.008&&s.length<=.018&&s.leaves===3));
const dawn=build('dawnredwood','shoot');assert(dawn.bounds.max[1]-dawn.bounds.min[1]<.10,'Dawn-redwood shoot study must be a short seasonal branchlet');assert.equal(dawn.stats.leaves,36);
const cone=build('dawnredwood','fruit').stats.fruitDetails[0];assert.equal(cone.scaleRecords.length,24);
for(let i=0;i<24;i+=2){const a=cone.scaleRecords[i],b=cone.scaleRecords[i+1];assert.equal(a.pair,b.pair);assert(Math.abs(b.azimuth-a.azimuth-Math.PI)<1e-8);if(i)assert(Math.abs(a.azimuth-cone.scaleRecords[i-2].azimuth)===Math.PI/2);}
const needles=build('chinesepine','leaf');assert.equal(needles.stats.leaves,2);assert(needles.stats.leafAnatomy.every(n=>n.crossSection==='semicircular'&&n.width>=.001&&n.width<=.0015));
const pine=build('chinesepine','tree',{levels:3});assert(pine.stats.pineCards>0&&pine.stats.retainedShoots>0);assert.equal(pine.stats.leaves,pine.stats.fascicles*2);
for(const type of Object.keys(EAST_ASIAN_PRESETS)){
 const r=build(type,'leaf');assert(r.vertices.every(Number.isFinite));assert(r.stats.leafLengths.every(l=>l>=SPECIES[type].leaf[0]&&l<=SPECIES[type].leaf[1]));
}
console.log('Actual five-lobed maple mesh, sakura leaf-out/glands, short shoots, decussate cone pairs and solid paired needles passed');
