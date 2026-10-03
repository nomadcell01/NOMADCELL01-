import * as THREE from './vendor/three.module.min.js';
(()=>{'use strict';
const canvas=document.getElementById('world'), prompt=document.getElementById('prompt');
if(!canvas){return;}
const T=THREE;
let renderer,scene,camera,world='TERRE',player,people=[],objects=[],yaw=0,pitch=.55,distance=12,hubUnderground=false;
let targetYaw=0,targetPitch=.38,drag=false,lastX=0,lastY=0,moveX=0,moveY=0,simMinutes=8*60,simDay=1;
const needs={energy:100,hunger:100,hygiene:100,fun:100};
const worlds=['TERRE','BEACH','MER','MONTAGNE','LUNE','MARS','ESPACE','HUB'];
const colors={TERRE:['#9bd4ee','#79a95d'],BEACH:['#8ed8ee','#e8c47b'],MER:['#55a9cf','#4c9bb7'],MONTAGNE:['#aab8c8','#71866e'],LUNE:['#111827','#777983'],MARS:['#c56f50','#a9533d'],ESPACE:['#050b16','#263449'],HUB:['#b8dfeb','#76a96c']};
function say(s){if(prompt)prompt.textContent=s;}
function mat(c){return new T.MeshStandardMaterial({color:c,roughness:.82});}
function meshBox(x,y,z,w,h,d,c){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);objects.push(m);return m;}
function person(x,z,c,name,isPlayer=false){
  const g=new T.Group();
  const skin=mat('#d2a07b'), cloth=mat(c), dark=mat('#25282b');
  const torso=new T.Mesh(new T.CapsuleGeometry(.34,.72,8,16),cloth); torso.position.y=1.05; g.add(torso);
  const pelvis=new T.Mesh(new T.BoxGeometry(.48,.28,.30),cloth); pelvis.position.y=.68; g.add(pelvis);
  const head=new T.Mesh(new T.SphereGeometry(.29,20,16),skin); head.position.y=1.82; g.add(head);
  const hair=new T.Mesh(new T.SphereGeometry(.305,20,10,0,Math.PI*2,0,Math.PI*.48),dark); hair.position.y=1.91; g.add(hair);
  for(const sx of [-1,1]){
    const arm=new T.Mesh(new T.CapsuleGeometry(.11,.58,6,10),cloth); arm.position.set(sx*.43,1.08,0); arm.rotation.z=sx*.08; g.add(arm);
    const leg=new T.Mesh(new T.CapsuleGeometry(.13,.68,6,10),dark); leg.position.set(sx*.14,.28,0); g.add(leg);
  }
  g.position.set(x,0,z);
  g.userData={name:name||'Habitant',isPlayer,life:{activity:'Vie quotidienne',mood:'Neutre',needs:{energy:100,hunger:100}}};
  g.traverse(o=>{o.castShadow=true;});
  scene.add(g);people.push(g);return g;
}
function hubMat(c,roughness=.82,metalness=0){return new T.MeshStandardMaterial({color:c,roughness,metalness});}
function hubBox(x,y,z,w,h,d,c,opts={}){
  const m=new T.Mesh(new T.BoxGeometry(w,h,d),hubMat(c,opts.roughness??.82,opts.metalness??0));
  m.position.set(x,y+h/2,z);
  m.castShadow=true;m.receiveShadow=true;scene.add(m);objects.push(m);
  return m;
}
function hubRoom(x,z,w,d,label,c='#d6d0c5',floor='#8a6a4b'){
  hubBox(x,0,z,w,.12,d,floor);
  hubBox(x-.5*w,0,z,.12,2.8,d,c);hubBox(x+.5*w,0,z,.12,2.8,d,c);
  hubBox(x,0,z+.5*d,w,.12,2.8,c);
  const sign=hubBox(x,2.25,z-.5*d-.03,Math.min(w*.65,3.0),.34,.05,'#183342');
  sign.userData.label=label;
}
function hubDoor(x,z){
  hubBox(x,0,z,.95,2.25,.10,'#5c3f2e');
}
function hubGlass(x,z,w,h=2.2){
  hubBox(x,0,z,w,h,.05,'#73b9c9',{roughness:.15});
}
function hubTable(x,z,w=1.2,d=.7){
  hubBox(x,.72,z,w,.08,d,'#6b4a32');
  for(const dx of [-w*.42,w*.42]) for(const dz of [-d*.42,d*.42]) hubBox(x+dx,0.12,z+dz,.06,.72,.06,'#252b2d',{metalness:.65});
}
function hubBed(x,z,w=1.6,d=2.0){
  hubBox(x,.32,z,w,.30,d,'#d7d1c7');
  hubBox(x,.62,z+d*.42,w,.65,.12,'#76563f');
  hubBox(x,.68,z-.15,w*.82,.12,d*.68,'#f0ece3');
}
function hubSofa(x,z,w=1.8){
  hubBox(x,.38,z,w,.45,.72,'#555b61');
  hubBox(x,.78,z+.28,w,.55,.18,'#555b61');
  hubBox(x,.65,z-.35,.18,.65,.72,'#555b61');hubBox(x+w*.5-.09,.65,z-.35,.18,.65,.72,'#555b61');
}
function hubPlant(x,z){
  hubBox(x,.25,z,.34,.5,.34,'#303a36');
  const p=new T.Mesh(new T.SphereGeometry(.42,12,8),hubMat('#3f8653',.9));
  p.position.set(x,.85,z);p.castShadow=true;scene.add(p);objects.push(p);
}
function hubLight(x,z){
  const l=new T.PointLight('#ffd9a1',18,8);l.position.set(x,2.7,z);scene.add(l);objects.push(l);
}
function hubLabel(x,z,text){
  const c=document.createElement('canvas');c.width=512;c.height=96;const q=c.getContext('2d');
  q.fillStyle='#10222d';q.fillRect(0,0,c.width,c.height);q.fillStyle='#ffffff';q.font='bold 34px sans-serif';q.textAlign='center';q.fillText(text,256,58);
  const tex=new T.CanvasTexture(c), m=new T.MeshBasicMaterial({map:tex,transparent:true});const p=new T.Mesh(new T.PlaneGeometry(3.0,.56),m);p.position.set(x,2.7,z);p.rotation.x=-Math.PI/2;scene.add(p);objects.push(p);
}
function buildHubSurface(){
  const steel='#3c4a51',glass='#78b8c4',stone='#d7d2c7',wood='#78543a',dark='#20282d';
  // landscaped site / roads
  hubBox(0,-.12,0,86,.12,74,'#79a96c');
  hubBox(0,0,31,86,.08,6,'#454d50');hubBox(-31,0,0,6,.08,62,'#454d50');hubBox(31,0,0,6,.08,62,'#454d50');
  // central HUB footprint, open circulation
  hubBox(0,0,0,38,.18,28,stone);
  hubBox(0,0,-13,34,.18,2.0,wood);
  hubBox(0,0,13,34,.18,2.0,wood);
  // exterior wings
  hubRoom(-12,-5,9,12,'CHAMBRES + SDB','#d9d2c6',wood);
  hubRoom(12,-5,9,12,'APPARTEMENTS PERSONNEL','#cbd4d0',wood);
  hubRoom(-12,7,9,9,'DIRECTION / AVOCAT','#d6cec1',wood);
  hubRoom(12,7,9,9,'TV / RADIO','#202b34',dark);
  // central public zone
  hubRoom(0,-5,11,9,'LOUNGE / ACCUEIL','#d9d3c8',wood);
  hubRoom(0,7,11,9,'RESTAURANT','#d2c5b0',wood);
  // service / lab / garage
  hubRoom(-19,7,5,9,'LAB ROBOTIQUE','#bfcbd0',steel);
  hubRoom(19,7,5,9,'GARAGE','#b9bec0',steel);
  // pro kitchen behind restaurant
  hubRoom(0,13.2,11,3.5,'CUISINE PROFESSIONNELLE','#c6c0b5',steel);
  // safety + technical
  hubRoom(-19,-6,5,7,'PC SÉCURITÉ','#26333b',dark);
  hubRoom(19,-6,5,7,'LOCAUX TECHNIQUES','#9ea8aa',steel);
  // doors and glass
  hubDoor(0,-9.55);hubDoor(-7.5,-9.55);hubDoor(7.5,-9.55);
  hubGlass(-19.01,-1.5,4.8,2.2);hubGlass(19.01,-1.5,4.8,2.2);hubGlass(-2.8,13.15,5,2.2);hubGlass(2.8,13.15,5,2.2);
  // central atrium / tower
  hubBox(0,0,0,7,.25,7,glass,{roughness:.2,metalness:.25});
  hubBox(0,.25,0,5,4.8,5,glass,{roughness:.18,metalness:.2});
  hubBox(0,0,0,1.2,5.5,1.2,steel,{metalness:.65});
  // exterior pool + terrace + DJ
  hubBox(0,0,-23,20,.18,9,'#59b8cf');
  hubBox(-11,0,-23,3,.2,3,wood);hubBox(-11,.2,-23,2.4,.7,2.2,dark);
  hubBox(11,0,-23,4,.2,3,wood);hubBox(11,.2,-23,3.2,.7,2.2,dark);
  // furnishings
  hubSofa(-3,-5,2.0);hubSofa(3,-5,2.0);hubTable(0,-4.4,1.0,.55);
  for(const p of [[-13,-5],[-11,-8],[-10,7],[10,7],[13,-5],[16,7],[-16,7],[0,5]])hubPlant(p[0],p[1]);
  for(const p of [[-12,-5],[12,-5],[-12,7],[12,7],[-19,7],[19,7],[0,-5],[0,7]])hubLight(p[0],p[1]);
  for(const x of [-15,-11,11,15]){hubBed(x,-5,1.55,2.1);}
  for(const x of [-2.5,0,2.5])hubTable(x,7,1.4,.7);
  hubLabel(0,-10.8,'NOMADCELL01 HUB');
  // entry path + parking / helipad
  hubBox(0,0,-30,12,.08,4,'#454d50');hubBox(-27,0,-27,8,.08,8,'#525a5d');
  hubLabel(-27,-27,'H');
}
function buildHubUnderground(){
  const floor='#454b4e',wall='#727b7e',steel='#20282d',cyan='#2c8aa0';
  hubBox(0,-.12,0,82,.12,62,'#343a3d');
  // fixed underground grid
  const rooms=[
    [-25,-16,12,9,'GARAGE / TRANSPORT'],
    [-10,-16,12,9,'STOCKAGE ÉNERGÉTIQUE'],
    [5,-16,12,9,'RÉSEAU EAU / PURIFICATION'],
    [20,-16,12,9,'ATELIER ROBOTIQUE'],
    [-25,-3,12,9,'FABRICATION'],
    [-10,-3,12,9,'ENTREPÔT'],
    [5,-3,12,9,'LOCAL TECHNIQUE'],
    [20,-3,12,9,'SÉCURITÉ / CONTRÔLE'],
    [-18,10,12,9,'SPORT / DÉTENTE'],
    [-3,10,12,9,'CHAMBRES / REPOS'],
    [12,10,12,9,'ESPACE DÉTENTE']
  ];
  for(const r of rooms)hubRoom(r[0],r[1],r[2],r[3],r[4],wall,steel);
  hubBox(0,0,0,7,.2,7,cyan);
  hubBox(0,.2,0,3.5,3.8,3.5,steel,{metalness:.5});
  for(const x of [-27,-18,-9,0,9,18,27]){hubLight(x,-25);hubLight(x,16);}
  for(const p of [[-25,-16],[-10,-16],[5,-16],[20,-16],[-25,-3],[-10,-3],[5,-3],[20,-3]])hubLabel(p[0],p[1],rooms.find(r=>r[0]===p[0]&&r[1]===p[1])?.[4]||'ZONE');
  say('⬇️ Sous-sol HUB — structures fixes, zone jouable');
}
function house(x,z,c){
  const g=new T.Group();
  const h=3.2+((Math.abs(x)+Math.abs(z))%3)*0.55;
  const w=6.5+((Math.abs(x*3)+Math.abs(z))%2)*1.8;
  const d=6.2+((Math.abs(z*2)+Math.abs(x))%2)*1.4;
  const facade=mat(c), trim=mat('#e7e2d8'), glass=mat('#6d9eaa'), roof=mat('#4b4f52');
  const body=new T.Mesh(new T.BoxGeometry(w,h,d),facade);body.position.y=h/2;body.castShadow=true;body.receiveShadow=true;g.add(body);
  const roofM=new T.Mesh(new T.ConeGeometry(Math.max(w,d)*.72,1.6,4),roof);roofM.position.y=h+.8;roofM.rotation.y=Math.PI/4;roofM.castShadow=true;g.add(roofM);
  for(const sx of [-1,1]){const win=new T.Mesh(new T.BoxGeometry(.08,1.15,1.7),glass);win.position.set(sx*(w/2+.01),h*.58,0);g.add(win);}
  for(const sz of [-1,1]){const win=new T.Mesh(new T.BoxGeometry(1.7,1.15,.08),glass);win.position.set(0,h*.58,sz*(d/2+.01));g.add(win);}
  const door=new T.Mesh(new T.BoxGeometry(1.05,2.1,.12),trim);door.position.set(0,1.05,d/2+.07);g.add(door);
  const base=new T.Mesh(new T.BoxGeometry(w+.35,.12,d+.35),trim);base.position.y=.06;base.receiveShadow=true;g.add(base);
  g.position.set(x,0,z);scene.add(g);objects.push(g);
}
function tree(x,z,scale=1){
  const g=new T.Group();const trunk=new T.Mesh(new T.CylinderGeometry(.18*scale,.24*scale,1.5*scale,10),mat('#604a37'));trunk.position.y=.75*scale;trunk.castShadow=true;g.add(trunk);
  const crown=new T.Mesh(new T.SphereGeometry(1.15*scale,14,10),mat('#3f8653'));crown.position.y=2.05*scale;crown.castShadow=true;g.add(crown);
  g.position.set(x,0,z);scene.add(g);objects.push(g);
}
function clearWorld(){
  for(const o of objects){ if(o && o.parent) o.parent.remove(o); }
  objects.length=0;
  people.length=0;
  player=null;
}
function build(){
  clearWorld();
  if(world==='HUB'){
    if(hubUnderground){ buildHubUnderground(); player=person(0,-11,'#527f93','Joueur NOMAD',true); }
    else { buildHubSurface(); player=person(0,-17,'#527f93','Joueur NOMAD',true); }
    person(-4,-4,'#9b6758','Lina');person(5,-4,'#6f8c66','Milo');person(-7,8,'#806b9a','Aya');
    window.NOMAD_PEOPLE=people;
    if(!hubUnderground){ say('◎ NOMADCELL01 HUB — surface prête à vivre · U = sous-sol'); }
    return;
    return;
  }
  const col=colors[world]||colors.TERRE;
  scene.background=new T.Color(col[0]);say('🏠 Chargement de la ville NOMAD…');
  scene.fog=new T.Fog(col[0],45,120);
  meshBox(0,-.1,0,110,.1,110,col[1]);
  meshBox(0,0,0,4,.08,75,'#4b5153');meshBox(-24,0,0,3,.08,75,'#4b5153');meshBox(24,0,0,3,.08,75,'#4b5153');
  meshBox(0,.01,-37,54,.05,4,'#777b7b');meshBox(0,.01,37,54,.05,4,'#777b7b');
  // Ville réaliste : immeubles variés, façades, vitrages et espaces publics — aucun bloc cubique.
  house(-10,-10,world==='MARS'?'#9b5b49':world==='LUNE'?'#9699a0':'#d2b9a1');
  house(12,-3,'#b7c9c0');house(-13,16,'#c8b49e');house(10,18,'#aebdca');
  house(0,28,'#d0c7b8');
  for(const p of [[-28,-25],[-28,-8],[-28,10],[28,-25],[28,-8],[28,10],[-8,-28],[10,-28]]) tree(p[0],p[1],1.05);
  if(world!=='ESPACE'&&world!=='LUNE'){
    for(const p of [[-35,-32],[-35,-15],[-35,3],[-35,22],[35,-32],[35,-15],[35,3],[35,22]]) tree(p[0],p[1],1.15);
  }
  if(world==='BEACH'||world==='MER')meshBox(0,-.02,31,90,.05,28,'#59b3cf');
  if(world==='MONTAGNE')for(let i=0;i<8;i++){const m=new T.Mesh(new T.ConeGeometry(3,7,7),mat('#777e80'));m.position.set((i%4-1.5)*18,3.5,(Math.floor(i/4)-.5)*28);m.castShadow=true;scene.add(m);objects.push(m);}
  if(world==='LUNE'||world==='MARS'||world==='ESPACE')for(let i=0;i<12;i++){const r=1+Math.random()*2;const m=new T.Mesh(new T.SphereGeometry(r,8,6),mat(world==='ESPACE'?'#334155':'#6b625e'));m.position.set((Math.random()-.5)*70,r*.5,(Math.random()-.5)*70);m.castShadow=true;scene.add(m);objects.push(m);}
  player=person(0,-12,'#527f93','Joueur NOMAD',true);person(6,-6,'#9b6758','Lina');person(-7,-3,'#6f8c66','Milo');person(14,10,'#806b9a','Aya');window.NOMAD_PEOPLE=people;say('🌍 NOMAD '+world+' — prêt à vivre');
}
function toggleHubLevel(){if(world!=='HUB'){say('◎ Va d’abord dans le HUB.');return;}hubUnderground=!hubUnderground;build();say(hubUnderground?'⬇️ HUB sous-sol — structures fixes, jouable':'⬆️ HUB surface — intérieur et extérieur');}
function nextWorld(){worlds[(worlds.indexOf(world)+1)%worlds.length];world=worlds[(worlds.indexOf(world)+1)%worlds.length];hubUnderground=false;build();say('🚌 Transport NOMAD → '+world);}
function init(){try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;scene=new T.Scene();camera=new T.PerspectiveCamera(55,1,.1,250);scene.add(camera);scene.add(new T.HemisphereLight(0xffffff,0x445566,2.2));const light=new T.DirectionalLight(0xffffff,2.4);light.position.set(25,40,15);light.castShadow=true;scene.add(light);build();resize();bind();loop();}catch(e){say('Erreur moteur: '+(e&&e.message?e.message:String(e)));console.error(e);}}
function resize(){if(!renderer||!camera)return;const w=canvas.clientWidth||window.innerWidth,h=canvas.clientHeight||window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function bind(){window.addEventListener('resize',resize);canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture&&canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointermove',e=>{if(!drag)return;targetYaw-=((e.clientX-lastX)||0)*.006;targetPitch-=((e.clientY-lastY)||0)*.004;targetPitch=Math.max(.15,Math.min(1.25,targetPitch));lastX=e.clientX;lastY=e.clientY;});canvas.addEventListener('wheel',e=>{distance=Math.max(6,Math.min(32,distance+e.deltaY*.02));});window.addEventListener('keydown',e=>{if(e.key==='w'||e.key==='ArrowUp')moveY=1;if(e.key==='s'||e.key==='ArrowDown')moveY=-1;if(e.key==='a'||e.key==='ArrowLeft')moveX=-1;if(e.key==='d'||e.key==='ArrowRight')moveX=1;if(e.key===' ')say('⏸️ Mode tranquillité');if(e.key==='n'||e.key==='N')nextWorld();if(e.key==='u'||e.key==='U')toggleHubLevel();});window.addEventListener('keyup',e=>{if(['w','s','a','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){moveX=0;moveY=0;}});}
function update(dt){yaw+=(targetYaw-yaw)*.12;pitch+=(targetPitch-pitch)*.12;if(player){const speed=.055*dt;const f=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new T.Vector3(Math.cos(yaw),0,-Math.sin(yaw));player.position.addScaledVector(f,moveY*speed);player.position.addScaledVector(r,moveX*speed);const camTarget=player.position.clone();camera.position.copy(camTarget).add(new T.Vector3(Math.sin(yaw)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*distance));camera.lookAt(camTarget.x,camTarget.y+1.3,camTarget.z);}for(let i=1;i<people.length;i++){const p=people[i],a=performance.now()*.0002+i*2;p.position.x+=Math.cos(a)*.012*dt;p.position.z+=Math.sin(a)*.012*dt;p.userData.life.activity=Math.sin(a)>0?'Vie sociale':'Vie quotidienne';}simMinutes+=dt/1200;if(simMinutes>=1440){simMinutes-=1440;simDay++;}const hh=String(Math.floor(simMinutes/60)).padStart(2,'0'),mm=String(Math.floor(simMinutes%60)).padStart(2,'0');const clock=document.getElementById('clock');if(clock)clock.textContent=hh+':'+mm;}
function loop(){requestAnimationFrame(loop);update(1);renderer.render(scene,camera);}
window.NOMAD_RESIZE=resize;
window.NOMAD_GAME={get world(){return world;},nextWorld,nextWorld,build,player:()=>player,say};
window.NOMAD_NEXT_WORLD=nextWorld;
window.NOMAD_TRAVEL=nextWorld;
init();
})();