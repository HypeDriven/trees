import {bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage} from './compound-lod.mjs?v=22';
import {createLeafSurfaceTexture} from './leaf-anatomy.mjs?v=22';
import {barkSample} from './wood.mjs?v=22';
const cache=new Map(),maskCache=new Map(),LAYERS=12,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),SIZE=256;
// Linear RGBA data: two metric height gradients, tone / 1.5, roughness.
// Basal blade space includes negative y, preserving cordate/palmate bases.
export function getSurfaceAtlas(cfg,widthRatio=.30){
 const key=[cfg.type,cfg.leafSize.toFixed(5),(cfg.maturity??.65).toFixed(2)].join(':');if(cache.has(key))return cache.get(key);
 const bytes=new Uint8Array(SIZE*SIZE*LAYERS*4),put=(o,x,y,tone,rough)=>{bytes[o]=Math.round(clamp(.5+x*.25,0,1)*255);bytes[o+1]=Math.round(clamp(.5+y*.25,0,1)*255);bytes[o+2]=Math.round(clamp(tone/1.5,0,1)*255);bytes[o+3]=Math.round(clamp(rough,0,1)*255);};
 const length=cfg.leafSize,width=cfg.type==='monkeytail'?Math.min(.008,length*.024):Math.max(.002,length*widthRatio*2);
 for(let face=0;face<2;face++){
  const t=createLeafSurfaceTexture(cfg.type,length,width,!!face,{height:SIZE,bounds:[0,-.20,1,1]});
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const sx=Math.min(t.width-1,Math.floor((x+.5)/SIZE*t.width)),o=(y*t.width+sx)*4;put(((face*SIZE+y)*SIZE+x)*4,t.data[o],t.data[o+1],t.data[o+2],t.data[o+3]);}
 }
 const field=new Float32Array(SIZE*SIZE*3),age=(cfg.maturity??.65)*.65;
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const s=barkSample(cfg.type,[(x+.5)/SIZE*.25,(y+.5)/SIZE*.50],age,0),o=(y*SIZE+x)*3;field[o]=s.height;field[o+1]=(1.13-.75*s.dark)*(.70+.45*s.color);field[o+2]=s.roughness;}
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const o=(y*SIZE+x)*3,a=(y*SIZE+Math.max(0,x-1))*3,b=(y*SIZE+Math.min(SIZE-1,x+1))*3,c=(Math.max(0,y-1)*SIZE+x)*3,d=(Math.min(SIZE-1,y+1)*SIZE+x)*3;put(((2*SIZE+y)*SIZE+x)*4,(field[b]-field[a])/(.50/SIZE),(field[d]-field[c])/(1/SIZE),field[o+1],field[o+2]);}
 const maskType=['pine','chinesepine','sweetthorn','fevertree','jacaranda','dawnredwood'].includes(cfg.type);
 if(maskType){let masks=maskCache.get(cfg.type);if(!masks){masks=new Uint8Array(SIZE*SIZE*9);const slots=['pine','chinesepine','jacaranda'].includes(cfg.type)?8:cfg.type==='sweetthorn'?3:cfg.type==='fevertree'?4:1;for(let slot=0;slot<slots;slot++)for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){let coverage=0;for(const dx of[.25,.75])for(const dy of[.25,.75]){const u=(x+dx)/SIZE,v=(y+dy)/SIZE;coverage+=cfg.type==='dawnredwood'?redwoodSprayCoverage(u,v):cfg.type==='pine'||cfg.type==='chinesepine'?pineSprayCoverage(u,v,slot):bipinnateCoverage(u,v,cfg.type==='jacaranda'?slot+7:cfg.type==='fevertree'?slot+4:slot+3,cfg.type==='jacaranda'?16:cfg.type==='fevertree'?13:9,cfg.type==='jacaranda');}masks[(slot*SIZE+y)*SIZE+x]=Math.round(coverage*255/4);}maskCache.set(cfg.type,masks);}for(let i=0;i<masks.length;i++)bytes[(3*SIZE*SIZE+i)*4+3]=masks[i];}
 const levels=[{width:SIZE,height:SIZE,data:bytes}];let w=SIZE,h=SIZE,data=bytes;
 while(w>1||h>1){const nw=Math.max(1,w>>1),nh=Math.max(1,h>>1),next=new Uint8Array(nw*nh*LAYERS*4);for(let layer=0;layer<LAYERS;layer++)for(let y=0;y<nh;y++)for(let x=0;x<nw;x++)for(let k=0;k<4;k++){let sum=0;for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++)sum+=data[((layer*h+Math.min(h-1,y*2+yy))*w+Math.min(w-1,x*2+xx))*4+k];next[((layer*nh+y)*nw+x)*4+k]=Math.round(sum/4);}levels.push({width:nw,height:nh,data:next});w=nw;h=nh;data=next;}
 const result={key,width:SIZE,height:SIZE,layers:LAYERS,levels,bytes:levels.reduce((n,l)=>n+l.data.byteLength,0)};cache.set(key,result);if(cache.size>6)cache.delete(cache.keys().next().value);return result;
}
export function uploadSurfaceAtlas(device,atlas){
 const texture=device.createTexture({size:[atlas.width,atlas.height,atlas.layers],mipLevelCount:atlas.levels.length,format:'rgba8unorm',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});
 atlas.levels.forEach((l,mipLevel)=>device.queue.writeTexture({texture,mipLevel},l.data,{bytesPerRow:l.width*4,rowsPerImage:l.height},[l.width,l.height,atlas.layers]));return texture;
}
