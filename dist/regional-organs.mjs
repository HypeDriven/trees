import {blossomDevelopment} from './organ-distribution.mjs?v=25';
import {REGIONAL_REPRODUCTION} from './regional-reproduction.mjs?v=25';
// Shared anatomical builders. All lengths and UV coordinates are in metres.
const TAU=Math.PI*2,GOLD=Math.PI*(3-Math.sqrt(5));
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
const hash=x=>{const n=Math.sin(x*127.1+311.7)*43758.5453;return n-Math.floor(n);};
const frame=d=>{const u=norm(cross(d,Math.abs(d[1])>.94?[1,0,0]:[0,1,0]));return[u,norm(cross(d,u))];};
const green=[.29,.39,.13],brown=[.36,.23,.11],gold=[.82,.60,.17];
function anatomy(mesh,{fine,maximum,seed}){
 const quality=maximum?2:fine?1:0,rows=[2,12,24][quality],sides=[4,12,20][quality],phase=seed*.013;
 function triangle(points,normals,col,kind,uv){
  const n=cross(sub(points[1],points[0]),sub(points[2],points[0]));if(Math.hypot(...n)<1e-18)return;
  if(dot(n,normals[0])<0){[points[1],points[2]]=[points[2],points[1]];[normals[1],normals[2]]=[normals[2],normals[1]];[uv[1],uv[2]]=[uv[2],uv[1]];}
  for(let i=0;i<3;i++)mesh.v(points[i],normals[i],col,kind,phase,0,uv[i]);
  if(!fine)mesh.preview.push({pts:points,n:norm(n),c:col,kind,phase:0});
 }
 function patch(point,color,kind=.36,{rows:r=rows,cols:c=sides,thickness=0,reverse=false,uvScale=[1,1]}={}){
  const sample=(t,s,back=false)=>{const p=point(t,s),dt=sub(point(Math.min(1,t+.0001),s),point(Math.max(0,t-.0001),s)),ds=sub(point(t,Math.min(1,s+.0001)),point(t,Math.max(0,s-.0001))),n=mul(norm(cross(dt,ds)),reverse?-1:1);return{p:back?sub(p,mul(n,thickness)):p,n:back?mul(n,-1):n,uv:[s*uvScale[0],t*uvScale[1]]};};
  const quad=(a,b,c,d,col,k)=>{for(const indices of [[a,b,c],[c,b,d]])triangle(indices.map(v=>v.p),indices.map(v=>v.n),col,k,indices.map(v=>v.uv));};
  for(const back of thickness?[false,true]:[false])for(let j=0;j<r;j++)for(let k=0;k<c;k++){
   const t=j/r,s=k/c,a=sample(t,s,back),b=sample((j+1)/r,s,back),cc=sample(t,(k+1)/c,back),d=sample((j+1)/r,(k+1)/c,back),col=typeof color==='function'?color((j+.5)/r,(k+.5)/c):color;
   quad(a,b,cc,d,col,back&&kind===.306?.307:kind);
  }
  if(thickness)for(const boundary of [0,1,2,3]){const count=boundary<2?c:r;for(let k=0;k<count;k++){
   const q=t=>boundary<2?[boundary,t]:[t,boundary-2],a=q(k/count),b=q((k+1)/count),points=[sample(...a),sample(...b),sample(...a,true),sample(...b,true)],n=norm(cross(sub(points[1].p,points[0].p),sub(points[2].p,points[0].p)));for(const p of points)p.n=n;quad(...points,typeof color==='function'?color(...a):color,kind);
  }}
 }
 function ellipsoid(p,d,L,W,color,kind=.36,shape=0){const [u,v]=frame(d);patch((t,s)=>{const a=s*TAU,r=W*.5*Math.sin(Math.PI*t)*(shape?1+shape*Math.cos(a*3):1);return add(p,add(mul(d,L*t),add(mul(u,Math.cos(a)*r),mul(v,Math.sin(a)*r))));},color,kind,{rows:[2,6,10][quality],cols:[4,8,12][quality],reverse:true,uvScale:[Math.PI*W,L]});}
 function tube(points,r0,r1,color=green,kind=.30){let total=0;const arcs=[0];for(let i=1;i<points.length;i++){total+=Math.hypot(...sub(points[i],points[i-1]));arcs.push(total);}const n=sides,at=(i,k)=>{const t=arcs[i]/(total||1),d=norm(sub(points[Math.min(points.length-1,i+1)],points[Math.max(0,i-1)])),[u,v]=frame(d),a=k/n*TAU,r=r0+(r1-r0)*t,normal=add(mul(u,Math.cos(a)),mul(v,Math.sin(a)));return{p:add(points[i],mul(normal,r)),n:normal,uv:[a*r,arcs[i]]};};
  for(let i=0;i<points.length-1;i++)for(let k=0;k<n;k++){const q=[at(i,k),at(i+1,k),at(i,k+1),at(i+1,k+1)];for(const ids of[[0,1,2],[2,1,3]])triangle(ids.map(i=>q[i].p),ids.map(i=>q[i].n),color,kind,ids.map(i=>q[i].uv));}
  for(const end of [0,points.length-1]){const normal=norm(sub(points[end],points[end===0?1:end-1]));for(let k=0;k<n;k++){const q=[at(end,k),at(end,k+1)];triangle([points[end],...q.map(p=>p.p)],[normal,normal,normal],color,kind,[[0,0],...q.map(p=>p.uv)]);}}
 }
 function petal(p,out,face,L,W,color,kind=.306,cup=.12){const side=norm(cross(face,out));patch((t,s)=>{const x=(s*2-1)*W*Math.pow(Math.sin(Math.PI*t),.65);return add(p,add(mul(out,L*t),add(mul(side,x),mul(face,L*cup*Math.sin(Math.PI*t)+L*.06*(s*2-1)**2))));},color,kind,{rows:rows,cols:quality?8:2,thickness:Math.max(.000015,L*.003),uvScale:[W*2,L]});}
 return{quality,rows,sides,patch,ellipsoid,tube,petal};
}
export function buildRegionalFlower(mesh,cfg,{base=[0,0,0],axis=[0,0,1],fine=false,layoutFine=fine,maximum=false,seed=cfg.seed??2847,study=false}={}){
 if(maximum)fine=true;
 const p=REGIONAL_REPRODUCTION[cfg.type];if(!p)throw Error('Missing reproductive profile: '+cfg.type);
 const a=anatomy(mesh,{fine,maximum:maximum||study&&cfg.flowerLayout!=='cluster',seed}),d=norm(axis),[u,v]=frame(d),L=p.flowerLength,sex=p.sexed?(cfg.flowerSex??'male'):'bisexual',development=blossomDevelopment(cfg,seed,0,{study,stage:cfg.flowerStage??'open'}),stage=development.stage,opening=development.opening;
 const out={type:cfg.type,form:p.flowerForm,stage,sex,maximumDetail:a.quality===2,flowers:0,petals:0,sepals:0,stamens:0,styles:0,stigmas:0,anthers:0,thecae:0,pollenGrains:0,ovules:0,pedicelLengths:[],flowerRecords:[],petalRecords:[],length:L,apetalous:p.petals===0};
 let center=add(base,mul(d,p.pedicel)),focus=center,surfaceFocus=center;
 function stamen(q,face,radial,length,index){const tip=add(q,add(mul(face,length),mul(radial,length*.28))),radius=Math.max(.000018,Math.min(.00015,L*.013));a.tube([q,add(q,mul(face,length*.55)),tip],radius*.5,radius*.32,[.74,.73,.43],.311);
  const side=norm(cross(face,radial));for(const sign of [-1,1]){const at=add(tip,mul(side,sign*radius));a.ellipsoid(at,face,radius*2.6,radius*1.6,gold,.312);out.thecae++;if(fine){a.tube([add(at,mul(face,radius*.3)),add(at,mul(face,radius*2.2))],radius*.08,radius*.07,brown,.311);}}
  if(a.quality===2)for(let k=0;k<3;k++){const r=radius*.17,q=add(tip,add(mul(radial,radius*.9),mul(face,(k+.3)*radius*.6)));a.ellipsoid(q,face,r*2,r*2,gold,.313);out.pollenGrains++;}
  out.stamens++;out.anthers++;
 }
 function pistil(q,face,size){a.ellipsoid(q,face,size*.3,size*.22,green,.30);const tip=add(q,mul(face,size*.85));a.tube([q,tip],size*.025,size*.018,[.61,.65,.25],.311);a.ellipsoid(tip,face,size*.08,size*.10,[.60,.64,.31],.314);out.styles++;out.stigmas++;out.ovules++;}
 function floral(q,face,size,index,form=p.flowerForm){const [x,y]=frame(face),petals=p.petals,petalLength=size*.48,petalWidth=size*.19,stamens=p.stamens;
  a.ellipsoid(add(q,mul(face,-size*.12)),face,size*.20,size*.25,green,.30);
  const sepals=petals||4;for(let k=0;k<sepals;k++){const angle=(k+.5)*TAU/sepals,r=add(mul(x,Math.cos(angle)),mul(y,Math.sin(angle)));a.petal(q,r,mul(face,-1),size*.23,size*.07,green,.30);out.sepals++;}
  if(stage!=='late'||index%3!==1){
   if(form==='urn'||form==='tube'){
    const height=size*(form==='urn'?.85:.65),radius=size*(form==='urn'?.26:.14);a.patch((t,s)=>{const theta=s*TAU,rr=radius*(form==='urn'?.45+.55*Math.sin(Math.PI*t*.88):.45+.55*t*t),r=add(mul(x,Math.cos(theta)),mul(y,Math.sin(theta)));return add(q,add(mul(face,height*t),mul(r,rr*opening)));},p.flowerColor,.306,{reverse:true,thickness:size*.006,uvScale:[radius*TAU,height]});
    for(let k=0;k<petals;k++){const angle=k*TAU/petals,r=add(mul(x,Math.cos(angle)),mul(y,Math.sin(angle)));a.petal(add(q,add(mul(face,height),mul(r,radius*.55*opening))),norm(add(r,mul(face,.3))),face,size*.18,size*.09,p.flowerColor);out.petals++;}surfaceFocus=add(q,mul(x,radius));
   }else for(let k=0;k<petals;k++){
    const theta=k*TAU/petals,radial=add(mul(x,Math.cos(theta)),mul(y,Math.sin(theta))),unequal=form==='pea'?(k===0?1.15:k<3?.85:.65):1,dir=norm(add(mul(radial,opening),mul(face,(1-opening)*1.5+(form==='pea'?.22:0))));
    a.petal(q,dir,face,petalLength*unequal,petalWidth*unequal,p.flowerColor,.306,form==='pea'?.35:.10);out.petals++;out.petalRecords.push({flower:index,index:k,length:petalLength*unequal,width:petalWidth*unequal});if(k===0)surfaceFocus=add(q,mul(dir,petalLength*.6));
   }
  }
  if(p.flowerCenter)a.ellipsoid(q,face,size*.025,size*.22,p.flowerCenter,.306);
  const height=size*(form==='brush'?.50:form==='urn'?.55:form==='tube'?.70:.25);
  if(['Talipariti','Thespesia','Azadirachta'].includes(p.genus)){a.tube([q,add(q,mul(face,height*.85))],size*.035,size*.025,[.78,.72,.38],.311);out.staminalColumn=true;}
  if(sex!=='female'&&stage!=='bud')for(let k=0;k<stamens;k++){const theta=k*GOLD,r=add(mul(x,Math.cos(theta)),mul(y,Math.sin(theta))),ring=add(q,mul(r,size*.09));stamen(ring,face,r,height*(.85+.25*hash(seed+k+index*37)),k);}
  if(sex!=='male'&&stage!=='bud')pistil(q,face,size*.55);
  out.flowers++;out.flowerRecords.push({base:[...q],axis:[...face],stage,sex,petals,stamens:sex==='female'||stage==='bud'?0:stamens});focus=add(q,mul(face,height*.8));
 }
 function catkin(q,face,size,form){const [x,y]=frame(face),N=12,radius=size*(form==='head'?.28:.09),height=form==='head'?size*.55:size;
  a.tube([q,add(q,mul(face,height*(stage==='bud'?.6:1)))],Math.max(.00012,radius*.18),Math.max(.00008,radius*.12),green);
  for(let k=0;k<N;k++){const t=(k+.5)/N,theta=k*GOLD,r=add(mul(x,Math.cos(theta)),mul(y,Math.sin(theta))),node=add(q,add(mul(face,height*t),mul(r,radius*(form==='head'?Math.sin(Math.PI*t):.55)))),side=norm(cross(face,r));
   a.petal(node,norm(add(mul(face,-.4),r)),r,size*.08,size*.035,sex==='female'?green:brown,.30);
   if(form==='catkin'){
    if(sex==='male'&&stage!=='bud')for(let j=0;j<p.stamens;j++)stamen(node,r,norm(add(side,mul(face,(j-p.stamens/2)*.3))),size*.11,j);else if(sex==='female'&&stage!=='bud')pistil(node,r,size*.14);
    out.flowers++;out.flowerRecords.push({base:node,axis:r,stage,sex,petals:0,stamens:sex==='male'?p.stamens:0});
   }else floral(node,r,size*(form==='head'?.19:.14),k,'radial');
  }out.catkins=form==='catkin'?1:0;out.heads=form==='head'?1:0;out.spikes=form==='spike'?1:0;center=add(q,mul(face,height*.5));focus=add(center,mul(x,radius));surfaceFocus=focus;
 }
 const count=study?(cfg.flowerLayout==='cluster'?3:1):1;
 for(let i=0;i<count;i++){
  const dir=count===1?d:norm(add(d,add(mul(u,Math.cos(i*GOLD)*.7),mul(v,Math.sin(i*GOLD)*.7)))),root=count===1?base:add(base,mul(d,p.pedicel*i*.35)),q=add(root,mul(dir,p.pedicel*(.85+.25*hash(seed+i))));a.tube([root,q],Math.max(.00009,L*.012),Math.max(.00006,L*.008),green);out.pedicelLengths.push(Math.hypot(...sub(q,root)));
  if(p.flowerForm==='fig'){
   // Detached study is an explicit cutaway. Attached syconia remain closed.
   const [x,y]=frame(dir),size=L;a.patch((t,s)=>{const theta=s*(study?Math.PI*1.6:TAU),r=size*.5*Math.sin(Math.PI*t);return add(q,add(mul(dir,size*t),add(mul(x,Math.cos(theta)*r),mul(y,Math.sin(theta)*r))));},green,.30,{reverse:true,thickness:size*.02,uvScale:[size*TAU,size]});
   if(study)for(let k=0;k<18;k++){const theta=k*GOLD,t=.18+.65*hash(seed+k),r=add(mul(x,Math.cos(theta)),mul(y,Math.sin(theta))),at=add(q,add(mul(dir,size*t),mul(r,size*.44*Math.sin(Math.PI*t))));pistil(at,mul(r,-1),size*.10);out.flowers++;}else out.flowers=18;
   out.syconium=true;out.cutaway=study;center=add(q,mul(dir,size*.5));focus=center;surfaceFocus=add(center,mul(x,size*.5));
  }else if(['catkin','spike','head'].includes(p.flowerForm))catkin(q,dir,L,p.flowerForm);
  else floral(q,dir,L,i);
  if(p.genus==='Tilia')a.petal(add(root,mul(dir,p.pedicel*.2)),norm(add(dir,u)),v,L*2,L*.32,[.55,.62,.26],.30);
  if(i===0&& !['catkin','spike','head','fig'].includes(p.flowerForm))center=q;
 }
 return{...out,center,focus,surfaceFocus,inspectDistance:Math.max(.003,L*.9),surfaceDistance:Math.max(.002,L*.36)};
}
export function buildRegionalFruit(mesh,cfg,{base=[0,0,0],axis=[0,-1,0],fine=false,layoutFine=fine,maximum=false,seed=cfg.seed??2847,stage=cfg.fruitStage??'mature',attached=['tree','shoot'].includes(cfg.view)}={}){
 if(maximum)fine=true;
 const p=REGIONAL_REPRODUCTION[cfg.type];if(!p)throw Error('Missing reproductive profile: '+cfg.type);
 const a=anatomy(mesh,{fine,maximum:maximum||fine&&cfg.view==='fruit',seed}),d=norm(axis),[u,v]=frame(d),young=stage==='developing',released=stage==='released'&&p.release,scale=young?.62:1,L=p.fruitLength*scale,W=p.fruitWidth*scale,stalk=Math.min(.035,Math.max(.003,L*.45)),q=add(base,mul(d,stalk)),color=young?green:p.fruitColor;
 const out={type:cfg.type,stage,form:p.fruitForm,maximumDetail:!!maximum,length:L,width:W,stalkLength:stalk,indehiscent:!p.release,opening:released?1:0,valves:0,seeds:0,wingedSeeds:0,silkyHairs:0,bracts:0,scales:0,drupes:0,capsules:0};
 let focus=add(q,mul(d,L*.5));
 a.tube([base,add(base,add(mul(d,stalk*.5),mul(u,stalk*.08))),q],Math.max(.00015,W*.022),Math.max(.00010,W*.016),brown);
 const seedAt=(at,face,size,winged=false,plume=false)=>{a.ellipsoid(at,face,size,size*.55,[.29,.17,.07],.34);out.seeds++;
  if(fine)a.ellipsoid(add(at,mul(face,size*.4)),u,size*.18,size*.08,[.57,.43,.24],.34);
  if(winged){a.petal(at,norm(add(u,mul(face,.35))),v,size*3,size*.8,[.64,.48,.27],.34);out.wingedSeeds++;}
  if(plume){for(let k=0;k<(fine?12:4);k++){const r=add(mul(u,Math.cos(k*GOLD)),mul(v,Math.sin(k*GOLD))),tip=add(at,add(mul(face,size*4),mul(r,size*1.8)));a.tube([at,add(at,mul(face,size*2)),tip],size*.009,size*.003,[.82,.81,.68],.34);out.silkyHairs++;}}
 };
 function shell(at,face,length,width,valves,{opening=released,texture=false}={}){
  const [x,y]=frame(face),N=valves||1;
  for(let k=0;k<N;k++){
   const theta=(k+.5)*TAU/N,radial=add(mul(x,Math.cos(theta)),mul(y,Math.sin(theta)));
   a.patch((t,s)=>{const angle=(k+s)*TAU/N,r=width*.5*Math.pow(Math.sin(Math.PI*t),.55),gap=opening?length*.35*Math.sin(Math.PI*t):0,ripple=texture?1+.025*Math.sin(angle*19+t*53):1;return add(at,add(mul(face,length*t),add(mul(add(mul(x,Math.cos(angle)),mul(y,Math.sin(angle))),r*ripple),mul(radial,gap))));},(t,s)=>color.map(c=>c*(.9+.1*Math.sin(t*27+s*9)**2)),.36,{reverse:true,thickness:Math.max(.00008,width*.018),cols:Math.max(3,Math.ceil(a.sides/N)),uvScale:[Math.PI*width/N,length]});
  }out.valves=valves;out.capsules++;
  if(opening){for(let k=0;k<Math.max(3,valves*2);k++)seedAt(add(at,add(mul(face,length*(.18+.6*hash(seed+k))),mul(x,width*(hash(seed+k+9)-.5)))),face,Math.min(width*.18,length*.08),p.genus==='Swietenia'||p.genus==='Toona',p.genus==='Ceiba');}
 }
 function wing(at,face,length,width,angle=0){const radial=add(mul(u,Math.cos(angle)),mul(v,Math.sin(angle))),side=norm(cross(face,radial));a.petal(at,norm(add(radial,mul(face,.25))),side,length,width,[.57,.43,.23],.36);}
 function capsuleCatkin(){
  const N=12,radius=W*.30;a.tube([q,add(q,mul(d,L))],W*.045,W*.025,brown);
  for(let k=0;k<N;k++){
   const t=.10+.80*(k+.5)/N,theta=k*GOLD,r=add(mul(u,Math.cos(theta)),mul(v,Math.sin(theta))),node=add(q,add(mul(d,L*t),mul(r,radius))),side=norm(cross(d,r)),size=Math.min(.006,L*.16);
   if(p.genus==='Salix'||p.genus==='Populus'){
    shell(node,r,size,size*.45,p.valves,{opening:released});if(released)seedAt(add(node,mul(r,size*.5)),r,size*.16,false,true);
   }else{
    if(!released||k%3!==0){a.petal(node,norm(add(r,mul(d,.35))),side,size,size*.4,color,.36,.25);out.bracts++;out.scales++;}
    if(fine||released)seedAt(add(node,mul(r,size*.3)),r,size*.25,true);
   }
  }out.catkin=true;focus=add(q,add(mul(d,L*.5),mul(u,W*.4)));
 }
 const form=p.fruitForm;
 if(form==='catkin')capsuleCatkin();
 else if(['capsule','follicle'].includes(form)){
  if(form==='follicle'&&p.genus==='Quillaja')for(let k=0;k<5;k++){const r=add(mul(u,Math.cos(k*TAU/5)),mul(v,Math.sin(k*TAU/5)));shell(add(q,mul(r,W*.35)),norm(add(d,r)),L,W*.55,1);}
  else shell(q,d,L,W,p.valves,{texture:p.genus==='Aesculus'});
 }else if(form==='pod'||form==='wingpod'){
  const length=L,width=W*.5,curve=p.podCurve??0,opening=released?W*.9:0,center=t=>add(q,add(mul(d,length*(curve>.7?Math.sin(t*Math.PI*curve)/(Math.PI*curve):t)),mul(u,curve>.7?length*(1-Math.cos(t*Math.PI*curve))/(Math.PI*curve):length*curve*.25*Math.sin(Math.PI*t))));
  for(const sign of [-1,1])a.patch((t,s)=>{const x=s*2-1,r=width*Math.pow(Math.sin(Math.PI*t),.38),bulge=Math.sqrt(Math.max(0,1-x*x))*W*(form==='wingpod'?.035:.14)*(1+.15*Math.cos(t*TAU*7));return add(center(t),add(mul(u,x*r),mul(v,sign*(bulge+opening*Math.sin(Math.PI*t)))));},color,.36,{thickness:Math.max(.00005,W*.012),cols:fine?12:2,uvScale:[W,L]});
  out.valves=p.valves;out.seedCompartments=p.genus==='Cassia'?24:7;out.curved=curve>0;
  if(released)for(let k=0;k<7;k++)seedAt(add(center(.12+.76*k/6),mul(v,(k%2?.2:-.2)*W)),d,Math.min(.009,W*.32));
  if(form==='wingpod'){out.wings=1;a.ellipsoid(add(q,mul(d,L*.48)),d,L*.22,W*.22,brown,.34);}
  focus=center(.5);
 }else if(['acorn','hazel','walnut','beech'].includes(form)){
  if(form==='beech'){
   const N=4;for(let k=0;k<N;k++){const theta=k*TAU/N,r=add(mul(u,Math.cos(theta)),mul(v,Math.sin(theta)));a.petal(q,norm(add(d,mul(r,released?1.2:.30))),r,L*.90,W*.30,brown,.36,.30);if(fine)for(let j=0;j<7;j++){const at=add(q,add(mul(d,L*(j+.5)/8),mul(r,W*.3)));a.tube([at,add(at,mul(r,L*.07))],L*.008,L*.002,brown,.36);}}
   for(const sign of [-1,1]){a.ellipsoid(add(q,add(mul(d,L*.12),mul(u,sign*W*.17))),d,L*.75,W*.40,brown,.34,.12);out.seeds++;}out.valves=4;out.cupule=true;
  }else{
   a.ellipsoid(q,d,L,W,color,.36);out.seeds=1;
   if(form==='acorn'){
    const cup=add(q,mul(d,L*.10));a.patch((t,s)=>{const theta=s*TAU,r=W*.53*Math.sin(.35+t*.95);return add(cup,add(mul(d,L*.32*t),add(mul(u,Math.cos(theta)*r),mul(v,Math.sin(theta)*r))));},brown,.36,{reverse:true,thickness:W*.04,uvScale:[W*TAU,L*.32]});
    for(let k=0;k<(fine?48:12);k++){const t=(k+.5)/(fine?48:12),theta=k*GOLD,r=add(mul(u,Math.cos(theta)),mul(v,Math.sin(theta))),node=add(cup,add(mul(d,L*.30*t),mul(r,W*.54*Math.sin(.35+t*.95))));a.petal(node,norm(add(d,r)),r,L*.11,W*.065,brown,.36,.20);out.scales++;}out.cupCoverage=.32;
   }else if(form==='hazel')for(let k=0;k<7;k++){const r=add(mul(u,Math.cos(k*TAU/7)),mul(v,Math.sin(k*TAU/7)));a.petal(q,norm(add(d,mul(r,.5))),r,L*.9,W*.18,young?green:brown,.36,.25);out.bracts++;}
   else out.husk=true;
  }
 }else if(form==='samara'||form==='wingfruit'||form==='bractnut'){
  a.ellipsoid(q,d,form==='bractnut'?L:L*.35,W*(form==='samara'?.22:.4),brown,.34);out.seeds=1;
  if(form==='samara'){
   // Elm's circular membrane surrounds the central seed; no maple-style pair.
   a.patch((t,s)=>{const theta=s*TAU,r=L*.5*t,notch=1-.12*Math.exp(-Math.pow((theta-Math.PI)/.2,2));return add(add(q,mul(d,L*.18)),add(mul(u,Math.cos(theta)*r*notch),mul(v,Math.sin(theta)*r)));},[.64,.60,.31],.36,{thickness:.00006,uvScale:[L*TAU,L]});out.wings=1;
  }else if(form==='wingfruit'){
   const count=p.genus==='Combretum'?4:p.genus==='Shorea'?5:2;for(let k=0;k<count;k++)wing(q,d,L*(p.genus==='Shorea'&&k>2?.45:1),W*.22,k*TAU/count);out.wings=count;
  }else{
   if(p.genus==='Tilia'){a.petal(add(base,mul(d,stalk*.25)),norm(add(d,u)),v,L*4,L*.6,[.60,.59,.30],.36);out.bracts=1;}
   else for(let k=0;k<3;k++){const r=add(mul(u,Math.cos((k-1)*.7)),mul(v,Math.sin((k-1)*.7)));a.petal(q,norm(add(d,r)),v,L*(k===1?3:1.8),L*.45,[.57,.53,.25],.36);out.bracts++;}
  }
 }else if(form==='acheneplume'){
  for(let k=0;k<12;k++){const theta=k*GOLD,r=add(mul(u,Math.cos(theta)),mul(v,Math.sin(theta))),at=add(q,add(mul(d,W*.2),mul(r,W*.25)));seedAt(at,norm(add(d,r)),L*.18,false,true);}out.plumoseStyles=true;
 }else if(form==='propagule'){
  a.ellipsoid(q,d,W*1.5,W,brown,.36);const start=add(q,mul(d,W)),points=Array.from({length:9},(_,i)=>add(start,add(mul(d,L*i/8),mul(u,L*.05*Math.sin(Math.PI*i/8)))));a.tube(points,W*.26,W*.14,[.35,.43,.15],.36);out.viviparous=true;out.seeds=1;focus=add(start,mul(d,L*.5));
 }else if(form==='aggregate'){
  const fingers=['Cecropia','Milicia'].includes(p.genus),count=p.genus==='Cecropia'?4:1;
  for(let f=0;f<count;f++){
   const face=norm(add(d,mul(u,(f-(count-1)*.5)*.3))),at=add(q,mul(u,(f-(count-1)*.5)*W*.6)),width=fingers?W:W;
   a.ellipsoid(at,face,L,width,color,.36);const [x,y]=frame(face);
   for(let k=0;k<(fine?60:18);k++){const t=.07+.86*hash(seed+k),theta=k*GOLD,r=add(mul(x,Math.cos(theta)),mul(y,Math.sin(theta))),node=add(at,add(mul(face,L*t),mul(r,width*.49*Math.sin(Math.PI*t))));a.ellipsoid(node,r,width*.035,width*.075,color,.36);}out.fusedUnits=(out.fusedUnits??0)+60;
  }out.multipleFruit=true;
 }else{
  a.ellipsoid(q,d,L,W,color,.36);out.drupes=['drupe','pome'].includes(form)?1:0;out.berries=form==='berry'?1:0;out.syconium=form==='fig';
  if(form==='fig'){
   const at=add(q,mul(d,L*.98));a.ellipsoid(at,d,L*.02,W*.12,brown,.36);out.ostiole=true;
  }else if(['pome','berry'].includes(form)||['Diospyros','Calophyllum','Cinnamomum'].includes(p.genus)){
   const at=form==='pome'?add(q,mul(d,L*.97)):q,face=form==='pome'?d:mul(d,-1),n=p.genus==='Diospyros'?4:5;
   for(let k=0;k<n;k++){const r=add(mul(u,Math.cos(k*TAU/n)),mul(v,Math.sin(k*TAU/n)));a.petal(at,r,face,W*.20,W*.07,young?green:brown,.36);out.bracts++;}out.persistentCalyx=true;
  }
 }
 return{...out,focus,inspectDistance:Math.max(.006,Math.min(.080,Math.max(L,W)*.8)),attached};
}
