// Execute the real cached opacity sampler on original and regional foliage.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage();await page.goto((process.env.TREES_URL||'http://127.0.0.1:8080')+'/LICENSE.txt');
 const report=await page.evaluate(async()=>{
  const {REGIONAL_SPECIES}=await import('./regional-species.mjs'),{SPECIES}=await import('./botany.mjs'),{getSurfaceAtlas}=await import('./surface-cache.mjs'),source=await(await fetch('./app.js')).text(),fragment=source.match(/const fs=`([\s\S]*?)`;/)[1],helper=fragment.slice(fragment.indexOf('float cachedCardCoverage('),fragment.indexOf('float filteredCardCoverage('));
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const gl=canvas.getContext('webgl2');if(!gl)throw Error('WebGL2 unavailable');
  const shader=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'#version 300 es\nprecision highp float;precision highp sampler2DArray;uniform sampler2DArray surfaceAtlas;uniform float kind;uniform vec2 pixel;out vec4 colour;'+helper+'void main(){float a=cachedCardCoverage(gl_FragCoord.xy/64.,kind,pixel);colour=vec4(a,a,a,1);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);gl.viewport(0,0,64,64);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D_ARRAY,texture);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(program,'surfaceAtlas'),0);
  const kinds={pine:[1.191,1.198],chinesepine:[1.191,1.198],sweetthorn:[1.23,1.25],fevertree:[1.34,1.37],jacaranda:[1.41,1.48],dawnredwood:[1.49]},rows=[];
  for(const type of [...Object.keys(kinds),...Object.keys(REGIONAL_SPECIES).filter(t=>REGIONAL_SPECIES[t].compound==='bipinnate')]){
   const s=SPECIES[type],atlas=getSurfaceAtlas({type,leafSize:s.length,maturity:.65},s.width);atlas.levels.forEach((level,i)=>gl.texImage3D(gl.TEXTURE_2D_ARRAY,i,gl.RGBA8,level.width,level.height,atlas.layers,0,gl.RGBA,gl.UNSIGNED_BYTE,level.data));
   let minimum=Infinity;
   for(const kind of kinds[type]||[1.23,1.24,1.25])for(const footprint of [.008,.04,.16,.6]){
    gl.uniform1f(gl.getUniformLocation(program,'kind'),kind);gl.uniform2f(gl.getUniformLocation(program,'pixel'),footprint,footprint);gl.drawArrays(gl.TRIANGLES,0,3);const pixels=new Uint8Array(64*64*4);gl.readPixels(0,0,64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let sum=0;for(let i=0;i<pixels.length;i+=4)sum+=pixels[i];minimum=Math.min(minimum,sum/(64*64*255));
   }
   if(gl.getError()!==gl.NO_ERROR)throw Error('GPU error while sampling '+type);rows.push({type,minimumCoverage:minimum});
  }
  gl.deleteTexture(texture);gl.deleteProgram(program);return rows;
 });
 for(const row of report)assert(row.minimumCoverage>.005,row.type+' becomes transparent as mip level increases');console.log('Actual GPU opacity stays populated across zoom/mips:',JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
