import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {LEAF_ANATOMY,leafSurface} from '../dist/leaf-anatomy.mjs';
import {createSoftwareStudy,studyWindPosition} from '../dist/software-study.mjs';
import {shootGrowth,leafDevelopment,shootNodePosition} from '../dist/foliage-growth.mjs';
const cfg=type=>({type,height:10,spread:1,levels:2,density:68,shoots:2,leafSize:SPECIES[type].length,seed:2847,maturity:.65,view:'shoot',season:'summer',shootStage:'extending',springProgress:.78,reproductive:false,wind:1.2,gust:.6,direction:55,surfacePosition:.55});
for(const type of Object.keys(SPECIES)){
 const c=cfg(type),sp=SPECIES[type],shoot=buildSpecimen(c,{preview:false}),growth=shoot.stats.organGrowth;
 assert(growth.length>0,type+' needs actual developing organs');
 const mid=growth.find(g=>g.node>=.4),tip=growth.at(-1);
 assert(tip.length<mid.length*.60,type+' extending tip has full-sized leaves');
 assert(tip.expansion<.4&&tip.active,type+' tip is not marked as expanding');
 assert(tip.length<tip.matureLength*.4,type+' adult minimum has clipped the emerging leaf');
 if(type!=='monkeytail'){
  const nodes=growth.map(g=>g.position),first=nodes[1]-nodes[0],last=nodes.at(-1)-nodes.at(-2);
  assert(last<first*.65,type+' youngest internodes should be compressed');
 }
 const mature={...c,shootStage:'set'},g=shootGrowth(mature,0);
 assert.equal(g.active,false);assert.equal(leafDevelopment(mature,sp,g,1).expansion,1);
 const surface=buildSpecimen({...c,view:'surface'},{preview:false});
 assert(surface.vertices.every(Number.isFinite));assert(surface.stats.leafAnatomy.length>0,type+' surface anatomy missing');
 const normalSpan=[Infinity,-Infinity],depthSpan=[Infinity,-Infinity];
 for(let i=0;i<surface.vertices.length;i+=14)if(surface.vertices[i+9]>.5){normalSpan[0]=Math.min(normalSpan[0],surface.vertices[i+3]);normalSpan[1]=Math.max(normalSpan[1],surface.vertices[i+3]);depthSpan[0]=Math.min(depthSpan[0],surface.vertices[i]);depthSpan[1]=Math.max(depthSpan[1],surface.vertices[i]);}
 assert(normalSpan[1]-normalSpan[0]>.02&&depthSpan[1]-depthSpan[0]>.00003,type+' has a flat outline instead of a curved blade');
 const samples=[];for(let i=0;i<160;i++)samples.push(leafSurface(type,.13+(i%16)/20,.12+Math.floor(i/16)/14,c.leafSize,c.leafSize*sp.width*2,false));
 assert(samples.every(a=>a.every(Number.isFinite)));assert(Math.max(...samples.map(a=>a[0]))-Math.min(...samples.map(a=>a[0]))>1e-7,type+' surface material lacks relief');
 console.log(type+': curved anatomy, species surface, expanding tips and set-shoot contrast passed');
}
assert.equal(shootGrowth({...cfg('maple'),season:'autumn'},0).active,false,'Autumn is not an extending spring/summer flush');
assert.equal(LEAF_ANATOMY.ginkgo.venation,'dichotomous');assert.equal(LEAF_ANATOMY.dawnredwood.venation,'single');assert.equal(LEAF_ANATOMY.yellowwood.venation,'single');assert.equal(LEAF_ANATOMY.monkeytail.venation,'parallel');
assert(shootNodePosition(.95,true)-shootNodePosition(.90,true)<shootNodePosition(.10,true)-shootNodePosition(.05,true));
const p=[0,.06,0],c=cfg('oak');assert.deepEqual(studyWindPosition(p,1,1,0,c,0),studyWindPosition(p,1,1,0,c,1));assert.notDeepEqual(studyWindPosition(p,1,1,.8,c,0),studyWindPosition(p,1,1,.8,c,1));

// Render the real triangles; count pixels as well as anatomy records. This
// catches fallback silhouette-only regressions and detached/static detail.
const w=144,h=176,scale=18;
// Orthographic front of the blade (blade lies in YZ, normal +X).
const vp=new Float32Array([0,0,0,0,0,scale,0,0,-scale,0,0,0,0,-.85,0,1]);
const renderer=createSoftwareStudy(),oak=buildSpecimen({...c,view:'leaf'},{preview:false});
renderer.upload(oak.vertices,{...c,view:'leaf',widthRatio:SPECIES.oak.width});
const render=(time,sun=[1,.4,.5])=>renderer.render({vp,eye:[.3,.05,0],sun,cfg:c,time,width:w,height:h}).data.slice();
const a=render(0),b=render(.45),lit=render(0,[-.2,.3,1]);
let moving=0,lighting=0;const colours=new Set();
for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1])moving++;if(a[i]!==lit[i]||a[i+1]!==lit[i+1])lighting++;if(a[i]<170&&a[i+1]>a[i])colours.add(a.slice(i,i+3).join(','));}
assert(moving>100,'The software leaf is static');assert(lighting>100,'Surface material does not respond to the light');assert(colours.size>150,'The software renderer is a flat silhouette');
// The same flat patch must shade the same way with two triangles or a fine
// grid. Per-triangle view vectors used to create conspicuous macro bands.
function flatPatch(n){const out=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)for(const [u,v]of[[x/n,y/n],[(x+1)/n,y/n],[x/n,(y+1)/n],[(x+1)/n,y/n],[(x+1)/n,(y+1)/n],[x/n,(y+1)/n]])out.push(0,v*.02,-(u-.5)*.02,1,0,0,.15,.27,.06,1,1,0,u,v);return new Float32Array(out);}
const pc={...c,wind:0},pv=new Float32Array([0,0,0,-1,0,3.2,0,0,-3.2,0,0,0,0,-.032,0,.04]);
const patch=n=>{renderer.upload(flatPatch(n),{...pc,view:'leaf',widthRatio:SPECIES.oak.width});return renderer.render({vp:pv,eye:[.04,.01,0],sun:[1,.4,.5],cfg:pc,time:0,width:160,height:160}).data.slice();};
const coarse=patch(1),fine=patch(10);assert(coarse[(80*160+80)*4]<170,'The test patch is not visible');let error=0,count=0;for(let y=28;y<132;y++)for(let x=28;x<132;x++)for(let k=0;k<3;k++){error+=Math.abs(coarse[(y*160+x)*4+k]-fine[(y*160+x)*4+k]);count++;}assert(error/count<.65,'Macro shading changes with triangle rows');
const woodPatch=flatPatch(1);for(let i=0;i<woodPatch.length;i+=14){woodPatch[i+9]=0;woodPatch[i+10]=.7;}renderer.upload(woodPatch,{...c,view:'bark',widthRatio:SPECIES.oak.width});renderer.upload(oak.vertices,{...c,view:'leaf',widthRatio:SPECIES.oak.width});assert.deepEqual(render(0),a,'Returning from bark loses the leaf material cache');
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
assert(app.includes('study.upload(botanical.vertices'));assert(app.includes('study.render({vp,eye,sun,cfg,time:elapsed'));assert(app.includes("next.shootStage=['extending','set']"));
console.log('Actual fallback image has moving, light-responsive material detail on the curved leaf mesh');
