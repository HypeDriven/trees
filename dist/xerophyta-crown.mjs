// Xerophyta retinervis: persistent fan-shaped leaf sheaths surround a live
// terminal tuft. Dimensions follow Flora Zambesiaca; fibre layout is illustrative.
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1)),TAU=2*Math.PI,GOLD=Math.PI*(3-Math.sqrt(5));
const hash=x=>{const v=Math.sin(x*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const frame=d=>{const u=norm(cross(d,Math.abs(d[1])>.93?[1,0,0]:[0,1,0]));return[u,norm(cross(u,d))];};
export function buildXerophytaCrown(mesh,{apex,axis,radius=.02,count=6,phase=0,seed=2847,fine=false,live=true}={}){
 axis=norm(axis);const [u,v]=frame(axis),rnd=(k,a,b)=>a+(b-a)*hash(seed+k*1.73),leaves=[],sheaths=[],oldBases=[],domeHeight=Math.min(.009,radius*.35);
 function patch(point,rows,cols,col,kind=.2,thickness=0){
  const sample=(t,x,back)=>{const p=point(t,x),dt=sub(point(Math.min(1,t+.001),x),point(Math.max(0,t-.001),x)),dx=sub(point(t,Math.min(1,x+.001)),point(t,Math.max(-1,x-.001))),n=norm(cross(dx,dt));return{p:add(p,mul(n,back?-thickness:0)),n:back?mul(n,-1):n};};
  for(let j=0;j<rows;j++)for(let k=0;k<cols;k++)for(let back=0;back<(thickness?2:1);back++){
   const t=j/rows,s=(j+1)/rows,x=k/cols*2-1,y=(k+1)/cols*2-1,q=[sample(t,x,back),sample(s,x,back),sample(t,y,back),sample(s,y,back)],co=typeof col==='function'?col((t+s)/2):col;
   for(const i of(back?[0,1,2,2,1,3]:[0,2,1,2,3,1]))mesh.v(q[i].p,q[i].n,co,kind,phase,kind<.1?radius:0,kind<.1?[(i<2?x:y)*Math.PI*radius+Math.PI*radius,(i%2?s:t)*domeHeight]:[(i<2?x:y)*.5+.5,i%2?s:t]);
   mesh.preview.push({pts:[q[0].p,q[1].p,q[3].p,q[2].p],n:q[0].n,c:co,kind,phase:0});
  }
 }
 function strand(point,r,col){
  const rows=fine?9:4,sides=fine?5:3;
  for(let j=0;j<rows;j++){const t=j/rows,s=(j+1)/rows,a=point(t),b=point(s),d=norm(sub(b,a)),[side,up]=frame(d),ring=(p,k,scale)=>add(p,add(mul(side,Math.cos(k/sides*TAU)*r*scale),mul(up,Math.sin(k/sides*TAU)*r*scale)));
   for(let k=0;k<sides;k++){const q=[ring(a,k,1-.6*t),ring(b,k,1-.6*s),ring(a,k+1,1-.6*t),ring(b,k+1,1-.6*s)],n=norm(sub(q[0],a));for(const i of[0,2,1,2,3,1])mesh.v(q[i],n,col,.2,phase,0,[0,j/rows]);mesh.preview.push({pts:[q[0],q[1],q[3],q[2]],n,c:col,kind:.2,phase:0});}
  }
 }
 // A rough, covered growing end, without a planar cut face or polar bark UVs.
 const crownPoint=(t,x)=>{const a=(x+1)*Math.PI,r=radius*Math.cos(t*Math.PI/2)*(1+.035*Math.sin(a*11+phase+t*7)+.018*Math.sin(a*17-t*11)),height=domeHeight*Math.sin(t*Math.PI/2)+.0007*Math.sin(a*13+t*23)*Math.sin(Math.PI*t);return add(apex,add(mul(axis,height),add(mul(u,Math.cos(a)*r),mul(v,Math.sin(a)*r))));};
 patch(crownPoint,fine?24:12,fine?64:32,[.050,.036,.020],.2);
 for(let k=0;k<(fine?54:22);k++){const t0=rnd(k+310,.05,.68),a=rnd(k+411,-1,1),span=rnd(k+517,.10,.28);strand(t=>add(crownPoint(t0+t*span,a+.08*Math.sin(t*2+k)),mul(axis,.0002)),fine?.00012:.00016,[.085,.057,.031]);}
 const oldCount=12+Math.floor(rnd(17,0,5));
 for(let k=0;k<oldCount;k++){
  const a=phase+k*GOLD,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),side=norm(cross(axis,out)),length=rnd(k+24,.030,.060),endHeight=rnd(k+53,.002,.014),width=radius*rnd(k+85,.32,.54),tone=rnd(k+102,.75,1.25),col=[.12,.079,.043].map(c=>c*tone);
  const point=(t,x)=>{const r=radius*(1+.075*Math.sin(t*Math.PI))*(1-.25*t*t),w=width*(1-.84*t);return add(apex,add(mul(axis,endHeight-length*(1-t)),add(mul(out,r+.0004*Math.sin(t*9+k)),mul(side,x*w))));};
  // Open parallel wiry fibres linked by short threads.
  // Weathered bases retain an open lattice rather than rectangular membrane panels.
  const fibres=fine?9:5;
  for(let j=0;j<fibres;j++){const extent=rnd(k*47+j+639,.73,1.06);strand(t=>point(t*extent,(j/(fibres-1)*2-1)*(1-.08*Math.sin(t*6+k))),fine?.00013:.00018,col);}
  for(let j=0;j<(fine?5:2);j++){const t=.32+j*(fine?.125:.30);strand(x=>point(t+.025*Math.sin(x*Math.PI),x*2-1),.00010,col.map(c=>c*.85));}
  oldBases.push({length,base:point(0,0),tip:point(1,0)});
 }
 if(live)for(let k=0;k<count;k++){
  const age=k/Math.max(1,count-1),a=phase+k*GOLD,out=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),edge=norm(cross(axis,out)),length=rnd(k+203,.032,.055),heightFraction=.50+.33*age,baseRadius=radius*Math.sqrt(1-heightFraction*heightFraction)+.00055,height=domeHeight*heightFraction,base=add(apex,add(mul(axis,height),mul(out,baseRadius))),direction=norm(add(mul(axis,.60+.65*age),mul(out,.88-.65*age))),normal=norm(cross(edge,direction)),bladeWidth=rnd(k+239,.0015,.0027);
  const point=(t,x)=>{const y=height-length*(1-t),envelope=y>=0?radius*Math.sqrt(Math.max(0,1-(y/domeHeight)**2))+.0003:radius+.0003,r=Math.max(envelope,radius*(1-t)+baseRadius*t+.0015*Math.sin(t*Math.PI)),w=radius*.45*(1-t)+bladeWidth*t,center=add(apex,add(mul(axis,y),mul(out,r)));return add(center,add(mul(edge,x*w),mul(out,.0007*Math.abs(x)*Math.sin(Math.PI*t))));};
  patch(point,fine?24:8,fine?8:4,t=>[.16+.025*t,.115+.15*t,.045+.015*t],.2,.00018);
  if(fine)for(let j=0;j<7;j++)strand(t=>add(point(t,(j/6*2-1)),mul(out,.00012)),.000075,[.22,.19,.075]);
  leaves.push({base,axis:direction,normal,age});sheaths.push({length,base:point(0,0),tip:base});
 }
 return{apex:[...apex],axis:[...axis],radius,domeHeight,leaves,sheaths,oldBases,closedCrown:true};
}
