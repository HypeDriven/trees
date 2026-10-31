import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSpecimen,SPECIES} from '../dist/botany.mjs';
import {REGIONAL_PRESETS} from '../dist/regional-species.mjs';
import {createSoftwareStudy} from '../dist/software-study.mjs';
for(const [type,view]of [['prunus-campanulata','flower'],['ceiba-pentandra','fruit']]){
 const cfg={...REGIONAL_PRESETS[type],type,view,flowerLayout:'single',flowerStage:'open',fruitStage:'released',seed:2847,maturity:.65,woodPart:'trunk',wind:0,gust:0,direction:0};
 const specimen=buildSpecimen(cfg,{preview:false}),center=specimen.bounds.min.map((v,i)=>(v+specimen.bounds.max[i])/2),span=Math.max(...specimen.bounds.max.map((v,i)=>v-specimen.bounds.min[i])),scale=1.6/span;
 const vp=new Float32Array([scale,0,0,0,0,scale,0,0,0,0,scale,0,-center[0]*scale,-center[1]*scale,-center[2]*scale,1]);
 const renderer=createSoftwareStudy(),settings={vp,eye:[center[0],center[1],center[2]+span*3],sun:[1,.4,1],cfg,time:0,width:160,height:160},upload={...cfg,widthRatio:SPECIES[type].width};
 renderer.upload(new Float32Array(),upload);const blank=renderer.render(settings).data.slice();renderer.upload(specimen.vertices,upload);const picture=renderer.render(settings).data.slice(),other=renderer.render({...settings,sun:[-1,.4,-1]}).data;
 let changed=0,lit=0;for(let i=0;i<picture.length;i+=4){if(picture[i]!==blank[i]||picture[i+1]!==blank[i+1]||picture[i+2]!==blank[i+2])changed++;if(picture[i]!==other[i]||picture[i+1]!==other[i+1]||picture[i+2]!==other[i+2])lit++;}assert(changed>200);assert(lit>100);console.log(type+': software '+view+' renders actual tissues and responds to lighting');
}
const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),fallback=app.slice(app.indexOf('function startCanvas()'),app.indexOf('function saveSnapshot()'));
assert.equal(fallback.split("['leaf','surface','shoot','wood','bark','flower','fruit']").length-1,2);
