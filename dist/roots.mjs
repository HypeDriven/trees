import {woodTube,woodRadius} from './wood.mjs?v=24';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const ROOT_PROFILES={
 maple:{primaries:10,spread:.48,depth:1.4,lateral:.14,sinkers:4,tap:true},
 sakura:{primaries:11,spread:.52,depth:.8,lateral:.10,sinkers:3,tap:false},
 ginkgo:{primaries:9,spread:.43,depth:1.5,lateral:.15,sinkers:5,tap:true},
 dawnredwood:{primaries:12,spread:.46,depth:1,lateral:.10,sinkers:4,tap:false},
 chinesepine:{primaries:8,spread:.43,depth:1.5,lateral:.17,sinkers:4,tap:true},
 sweetgum:{primaries:9,spread:.45,depth:1.4,lateral:.15,sinkers:4,tap:true},
 redbud:{primaries:8,spread:.45,depth:1.3,lateral:.18,sinkers:4,tap:true},
 jacaranda:{primaries:10,spread:.50,depth:1.3,lateral:.14,sinkers:4,tap:true},
 monkeytail:{primaries:18,spread:.28,depth:.25,lateral:.27,sinkers:3,tap:false,fibrous:true},
 eucalyptus:{primaries:10,spread:.52,depth:1.7,lateral:.17,sinkers:5,tap:true},
 baobab:{primaries:8,spread:.62,depth:1.3,lateral:.12,sinkers:3,tap:false},
 fevertree:{primaries:11,spread:.50,depth:1.0,lateral:.10,sinkers:3,tap:false},
 sausagetree:{primaries:9,spread:.50,depth:1.5,lateral:.16,sinkers:4,tap:true},
 karee:{primaries:10,spread:.48,depth:1.2,lateral:.17,sinkers:4,tap:true},
 sweetthorn:{primaries:8,spread:.47,depth:2.2,lateral:.14,sinkers:4,tap:true},
 marula:{primaries:9,spread:.45,depth:2.1,lateral:.15,sinkers:4,tap:true},
 wildolive:{primaries:10,spread:.49,depth:1.2,lateral:.15,sinkers:4,tap:true},
 yellowwood:{primaries:9,spread:.38,depth:1.8,lateral:.19,sinkers:5,tap:true},
 oak:{primaries:8,spread:.40,depth:1.5,lateral:.18,sinkers:5,tap:true},
 willow:{primaries:11,spread:.50,depth:.75,lateral:.11,sinkers:2,tap:false},
 pine:{primaries:8,spread:.40,depth:1.3,lateral:.18,sinkers:4,tap:true},
 birch:{primaries:10,spread:.43,depth:.7,lateral:.10,sinkers:2,tap:false}
};
export const ROOT_REFERENCE='https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/watering-established-trees-and-shrubs';
export function buildRootSystem(mesh,cfg,{preview=false,study=false,baseRadius,inspection=null}={}){
 const profile=ROOT_PROFILES[cfg.type],random=seeded(cfg.seed^0x5a31b72),R=(a,b)=>a+(b-a)*random(),height=cfg.height??10,spread=height*profile.spread*(cfg.rootSpread??1),depth=cfg.rootDepth??profile.depth,levels=Math.max(1,Math.min(4,Math.round(cfg.rootBranching??3))),base=baseRadius??height*(cfg.type==='oak'||cfg.type==='willow'?.025:cfg.type==='pine'?.015:.012),segments=[],terminals=[];
 const stats={primary:0,lateral:0,sinkers:0,feeder:0,tap:0,segments:0,depth:0,spread:0,connections:[],source:ROOT_REFERENCE};
 const sinkerSites=[],rotation=R(0,Math.PI*2),sectorPhase=R(0,Math.PI*2),smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)},boundedY=y=>Math.max(-depth, y);
 function record(points,r0,r1,kind,parent=null){let id=segments.length;segments.push({id,parent,points,r0,r1,kind});stats[kind]++;stats.segments++;if(parent!==null)stats.connections.push({parent,child:id,start:[...points[0]]});for(let p of points){stats.depth=Math.max(stats.depth,-p[1]);stats.spread=Math.max(stats.spread,Math.hypot(p[0],p[2]))}return id}
 function emit(points,r0,r1,kind,parent){let id=record(points,r0,r1,kind,parent);woodTube(mesh,points,r0,r1,cfg.type,{maturity:cfg.maturity??.65,root:false,collar:false,preview:false,zone:-.04,treeHeight:height,inspection:inspection&&points.some(p=>p[1]+r0>=-.003)?inspection:null});if(preview){for(let j=0;j<points.length-1;j++){let a=points[j],b=points[j+1],dir=norm(sub(b,a)),side=norm(cross(dir,Math.abs(dir[1])>.9?[1,0,0]:[0,1,0])),radius=woodRadius(r0,r1,j/(points.length-1)),pts=[add(a,mul(side,-radius)),add(b,mul(side,-radius*.8)),add(b,mul(side,radius*.8)),add(a,mul(side,radius))];if(study||pts.some(p=>p[1]>=-.003))mesh.preview.push({pts,n:[0,1,0],c:[.24,.17,.10],kind:-.04,phase:0})}}return id}
 // Roots follow persistent curves with an early collar deflection and a
 // second, independently directed bend. Child forks inherit local tangents.
 function rootPath(start,az,len,order){
  const steps=order===0?24:12,handed=random()<.5?-1:1,turnA=handed*R(.4,.95),turnB=handed*(random()<.38?1:-1)*R(.75,1.4),phase=R(0,6.28),wave=R(.08,.23),descent=R(.055,.085),points=[[...start]];let p=start,prev=0;
  for(let j=1;j<=steps;j++){
   const t=Math.pow(j/steps,1.25),travel=len*t,step=travel-prev,a=az+turnA*smooth(travel/(base*.9+len*.065))+turnB*smooth((t-.18)/.78)+wave*Math.sin(t*8+phase)*Math.sin(t*Math.PI),undulation=Math.sin(t*7+phase)*Math.sin(t*Math.PI);
   const y=order===0?start[1]*Math.exp(-travel/Math.max(.025,base*.9))-depth*profile.lateral*(1-Math.exp(-travel/(base*3+len*.22)))-base*(cfg.type==='baobab'?.40:0)*(1-Math.exp(-travel/Math.max(.01,base*.6)))+depth*.018*undulation:start[1]-depth*descent*t+depth*.018*undulation;
   p=[p[0]+Math.cos(a)*step,boundedY(y),p[2]+Math.sin(a)*step];points.push(p);prev=travel;
  }return points;
 }
 function branch(start,az,len,r0,order,parent=null){
  const points=rootPath(start,az,len,order),steps=points.length-1,r1=Math.min(r0*.72,Math.max(.0002,r0*(order===0?.07:.14))),id=emit(points,r0,r1,order===0?'primary':'lateral',parent);
  if(order===0){const i=Math.floor(steps*R(.32,.7));sinkerSites.push({id,p:points[i],r:woodRadius(r0,r1,i/steps)})}
  if(order<levels){
   const count=order===0?2+Math.floor(R(0,3)):1+Math.floor(R(0,3)),firstSide=random()<.5?-1:1;
   for(let k=0;k<count;k++){
    const t=.22+.65*(k+R(.18,.85))/count,i=Math.max(1,Math.min(steps-1,Math.floor(t*steps))),origin=points[i],d=sub(points[i+1],points[i-1]),tangent=Math.atan2(d[2],d[0]),a=tangent+firstSide*(k%2?-1:1)*R(.42,1.13),pr=woodRadius(r0,r1,i/steps);
    branch(origin,a,len*R(.24,.48),Math.max(.0005,pr*R(.32,.46)),order+1,id);
   }
  }else{const d=sub(points.at(-1),points.at(-2));terminals.push({id,p:points.at(-1),az:Math.atan2(d[2],d[0]),r:r1})}
  return id;
 }
 // Unequal angular gaps and sector vigour replace the equally spaced spokes.
 const gaps=Array.from({length:profile.primaries},()=>R(.48,1.55)),total=gaps.reduce((a,b)=>a+b,0);let angle=rotation;
 for(let k=0;k<profile.primaries;k++){
  angle+=gaps[k]/total*Math.PI*2;const a=angle,start=[Math.cos(a)*base*.28,base*(cfg.type==='baobab'?R(.03,.10):R(.20,.39)),Math.sin(a)*base*.28],vigor=1+.23*Math.cos(a-sectorPhase);
  branch(start,a+R(-.20,.20),spread*R(.58,.98)*vigor,base*(profile.fibrous?R(.025,.065):R(.29,.50)),0);
 }
 for(let k=0;k<profile.sinkers;k++){
  const site=sinkerSites[Math.floor(R(0,sinkerSites.length))],p=site.p,drop=Math.min(depth+p[1],depth*R(.48,.85)),a=R(0,6.28),offset=depth*R(.10,.23),points=Array.from({length:11},(_,j)=>{let t=j/10;return j===0?p:[p[0]+offset*(Math.sin(a+t*3)-Math.sin(a))*t,boundedY(p[1]-drop*t),p[2]+offset*(Math.cos(a+t*4)-Math.cos(a))*t]});
  emit(points,site.r*.48,.0014,'sinkers',site.id);
 }
 if(profile.tap&&depth>.75){
  const a=R(0,6.28),points=Array.from({length:14},(_,j)=>{let t=j/13;return[base*.6*(Math.sin(t*5+a)-Math.sin(a))*t,base*.15*(1-t)-depth*t,base*.55*(Math.cos(t*4+a)-Math.cos(a))*t]});
  emit(points,base*(.30+.22*(1-(cfg.maturity??.65))),.002,'tap');
 }
 if(cfg.fineRoots!==false){for(const tip of terminals){const count=2+Math.floor(R(0,3));for(let k=0;k<count;k++){
  const a=tip.az+(k-(count-1)/2)*R(.38,.70)+R(-.2,.2),len=R(.06,.20),points=rootPath(tip.p,a,len,levels+1);
  emit(points,Math.min(.0012,tip.r*.72),.00012,'feeder',tip.id);
 }}}

 return {segments,stats};
}
