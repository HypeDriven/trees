const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8');
(async()=>{
 const {SPECIES}=await import('../dist/botany.mjs'),{bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage}=await import('../dist/compound-lod.mjs');
 const elements=new Map(),$=key=>{if(!elements.has(key))elements.set(key,{close(){},querySelector(){return{};}});return elements.get(key);};
 let files,downloaded,pixels,mask;
 const canvas={width:0,height:0,getContext(){return{createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)};},putImageData(p){pixels=p;}};},toBlob(done){mask=pixels.data.slice();done(new Blob([new Uint8Array([137,80,78,71,13,10,26,10])]));}};
 const context={assert,SPECIES,bipinnateCoverage,redwoodSprayCoverage,pineSprayCoverage,console,$,document:{createElement:()=>canvas},Uint8Array,Uint8ClampedArray,Float32Array,TextEncoder,Blob,Map,Math,JSON,Number,Promise,toast(){},zipDownload(value){files=value;},download(value){downloaded=value;},sync(){},schedule(){}};
 vm.createContext(context);
 vm.runInContext('const SPECIES_IDS='+source.match(/const SPECIES_IDS=(.*?);/)[1]+';let defaults='+source.match(/const defaults=(.*?);\n/)[1]+';let controls='+source.match(/const controls=(.*?);\n/)[1]+';let cfg={...defaults};let hidden=false;',context);
 vm.runInContext(source.slice(source.indexOf('async function thornCutoutFiles'),source.indexOf("$('#export').onclick=")),context);
 const vertices=[];for(let pairs=3;pairs<=5;pairs++)for(let i=0;i<6;i++)vertices.push(i*.01,0,0,0,1,0,.13,.27,.06,1.2+pairs*.01,0,0,i%2,i<3?0:1);
 for(let pairs=4;pairs<=7;pairs++)for(let i=0;i<6;i++)vertices.push(i*.01,0,0,0,1,0,.18,.29,.075,1.3+pairs*.01,0,0,i%2,i<3?0:1);
 for(let pairs=7;pairs<=14;pairs++)for(let i=0;i<6;i++)vertices.push(i*.01,0,0,0,1,0,.15,.30,.07,1.4+(pairs-6)*.01,0,0,i%2,i<3?0:1);
 for(let i=0;i<6;i++)vertices.push(i*.01,0,0,0,1,0,.18,.33,.13,1.49,0,0,i%2,i<3?0:1);
 for(let i=0;i<6;i++)vertices.push(i*.01,0,0,0,1,0,.11,.25,.14,1.195,0,0,i%2,i<3?0:1);
 context.treeVertices=new Float32Array(vertices);
 vm.runInContext("cfg={...defaults,type:'sweetthorn',view:'tree',leafSize:.006};",context);
 await vm.runInContext('exportMesh()',context);
 assert(files['starhermit-thorn.png'] instanceof Uint8Array);assert(files['starhermit-thorn-opacity.png'] instanceof Uint8Array);
 assert(files['starhermit-trees.mtl'].includes('map_d starhermit-thorn-opacity.png'));assert(files['starhermit-trees.mtl'].includes('thorn_cutout'));
 const obj=files['starhermit-trees.obj'],uvs=obj.split('\n').filter(l=>l.startsWith('vt ')).map(l=>Number(l.split(' ')[1]));
 for(let slot=0;slot<3;slot++)assert(uvs.slice(slot*6,slot*6+6).every(x=>x>=slot/9-1e-6&&x<=(slot+1)/9+1e-6));
 const tex=obj.split('\n').filter(l=>l.startsWith('vt ')).map(l=>l.split(' ').slice(1).map(Number));for(let n=0;n<4;n++){const slot=n+1;for(const [u,v]of tex.slice(18+n*6,24+n*6)){assert(u>=slot/9-1e-6&&u<=(slot+1)/9+1e-6);assert(v>=.5-1e-6&&v<=.75+1e-6,'Fever-tree UVs must address the fine-leaflet atlas row');}}
 for(let n=0;n<8;n++)for(const [u,v]of tex.slice(42+n*6,48+n*6)){assert(u>=n/9-1e-6&&u<=(n+1)/9+1e-6);assert(v>=.25-1e-6&&v<=.5+1e-6,'Jacaranda UVs must address the terminal-pinna atlas row');}
 for(const[u,v]of tex.slice(90,96)){assert(u>=0&&u<=1/9+1e-6);assert(v>=0&&v<=.25+1e-6,'Redwood sprays need their own opacity row');}
 for(const[u,v]of tex.slice(96,102)){assert(u>=1/9-1e-6&&u<=2/9+1e-6);assert(v>=0&&v<=.25+1e-6,'Pine cohorts need their own atlas cell');}
 assert(obj.includes('f 1/1/1 2/2/2 3/3/3'));assert(mask.some(v=>v===0)&&mask.some(v=>v===255));
 const recipe=JSON.parse(files['recipe.json']);assert.equal(recipe.version,12);assert.equal(recipe.parameters.type,'sweetthorn');
 // Actual ZIP builder must preserve binary PNG bytes rather than text-encode them.
 vm.runInContext(source.slice(source.indexOf('function zipDownload('),source.indexOf('\n',source.indexOf('function zipDownload('))),context);
 vm.runInContext("zipDownload({'tiny.png':new Uint8Array([137,80,78,71,255,0])})",context);
 const zip=new Uint8Array(await downloaded.arrayBuffer()),offset=30+new DataView(zip.buffer).getUint16(26,true);assert.deepEqual([...zip.slice(offset,offset+6)],[137,80,78,71,255,0]);
 // Execute the real import handler for every new species and a legacy recipe.
 const importStart=source.indexOf("$('#import').onchange=")+"$('#import').onchange=".length,importEnd=source.indexOf('\n',importStart);
 vm.runInContext('var restore='+source.slice(importStart,importEnd).replace(/;$/,''),context);
 for(const type of ['sweetthorn','marula','wildolive','yellowwood','baobab','fevertree','sausagetree','karee','jacaranda','monkeytail','eucalyptus','maple','sakura','ginkgo','dawnredwood','chinesepine','sweetgum','redbud','oak']){
  const defaults=vm.runInContext('({...defaults})',context),r={format:type==='oak'?'silva-tree':'starhermit-trees',version:type==='oak'?6:8,parameters:{...defaults,...(type==='monkeytail'?{height:1.1,rootDepth:.25}:{}),type,leafSize:SPECIES[type].length}};
  if(type==='oak'){delete r.parameters.fruitStage;delete r.parameters.coneOpening;}
  const input={files:[{async text(){return JSON.stringify(r);}}],value:'file'};
  await context.restore({target:input});assert.equal(vm.runInContext('cfg.type',context),type);assert.equal(vm.runInContext('cfg.fruitStage',context),'mature');assert.equal(input.value,'');
 }
 console.log('OBJ cutout UVs/materials, binary texture ZIPs, all new species recipes and legacy import passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
