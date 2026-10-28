import {EAST_ASIAN_SPECIES} from './east-asia.mjs?v=19';
// Physical-scale procedural wood. Relief amplitudes are illustrative, not scans.
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
const fract=x=>x-Math.floor(x),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{let t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453);
export function woodNoise(x,y){let a=Math.floor(x),b=Math.floor(y),u=smooth(0,1,fract(x)),v=smooth(0,1,fract(y));return mix(mix(hash(a,b),hash(a+1,b),u),mix(hash(a,b+1),hash(a+1,b+1),u),v)}
function woodCell(x,y){let a=Math.floor(x),b=Math.floor(y),fx=fract(x),fy=fract(y),near=8,second=8,id=.5;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){let hx=hash(a+i,b+j),hy=fract(Math.sin((a+i)*269.5+(b+j)*183.3)*43758.5453),dx=i+.2+.6*hx-fx,dy=j+.2+.6*hy-fy,d=dx*dx+dy*dy;if(d<near){second=near;near=d;id=hx}else second=Math.min(second,d)}return[Math.sqrt(second)-Math.sqrt(near),id]}
export const BARK_GEOMETRY={
 oak:.014,willow:.012,pine:.011,sweetthorn:.012,marula:.008,wildolive:.010,yellowwood:.008,karee:.009,jacaranda:.008,sausagetree:.0035,
 maple:.012,sakura:.0025,ginkgo:.013,dawnredwood:.010,chinesepine:.012,sweetgum:.010,redbud:.0022,birch:.0015,baobab:.003,fevertree:.0007,eucalyptus:.0014,monkeytail:.0005
};
// Metre-scale morphology classes. Depths and pitches are representative
// modelling values; smooth species deliberately do not inherit coarse plates.
export const BARK_PROFILES={
 oak:['furrowed',.024,.085],willow:['furrowed',.018,.10],pine:['plated',.034,.045],birch:['lenticels',.028,.014],
 sweetthorn:['furrowed',.022,.065],marula:['flaky',.037,.042],wildolive:['furrowed',.018,.075],yellowwood:['fibrous',.010,.12],
 baobab:['folded',.11,.24],fevertree:['powdery',.009,.012],sausagetree:['flaky',.027,.035],karee:['furrowed',.016,.070],
 jacaranda:['furrowed',.020,.048],monkeytail:['fibres',.0015,.014],eucalyptus:['peeling',.045,.090],
 maple:['plated',.028,.065],sakura:['lenticels',.025,.012],ginkgo:['furrowed',.029,.13],dawnredwood:['fibrous',.012,.15],
 chinesepine:['plated',.037,.048],sweetgum:['furrowed',.018,.060],redbud:['flaky',.018,.028]
};
export function barkGeometryHeight(type,uv,age,radius){
 if(radius<.012)return 0;
 const amp=Math.min(BARK_GEOMETRY[type]??.008,radius*.12)*smooth(.012,.055,radius)*age,x=uv[0],y=uv[1],warp=woodNoise(x*9,y*4);
 const [pattern,pitch,length]=BARK_PROFILES[type],qx=x/pitch+warp*.65+Math.sin(y*9)*.15,qy=y/length+woodNoise(x*5,y*6)*.40;
 if(pattern==='powdery'||pattern==='peeling')return amp*(woodNoise(x*75,y*95)-.5);
 if(pattern==='lenticels'){const row=Math.floor(y/length),a=fract(x/pitch+hash(row,1)*2),b=fract(y/length),lenticel=(1-smooth(.025,.13,Math.abs(b-.5)))*(1-smooth(.13,.40,Math.abs(a-.5)));return amp*((woodNoise(x*42,y*65)-.5)*.20-lenticel*.45);}
 if(pattern==='folded')return amp*(Math.sin(qx*Math.PI*2)*.65+woodNoise(x*35,y*22)*.12);
 if(pattern==='fibres')return amp*(Math.pow(.5+.5*Math.sin(qx*6.283+y*15),8)-.25);
 const cell=woodCell(qx,qy),edge=1-smooth(.016,.16,cell[0]);
 if(pattern==='fibrous'){const wave=.5+.5*Math.sin(qx*6.283+Math.sin(y*23)*.6),split=Math.pow(1-wave,5);return amp*(wave*.70-split*.42+(cell[1]-.5)*.16);}
 if(pattern==='furrowed'){const wave=.5+.5*Math.sin(qx*6.283+Math.sin(y*19)*.45),groove=Math.pow(1-wave,5),crossCrack=edge*.40;return amp*(wave*.65-Math.max(groove*.65,crossCrack)+cell[1]*.15);}
 return amp*((1-edge)*(.40+.55*cell[1])-.55*edge+(pattern==='flaky'?.10:.20)*(woodNoise(x*230,y*190)-.5));
}
export function barkSample(type,uv,age=.65,zone=0){
 let x=uv[0],y=uv[1],coarse=woodNoise(x*13,y*8),warp=woodNoise(x*24,y*9),fibers=Math.sin(x*3100+Math.sin(y*180)*1.5),height=0,dark=0,rough=.82;
 if(type==='chinesepine')type='pine';
 if(type==='monkeytail'){let fiber=Math.pow(.5+.5*Math.sin(x*2400+Math.sin(y*35)*.8),12),crossing=Math.pow(.5+.5*Math.sin(x*650+y*960),18),pores=woodNoise(x*1800,y*1400);return{height:fiber*.00038+crossing*.00022+(pores-.5)*.00006,dark:.3+.4*(1-fiber),roughness:.92,color:pores*.6+fiber*.4};}
 if(zone>.075&&type!=='pine'){let pores=woodNoise(x*950,y*750);return {height:(pores-.5)*.00005,dark:smooth(.8,1,pores)*.20,roughness:.60,color:coarse}}
 if(type==='birch'&&zone>.03&&zone<.05){let row=Math.floor(y*115),u=fract(x*42+hash(row,1)*2),v=fract(y*115),line=(1-smooth(.055,.14,Math.abs(v-.5)))*(1-smooth(.12,.36,Math.abs(u-.5)));let diamond=Math.abs(Math.sin(x*95+y*25))*Math.abs(Math.sin(x*95-y*25));let fissure=(1-smooth(.012,.04,diamond))*age*age;return{height:-.00017*line-.0012*fissure+(coarse-.5)*.00012,dark:Math.max(line*.78,fissure*.72),roughness:.50+coarse*.16,color:coarse}}
 if(['maple','ginkgo','sweetgum','redbud'].includes(type)){const cell=woodCell(x*48+warp*.45,y*(type==='ginkgo'?13:19)+coarse*.3),crack=1-smooth(.018,.13,cell[0]);height=(.3-crack)*(type==='redbud'?.0012:.0055)*age;dark=crack*.75;rough=.86;
 }else if(type==='sakura'){const row=Math.floor(y*90),a=fract(x*32+hash(row,1)*2),b=fract(y*90),line=(1-smooth(.05,.15,Math.abs(b-.5)))*(1-smooth(.15,.38,Math.abs(a-.5)));height=-line*.00035+(coarse-.5)*.00012;dark=line*.52;rough=.57;
 }else if(type==='dawnredwood'){const phase=x*640+warp*5+Math.sin(y*14)*.7,split=Math.pow(.5+.5*Math.sin(phase),10);height=(.3-split)*.0055*age+(coarse-.5)*.001;dark=split*.72;rough=.88;
 }else if(type==='pine'){let upper=smooth(0,.06,zone),young=smooth(.06,.08,zone),cell=woodCell(x*mix(52,105,upper)+warp*.3,y*mix(24,85,upper)+coarse*.3),crack=1-smooth(.018,.11,cell[0]),pores=woodNoise(x*950,y*750);height=mix(((1-crack)*(.65+.35*cell[1])-.25*crack)*mix(.004,.0012,upper)*(.3+.7*age),(pores-.5)*.00005,young);dark=mix(crack*.80,smooth(.8,1,pores)*.20,young);rough=mix(mix(.85,.66,upper),.60,young);
 }else if(type==='jacaranda'){let cell=woodCell(x*57+warp*.45,y*24+coarse*.3),crack=1-smooth(.02,.13,cell[0]),groove=Math.pow(.5+.5*Math.sin(x*460+warp*3),10);height=(.3-Math.max(crack,groove*.55))*.0038*age;dark=crack*.67;rough=.84;
 }else if(type==='eucalyptus'){let cell=woodCell(x*13+warp*.25,y*8+coarse*.2),edge=1-smooth(.02,.11,cell[0]);height=(.25-edge)*.0008*age;dark=edge*.27;rough=.70;
 }else if(type==='baobab'){let seam=Math.pow(.5+.5*Math.sin(x*38+woodNoise(x*2,y*3)*4),20),mottle=woodNoise(x*8,y*7);height=(mottle-.5)*.0007*age-seam*.0020*age;dark=seam*.26;rough=.68;
 }else if(type==='fevertree'){let powder=woodNoise(x*420,y*390),flake=woodNoise(x*35,y*29);height=(powder-.5)*.00009+(flake-.5)*.00016*age;dark=smooth(.75,.95,flake)*.12;rough=.88;
 }else if(type==='sausagetree'){let cell=woodCell(x*36+warp*.35,y*31+coarse*.2),edge=1-smooth(.025,.18,cell[0]);height=(.30-edge)*.0017*age;dark=edge*.33;rough=.77;
 }else if(type==='karee'){let cell=woodCell(x*65+warp*.5,y*19+coarse*.3),crack=1-smooth(.018,.11,cell[0]),groove=Math.pow(.5+.5*Math.sin(x*410+warp*4),10);height=(.3-Math.max(crack,groove*.6))*.0044*age;dark=crack*.76;rough=.87;
 }else if(type==='marula'){let cell=woodCell(x*24+warp*.35,y*28+coarse*.30),edge=1-smooth(.018,.14,cell[0]);height=(.30-edge)*.0036*age;dark=edge*.48;rough=.82;
 }else if(type==='sweetthorn'){let cell=woodCell(x*42+warp*.35,y*18+coarse*.3),edge=1-smooth(.02,.12,cell[0]),groove=Math.pow(.5+.5*Math.sin(x*430+warp*4),10)*.65,crack=Math.max(edge,groove);height=(.34-crack)*.006*age;dark=crack*.87;rough=.90;
 }else if(type==='wildolive'){let cell=woodCell((x+Math.sin(y*7)*.008)*65+warp*.3,y*16+coarse*.3),crack=1-smooth(.018,.12,cell[0]);height=(.3-crack)*.0045*age+(coarse-.5)*.0012*age;dark=crack*.75;rough=.84;
 }else if(type==='yellowwood'){let phase=x*610+warp*5+Math.sin(y*13)*.8,split=Math.pow(.5+.5*Math.sin(phase),12),peel=woodNoise(x*110,y*12);height=(.30-split)*.004*age+peel*.001*age;dark=split*.72;rough=.83;
 }else if(type==='birch'){let a=Math.abs(Math.sin(x*88+y*21)),b=Math.abs(Math.sin(x*88-y*21)),fissure=1-smooth(.035,.15,a*b);height=(1-fissure)*.002*age;dark=fissure*.7;rough=.85;
 }else{let cell=woodCell(x*(type==='willow'?75:52)+warp*.6+(woodNoise(x*180,y*120)-.5)*.24,y*(type==='willow'?24:17)+coarse*.5+(woodNoise(x*90,y*140)-.5)*.20),edge=1-smooth(.014,.09,cell[0]),spacing=type==='willow'?550:420,phase=x*spacing+(warp-.5)*3.8+Math.sin(y*31)*.5,groove=Math.pow(.5+.5*Math.sin(phase),9)*.72,crack=Math.max(edge*.85,groove),grain=woodNoise(x*330,y*250)-.5;height=(.30-crack)*(.002+.004*age)+(cell[1]-.5)*.0011*age+grain*.0005*age;dark=Math.min(.95,crack*.95);}

 let chip=woodNoise(x*150,y*120)-.5,grain=woodNoise(x*580,y*430)-.5,dust=woodNoise(x*2200,y*1700)-.5;return {height:height+fibers*.000035*age+age*(chip*.0008+grain*.00024+dust*.000045),dark,roughness:Math.min(.94,rough+grain*.08),color:Math.max(0,Math.min(1,(type==='eucalyptus'?woodNoise(x*4,y*3):coarse)*.35+(grain+.5)*.45+(dust+.5)*.20))};
}
export const woodRadius=(r0,r1,t)=>r1+(r0-r1)*Math.pow(Math.max(0,1-t),.88);
// Pine's colour follows a continuous height field shared by trunk and limbs.
// Radius only blends the plate relief into the finer surface of young twigs.
export function pineBarkStyle(y,radius,treeHeight=10){
 const upper=smooth(.18,.85,y/Math.max(.1,treeHeight)),young=1-smooth(.003,.012,radius);
 return{zone:mix(.06*upper,.08,young),color:[.28,.235,.19].map((v,i)=>mix(v,[.36,.26,.185][i],upper))};
}
function interpolatePath(points,t){let x=t*(points.length-1),i=Math.min(points.length-2,Math.floor(x)),f=x-i,p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];return p1.map((v,k)=>.5*((2*v)+(-p0[k]+p2[k])*f+(2*p0[k]-5*v+4*p2[k]-p3[k])*f*f+(-p0[k]+3*v-3*p2[k]+p3[k])*f*f*f))}
export function woodTube(mesh,points,r0,r1,type,{fine=false,macro=false,focusT=.44,maturity=.65,root=false,collar=false,preview=true,cap=false,zone:forceZone,treeHeight=10}={}){
 const pineLike=type==='pine'||type==='chinesepine',isTwig=r0<.007,white=type==='birch'&&r0>.018;
 let zone=forceZone??(pineLike?pineBarkStyle(points[0][1],r0,treeHeight).zone:isTwig?.08:white?.04:0),age=Math.max(.04,Math.min(1,maturity*(isTwig?.10:.35+.65*Math.min(1,r0/.09))));
 const southern={maple:[[.32,.29,.24],[.31,.21,.13]],sakura:[[.36,.23,.18],[.40,.22,.16]],ginkgo:[[.32,.30,.25],[.32,.28,.17]],dawnredwood:[[.40,.20,.12],[.42,.22,.13]],chinesepine:[[.31,.27,.21],[.35,.24,.15]],sweetgum:[[.32,.29,.24],[.33,.25,.17]],redbud:[[.31,.24,.19],[.34,.22,.15]],jacaranda:[[.32,.30,.26],[.30,.25,.18]],monkeytail:[[.045,.037,.030],[.11,.075,.045]],eucalyptus:[[.54,.52,.46],[.36,.20,.14]],baobab:[[.40,.37,.34],[.36,.34,.28]],fevertree:[[.43,.46,.19],[.40,.36,.20]],sausagetree:[[.37,.34,.28],[.34,.29,.21]],karee:[[.25,.235,.19],[.35,.19,.12]],sweetthorn:[[.20,.17,.135],[.34,.17,.10]],marula:[[.40,.38,.33],[.34,.30,.22]],wildolive:[[.29,.29,.24],[.30,.29,.20]],yellowwood:[[.33,.31,.26],[.25,.29,.17]]}[type];
 const base=zone===.04?[.70,.69,.62]:zone===.06?[.43,.20,.075]:zone===.08?(type==='willow'?[.34,.30,.095]:[.24,.15,.09]):type==='birch'?[.24,.22,.19]:type==='willow'?[.24,.22,.18]:[.27,.235,.19];
 const wholeGum=type==='eucalyptus'&&!fine&&!macro;
 const pathLength=points.slice(1).reduce((s,p,i)=>s+Math.hypot(...sub(p,points[i])),0),halfSpan=Math.min(.5,.145/Math.max(.001,pathLength)),t0=macro?Math.max(0,focusT-halfSpan):0,t1=macro?Math.min(1,focusT+halfSpan):1;
 let sides=macro?(r0<.04?320:512):fine?96:root&&r0>.14?80:wholeGum?(r0>.14?40:r0>.035?16:r0>.007?8:5):r0>.14?72:r0>.035?24:r0>.007?10:5,steps=macro?224:fine?96:root&&r0>.14?120:Math.max(points.length-1,r0>.04?(wholeGum?24:32):points.length-1),rings=[],arc=0,previousU=null;
 const denseSteps=steps,samples=macro?[...new Set([...Array.from({length:33},(_,i)=>i/32),...Array.from({length:steps+1},(_,i)=>t0+(t1-t0)*i/steps)].map(v=>Math.round(v*1e10)/1e10))].sort((a,b)=>a-b):Array.from({length:steps+1},(_,i)=>i/steps);steps=samples.length-1;
 const phase=points[0][0]*.37+points[0][2]*.53,uvOffset=points[0][1];
 for(let j=0;j<=steps;j++){
  let t=samples[j],p=interpolatePath(points,t),before=interpolatePath(points,Math.max(0,t-.0003)),after=interpolatePath(points,Math.min(1,t+.0003)),axis=norm(sub(after,before));if(j)arc+=Math.hypot(...sub(p,rings[j-1].center));
  let u=previousU?norm(sub(previousU,mul(axis,dot(previousU,axis)))):norm(cross(axis,Math.abs(axis[1])>.94?[1,0,0]:[0,1,0]));if(Math.hypot(...u)<.9)u=norm(cross(axis,[0,0,1]));previousU=u;let v=norm(cross(u,axis)),r=woodRadius(r0,r1,t)*(type==='baobab'&&points[0][1]<.01&&r0>.45?1+.18*Math.sin(Math.PI*t):1),localAge=age*(.3+.7*Math.sqrt(r/r0)),collarBump=collar?.28*Math.exp(-Math.pow((arc-r0*2.6)/Math.max(.01,r0*1.3),2)):0,ring=[];
  const pineStyle=pineLike?pineBarkStyle(p[1],r,treeHeight):null,ringZone=forceZone??pineStyle?.zone??zone,ringBase=(type==='chinesepine'?southern[0].map((c,i)=>mix(c,southern[1][i],smooth(.18,.85,p[1]/Math.max(.1,treeHeight)))):pineStyle?.color)??(southern?southern[0].map((c,i)=>mix(c,southern[1][i],1-smooth(.003,.025,r))):base);
  for(let k=0;k<=sides;k++){
   let a=k/sides*Math.PI*2,n=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),uv=[a*r+phase,arc+uvOffset],surface=barkSample(type,uv,localAge,ringZone),rootFlare=root?.38*Math.exp(-arc/Math.max(.08,r0*2))*(.6+.4*Math.cos(a*5+phase)):0,rr=r*(1+collarBump+rootFlare)+(surface.height+barkGeometryHeight(type,uv,localAge,r))*Math.min(1,r/.02);
   let pos=add(p,mul(n,Math.max(r*.75,rr))),taper=(r0-r1)/Math.max(.001,Math.hypot(...sub(points.at(-1),points[0])));let normal=norm(add(n,mul(axis,taper)));
   const palette=type==='eucalyptus'?[.55,.54,.48].map((c,i)=>mix(mix(c,[.34,.36,.33][i],smooth(.24,.48,surface.color)),[.48,.34,.27][i],smooth(.52,.73,surface.color))):ringBase,youngEuc=type==='eucalyptus'?1-smooth(.003,.015,r):0;const co=palette.map((x,i)=>mix(x,[.36,.20,.14][i],youngEuc)*(.94+.12*surface.color));ring.push({p:pos,n:normal,c:co,uv,age:localAge,r,zone:ringZone});
  }ring[sides].p=[...ring[0].p];ring[sides].n=[...ring[0].n];rings.push({points:ring,center:p,axis,t});
 }
 for(let j=0;j<=steps;j++)for(let k=0;k<sides;k++){
  const q=rings[j].points[k],a=rings[j].points[(k+sides-1)%sides].p,b=rings[j].points[(k+1)%sides].p,c=rings[Math.max(0,j-1)].points[k].p,d=rings[Math.min(steps,j+1)].points[k].p;let n=norm(cross(sub(b,a),sub(d,c)));if(dot(n,q.n)<0)n=mul(n,-1);q.n=n;
 }for(const ring of rings)ring.points[sides].n=[...ring.points[0].n];
 let quadCount=0;
 function quad(a,b,c,d){let n=norm(add(a.n,c.n)),cr=cross(sub(b.p,a.p),sub(c.p,a.p)),indices=dot(cr,n)<0?[a,c,b,c,d,b]:[a,b,c,c,b,d];for(let q of indices)mesh.v(q.p,q.n,q.c,q.zone,q.age,q.r,q.uv);if(preview)mesh.preview.push({pts:[a.p,b.p,d.p,c.p],n,c:a.c,kind:a.zone,phase:0});quadCount++}
 for(let j=0;j<steps;j++)for(let k=0;k<sides;k++)quad(rings[j].points[k],rings[j+1].points[k],rings[j].points[k+1],rings[j+1].points[k+1]);
 if(type==='monkeytail'&&r0>.012){
  const count=fine?32:14;for(let hand of [-1,1])for(let k=0;k<count;k++)for(let j=0;j<steps;j++){
   const get=(n,sign)=>{const ring=rings[n],index=Math.floor(((k/count+hand*n/steps*.07)%1+1)%1*sides),q=ring.points[index],edge=norm(cross(ring.axis,q.n)),offset=add(mul(q.n,.00020),mul(edge,sign*.00020));return{...q,p:add(q.p,offset)};};
   quad(get(j,-1),get(j+1,-1),get(j,1),get(j+1,1));
  }
 }
 if(fine&&r0>.025&&['plated','flaky','fibrous'].includes(BARK_PROFILES[type][0])){
  for(let chip=0;chip<(macro?38:7);chip++){
   const j=Math.floor(steps*(.08+.82*hash(chip+31,7))),ring=rings[j],k=Math.floor(sides*hash(chip+9,23)),q=ring.points[k],side=norm(cross(ring.axis,q.n)),L=Math.min(r0*.7,.012+.022*hash(chip,17)),W=L*(BARK_PROFILES[type][0]==='fibrous'?.10:.25),lift=Math.min(type==='redbud'?.0008:type==='sausagetree'?.0015:.0045,r0*.055)*(.4+.6*hash(chip,13));
   const point=(t,x,back)=>add(q.p,add(mul(ring.axis,L*t),add(mul(side,x*W*(1-.45*t)),mul(q.n,(lift*Math.pow(t,1.6)+.00025*Math.sin(Math.PI*t)*(1-x*x))-(back?.0007:0)))));
   for(let back=0;back<2;back++)for(let row=0;row<5;row++)for(let col=0;col<3;col++){const t=row/5,tt=(row+1)/5,x=col/3*2-1,xx=(col+1)/3*2-1,ps=[point(t,x,back),point(tt,x,back),point(t,xx,back),point(tt,xx,back)],n=norm(cross(sub(ps[1],ps[0]),sub(ps[2],ps[0]))),normal=back?mul(n,-1):n;for(const i of(back?[0,2,1,2,3,1]:[0,1,2,2,1,3]))mesh.v(ps[i],normal,q.c,q.zone,q.age,q.r,[(i<2?x:xx)*W,(i%2?tt:t)*L]);if(preview)mesh.preview.push({pts:[ps[0],ps[1],ps[3],ps[2]],n:normal,c:q.c,kind:q.zone,phase:0});}
  }
 }
 if(type==='eucalyptus'&&fine&&r0>.018){
  for(let peel=0;peel<5;peel++){
   const j=Math.floor(steps*(.18+.14*peel)),ring=rings[j],k=Math.floor(sides*((.13+peel*.197)%1)),q=ring.points[k],side=norm(cross(ring.axis,q.n)),length=.055+.013*(peel%3),width=.010;
   const point=(t,x)=>add(q.p,add(mul(ring.axis,length*t),add(mul(side,x*width*(1-.3*t)),mul(q.n,.0003+.006*t*t+.002*Math.sin(Math.PI*t)*(1-x*x)))));
   for(let row=0;row<12;row++)for(let col=0;col<3;col++){const t=row/12,tt=(row+1)/12,x=col/3*2-1,xx=(col+1)/3*2-1,points=[point(t,x),point(tt,x),point(t,xx),point(tt,xx)],normal=norm(cross(sub(points[1],points[0]),sub(points[2],points[0])));for(const n of [0,1,2,2,1,3])mesh.v(points[n],normal,[.43,.35,.27],0,age,r0,[(n<2?x:xx)*width,(n%2?tt:t)*length]);if(preview)mesh.preview.push({pts:[points[0],points[1],points[3],points[2]],n:normal,c:[.43,.35,.27],kind:0,phase:0});}
  }
 }
 if(cap){for(let end of [0,steps]){let ring=rings[end],normal=mul(ring.axis,end?1:-1),radius=end?r1:r0,center=ring.center,wood=[.48,.35,.21];for(let k=0;k<sides;k++){let a=ring.points[k],b=ring.points[k+1],cr=cross(sub(a.p,center),sub(b.p,center)),order=dot(cr,normal)>0?[a,b]:[b,a];let ca=k/sides*Math.PI*2,cb=(k+1)/sides*Math.PI*2;mesh.v(center,normal,wood,.12,age,radius,[0,0]);for(let q of order){let a0=q===a?ca:cb;mesh.v(q.p,normal,wood,.12,age,radius,[Math.cos(a0)*radius,Math.sin(a0)*radius])}if(preview)mesh.preview.push({pts:[center,a.p,b.p],n:normal,c:wood,kind:.12,phase:0})}}}
 let study=null;if(macro){const ring=rings.reduce((best,r)=>Math.abs(r.t-focusT)<Math.abs(best.t-focusT)?r:best,rings[0]),q=ring.points.reduce((best,q)=>q.p[2]>best.p[2]?q:best,ring.points[0]);study={focus:[...q.p],center:[...ring.center],normal:[...q.n],radius:q.r,pattern:BARK_PROFILES[type][0],length:pathLength*(t1-t0),circumference:Math.PI*2*q.r,axialSpacing:pathLength*(t1-t0)/denseSteps,circumferentialSpacing:Math.PI*2*q.r/sides,rings:steps+1,sides,depth:BARK_GEOMETRY[type]*age};}
 return {rings:steps+1,sides,quadCount,zone,age,collar,root,study};
}
export const WOOD_NOTES={
 ...Object.fromEntries(Object.entries(EAST_ASIAN_SPECIES).map(([key,sp])=>[key,{text:({maple:'Grey-brown mature bark develops coarse elongated plates and deep irregular furrows.',sakura:'Reddish-brown bark has shallow horizontal lenticels and fine peeling lines; young stems remain smooth.',ginkgo:'Grey-brown bark develops deep longitudinal furrows with broad uneven ridges.',dawnredwood:'Reddish-brown bark has long fibrous grooves and raised shredding strips above the fluted base.',chinesepine:'Thick scaly grey-brown basal plates share a continuous palette with warmer upper branches.',sweetgum:'Grey-brown bark has narrow intersecting furrows and uneven raised plates.',redbud:'Thin brown bark develops fine irregular scales on older stems.'})[key]+' Geometric relief and tissue scales are illustrative.',source:sp.source}])),
 jacaranda:{text:'Grey-brown older bark has irregular fissures and fine fibrous grain; young twigs blend toward smoother brown.',source:'https://apps.worldagroforestry.org/downloads/publications/pdfs/b11227.pdf'},
 monkeytail:{text:'The dark surface is a jacket of persistent fibrous leaf bases and embedded descending roots. Crossed fibres are geometric in close studies; cut faces show a fibrous texture instead of annual growth rings.',source:'https://pza.sanbi.org/xerophyta-retinervis'},
 eucalyptus:{text:'Smooth cream, grey and pink-brown patches share one bark palette across mature axes. Fine studies add thin curled peeling strips; young twigs are reddish.',source:'https://hortflora.rbg.vic.gov.au/taxon/ad99bce8-5340-11e7-b82b-005056b0018f'},
 baobab:{text:'Smooth grey-brown bark with shallow winding seams, soft folded relief and fine mottling; the mature bole has a swollen contour.',source:'https://pza.sanbi.org/adansonia-digitata'},
 fevertree:{text:'A yellow-green surface with fine powder-like grain and shallow flaking. Young axes blend into this palette as their red-brown outer layer sheds.',source:'https://pza.sanbi.org/vachellia-xanthophloea'},
 sausagetree:{text:'Grey-brown bark, comparatively smooth on young axes and shallowly flaky on mature sections; relief uses low irregular plates.',source:'https://pza.sanbi.org/kigelia-africana'},
 karee:{text:'Coarse dark grey-brown mature bark has winding longitudinal fissures. Fine young stems blend toward reddish brown.',source:'https://pza.sanbi.org/searsia-lancea'},
 sweetthorn:{text:'Dark mature bark has irregular fissured plates with a rusty undertone; finer reddish young axes share a continuous radius-based palette.',source:'https://pza.sanbi.org/vachellia-karroo'},
 marula:{text:'Grey-brown bark breaks into irregular flaking disks with paler mottling. Broad plate relief differs from the narrow strip bark of yellowwood.',source:'https://apps.worldagroforestry.org/treedb2/AFTPDFS/Sclerocarya_birrea_ssp._caffra.PDF'},
 wildolive:{text:'Grey, rough mature bark has winding longitudinal furrows and fine irregular flakes. Young axes blend gradually into the same grey-olive palette.',source:'https://pza.sanbi.org/olea-europaea-subsp-africana'},
 yellowwood:{text:'Grey-brown mature bark has narrow longitudinal fissures and peeling strip relief; young fine axes are smoother.',source:'https://pza.sanbi.org/podocarpus-latifolius'},
 oak:{text:'Grey-brown longitudinal ridges and fissures, with a finer fibrous surface. Relief increases with the maturity control.',source:'https://www.ucc.ie/en/tree-explorers/trees/a-z/quercusrobur/'},
 willow:{text:'Grey-brown, irregularly furrowed older bark; smoother yellow-brown fine stems. The surface uses branching grooves and fine grain.',source:'https://plants.ces.ncsu.edu/plants/salix-babylonica/'},
 pine:{text:'A shared brown palette blends gradually into warmer upper bark across the trunk and limbs. Plate relief becomes finer toward the crown and young twigs without abrupt colour bands.',source:'https://plants.ces.ncsu.edu/plants/pinus-sylvestris/'},
 birch:{text:'Pale older bark with horizontal lenticels and dark fissures; brown fine twigs. Maturity increases diamond-like dark striations.',source:'https://www.ucc.ie/en/tree-explorers/trees/a-z/betulapendula/'}
};
