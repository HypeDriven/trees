import {EAST_ASIAN_CROWNS,EAST_ASIAN_SPECIES} from './east-asia.mjs?v=17';
import {buildXerophytaArchitecture} from './garden-species.mjs?v=17';
import {SOUTH_AFRICAN_CROWNS,SOUTH_AFRICAN_SPECIES} from './south-africa.mjs?v=17';
// Species-biased crown architecture in metres. An illustrative habit model,
// not a simulation of growth, reaction wood, competition or branch mechanics.
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),norm=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],smooth=t=>t*t*(3-2*t),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const frame=d=>{let u=norm(cross(d,Math.abs(d[1])>.9?[1,0,0]:[0,1,0]));return[u,norm(cross(u,d))]};
function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

export const ARCHITECTURE_NOTES={
 ...Object.fromEntries(Object.entries({...SOUTH_AFRICAN_SPECIES,...EAST_ASIAN_SPECIES}).map(([key,sp])=>[key,sp.habit])),
 willow:'Short, leaning trunk; unequal spreading boughs turn through broad arcs into long, winding, pendulous sprays. This models a weeping willow habit, not a corkscrew cultivar.',
 oak:'Short stout trunk divides into unequal, sinuous scaffold limbs, with broad lateral forks, upward recovery and an irregular rounded crown.',
 pine:'A dominant, gently wandering leader carries irregular branch whorls. Maturity opens the lower crown and broadens the upper crown; lateral branches recover into upturned shoots.',
 birch:'A slender, gently leaning leader carries staggered ascending branches. Their outer arcs and finer branchlets become progressively pendulous, leaving an open oval crown.'
};

// Arc-length sampling is shared by branch attachment and its local tangent.
export function sampleBranch(points,t){
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+Math.hypot(...sub(points[i],points[i-1])));
 const at=clamp(t,0,1)*lengths.at(-1);let i=0;while(i<points.length-2&&lengths[i+1]<at)i++;
 const f=(at-lengths[i])/Math.max(1e-9,lengths[i+1]-lengths[i]);
 return{point:mix(points[i],points[i+1],f),direction:norm(sub(points[i+1],points[i])),index:i};
}

export function buildTreeArchitecture(cfg){
 if(cfg.type==='monkeytail')return buildXerophytaArchitecture(cfg);
 const random=seeded(cfg.seed^0x391a6d27),R=(a,b)=>a+(b-a)*random(),type=cfg.type,h=cfg.height,m=clamp(cfg.maturity??.65,0,1),levels=clamp(Math.round(cfg.levels),2,5),dense=(cfg.shoots??3)>=2;
 const south=EAST_ASIAN_CROWNS[type]??SOUTH_AFRICAN_CROWNS[type],pineLike=type==='pine'||type==='chinesepine';
 const records=[],baseRadius=h*(south?.radius??(type==='oak'||type==='willow'?.025:type==='pine'?.015:.012)),azimuth=R(0,Math.PI*2),bias=R(.12,.25),crownPhase=R(0,6.283);
 const radial=a=>[Math.cos(a),0,Math.sin(a)],radiusAt=(r,t)=>r.r1+(r.r0-r.r1)*Math.pow(1-t,.88);
 // Correlated, low-frequency bending produces continuous arcs instead of
 // independent per-segment jitter. The smaller second lobe breaks planar arcs.
 function sweep(p,start,end,len,bend,phase,steps){
  const pts=[[...p]],d0=norm(start),d1=norm(end),[u,v]=frame(d0),freq=R(1.15,1.9),freq2=R(2.2,3.0);let dir=d0;
  for(let i=1;i<=steps;i++){
   const t=(i-.5)/steps,s=smooth(t),sway=(Math.sin(phase+t*freq*Math.PI)-Math.sin(phase))*.72,turn=(Math.sin(phase*.71+t*freq2*Math.PI)-Math.sin(phase*.71))*.38;
   let goal=norm(add(mix(d0,d1,s),add(mul(u,bend*sway),mul(v,bend*turn))));
   dir=norm(mix(dir,goal,.5));p=add(p,mul(dir,len/steps));pts.push(p);
  }return pts;
 }
 function record(points,r0,r1,depth,parent=null,t=0,role='lateral',phase=R(0,6.283)){
  const r={id:records.length,points,r0,r1,depth,parent:parent?.id??null,attachment:t,role,phase,fruit:random()<.10,children:0};records.push(r);if(parent)parent.children++;return r;
 }
 function limb(parent,t,dir,len,radius,depth,phase,role='lateral'){
  const attachment=sampleBranch(parent.points,t),start=norm(dir),out=norm([attachment.point[0]+Math.cos(phase)*h*.1,0,attachment.point[2]+Math.sin(phase)*h*.1]);let end,bend;
  // Hanging axes shorten as they approach the soil. They retain a descending
  // tangent rather than being flattened onto an arbitrary ground-height clamp.
  if(depth>=2)len=Math.min(len,attachment.point[1]*.88);
  if(type==='willow'){
   end=depth===1?norm(add(mul(out,1),[0,R(-.12,.22),0])):depth===2?norm(add(mul(out,R(.2,.5)),[0,-1,0])):norm(add(mul(out,R(.06,.24)),[0,-1,0]));
   bend=depth===1?.42:depth===2?.32:.22;
  }else if(type==='oak'){
   const [u]=frame(start);end=norm(add(add(mul(start,.45),mul(u,R(-.6,.6))),[0,R(.3,.75),0]));bend=.48+.17*m;
  }else if(pineLike){
   end=norm(add(mul(out,.65),[0,depth===1?R(.22,.55):R(.55,1.1),0]));bend=depth===1?.16+.18*m:.20;
  }else if(south){
   if(type==='maple'){end=norm(add(mul(out,.70),[0,R(.25,.75),0]));bend=.35;}
   else if(type==='sakura'){end=norm(add(mul(out,.90),[0,depth===1?R(.10,.42):R(-.25,.12),0]));bend=.44;}
   else if(type==='ginkgo'){end=norm(add(mul(out,.65),[0,depth===1?R(.40,.85):R(.10,.40),0]));bend=.18;}
   else if(type==='dawnredwood'){end=norm(add(mul(out,.9),[0,depth===1?R(-.16,.03):R(-.04,.16),0]));bend=.11;}
   else if(type==='sweetgum'){end=norm(add(mul(out,.70),[0,R(.25,.65),0]));bend=.28;}
   else if(type==='redbud'){end=norm(add(mul(out,.9),[0,R(.12,.42),0]));bend=.46;}
   else if(type==='jacaranda'){end=norm(add(mul(out,.9),[0,depth===1?R(.05,.30):R(-.05,.30),0]));bend=.42;}
   else if(type==='eucalyptus'){const [side]=frame(start);end=norm(add(add(mul(out,.65),mul(side,R(-.35,.35))),[0,depth===1?R(.12,.45):R(-.35,.15),0]));bend=.46;}
   else if(type==='baobab'){const [side]=frame(start);end=norm(add(add(mul(out,.80),mul(side,R(-.40,.40))),[0,depth===1?R(.35,.75):R(.25,.65),0]));bend=.40+.15*m;}
   else if(type==='fevertree'){end=norm(add(mul(out,.95),[0,depth===1?R(-.02,.13):R(.04,.32),0]));bend=.36;}
   else if(type==='sausagetree'){end=norm(add(mul(out,.8),[0,depth===1?R(-.12,.18):R(-.32,.20),0]));bend=.36;}
   else if(type==='karee'){end=norm(add(mul(out,depth===1?.8:.6),[0,depth===1?R(-.08,.18):depth===2?R(-.32,-.12):R(-.65,-.25),0]));bend=.39;}
   else if(type==='sweetthorn'){end=norm(add(mul(out,.85),[0,depth===1?R(.15,.40):R(.18,.65),0]));bend=.40+.10*m;}
   else if(type==='marula'){end=norm(add(mul(out,.72),[0,depth===1?R(.18,.42):R(.35,.85),0]));bend=.36;}
   else if(type==='wildolive'){const [side]=frame(start);end=norm(add(add(mul(start,.5),mul(side,R(-.65,.65))),[0,R(.10,.55),0]));bend=.48;}
   else{end=norm(add(mul(out,.80),[0,depth===1?R(-.06,.18):R(.05,.32),0]));bend=depth===1?.48:.20;}
  }else{
   end=depth===1?norm(add(out,[0,R(-.4,-.08),0])):depth===2?norm(add(mul(out,.65),[0,R(-.7,-.3),0])):norm(add(mul(out,.28),[0,-1,0]));bend=depth===1?.20:.26;
  }
  // Continuing axes depart in the parent's tangent, retaining a smooth apex.
  const points=sweep(attachment.point,start,end,len,bend,phase,depth<=2?18:10),taper=depth===levels?.10:role==='scaffold'?.26:.22;
  const r=record(points,radius,Math.min(radius*.72,Math.max(.00008,radius*taper)),depth,parent,t,role,phase);
  if(depth>=levels)return r;
  const paired=type==='maple'||type==='dawnredwood',count=paired?(depth===1?5:3):south?(depth===1?(type==='wildolive'?6:4):3):depth===1?(type==='willow'?(dense?7:6):(dense?6:5)):type==='willow'?(dense?5:4):(dense?4:3);
  const offset=R(-.18,.18),vigor=R(.88,1.14),pairSites=paired?[.34+R(-.005,.005),.74+R(-.005,.005)]:[];
  for(let k=0;k<count;k++){
   const continuation=k===count-1,node=continuation?1:paired?pairSites[Math.floor(k/2)]:clamp(.23+.65*(k+.35+R(-.13,.13))/(count-1),.16,.91),at=sampleBranch(points,node),[u,v]=frame(at.direction),a=phase+offset+(paired?Math.floor(k/2)*Math.PI/2+(k%2)*Math.PI:k*2.399963)+R(paired?-.035:-.22,paired?.035:.22),side=add(mul(u,Math.cos(a)),mul(v,Math.sin(a)));
   let nd,ratio;
   if(continuation){nd=at.direction;ratio=type==='willow'?.50:.36;}
   else if(type==='willow'){
    nd=depth===1?norm(add(add(mul(at.direction,.4),mul(side,.6)),[0,-.15,0])):norm(add(add(mul(at.direction,.65),mul(side,.35)),[0,-.35,0]));ratio=depth===1?R(.56,.82):R(.50,.70);
   }else if(type==='oak'){nd=norm(add(add(mul(at.direction,.5),mul(side,.85)),[0,R(.02,.42),0]));ratio=R(.43,.66);}
   else if(type==='karee'){nd=norm(add(add(mul(at.direction,.58),mul(side,.45)),[0,-.18,0]));ratio=R(.47,.66);}
   else if(type==='birch'){nd=norm(add(add(mul(at.direction,.55),mul(side,.55)),[0,depth===1?.08:-.28,0]));ratio=R(.45,.66);}
   else{nd=norm(add(add(mul(at.direction,.60),mul(side,.60)),[0,R(.12,.38),0]));ratio=R(.40,.61);}
   // Vigor and coherent azimuthal bias create uneven crown sectors, gaps and
   // unequal branch lengths; no terminal is randomly discarded.
   const sector=1+bias*Math.cos(a-crownPhase),childLen=len*ratio*vigor*(continuation?1:sector);
   limb(r,node,nd,childLen,radiusAt(r,node)*(continuation?.88:R(.38,.53)),depth+1,a,continuation?'continuation':'lateral');
  }return r;
 }

 const trunkLen=h*(south?.trunk??(type==='willow'?R(.30,.37):type==='oak'?R(.34,.43):.98)),lean=south?.lean??(type==='willow'?R(.10,.19):type==='oak'?R(.035,.085):type==='birch'?R(.025,.065):R(.01,.035)*(1+m)),leanAxis=radial(azimuth);
 const trunk=record(sweep([0,0,0],[leanAxis[0]*lean*.2,1,leanAxis[2]*lean*.2],[leanAxis[0]*lean,1,leanAxis[2]*lean],trunkLen,south?.bend??(type==='oak'?.20:type==='willow'?.24:type==='birch'?.09:.045+.05*m),crownPhase,28),baseRadius,baseRadius*(south?.taper??(type==='willow'||type==='oak'?.38:.065)),0,null,0,'trunk');
 if(pineLike){
  const whorls=7,base=.24+.24*m;
  for(let w=0;w<whorls;w++){
   const heightT=base+(.95-base)*w/(whorls-1),count=3+Math.floor(R(0,2.999)),rotation=azimuth+w*R(.62,1.12);
   for(let k=0;k<count;k++){
    const a=rotation+k*2*Math.PI/count+R(-.18,.18),t=heightT+R(-.012,.012),out=radial(a),sector=1+bias*Math.cos(a-crownPhase),cone=(1-t)*.65,matureCrown=(type==='chinesepine'?.19:.12)+.22*Math.sin(Math.PI*(t-base)/(.99-base)),length=h*((1-m)*cone+m*matureCrown)*R(.78,1.16)*sector;
    limb(trunk,t,norm(add(out,[0,R(-.20,.16),0])),length,radiusAt(trunk,t)*R(.40,.54),1,a,'scaffold');
   }
  }
 }else{
  const count=south?.scaffolds??(type==='willow'?8:type==='oak'?9:12);
  for(let k=0;k<count;k++){
   const q=(k+.5)/count,a=azimuth+k*2.399963+R(-.24,.24),out=radial(a),sector=1+bias*Math.cos(a-crownPhase);
   const t=south?south.start+(1-south.start)*q+R(-.015,.015):type==='willow'?(k<3?.46+q*.5:.82+.17*(k-3)/(count-3)):type==='oak'?(k<3?.38+q:.75+.24*(k-3)/(count-3)):.25+q*.73+R(-.012,.012);
   const up=south?south.up*R(.75,1.25):type==='willow'?R(.80,1.5):type==='oak'?R(.45,1.0):R(.85,1.25),length=h*(south?south.length*(['dawnredwood','ginkgo'].includes(type)?Math.pow(1-t,.62)*R(.88,1.12):type==='sweetgum'||type==='maple'?(.55+.45*Math.sin(t*Math.PI))*R(.88,1.12):type==='yellowwood'?(.65+.35*Math.sin(t*Math.PI))*R(.85,1.15):R(.82,1.15)):type==='willow'?R(.52,.73):type==='oak'?R(.42,.62):Math.sin(t*Math.PI)*R(.28,.35))*sector;
   limb(trunk,t,norm(add(out,[0,up,0])),length,radiusAt(trunk,t)*(type==='birch'?R(.40,.53):R(.55,.72)),1,a,'scaffold');
  }
 }
 // The main axis itself has a foliated continuation, without a naked pole
 // protruding beyond the crown. Broadleaf leaders divide at a low fork.
 const top=sampleBranch(trunk.points,1);limb(trunk,1,top.direction,h*(south?.leader??(type==='oak'?.42:type==='willow'?.50:.025)),trunk.r1*.90,pineLike||type==='birch'?Math.max(1,levels-1):1,azimuth+.8,'leader');

 let maxY=0;for(const r of records)for(const p of r.points)maxY=Math.max(maxY,p[1]);const scale=h/maxY,spread=(cfg.spread??1)*(south?.spread??(type==='willow'?.56:type==='sweetthorn'?.50:type==='marula'?.72:type==='wildolive'?.85:type==='yellowwood'?.68:1));
 for(const r of records){r.points=r.points.map(p=>[p[0]*scale*spread,p[1]*scale,p[2]*scale*spread]);r.r0*=scale;r.r1*=scale;}
 const terminals=records.filter(r=>!r.children),tipDirections=terminals.map(r=>sampleBranch(r.points,1).direction),scaffolds=records.filter(r=>r.role==='scaffold');
 return{records,baseRadius:trunk.r0,stats:{profile:type,trunkHeight:trunk.points.at(-1)[1],height:h,scaffolds:scaffolds.length,terminals:terminals.length,apicalContinuations:records.filter(r=>r.role==='continuation').length,pendulousTips:tipDirections.filter(d=>d[1]<-.35).length,upturnedTips:tipDirections.filter(d=>d[1]>.25).length,notes:ARCHITECTURE_NOTES[type]}};
}
