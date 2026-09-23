import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';

const canvas=document.getElementById('gameCanvas'),loading=document.getElementById('loading');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x8fb8cf); scene.fog=new THREE.Fog(0x8fb8cf,45,125);
const camera=new THREE.PerspectiveCamera(55,1,.1,250); camera.position.set(16,14,20);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,canvas); controls.enableDamping=true; controls.target.set(0,0,0); controls.minDistance=8; controls.maxDistance=42; controls.maxPolarAngle=Math.PI/2.15;
scene.add(new THREE.HemisphereLight(0xdcefff,0x60705b,2.2));
const sun=new THREE.DirectionalLight(0xfff0d2,3); sun.position.set(-20,35,12); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);

const state={world:'Terre',money:1000,home:null,mood:'Bien',skills:{bricolage:1,robotique:1,tech:1,agri:1}};
const worlds={Terre:{sky:0x8fb8cf,ground:0x779865,accent:0x879a68},Mer:{sky:0x6da6bd,ground:0x356b7b,accent:0x78b6b9},Montagne:{sky:0x91a6b5,ground:0x65736b,accent:0x7c8580},Campagne:{sky:0xa6c88c,ground:0x799b55,accent:0xa7bb73},Lune:{sky:0x252a35,ground:0x777a7d,accent:0x9aa0a4},Mars:{sky:0x7e4f48,ground:0x9b5f4e,accent:0xb46e57},Espace:{sky:0x070b18,ground:0x343b48,accent:0x7887a4}};
let terrain,player,bot,buildings=[],freePlots=[],npcs=[],raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),target=null,worldGroup=new THREE.Group();scene.add(worldGroup);

function mat(c){return new THREE.MeshStandardMaterial({color:c,roughness:.8})}
function box(w,h,d,c,x,y,z){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;worldGroup.add(m);return m}
function tree(x,z){let t=box(.35,2,.35,0x684d36,x,0,z);let crown=new THREE.Mesh(new THREE.SphereGeometry(1.45,14,10),mat(0x456b46));crown.position.set(x,2.5,z);crown.castShadow=true;worldGroup.add(crown)}
function house(x,z,c=0xd8c6a8,large=false){let w=large?6:4.7,d=large?5.5:4.3;box(w,2.8,d,c,x,0,z);let roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,2.1,4),mat(0x684e48));roof.rotation.y=Math.PI/4;roof.position.set(x,4,z);roof.castShadow=true;worldGroup.add(roof);box(.8,1.7,.12,0x58463b,x,0,z-d/2-.08);box(.9,.9,.1,0x9bc8d0,x-w*.29,1.15,z-d/2-.1);box(.9,.9,.1,0x9bc8d0,x+w*.29,1.15,z-d/2-.1)}
function building(x,z,w,d,h,c){box(w,h,d,c,x,0,z);for(let i=0;i<3;i++)for(let j=0;j<2;j++)box(.8,.65,.08,0x9dc6cf,x-w*.28+i*w*.28,1.1+j*1.15,z-d/2-.06)}
function person(x,z,c=0x55738a,scale=1){let g=new THREE.Group();let body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.9,4,8),mat(c));body.position.y=1;body.castShadow=true;g.add(body);let head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,10),mat(0xd3a27c));head.position.y=1.85;head.castShadow=true;g.add(head);g.position.set(x,0,z);g.scale.setScalar(scale);worldGroup.add(g);return g}
function makeCity(){worldGroup.clear();buildings=[];freePlots=[];npcs=[]; const w=worlds[state.world];scene.background.set(w.sky);scene.fog.color.set(w.sky);
terrain=box(86,.3,86,w.ground,0,-.3,0);
box(10,.12,86,0x51565a,-25,0,0);box(10,.12,86,0x51565a,25,0,0);box(86,.12,10,0x51565a,0,0,-25);box(86,.12,10,0x51565a,0,0,25);
box(5,.13,86,0x9a9885,-5,0,0);box(5,.13,86,0x9a9885,5,0,0);box(86,.13,5,0x9a9885,0,0,-5);box(86,.13,5,0x9a9885,0,0,5);
building(0,-1,9,7,5,0xd9dde0);building(-12,-12,7,6,4,0xd5c9ae);building(13,-12,7,6,4,0xd5c9ae);
house(-14,2,0xd7c1a4);house(-14,12,0xc8d5d8);house(14,12,0xd7c1a4,true);house(15,2,0xe0c6a5);
house(-23,12,0xc7d0bb);house(23,12,0xc9d0d8);house(-23,21,0xd9c4a7);house(23,21,0xd7c8b2);
building(18,-2,7,6,4,0xb9c7c9);building(-18,-2,7,6,4,0xc8c2b4);
for(let i=-35;i<=35;i+=9){tree(i,30);tree(i,-30)}for(let i=-27;i<=27;i+=9){tree(30,i);tree(-30,i)}
for(let i=0;i<10;i++)npcs.push(person(-24+Math.random()*48,-20+Math.random()*40, [0x5c7181,0x8b6955,0x667c5d,0x7c5d75][i%4],.9));
freePlots.push({x:28,z:-13});freePlots.push({x:27,z:4});freePlots.push({x:-27,z:4});
for(const p of freePlots){let g=box(7,.05,6,0xa9b27b,p.x,.02,p.z);g.material.transparent=true;g.material.opacity=.45;g.userData.plot=true}
player=person(2,7,0x536f8d,1.05);player.userData.player=true;bot=person(4,9,0x727c83,.9);bot.userData.bot=true;
loading.classList.add('done'); document.getElementById('worldName').textContent='NOMAD '+state.world.toUpperCase();}

function moveTo(x,z){target=new THREE.Vector3(x,0,z);showMsg('🚶 Tu te déplaces dans la ville. T.H.E.O. te suit.')}
function showMsg(t){document.getElementById('message').textContent=t}
function interactPlot(p){state.home={x:p.x,z:p.z};state.money=Math.max(0,state.money-250);document.getElementById('money').textContent=state.money.toLocaleString('fr-FR');document.getElementById('homeStatus').textContent='Terrain réservé';showMsg('🏡 Terrain réservé. Tu peux maintenant construire et aménager ton propre habitat.');hideInteraction()}
function hideInteraction(){document.getElementById('interaction').classList.remove('show')}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(worldGroup.children,true);const plot=hits.find(h=>h.object.userData.plot);if(plot){const p=freePlots.find(q=>Math.abs(q.x-plot.object.position.x)<.1&&Math.abs(q.z-plot.object.position.z)<.1);if(p){target=null;document.getElementById('interactionTitle').textContent='Terrain libre';document.getElementById('interactionText').textContent='Tu peux acheter ce terrain et construire ta maison.';const b=document.getElementById('interactionAction');b.textContent='🏡 Acheter · 250 N$';b.onclick=()=>interactPlot(p);document.getElementById('interaction').classList.add('show');return}}const groundHit=hits.find(h=>h.object===terrain);if(groundHit)moveTo(groundHit.point.x,groundHit.point.z)});
function worldList(){const box=document.getElementById('worldList');box.innerHTML=Object.keys(worlds).map(w=>'<button class="worldItem" data-w="'+w+'"><b>'+({Terre:'🌍',Mer:'🌊',Montagne:'⛰️',Campagne:'🌾',Lune:'🌙',Mars:'🔴',Espace:'🛰️'}[w])+' '+w+'</b><small>Ville NOMAD déjà construite et habitée.</small></button>').join('');box.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{state.world=b.dataset.w;state.home=null;makeCity();document.getElementById('worlds').classList.add('hidden');showMsg('Bienvenue dans '+state.world+'. La ville était déjà là : tu viens simplement t’y greffer.');})}
const catalog=[['Chaise',5,'🪑'],['Table',10,'🪵'],['Canapé',100,'🛋️'],['Toilettes',80,'🚽'],['Lavabo',150,'🚰'],['Douche',200,'🚿'],['Lit',250,'🛏️'],['Établi',500,'🔧'],['Atelier robotique',1500,'🤖'],['Laboratoire',3000,'🧪']];
document.getElementById('items').innerHTML=catalog.map(x=>'<button class="item" data-price="'+x[1]+'" type="button">'+x[2]+' <b>'+x[0]+'</b><strong>'+x[1]+' N$</strong><small>Acheter et placer dans ton logement</small></button>').join('');
document.querySelectorAll('.item').forEach(b=>b.onclick=()=>{const p=Number(b.dataset.price);if(state.money>=p){state.money-=p;document.getElementById('money').textContent=state.money.toLocaleString('fr-FR');showMsg('🛋️ '+b.querySelector('b').textContent+' acheté. Il pourra être placé dans ton habitat.')}else showMsg('💰 Pas assez de N$.')});
document.getElementById('catalogBtn').onclick=()=>document.getElementById('catalog').classList.remove('hidden');document.getElementById('closeCatalog').onclick=()=>document.getElementById('catalog').classList.add('hidden');
document.getElementById('worldBtn').onclick=()=>document.getElementById('worlds').classList.remove('hidden');document.getElementById('closeWorlds').onclick=()=>document.getElementById('worlds').classList.add('hidden');
document.getElementById('workBtn').onclick=()=>{state.money+=80;document.getElementById('money').textContent=state.money.toLocaleString('fr-FR');state.skills.tech++;showMsg('💼 Journée de travail terminée. +80 N$ · Technologie +1');};
document.getElementById('homeBtn').onclick=()=>{if(state.home){moveTo(state.home.x,state.home.z)}else showMsg('🏠 Choisis d’abord un logement ou un terrain libre.')};
document.getElementById('reset').onclick=()=>location.reload();
worldList();makeCity();
function animate(){requestAnimationFrame(animate);if(target&&player){const dx=target.x-player.position.x,dz=target.z-player.position.z;const d=Math.hypot(dx,dz);if(d>.18){player.position.x+=dx*.045;player.position.z+=dz*.045;bot.position.x+=(player.position.x+2-bot.position.x)*.035;bot.position.z+=(player.position.z+2-bot.position.z)*.035;player.rotation.y=Math.atan2(dx,dz);bot.rotation.y=Math.atan2(dx,dz)}else target=null}npcs.forEach((n,i)=>{n.position.x+=Math.sin(Date.now()*.00035+i)*.003;n.position.z+=Math.cos(Date.now()*.00027+i)*.003});controls.update();renderer.render(scene,camera)}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);resize();animate();