// GARUDA Studio • modèle de projet et géométrie, sans dépendance.
export const STUDIO_SCHEMA='garuda-studio/1';
export const TYPES=Object.freeze({unit:{label:'Appartement / unité',color:'#a8c7b2',height:3,sellable:true},villa:{label:'Terrain pour villa',color:'#d6c5aa',height:.15,sellable:true},garden:{label:'Jardin',color:'#baca99',height:.12},pool:{label:'Piscine',color:'#97cbd0',height:.15},road:{label:'Route / accès',color:'#bcc0b9',height:.06},terrace:{label:'Terrasse',color:'#e1ceb3',height:.12},common:{label:'Espace commun',color:'#c6bdd4',height:3},free:{label:'Espace libre',color:'#deddd0',height:.1}});
export function appearanceDefaults(){return {palette:Object.fromEntries(Object.entries(TYPES).map(([key,t])=>[key,t.color])),transparency:55,northAngle:0,compass:true,tropical:true,sea:true,seaSide:'north',seaDistance:6,seaColor:'#79bfc0',sandColor:'#e4d5ae',terrainColor:'#cbd6b6',vegetationColor:'#739e83'};}
export function normalizeAppearance(raw){const a=appearanceDefaults();if(raw===undefined)return a;if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Réglages d’ambiance invalides.');const hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
 for(const key of ['seaColor','sandColor','terrainColor','vegetationColor'])if(raw[key]!==undefined){if(!hex(raw[key]))throw new Error('Couleur invalide : format #RRGGBB requis.');a[key]=raw[key];}
 if(raw.palette!==undefined){if(!raw.palette||typeof raw.palette!=='object'||Array.isArray(raw.palette))throw new Error('Palette invalide.');for(const key of Object.keys(a.palette))if(raw.palette[key]!==undefined){if(!hex(raw.palette[key]))throw new Error('Couleur de bloc invalide.');a.palette[key]=raw.palette[key];}}
 for(const [key,min,max]of [['transparency',15,85],['northAngle',0,359],['seaDistance',0,50]])if(raw[key]!==undefined){if(!Number.isFinite(raw[key])||raw[key]<min||raw[key]>max)throw new Error('Réglage hors limites : '+key);a[key]=raw[key];}
 for(const key of ['compass','tropical','sea'])if(raw[key]!==undefined){if(typeof raw[key]!=='boolean')throw new Error('Option d’ambiance invalide.');a[key]=raw[key];}
 if(raw.seaSide!==undefined){if(!['north','east','south','west'].includes(raw.seaSide))throw new Error('Côté de mer inconnu.');a.seaSide=raw.seaSide;}return a;
}
export const round=n=>Math.round(n*100)/100;
export const copy=value=>JSON.parse(JSON.stringify(value));
export const uid=()=>crypto.randomUUID();
export const area=points=>Math.abs(signedArea(points));
export function signedArea(points){return points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p.x*q.y-q.x*p.y;},0)/2;}
export function bounds(points){if(!points.length)return {minX:0,minY:0,maxX:100,maxY:80,width:100,height:80};const xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);return {minX,minY,maxX,maxY,width:maxX-minX,height:maxY-minY};}
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
export function onSegment(p,a,b){return Math.abs(cross(a,b,p))<1e-7&&p.x>=Math.min(a.x,b.x)-1e-7&&p.x<=Math.max(a.x,b.x)+1e-7&&p.y>=Math.min(a.y,b.y)-1e-7&&p.y<=Math.max(a.y,b.y)+1e-7;}
function intersects(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);return (x*y<0&&z*w<0)||onSegment(a,c,d)||onSegment(b,c,d)||onSegment(c,a,b)||onSegment(d,a,b);}
export function inside(p,polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if(onSegment(p,a,b))return true;if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
export function polygonError(points){
 if(!Array.isArray(points)||points.length<3||points.length>80)return 'Dessinez entre 3 et 80 sommets.';
 if(points.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.abs(p.x)>10000||Math.abs(p.y)>10000))return 'Coordonnées invalides (limite : ±10 000 m).';
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(Math.hypot(a.x-b.x,a.y-b.y)<.01)return 'Deux sommets sont trop proches.';for(let j=i+1;j<points.length;j++){if(j===i+1||(i===0&&j===points.length-1))continue;if(intersects(a,b,points[j],points[(j+1)%points.length]))return 'Le contour se croise. Déplacez ou retirez un sommet.';}}
 if(area(points)<.25)return 'La surface doit être supérieure à 0,25 m².';return null;
}
export function contained(points,terrain){
 if(points.some(p=>!inside(p,terrain)))return false;
 // Split each edge at every terrain intersection and check each open interval.
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dy=b.y-a.y,ts=[0,1];
  for(let j=0;j<terrain.length;j++){
   const c=terrain[j],d=terrain[(j+1)%terrain.length],ex=d.x-c.x,ey=d.y-c.y,den=dx*ey-dy*ex;
   if(Math.abs(den)>1e-9){const t=((c.x-a.x)*ey-(c.y-a.y)*ex)/den,u=((c.x-a.x)*dy-(c.y-a.y)*dx)/den;if(t>0&&t<1&&u>=0&&u<=1)ts.push(t);}
   else for(const p of [c,d])if(onSegment(p,a,b))ts.push(Math.abs(dx)>Math.abs(dy)?(p.x-a.x)/dx:(p.y-a.y)/dy);
  }
  ts.sort((a,b)=>a-b);for(let j=1;j<ts.length;j++){const t=(ts[j-1]+ts[j])/2;if(!inside({x:a.x+dx*t,y:a.y+dy*t},terrain))return false;}
 }return true;
}
export const aliasValue=s=>String(s||'').trim().toUpperCase().normalize('NFKC').replace(/[^\p{L}\p{N}_-]/gu,'').replace(/^[_-]+/,'').slice(0,16)||'A';
export function newProject(){return {schema:STUDIO_SCHEMA,id:uid(),name:'Mon nouveau projet',alias:'A',appearance:appearanceDefaults(),terrain:[],levels:[{id:uid(),name:'RDC',height:3.3}],spaces:[]};}
export function floorBase(project,levelId){let y=0;for(const f of project.levels){if(f.id===levelId)return y;y+=f.height;}return 0;}
export function autoNumber(project,s){const idx=project.levels.findIndex(l=>l.id===s.levelId);return s.levelId==='site'?`${s.alias}-${String(s.seq).padStart(3,'0')}`:`${s.alias}-${idx+1}${String(s.seq).padStart(2,'0')}`;}
export function labelOf(project,s){return s.customName|| (s.sellable?autoNumber(project,s):`${TYPES[s.kind].label} ${s.seq}`);}
export function nextSequence(project,alias,levelId,excludeId){const ns=project.spaces.filter(s=>s.id!==excludeId&&s.alias===alias&&s.levelId===levelId).map(s=>s.seq);return Math.max(0,...ns)+1;}
export function makeSpace(project,{kind='unit',levelId,alias=project.alias,points}){
 if(!Object.hasOwn(TYPES,kind))throw new Error('Type inconnu.');
 const error=polygonError(points);if(error)throw new Error(error);if(!project.terrain.length||!contained(points,project.terrain))throw new Error('Cet espace doit rester dans le terrain.');
 const a=aliasValue(alias),id=uid();return {id,unit_id:TYPES[kind].sellable?uid():null,kind,levelId,alias:a,seq:nextSequence(project,a,levelId),customName:'',sellable:!!TYPES[kind].sellable,height:TYPES[kind].height,color:null,points:copy(points),notes:''};
}
export function duplicateLevel(project,sourceId){
 const source=project.levels.find(l=>l.id===sourceId);if(!source)throw new Error('Choisissez un étage à dupliquer.');if(project.levels.length>=30)throw new Error('Limite : 30 niveaux.');
 const level={id:uid(),name:`R+${project.levels.length}`,height:source.height};project.levels.push(level);
 const clones=project.spaces.filter(s=>s.levelId===sourceId).map(s=>({...copy(s),id:uid(),unit_id:s.unit_id?uid():null,levelId:level.id,customName:''}));
 project.spaces.push(...clones);return level.id;
}
export function validateProject(raw){
 if(!raw||raw.schema!==STUDIO_SCHEMA||!Array.isArray(raw.levels)||!Array.isArray(raw.spaces)||!Array.isArray(raw.terrain))throw new Error('Fichier projet GARUDA Studio v1 requis.');
 if(raw.levels.length<1||raw.levels.length>30||raw.spaces.length>2000)throw new Error('Limite : 30 niveaux et 2 000 espaces.');
 const idcheck=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const id=v=>{if(typeof v!=='string'||!idcheck.test(v))throw new Error('Identifiant de projet invalide.');return v;};
 const text=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 const polygon=p=>{if(!Array.isArray(p))throw new Error('Contour absent.');const out=p.map(v=>({x:v?.x,y:v?.y})),e=polygonError(out);if(e)throw new Error(e);return out;};
 const doc={schema:STUDIO_SCHEMA,id:id(raw.id),name:text(raw.name,120)||'Projet sans nom',alias:aliasValue(raw.alias),appearance:normalizeAppearance(raw.appearance),terrain:raw.terrain.length?polygon(raw.terrain):[],levels:[],spaces:[]};
 const ids=new Set(),unitIds=new Set();
 for(const f of raw.levels){if(!f||!Number.isFinite(f.height)||f.height<.5||f.height>12)throw new Error('Hauteur d’étage invalide (0,5–12 m).');const key=id(f.id);if(ids.has(key))throw new Error('Identifiant dupliqué.');ids.add(key);doc.levels.push({id:key,name:text(f.name,50)||'Étage',height:f.height});}
 const names=new Set();
 for(const s of raw.spaces){
  if(!s||!Object.hasOwn(TYPES,s.kind)||!(s.levelId==='site'||doc.levels.some(f=>f.id===s.levelId)))throw new Error('Type ou niveau inconnu.');
  const key=id(s.id);if(ids.has(key))throw new Error('Identifiant dupliqué.');ids.add(key);
  if(!Number.isFinite(s.height)||s.height<.02||s.height>30||!Number.isInteger(s.seq)||s.seq<1||s.seq>99999)throw new Error('Hauteur ou numéro invalide.');
  if(typeof s.sellable!=='boolean'||(s.sellable&&!['unit','villa','free'].includes(s.kind)))throw new Error('Seuls une unité, un terrain villa ou un espace libre peuvent être vendables.');
  const unitId=s.unit_id===null?null:id(s.unit_id);if(s.sellable&&!unitId)throw new Error('Unité sans identifiant.');if(unitId){if(unitIds.has(unitId))throw new Error('Identifiant d’unité dupliqué.');unitIds.add(unitId);}
  if(s.color!==undefined&&s.color!==null&&(typeof s.color!=='string'||!/^#[0-9a-f]{6}$/i.test(s.color)))throw new Error('Couleur personnalisée invalide.');
  const item={id:key,unit_id:unitId,kind:s.kind,levelId:s.levelId,alias:aliasValue(s.alias),seq:s.seq,customName:text(s.customName,60),sellable:s.sellable,height:s.height,color:s.color||null,points:polygon(s.points),notes:text(s.notes,500)};
  if(!doc.terrain.length||!contained(item.points,doc.terrain))throw new Error('Un espace dépasse du terrain.');
  if(item.sellable){const number=labelOf(doc,item);if(/^[=+@\-\t\r]/.test(number))throw new Error('Commencez le libellé par une lettre ou un chiffre.');if(names.has(number))throw new Error(`Libellé d’unité dupliqué : ${number}`);names.add(number);}doc.spaces.push(item);
 }
 return doc;
}
export function getUnits(project){return project.spaces.filter(s=>s.sellable).map(s=>({unit_id:s.unit_id,number:labelOf(project,s),alias:s.alias,level_id:s.levelId,floor:s.levelId==='site'?null:project.levels.findIndex(f=>f.id===s.levelId),level:s.levelId==='site'?'Terrain':project.levels.find(f=>f.id===s.levelId).name,type:s.kind,area_m2:round(area(s.points)),height_m:s.height,space_id:s.id}));}
export function exportCsv(project){
 const columns=['schema_version','unit_id','number','alias','floor','level','type','area_m2','height_m','price','currency'];
 const cell=v=>{if(v===null||v===undefined)return '';let t=String(v);if(/^[=+@\-\t\r]/.test(t))t="'"+t;return /[",\r\n]/.test(t)?'"'+t.replaceAll('"','""')+'"':t;};
 return '\uFEFF'+[columns,...getUnits(project).map(u=>['garuda-plan/0.2',u.unit_id,u.number,u.alias,u.floor,u.level,u.type,u.area_m2,u.height_m,null,null])].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
export function sampleProject(){
 const p=newProject();p.name='Résidence U · exemple';p.terrain=[{x:0,y:0},{x:80,y:0},{x:80,y:80},{x:0,y:80}];
 const rect=(x,y,w,h)=>[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];
 for(const [kind,x,y,w,h]of [['garden',22,25,36,39],['pool',33,32,14,24],['road',5,72,70,5]])p.spaces.push(makeSpace(p,{kind,levelId:'site',alias:'SITE',points:rect(x,y,w,h)}));
 for(let i=0;i<10;i++){for(const [a,x,y,w,h]of [['A',10+i*6,10,5.7,9],['B',10,20+i*5,9,4.7],['C',61,20+i*5,9,4.7]])p.spaces.push(makeSpace(p,{kind:'unit',levelId:p.levels[0].id,alias:a,points:rect(x,y,w,h)}));}
 for(let i=0;i<4;i++)duplicateLevel(p,p.levels[0].id);return validateProject(p);
}

