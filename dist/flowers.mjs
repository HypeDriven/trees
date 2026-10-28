import {organDirection,blossomDevelopment} from './organ-distribution.mjs?v=21';
import {triangulateContour} from './leaf-shapes.mjs?v=21';

// Metres throughout. Species-level organ arrangements follow the references;
// tissue thickness, pigment, pubescence and pollen relief remain illustrative.
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
const frame=d=>{const u=norm(cross(d,Math.abs(d[1])>.94?[1,0,0]:[0,1,0]));return[u,norm(cross(d,u))]},TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
const hash=x=>{const a=Math.sin(x*127.1+311.7)*43758.5453;return a-Math.floor(a)};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));

export const FLOWER_NOTES={
 sakura:{name:'Yoshino blossom',kind:'Flower',text:'Five broad, shallowly notched petals surround about 32 unequal stamens and one style. A narrow hairy hypanthium, five sepals and curved 20–25 mm pedicels connect the flowers to a short cluster axis.',source:'https://efloras.org/florataxon.aspx?flora_id=2&taxon_id=200010692'},
 maple:{name:'Sugar maple flower',kind:'Flower',text:'Small hanging green-yellow flowers have a lobed calyx and no petals. The male study has eight stamens; the female study has a two-carpellate ovary and two spreading styles. Sex expression and stamen number vary.',source:'https://gobotany.nativeplanttrust.org/species/acer/saccharum/'},
 redbud:{name:'Chinese redbud flower',kind:'Flower',text:'Five unequal petals form a pea-like corolla. The standard is the smallest and lies inside the other petals; ten free stamens and the pistil sit within the keel. Short pedicels attach clusters to old wood.',source:'https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=106222'},
 sweetgum:{name:'Chinese sweetgum inflorescence',kind:'Flower',text:'Separate male spikes and spherical female heads occur on the same tree. The female study resolves 30 flowers with paired recurved styles and sterile needle-like teeth; the male study resolves stamen-bearing spikes. No showy petals.',source:'https://efloras.org/florataxon.aspx?flora_id=2&taxon_id=200010557'},
 dawnredwood:{name:'Dawn-redwood pollen cone',kind:'Pollen',text:'Male cones occur in opposite pairs on slender panicles. Spirally arranged microsporophylls carry three pollen sacs in this representative model; the basal protective scales are decussate. These are pollen cones, not flowers.',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC3578910/'},
 chinesepine:{name:'Chinese pine pollen cone',kind:'Pollen',text:'Small pollen cones have a spiral series of microsporophylls, each bearing two pollen sacs. The representative cones are 5–9 mm long, following Flora of China; they are separate from the large woody seed cones.',source:'https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=210001654'},
 ginkgo:{name:'Ginkgo ovule pair',kind:'Ovule',text:'The female preset has two naked ovules at the end of a forked stalk. Each ovule has a basal collar and an apical micropyle. A small pollination drop is represented. Ginkgo has no flowers, stigma or ovary.',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC3489653/'}
};

function quadratic(points,control,end,n){const start=points.at(-1);for(let i=1;i<=n;i++){const t=i/n,s=1-t;points.push([s*s*start[0]+2*s*t*control[0]+t*t*end[0],s*s*start[1]+2*s*t*control[1]+t*t*end[1]])}}
export function sakuraPetalContour(fine=true){
 if(!fine)return [[0,0],[.85,.55],[.60,.96],[0,.955],[-.60,.96],[-.85,.55]];
 const p=[[0,0]];quadratic(p,[.28,.10],[.76,.40],4);quadratic(p,[1.14,.69],[.84,.89],6);quadratic(p,[.60,1.045],[.24,.995],5);quadratic(p,[.10,1.005],[0,.955],4);
 return [...p,...p.slice(1,-1).reverse().map(([x,y])=>[-x,y])];
}
const sepalContour=fine=>{const p=[[0,0]];quadratic(p,[.9,.13],[.72,.47],fine?5:1);quadratic(p,[.38,.82],[0,1],fine?5:1);return[...p,...p.slice(1,-1).reverse().map(([x,y])=>[-x,y])];};
const roundedPetal=(fine=true)=>{const p=[[0,0]];quadratic(p,[.22,.10],[.85,.43],fine?4:1);quadratic(p,[1.08,.86],[.40,.98],fine?7:2);quadratic(p,[.15,1.04],[0,1],fine?4:1);return[...p,...p.slice(1,-1).reverse().map(([x,y])=>[-x,y])];};

export function buildFlowers(mesh,cfg,{base=[0,0,0],axis=[0,0,1],fine=false,seed=cfg.seed,study=false}={}){
 const type=cfg.type,d=norm(axis),[u,v]=frame(d),macro=study&&cfg.flowerLayout!=='cluster',stage=study?(cfg.flowerStage??'open'):'open',R=(i,a,b)=>a+(b-a)*hash(seed+i*1.731),detail=fine?macro?2:1:0;
 const out={type,stage,clusterAxis:[...d],flowers:0,petals:0,sepals:0,stamens:0,styles:0,stigmas:0,anthers:0,thecae:0,ovules:0,pollenCones:0,pollenSacs:0,microsporophylls:0,staminodes:0,hairs:0,pollenGrains:0,pedicelLengths:[],flowerRecords:[],petalRecords:[],scaleRecords:[],length:0};
 let focus=[...base],surfaceFocus=[...base],center=[...base];
 const tri=(a,b,c,normal,col,kind,uv=[[0,0],[0,0],[0,0]],phase=seed*.013)=>{if(dot(cross(sub(b,a),sub(c,a)),normal)<0){[b,c]=[c,b];[uv[1],uv[2]]=[uv[2],uv[1]];}for(const [i,p]of[a,b,c].entries())mesh.v(p,normal,col,kind,phase,0,uv[i]);};
 function quad(q,normal,col,kind,uv,phase=seed*.013){tri(q[0],q[1],q[2],normal,col,kind,[uv[0],uv[1],uv[2]],phase);tri(q[2],q[1],q[3],normal,col,kind,[uv[2],uv[1],uv[3]],phase);}
 function smoothQuad(q,col,kind){const n=norm(add(q[0].n,q[2].n)),order=dot(cross(sub(q[1].p,q[0].p),sub(q[2].p,q[0].p)),n)<0?[0,2,1,2,3,1]:[0,1,2,2,1,3];for(const i of order)mesh.v(q[i].p,q[i].n,col,kind,seed*.013,0,q[i].uv);}
 function tube(points,r0,r1,col,kind=.30,sides=fine?8:3){
  if(!fine){let length=0;for(let j=0;j<points.length-1;j++){const a=points[j],b=points[j+1],dir=norm(sub(b,a)),[side,n]=frame(dir),r=r0+(r1-r0)*j/(points.length-1),q=[add(a,mul(side,r)),sub(a,mul(side,r)),b];tri(...q,n,col,kind);mesh.preview.push({pts:q,n,c:col,kind,phase:0});length+=Math.hypot(...sub(b,a));}return length;}
  let length=0;const rings=[];for(let j=0;j<points.length;j++){if(j)length+=Math.hypot(...sub(points[j],points[j-1]));const t=j/(points.length-1),dir=norm(sub(points[Math.min(j+1,points.length-1)],points[Math.max(0,j-1)])),[a,b]=frame(dir),r=r0*(1-t)+r1*t;rings.push(Array.from({length:sides+1},(_,k)=>{const theta=k/sides*TAU,n=add(mul(a,Math.cos(theta)),mul(b,Math.sin(theta)));return{p:add(points[j],mul(n,r)),n,uv:[k/sides*TAU*r,length]}}));}
  for(let j=0;j<rings.length-1;j++)for(let k=0;k<sides;k++){const q=[rings[j][k],rings[j+1][k],rings[j][k+1],rings[j+1][k+1]],n=norm(add(q[0].n,q[2].n));smoothQuad(q,col,kind);if(fine)mesh.preview.push({pts:[q[0].p,q[1].p,q[3].p,q[2].p],n,c:col,kind,phase:0});}
  if(!fine){const [a]=frame(norm(sub(points.at(-1),points[0])));mesh.preview.push({pts:[add(points[0],mul(a,r0)),...points.slice(1),sub(points[0],mul(a,r0))],n:a,c:col,kind,phase:0});}
  return length;
 }
 function ellipsoid(p,dir,radii,col,kind=.312,quality=detail){
  const [a,b]=frame(dir),rows=quality===2?12:quality===1?7:3,sides=quality===2?18:quality===1?10:5,point=(t,s)=>{const theta=t*Math.PI,phi=s*TAU;return add(p,add(mul(dir,Math.cos(theta)*radii[1]),add(mul(a,Math.sin(theta)*Math.cos(phi)*radii[0]),mul(b,Math.sin(theta)*Math.sin(phi)*radii[2]))))};
  for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const t=j/rows,tt=(j+1)/rows,s=k/sides,ss=(k+1)/sides,coords=[[t,s],[tt,s],[t,ss],[tt,ss]],q=coords.map(([t,s])=>point(t,s)),n=norm(sub(point((t+tt)*.5,(s+ss)*.5),p));smoothQuad(coords.map(([t,s],i)=>{const theta=t*Math.PI,phi=s*TAU;return{p:q[i],n:norm(add(mul(dir,Math.cos(theta)/radii[1]),add(mul(a,Math.sin(theta)*Math.cos(phi)/radii[0]),mul(b,Math.sin(theta)*Math.sin(phi)/radii[2])))),uv:[s*radii[0]*TAU,t*radii[1]*2]}}),col,kind);if(fine)mesh.preview.push({pts:[q[0],q[1],q[3],q[2]],n,c:col,kind,phase:0});}
 }
 function hair(p,normal,L,index){const[a,b]=frame(normal),tip=add(p,add(mul(normal,L),mul(a,L*.25*Math.sin(index*2.4))));tri(add(p,mul(b,.000008)),sub(p,mul(b,.000008)),tip,a,[.64,.63,.49],.30);out.hairs++;}
 function path(p,q,bend=[0,0,0],steps=fine?10:1){return Array.from({length:steps+1},(_,j)=>{const t=j/steps;return add(mix(p,q,t),mul(bend,4*t*(1-t)))});}
 function anther(p,filamentAxis,scale=1,index=0){
  const[a,b]=frame(filamentAxis),radius=.00024*scale,L=.00048*scale;
  for(const sign of[-1,1]){const q=add(p,mul(a,sign*.00017*scale));ellipsoid(q,b,[radius,L,radius*.76],[.75,.56,.17],.312);out.thecae++;
   if(fine){const slit=add(q,mul(filamentAxis,radius*.80));tube(path(add(slit,mul(b,-L*.72)),add(slit,mul(b,L*.72)),mul(a,sign*.000025*scale),4),.000014*scale,.000011*scale,[.44,.30,.10],.311,4);}
   if(macro&&type==='sakura')for(let k=0;k<5;k++){const a0=(k+.4)*GOLD+index,rr=.000026,grain=add(q,add(mul(filamentAxis,radius*.84),add(mul(a,Math.cos(a0)*radius*.6),mul(b,Math.sin(a0)*L*.70))));ellipsoid(grain,b,[rr,rr*.85,rr],[.84,.66,.28],.313,0);out.pollenGrains++;}
  }out.anthers++;
 }
 function petal(p,outward,side,face,L,W,{notched=false,opening=1,twist=0,cup=.10,fold=.045,color=[.90,.81,.82],index=0,sepal=false}={}){
  const contour=sepal?sepalContour(fine):notched?sakuraPetalContour(fine):roundedPetal(fine),ids=triangulateContour(contour),thickness=fine?(sepal?.00009:.000075):0;
  const point=([x,y],back=false)=>{const spread=W*(.15+.85*opening),radial=L*y*opening,z=L*(y*(1-opening)*.84+cup*y*y+twist*x*y)+Math.sin(x*8+y*4+index)*L*.003*y*y+W*fold*x*x*Math.sin(Math.PI*y);return add(p,add(mul(outward,radial),add(mul(side,x*spread),mul(face,z-(back?thickness:0)))));};
  const normal=(q,back=false)=>{const[x,y]=q,dx=sub(point([x+.001,y],back),point([x-.001,y],back)),dy=sub(point([x,y+.001],back),point([x,y-.001],back)),n=norm(cross(dy,dx));return back?mul(n,-1):n;};
  const emit=(a,b,c,back)=>{let points=[a,b,c],n=normal(a,back);if(dot(cross(sub(point(b,back),point(a,back)),sub(point(c,back),point(a,back))),n)<0)points=[a,c,b];for(const q of points){const pink=Math.exp(-q[1]*5.5),col=sepal?color:color.map((c,k)=>c*(1-pink*.12)+[.12,-.04,-.025][k]*pink);mesh.v(point(q,back),normal(q,back),col,sepal?.30:back?.307:.306,seed*.013+index*.731,0,[q[0]*W,q[1]*L]);}};
  const split=(a,b,c,level,back)=>{if(!level){emit(a,b,c,back);return;}const ab=mix(a,b,.5),bc=mix(b,c,.5),ca=mix(c,a,.5);split(a,ab,ca,level-1,back);split(ab,b,bc,level-1,back);split(ca,bc,c,level-1,back);split(ab,bc,ca,level-1,back);};
  for(let back=0;back<(fine?2:1);back++)for(const tri of ids)split(...tri.map(i=>contour[i]),fine?(sepal?1:macro?3:2):0,!!back);
  if(fine)for(let j=0;j<contour.length;j++)for(let edge=0,steps=1<<(sepal?1:macro?3:2);edge<steps;edge++){const a=mix(contour[j],contour[(j+1)%contour.length],edge/steps),b=mix(contour[j],contour[(j+1)%contour.length],(edge+1)/steps),q=[point(a),point(b),point(a,true),point(b,true)],n=norm(cross(sub(q[1],q[0]),sub(q[2],q[0])));quad(q,n,color,sepal?.30:.306,[[a[0]*W,a[1]*L],[b[0]*W,b[1]*L],[a[0]*W,a[1]*L],[b[0]*W,b[1]*L]],seed*.013+index*.731);}
  mesh.preview.push({pts:contour.map(q=>point(q)),n:face,c:color,kind:sepal?.30:.306,phase:0});
  if(!sepal)out.petalRecords.push({length:L,width:W*2,thickness,notched,tip:[...point([0,.955])],shoulder:[...point([.24,.995])],index});
  return point([0,.67]);
 }
 function calyx(p,face,H,radius,sepals=5,pilose=false,opening=1){
  if(!fine){const[a,b]=frame(face),rim=add(p,mul(face,H));for(let k=0;k<3;k++){const x=k/3*TAU,y=(k+1)/3*TAU,pa=add(rim,add(mul(a,Math.cos(x)*radius),mul(b,Math.sin(x)*radius))),pb=add(rim,add(mul(a,Math.cos(y)*radius),mul(b,Math.sin(y)*radius))),n=norm(cross(sub(pa,p),sub(pb,p)));tri(p,pa,pb,n,[.37,.22,.16],.30);}out.sepals+=sepals;return rim;}
  const[a,b]=frame(face),calyxColor=type==='maple'?[.43,.49,.16]:type==='redbud'?[.39,.13,.25]:[.37,.19,.16],sepalLength=type==='maple'?.0013:type==='redbud'?.0010:.0045,sepalWidth=type==='maple'?.00040:type==='redbud'?.00060:.0010,rows=fine?20:2,sides=fine?40:5,point=(t,k,inside=false)=>{const angle=k/sides*TAU,r=radius*(.42+.58*t)*(inside?.83:1),n=add(mul(a,Math.cos(angle)),mul(b,Math.sin(angle)));return{p:add(p,add(mul(face,H*t),mul(n,r))),n:inside?mul(n,-1):n,uv:[angle*r,H*t]}};
  for(const inside of[false,true])for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const q=[point(j/rows,k,inside),point((j+1)/rows,k,inside),point(j/rows,k+1,inside),point((j+1)/rows,k+1,inside)],n=norm(add(q[0].n,q[2].n)),col=inside?[.45,.43,.22]:calyxColor;quad(q.map(x=>x.p),n,col,.30,q.map(x=>x.uv));}
  for(let k=0;k<sides;k++){const a0=point(1,k),b0=point(1,k+1),a1=point(1,k,true),b1=point(1,k+1,true);quad([a0.p,b0.p,a1.p,b1.p],face,[.40,.29,.17],.30,[a0.uv,b0.uv,a1.uv,b1.uv]);}
  for(let k=0;k<sides;k++){const a0=point(0,k),b0=point(0,k+1);tri(p,a0.p,b0.p,mul(face,-1),[.34,.28,.14],.30);}
  const rim=add(p,mul(face,H));for(let j=0;j<sepals;j++){const angle=j*TAU/sepals,radial=add(mul(a,Math.cos(angle)),mul(b,Math.sin(angle))),side=norm(cross(face,radial));petal(add(rim,mul(radial,radius*.7)),norm(add(radial,mul(face,type==='sakura'&&opening<.30?.55:-.65))),side,face,sepalLength,sepalWidth,{sepal:true,cup:-.12,color:calyxColor,index:j});out.sepals++;}
  if(fine&&pilose)for(let j=0;j<(macro?160:60);j++){const t=.08+.84*hash(seed+j*9),theta=j*GOLD,n=add(mul(a,Math.cos(theta)),mul(b,Math.sin(theta))),q=add(p,add(mul(face,H*t),mul(n,radius*(.42+.58*t))));hair(q,n,.00014+.00010*hash(j+seed),j);}
  return rim;
 }
 function cherry(){
  out.notchedPetals=true;
  const count=study?(cfg.flowerLayout==='cluster'?4:1):fine?4:3+(hash(seed+41)>.7?1:0),top=add(base,[0,.003,0]);tube([base,top],.0007,.00055,[.29,.38,.13]);
  for(let flower=0;flower<count;flower++){
   const development=blossomDevelopment(cfg,seed,flower,{study,stage}),{opening,roll}=development,flowerStage=development.stage,azimuth=flower*GOLD+R(21,0,TAU),offset=norm(add(mul(u,Math.cos(azimuth)*.85),add([0,R(flower+91,-.35,.75),0],mul(v,Math.sin(azimuth)*.85)))),face=study&&!flower?d:study?norm(add(mul(d,.68),add(mul(u,Math.cos(azimuth)*.72),mul(v,Math.sin(azimuth)*.60)))):organDirection(type,d,base,seed,{index:flower}),L=R(flower+19,.020,.025),end=add(top,mul(offset,L)),pedicel=path(top,end,mul(d,-.0025),fine?14:2),arc=pedicel.slice(1).reduce((s,p,i)=>s+Math.hypot(...sub(p,pedicel[i])),0),points=pedicel.map(p=>add(top,mul(sub(p,top),L/arc)));
   out.pedicelLengths.push(tube(points,.00038,.00027,[.28,.39,.13],.30));const attachment=points.at(-1),H=.0075,rim=calyx(attachment,face,H,.00155,5,true,opening),[a,b]=frame(face),radius=.0013;
   if(fine)for(let j=0;j<(macro?100:32);j++){const t=.06+.90*hash(seed+j*3.71),i=Math.min(points.length-2,Math.floor(t*(points.length-1))),theta=j*GOLD,n=add(mul(a,Math.cos(theta)),mul(b,Math.sin(theta)));hair(add(points[i],mul(n,.00035)),n,.00012,j);}
   for(let j=0;j<5;j++){const angle=Math.PI/2+roll+j*TAU/5+R(flower*100+j,-.035,.035),outward=add(mul(a,Math.cos(angle)),mul(b,Math.sin(angle))),side=norm(cross(face,outward)),p=add(rim,add(mul(outward,radius),mul(face,j*.000055))),length=R(flower*100+j+41,.0130,.0145),width=length*R(flower*100+j+71,.51,.55),point=petal(p,outward,side,face,length,width,{notched:true,opening,cup:flowerStage==='late'?-.055:.11,twist:R(j+flower*20,-.06,.06),color:flowerStage==='bud'?[.82,.44,.54]:flowerStage==='late'?[.89,.79,.79]:[.94,.88,.88],index:flower*5+j});out.petals++;if(!flower&&j===0)surfaceFocus=point;}
   if(fine)ellipsoid(add(rim,mul(face,-.0035)),face,[.00085,.0015,.00085],[.39,.46,.20],.30);else tri(add(rim,mul(a,-.0012)),add(rim,mul(a,.0012)),add(rim,mul(b,.0016)),face,[.74,.59,.25],.30);
   const stamens=fine?32:0,anthers=[];for(let j=0;j<stamens;j++){const ring=j<12?0:j<23?1:2,theta=j*GOLD+flower*.12,radial=add(mul(a,Math.cos(theta)),mul(b,Math.sin(theta))),origin=add(rim,mul(radial,.0014+ring*.00042)),length=R(j+flower*40+101,.0058,.0086)*(flowerStage==='bud'?.60:1),tip=add(rim,add(mul(face,length),mul(radial,(.0043-ring*.00065)*(flowerStage==='bud'?.30:1)))),pts=path(origin,tip,mul(radial,-.0008),macro?10:6);tube(pts,.000058,.000042,[.87,.84,.67],.311,macro?10:6);anther(tip,norm(sub(tip,pts.at(-2))),.85,j);out.stamens++;anthers.push(tip);}
   if(fine){const styleBase=add(rim,mul(face,-.0030)),tip=add(rim,add(mul(face,.0083),mul(a,.00035)));tube(path(styleBase,tip,mul(b,.00022),12),.00015,.00010,[.57,.64,.31],.311,10);ellipsoid(tip,face,[.00034,.00014,.00033],[.54,.65,.29],.314);out.styles++;out.stigmas++;if(macro)for(let k=0;k<20;k++){const t=k/20,q=add(styleBase,mul(sub(tip,styleBase),t*.20));hair(q,a,.00010,k);}}
   if(!flower){center=add(rim,mul(face,flowerStage==='bud'?.006:.003));focus=add(rim,mul(face,.004));out.length=flowerStage==='bud'?.009:(radius+.014)*2;}
   out.flowerRecords.push({petals:5,sepals:5,stamens,styles:fine?1:0,hypanthiumLength:H,hypanthiumDiameter:.0031,pedicelLength:out.pedicelLengths.at(-1),base:attachment,throat:rim,axis:face,opening,stage:flowerStage,roll});out.flowers++;
  }
 }
 function redbud(){
  const count=study?(cfg.flowerLayout==='cluster'?5:1):fine?5:4;
  for(let k=0;k<count;k++){const angle=k*GOLD+R(11,0,TAU),face=study&&!k?d:study?norm(add(d,add(mul(u,Math.cos(angle)*.65),mul(v,Math.sin(angle)*.65)))):organDirection(type,d,base,seed,{index:k}),[a,b]=frame(face),p=add(base,add([0,.006,0],mul(a,(k-(count-1)/2)*.006))),rim=calyx(p,face,.0032,.0021,5,false),up=mul(b,-1);out.pedicelLengths.push(tube(path(base,p,mul(v,-.001)),.00030,.00022,[.37,.14,.20]));
   const standard=petal(sub(rim,mul(face,.0004)),up,a,face,.0058,.0025,{opening:1,cup:.24,fold:.18,color:[.62,.10,.33],index:k*5});out.petals++;
   for(const sign of[-1,1]){petal(add(rim,mul(face,.00035)),norm(add(mul(up,.15),add(mul(a,sign*.85),mul(face,.34)))),up,face,.0084,.0030,{opening:.9,cup:.24,fold:.22,twist:sign*.12,color:[.62,.075,.32],index:k*5+sign+2});petal(add(rim,mul(face,.0007)),norm(add(mul(up,-.68),add(mul(a,sign*.16),mul(face,.74)))),a,face,.0082,.0025,{opening:.84,cup:.35,fold:.75,twist:sign*.10,color:[.46,.035,.23],index:k*5+sign+3});out.petals+=2;}
   if(fine){for(let j=0;j<10;j++){const origin=add(rim,mul(a,(j-4.5)*.00016)),tip=add(rim,add(mul(face,.0054),add(mul(up,-.0034),mul(a,(j-4.5)*.00025))));tube(path(origin,tip,mul(up,-.0015),8),.000055,.00004,[.78,.67,.52],.311,6);anther(tip,face,.58,j);out.stamens++;}const stigma=add(rim,add(mul(face,.006),mul(up,-.0037)));tube(path(rim,stigma,mul(up,-.0015)),.00013,.00008,[.58,.46,.28],.311,7);ellipsoid(stigma,face,[.00020,.00013,.00020],[.58,.56,.30],.314);out.styles++;out.stigmas++;}
   if(!k){center=add(rim,mul(face,.002));focus=add(rim,add(mul(face,.005),mul(up,-.0035)));surfaceFocus=standard;out.length=.013;}
   out.flowers++;
  }out.peaFlowers=true;out.standardInside=true;out.standardSmallest=true;
 }
 function maple(){
  const count=study?(cfg.flowerLayout==='cluster'?7:1):fine?7:4,female=study&&cfg.flowerSex==='female';
  for(let k=0;k<count;k++){const a=k*GOLD,stem=norm(add(mul(d,.8),add(mul(u,Math.cos(a)*.30),mul(v,Math.sin(a)*.30)))),L=R(k+8,.028,.060),p=add(base,mul(stem,L)),[x,y]=frame(stem);out.pedicelLengths.push(tube(path(base,p,mul(x,.003)),.00022,.00013,[.41,.43,.16]));const rim=calyx(p,stem,.0013,.0014,5,false);
   if(female){for(const sign of[-1,1])ellipsoid(add(rim,mul(x,sign*.00045)),stem,[.00072,.0010,.0008],[.40,.49,.15],.30);for(const sign of[-1,1]){const tip=add(rim,add(mul(stem,.0037),mul(x,sign*.0025)));tube(path(rim,tip,mul(y,.0004)),.00015,.00009,[.54,.61,.19],.311,8);ellipsoid(tip,stem,[.00014,.00022,.00010],[.57,.62,.20],.314);out.styles++;out.stigmas++;}for(let j=0;j<8;j++){const a=j*TAU/8,root=add(rim,add(mul(x,Math.cos(a)*.0011),mul(y,Math.sin(a)*.0011)));tube([root,add(root,mul(stem,.00045))],.000055,.000035,[.50,.54,.20],.311,5);out.staminodes++;}
   }else for(let j=0;j<(fine?8:3);j++){const angle=j*TAU/8,radial=add(mul(x,Math.cos(angle)),mul(y,Math.sin(angle))),tip=add(rim,add(mul(stem,R(j+k*20,.004,.0065)),mul(radial,.0020)));tube(path(rim,tip,mul(radial,.0005),fine?7:1),.00006,.000045,[.65,.66,.27],.311,6);if(fine)anther(tip,stem,.85,j);out.stamens++;}
   if(!k){center=rim;focus=add(rim,mul(stem,.004));surfaceFocus=rim;out.length=.008;}out.flowers++;
  }out.apetalous=true;out.sex=female?'female':'male';
 }
 function ginkgo(){
  const end=add(base,mul(d,.024));tube(path(base,end,mul(u,.002)),.00050,.00035,[.36,.43,.20]);
  for(const sign of[-1,1]){const p=add(end,add(mul(u,sign*.0027),mul(d,.001))),dir=norm(add(d,mul(u,sign*.2)));tube([end,p],.00033,.00026,[.38,.47,.20]);ellipsoid(add(p,mul(dir,.0014)),dir,[.00110,.0014,.0011],[.43,.54,.23],.30);
   const [a,b]=frame(dir),ring=Array.from({length:33},(_,j)=>add(p,add(mul(a,Math.cos(j/32*TAU)*.00125),mul(b,Math.sin(j/32*TAU)*.00125))));tube(ring,.00022,.00022,[.46,.54,.24],.30,fine?8:3);const micropyle=add(p,mul(dir,.0028));ellipsoid(micropyle,dir,[.00019,.00010,.00019],[.29,.39,.15],.30);if(fine){ellipsoid(add(micropyle,mul(dir,.00010)),dir,[.00025,.00025,.00025],[.73,.79,.58],.314);out.pollinationDrops=(out.pollinationDrops??0)+1;}out.ovules++;if(sign===1){focus=micropyle;center=add(p,mul(dir,.001));surfaceFocus=focus;}}
  out.collars=2;out.micropyles=2;out.length=.0030;
 }
 function pollen(){
  const redwood=type==='dawnredwood',count=study?(cfg.flowerLayout==='cluster'?redwood?6:5:1):fine?redwood?6:5:redwood?3:3,L=redwood?.0065:.0075;
  if(count>1)tube([base,add(base,mul(d,redwood?.038:.016))],.00045,.00030,[.34,.29,.14]);
  for(let cone=0;cone<count;cone++){
   const q=count===1?base:add(base,add(mul(d,(redwood?.007:.004)*(1+Math.floor(cone/2))),mul(u,(cone%2?1:-1)*(redwood?.008:.004)))),axis=count===1?d:norm(add(mul(d,redwood?.15:.9),mul(u,cone%2?.65:-.65))),[a,b]=frame(axis),N=fine?redwood?18:24:8,radius=redwood?.0015:.0017;tube([q,add(q,mul(axis,L))],.00038,.00015,[.50,.40,.17],.30);
   if(redwood)for(let pair=0;pair<4;pair++)for(const hand of[-1,1]){const theta=pair*Math.PI/2+(hand>0?Math.PI:0),radial=add(mul(a,Math.cos(theta)),mul(b,Math.sin(theta)));petal(add(q,mul(axis,pair*.00023)),radial,norm(cross(axis,radial)),axis,.0015,.00055,{sepal:true,cup:.5,color:[.43,.26,.14],index:pair});out.basalScales=(out.basalScales??0)+1;}
   for(let j=0;j<N;j++){const t=.10+.80*(j+.5)/N,angle=j*GOLD,radial=add(mul(a,Math.cos(angle)),mul(b,Math.sin(angle))),side=norm(cross(axis,radial)),origin=add(q,mul(axis,L*t)),tip=add(origin,mul(radial,radius*Math.sin(Math.PI*t)));
    petal(add(origin,mul(radial,radius*.70)),axis,side,radial,.0012,.00065,{sepal:true,cup:.25,color:redwood?[.52,.36,.17]:[.61,.48,.15],index:j});out.microsporophylls++;out.scaleRecords.push({cone,index:j,angle,sacs:redwood?3:2});
    if(fine)for(let sac=0;sac<(redwood?3:2);sac++){const offset=(sac-(redwood?1:.5))*.00046,p=add(tip,add(mul(side,offset),mul(axis,-.00026)));ellipsoid(p,axis,[.00026,.00060,.00025],redwood?[.63,.47,.23]:[.72,.58,.22],.312,1);out.pollenSacs++;}
   }out.pollenCones++;if(!cone){center=add(q,mul(axis,L*.5));focus=add(center,mul(a,radius));surfaceFocus=focus;out.length=L;}
  }out.spiralMicrosporophylls=true;
 }
 function sweetgum(){
  const male=study&&cfg.flowerSex==='male';out.sex=male?'male':'female';out.apetalous=true;
  if(male){const spikes=cfg.flowerLayout==='cluster'?3:1;for(let spike=0;spike<spikes;spike++){const p=add(base,mul(u,(spike-1)*.008)),end=add(p,mul(d,.018));tube([p,end],.00040,.0002,[.40,.44,.16]);for(let f=0;f<12;f++){const a=f*GOLD,radial=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),q=add(p,add(mul(d,.002+f*.0011),mul(radial,.0010)));for(let j=0;j<6;j++){const angle=j*GOLD,tip=add(q,add(mul(radial,.0019),add(mul(d,Math.sin(angle)*.00065),mul(u,Math.cos(angle)*.00065))));tube([q,tip],.00005,.00004,[.59,.60,.22],.311,5);anther(tip,radial,.55,j);out.stamens++;}out.flowers++;}center=add(p,mul(d,.010));focus=add(center,mul(u,.002));}out.maleSpikes=spikes;out.length=.018;surfaceFocus=focus;return;}
  const p=add(base,mul(d,.035)),count=fine?30:12,radius=.0033;tube(path(base,p,mul(u,.002)),.00050,.00035,[.38,.45,.16]);ellipsoid(p,d,[radius,radius,radius],[.35,.44,.16],.30);
  for(let k=0;k<count;k++){const y=1-2*(k+.5)/count,a=k*GOLD,r=Math.sqrt(1-y*y),radial=norm(add(mul(d,y),add(mul(u,Math.cos(a)*r),mul(v,Math.sin(a)*r)))),q=add(p,mul(radial,radius)),[x,z]=frame(radial);if(fine)ellipsoid(q,radial,[.00065,.0008,.00055],[.41,.50,.18],.30,1);
   for(const sign of[-1,1]){const root=add(q,mul(x,sign*.00035)),R=.0032,points=Array.from({length:fine?17:4},(_,j)=>{const t=j/(fine?16:3),a=t*2.3;return add(root,add(mul(radial,R*Math.sin(a)),mul(x,sign*R*(1-Math.cos(a)))));});tube(points,.00013,.000075,[.50,.49,.24],.311,fine?7:3);out.styles++;}
   if(fine)for(let tooth=0;tooth<5;tooth++){const a=tooth*GOLD,tip=add(q,add(mul(radial,.004),add(mul(x,Math.cos(a)*.0011),mul(z,Math.sin(a)*.0011))));tube([q,tip],.00007,.000025,[.45,.51,.22],.311,4);out.staminodes++;}out.flowers++;
  }out.femaleHead=true;center=p;focus=add(p,mul(u,.008));surfaceFocus=focus;out.length=.021;
 }
 if(type==='sakura')cherry();else if(type==='redbud')redbud();else if(type==='maple')maple();else if(type==='ginkgo')ginkgo();else if(type==='dawnredwood'||type==='chinesepine')pollen();else if(type==='sweetgum')sweetgum();else throw new Error('No detailed floral profile for '+type);
 return {...out,focus,surfaceFocus,center,inspectDistance:type==='sakura'?.025:type==='redbud'?.017:.012,surfaceDistance:type==='sakura'?.012:.008};
}
