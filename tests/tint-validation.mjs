// Install the optional official Dawn `webgpu` package outside the app, or set
// DAWN_WEBGPU_MODULE to its index.js. No browser/GPU is needed for Tint checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const {create,globals}=await import(process.env.DAWN_WEBGPU_MODULE??'webgpu');
Object.assign(globalThis,globals);
const gpu=create(['backend=null']),adapter=await gpu.requestAdapter(),device=await adapter.requestDevice();
try{
 const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),code=source.match(/const shader=`([\s\S]*?)`;/)[1];
 device.pushErrorScope('validation');const module=device.createShaderModule({code}),info=await module.getCompilationInfo();assert.deepEqual(info.messages.filter(m=>m.type==='error'),[]);assert.equal(await device.popErrorScope(),null);
 const attributes=[[0,0,'float32x3'],[1,12,'float32x3'],[2,24,'float32x3'],[3,36,'float32'],[4,40,'float32'],[5,44,'float32'],[6,48,'float32x2']].map(([shaderLocation,offset,format])=>({shaderLocation,offset,format})),buffers=[{arrayStride:56,attributes}];
 await device.createRenderPipelineAsync({layout:'auto',vertex:{module,entryPoint:'vs',buffers},fragment:{module,entryPoint:'fs',targets:[{format:'rgba8unorm'}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'},multisample:{count:4,alphaToCoverageEnabled:true}});
 await device.createRenderPipelineAsync({layout:'auto',vertex:{module,entryPoint:'vsShadow',buffers},fragment:{module,entryPoint:'fsShadow',targets:[]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'less',depthBias:2,depthBiasSlopeScale:2}});
 // Negative control: the exact class of defect reported by Chromium must fail.
 const broken=code.replace('if(cachedNormal){','if(cachedNormal){let nonuniformDerivative=dpdy(o.uv);');assert.notEqual(broken,code);
 device.pushErrorScope('validation');const invalid=device.createShaderModule({code:broken}),diagnostics=await invalid.getCompilationInfo();assert(diagnostics.messages.some(m=>m.type==='error'&&m.message.includes('uniform control flow')));assert(await device.popErrorScope());
 console.log('Dawn/Tint accepts both actual pipelines and rejects a non-uniform derivative negative control');
}finally{device.destroy();}
process.exit(0);
