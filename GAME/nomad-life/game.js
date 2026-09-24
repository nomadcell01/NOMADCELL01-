(()=>{'use strict';
/* NOMAD Life — moteur 3D autonome sans CDN/WebGL externe.
   Projection 3D logicielle : le jeu démarre même hors-ligne. */
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
const load=document.getElementById('loading'),game=document.getElementById('game');
if(!ctx){load.textContent='NOMAD — ce navigateur ne prend pas en charge Canvas.';return}
const DPR=Math.min(devicePixelRatio||1,2);let W=innerWidth,H=innerHeight;
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0)}resize();addEventListener('resize',resize);
game.style.display='block';load.style.display='none';

const C={sky:'#9fc7d9',grass:'#76a86d',road:'#555b5b',sidewalk:'#b9b5a8',house:['#b9c8bd','#d7c4ae','#c6d2d8','#d2b9a9'],roof:'#7b4e45',glass:'#75a9b5',wood:'#8d6345',skin:'#e1b08e',shirt:'#4b7890',dark:'#263239',wall:'#d9d4c8',floor:'#b9b0a0'};
const cam={x:0,z:-12,y:9,zoom:46},player={x:0,z:-7,rot:0};
let money=500,clock=8,t=0,buildMode=false,tool='wall',selected=null,ghost=null;
const keys={},objects=[];
addEventListener('keydown',e=>keys[e.key]=true);addEventListener('keyup',e=>keys[e.key]=false);
document.querySelectorAll('#touch button').forEach(b=>{const k=b.dataset.key;b.onpointerdown=()=>keys[k]=1;b.onpointerup=b.onpointercancel=b.onpointerleave=()=>keys[k]=0});

function iso(x,y,z){const dx=x-cam.x,dz=z-cam.z;return {x:W/2+(dx-dz)*cam.zoom*.5,y:H*.50-(dx+dz)*cam.zoom*.24-y*cam.zoom*.55}}
function poly(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function box(x,z,w,h,d,fill,rot=0,alpha=1){
 const c=Math.cos(rot),s=Math.sin(rot),pts=[];
 [[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].forEach(q=>{let X=q[0]*c-q[2]*s+x,Z=q[0]*s+q[2]*c+z;pts.push(iso(X,q[1],Z))});
 poly([pts[0],pts[1],pts[5],pts[4]],shade(fill,.9),null);
 poly([pts[1],pts[2],pts[6],pts[5]],shade(fill,.72),null);
 poly([pts[2],pts[3],pts[7],pts[6]],shade(fill,.82),null);
 poly([pts[3],pts[0],pts[4],pts[7]],shade(fill,1),null);
 poly([pts[4],pts[5],pts[6],pts[7]],fill,null);
 return pts
}
function shade(hex,k){let n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,((n>>16)&255)*k)),g=Math.max(0,Math.min(255,((n>>8)&255)*k)),b=Math.max(0,Math.min(255,(n&255)*k));return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
function ground(){ctx.fillStyle=C.sky;ctx.fillRect(0,0,W,H);const a=iso(-90,0,-90),b=iso(90,0,-90),c=iso(90,0,90),d=iso(-90,0,90);poly([a,b,c,d],C.grass);for(let z=-65;z<=65;z+=12)box(0,z,9,.04,1.4,C.road);box(0,-18,150,.04,8,C.road);box(-6,0,2,.05,150,C.sidewalk);box(6,0,2,.05,150,C.sidewalk);box(0,0,150,.05,2,C.sidewalk)}
function house(x,z,m){box(x,z,10,5.5,8,m);box(x,z-0.02,11.5,.25,9.2,C.roof,Math.PI/4)}
function tree(x,z){box(x,z,.45,2.3,.45,'#6b4b36');box(x,z,2.8,2.4,2.8,'#4d8a57')}
function person(x,z,col=C.shirt){box(x,z,.8,1.9,.7,col);box(x,z,.65,.65,.65,C.skin);box(x,z,.9,.22,.75,'#374553')}
function humanoid(x,z){box(x,z,.75,1.95,.7,'#d8ddd8');box(x,z,.68,.7,.68,'#d8ddd8');box(x,z,.8,.22,.75,C.dark)}
function world(){ground();house(-19,-20,C.house[0]);house(19,-20,C.house[1]);house(-19,10,C.house[2]);house(19,10,C.house[3]);box(0,23,12,5,8,'#d7d2c5');box(0,23,13,.25,9.2,C.roof,Math.PI/4);for(let z=-55;z<=55;z+=10){tree(-12,z+(z%20?2:-2));tree(12,z+(z%20?-2:2))}person(-3,-14,'#9a6657');person(4,-24,'#6d8a62');person(-4,5,'#806b9a');person(3,16,'#a77a4f');humanoid(1.35,-7.4)}
function drawBuild(o,alpha=1){box(o.x,o.z,o.w,o.h,o.d,o.color,o.rot,alpha)}
function dimsFor(k){return k==='wall'?[4,2.6,.2]:k==='window'?[2,1.5,.16]:k==='door'?[1,2.2,.18]:k==='floor'?[4,.12,4]:[4,.18,4]}
function colorFor(k){return {wall:C.wall,window:C.glass,door:C.wood,floor:C.floor,roof:C.roof}[k]}
function pointerGround(e){const r=canvas.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;const scale=cam.zoom*.5;const q=(H*.50-sy)/(cam.zoom*.24);const p=(sx-W/2)/scale;return {x:cam.x+(p+q)/2,z:cam.z+(q-p)/2}}
canvas.addEventListener('pointermove',e=>{if(!buildMode)return;ghost=pointerGround(e);});
canvas.addEventListener('pointerdown',e=>{if(!buildMode)return;const p=pointerGround(e);
 if(selected&&Math.hypot(selected.x-p.x,selected.z-p.z)<Math.max(selected.w,selected.d)){return}
 const d=dimsFor(tool);selected={tool,x:Math.round(p.x*2)/2,z:Math.round(p.z*2)/2,w:d[0],h:d[1],d:d[2],rot:0,color:colorFor(tool)};objects.push(selected);syncControls();setGhost();prompt.textContent='Élément NOMAD ajouté — construction gratuite.'});
function syncControls(){if(!selected)return;dimW.value=selected.w;dimH.value=selected.h;dimD.value=selected.d;dimR.value=Math.round(selected.rot*180/Math.PI);updateOutputs()}
function updateOutputs(){dimWOut.textContent=Number(dimW.value).toFixed(2)+' m';dimHOut.textContent=Number(dimH.value).toFixed(2)+' m';dimDOut.textContent=Number(dimD.value).toFixed(2)+' m';dimROut.textContent=Math.round(Number(dimR.value))+'°'}
function setGhost(){ghost=ghost||null}
function openBuild(){buildMode=true;buildPanel.classList.add('open');prompt.textContent='Mode Construction : choisis un élément puis touche le terrain.'}
function closeBuildMode(){buildMode=false;buildPanel.classList.remove('open');ghost=null;selected=null;prompt.textContent='Mode Vie : ton habitat reste exactement comme tu l’as construit.'}
buy.onclick=openBuild;closeBuild.onclick=closeBuildMode;
document.querySelectorAll('.buildTool').forEach(b=>b.onclick=()=>{document.querySelectorAll('.buildTool').forEach(x=>x.classList.remove('active'));b.classList.add('active');tool=b.dataset.tool;selected=null;updateOutputs()});
[dimW,dimH,dimD,dimR].forEach(el=>el.addEventListener('input',()=>{updateOutputs();if(selected){selected.w=+dimW.value;selected.h=+dimH.value;selected.d=+dimD.value;selected.rot=+dimR.value*Math.PI/180}}));
deleteBuild.onclick=()=>{if(selected){let i=objects.indexOf(selected);if(i>=0)objects.splice(i,1);selected=null;prompt.textContent='Élément retiré. La structure de base reste gratuite.'}};
duplicateBuild.onclick=()=>{if(selected){const c={...selected,x:selected.x+1};objects.push(c);selected=c;syncControls();prompt.textContent='Élément dupliqué.'}};
work.onclick=()=>{money+=50;moneyEl.textContent='N$ '+money;clock=Math.min(23,clock+2);clockEl.textContent=String(clock).padStart(2,'0')+':00';prompt.textContent='Journée de travail terminée. + N$50.'};
home.onclick=()=>{player.x=0;player.z=-7;prompt.textContent='Chez toi. Ton espace est prêt à être personnalisé.'};

function loop(){requestAnimationFrame(loop);t+=.016;
 let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),dz=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);if(dx||dz){let l=Math.hypot(dx,dz);dx/=l;dz/=l;player.x+=dx*.16;player.z+=dz*.16;player.rot=Math.atan2(dx,dz);clock+=.002;clockEl.textContent=String(Math.floor(clock)%24).padStart(2,'0')+':'+String(Math.floor(clock*60)%60).padStart(2,'0')}
 cam.x+=(player.x-cam.x)*.08;cam.z+=(player.z-cam.z)*.08;
 world();
 objects.slice().sort((a,b)=>(a.x+a.z)-(b.x+b.z)).forEach(o=>drawBuild(o));
 if(buildMode&&ghost){const d=dimsFor(tool);drawBuild({x:ghost.x,z:ghost.z,w:d[0],h:d[1],d:d[2],rot:0,color:colorFor(tool)});}
 box(player.x,player.z,.9,1.9,.8,C.shirt,player.rot);box(player.x,player.z,.7,.65,.7,C.skin);
 ctx.save();ctx.globalAlpha=.95;ctx.font='bold 12px system-ui';ctx.fillStyle='#fff';ctx.textAlign='center';const p=iso(player.x,2.7,player.z);ctx.fillText('TOI',p.x,p.y);ctx.restore();
 requestAnimationFrame(()=>{});}
updateOutputs();loop();
})();