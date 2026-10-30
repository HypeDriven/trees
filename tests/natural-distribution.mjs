import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {organDirection,blossomDevelopment} from '../dist/organ-distribution.mjs';
import {fascicleParameters,needleRelief,NEEDLE_ARC} from '../dist/needle-anatomy.mjs';
import {pineNeedleLayout,pineSprayCoverage} from '../dist/compound-lod.mjs';
const cfg=(type,view,extra={})=>({type,view,height:10,spread:1,leafSize:SPECIES[type].length,levels:2,density:68,shoots:2,maturity:.7,season:'spring',springProgress:.12,reproductive:true,seed:2847,rootBranching:1,fineRoots:false,surfacePosition:.55,shootStage:'extending',...extra});
const sakura=buildSpecimen(cfg('sakura','tree'),{preview:false}),flowers=sakura.stats.flowerDetails.flatMap(f=>f.flowerRecords),mean=flowers.reduce((s,f)=>s.map((v,i)=>v+f.axis[i]/flowers.length),[0,0,0]),bins=new Set(flowers.map(f=>Math.floor((Math.atan2(f.axis[2],f.axis[0])+Math.PI)/(Math.PI/4))));
assert(flowers.length>3000);assert(bins.size>=8);assert(Math.hypot(...mean)<.45,'The whole tree has a dominant global blossom facing');
for(let axis=0;axis<3;axis++)assert(flowers.some(f=>f.axis[axis]>.45)&&flowers.some(f=>f.axis[axis]<-.45),'Missing blossom orientations');
assert(flowers.filter(f=>f.opening<.3).length>flowers.length*.04);assert(flowers.filter(f=>f.opening>.85).length>flowers.length*.35);assert(flowers.filter(f=>f.opening>.3&&f.opening<.8).length>flowers.length*.08);
assert(new Set(flowers.map(f=>Math.round(f.roll*10))).size>50,'Petal rosettes all have the same rotation');assert(sakura.stats.flowerDetails.some(f=>f.flowerRecords.some((a,i)=>f.flowerRecords.some((b,j)=>i!==j&&a.axis.reduce((s,v,k)=>s+v*b.axis[k],0)<.2))),'Siblings only differ by a few degrees');
const stages=flowers.reduce((s,f)=>(s[f.stage]=(s[f.stage]??0)+1,s),{});console.log('Whole sakura canopy:',flowers.length,'blooms, eight azimuth sectors, varied opening and petal rotation',stages);
for(const type of Object.keys(SPECIES)){
 const a=Array.from({length:48},(_,i)=>organDirection(type,[.2,.7,.1],[Math.cos(i)*2,3,Math.sin(i)*2],2847+i));assert(a.every(v=>Math.abs(Math.hypot(...v)-1)<1e-8));assert(new Set(a.map(v=>v.map(q=>q.toFixed(2)).join(','))).size>40);
 if(['maple','dawnredwood','baobab','sausagetree'].includes(type))assert(a.every(v=>v[1]<-.85),'Pendant organs turned upright');
}
for(const type of['pine','chinesepine']){
 const shoot=buildSpecimen(cfg(type,'shoot',{reproductive:false}),{preview:false}),pairs=shoot.stats.needleFascicles;
 assert(pairs.length>20);const widths=pairs.map(p=>p.width),curves=pairs.map(p=>p.needles[0].curve);
 assert(Math.max(...widths)/Math.min(...widths)>1.12);assert(Math.max(...curves)-Math.min(...curves)>.045);
 for(const p of pairs){const [a,b]=p.needles;assert(a.flatNormal.reduce((s,v,i)=>s+v*b.flatNormal[i],0)<-.94,'Both D-shaped needles have the same inward flat face');assert(Math.abs(a.length/b.length-1)<.04);assert(Math.abs(a.width/b.width-1)<.04);assert(a.crossSectionSamples>=24&&a.longitudinalRows>=96);assert(p.sheathLength>=(type==='chinesepine'?.0065:.00195));}
 const surface=buildSpecimen(cfg(type,'surface',{reproductive:false}),{preview:false}),detail=surface.stats.needleStudy;assert(detail.geometricStomata);assert(detail.convexRows>=6&&detail.flatRows>=5);assert(detail.longitudinalRows>400&&detail.crossSectionSamples>80);assert(surface.vertices.byteLength>24*1024*1024&&surface.vertices.byteLength<72*1024*1024);assert(surface.stats.leafAnatomy.length===2&&surface.stats.leafAnatomy.every(n=>n.geometricStomata),'Both needles must have maximum surface anatomy');assert(surface.vertices.every(Number.isFinite));
 console.log(type+': opposing D-sections, correlated dimensions, curved varied needles, real microgeometry on both stomatal faces passed');
}
const p=fascicleParameters('chinesepine',2847,1),u=NEEDLE_ARC*(3.5/p.convexRows),values=Array.from({length:200},(_,i)=>needleRelief(u,.05+i*.000002,p.width,p).height);assert(Math.min(...values)<-.000009&&Math.max(...values)>0,'Stomata are colour dots instead of sunken pits and rims');
const patterns=new Set();for(let v=0;v<8;v++){const layout=pineNeedleLayout(v);assert.equal(layout.length,24);assert(new Set(layout.map(n=>(n.b[1]-n.a[1]).toFixed(3))).size>12);let signature='';for(let y=0;y<120;y++)for(let x=0;x<100;x++)signature+=pineSprayCoverage((x+.5)/100,(y+.5)/120,v);patterns.add(signature);}assert.equal(patterns.size,8);
const tree=buildSpecimen(cfg('chinesepine','tree',{season:'summer',reproductive:false}),{preview:false});assert.equal(new Set(tree.stats.pineVariants).size,8);assert.equal(tree.stats.leaves,tree.stats.fascicles*2);
console.log('Eight coherent pine cohort layouts are present in the whole tree; needle dimensions and curvature vary within the silhouette masks');
