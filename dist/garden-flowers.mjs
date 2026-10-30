// Geometric flower studies in metres; organ counts and tissue relief are
// representative rather than calibrated reproductive development.
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
const frame=d=>{const a=norm(cross(d,Math.abs(d[1])>.93?[1,0,0]:[0,1,0]));return[a,norm(cross(a,d))]},TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
import {blossomDevelopment} from './organ-distribution.mjs?v=24';
const hash=x=>{const t=Math.sin(x*127.1+311.7)*43758.5453;return t-Math.floor(t)};
export function buildGardenFlowers(mesh,cfg,{base=[0,0,0],axis=[0,1,0],fine=false,layoutFine=fine,maximum=false,seed=cfg.seed,crownRadius=0}={}){
 if(maximum)fine=true;
 axis=norm(axis);const [u,v]=frame(axis),rnd=(i,a,b)=>a+(b-a)*hash(seed+i*1.73),result={type:cfg.type,clusterAxis:[...axis],flowers:0,tepals:0,stamens:0,buds:0,flowerRecords:[]};
 function patch(point,rows,cols,col,kind=.3,thick=0,shape='blade'){
  const sample=(t,x,back=false)=>{const p=point(t,x),dt=sub(point(Math.min(1,t+.001),x),point(Math.max(0,t-.001),x)),dx=sub(point(t,Math.min(1,x+.001)),point(t,Math.max(-1,x-.001))),normal=norm(cross(dx,dt)),n=Math.hypot(...normal)>.5?normal:u;return{p:add(p,mul(n,back?-thick:0)),n:back?mul(n,-1):n,uv:[(x+1)*.02,t*.05]};};
  for(let back=0;back<(thick?2:1);back++)for(let j=0;j<rows;j++)for(let k=0;k<cols;k++){
   const t=j/rows,s=(j+1)/rows,x=k/cols*2-1,y=(k+1)/cols*2-1,q=[sample(t,x,!!back),sample(s,x,!!back),sample(t,y,!!back),sample(s,y,!!back)];
   for(const i of (back?[0,2,1,2,3,1]:[0,1,2,2,1,3]))mesh.v(q[i].p,q[i].n,typeof col==='function'?col(q[i].uv[1]/.05):col,kind,seed*.01,0,q[i].uv);
   if(fine)mesh.preview.push({pts:[q[0].p,q[1].p,q[3].p,q[2].p],n:q[0].n,c:typeof col==='function'?col(t):col,kind,phase:0});
  }
  if(!fine){const x=shape==='tube'?.5:1,pts=[];for(let j=0;j<=6;j++)pts.push(point(j/6,-x));for(let j=6;j>=0;j--)pts.push(point(j/6,x));mesh.preview.push({pts,n:sample(.5,0).n,c:typeof col==='function'?col(.5):col,kind,phase:0});}
 }
 function rod(p,q,r,col,kind=.3){const d=norm(sub(q,p)),[a,b]=frame(d);patch((t,x)=>{const angle=(x+1)*Math.PI;return add(add(p,mul(sub(q,p),t)),add(mul(a,Math.cos(angle)*r),mul(b,Math.sin(angle)*r)));},1,fine?6:3,col,kind,0,'tube');}
 function bell(p,d,L,opening=1){const [a,b]=frame(d);patch((t,x)=>{const angle=(x+1)*Math.PI,lip=.5+.5*Math.cos(angle*5),r=L*(.035+.12*t*t*opening),z=L*t+L*.10*lip*Math.pow(t,9);return add(add(p,mul(d,z)),add(mul(a,Math.cos(angle)*r),add(mul(b,Math.sin(angle)*r),mul(a,L*.05*Math.sin(t*Math.PI)))));},fine?22:2,fine?30:5,t=>[.22+.10*t,.11+.06*t,.47+.15*t],.3,fine?.00007:0,'tube');}
 if(cfg.type==='jacaranda'){
  const count=layoutFine?24:40,L=layoutFine?.16:.18,top=add(base,mul(axis,L));rod(base,top,.0007,[.29,.28,.16],.36);
  for(let k=0;k<count;k++){const t=.08+.87*(k+.5)/count,a=k*GOLD+seed*.017,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),q=add(base,mul(axis,L*t)),tip=add(q,mul(out,L*(.56-.36*t)*rnd(k+2,.65,1.10))),d=norm(add(mul(out,.5),[0,-.65,0]));rod(q,tip,.00025,[.28,.27,.15],.36);const development=blossomDevelopment(cfg,seed,k);bell(tip,d,rnd(k+5,.030,.041),development.opening);result.flowerRecords.push({axis:d,...development});result.flowers++;}
 }else if(cfg.type==='monkeytail'){
  const count=1+(hash(seed+9)>.45?1:0)+(cfg.season!=='summer'&&hash(seed+73)>.90?1:0);
  for(let flower=0;flower<count;flower++){
   const a=flower*GOLD+seed*.01,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),origin=add(base,add(mul(out,crownRadius*rnd(flower+37,.18,.48)),mul(axis,-.003))),peduncle=rnd(flower+3,.075,.150),d=norm(add(mul(axis,.93),mul(out,rnd(flower+27,.12,.32)))),bend=rnd(flower+47,-.007,.007),stalkPoint=t=>add(origin,add(mul(d,peduncle*t),mul(out,bend*Math.sin(Math.PI*t)))),stalk=Array.from({length:9},(_,j)=>stalkPoint(j/8));
   for(let j=0;j<8;j++)rod(stalk[j],stalk[j+1],.00065*(1-.28*j/8),[.25,.27,.105],.36);
   const stalkTip=stalk.at(-1),facing=norm(sub(stalkTip,stalk.at(-2))),ovaryLength=rnd(flower+61,.004,.008),p=add(stalkTip,mul(facing,ovaryLength)),[side,up]=frame(facing);
   patch((t,x)=>{const a=(x+1)*Math.PI,r=.0015*Math.pow(Math.sin(Math.PI*t),.35);return add(stalkTip,add(mul(facing,ovaryLength*t),add(mul(side,Math.cos(a)*r),mul(up,Math.sin(a)*r))));},fine?16:4,fine?14:6,[.23,.28,.10],.36,0,'tube');
   if(fine)for(let j=0;j<14;j++){const a=j*GOLD,t=.18+.7*hash(seed+j+flower*19),out=add(mul(side,Math.cos(a)),mul(up,Math.sin(a))),q=add(stalkTip,add(mul(facing,ovaryLength*t),mul(out,.0015*Math.pow(Math.sin(Math.PI*t),.35))));rod(q,add(q,add(mul(out,.0009),mul(facing,.0008))),.000045,[.39,.32,.19],.36);}
   for(let k=0;k<6;k++){const angle=k*TAU/6+seed*.017,out=add(mul(side,Math.cos(angle)),mul(up,Math.sin(angle))),edge=norm(cross(facing,out)),L=rnd(k+11,.038,.054),W=rnd(k+77,.0025,.004),cup=rnd(k+97,.08,.18);patch((t,x)=>add(p,add(mul(out,L*t),add(mul(edge,x*W*Math.pow(Math.sin(Math.PI*t),.65)),mul(facing,L*(cup+.14*x*x)*Math.sin(Math.PI*t))))),fine?26:5,fine?8:2,t=>[.43+.12*t,.28+.12*t,.60+.10*t],.3,fine?.00009:0);result.tepals++;const q=add(p,mul(out,.004)),end=add(q,add(mul(facing,.008),mul(out,.006)));rod(q,end,.0004,[.72,.64,.35]);rod(end,add(end,mul(facing,rnd(k+117,.012,.019))),.00075,[.57,.50,.26]);result.stamens++;}
   rod(p,add(p,mul(facing,.025)),.00035,[.56,.53,.36]);result.flowerRecords.push({base:origin,tip:p,axis:facing,peduncleLength:peduncle,stalk,ovaryLength});result.flowers++;
  }
 }else if(cfg.type==='eucalyptus'){
  const count=7+Math.floor(rnd(1,0,4.99)),p=add(base,mul(axis,.012));rod(base,p,.0006,[.37,.22,.15],.36);
  for(let k=0;k<count;k++){
   const a=k*GOLD+seed*.017,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),q=add(p,add(mul(out,.010),mul(axis,.003))),d=norm(add(axis,mul(out,.5))),[side,up]=frame(d);rod(p,q,.00035,[.38,.23,.15],.36);
   const development=blossomDevelopment(cfg,seed,k);if(development.opening<.55){patch((t,x)=>{const angle=(x+1)*Math.PI,r=.0027*Math.sin(Math.PI*t)*(1-.45*t);return add(add(q,mul(d,.009*t)),add(mul(side,Math.cos(angle)*r),mul(up,Math.sin(angle)*r)));},fine?18:4,fine?14:6,[.33,.36,.16],.38,0,'tube');result.buds++;continue;}
   const filaments=fine?40:7;
   for(let j=0;j<filaments;j++){const angle=j*GOLD,r=.0035*Math.sqrt((j+.5)/filaments)*(.55+.45*development.opening),origin=add(q,add(mul(side,Math.cos(angle)*r*.35),mul(up,Math.sin(angle)*r*.35))),tip=add(q,add(mul(d,.0045+rnd(j+k,.0,.002)),add(mul(side,Math.cos(angle)*r),mul(up,Math.sin(angle)*r))));rod(origin,tip,fine?.000055:.00009,[.76,.73,.57]);if(fine)rod(tip,add(tip,mul(d,.00035)),.00014,[.69,.63,.34]);result.stamens++;}result.flowerRecords.push({axis:d,...development});result.flowers++;
  }
 }
 return result;
}
