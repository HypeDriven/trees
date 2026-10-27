// Physical-scale procedural wood. Relief amplitudes are illustrative, not scans.
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/(Math.hypot(...a)||1));
const fract=x=>x-Math.floor(x),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{let t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453);
export function woodNoise(x,y){let a=Math.floor(x),b=Math.floor(y),u=smooth(0,1,fract(x)),v=smooth(0,1,fract(y));return mix(mix(hash(a,b),hash(a+1,b),u),mix(hash(a,b+1),hash(a+1,b+1),u),v)}
function woodCell(x,y){let a=Math.floor(x),b=Math.floor(y),fx=fract(x),fy=fract(y),near=8,second=8,id=.5;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){let hx=hash(a+i,b+j),hy=fract(Math.sin((a+i)*269.5+(b+j)*183.3)*43758.5453),dx=i+.2+.6*hx-fx,dy=j+.2+.6*hy-fy,d=dx*dx+dy*dy;if(d<near){second=near;near=d;id=hx}else second=Math.min(second,d)}return[Math.sqrt(second)-Math.sqrt(near),id]}
export function barkSample(type,uv,age=.65,zone=0){
 let x=uv[0],y=uv[1],coarse=woodNoise(x*13,y*8),warp=woodNoise(x*24,y*9),fibers=Math.sin(x*3100+Math.sin(y*180)*1.5),height=0,dark=0,rough=.82;
 if(type==='monkeytail'){let fiber=Math.pow(.5+.5*Math.sin(x*2400+Math.sin(y*35)*.8),12),crossing=Math.pow(.5+.5*Math.sin(x*650+y*960),18),pores=woodNoise(x*1800,y*1400);return{height:fiber*.00038+crossing*.00022+(pores-.5)*.00006,dark:.3+.4*(1-fiber),roughness:.92,color:pores*.6+fiber*.4};}
 if(zone>.075&&type!=='pine'){let pores=woodNoise(x*950,y*750);return {height:(pores-.5)*.00005,dark:smooth(.8,1,pores)*.20,roughness:.60,color:coarse}}
 if(type==='birch'&&zone>.03&&zone<.05){let row=Math.floor(y*115),u=fract(x*42+hash(row,1)*2),v=fract(y*115),line=(1-smooth(.055,.14,Math.abs(v-.5)))*(1-smooth(.12,.36,Math.abs(u-.5)));let diamond=Math.abs(Math.sin(x*95+y*25))*Math.abs(Math.sin(x*95-y*25));let fissure=(1-smooth(.012,.04,diamond))*age*age;return{height:-.00017*line-.0012*fissure+(coarse-.5)*.00012,dark:Math.max(line*.78,fissure*.72),roughness:.50+coarse*.16,color:coarse}}
 if(type==='pine'){let upper=smooth(0,.06,zone),young=smooth(.06,.08,zone),cell=woodCell(x*mix(52,105,upper)+warp*.3,y*mix(24,85,upper)+coarse*.3),crack=1-smooth(.018,.11,cell[0]),pores=woodNoise(x*950,y*750);height=mix(((1-crack)*(.65+.35*cell[1])-.25*crack)*mix(.004,.0012,upper)*(.3+.7*age),(pores-.5)*.00005,young);dark=mix(crack*.80,smooth(.8,1,pores)*.20,young);rough=mix(mix(.85,.66,upper),.60,young);
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
export function woodTube(mesh,points,r0,r1,type,{fine=false,macro=false,maturity=.65,root=false,collar=false,preview=true,cap=false,zone:forceZone,treeHeight=10}={}){
 const isTwig=r0<.007,white=type==='birch'&&r0>.018;
 let zone=forceZone??(type==='pine'?pineBarkStyle(points[0][1],r0,treeHeight).zone:isTwig?.08:white?.04:0),age=Math.max(.04,Math.min(1,maturity*(isTwig?.10:.35+.65*Math.min(1,r0/.09))));
 const southern={jacaranda:[[.32,.30,.26],[.30,.25,.18]],monkeytail:[[.045,.037,.030],[.11,.075,.045]],eucalyptus:[[.54,.52,.46],[.36,.20,.14]],baobab:[[.40,.37,.34],[.36,.34,.28]],fevertree:[[.43,.46,.19],[.40,.36,.20]],sausagetree:[[.37,.34,.28],[.34,.29,.21]],karee:[[.25,.235,.19],[.35,.19,.12]],sweetthorn:[[.20,.17,.135],[.34,.17,.10]],marula:[[.40,.38,.33],[.34,.30,.22]],wildolive:[[.29,.29,.24],[.30,.29,.20]],yellowwood:[[.33,.31,.26],[.25,.29,.17]]}[type];
 const base=zone===.04?[.70,.69,.62]:zone===.06?[.43,.20,.075]:zone===.08?(type==='willow'?[.34,.30,.095]:[.24,.15,.09]):type==='birch'?[.24,.22,.19]:type==='willow'?[.24,.22,.18]:[.27,.235,.19];
 const wholeGum=type==='eucalyptus'&&!fine&&!macro;
 let sides=macro?(preview?112:224):fine?96:wholeGum?(r0>.14?40:r0>.035?16:r0>.007?8:5):r0>.14?56:r0>.035?24:r0>.007?10:5,steps=macro?(preview?90:160):fine?80:Math.max(points.length-1,r0>.04?(wholeGum?24:32):points.length-1),rings=[],arc=0,previousU=null;
 const phase=points[0][0]*.37+points[0][2]*.53,uvOffset=points[0][1];
 for(let j=0;j<=steps;j++){
  let t=j/steps,p=interpolatePath(points,t),before=interpolatePath(points,Math.max(0,t-.0003)),after=interpolatePath(points,Math.min(1,t+.0003)),axis=norm(sub(after,before));if(j)arc+=Math.hypot(...sub(p,rings[j-1].center));
  let u=previousU?norm(sub(previousU,mul(axis,dot(previousU,axis)))):norm(cross(axis,Math.abs(axis[1])>.94?[1,0,0]:[0,1,0]));if(Math.hypot(...u)<.9)u=norm(cross(axis,[0,0,1]));previousU=u;let v=norm(cross(u,axis)),r=woodRadius(r0,r1,t)*(type==='baobab'&&points[0][1]<.01&&r0>.45?1+.18*Math.sin(Math.PI*t):1),localAge=age*(.3+.7*Math.sqrt(r/r0)),collarBump=collar?.28*Math.exp(-Math.pow((arc-r0*2.6)/Math.max(.01,r0*1.3),2)):0,ring=[];
  const pineStyle=type==='pine'?pineBarkStyle(p[1],r,treeHeight):null,ringZone=forceZone??pineStyle?.zone??zone,ringBase=pineStyle?.color??(southern?southern[0].map((c,i)=>mix(c,southern[1][i],1-smooth(.003,.025,r))):base);
  for(let k=0;k<=sides;k++){
   let a=k/sides*Math.PI*2,n=add(mul(u,Math.cos(a)),mul(v,Math.sin(a))),uv=[a*r+phase,arc+uvOffset],surface=barkSample(type,uv,localAge,ringZone),rootFlare=root?.38*Math.exp(-arc/Math.max(.08,r0*2))*(.6+.4*Math.cos(a*5+phase)):0,rr=r*(1+collarBump+rootFlare)+surface.height*Math.min(1,r/.02);
   let pos=add(p,mul(n,Math.max(r*.75,rr))),taper=(r0-r1)/Math.max(.001,Math.hypot(...sub(points.at(-1),points[0])));let normal=norm(add(n,mul(axis,taper)));
   const palette=type==='eucalyptus'?[.55,.54,.48].map((c,i)=>mix(mix(c,[.34,.36,.33][i],smooth(.24,.48,surface.color)),[.48,.34,.27][i],smooth(.52,.73,surface.color))):ringBase,youngEuc=type==='eucalyptus'?1-smooth(.003,.015,r):0;const co=palette.map((x,i)=>mix(x,[.36,.20,.14][i],youngEuc)*(.94+.12*surface.color));ring.push({p:pos,n:normal,c:co,uv,age:localAge,r,zone:ringZone});
  }ring[sides].p=[...ring[0].p];ring[sides].n=[...ring[0].n];rings.push({points:ring,center:p,axis});
 }
 let quadCount=0;
 function quad(a,b,c,d){let n=norm(add(a.n,c.n)),cr=cross(sub(b.p,a.p),sub(c.p,a.p)),indices=dot(cr,n)<0?[a,c,b,c,d,b]:[a,b,c,c,b,d];for(let q of indices)mesh.v(q.p,q.n,q.c,q.zone,q.age,q.r,q.uv);if(preview)mesh.preview.push({pts:[a.p,b.p,d.p,c.p],n,c:a.c,kind:a.zone,phase:0});quadCount++}
 for(let j=0;j<steps;j++)for(let k=0;k<sides;k++)quad(rings[j].points[k],rings[j+1].points[k],rings[j].points[k+1],rings[j+1].points[k+1]);
 if(type==='monkeytail'&&r0>.012){
  const count=fine?32:14;for(let hand of [-1,1])for(let k=0;k<count;k++)for(let j=0;j<steps;j++){
   const get=(n,sign)=>{const ring=rings[n],index=Math.floor(((k/count+hand*n/steps*.07)%1+1)%1*sides),q=ring.points[index],edge=norm(cross(ring.axis,q.n)),offset=add(mul(q.n,.00020),mul(edge,sign*.00020));return{...q,p:add(q.p,offset)};};
   quad(get(j,-1),get(j+1,-1),get(j,1),get(j+1,1));
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
 return {rings:steps+1,sides,quadCount,zone,age,collar,root};
}
export const WOOD_NOTES={
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
