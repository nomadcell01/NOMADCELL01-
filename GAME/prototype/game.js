import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.getElementById('gameCanvas');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9bbdce);
const camera=new THREE.PerspectiveCamera(62,1,.05,120);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight(0xeaf6ff,0x52604e,2.1));
const sun=new THREE.DirectionalLight(0xffedcf,2.8);sun.position.set(-15,25,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const state={money:1000,world:'Terre',inside:false,home:false,skills:{tech:1}};
const worldColors={Terre:[0x9bbdce,0x728d65],Mer:[0x70a8bd,0x3d7078],Montagne:[0xa5b5bf,0x66716d],Campagne:[0xa7c68e,0x789b55],Lune:[0x202632,0x777a7d],Mars:[0x86554c,0x9a5d4f],Espace:[0x080d1d,0x333a49]};
let worldGroup=new THREE.Group();scene.add(worldGroup);
let player,companion,door,homeGroup,exteriorGroup,target=null;
const keys={};
const clock=new THREE.Clock();

function M(c){return new THREE.MeshStandardMaterial({color:c,roughness:.78})}
function mesh(g,m,p,group=worldGroup){const o=new THREE.Mesh(g,M(m));o.position.set(...p);o.castShadow=true;o.receiveShadow=true;group.add(o);return o}
function box(w,h,d,c,x,y,z,g=worldGroup){return mesh(new THREE.BoxGeometry(w,h,d),c,[x,y+h/2,z],g)}
function adult(c=0x4e7182){const g=new THREE.Group();const body=mesh(new THREE.CapsuleGeometry(.28,.75,5,10),c,[0,1,0],g);const head=mesh(new THREE.SphereGeometry(.29,16,12),0xc98f6f,[0,1.78,0],g);const leg1=box(.18,.65,.2,0x333b40,-.13,.05,0,g),leg2=box(.18,.65,.2,0x333b40,.13,.05,0,g);g.userData.height=1.9;return g}
function tree(x,z){box(.28,1.7,.28,0x5b4939,x,0,z);const c=mesh(new THREE.SphereGeometry(1.15,12,9),0x456d49,[x,2.35,z]);c.castShadow=true}
function street(){box(12,.08,70,0x555a5b,0,0,0);box(2.2,.1,70,0xb4aa8c,-7.1,0,0);box(2.2,.1,70,0xb4aa8c,7.1,0,0);for(let z=-30;z<=30;z+=7){box(2.8,.03,.08,0xe7ddad,0,.11,z)}}
function houseFacade(x,z){const g=new THREE.Group();worldGroup.add(g);box(7,3.2,5.5,0xd8c4a8,x,0,z,g);box(7.3,.25,5.8,0x6b5148,x,3.2,z,g);box(1.0,2.0,.18,0x4f4038,x,0,z-2.82,g);box(1.0,1.0,.16,0x9fc8d0,x-2,1.35,z-2.84,g);box(1.0,1.0,.16,0x9fc8d0,x+2,1.35,z-2.84,g);return g}
function shop(x,z){const g=new THREE.Group();worldGroup.add(g);box(7,4,5,0xc8d1d0,x,0,z,g);box(7.1,1.2,.18,0x31454b,x,2,z-2.58,g);box(5.8,1.8,.12,0xa6cdd3,x,1.05,z-2.7,g)}
function npc(x,z,c){const n=adult(c);n.position.set(x,0,z);worldGroup.add(n);return n}
function clearWorld(){while(worldGroup.children.length)worldGroup.remove(worldGroup.children[0]);homeGroup=null;exteriorGroup=null;door=null}

function buildExterior(){
 clearWorld();state.inside=false;
 const [sky,ground]=worldColors[state.world];scene.background.set(sky);
 const fog=new THREE.Fog(sky,35,95);scene.fog=fog;
 box(80,.25,80,ground,0,-.3,0);
 street();
 // One real residential street: houses are around the character, not a map.
 houseFacade(-13,-8);houseFacade(13,-8);houseFacade(-13,9);homeGroup=houseFacade(13,9);
 shop(-13,22);
 for(const z of [-22,-10,3,16,28]){tree(-9,z);tree(9,z)}
 for(const [x,z,c] of [[-4,-12,0x5e7786],[4,-6,0x856d5a],[-3,10,0x687d62],[5,17,0x7a6074]])npc(x,z,c);
 player=adult(0x4d7187);player.position.set(0,0,14);worldGroup.add(player);
 companion=adult(0x777f83);companion.scale.setScalar(.9);companion.position.set(2,0,16);worldGroup.add(companion);
 // Door interaction belongs to the house at street level.
 door=new THREE.Object3D();door.position.set(13,0,6.1);door.userData.action='enter';worldGroup.add(door);
 target=null;
 setMessage('Tu arrives dans une vraie rue NOMAD. Les habitants vivent déjà ici. T.H.E.O. est avec toi.');
 document.getElementById('worldName').textContent='NOMAD '+state.world.toUpperCase();
 document.getElementById('loading').classList.add('done');
}

function buildInterior(){
 clearWorld();state.inside=true;scene.background.set(0x9aa6a4);scene.fog=null;
 const g=new THREE.Group();worldGroup.add(g);homeGroup=g;
 // Human-scale room, open ceiling for the camera.
 box(9,.15,8,0x8c7967,0,0,0,g);
 box(9,3,0.18,0xd7d0c2,0,0,-4,g);box(.18,3,8,0xd7d0c2,-4.5,0,0,g);box(.18,3,8,0xd7d0c2,4.5,0,0,g);
 box(9,3,.18,0xd7d0c2,0,0,4,g);
 // window
 box(2.4,1.4,.1,0x8fb8c3,-1.5,1.25,-3.9,g);
 // living room
 box(2.5,.55,1.1,0x7b6254,-1.4,.35,1,g);box(2.5,.9,.45,0x7b6254,-1.4,.7,1.35,g);
 box(1.2,.75,1.2,0x8a745f,2,.05,-.8,g);box(1.4,.08,.7,0x9a805e,2,.82,-.8,g);
 // kitchen
 box(2.8,.9,.65,0xb7b0a5,1.2,.05,-3,g);box(.9,.9,.65,0x8d9695,-.3,.05,-3,g);
 // bed
 box(2.3,.45,3,0x6c7781,-2.2,.05,-1.9,g);box(2.1,.18,.8,0xe3ded0,-2.2,.5,-3,g);
 player=adult(0x4d7187);player.position.set(0,0,2.7);worldGroup.add(player);
 companion=adult(0x777f83);companion.scale.setScalar(.9);companion.position.set(2,0,2.2);worldGroup.add(companion);
 const exit=new THREE.Object3D();exit.position.set(0,0,3.85);exit.userData.action='exit';worldGroup.add(exit);
 setMessage('Bienvenue chez toi. Tu peux marcher dans ton intérieur et l’aménager.');
}

function setMessage(t){document.getElementById('message').textContent=t}
function updateMoney(){document.getElementById('money').textContent=state.money.toLocaleString('fr-FR')}
function context(title,text,label,fn){const c=document.getElementById('context');document.getElementById('contextTitle').textContent=title;document.getElementById('contextText').textContent=text;const b=document.getElementById('contextAction');b.textContent=label;b.onclick=fn;c.classList.remove('hidden')}
function hideContext(){document.getElementById('context').classList.add('hidden')}

function enter(){if(state.inside)return;state.home=true;buildInterior();hideContext()}
function exit(){if(!state.inside)return;buildExterior();player.position.set(13,0,5);hideContext()}

function move(dt){
 if(!player)return;
 let x=0,z=0;if(keys.w||keys.ArrowUp)z-=1;if(keys.s||keys.ArrowDown)z+=1;if(keys.a||keys.ArrowLeft)x-=1;if(keys.d||keys.ArrowRight)x+=1;
 if(x||z){const len=Math.hypot(x,z);x/=len;z/=len;player.position.x+=x*dt*4.2;player.position.z+=z*dt*4.2;player.rotation.y=Math.atan2(x,z);target=null}
 if(target){const dx=target.x-player.position.x,dz=target.z-player.position.z,d=Math.hypot(dx,dz);if(d>.15){player.position.x+=dx/d*dt*3.4;player.position.z+=dz/d*dt*3.4;player.rotation.y=Math.atan2(dx,dz)}else target=null}
 player.position.x=THREE.MathUtils.clamp(player.position.x,state.inside?-3.9:-5.5,state.inside?3.9:5.5);
 player.position.z=THREE.MathUtils.clamp(player.position.z,state.inside?-3.5: -30,state.inside?3.3:30);
 if(companion){const desired=new THREE.Vector3(player.position.x+1.3,0,player.position.z+1.2);companion.position.lerp(desired,.08)}
}

let dragging=false,lastX=0,yaw=0;
canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX});
canvas.addEventListener('pointermove',e=>{if(dragging){yaw-=(e.clientX-lastX)*.004;lastX=e.clientX}});
canvas.addEventListener('pointerup',()=>dragging=false);
canvas.addEventListener('pointercancel',()=>dragging=false);
window.addEventListener('keydown',e=>{keys[e.key]=true});
window.addEventListener('keyup',e=>{keys[e.key]=false});

canvas.addEventListener('click',e=>{
 if(dragging)return;
 const r=canvas.getBoundingClientRect(),mx=(e.clientX-r.left)/r.width*2-1,my=-(e.clientY-r.top)/r.height*2+1;
 const rc=new THREE.Raycaster();rc.setFromCamera({x:mx,y:my},camera);
 const floor=rc.intersectObjects(worldGroup.children,true).find(h=>h.object.geometry?.type==='BoxGeometry');
 if(floor&&!state.inside){const p=floor.point;if(Math.abs(p.x)<6)target=new THREE.Vector3(p.x,0,p.z)}
});

function nearbyInteraction(){
 if(state.inside){if(player.position.z>2.8)context('Porte','Retourner dans la rue NOMAD.','🚪 Sortir',exit);else hideContext();return}
 const d=Math.hypot(player.position.x-13,player.position.z-6);
 if(d<2.7)context('Maison disponible','Cette maison est déjà construite. Tu peux la louer ou l’acheter, puis personnaliser son intérieur.','🏠 Entrer',enter);else hideContext();
}

document.getElementById('workBtn').onclick=()=>{state.money+=80;state.skills.tech++;updateMoney();setMessage('💼 Journée terminée. +80 N$ · Technologie +1.');};
document.getElementById('buyBtn').onclick=()=>document.getElementById('catalog').classList.remove('hidden');
document.getElementById('closeCatalog').onclick=()=>document.getElementById('catalog').classList.add('hidden');
document.getElementById('worldBtn').onclick=()=>document.getElementById('worlds').classList.remove('hidden');
document.getElementById('closeWorlds').onclick=()=>document.getElementById('worlds').classList.add('hidden');

const items=[['Chaise',5],['Table',10],['Canapé',100],['Toilettes',80],['Lavabo',150],['Douche',200],['Lit',250],['Établi',500]];
document.getElementById('items').innerHTML=items.map(([n,p])=>`<button class="item" data-p="${p}"><b>${n}</b><strong>${p} N$</strong><small>Pour ton habitat</small></button>`).join('');
document.querySelectorAll('.item').forEach(b=>b.onclick=()=>{const p=+b.dataset.p;if(state.money>=p){state.money-=p;updateMoney();setMessage('🛋️ '+b.querySelector('b').textContent+' acheté. On pourra le placer dans ton logement.')}else setMessage('💰 Pas assez de N$.')});

const worlds=['Terre','Mer','Montagne','Campagne','Lune','Mars','Espace'];
document.getElementById('worldList').innerHTML=worlds.map(w=>`<button class="worldItem" data-w="${w}"><b>${w}</b><small>Une ville NOMAD existe déjà ici.</small></button>`).join('');
document.querySelectorAll('.worldItem').forEach(b=>b.onclick=()=>{state.world=b.dataset.w;document.getElementById('worlds').classList.add('hidden');buildExterior()});

function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);

function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);move(dt);nearbyInteraction();
 if(player){const back=new THREE.Vector3(0,1.45,3.8);back.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const desired=player.position.clone().add(back);camera.position.lerp(desired,.12);const look=player.position.clone().add(new THREE.Vector3(0,1.1,0));camera.lookAt(look)}
 renderer.render(scene,camera)}
resize();buildExterior();loop();