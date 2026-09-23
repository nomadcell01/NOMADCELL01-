import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.getElementById('gameCanvas');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,1,.05,100);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;
scene.add(new THREE.HemisphereLight(0xe9f4ff,0x59664e,2.2));
const sun=new THREE.DirectionalLight(0xffedcf,2.6);sun.position.set(-15,25,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const worlds={
 Terre:{sky:0x9dbfd0,ground:0x718d64},Mer:{sky:0x71aabd,ground:0x3d737b},
 Montagne:{sky:0xa9b8bf,ground:0x68736f},Campagne:{sky:0xa9c98e,ground:0x789956},
 Lune:{sky:0x252b36,ground:0x777a7d},Mars:{sky:0x87564c,ground:0x9b604f},
 Espace:{sky:0x080d1d,ground:0x343b49}
};
const state={world:'Terre',money:1000,home:false,inside:false,needs:{energie:78,faim:84,humeur:92},skills:{bricolage:1,robotique:1,tech:1}};
let group=new THREE.Group();scene.add(group),player,companion,target=null,homeDoor;
const keys={},clock=new THREE.Clock();let yaw=0,drag=false,lastX=0;

function mat(c){return new THREE.MeshStandardMaterial({color:c,roughness:.75})}
function add(g,c,x,y,z,parent=group){const o=new THREE.Mesh(g,mat(c));o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o}
function box(w,h,d,c,x,y,z,parent=group){return add(new THREE.BoxGeometry(w,h,d),c,x,y+h/2,z,parent)}
function capsule(c,x,y,z,parent=group){return add(new THREE.CapsuleGeometry(.28,.72,5,10),c,x,y,z,parent)}
function character(clothes=0x496b82){
 const g=new THREE.Group();
 capsule(clothes,0,1.02,0,g);
 add(new THREE.SphereGeometry(.29,16,12),0xc98f6f,0,1.82,0,g);
 add(new THREE.SphereGeometry(.3,16,8,0,Math.PI*2,0,Math.PI*.48),0x49382f,0,1.96,0,g);
 box(.18,.65,.2,0x30383d,-.13,.05,0,g);box(.18,.65,.2,0x30383d,.13,.05,0,g);
 box(.22,.08,.4,0x22282b,-.13,.02,.04,g);box(.22,.08,.4,0x22282b,.13,.02,.04,g);
 return g;
}
function tree(x,z){box(.3,1.7,.3,0x5b4939,x,.0,z);add(new THREE.SphereGeometry(1.15,14,10),0x416b48,x,2.35,z)}
function street(){
 box(12,.08,70,0x55595a,0,0,0);box(2.4,.1,70,0xb5ad94,-7.2,0,0);box(2.4,.1,70,0xb5ad94,7.2,0);
 for(let z=-30;z<=30;z+=6)box(2.6,.025,.08,0xe8ddad,0,.11,z);
 for(let z=-28;z<=28;z+=9){box(.12,3.2,.12,0x303a3e,-8.2,0,z);add(new THREE.SphereGeometry(.13,10,8),0xe9dfb7,-8.2,3.3,z)}
}
function house(x,z,paint){
 const g=new THREE.Group();group.add(g);
 box(7,3.2,5.5,paint,x,0,z,g);box(7.3,.28,5.8,0x614b46,x,3.2,z,g);
 box(1.05,2,.18,0x4b3d38,x,0,z-2.84,g);
 for(const dx of [-2,2]){box(1.05,1.05,.14,0x9ccbd2,x+dx,1.35,z-2.85,g);box(.08,1,.16,0x52666a,x+dx,1.35,z-2.94,g)}
 box(1.2,.12,.12,0xcebfa4,x,3.72,z-2.93,g);
 return g;
}
function shop(x,z){
 const g=new THREE.Group();group.add(g);box(7,3.7,5,0xc6d0d0,x,0,z,g);box(7.1,1.1,.18,0x31474e,x,2,z-2.6,g);
 box(5.7,1.75,.12,0xa7d0d4,x,1.05,z-2.72,g);
}
function npc(x,z,c){const n=character(c);n.position.set(x,0,z);group.add(n);return n}

function clear(){while(group.children.length)group.remove(group.children[0]);homeDoor=null}
function buildStreet(){
 clear();state.inside=false;
 const [sky,ground]=[worlds[state.world].sky,worlds[state.world].ground];scene.background.set(sky);scene.fog=new THREE.Fog(sky,32,80);
 box(70,.25,70,ground,0,-.3,0);street();
 house(-13,-8,0xd9c6a9);house(13,-8,0xc7d5d8);house(-13,9,0xd7c2a6);house(13,9,0xd0d7c8);shop(-13,21);
 for(const z of [-23,-13,-3,7,17,27]){tree(-9,z);tree(9,z)}
 npc(-3,-11,0x5d7890);npc(4,-6,0x846b58);npc(-3,8,0x647a63);npc(4,18,0x795f75);
 player=character(0x4c718c);player.position.set(0,0,15);group.add(player);
 companion=character(0x777f83);companion.scale.setScalar(.92);companion.position.set(1.7,0,16.5);group.add(companion);
 homeDoor=new THREE.Object3D();homeDoor.position.set(13,0,6.15);group.add(homeDoor);
 document.getElementById('worldName').textContent='NOMAD '+state.world.toUpperCase();
 message('Tu vis maintenant dans NOMAD '+state.world+'. La ville est déjà là : tu construis ta propre vie.');
 document.getElementById('loading').classList.add('done');
}
function buildHome(){
 clear();state.inside=true;scene.background.set(0xb5b1a8);scene.fog=null;
 const room=new THREE.Group();group.add(room);
 box(9,.12,8,0x8d7a67,0,0,0,room);
 box(9,3,.16,0xd8d0c3,0,0,-4,room);box(.16,3,8,0xd8d0c3,-4.5,0,0,room);box(.16,3,8,0xd8d0c3,4.5,0,0,room);box(9,3,.16,0xd8d0c3,0,0,4,room);
 box(2.5,1.4,.1,0x91bdc4,-1.4,1.25,-3.9,room);
 box(2.6,.55,1.1,0x765d50,-1.35,.35,1.1,room);box(2.6,.85,.4,0x765d50,-1.35,.68,1.55,room);
 box(1.25,.7,1.15,0x8d765b,2.1,.05,-.8,room);box(1.4,.08,.7,0xa58b67,2.1,.82,-.8,room);
 box(3,.9,.65,0xb8b2a9,1.1,.05,-3,room);box(.85,.9,.65,0x899493,-.45,.05,-3,room);
 box(2.3,.45,3,0x65737d,-2.2,.05,-1.9,room);box(2.1,.18,.8,0xe2ddd1,-2.2,.5,-3,room);
 player=character(0x4c718c);player.position.set(0,0,2.65);group.add(player);
 companion=character(0x777f83);companion.scale.setScalar(.92);companion.position.set(2,0,2.1);group.add(companion);
 message('🏠 Chez toi. Marche dans la maison, achète des meubles et fais évoluer ton habitat.');
}
function message(t){document.getElementById('message').textContent=t}
function money(){document.getElementById('money').textContent=state.money.toLocaleString('fr-FR')}
function context(title,text,label,fn){const c=document.getElementById('context');document.getElementById('contextTitle').textContent=title;document.getElementById('contextText').textContent=text;const b=document.getElementById('contextAction');b.textContent=label;b.onclick=fn;c.classList.remove('hidden')}
function hideContext(){document.getElementById('context').classList.add('hidden')}
function enter(){state.home=true;buildHome();hideContext()}
function exit(){buildStreet();player.position.set(13,0,5);hideContext()}

function move(dt){
 if(!player)return;
 let x=0,z=0;
 if(keys.w||keys.ArrowUp)z-=1;if(keys.s||keys.ArrowDown)z+=1;if(keys.a||keys.ArrowLeft)x-=1;if(keys.d||keys.ArrowRight)x+=1;
 if(x||z){const l=Math.hypot(x,z);x/=l;z/=l;player.position.x+=x*dt*4.1;player.position.z+=z*dt*4.1;player.rotation.y=Math.atan2(x,z)}
 if(target){const dx=target.x-player.position.x,dz=target.z-player.position.z,d=Math.hypot(dx,dz);if(d>.12){player.position.x+=dx/d*dt*3.2;player.position.z+=dz/d*dt*3.2;player.rotation.y=Math.atan2(dx,dz)}else target=null}
 const minX=state.inside?-3.9:-5.5,maxX=state.inside?3.9:5.5,minZ=state.inside?-3.45:-30,maxZ=state.inside?3.25:30;
 player.position.x=THREE.MathUtils.clamp(player.position.x,minX,maxX);player.position.z=THREE.MathUtils.clamp(player.position.z,minZ,maxZ);
 if(companion)companion.position.lerp(new THREE.Vector3(player.position.x+1.25,0,player.position.z+1.1),.09);
}
function interaction(){
 if(state.inside){if(player.position.z>2.7)context('Porte','Tu peux retourner dans la rue.','🚪 Sortir',exit);else hideContext();return}
 const d=Math.hypot(player.position.x-13,player.position.z-6);
 if(d<2.5)context('Maison','Maison déjà construite. Tu peux y vivre et personnaliser l’intérieur.','🏠 Habiter',enter);else hideContext();
}
function tapMove(e){
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*2-1,y=-(e.clientY-r.top)/r.height*2+1;
 const rc=new THREE.Raycaster();rc.setFromCamera({x,y},camera);
 const hits=rc.intersectObjects(group.children,true);
 const h=hits.find(v=>v.object.geometry&&v.object.position.y<.3);
 if(h){target=new THREE.Vector3(h.point.x,0,h.point.z)}
}
canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX});
canvas.addEventListener('pointermove',e=>{if(drag&&Math.abs(e.clientX-lastX)>2){yaw-=(e.clientX-lastX)*.004;lastX=e.clientX}});
canvas.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-lastX)<5)tapMove(e);drag=false});
canvas.addEventListener('pointercancel',()=>drag=false);
window.addEventListener('keydown',e=>keys[e.key]=true);window.addEventListener('keyup',e=>keys[e.key]=false);

document.getElementById('workBtn').onclick=()=>{state.money+=80;state.skills.tech++;state.needs.energie=Math.max(20,state.needs.energie-12);money();message('💼 Travail terminé : +80 N$. Technologie +1.');};
document.getElementById('buyBtn').onclick=()=>document.getElementById('catalog').classList.remove('hidden');
document.getElementById('closeCatalog').onclick=()=>document.getElementById('catalog').classList.add('hidden');
document.getElementById('worldBtn').onclick=()=>document.getElementById('worlds').classList.remove('hidden');
document.getElementById('closeWorlds').onclick=()=>document.getElementById('worlds').classList.add('hidden');
const items=[['Chaise',5],['Table',10],['Canapé',100],['Toilettes',80],['Lavabo',150],['Douche',200],['Lit',250],['Établi',500]];
document.getElementById('items').innerHTML=items.map(([n,p])=>`<button class="item" data-p="${p}"><b>${n}</b><strong>${p} N$</strong><small>Acheter pour ton logement</small></button>`).join('');
document.querySelectorAll('.item').forEach(b=>b.onclick=()=>{const p=+b.dataset.p;if(state.money>=p){state.money-=p;money();message('🛋️ '+b.querySelector('b').textContent+' acheté.');}else message('💰 Pas assez de N$.')});
const worldNames=Object.keys(worlds);
document.getElementById('worldList').innerHTML=worldNames.map(w=>`<button class="worldItem" data-w="${w}"><b>${w}</b><small>Ville NOMAD déjà construite et habitée.</small></button>`).join('');
document.querySelectorAll('.worldItem').forEach(b=>b.onclick=()=>{state.world=b.dataset.w;document.getElementById('worlds').classList.add('hidden');buildStreet()});

function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);move(dt);interaction();
 if(player){const off=new THREE.Vector3(0,1.55,3.6);off.applyAxisAngle(new THREE.Vector3(0,1,0),yaw);camera.position.lerp(player.position.clone().add(off),.14);camera.lookAt(player.position.clone().add(new THREE.Vector3(0,1.15,0)))}renderer.render(scene,camera)}
resize();buildStreet();loop();