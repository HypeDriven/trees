import {woodTube,woodRadius} from './wood.mjs?v=8';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const ROOT_PROFILES={
 oak:{primaries:8,spread:.40,depth:1.5,lateral:.18,sinkers:5,tap:true},
 willow:{primaries:11,spread:.50,depth:.75,lateral:.11,sinkers:2,tap:false},
 pine:{primaries:8,spread:.40,depth:1.3,lateral:.18,sinkers:4,tap:true},
 birch:{primaries:10,spread:.43,depth:.7,lateral:.10,sinkers:2,tap:false}
};
export const ROOT_REFERENCE='https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/watering-established-trees-and-shrubs';
export function buildRootSystem(mesh,cfg,{preview=false,study=false,baseRadius}={}){
 const profile=ROOT_PROFILES[cfg.type],random=seeded(cfg.seed^0x5a31b72),R=(a,b)=>a+(b-a)*random(),height=cfg.height??10,spread=height*profile.spread*(cfg.rootSpread??1),depth=cfg.rootDepth??profile.depth,levels=Math.max(1,Math.min(4,Math.round(cfg.rootBranching??3))),base=baseRadius??height*(cfg.type==='oak'||cfg.type==='willow'?.025:cfg.type==='pine'?.015:.012),segments=[],terminals=[];
 const stats={primary:0,lateral:0,sinkers:0,feeder:0,tap:0,segments:0,depth:0,spread:0,connections:[],source:ROOT_REFERENCE};
 const sinkerSites=[];
 function record(points,r0,r1,kind,parent=null){let id=segments.length;segments.push({id,parent,points,r0,r1,kind});stats[kind]++;stats.segments++;if(parent!==null)stats.connections.push({parent,child:id,start:[...points[0]]});for(let p of points){stats.depth=Math.max(stats.depth,-p[1]);stats.spread=Math.max(stats.spread,Math.hypot(p[0],p[2]))}return id}
 function emit(points,r0,r1,kind,parent){let id=record(points,r0,r1,kind,parent);woodTube(mesh,points,r0,r1,cfg.type,{maturity:cfg.maturity??.65,root:false,collar:false,preview:false,zone:-.04});if(preview){for(let j=0;j<points.length-1;j++){let a=points[j],b=points[j+1],dir=norm(sub(b,a)),side=norm(cross(dir,Math.abs(dir[1])>.9?[1,0,0]:[0,1,0])),radius=woodRadius(r0,r1,j/(points.length-1)),pts=[add(a,mul(side,-radius)),add(b,mul(side,-radius*.8)),add(b,mul(side,radius*.8)),add(a,mul(side,radius))];if(study||pts.some(p=>p[1]>=-.003))mesh.preview.push({pts,n:[0,1,0],c:[.24,.17,.10],kind:-.04,phase:0})}}return id}
 function branch(start,az,len,r0,order,parent=null){
  const steps=order===0?14:8,bend=R(-.35,.35),phase=R(0,6.28),points=[start],r1=Math.max(.00035,r0*(order===0?.07:.14));let p=start;
  for(let j=1;j<=steps;j++){let t=j/steps,a=az+bend*t+Math.sin(t*5+phase)*.08,step=len/steps,y=order===0?start[1]*Math.exp(-t*11)-depth*profile.lateral*(.18+.82*t)+Math.sin(t*5+phase)*.013:Math.max(-depth*.65,start[1]-depth*.07*t+Math.sin(t*5+phase)*.012);p=[p[0]+Math.cos(a)*step,y,p[2]+Math.sin(a)*step];if(Math.hypot(p[0],p[2])>base*2)p[1]=Math.min(-.015,p[1]);points.push(p)}
  let id=emit(points,r0,r1,order===0?'primary':'lateral',parent);if(order===0){stats.primary=Math.max(stats.primary,1);sinkerSites.push({id,p:points[Math.floor(steps*.48)],r:woodRadius(r0,r1,.48)})}
  if(order<levels){let count=order===0?3:2;for(let k=0;k<count;k++){let t=.30+.55*(k+.4)/count,i=Math.min(steps-1,Math.floor(t*steps)),origin=points[i],a=az+(k%2?1:-1)*R(.48,.95),pr=woodRadius(r0,r1,i/steps);branch(origin,a,len*R(.28,.46),Math.max(.0006,pr*.42),order+1,id)}}else terminals.push({id,p:points.at(-1),az,r:r1});
  return id;
 }
 for(let k=0;k<profile.primaries;k++){let a=k/profile.primaries*Math.PI*2+R(-.13,.13),start=[Math.cos(a)*base*.28,base*R(.22,.42),Math.sin(a)*base*.28];branch(start,a,spread*R(.72,1.05),base*R(.30,.50),0)}
 for(let k=0;k<profile.sinkers;k++){let site=sinkerSites[(k*3+1)%sinkerSites.length],p=site.p,drop=depth*R(.50,.90),points=[p,add(p,[R(-.12,.12),-drop*.35,R(-.12,.12)]),add(p,[R(-.22,.22),-drop,R(-.22,.22)])];points[2][1]=Math.max(-depth,points[2][1]);emit(points,site.r*.48,.0014,'sinkers',site.id)}
 if(profile.tap&&depth>.75){let offset=base*.18,points=[[0,base*.15,0],[offset,-depth*.28,0],[-offset*.6,-depth*.65,offset],[offset*.5,-depth,offset*.7]];emit(points,base*(.30+.22*(1-(cfg.maturity??.65))),.002,'tap');}
 if(cfg.fineRoots!==false){for(let tip of terminals){for(let k=0;k<3;k++){let a=tip.az+(k-1)*.65+R(-.18,.18),len=R(.07,.19),p=tip.p,q=add(p,[Math.cos(a)*len*.55,-.008,Math.sin(a)*len*.55]),end=add(p,[Math.cos(a+.12)*len,-R(.01,.045),Math.sin(a+.12)*len]);emit([p,q,end],Math.min(.0012,tip.r*.72),.00012,'feeder',tip.id)}}}
 return {segments,stats};
}
