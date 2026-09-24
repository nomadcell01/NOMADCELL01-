(()=>{'use strict';
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),load=document.getElementById('loading'),game=document.getElementById('game');
if(!ctx){load.textContent='NOMAD Life — Canvas indisponible.';return}
const DPR=Math.min(devicePixelRatio||1,2);let W=innerWidth,H=innerHeight;
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0)}resize();addEventListener('resize',resize);
const C={sky:'#a9d4df',grass:'#7cab70',road:'#626866',sidewalk:'#d4cfc0',house:['#d5e1d9','#e4ceb8','#d0dce2','#dfc4ba'],roof:'#835b4f',glass:'#79b7c2',wood:'#966b49',skin:'#e3b28e',shirt:'#567f91',dark:'#263239',wall:'#e2ded3',floor:'#c6bbaa'};
const worlds={TERRE:['NOMAD TERRE','☀️ Doux · 21°C'],BEACH:['NOMAD BEACH','☀️ Marin · 25°C'],MER:['NOMAD MER','🌊 Brise · 23°C'],MONTAGNE:['NOMAD MONTAGNE','❄️ Frais · 8°C'],LUNE:['NOMAD LUNE','🌑 Base · -20°C'],MARS:['NOMAD MARS','🔴 Sec · -35°C'],ESPACE:['NOMAD ESPACE','✨ Station · 22°C'],HUB:['NOMAD HUB','🌐 Central · 21°C']};
const cam={x:0,z:0,y:9,zoom:42,rot:0},player={x:0,z:8,tx:0,tz:8,rot:0,name:'Mon Nomade',shirt:'#567f91',hair:'#3b2d28',style:0,body:1,face:1};let money=100000,clock=8,t=0,started=false,working=false,lastPayClock=8,buildMode=false,tool='room',selected=null,ghost=null,roomStart=null,worldKey='TERRE',buildView='2d';const objects=[];const pointers=new Map();let gesture=null;
const MATERIALS={wood:{label:'Bois',base:'#966b49',props:['structure','furniture','floor','door','window']},glass:{label:'Verre',base:'#79b7c2',props:['wall','floor','door','window','roof']},steel:{label:'Acier',base:'#8b969b',props:['structure','wall','door','window','roof','furniture']},plastic:{label:'Plastique',base:'#d9d9df',props:['wall','floor','door','window','furniture']},stone:{label:'Pierre',base:'#9b9389',props:['wall','floor','structure','roof']},earth:{label:'Terre',base:'#9b7655',props:['wall','floor','roof']},vegetation:{label:'Végétal',base:'#6fa56a',props:['wall','roof','floor','furniture']},fabric:{label:'Tissu',base:'#b58c9d',props:['wall','floor','furniture','door']},concrete:{label:'Béton',base:'#b8b8b2',props:['wall','floor','structure','roof']},metal:{label:'Tôle',base:'#a8adb0',props:['wall','roof','door','window']},neon:{label:'Néon',base:'#e7edf2',props:['wall','floor','ceiling','furniture']},wood2:{label:'Bambou',base:'#c6a55a',props:['wall','floor','roof','furniture']}};
const FINISHES={raw:{label:'Brut',filter:1},paint:{label:'Peinture',filter:1.04},wallpaper:{label:'Papier peint',filter:1.08},plaster:{label:'Enduit',filter:.98},varnish:{label:'Vernis',filter:1.12},matte:{label:'Mat',filter:.9},satin:{label:'Satiné',filter:1.03},polished:{label:'Poli',filter:1.16},rough:{label:'Rugueux',filter:.86},translucent:{label:'Translucide',filter:1.08}};
const EFFECTS={none:{label:'Sans effet'},backlit:{label:'Rétroéclairé'},led:{label:'LED'},glow:{label:'Lumineux'},mirror:{label:'Miroir'},frosted:{label:'Dépoli'}};
const COLORS=['#ffffff','#111827','#d94848','#e58b38','#e8c547','#6da95b','#4c9a78','#4b87c5','#6554c0','#a85aa7','#d97b9a','#9b7655','#8d8d8d','#d6d0c5'];
function applySurface(o,material='concrete',finish='raw',effect='none',color=null){o.material=material;o.finish=finish;o.effect=effect;o.surfaceColor=color||MATERIALS[material]?.base||C.wall;o.color=o.surfaceColor;return o}
function materialCompatible(o,material){const m=MATERIALS[material];if(!m)return false;const type=o.tool==='room'?'wall':o.tool;return m.props.includes(type)||m.props.includes('structure')&&type==='wall'}
function surfaceColor(o){let col=o.surfaceColor||o.color||C.wall;if(o.finish&&FINISHES[o.finish])col=shade(col,FINISHES[o.finish].filter);return col}
const $=id=>document.getElementById(id),prompt=$('prompt'),moneyEl=$('money'),clockEl=$('clock'),hint=$('gestureHint');
function iso(x,y,z){const dx=x-cam.x,dz=z-cam.z,c=Math.cos(cam.rot),s=Math.sin(cam.rot),rx=dx*c-dz*s,rz=dx*s+dz*c;return{x:W/2+(rx-rz)*cam.zoom*.5,y:H*.52-(rx+rz)*cam.zoom*.24-y*cam.zoom*.55}}
function poly(a,f){ctx.beginPath();a.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f;ctx.fill()}
function shade(h,k){let n=parseInt(h.slice(1),16),r=Math.max(0,Math.min(255,((n>>16)&255)*k)),g=Math.max(0,Math.min(255,((n>>8)&255)*k)),b=Math.max(0,Math.min(255,(n&255)*k));return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
function box(x,z,w,h,d,fill,rot=0){const c=Math.cos(rot),s=Math.sin(rot),p=[];[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].forEach(q=>{const X=q[0]*c-q[2]*s+x,Z=q[0]*s+q[2]*c+z;p.push(iso(X,q[1],Z))});poly([p[0],p[1],p[5],p[4]],shade(fill,.9));poly([p[1],p[2],p[6],p[5]],shade(fill,.72));poly([p[2],p[3],p[7],p[6]],shade(fill,.82));poly([p[3],p[0],p[4],p[7]],shade(fill,1));poly([p[4],p[5],p[6],p[7]],fill)}
function ground(){const bg={TERRE:['#bfe3ed','#79b56f'],BEACH:['#8fd4e5','#e2cf91'],MER:['#69b9ce','#74aeb0'],MONTAGNE:['#c7d4da','#9ca6a4'],LUNE:['#111925','#60656b'],MARS:['#9b5b4c','#b87957'],ESPACE:['#091225','#252d45'],HUB:['#8bc4d2','#78967e']}[worldKey]||['#bfe3ed','#79b56f'];ctx.fillStyle=bg[0];ctx.fillRect(0,0,W,H);const a=iso(-120,0,-120),b=iso(120,0,-120),c=iso(120,0,120),d=iso(-120,0,120);poly([a,b,c,d],bg[1]);if(worldKey==='MER'){ctx.fillStyle='#7fc4d2';ctx.fillRect(0,H*.52,W,H*.48)}else{box(0,-18,150,.04,8,C.road);box(-6,0,2,.05,150,C.sidewalk);box(6,0,2,.05,150,C.sidewalk);box(0,0,150,.05,2,C.sidewalk);for(let z=-60;z<60;z+=12)box(0,z,7,.04,1.3,C.road)}}
function limb(x,z,h,thick,col,rot=0){box(x,z,thick,h,thick*.8,col,rot)}
function tree(x,z){limb(x,z,2.4,.35,'#70513a');box(x,z,2.9,2.1,2.9,'#4f8e59');box(x,z,2.2,1.6,2.2,'#69a765')}
function house(x,z,m){
  // Maison composée de murs réels : aucune face manquante.
  const w=10,d=8,h=5.5,t=.22;
  // Mur arrière + côtés
  box(x,z+d/2-t/2,w,h,t,m);
  box(x-w/2+t/2,z,t,h,d,m);
  box(x+w/2-t/2,z,t,h,d,m);
  // Façade avant avec ouverture de porte centrale et fenêtres de chaque côté
  const front=z-d/2+t/2, doorW=1.5, doorH=2.6;
  const sideW=(w-doorW)/2;
  box(x-(doorW/2+sideW/2),front,sideW,h,t,m);
  box(x+(doorW/2+sideW/2),front,sideW,h,t,m);
  box(x,front,doorW,(h-doorH),t,m);
  // Porte fixée au mur, dans son ouverture
  box(x,front-t/2-.02,doorW-.08,doorH-.06,.10,C.wood);
  // Fenêtres fixées à la façade
  box(x-3.1,front-t/2-.03,1.45,1.65,.10,C.glass);
  box(x+3.1,front-t/2-.03,1.45,1.65,.10,C.glass);
  // Petite fenêtre sur le mur arrière
  box(x,z+d/2-t-.03,2.2,1.5,.10,C.glass);
  // Toit : deux pans solidement posés au sommet des murs
  const roofY=h+.08, rw=w/2+.65, rd=d/2+.65;
  const a=iso(x-rw,roofY,z-rd), b=iso(x+rw,roofY,z-rd), c=iso(x+rw,roofY,z+rd), dd=iso(x-rw,roofY,z+rd);
  const ridgeY=roofY+.95;
  const e=iso(x,ridgeY,z-rd+.12), f=iso(x,ridgeY,z+rd-.12);
  poly([a,b,e],C.roof); poly([dd,c,f],shade(C.roof,.82));
  poly([b,c,f,e],shade(C.roof,.72)); poly([dd,a,e,f],shade(C.roof,.92));
}
function ellipse(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
function roundRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
function person(x,z,col=C.shirt){
  const scale=player.body===0?.88:player.body===2?1.12:1;
  const head=player.face===0?.95:player.face===2?1.08:1;
  const moving=Math.hypot(player.tx-player.x,player.tz-player.z)>.08;
  const walk=moving?Math.sin(t*10)*.22:Math.sin(t*2)*.025;
  const p=iso(x,0,z),unit=cam.zoom*.30*scale,cx=p.x,base=p.y-unit*.05;
  ellipse(cx,base+3,unit*1.25,unit*.28,'#00000030');
  ctx.save();ctx.translate(cx-unit*.22,base);ctx.rotate(walk);
  roundRect(-unit*.11,0,unit*.22,unit*1.05,unit*.1,C.dark);ctx.restore();
  ctx.save();ctx.translate(cx+unit*.22,base);ctx.rotate(-walk);
  roundRect(-unit*.11,0,unit*.22,unit*1.05,unit*.1,C.dark);ctx.restore();
  ellipse(cx-unit*.22+walk*unit,base+unit*.99,unit*.15,unit*.07,'#182126');
  ellipse(cx+unit*.22-walk*unit,base+unit*.99,unit*.15,unit*.07,'#182126');
  roundRect(cx-unit*.48,base-unit*1.25,unit*.96,unit*1.35,unit*.22,col);
  roundRect(cx-unit*.42,base+unit*.02,unit*.84,unit*.14,unit*.05,shade(col,.72));
  ctx.save();ctx.translate(cx-unit*.48,base-unit*1.05);ctx.rotate(-.18+walk*.7);roundRect(-unit*.11,0,unit*.22,unit*.95,unit*.11,col);ellipse(0,unit*.98,unit*.13,unit*.13,C.skin);ctx.restore();
  ctx.save();ctx.translate(cx+unit*.48,base-unit*1.05);ctx.rotate(.18-walk*.7);roundRect(-unit*.11,0,unit*.22,unit*.95,unit*.11,col);ellipse(0,unit*.98,unit*.13,unit*.13,C.skin);ctx.restore();
  roundRect(cx-unit*.14,base-unit*1.42,unit*.28,unit*.24,unit*.07,C.skin);
  const hr=unit*.48*head;
  ellipse(cx,base-unit*1.78,hr,hr*1.08,C.skin);
  ellipse(cx-hr*.96,base-unit*1.76,hr*.13,hr*.20,C.skin);
  ellipse(cx+hr*.96,base-unit*1.76,hr*.13,hr*.20,C.skin);
  ctx.beginPath();ctx.arc(cx,base-unit*1.84,hr*1.03,Math.PI,Math.PI*2);ctx.lineTo(cx+hr,base-unit*1.73);ctx.quadraticCurveTo(cx+hr*.55,base-unit*1.55,cx,base-unit*1.62);ctx.quadraticCurveTo(cx-hr*.55,base-unit*1.55,cx-hr,base-unit*1.73);ctx.closePath();ctx.fillStyle=player.hair;ctx.fill();
  ellipse(cx-hr*.32,base-unit*1.78,unit*.055,unit*.07,C.dark);ellipse(cx+hr*.32,base-unit*1.78,unit*.055,unit*.07,C.dark);
  ctx.strokeStyle=shade(C.skin,.62);ctx.lineWidth=Math.max(1,unit*.035);ctx.beginPath();ctx.arc(cx,base-unit*1.66,unit*.15,.15*Math.PI,.85*Math.PI);ctx.stroke();
}
function humanoid(x,z){box(x,z,.78,1.25,.5,'#e1e6e1');box(x,z,.62,.68,.62,'#e1e6e1');limb(x-.25,z,.95,.14,'#e1e6e1',-.1);limb(x+.25,z,.95,.14,'#e1e6e1',.1);limb(x-.2,z,.95,.16,C.dark,.03);limb(x+.2,z,.95,.16,C.dark,-.03);box(x,z-.02,.7,.12,.65,C.dark)}
function plot(x,z,occupied=false){box(x,z,17,.035,15,occupied?'#6f9e63':'#83b878');if(!occupied){ctx.save();const p=iso(x,0.08,z);ctx.fillStyle='#ffffffcc';ctx.font='700 '+Math.max(10,cam.zoom*.22)+'px system-ui';ctx.textAlign='center';ctx.fillText('＋',p.x,p.y);ctx.restore()}}
function cityMap(){const road='#666b68',side='#d8d3c6';for(let x=-50;x<=50;x+=20){box(x,0,3.6,.055,115,road);box(x-2.4,0,1.2,.06,115,side);box(x+2.4,0,1.2,.06,115,side)}for(let z=-20;z<=80;z+=20){box(0,z,115,.055,3.6,road);box(0,z-2.4,115,.06,1.2,side);box(0,z+2.4,115,.06,1.2,side)}const lots=[[-30,-10,0],[-10,-10,1],[10,-10,0],[30,-10,1],[-30,10,1],[-10,10,0],[10,10,1],[30,10,0],[-30,30,0],[-10,30,1],[10,30,0],[30,30,1],[-30,50,1],[-10,50,0],[10,50,1],[30,50,0]];lots.forEach(([x,z,i])=>plot(x,z,!!i));return lots}
function world(){ground();let lots=[];if(worldKey==='TERRE'||worldKey==='BEACH'||worldKey==='HUB'){lots=cityMap();const homes=[[-30,-10,0],[-10,-10,1],[10,-10,2],[30,-10,3],[-30,10,1],[10,10,0],[30,10,2],[-30,30,3],[-10,30,0],[10,30,1],[30,30,2],[-30,50,0],[-10,50,2],[10,50,3],[30,50,1]];homes.forEach(([x,z,i],n)=>{if((n%3)!==1||worldKey==='BEACH')house(x,z,C.house[i]);});for(let x=-48;x<=48;x+=12){tree(x,-31+(Math.abs(x)%24));tree(x,69-(Math.abs(x)%24))}if(worldKey==='BEACH'){ctx.fillStyle='#79c7d8';ctx.fillRect(W*.77,0,W*.23,H);for(let x=-45;x<=45;x+=15)tree(x,62)}if(worldKey==='HUB'){box(0,30,18,.8,18,'#c8d6d0');box(0,30,12,2,12,'#77b58b')}}else if(worldKey==='MER'){box(-18,12,20,.5,12,'#c7d1c5');box(18,12,20,.5,12,'#c7d1c5');box(0,35,26,.5,18,'#d7d2c5');box(-22,48,10,.5,8,'#a9c9bf');box(22,48,10,.5,8,'#a9c9bf')}else if(worldKey==='MONTAGNE'){for(let x=-45;x<=45;x+=15)box(x,42,12,6,12,'#d8dce0');house(-25,20,C.house[2]);house(0,28,C.house[0]);house(25,18,C.house[3]);for(let x=-40;x<=40;x+=10)tree(x,55)}else if(worldKey==='LUNE'||worldKey==='MARS'||worldKey==='ESPACE'){box(-20,18,14,4.5,10,'#c7c8c2');box(20,18,14,5,10,'#d7d2c5');box(0,38,18,3,12,'#aeb4b7');box(0,0,60,.12,4,'#4f555b')}person(-3,10,'#9a6657');person(4,18,'#6d8a62');person(-4,32,'#806b9a');person(3,42,'#a77a4f');humanoid(1.35,-2.4)}

function dims(k){return k==='room'?[4,2.6,4]:k==='wall'?[4,2.6,.2]:k==='door'?[1,2.2,.18]:k==='window'?[2,1.5,.16]:k==='floor'?[4,.12,4]:[4,.18,4]}
function color(k){return{room:C.wall,wall:C.wall,door:C.wood,window:C.glass,floor:C.floor,roof:C.roof}[k]}
function wallSegment(a,b,roomId=null,index=0){const dx=b.x-a.x,dz=b.z-a.z,len=Math.max(.2,Math.hypot(dx,dz));return{x:(a.x+b.x)/2,z:(a.z+b.z)/2,w:len,h:2.6,d:.2,rot:Math.atan2(dz,dx),tool:'wall',color:C.wall,material:'concrete',finish:'raw',effect:'none',roomId,index}}
function segmentHit(p,w){const ux=Math.cos(w.rot),uz=Math.sin(w.rot),vx=p.x-w.x,vz=p.z-w.z;const q=Math.max(-w.w/2,Math.min(w.w/2,vx*ux+vz*uz));const px=w.x+q*ux,pz=w.z+q*uz;return{d:Math.hypot(p.x-px,p.z-pz),q,px,pz}}
function nearestWall(p){let best=null,bd=1e9;for(const o of objects){if(o.tool==='wall'){const h=segmentHit(p,o);if(h.d<bd){bd=h.d;best={o,...h}}}if(o.tool==='room'&&o.walls){for(const w of o.walls){const h=segmentHit(p,w);if(h.d<bd){bd=h.d;best={o:w,...h,room:o,wallIndex:w.index}}}}}return bd<1.8?best:null}
function roomFloorPoints(room,y=0){return(room.points||[]).map(p=>iso(p.x,y,p.z))}
function roomFloor(room,y=0,fill){const pts=roomFloorPoints(room,y);if(pts.length>2)poly(pts,fill)}
function pointerGround(e){const r=canvas.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;const q=(H*.52-sy)/(cam.zoom*.24),p=(sx-W/2)/(cam.zoom*.5),c=Math.cos(cam.rot),s=Math.sin(cam.rot),x=(p+q)/2,z=(q-p)/2;return{x:cam.x+x*c+z*s,z:cam.z-x*s+z*c}}
function sync(){if(!selected)return;$('dimW').value=selected.w;$('dimH').value=selected.h;$('dimD').value=selected.d;$('dimR').value=Math.round(selected.rot*180/Math.PI)}
function applyAdvanced(){if(!selected)return;selected.w=Math.max(.1,+$('dimW').value||1);selected.h=Math.max(.1,+$('dimH').value||1);selected.d=Math.max(.1,+$('dimD').value||1);selected.rot=(+$('dimR').value||0)*Math.PI/180;prompt.textContent='Dimensions appliquées.'}
function setWorld(k){worldKey=k;$('worldName').textContent=worlds[k][0];$('weather').textContent=worlds[k][1];$('worldPanel').classList.remove('open');prompt.textContent='Bienvenue dans '+worlds[k][0]+'. Construis ton habitat ici.'}
function openBuild(){buildMode=true;$('buildPanel').classList.add('open');prompt.textContent=tool==='room'?'Touche deux points pour créer une pièce.':'Touche le terrain pour poser.'}
function closeBuild(){buildMode=false;$('buildPanel').classList.remove('open');ghost=null;roomStart=null;selected=null;gesture=null;prompt.textContent='Mode Vie : ton habitat reste exactement comme tu l’as construit.'}
$('startGame').onclick=()=>{resize();game.style.display='block';$('intro').classList.add('hidden');started=true;load.style.display='none';hint.classList.remove('hidden');try{world();person(player.x,player.z,player.shirt)}catch(err){showEngineError(err)}setTimeout(()=>hint.classList.add('hidden'),3500);prompt.textContent='Bienvenue dans ton quartier NOMAD. Touche le sol pour te déplacer.'};
function showEngineError(err){console.error('NOMAD Life engine:',err);ctx.clearRect(0,0,W,H);ctx.fillStyle='#17353d';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='700 20px system-ui';ctx.fillText('NOMAD Life',W/2,H/2-28);ctx.font='14px system-ui';ctx.fillText('Le monde n’a pas pu être dessiné.',W/2,H/2+4);ctx.font='12px system-ui';ctx.fillText('Redémarre la page pour relancer le moteur.',W/2,H/2+28);}
addEventListener('error',e=>{if(started)showEngineError(e.error||e.message)});
function formatMoney(v){return 'N$ '+Math.floor(v).toLocaleString('fr-FR')}
$('workBtn').onclick=()=>{working=!working;$('workBtn').textContent=working?'⏹️ Finir le travail':'💼 Travail';prompt.textContent=working?'Travail commencé. Tes revenus s’accumulent pendant ta journée.':'Journée de travail terminée. Tes gains restent acquis.'};
$('buildBtn').onclick=openBuild;$('closeBuild').onclick=closeBuild;$('worldBtn').onclick=()=>$('worldPanel').classList.add('open');$('closeWorld').onclick=()=>$('worldPanel').classList.remove('open');$('buyBtn').onclick=()=>$('buyPanel').classList.add('open');$('closeBuy').onclick=()=>$('buyPanel').classList.remove('open');$('simBtn').onclick=()=>{$('avatarPanel').classList.add('open')};$('closeAvatar').onclick=()=>{$('avatarPanel').classList.remove('open')};document.querySelectorAll('[data-shirt]').forEach(b=>b.onclick=()=>{player.shirt=b.dataset.shirt;prompt.textContent='Tenue choisie. Tu peux valider ton avatar.'});document.querySelectorAll('[data-body]').forEach(b=>b.onclick=()=>{player.body=+b.dataset.body;prompt.textContent='Morphologie choisie.'});document.querySelectorAll('[data-face]').forEach(b=>b.onclick=()=>{player.face=+b.dataset.face;prompt.textContent='Visage choisi.'});$('saveAvatar').onclick=()=>{player.name=($('avatarName').value||'Mon Nomade').trim();$('simName').textContent=player.name;$('avatarPanel').classList.remove('open');prompt.textContent='Avatar enregistré. Maintenant, vis ta vie NOMAD.'};
document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{setWorld(b.dataset.world);$('worldPanel').classList.remove('open');prompt.textContent='🌍 '+b.textContent.replace(/\s+/g,' ').trim()+' chargé. Bienvenue dans ce monde NOMAD.';});
document.querySelectorAll('.buildTool').forEach(b=>b.onclick=()=>{document.querySelectorAll('.buildTool').forEach(x=>x.classList.remove('active'));b.classList.add('active');tool=b.dataset.tool;selected=null;ghost=null;roomStart=null;prompt.textContent=tool==='room'?'Dessine le contour : A → B → C → D… puis reviens sur A pour fermer.':tool==='wall'?'Pose le départ puis le point d’arrivée du mur.':tool==='door'||tool==='window'?'Touche un mur pour y accrocher '+(tool==='door'?'la porte.':'la fenêtre.'):'Touche le terrain pour poser '+b.textContent.trim()+'.'});
document.querySelectorAll('.quickSizes button').forEach(b=>b.onclick=()=>{const v=+b.dataset.size;$('dimW').value=v;$('dimH').value=2.6;$('dimD').value=tool==='floor'||tool==='room'?v:.2;if(selected)applyAdvanced();prompt.textContent='Taille '+v+' m sélectionnée.'});
document.querySelectorAll('.buildView button').forEach(b=>b.onclick=()=>{buildView=b.id==='view3dBtn'?'3d':'2d';document.querySelectorAll('.buildView button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('buildHint').textContent=buildView==='2d'?'Plan 2D : dessine les contours de ton habitat. Les pièces fermées créent automatiquement sol + plafond.':'Vue 3D : entre dans ton habitat et place/ajuste les éléments en voyant leur emplacement.';prompt.textContent=buildView==='2d'?'Plan 2D activé.':'Vue 3D activée. Le plafond reste présent mais s’efface de la vue intérieure pour voir la pièce.'});
document.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{if(!selected){prompt.textContent='Sélectionne d’abord un mur, sol, plafond, porte ou fenêtre.';return}const m=b.dataset.material;if(!materialCompatible(selected,m)){prompt.textContent='Cette matière n’est pas compatible avec cet élément.';return}applySurface(selected,m,selected.finish||'raw',selected.effect||'none',selected.surfaceColor);sync();prompt.textContent='Matière : '+(MATERIALS[m]?.label||m)+' ✓'});
document.querySelectorAll('[data-finish]').forEach(b=>b.onclick=()=>{if(!selected){prompt.textContent='Sélectionne un élément à finir.';return}selected.finish=b.dataset.finish;selected.color=selected.surfaceColor||selected.color;sync();prompt.textContent='Finition : '+(FINISHES[b.dataset.finish]?.label||b.dataset.finish)+' ✓'});
document.querySelectorAll('[data-effect]').forEach(b=>b.onclick=()=>{if(!selected){prompt.textContent='Sélectionne un élément pour lui ajouter un effet.';return}selected.effect=b.dataset.effect;sync();prompt.textContent='Effet : '+(EFFECTS[b.dataset.effect]?.label||b.dataset.effect)+' ✓'});
document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{if(!selected){prompt.textContent='Sélectionne un élément à recolorer.';return}selected.surfaceColor=b.dataset.color;selected.color=b.dataset.color;sync();prompt.textContent='Couleur appliquée ✓'});
$('advancedToggle').onclick=()=>{$('advanced').classList.toggle('open');$('advancedToggle').classList.toggle('open')};$('applyAdvanced').onclick=applyAdvanced;
$('deleteBuild').onclick=()=>{if(selected){objects.splice(objects.indexOf(selected),1);selected=null;prompt.textContent='Objet supprimé.'}};$('duplicateBuild').onclick=()=>{if(selected){selected={...selected,x:selected.x+1};objects.push(selected);sync();prompt.textContent='Objet dupliqué.'}};
document.querySelectorAll('.catalog button').forEach(b=>b.onclick=()=>{const price=+b.dataset.price;if(money<price){prompt.textContent='Il te faut encore N$ '+(price-money)+'.';return}money-=price;moneyEl.textContent=formatMoney(money);tool='furniture';const p={x:player.x+1,z:player.z+1};selected={tool:'furniture',item:b.dataset.item,x:p.x,z:p.z,w:1.2,h:.8,d:1,color:'#b7a58e',rot:0};objects.push(selected);$('buyPanel').classList.remove('open');prompt.textContent=b.textContent.trim()+' ajouté. Touche-le puis déplace-le avec ton doigt.'});
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}function angle(a,b){return Math.atan2(b.y-a.y,b.x-a.x)}
function startGesture(){const a=[...pointers.values()];if(a.length===2){const d=dist(a[0],a[1]),ang=angle(a[0],a[1]),mid={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};if(buildMode&&selected){gesture={type:'object',dist:d,angle:ang,mid,obj:selected,w:selected.w,h:selected.h,d:selected.d,rot:selected.rot};prompt.textContent='🤏 Pince pour agrandir/réduire · 🔄 tourne pour orienter.'}else{gesture={type:'camera',dist:d,angle:ang,mid,camX:cam.x,camZ:cam.z,zoom:cam.zoom,rot:cam.rot};}}}
canvas.addEventListener('pointerdown',e=>{if(!started)return;canvas.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){startGesture();return}gesture={type:'one',start:{x:e.clientX,y:e.clientY},last:{x:e.clientX,y:e.clientY},moved:false}});
canvas.addEventListener('pointermove',e=>{if(!started)return;if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&gesture?.type==='object'){const a=[...pointers.values()],m={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};const sc=Math.max(.35,Math.min(4,dist(a[0],a[1])/gesture.dist));const min=.25;gesture.obj.w=Math.max(min,gesture.w*sc);gesture.obj.d=Math.max(min,gesture.d*sc);gesture.obj.h=Math.max(min,gesture.h*sc);gesture.obj.rot=gesture.rot+(angle(a[0],a[1])-gesture.angle);sync();return}
if(pointers.size===2&&gesture?.type==='camera'){const a=[...pointers.values()],m={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};const sc=dist(a[0],a[1])/gesture.dist;cam.zoom=Math.max(28,Math.min(90,gesture.zoom*sc));cam.rot=gesture.rot+(angle(a[0],a[1])-gesture.angle);const panX=m.x-gesture.mid.x,panY=m.y-gesture.mid.y;const units=1/(cam.zoom*.5);cam.x=gesture.camX-(panX+panY)*units*.7;cam.z=gesture.camZ+(panX-panY)*units*.7;return}
if(gesture?.type==='one'){const dx=e.clientX-gesture.start.x,dy=e.clientY-gesture.start.y;if(Math.hypot(dx,dy)>8)gesture.moved=true;if(buildMode&&selected&&gesture.moved){const p=pointerGround(e);selected.x=p.x;selected.z=p.z}else if(buildMode&&!selected)ghost=pointerGround(e)}});
canvas.addEventListener('pointerup',e=>{if(!started)return;pointers.delete(e.pointerId);if(pointers.size){if(pointers.size===1)gesture=null;return}const g=gesture;gesture=null;if(!g||g.type!=='one'||g.moved)return;const p=pointerGround(e);
if(buildMode){
  if(!selected){
    const hit=objects.slice().reverse().find(o=>Math.hypot(o.x-p.x,o.z-p.z)<Math.max(1.5,Math.min(4,(o.w||2)/2+1)));
    if(hit && !['room','wall','door','window'].includes(tool)){selected=hit;sync();prompt.textContent='Élément sélectionné. Déplace-le, redimensionne-le ou personnalise sa matière.';return;}
  }
  if(selected){
    selected.x=p.x;selected.z=p.z;selected=null;sync();
    prompt.textContent='Élément déplacé puis ancré ✓.';
    return;
  }
  if(tool==='room'){
    if(!roomStart){
      roomStart=[p]; ghost={poly:roomStart};
      prompt.textContent='Point A posé. Continue le contour : B, C, D…';
    }else{
      const pts=roomStart, first=pts[0];
      if(pts.length>=3 && Math.hypot(p.x-first.x,p.z-first.z)<1.2){
        const roomId='room-'+Date.now()+'-'+Math.floor(Math.random()*9999); const walls=[]; for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];walls.push(wallSegment(a,b,roomId,i))}
        const xs=pts.map(q=>q.x),zs=pts.map(q=>q.z);
        const obj={tool:'room',id:roomId,points:pts.map(q=>({x:q.x,z:q.z})),x:(Math.min(...xs)+Math.max(...xs))/2,z:(Math.min(...zs)+Math.max(...zs))/2,w:Math.max(...xs)-Math.min(...xs),h:2.6,d:Math.max(...zs)-Math.min(...zs),color:C.wall,rot:0,walls,material:'concrete',finish:'raw',effect:'none',floor:{material:'concrete',finish:'polished',effect:'none',color:'#b8b8b2'},ceiling:{material:'concrete',finish:'raw',effect:'none',color:'#d8d6cf'}};
        objects.push(obj);roomStart=null;ghost=null;selected=null;sync();
        prompt.textContent='Maison ancrée ✓. Ajoute portes et fenêtres sur les murs.';
      }else{
        pts.push(p);ghost={poly:pts};
        prompt.textContent='Point '+String.fromCharCode(65+pts.length-1)+' posé. Retourne au point A pour fermer la pièce.';
      }
    }
  }else if(tool==='wall'){
    if(!roomStart){roomStart=[p];ghost={a:p,b:p};prompt.textContent='Départ du mur posé. Touche le point d’arrivée.'}
    else{const a=roomStart[0],g=wallSegment(a,p);objects.push(g);roomStart=null;ghost=null;selected=null;sync();prompt.textContent='Mur ancré ✓. Touche le terrain pour tracer le suivant.'}
  }else if(tool==='door'||tool==='window'){
    const n=nearestWall(p);
    if(n){const d=dims(tool);const o=n.o;const offset=Math.max(-o.w/2+d[0]/2,Math.min(o.w/2-d[0]/2,n.q));const ux=Math.cos(o.rot),uz=Math.sin(o.rot);const obj={tool,x:o.x+offset*ux,z:o.z+offset*uz,w:d[0],h:d[1],d:d[2],color:color(tool),rot:o.rot,wallRef:o.room?{roomId:o.room.id,index:n.wallIndex}:null,material:tool==='window'?'glass':'wood',finish:'raw',effect:'none'};applySurface(obj,obj.material,obj.finish,obj.effect,obj.color);objects.push(obj);selected=obj;sync();prompt.textContent=(tool==='door'?'Porte':'Fenêtre')+' accrochée au mur ✓. Tu peux la déplacer ou la personnaliser.'}
    else prompt.textContent='Touche directement un mur pour y accrocher '+(tool==='door'?'la porte.':'la fenêtre.');
  }else{
    const d=dims(tool);const obj={tool,x:Math.round(p.x*2)/2,z:Math.round(p.z*2)/2,w:d[0],h:d[1],d:d[2],color:color(tool),rot:0,material:tool==='floor'?'wood':'concrete',finish:'raw',effect:'none'};applySurface(obj,obj.material,obj.finish,obj.effect,obj.color);objects.push(obj);selected=obj;ghost=null;sync();prompt.textContent='Élément ancré ✓. Touche le terrain pour en poser un autre.';
  }
}else{player.tx=p.x;player.tz=p.z;player.rot=Math.atan2(p.x-player.x,p.z-player.z);prompt.textContent='Ton Nomade se déplace vers cet endroit.'}});
canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);gesture=null});
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.zoom=Math.max(28,Math.min(90,cam.zoom*(e.deltaY>0?.92:1.08)))} ,{passive:false});
canvas.addEventListener('click',e=>{
 if(!started)return;
 const p=pointerGround(e);
 if(buildMode)return;
 // Taper un personnage / la maison : interaction directe.
 if(Math.hypot(p.x-player.x,p.z-player.z)<2.8){prompt.textContent='👤 C’est toi, '+player.name+'. Touche le terrain pour te déplacer.';return}
 if(Math.hypot(p.x-player.x,p.z-player.z)<8 && p.z>-4){prompt.textContent='🏠 Tu es devant ton habitat. Touche la maison pour entrer.';return}
 player.tx=p.x; player.tz=p.z; player.rot=Math.atan2(p.x-player.x,p.z-player.z);
});

document.addEventListener('contextmenu',e=>{if(e.target===canvas)e.preventDefault()});
function loop(){requestAnimationFrame(loop);t+=.016;clock+=.0008;try{player.x+=(player.tx-player.x)*.08;player.z+=(player.tz-player.z)*.08;if(working && Math.floor(clock)!==Math.floor(lastPayClock)){money+=500;lastPayClock=clock;moneyEl.textContent=formatMoney(money);prompt.textContent='💼 Travail : +N$ 500. Tes économies grandissent.'}
clockEl.textContent=String(Math.floor(clock)%24).padStart(2,'0')+':'+String(Math.floor(clock*60)%60).padStart(2,'0');world();objects.slice().sort((a,b)=>(a.x+a.z)-(b.x+b.z)).forEach(o=>{if(o.tool==='room'&&o.walls){o.walls.forEach(w=>box(w.x,w.z,w.w,w.h,w.d,surfaceColor(w),w.rot));roomFloor(o,0,o.floor?.color||C.floor);if(buildView==='2d'||!buildMode){roomFloor(o,o.h,o.ceiling?.color||'#d8d6cf')}}else{box(o.x,o.z,o.w,o.h,o.d,surfaceColor(o),o.rot)}});if(buildMode&&ghost){if(tool==='room'&&ghost.poly){const pts=ghost.poly.map(q=>iso(q.x,.03,q.z));if(pts.length>2)poly(pts,'#ffffff55');for(let i=0;i<ghost.poly.length-1;i++){const g=wallSegment(ghost.poly[i],ghost.poly[i+1]);box(g.x,g.z,g.w,.08,g.d,'#ffffffaa',g.rot)}}else if(tool==='wall'&&ghost.a&&ghost.b){const g=wallSegment(ghost.a,ghost.b);box(g.x,g.z,g.w,g.h,g.d,g.color,g.rot)}else{const d=dims(tool);box(ghost.x,ghost.z,d[0],d[1],d[2],color(tool))}}person(player.x,player.z,player.shirt)}catch(err){showEngineError(err)}}
loop();})();