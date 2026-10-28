// Surface dimensions are representative rendering estimates, not measured
// epidermal reconstructions. Venation classes are kept distinct by species.
import {PALMATE_VEINS} from './leaf-shapes.mjs?v=18';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=(x,y)=>{const z=Math.sin(x*127.1+y*311.7)*43758.5453;return z-Math.floor(z);};
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
export const LEAF_ANATOMY={
 oak:{venation:'pinnate',pairs:6,roughness:.48,thickness:.00017},
 willow:{venation:'pinnate',pairs:15,roughness:.36,thickness:.00013,glaucous:true},
 pine:{venation:'needle',pairs:0,roughness:.43,thickness:.0012},
 birch:{venation:'pinnate',pairs:6,roughness:.36,thickness:.00012},
 sweetthorn:{venation:'pinnate',pairs:4,roughness:.51,thickness:.00010,tiny:true},
 marula:{venation:'pinnate',pairs:9,roughness:.48,thickness:.00016},
 wildolive:{venation:'pinnate',pairs:8,roughness:.35,thickness:.00025,scales:true},
 yellowwood:{venation:'single',pairs:0,roughness:.45,thickness:.00024},
 baobab:{venation:'pinnate',pairs:8,roughness:.57,thickness:.00016},
 fevertree:{venation:'pinnate',pairs:3,roughness:.52,thickness:.00009,tiny:true},
 sausagetree:{venation:'pinnate',pairs:10,roughness:.52,thickness:.00023},
 karee:{venation:'pinnate',pairs:14,roughness:.39,thickness:.00021},
 jacaranda:{venation:'pinnate',pairs:5,roughness:.50,thickness:.00010,tiny:true},
 monkeytail:{venation:'parallel',pairs:0,roughness:.64,thickness:.00022},
 eucalyptus:{venation:'pinnate',pairs:16,roughness:.48,thickness:.00024,concolorous:true,glands:true},
 maple:{venation:'palmate',pairs:5,roughness:.43,thickness:.00015},
 sakura:{venation:'pinnate',pairs:9,roughness:.40,thickness:.00016},
 ginkgo:{venation:'dichotomous',pairs:0,roughness:.48,thickness:.00022},
 dawnredwood:{venation:'single',pairs:0,roughness:.47,thickness:.00013,stomatalBands:true},
 chinesepine:{venation:'needle',pairs:0,roughness:.44,thickness:.0012},
 sweetgum:{venation:'palmate',pairs:3,roughness:.38,thickness:.00017},
 redbud:{venation:'palmate',pairs:5,roughness:.44,thickness:.00015}
};
export const LEAF_SURFACE_REFERENCES=[
 ['Leaf epidermis, cuticle and surface variation','https://pmc.ncbi.nlm.nih.gov/articles/PMC8774078/'],
 ['Dawn-redwood venation and lower stomatal bands','https://www.efloras.org/florataxon.aspx?flora_id=2&taxon_id=200005396'],
 ['River-red-gum adult leaf morphology','https://hortflora.rbg.vic.gov.au/taxon/ad99bce8-5340-11e7-b82b-005056b0018f']
];
function cell(x,y){
 const ix=Math.floor(x),iy=Math.floor(y);let a=10,b=10,id=0;
 for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
  const qx=ix+i,qy=iy+j,h=hash(qx,qy),dx=qx+.2+.6*h-x,dy=qy+.2+.6*hash(qy+19,qx+7)-y,d=dx*dx+dy*dy;
  if(d<a){b=a;a=d;id=h;}else if(d<b)b=d;
 }return [Math.sqrt(b)-Math.sqrt(a),id,Math.sqrt(a)];
}
export function dichotomousVeinDistance(u,v){
 const n=v<.33?8:v<.66?16:32,start=v<.66?.33:.66,end=v<.66?.66:.96,blend=smooth(start,end,v);let distance=1;
 for(let k=-1;k<=1;k++){const j=Math.floor(u*n)+k;if(j<0||j>=n)continue;const target=(j+.5)/n,parent=(Math.floor(j/2)+.5)/(n/2),center=n===8?target:parent+(target-parent)*blend;distance=Math.min(distance,Math.abs(u-center));}
 return distance;
}
const segment=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1];return[a[0],a[1],dx,dy,1/(dx*dx+dy*dy)];};
const palmateSegments=Object.fromEntries(Object.entries(PALMATE_VEINS).map(([type,ends])=>{
 const primary=[],secondary=[];for(const end of ends){primary.push(segment([0,0],end));const l=Math.hypot(...end),dx=end[0]/l,dy=end[1]/l;for(let j=0;j<4;j++)for(const hand of[-1,1]){const t=.24+j*.17,a=end.map(q=>q*t),ex=dx-dy*hand*.85,ey=dy+dx*hand*.85,L=Math.hypot(ex,ey);secondary.push(segment(a,[a[0]+ex/L*.18*(1-t),a[1]+ey/L*.18*(1-t)]));}}
 return[type,{primary,secondary}];
}));
function segmentDistanceSquared(x,y,s){const px=x-s[0],py=y-s[1],t=clamp((px*s[2]+py*s[3])*s[4],0,1),dx=px-s[2]*t,dy=py-s[3]*t;return dx*dx+dy*dy;}
export function leafSurface(type,u,v,length,width,under=false){
 const p=LEAF_ANATOMY[type],x=(u-.5)*width,y=v*length,ax=Math.abs(u-.5)*2;
 let vein=0,secondary=0,tertiary=0;
 const mid=Math.exp(-Math.pow(x/Math.max(.000025,length*.007),2))*(1-.65*v);
 if(p.venation==='dichotomous'){
  vein=Math.exp(-Math.pow(dichotomousVeinDistance(u,v)/.004,2));
 }else if(p.venation==='palmate'){
  let d=1,s=1;const xx=(u-.5)*width/length;
  for(const segment of palmateSegments[type].primary)d=Math.min(d,segmentDistanceSquared(xx,v,segment));
  for(const segment of palmateSegments[type].secondary)s=Math.min(s,segmentDistanceSquared(xx,v,segment));
  vein=Math.exp(-d/.000036);secondary=Math.exp(-s/.000009);
 }else if(p.venation==='needle'||p.venation==='parallel'){
  const f=(x/(p.venation==='needle'?.00024:.00036)+100)%1;
  vein=Math.exp(-Math.pow((f-.5)/.16,2));
 }else{
  vein=mid;
  if(p.pairs){const f=((v-ax*.13-ax*ax*.06)*p.pairs+100)%1;secondary=Math.exp(-Math.pow(Math.min(f,1-f)/.045,2))*smooth(.03,.12,ax);}
 }
 // Areoles occur on reticulate blades, not on parallel-veined conifers.
 const reticulate=p.venation==='pinnate'||p.venation==='palmate';
 const areole=reticulate?cell(x*1700+Math.sin(y*200)*.7,y*1700):[1,.5];
 if(reticulate)tertiary=Math.exp(-areole[0]*25);
 const epidermis=cell(x*11000+Math.sin(y*250)*.8,y*11000),wall=Math.exp(-epidermis[0]*45),grain=epidermis[1];
 const reliefScale=p.tiny?.26:1;
 let height=((under?.00013:.000030)*vein+(under?.000040:.000012)*secondary+tertiary*.000007)*reliefScale+wall*.0000018;
 let tone=.97+.055*grain+vein*.13+secondary*.055+tertiary*.025,rough=p.roughness+(grain-.5)*.07;
 if(under){rough=Math.min(.8,rough+.18);if(!p.concolorous)tone*=1.08;if(p.glaucous)tone*=1.14;}
 if(p.stomatalBands&&under){const bands=Math.exp(-Math.pow((ax-.42)/.19,2));tone+=bands*.23;}
 if(p.scales&&under){const scales=cell(x*7000,y*7000);tone=.91+scales[1]*.20;height+=Math.exp(-scales[0]*25)*.000004;rough=.73;}
 if(p.glands){const glands=cell(x*3600,y*3600),pit=Math.exp(-Math.pow(glands[2]/.09,2))*smooth(.5,.8,glands[1]);tone-=pit*.035;height-=pit*.000003;}
 return [height,tone,rough];
}

// Texture samples store relief gradients, colour modulation and roughness.
// Pixel dimensions track blade proportions so narrow leaves keep longitudinal detail.
export function createLeafSurfaceTexture(type,length,width,under=false,{height=768,bounds=[0,0,1,1]}={}){
 const [u0,v0,u1,v1]=bounds,du=u1-u0,dv=v1-v0,w=clamp(Math.round(height*width*du/(length*dv)),96,768),h=height,field=new Float32Array(w*h*3),data=new Float32Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)field.set(leafSurface(type,u0+(x+.5)/w*du,v0+(y+.5)/h*dv,length,width,under),(y*w+x)*3);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const o=(y*w+x)*4,a=(y*w+Math.max(0,x-1))*3,b=(y*w+Math.min(w-1,x+1))*3,c=(Math.max(0,y-1)*w+x)*3,d=(Math.min(h-1,y+1)*w+x)*3,k=(y*w+x)*3;
  data[o]=(field[b]-field[a])/(2*width*du/w);data[o+1]=(field[d]-field[c])/(2*length*dv/h);data[o+2]=field[k+1];data[o+3]=field[k+2];
 }
 return {width:w,height:h,data,bounds};
}
