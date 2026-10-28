// Illustrative organ development: species/season biases, not calibrated
// phenology. Adult size limits describe expanded leaves, not emerging organs.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const hash=x=>{const v=Math.sin(x*127.1+311.7)*43758.5453;return v-Math.floor(v)};
export const FOLIAGE_REFERENCES=[
 ['Birch long-shoot leaf development','https://pmc.ncbi.nlm.nih.gov/articles/PMC4242242/'],
 ['Scots pine needle elongation','https://pubmed.ncbi.nlm.nih.gov/28008084/'],
 ['Oak rhythmic shoot growth','https://academic.oup.com/treephys/article-abstract/26/2/229/1676814']
 ,['Leaf maturation and compound-leaf development','https://pmc.ncbi.nlm.nih.gov/articles/PMC2879760/']
 ,['Current-year shoots and species-specific leaf arrangement','https://pmc.ncbi.nlm.nih.gov/articles/PMC4257506/']
];
export function shootGrowth(cfg,key=0){
 const seed=cfg.seed*.19+key*1.37,summerChance={maple:.20,sakura:.25,ginkgo:.18,dawnredwood:.30,chinesepine:0,sweetgum:.25,redbud:.25,willow:.72,birch:.48,oak:.20,pine:0,sweetthorn:.35,marula:.20,wildolive:.25,yellowwood:.15,baobab:.18,fevertree:.35,sausagetree:.28,karee:.35,jacaranda:.25,monkeytail:.20,eucalyptus:.35}[cfg.type];
 return{seed,vigor:.84+.30*hash(seed+3),phase:hash(seed+8)*6.283,
  active:cfg.view==='shoot'&&cfg.shootStage==='extending'&&['spring','summer'].includes(cfg.season)?true:cfg.view==='shoot'&&cfg.shootStage==='set'?false:cfg.season==='spring'||(cfg.season==='summer'&&hash(seed+17)<summerChance)};
}
export function leafDevelopment(cfg,species,shoot,node,index=0){
 node=clamp(node,0,1);
 // Correlated potential sizes: basal/median/distal positions and a common
 // shoot vigour. Fully expanded tips are not universally miniaturized.
 const profile=cfg.type==='birch'?.92+.15*node:cfg.type==='oak'?.89+.16*Math.sin(Math.PI*node):cfg.type==='willow'?.96+.08*Math.sin(Math.PI*node):1;
 const variation=1+.045*Math.sin(shoot.phase+node*4)+.06*(hash(shoot.seed+index*.73)-.5);
 const matureLength=clamp(cfg.leafSize*shoot.vigor*profile*variation,...species.leaf);
 const start=(cfg.type==='pine'||cfg.type==='chinesepine')?.56:cfg.view==='shoot'?.40:cfg.season==='spring'?.62:.72,minimum=cfg.type==='willow'?.28:cfg.type==='birch'?.35:.32;
 const tipExpansion=shoot.active?1-(1-minimum)*smooth(start,1,node):1,seasonExpansion=species.earlyBloom&&cfg.season==='spring'?springPhenology(cfg).expansion:1,expansion=tipExpansion*seasonExpansion;
 return{length:matureLength*expansion,matureLength,expansion,node,active:shoot.active,fold:shoot.active?(1-expansion)*.48:0,cohort:(cfg.type==='pine'||cfg.type==='chinesepine')?(node>.56?'current':'retained'):(shoot.active?'growing':'set')};
}

// Node positions in an extending flush: the youngest internodes have not yet
// elongated. This describes nodes on a shoot, not leaflet initiation polarity.
export function shootNodePosition(node,active){return active?1-Math.pow(1-clamp(node,0,1),1.45):clamp(node,0,1);}

export function springPhenology(cfg){const progress=clamp(cfg.springProgress??.78,0,1);return{progress,leafPresence:smooth(.28,.70,progress),expansion:smooth(.22,.94,progress),bloom:1-smooth(.62,1,progress)};}
