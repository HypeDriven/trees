import assert from 'node:assert/strict';
import {buildSpecimen} from '../dist/botany.mjs';
import {EAST_ASIAN_PRESETS} from '../dist/east-asia.mjs';
const cfg=(type,extra={})=>({...EAST_ASIAN_PRESETS[type],type,view:'flower',flowerLayout:'single',flowerStage:'open',flowerSex:'male',seed:2847,maturity:.65,rootBranching:1,reproductive:true,...extra});
const build=(type,extra)=>buildSpecimen(cfg(type,extra),{preview:false});
for(const type of Object.keys(EAST_ASIAN_PRESETS)){
 const a=build(type),b=build(type);assert.deepEqual(a.vertices,b.vertices);assert(a.vertices.every(Number.isFinite));assert(a.vertices.byteLength<24*1024*1024);
 const f=a.stats.flowerStudy;assert(f.focus.every(Number.isFinite)&&f.surfaceFocus.every(Number.isFinite));assert(f.length>0&&f.length<.04);
 for(let i=3;i<a.vertices.length;i+=14){const n=Math.hypot(...a.vertices.slice(i,i+3));assert(n>.97&&n<1.03,'Flower geometry has an invalid lighting normal');}
 const cluster=build(type,{flowerLayout:'cluster'});assert(cluster.vertices.every(Number.isFinite));assert(cluster.vertices.byteLength<32*1024*1024);
 console.log(type+': reproducible, natural-scale single/cluster anatomy and finite smooth normals passed');
}
const cherry=build('sakura'),f=cherry.stats.flowerStudy;
assert.equal(f.flowers,1);assert.equal(f.petals,5);assert.equal(f.sepals,5);assert.equal(f.stamens,32);assert.equal(f.anthers,32);assert.equal(f.thecae,64);assert.equal(f.styles,1);assert.equal(f.stigmas,1);assert(f.hairs>=200&&f.pollenGrains>=300);
assert(f.pedicelLengths.every(l=>l>=.020-1e-9&&l<=.025+1e-9));assert(f.flowerRecords.every(r=>r.hypanthiumLength===.0075));
// Inspect the actual petal surface UVs. A squared-off tip, a printed notch,
// or a flat single-sided card cannot satisfy these checks.
const a=cherry.vertices,petalPhase=f.petalRecords[0].index*.731+cfg('sakura').seed*.013;
const points=[],edges=new Map(),key=p=>p.map(x=>Math.round(x*1e8)).join(',');let front=0,back=0;
for(let i=0;i<a.length;i+=42){if(Math.abs(a[i+10]-petalPhase)>.0001||a[i+9]<.3055||a[i+9]>.3075)continue;const p=[0,1,2].map(k=>[...a.slice(i+k*14,i+k*14+3)]);for(let j=0;j<3;j++){const k=[key(p[j]),key(p[(j+1)%3])].sort().join('/');edges.set(k,(edges.get(k)??0)+1);}for(let j=0;j<3;j++){const at=i+j*14;if(a[at+9]<.3065){front++;points.push([a[at+12],a[at+13],a[at+2]]);}else back++;}}
assert(front>3000&&back>3000);assert([...edges.values()].every(n=>n===2),'The petal edge is not joined to both blade surfaces');
const W=f.petalRecords[0].width*.5,near=x=>Math.abs(x)<W*.008;
const middle=Math.max(...points.filter(p=>near(p[0])).map(p=>p[1])),shoulder=Math.max(...points.filter(p=>Math.abs(p[0])>W*.18&&Math.abs(p[0])<W*.35).map(p=>p[1]));
assert(shoulder>middle+.0002,'The cherry notch must be part of the mesh contour');
assert(Math.max(...points.map(p=>p[2]))-Math.min(...points.map(p=>p[2]))>.001,'Petals need real curvature');
const bud=build('sakura',{flowerStage:'bud'}),late=build('sakura',{flowerStage:'late'});assert.notDeepEqual(bud.vertices,cherry.vertices);assert.notDeepEqual(late.vertices,cherry.vertices);
const width=m=>{let lo=Infinity,hi=-Infinity;for(let i=0;i<m.vertices.length;i+=14)if(m.vertices[i+9]>.3055&&m.vertices[i+9]<.3075){lo=Math.min(lo,m.vertices[i]);hi=Math.max(hi,m.vertices[i]);}return hi-lo;};assert(width(bud)<width(cherry)*.65,'A bud must fold its petals around the center');
const male=build('maple').stats.flowerStudy,female=build('maple',{flowerSex:'female'}).stats.flowerStudy;assert(male.apetalous&&male.petals===0&&male.stamens===8);assert(female.styles===2&&female.staminodes===8&&female.stamens===0);
const redbud=build('redbud').stats.flowerStudy;assert(redbud.standardInside&&redbud.standardSmallest&&redbud.petals===5&&redbud.stamens===10);
const sweet=build('sweetgum',{flowerSex:'female'}).stats.flowerStudy;assert(sweet.femaleHead&&sweet.flowers===30&&sweet.styles===60&&sweet.staminodes===150&&sweet.petals===0);
const sweetMale=build('sweetgum',{flowerSex:'male'}).stats.flowerStudy;assert(sweetMale.maleSpikes===1&&sweetMale.stamens>0&&sweetMale.styles===0);
for(const type of ['dawnredwood','chinesepine']){const c=build(type).stats.flowerStudy;assert.equal(c.flowers,0);assert.equal(c.petals,0);assert(c.spiralMicrosporophylls);assert.equal(c.pollenSacs,c.microsporophylls*(type==='dawnredwood'?3:2));if(type==='dawnredwood')assert.equal(c.basalScales,8);}
const ovules=build('ginkgo').stats.flowerStudy;assert(ovules.ovules===2&&ovules.collars===2&&ovules.micropyles===2&&ovules.pollinationDrops===2);assert(ovules.flowers===0&&ovules.styles===0&&ovules.petals===0);
console.log('Closed, curved notched petals, complete Yoshino center, flowering stages, sexual forms and separate gymnosperm structures passed');
