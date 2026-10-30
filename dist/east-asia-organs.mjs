import {buildFlowers} from './flowers.mjs?v=24';
// Separate geometric flowers, seeds and fruit; dimensions in metres.
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
const frame=d=>{const u=norm(cross(d,Math.abs(d[1])>.94?[1,0,0]:[0,1,0]));return[u,norm(cross(u,d))]},TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
const hash=x=>{const t=Math.sin(x*127.1+311.7)*43758.5453;return t-Math.floor(t)};
export function buildEastAsianOrgan(mesh,cfg,{mode='fruit',base=[0,0,0],axis=[0,-1,0],fine=false,layoutFine=fine,macroDetail=false,maximum=false,stage=cfg.fruitStage??'mature',seed=cfg.seed}={}){
 if(maximum)fine=true;
 const type=cfg.type,d=norm(axis),[u,v]=frame(d),R=(i,a,b)=>a+(b-a)*hash(seed+i*1.731),young=stage==='developing',released=stage==='released';
 const out={type,stage,flowers:0,petals:0,stamens:0,ovules:0,scales:0,capsules:0,seeds:0,wingedSeeds:0,valves:0,scaleRecords:[],length:0};let focus=[...base];
 function patch(point,rows,cols,col,kind=.36,thickness=0,uvScale=[.02,.03],shape='blade'){
  const sample=(t,x,back)=>{const p=point(t,x),dt=sub(point(Math.min(1,t+.001),x),point(Math.max(0,t-.001),x)),dx=sub(point(t,Math.min(1,x+.001)),point(t,Math.max(-1,x-.001))),n0=norm(cross(dx,dt)),n=Math.hypot(...n0)>.5?n0:u;return{p:add(p,mul(n,back?-thickness:0)),n:back?mul(n,-1):n,t,x};};
  for(let back=0;back<(thickness?2:1);back++)for(let j=0;j<rows;j++)for(let k=0;k<cols;k++){
   const t=j/rows,s=(j+1)/rows,x=k/cols*2-1,y=(k+1)/cols*2-1,q=[sample(t,x,back),sample(s,x,back),sample(t,y,back),sample(s,y,back)];
   for(const i of(back?[0,2,1,2,3,1]:[0,1,2,2,1,3])){const a=q[i];mesh.v(a.p,a.n,typeof col==='function'?col(a.t,a.x):col,kind,seed*.013,0,[(a.x+1)*uvScale[0]*.5,a.t*uvScale[1]]);}
   if(fine)mesh.preview.push({pts:[q[0].p,q[1].p,q[3].p,q[2].p],n:q[0].n,c:typeof col==='function'?col(t,x):col,kind,phase:0});
  }
  if(!fine){const x=shape==='tube'?.5:1,pts=[];for(let j=0;j<=6;j++)pts.push(point(j/6,-x));for(let j=6;j>=0;j--)pts.push(point(j/6,x));mesh.preview.push({pts,n:sample(.5,0,false).n,c:typeof col==='function'?col(.5,0):col,kind,phase:0});}
 }
 function lathe(p,dir,L,radius,col,kind=.36,rows=fine?32:4,sides=fine?28:6){const[a,b]=frame(dir);patch((t,x)=>{const a0=(x+1)*Math.PI,r=radius(t);return add(p,add(mul(dir,L*t),add(mul(a,Math.cos(a0)*r),mul(b,Math.sin(a0)*r))));},rows,sides,col,kind,0,[Math.max(radius(.5),.0001)*TAU,L],'tube');}
 function rod(p,q,r,col=[.29,.22,.12],kind=.36){const dir=norm(sub(q,p));lathe(p,dir,Math.hypot(...sub(q,p)),t=>r*(1-.28*t),col,kind,1,fine?6:3);}
 function seedBody(p,dir,L,r,col,kind=.34){lathe(p,dir,L,t=>r*Math.pow(Math.max(0,Math.sin(Math.PI*t)),.55),col,kind);}
 function wingedSeed(p,dir,L,W){const[a,b]=frame(dir);seedBody(p,dir,L*.62,W*.38,[.30,.19,.085]);patch((t,x)=>add(p,add(mul(dir,L*t),add(mul(a,x*W*Math.pow(Math.sin(Math.PI*t),.6)),mul(b,L*.035*x*x*Math.sin(Math.PI*t))))),fine?16:3,fine?8:2,[.58,.41,.22],.42,fine?.000025:0,[W*2,L]);}
 if(mode==='flower')return buildFlowers(mesh,cfg,{base,axis,fine,layoutFine,macroDetail,maximum,seed,study:cfg.view==='flower'});
 if(type==='maple'){
  const p=add(base,mul(d,.016));rod(base,p,.00065);const L=R(1,.025,.030)*(young?.65:1),angle=.65,col=young?[.33,.42,.12]:[.52,.36,.15];
  for(const sign of[-1,1]){const dir=norm(add(mul(d,.90),mul(u,sign*angle))),side=norm(cross(dir,v));seedBody(p,dir,.007,.0032,col);const q=add(p,mul(dir,.003));patch((t,x)=>add(q,add(mul(dir,L*t),add(mul(side,(x*.5+.5)*L*.25*Math.pow(Math.sin(Math.PI*t),.65)*sign),mul(v,L*.025*Math.sin(t*Math.PI)*x)))),fine?48:7,fine?12:3,(t,x)=>col.map(c=>c*(.93+.06*Math.sin(t*50+x*14))),.42,fine?.00007:0,[L*.25,L]);out.wingedSeeds++;}
  out.samaras=2;out.length=L;out.pairAngle=72;focus=add(p,mul(d,L*.55));
 }else if(type==='sakura'){
  const L=R(1,.008,.012)*(young?.65:1),p=add(base,mul(d,.028));rod(base,p,.00045,[.38,.25,.16]);seedBody(p,d,L,L*.47,young?[.32,.38,.13]:[.065,.025,.035]);out.drupes=1;out.length=L;focus=add(p,add(mul(d,L*.50),mul(v,L*.46)));
 }else if(type==='ginkgo'){
  const L=R(1,.022,.029)*(young?.70:1),p=add(base,mul(d,.025));rod(base,p,.00075);seedBody(p,d,L,L*.36,young?[.30,.40,.12]:[.65,.44,.105]);out.fleshySeeds=1;out.seedCoat=true;out.length=L;focus=add(p,add(mul(d,L*.55),mul(v,L*.35)));
 }else if(type==='redbud'){
  const L=R(1,.065,.095)*(young?.7:1),W=.0055,p=add(base,mul(d,.009));rod(base,p,.0006);const center=t=>add(p,add(mul(d,L*t),mul(u,L*.045*Math.sin(Math.PI*t)))),gap=released?.0035:0,col=young?[.26,.36,.10]:[.33,.20,.105];
  for(const sign of[-1,1])patch((t,x)=>add(center(t),add(mul(u,x*W*Math.pow(Math.sin(Math.PI*t),.4)),mul(v,sign*(.0006*(1-x*x)+gap*Math.sin(Math.PI*t))))),fine?72:10,fine?12:3,col,.36,fine?.0002:0,[W*2,L]);
  if(released)for(let k=0;k<8;k++){const q=add(center(.1+.8*k/7),mul(v,-.0015));seedBody(q,d,.005,.0018,[.21,.13,.065]);out.seeds++;}out.valves=2;out.length=L;out.sutures=2;focus=add(center(.5),mul(v,gap+.0009));
 }else if(type==='dawnredwood'){
  const L=R(1,.018,.025)*(young?.7:1),radius=L*.41,p=add(base,mul(d,.025)),opening=released?.004:.0008;rod(base,p,.0008);seedBody(p,d,L,radius*.78,[.25,.16,.09],.32);
  const layers=fine?12:8;for(let row=0;row<layers;row++)for(let hand=0;hand<2;hand++){
   const t=.12+.76*row/(layers-1),a=hand*Math.PI+(row%2)*Math.PI/2,radial=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),side=add(mul(u,-Math.sin(a)),mul(v,Math.cos(a))),r=radius*Math.sin(Math.PI*t)+opening,q=add(p,add(mul(d,L*t),mul(radial,r)));
   patch((s,x)=>{const yy=(s-.5)*L*.17,angle=x*.88*Math.pow(Math.sin(Math.PI*s),.32),depression=-.00075*Math.exp(-Math.pow(x/.5,2)-Math.pow((s-.5)/.25,2)),lip=.00020*Math.sin(s*9+x*4);return add(q,add(mul(d,yy),add(mul(side,Math.sin(angle)*r),mul(radial,(Math.cos(angle)-1)*r+depression+lip))));},fine?20:3,fine?16:3,young?[.30,.36,.13]:[.36,.23,.13],.32,fine?.00045:.00025,[L*.4,L*.22]);out.scales++;out.scaleRecords.push({pair:row,hand,azimuth:a,height:t,peltate:true});if(row===5&&hand===0)focus=q;
  }out.length=L;out.oppositeDecussate=true;out.opening=released?1:0;if(released){out.wingedSeeds=4;for(let k=0;k<4;k++)wingedSeed(add(p,add(mul(d,L*(.30+.12*k)),add(mul(v,radius+opening*.75),mul(u,(k-1.5)*.002)))),d,.004,.0014);}
 }else if(type==='sweetgum'){
  const D=R(1,.022,.030)*(young?.7:1),radius=D*.38,p=add(base,mul(d,.035));rod(base,p,.00085);seedBody(p,d,D,radius,young?[.29,.36,.12]:[.29,.20,.12]);const center=add(p,mul(d,D*.5)),count=fine?36:14;
  for(let k=0;k<count;k++){const yy=1-2*(k+.5)/count,a=k*GOLD,rr=Math.sqrt(1-yy*yy),radial=norm(add(mul(d,yy),add(mul(u,Math.cos(a)*rr),mul(v,Math.sin(a)*rr)))),q=add(center,mul(radial,radius)),[side,up]=frame(radial);seedBody(add(q,mul(radial,-.002)),radial,.0045,.0025,[.34,.24,.14]);
   for(const sign of[-1,1]){const tip=add(q,add(mul(radial,D*.17),mul(side,sign*D*(released?.065:.035))));rod(q,tip,.00038,[.36,.25,.14]);}if(fine)for(const sign of[-1,1])patch((t,x)=>add(q,add(mul(radial,.004*t),add(mul(up,x*.0017*Math.sin(Math.PI*t)),mul(side,sign*((released?.0012:.00025)*Math.sin(Math.PI*t)+.0003*(1-x*x)))))),12,6,[.33,.23,.13],.36,.00012,[.0034,.004]);if(released&&fine&&k%6===0)wingedSeed(add(q,mul(radial,.004)),radial,.004,.0012);out.capsules++;if(k===Math.floor(count/2))focus=add(q,mul(radial,.003));
  }out.length=D;out.persistentStyles=out.capsules*2;out.valves=out.capsules*2;out.opening=released?1:0;if(released)out.wingedSeeds=6;
 }
 return{...out,focus,inspectDistance:type==='redbud'?.025:type==='maple'?.03:.022};
}
