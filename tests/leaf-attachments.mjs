import assert from 'node:assert/strict';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {woodTube} from '../dist/wood.mjs';
import {studyWindPosition,primitiveWindPosition} from '../dist/software-study.mjs';
import {bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage} from '../dist/compound-lod.mjs';
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),length=a=>Math.hypot(...a),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>a.map(v=>v/(length(a)||1));
function segmentDistance(p,a,b){const e=sub(b,a),t=Math.max(0,Math.min(1,dot(sub(p,a),e)/Math.max(1e-30,dot(e,e))));return length(sub(sub(p,a),e.map(v=>v*t)));}
function triangleDistance(p,a,b,c){
 const e=sub(b,a),f=sub(c,a),q=sub(p,a),n=cross(e,f),ee=dot(e,e),ff=dot(f,f),ef=dot(e,f),den=ee*ff-ef*ef;
 if(Math.abs(den)>1e-30){const u=(ff*dot(q,e)-ef*dot(q,f))/den,v=(ee*dot(q,f)-ef*dot(q,e))/den;if(u>=-1e-7&&v>=-1e-7&&u+v<=1.0000001)return Math.abs(dot(q,n))/length(n);}
 return Math.min(segmentDistance(p,a,b),segmentDistance(p,b,c),segmentDistance(p,c,a));
}
// Independently compare attachment rays with the emitted curved/displaced mesh.
for(const type of['oak','willow','pine','baobab','eucalyptus']){
 const triangles=[],mesh={v(p){triangles.push(p)},preview:{push(){}}},points=[[0,0,0],[.06,.10,.02],[-.025,.23,.045],[.09,.40,-.01]],surface=woodTube(mesh,points,.055,.014,type,{fine:false,preview:false,maturity:1}).surface;
 for(let j=0;j<17;j++)for(let k=0;k<11;k++){
  const t=.02+.96*j/16,{axis}=surface.sample(t),a=k*2.399963,out=norm(cross(axis,[Math.cos(a),.2,Math.sin(a)])),joint=surface.attachment(t,out);let distance=Infinity;
  for(let i=0;i<triangles.length;i+=3)distance=Math.min(distance,triangleDistance(joint.surface,...triangles.slice(i,i+3)));
  assert(distance<1e-8,'Attachment point misses the actual bark triangles');assert(joint.overlap>0&&joint.overlap<=.000081);
 }
}
const config=(type,view='shoot')=>({type,view,height:type==='monkeytail'?1.1:10,spread:1,leafSize:SPECIES[type].length,seed:2847,levels:2,shoots:1,density:38,season:'summer',maturity:.7,reproductive:false,rootBranching:1,fineRoots:false,shootStage:'extending',wind:4,gust:1,direction:55});
let movingTips=0;
for(const type of Object.keys(SPECIES)){
 const cfg=config(type),r=buildSpecimen(cfg),stems=[];
 for(let i=0;i<r.vertices.length;i+=42){const kind=r.vertices[i+9];if(kind<.1||Math.abs(kind-.2)<.001)stems.push([Array.from(r.vertices.slice(i,i+3)),Array.from(r.vertices.slice(i+14,i+17)),Array.from(r.vertices.slice(i+28,i+31))]);}
 for(const joint of r.stats.leafAttachments){
  let distance=Infinity;for(const tri of stems)distance=Math.min(distance,triangleDistance(joint.surface,...tri));
  assert(distance<.000001,`${type}: leaf insertion is off the emitted stem`);
 }
 const blades=r.preview.filter(p=>p.base&&p.flutterAt);
 assert(blades.length>0,`${type}: missing attachment-aware blade preview`);
 for(const blade of blades.filter((_,i)=>i%Math.max(1,Math.floor(blades.length/24))===0))for(const time of[0,.37,1.3,4.1,8.9]){
  const actual=primitiveWindPosition(blade.base,blade,cfg,time),parent=studyWindPosition(blade.base,.2,0,0,cfg,time);
  assert(length(sub(actual,parent))<1e-8,`${type}: leaf base drifts away from its petiole in gusts`);
  const tip=blade.pts.reduce((a,b)=>length(sub(a,blade.base))>length(sub(b,blade.base))?a:b),tipWind=primitiveWindPosition(tip,blade,cfg,time),structural=studyWindPosition(tip,.2,0,0,cfg,time);
  if(length(sub(tipWind,structural))>.000001)movingTips++;
 }
 console.log(type+': rendered stem insertions and pinned software leaf bases passed');
}
assert(movingTips>200,'Pinning bases must preserve local motion at leaf tips');
for(const type of['sweetthorn','fevertree','jacaranda','dawnredwood','pine','chinesepine']){
 const cfg=config(type,'tree'),r=buildSpecimen(cfg,{preview:false});let seams=0;
 for(let i=0;i<r.vertices.length;i+=14)if(r.vertices[i+9]>1.19&&r.vertices[i+9]<1.5&&r.vertices[i+12]===.5){assert.equal(r.vertices[i+11],0,'Card rachis must have zero local flutter');seams++;}
 assert(seams>100);assert(r.stats.cardSupports.length>0);
 const ends=new Set(r.stats.cardSupports.slice(0,8).map(s=>new Float32Array(s.end).join(',')));
 for(let i=0;i<r.vertices.length&&ends.size;i+=14)if(Math.abs(r.vertices[i+9]-.2)<.001)ends.delete(r.vertices.subarray(i,i+3).join(','));
 assert.equal(ends.size,0,'A narrow alpha-mask rachis also needs actual supporting stem geometry');
 const coverage=type==='jacaranda'?(x,y)=>bipinnateCoverage(x,y,12,16,true):type==='sweetthorn'?(x,y)=>bipinnateCoverage(x,y,3,9):type==='fevertree'?(x,y)=>bipinnateCoverage(x,y,7,13):type==='dawnredwood'?redwoodSprayCoverage:pineSprayCoverage;
 for(let y=0;y<.15;y+=.001)assert.equal(coverage(.5,y),1,`${type}: cutout mask leaves a bare gap at its attachment`);
 assert(r.vertices.every(Number.isFinite));
}
console.log('Cutout rachises extend continuously to the twig and remain pinned in gusts');
