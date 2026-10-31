// Requires Playwright and Chrome; run just up from the parent directory first.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-unsafe-webgpu','--disable-gpu-watchdog']});try{
 const p=await b.newPage();await p.goto((process.env.TREES_URL||'http://127.0.0.1:8080')+'/LICENSE.txt');
 const result=await p.evaluate(async()=>{
  const source=await(await fetch('app.js')).text(),wgsl=source.match(/const shader=`([\s\S]*?)`;/)[1],helper=wgsl.slice(wgsl.indexOf('fn shadowVisibility('),wgsl.indexOf('\n@fragment fn fs(o:Out,'));
  const a=await navigator.gpu.requestAdapter(),d=await a.requestDevice();d.pushErrorScope('validation');
  const vertex=`@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4f {let x=f32((i<<1u)&2u);let y=f32(i&2u);return vec4f(x*2.0-1.0,y*2.0-1.0,0,1);}`;
  const sm=d.createShaderModule({code:vertex+`@fragment fn fs(@builtin(position) p:vec4f)->@builtin(frag_depth) f32 {let uv=p.xy/2048.0;return .2+.45*uv.x+.15*uv.y;}`});
  const sp=d.createRenderPipeline({layout:'auto',vertex:{module:sm,entryPoint:'vs'},fragment:{module:sm,entryPoint:'fs',targets:[]},depthStencil:{format:'depth32float',depthWriteEnabled:true,depthCompare:'always',depthBias:2,depthBiasSlopeScale:2}});
  const shadow=d.createTexture({size:[2048,2048],format:'depth32float',usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT});
  let encoder=d.createCommandEncoder(),pass=encoder.beginRenderPass({colorAttachments:[],depthStencilAttachment:{view:shadow.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});pass.setPipeline(sp);pass.draw(3);pass.end();d.queue.submit([encoder.finish()]);
  const code=vertex+`@group(0) @binding(0) var<uniform> options:vec4f;@group(0) @binding(1) var shadow:texture_depth_2d;@group(0) @binding(2) var smp:sampler_comparison;`+helper+`@fragment fn fs(@builtin(position) p:vec4f)->@location(0) vec4f {let uv=p.xy/64.0;let lp=vec4f((uv.x+options.y)*2.0-1.0,1.0-uv.y*2.0,.2+.45*uv.x+.15*uv.y+options.x,1);let q=vec3f(lp.x*.5+.5,.5-lp.y*.5,lp.z);let v=shadowVisibility(q,dpdx(q),dpdy(q));return vec4f(v,v,v,1);}`;
  const module=d.createShaderModule({code}),messages=(await module.getCompilationInfo()).messages.filter(x=>x.type==='error');if(messages.length)throw Error(messages.map(x=>x.message).join('\n'));
  const pipeline=await d.createRenderPipelineAsync({layout:'auto',vertex:{module,entryPoint:'vs'},fragment:{module,entryPoint:'fs',targets:[{format:'rgba8unorm'}]}});
  const uniform=d.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),target=d.createTexture({size:[64,64],format:'rgba8unorm',usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC}),read=d.createBuffer({size:64*256,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST});
  const bind=d.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:uniform}},{binding:1,resource:shadow.createView()},{binding:2,resource:d.createSampler({compare:'less-equal',magFilter:'linear',minFilter:'linear'})}]});
  const results=[];
  for(const [delta,offset]of [[0,0],[.05,0],[0,2]]){
   d.queue.writeBuffer(uniform,0,new Float32Array([delta,offset,0,0]));encoder=d.createCommandEncoder();pass=encoder.beginRenderPass({colorAttachments:[{view:target.createView(),clearValue:[0,0,0,1],loadOp:'clear',storeOp:'store'}]});pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.draw(3);pass.end();encoder.copyTextureToBuffer({texture:target},{buffer:read,bytesPerRow:256},[64,64]);d.queue.submit([encoder.finish()]);await read.mapAsync(GPUMapMode.READ);const pixels=new Uint8Array(read.getMappedRange()),values=[];for(let y=2;y<62;y++)for(let x=2;x<62;x++)values.push(pixels[(y*64+x)*4]);results.push({delta,offset,min:Math.min(...values),max:Math.max(...values)});read.unmap();
  }
  const error=await d.popErrorScope();if(error)throw Error(error.message);return results;
 });
 assert(result[0].min>=250,'Sloped receiver has false self-shadowing');assert(result[1].max<=5,'A real occluder must still cast shadows');assert(result[2].min>=250,'Out-of-map samples must be lit');console.log('Actual WebGPU shadow filtering:',JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
