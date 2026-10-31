import {REGIONAL_SPECIES} from './regional-species.mjs?v=25';
// Illustrative organ development: species/season biases, not calibrated
// phenology. Adult size limits describe expanded leaves, not emerging organs.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const hash=x=>{const v=Math.sin(x*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const normal=(a,b)=>clamp(Math.sqrt(-2*Math.log(Math.max(1e-9,a)))*Math.cos(2*Math.PI*b),-2.5,2.5);
export const FOLIAGE_REFERENCES=[
 ['Birch long-shoot leaf development','https://pmc.ncbi.nlm.nih.gov/articles/PMC4242242/'],
 ['Scots pine needle elongation','https://pubmed.ncbi.nlm.nih.gov/28008084/'],
 ['Oak rhythmic shoot growth','https://academic.oup.com/treephys/article-abstract/26/2/229/1676814']
 ,['Leaf maturation and compound-leaf development','https://pmc.ncbi.nlm.nih.gov/articles/PMC2879760/']
 ,['Current-year shoots and species-specific leaf arrangement','https://pmc.ncbi.nlm.nih.gov/articles/PMC4257506/']
];
export function shootGrowth(cfg,key=0,context={}){
 const type=REGIONAL_SPECIES[cfg.type]?.template??cfg.type;
 const seed=cfg.seed*.19+key*1.37,summerChance={maple:.20,sakura:.25,ginkgo:.18,dawnredwood:.30,chinesepine:0,sweetgum:.25,redbud:.25,willow:.72,birch:.48,oak:.20,pine:0,sweetthorn:.35,marula:.20,wildolive:.25,yellowwood:.15,baobab:.18,fevertree:.35,sausagetree:.28,karee:.35,jacaranda:.25,monkeytail:.20,eucalyptus:.35}[type]??.25;
 // Position on the parent axis is a proxy for initiation time; crown height
 // affects exposure/vigour, never substitutes for chronological organ age.
 const relativeAge=clamp(context.relativeAge??1-(context.attachment??.5),0,1),exposure=clamp(context.crownHeight??.5,0,1);
 const vigor=(.77+.46*hash(seed+3))*(.80+.12*exposure+.20*relativeAge);
 return{seed,vigor,phase:hash(seed+8)*6.283,relativeAge,exposure,
  lengthScale:clamp((.62+.45*relativeAge)*(.90+.20*hash(seed+11)),.55,1.18),
  yaw:normal(hash(seed+23),hash(seed+24))*.10,pitch:normal(hash(seed+29),hash(seed+30))*.055,
  active:cfg.view==='shoot'&&cfg.shootStage==='extending'&&['spring','summer'].includes(cfg.season)?true:cfg.view==='shoot'&&cfg.shootStage==='set'?false:cfg.season==='spring'||(cfg.season==='summer'&&hash(seed+17)<summerChance)};
}
export function leafDevelopment(cfg,species,shoot,node,index=0){
 node=clamp(node,0,1);
 // Correlated potential sizes: basal/median/distal positions and a common
 // shoot vigour. Fully expanded tips are not universally miniaturized.
 const type=REGIONAL_SPECIES[cfg.type]?.template??cfg.type;
 const profile=type==='birch'?.87+.22*node:type==='oak'?.83+.24*Math.sin(Math.PI*node):type==='willow'?.90+.14*Math.sin(Math.PI*node):.84+.20*Math.sin(Math.PI*node);
 const variation=1+.065*Math.sin(shoot.phase+node*4)+.12*(hash(shoot.seed+index*.73)-.5);
 const matureLength=clamp(cfg.leafSize*shoot.vigor*profile*variation,...species.leaf);
 const start=(type==='pine'||type==='chinesepine')?.56:cfg.view==='shoot'?.40:cfg.season==='spring'?.62:.72,minimum=(type==='willow'?.28:type==='birch'?.35:.32)+((shoot.relativeAge??.5)-.5)*.06;
 const tipExpansion=shoot.active?1-(1-minimum)*smooth(start,1,node):1,seasonExpansion=species.earlyBloom&&cfg.season==='spring'?springPhenology(cfg).expansion:1,expansion=tipExpansion*seasonExpansion;
 const local=i=>hash(shoot.seed+index*19.71+i*3.17),relativeAge=(1-node)*.75+(shoot.relativeAge??.5)*.25;
 return{length:matureLength*expansion,matureLength,expansion,node,relativeAge,shootAge:shoot.relativeAge,active:shoot.active,
  yaw:shoot.yaw+normal(local(1),local(5))*.055,pitch:shoot.pitch+normal(local(2),local(6))*.07-relativeAge*.14,
  roll:normal(local(3),local(7))*(.08+.16*expansion)+(1-expansion)*.18,
  widthScale:.88+.24*local(4),petioleScale:(.70+.30*relativeAge)*(.65+.35*expansion),
  fold:shoot.active?(1-expansion)*.48:0,cohort:(type==='pine'||type==='chinesepine')?(node>.56?'current':'retained'):(shoot.active?'growing':'set')};
}

// Node positions in an extending flush: the youngest internodes have not yet
// elongated. This describes nodes on a shoot, not leaflet initiation polarity.
export function shootNodePosition(node,active){return active?1-Math.pow(1-clamp(node,0,1),1.45):clamp(node,0,1);}

export function springPhenology(cfg){const progress=clamp(cfg.springProgress??.78,0,1);return{progress,leafPresence:smooth(.28,.70,progress),expansion:smooth(.22,.94,progress),bloom:1-smooth(.62,1,progress)};}
