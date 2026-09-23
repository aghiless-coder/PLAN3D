// Self-contained runtime: exported plans embed this function verbatim.
export function renderPlan(container,initialScene,{data=[],onSelect=()=>{},editMode=false,colorMode='status'}={}){
 const doc=container.ownerDocument,canvas=doc.createElement('canvas');canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none';canvas.tabIndex=0;canvas.setAttribute('aria-label','Aperçu 3D : glisser pour tourner, plus et moins pour zoomer.');container.append(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();throw new Error('Canvas indisponible');}
 const colors={unit:'#a8c7b2',villa:'#d6c5aa',garden:'#baca99',pool:'#97cbd0',road:'#bcc0b9',terrace:'#e1ceb3',common:'#c6bdd4',free:'#deddd0'};
 const statuses={available:'#a8c7b2',option:'#e7d795',reserved:'#dfb28c',sold:'#c6bdd4',paid:'#d99587',unavailable:'#b7bbb7',unknown:'#d3d5d1'};
 let scene=initialScene,records=new Map(),dead=false,frame=0,w=1,h=1,faces=[],hits=[],drag=null,project;
 const state={yaw:-.55,tilt:.65,zoom:1,exploded:false,level:'all',selected:null};
 const listeners=[],clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const bind=(n,f,opt)=>{canvas.addEventListener(n,f,opt);listeners.push(()=>canvas.removeEventListener(n,f,opt));};
 function shade(hex,k){return '#'+hex.match(/\w\w/g).map(x=>Math.round(clamp(parseInt(x,16)*k,0,255)).toString(16).padStart(2,'0')).join('');}
 function appearance(){return {palette:colors,transparency:55,northAngle:0,compass:true,tropical:true,sea:true,seaSide:'north',seaDistance:6,seaColor:'#79bfc0',sandColor:'#e4d5ae',terrainColor:'#cbd6b6',vegetationColor:'#739e83',...scene.appearance};}
 function seaDirection(a){const angle=(a.northAngle+({north:0,east:90,south:180,west:270}[a.seaSide]||0))*Math.PI/180;return {x:Math.sin(angle),z:-Math.cos(angle)};}
 function screenPath(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
 function wash(x,y,r,color,alpha=.2){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.55,color+'77');g.addColorStop(1,color+'00');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
 function shadow(poly,base,height,index,scale){const pts=poly.map(v=>project(v.x,base+.012,v.y));const dx=Math.max(2,Math.min(12,height*scale*.12)),dy=Math.max(2,Math.min(10,height*scale*.07));return {d:-1e9+index,paint:()=>{ctx.save();ctx.filter='blur(4px)';ctx.globalAlpha=height>.5?.13:.08;ctx.fillStyle='#52675b';ctx.beginPath();pts.forEach((p,i)=>{const x=p.x+dx,y=p.y+dy;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fill();ctx.restore();}};}
 function palm(x,z,size,scale,a){
  const base=project(x,0,z),top=project(x+.45,size,z+.15);wash(base.x,base.y,size*scale*.7,a.vegetationColor,.14);
  ctx.globalAlpha=.55;ctx.strokeStyle='#a09573';ctx.lineWidth=Math.max(.7,scale*.22);ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.quadraticCurveTo(base.x-scale,top.y+size*scale*.35,top.x,top.y);ctx.stroke();
  for(let j=0;j<8;j++){const t=j*Math.PI/4+.25,end=project(x+Math.cos(t)*size*.72,size*.76,z+Math.sin(t)*size*.72);const dx=end.x-top.x,dy=end.y-top.y;ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.quadraticCurveTo(top.x+dx*.4-dy*.12,top.y+dy*.4-Math.abs(dx)*.38,end.x,end.y);ctx.quadraticCurveTo(top.x+dx*.5+dy*.12,top.y+dy*.5-Math.abs(dx)*.12,top.x,top.y);ctx.fillStyle=j%2?a.vegetationColor:shade(a.vegetationColor,1.12);ctx.globalAlpha=.34;ctx.fill();ctx.lineWidth=.5;ctx.globalAlpha=.28;ctx.strokeStyle=a.vegetationColor;ctx.stroke();}ctx.globalAlpha=1;
 }
 function paintCompass(a,cx,cz){if(!a.compass)return;const origin=project(cx,0,cz),ox=w-47,oy=54;wash(ox,oy,43,'#fffef4',.8);ctx.font='600 10px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';
  for(const [label,deg]of [['N',0],['E',90],['S',180],['O',270]]){const t=(a.northAngle+deg)*Math.PI/180,p=project(cx+Math.sin(t)*12,0,cz-Math.cos(t)*12),dx=p.x-origin.x,dy=p.y-origin.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;ctx.strokeStyle=label==='N'?'#365e51':'#8b9c8c';ctx.lineWidth=label==='N'?1.6:.75;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+ux*21,oy+uy*21);ctx.stroke();if(label==='N'){ctx.beginPath();ctx.moveTo(ox+ux*22,oy+uy*22);ctx.lineTo(ox+ux*15-uy*3,oy+uy*15+ux*3);ctx.lineTo(ox+ux*15+uy*3,oy+uy*15-ux*3);ctx.closePath();ctx.fillStyle='#365e51';ctx.fill();}ctx.fillStyle=label==='N'?'#365e51':'#697d71';ctx.fillText(label,ox+ux*32,oy+uy*32);}ctx.textBaseline='alphabetic';
 }
 function triangles(points){
  let ids=points.map((_,i)=>i),out=[];const c=(a,b,d)=>(b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x);
  if(points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p.x*q.y-q.x*p.y;},0)<0)ids.reverse();
  let guard=0;while(ids.length>3&&guard++<10000){let cut=false;for(let i=0;i<ids.length;i++){const a=ids[(i+ids.length-1)%ids.length],b=ids[i],d=ids[(i+1)%ids.length];if(c(points[a],points[b],points[d])<=1e-8)continue;
   const blocked=ids.some(j=>j!==a&&j!==b&&j!==d&&c(points[a],points[b],points[j])>=-1e-8&&c(points[b],points[d],points[j])>=-1e-8&&c(points[d],points[a],points[j])>=-1e-8);if(blocked)continue;
   out.push([points[a],points[b],points[d]]);ids.splice(i,1);cut=true;break;
  }if(!cut){const col=ids.findIndex((b,i)=>Math.abs(c(points[ids[(i+ids.length-1)%ids.length]],points[b],points[ids[(i+1)%ids.length]]))<1e-8);if(col>=0)ids.splice(col,1);else break;}}
  if(ids.length===3)out.push(ids.map(i=>points[i]));return out;
 }
 function face(points,fill,id=null,alpha=1,outline=false){const p=points.map(v=>project(...v));faces.push({p,fill,id,alpha,outline,d:p.reduce((sum,v)=>sum+v.d,0)/p.length});}
 function prism(poly,base,height,fill,id,alpha){
  const y=base+height;for(const tri of triangles(poly))face(tri.map(p=>[p.x,y,p.y]),shade(fill,1.04),id,alpha);
  const winding=poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p.x*q.y-q.x*p.y;},0)>0?1:-1;
  for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],nx=(b.y-a.y)*winding,nz=-(b.x-a.x)*winding;if(nx*Math.sin(state.yaw)+nz*Math.cos(state.yaw)>0)face([[a.x,base,a.y],[b.x,base,b.y],[b.x,y,b.y],[a.x,y,a.y]],shade(fill,.87),id,alpha,true);}
  face(poly.map(p=>[p.x,y+.002,p.y]),fill,id,0,true);
 }
 function draw(){frame=0;if(dead)return;const rect=canvas.getBoundingClientRect();w=Math.max(1,rect.width);h=Math.max(1,rect.height);const dpr=Math.min(2,doc.defaultView.devicePixelRatio||1);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);faces=[];hits=[];
  const pts=scene.terrain.length?scene.terrain:[{x:0,y:0},{x:100,y:80}],minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x)),minZ=Math.min(...pts.map(p=>p.y)),maxZ=Math.max(...pts.map(p=>p.y));
  const a=appearance(),cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,bases=new Map([['site',0]]);let top=.2;
  scene.levels.forEach((f,i)=>{bases.set(f.id,top+(state.exploded?i*5:0));top+=f.height;});
  const maxH=top+(state.exploded?scene.levels.length*5:0);
  function rotated(x,y,z){x-=cx;z-=cz;const rx=x*Math.cos(state.yaw)-z*Math.sin(state.yaw),rz=x*Math.sin(state.yaw)+z*Math.cos(state.yaw);return {x:rx,y:rz*Math.sin(state.tilt)-y*Math.cos(state.tilt),d:rz*Math.cos(state.tilt)+y*Math.sin(state.tilt)};}
  const extent=Math.max(maxX-minX,maxZ-minZ,10),margin=(a.tropical||a.sea)?extent*.12:0;
  const corners=[];for(const x of [minX-margin,maxX+margin])for(const z of [minZ-margin,maxZ+margin])for(const y of [0,maxH])corners.push(rotated(x,y,z));
  const loX=Math.min(...corners.map(p=>p.x)),hiX=Math.max(...corners.map(p=>p.x)),loY=Math.min(...corners.map(p=>p.y)),hiY=Math.max(...corners.map(p=>p.y));
  const scale=Math.min((w-35)/Math.max(10,hiX-loX),(h-65)/Math.max(10,hiY-loY))*state.zoom;
  project=(x,y,z)=>{const p=rotated(x,y,z);return {x:w/2+(p.x-(loX+hiX)/2)*scale,y:h/2+15+(p.y-(loY+hiY)/2)*scale,d:p.d};};
  const paper=ctx.createLinearGradient(0,0,0,h);paper.addColorStop(0,'#fbfaf3');paper.addColorStop(.55,'#f3f4e9');paper.addColorStop(1,'#e9eee1');ctx.fillStyle=paper;ctx.fillRect(0,0,w,h);
  wash(w*.18,h*.18,Math.max(w,h)*.45,'#fffef5',.28);wash(w*.86,h*.88,Math.max(w,h)*.5,a.vegetationColor,.08);
  const sea=seaDirection(a),support=Math.max(...pts.map(p=>p.x*sea.x+p.y*sea.z)),shore=support+a.seaDistance;
  if(scene.terrain.length){
   if(a.tropical){wash(w*.46,h*.55,Math.max(w,h)*.56,a.terrainColor,.42);for(let i=0;i<8;i++){const t=i*Math.PI/4,p=project(cx+Math.cos(t)*extent*.55,0,cz+Math.sin(t)*extent*.55);wash(p.x,p.y,extent*scale*.15,a.vegetationColor,.12);}}
   if(a.sea){
    const tangent={x:-sea.z,z:sea.x},mid=cx*sea.x+cz*sea.z,at=(d,t)=>project(cx+sea.x*(d-mid)+tangent.x*t,-.35,cz+sea.z*(d-mid)+tangent.z*t);
    const corners=[at(shore-4,-extent*2),at(shore+extent*2,-extent*2),at(shore+extent*2,extent*2),at(shore-4,extent*2)];ctx.save();screenPath(corners);ctx.clip();
    const land=at(shore-4,0),deep=at(shore+extent*.75,0),g=ctx.createLinearGradient(land.x,land.y,deep.x,deep.y);g.addColorStop(0,a.sandColor+'00');g.addColorStop(.055,a.sandColor+'99');g.addColorStop(.16,a.seaColor+'88');g.addColorStop(.5,a.seaColor+'bb');g.addColorStop(1,a.seaColor+'12');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    for(let j=0;j<7;j++){ctx.beginPath();for(let i=0;i<=36;i++){const t=(i/36-.5)*extent*2.8,p=at(shore+1+j*extent*.05+Math.sin(i*.55+j)*extent*.013,t);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}ctx.strokeStyle='#fffef0';ctx.globalAlpha=.34-j*.035;ctx.lineWidth=j?1:2;ctx.stroke();}ctx.restore();ctx.globalAlpha=1;
   }
   prism(scene.terrain,-.1,.1,a.terrainColor,null,.5);
  }
  const ground=faces,landscape=[];faces=[];
  let shadowIndex=0;for(const s of scene.spaces){if(state.level!=='all'&&s.levelId!=='site'&&s.levelId!==state.level)continue;const rec=records.get(s.unit_id),key=rec?.payment_status==='paid'?'paid':Object.hasOwn(statuses,rec?.commercial_status)?rec.commercial_status:'unknown';const baseColor=s.color||a.palette[s.kind]||colors[s.kind],fill=editMode||colorMode==='design'?baseColor:s.sellable?statuses[key]:baseColor,base=bases.get(s.levelId)||0;faces.push(shadow(s.points,base,s.height,shadowIndex++,scale));const start=faces.length;const alpha=s.height>.5?1-a.transparency/100:.52;prism(s.points,base,s.height,fill,editMode?s.id:s.sellable?s.unit_id:null,alpha);if(s.levelId==='site'&&s.height<=.5)landscape.push({height:s.height,faces:faces.splice(start)});}
  // Flat landscape layers must remain ordered by elevation, even when nested.
  landscape.sort((a,b)=>a.height-b.height);for(const layer of landscape)ground.push(...layer.faces.sort((a,b)=>a.d-b.d));
  if(a.tropical&&scene.terrain.length){
   const winding=scene.terrain.reduce((sum,p,i)=>{const q=scene.terrain[(i+1)%scene.terrain.length];return sum+p.x*q.y-q.x*p.y;},0)>0?1:-1;
   scene.terrain.forEach((p,i)=>{const q=scene.terrain[(i+1)%scene.terrain.length],dx=q.x-p.x,dz=q.y-p.y,len=Math.hypot(dx,dz)||1,count=Math.min(3,Math.max(1,Math.floor(len/(extent*.25))));for(let j=0;j<count;j++){const t=(j+.35)/count,x=p.x+dx*t+dz/len*2.5*winding,z=p.y+dz*t-dx/len*2.5*winding;if(a.sea&&x*sea.x+z*sea.z>shore-1)continue;const size=extent*(.062+(i+j)%3*.009),d=project(x,size*.4,z).d;faces.push({d,paint:()=>palm(x,z,size,scale,a)});}});
  }
  faces.sort((a,b)=>a.d-b.d);
  for(const f of [...ground,...faces]){if(f.paint){f.paint();continue;}screenPath(f.p);if(f.alpha){const xs=f.p.map(p=>p.x),ys=f.p.map(p=>p.y),gradient=ctx.createLinearGradient(Math.min(...xs),Math.min(...ys),Math.max(...xs)+1,Math.max(...ys)+1);gradient.addColorStop(0,shade(f.fill,1.10));gradient.addColorStop(.48,f.fill);gradient.addColorStop(1,shade(f.fill,.97));ctx.globalAlpha=f.alpha;ctx.fillStyle=gradient;ctx.fill();}if(f.outline){ctx.globalAlpha=f.id&&f.id===state.selected?.95:.32;ctx.strokeStyle=f.id&&f.id===state.selected?'#244e43':shade(f.fill,.78);ctx.lineWidth=f.id&&f.id===state.selected?1.8:.65;ctx.stroke();}if(f.id&&f.alpha)hits.push(f);}ctx.globalAlpha=1;
  // A deterministic fine grain gives the washes a paper texture without assets.
  for(let i=0;i<1100;i++){const x=((i*137.51)%w),y=((i*71.37)%h);ctx.globalAlpha=i%3?.026:.045;ctx.fillStyle=i%2?'#6c7e62':'#ffffff';ctx.fillRect(x,y,.8,.8);}ctx.globalAlpha=1;paintCompass(a,cx,cz);
  if(a.sea&&scene.terrain.length){ctx.font='9px Segoe UI';ctx.textAlign='left';ctx.fillStyle='#698b89';ctx.fillText('MER · '+({north:'NORD',east:'EST',south:'SUD',west:'OUEST'}[a.seaSide]),12,20);}
  if(!scene.terrain.length){ctx.fillStyle='#788475';ctx.font='13px Segoe UI';ctx.textAlign='center';ctx.fillText('La 3D apparaîtra après le dessin du terrain.',w/2,h/2);}
 }
 function schedule(){if(!dead&&!frame)frame=doc.defaultView.requestAnimationFrame(draw);}
 function pick(e){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;for(let i=hits.length-1;i>=0;i--){const f=hits[i];let ok=false;for(let j=0,k=f.p.length-1;j<f.p.length;k=j++){const a=f.p[j],b=f.p[k];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)ok=!ok;}if(ok)return f.id;}return null;}
 bind('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 bind('pointermove',e=>{if(drag){if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>4)drag.moved=true;if(drag.moved){state.yaw+=(e.clientX-drag.x)*.009;state.tilt=clamp(state.tilt+(e.clientY-drag.y)*.006,.2,1.4);schedule();}drag.x=e.clientX;drag.y=e.clientY;}});
 bind('pointerup',e=>{if(drag&&!drag.moved){state.selected=pick(e);onSelect(state.selected);schedule();}drag=null;});bind('pointercancel',()=>drag=null);bind('lostpointercapture',()=>drag=null);
 bind('wheel',e=>{e.preventDefault();state.zoom=clamp(state.zoom*Math.exp(-e.deltaY*.001),.5,3);schedule();},{passive:false});
 bind('keydown',e=>{if(['+','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape'].includes(e.key)){e.preventDefault();if(e.key==='+')state.zoom=clamp(state.zoom+.1,.5,3);if(e.key==='-')state.zoom=clamp(state.zoom-.1,.5,3);if(e.key==='ArrowLeft')state.yaw-=.1;if(e.key==='ArrowRight')state.yaw+=.1;if(e.key==='ArrowUp')state.tilt=clamp(state.tilt+.1,.2,1.4);if(e.key==='ArrowDown')state.tilt=clamp(state.tilt-.1,.2,1.4);if(e.key==='Escape'){state.selected=null;onSelect(null);}schedule();}});
 const observer=new ResizeObserver(schedule);observer.observe(container);
 function update(next){if(dead)throw new Error('Visualiseur détruit');if(!Array.isArray(next))throw new Error('Données invalides');const allowed=new Set(scene.spaces.filter(s=>s.sellable).map(s=>s.unit_id)),map=new Map();for(const r of next){if(!r||!allowed.has(r.unit_id)||map.has(r.unit_id))throw new Error('Identifiant inconnu ou dupliqué');map.set(r.unit_id,{...r});}records=map;schedule();}
 try{update(data);}catch(e){observer.disconnect();listeners.forEach(fn=>fn());canvas.remove();throw e;}
 return {update,updateScene(next){scene=next;schedule();},setView(options){for(const k of ['level','selected','exploded'])if(options[k]!==undefined)state[k]=options[k];if(Number.isFinite(options.zoom))state.zoom=clamp(options.zoom,.5,3);schedule();},lookAtSea(){const d=seaDirection(appearance());state.yaw=Math.atan2(-d.x,-d.z);state.tilt=.55;state.zoom=1;schedule();},zoomBy(factor){if(Number.isFinite(factor)&&factor>0)state.zoom=clamp(state.zoom*factor,.5,3);schedule();},reset(){state.yaw=-.55;state.tilt=.65;state.zoom=1;schedule();},destroy(){if(dead)return;dead=true;observer.disconnect();listeners.forEach(fn=>fn());doc.defaultView.cancelAnimationFrame(frame);canvas.remove();records.clear();faces=[];hits=[];}};
}

