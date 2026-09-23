import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const $=id=>document.getElementById(id);
const KEY='nomadLife3D_v2';
const base={avatar:null,bot:null,money:1000000,materials:100,free:false,unlocked:false,house:null,business:null,mode:'life',inside:false,needs:75};
let s=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(base);

const canvas=$('world');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9fc7e8);
scene.fog=new THREE.Fog(0x9fc7e8,45,150);

const camera=new THREE.PerspectiveCamera(55,1,.1,300);
const clock=new THREE.Clock();
const world=new THREE.Group();scene.add(world);

const hemi=new THREE.HemisphereLight(0xddefff,0x5b6c52,2.2);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1cf,2.4);sun.position.set(-35,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

function mat(color){return new THREE.MeshStandardMaterial({color,roughness:.78})}
const M={grass:mat(0x75a15f),road:mat(0x3e464b),side:mat(0xc4bba7),house:mat(0xe9d8bd),roof:mat(0x6e4e42),glass:mat(0x79a9bd),wood:mat(0x8d674a),white:mat(0xf1f1ea),green:mat(0x4e824f),water:mat(0x4d9fbe),brick:mat(0xa76c55),yellow:mat(0xd9b43d),dark:mat(0x20272b),flower:mat(0xd56b86)};

function box(name,x,y,z,w,h,d,material=M.house,cast=true){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.name=name;m.position.set(x,y+h/2,z);m.castShadow=cast;m.receiveShadow=true;world.add(m);return m;
}
function cyl(name,x,y,z,r,h,material=M.green){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),material);m.name=name;m.position.set(x,y+h/2,z);m.castShadow=true;world.add(m);return m;
}
function label(text,x,y,z,size=1){
 const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.clearRect(0,0,512,128);g.font='bold 48px sans-serif';g.fillStyle='white';g.textAlign='center';g.fillText(text,256,72);
 const t=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));sp.scale.set(size*3.8,size,.1);sp.position.set(x,y,z);world.add(sp);return sp;
}
function tree(x,z){cyl('trunk',x,0,z,.22,1.6,M.wood);cyl('crown',x,1.3,z,.95,1.7,M.green)}
function road(x,z,w,d){box('road',x,.01,z,w,.04,d,M.road,false)}
function sidewalk(x,z,w,d){box('sidewalk',x,.03,z,w,.08,d,M.side,false)}

function buildBaseWorld(){
 box('ground',0,-.15,0,140,.3,100,M.grass,false);
 road(0,0,140,9);road(0,-25,140,6);road(-45,0,6,100);road(45,0,6,100);
 sidewalk(0,5,140,2);sidewalk(0,-5,140,2);sidewalk(-41,0,2,100);sidewalk(41,0,2,100);
 box('pond',23,.01,-29,25,.06,14,M.water,false);
 // NOMAD principal
 box('hub',0,2,22,16,4,10,M.white);label('NOMAD PRINCIPAL',0,8,22,1.1);
 box('clinic',-24,1.8,18,10,3.6,7,M.white);label('CLINIQUE',-24,6,18,.7);
 box('market',24,1.8,18,10,3.6,7,M.yellow);label('MARCHÉ',24,6,18,.7);
 box('school',-24,1.8,-18,12,3.6,8,M.brick);label('ÉCOLE',-24,6,-18,.7);
 box('workshop',24,1.8,-18,12,3.6,8,M.wood);label('ATELIER',24,6,-18,.7);
 box('pool',-10,.08,-28,16,.16,7,M.water,false);
 for(let x=-36;x<=36;x+=9){tree(x,34);tree(x,-34)}
 for(let z=-18;z<=18;z+=9){tree(-58,z);tree(58,z)}
 // neighborhood homes
 const homes=[[-34,-5,'MAISON'],[-20,-5,'MAISON'],[20,-5,'MAISON'],[34,-5,'MAISON'],[-34,10,'MAISON'],[34,10,'MAISON']];
 homes.forEach(([x,z,n])=>{box(n,x,0,z,9,3.2,7,M.house);box('roof',x,3.2,z,9,.5,7,M.roof);});
 label('TON QUARTIER',0,5,-9,1);
 // shops
 box('shopA',55,0,-5,11,4,8,M.yellow);label('BOUTIQUE',55,6,-5,.65);
 box('shopB',55,0,10,11,4,8,M.brick);label('RESTAURANT',55,6,10,.65);
}
buildBaseWorld();

const avatar=new THREE.Group();
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.05,6,12),mat(0x4d79a8));body.position.y=1.05;body.castShadow=true;avatar.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),mat(0xf0c5a4));head.position.y=1.9;head.castShadow=true;avatar.add(head);
const bot=new THREE.Group();const botBody=new THREE.Mesh(new THREE.CapsuleGeometry(.32,1.0,6,12),mat(0xb8c4ca));botBody.position.y=1;botBody.castShadow=true;bot.add(botBody);const botHead=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),M.dark);botHead.position.y=1.75;botHead.castShadow=true;bot.add(botHead);bot.position.set(1.5,0,1);world.add(bot);
world.add(avatar);

let target=new THREE.Vector3(-5,0,5);
avatar.position.copy(target);
let keys={};

function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();

function makePlayerHouse(){
 if(!s.house)return;
 const g=new THREE.Group();g.name='playerHouse';g.position.set(-5,0,5);world.add(g);
 // floor and four walls with a front opening
 const w=s.house.rooms*4+5,d=7;
 const floor=new THREE.Mesh(new THREE.BoxGeometry(w,.15,d),M.wood);floor.position.y=.08;floor.receiveShadow=true;g.add(floor);
 const wallH=3.2;
 const back=new THREE.Mesh(new THREE.BoxGeometry(w,wallH,.22),M.house);back.position.set(0,wallH/2,-d/2);back.castShadow=true;g.add(back);
 const left=new THREE.Mesh(new THREE.BoxGeometry(.22,wallH,d),M.house);left.position.set(-w/2,wallH/2,0);left.castShadow=true;g.add(left);
 const right=new THREE.Mesh(new THREE.BoxGeometry(.22,wallH,d),M.house);right.position.set(w/2,wallH/2,0);right.castShadow=true;g.add(right);
 const frontL=new THREE.Mesh(new THREE.BoxGeometry(w*.43,wallH,.22),M.house);frontL.position.set(-w*.285,wallH/2,d/2);g.add(frontL);
 const frontR=frontL.clone();frontR.position.x=w*.285;g.add(frontR);
 const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.4,.25,d+.4),M.roof);roof.position.y=s.house.floors*3.2+.2;g.add(roof);
 for(let i=0;i<s.house.furniture;i++){const f=box('furniture',-w/2+1+(i%5)*1.3,.1,-1+(Math.floor(i/5))*1.5,.9,.8,.7,i%2?M.wood:M.white);f.position.x+=-5;f.position.z+=5; }
 if(s.house.floors>1){const upper=box('upper',-5,3.2,5,w,3.0,d,M.house);upper.material=M.house;upper.castShadow=true}
 if(s.house.basements>0){for(let i=0;i<s.house.basements;i++){const b=box('basement',-5,-(i+1)*2.5,5,w,.18,d,M.dark,false);b.position.y=-(i+1)*2.5}}
}

function refreshHouse(){world.children.filter(o=>o.name==='playerHouse'||o.name==='furniture'||o.name==='upper'||o.name==='basement').forEach(o=>world.remove(o));makePlayerHouse();}

function updateUI(){
 $('avatarLabel').textContent=s.avatar?.name||'Nomad';$('botLabel').textContent=s.bot?.name||'Humanoïde';
 $('money').textContent=s.money.toLocaleString('fr-FR');$('mat').textContent=s.materials;
 $('status').textContent=s.inside?'À la maison':'Mode Vie';
 $('houseInfo').textContent=s.house?(`Maison construite • ${s.house.rooms} pièce(s) • ${s.house.floors} niveau(x) • ${s.house.basements} sous-sol(s) • ${s.house.furniture} meuble(s)`):'Pas encore de maison — tu peux construire ou acheter.';
 $('jobInfo').textContent=s.business?(`Propriétaire de ${s.business.name} • ${s.business.open?'ouverte':'fermée'} • ${s.business.employees} employé(s)`):'Sans activité pour le moment.';
 $('businessInfo').textContent=s.business?(`${s.business.name} • ${s.business.open?'OUVERTE':'FERMÉE'} • ${s.business.employees} employé(s)`):'Crée ta boutique, choisis son activité et travaille dedans.';
}

function say(t){$('hint').textContent=t}
function save(){localStorage.setItem(KEY,JSON.stringify(s))}
function start(){s.avatar={name:$('avatarName').value.trim()||'Nomad'};s.bot={name:$('botName').value.trim()||'JERVIS'};save();$('creator').classList.add('hidden');updateUI();say('Bienvenue dans NOMAD. Tu es réellement dans le quartier.')}
if(s.avatar&&s.bot)$('creator').classList.add('hidden');$('start').onclick=start;

function build(type){
 if(type==='room'){s.house=s.house||{rooms:1,floors:1,basements:0,furniture:2};s.house.rooms++;s.materials=s.free?s.materials:Math.max(0,s.materials-15);say('🧱 Une vraie pièce vient d’être ajoutée à ta maison.');}
 if(type==='floor'){s.house=s.house||{rooms:1,floors:1,basements:0,furniture:2};if(s.house.floors<6)s.house.floors++;s.materials=s.free?s.materials:Math.max(0,s.materials-30);say('⬆️ Un niveau supplémentaire est construit.');}
 if(type==='basement'){s.house=s.house||{rooms:1,floors:1,basements:0,furniture:2};if(s.house.basements<4)s.house.basements++;s.materials=s.free?s.materials:Math.max(0,s.materials-35);say('⬇️ Un sous-sol est creusé sous la maison.');}
 if(type==='furniture'){if(!s.house){say('Construis ou achète d’abord une maison.');return}s.house.furniture++;s.money=s.free?s.money:Math.max(0,s.money-500);say('🛋️ Tu aménages réellement ton intérieur.');}
 if(type==='shop'){if(!s.business)s.business={name:'Ma Boutique NOMAD',open:false,employees:0};say('🏪 Ta boutique existe maintenant dans le monde.');}
 refreshHouse();save();updateUI();
}
document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>build(b.dataset.build));
$('build').onclick=()=>{$('buildPanel').classList.toggle('hidden');$('businessPanel').classList.add('hidden');$('cheatPanel').classList.add('hidden')};
$('closeBuild').onclick=()=>{$('buildPanel').classList.add('hidden');say('Retour au mode Vie.');};
$('business').onclick=()=>{$('businessPanel').classList.toggle('hidden');$('buildPanel').classList.add('hidden');$('cheatPanel').classList.add('hidden')};
$('closeBusiness').onclick=()=>$('businessPanel').classList.add('hidden');
$('cheat').onclick=()=>{$('cheatPanel').classList.toggle('hidden');$('buildPanel').classList.add('hidden');$('businessPanel').classList.add('hidden')};

$('openShop').onclick=()=>{s.business=s.business||{name:'Ma Boutique NOMAD',open:false,employees:0};s.business.open=!s.business.open;save();updateUI();say(s.business.open?'🏪 Boutique ouverte ! Tu peux y travailler.':'🏪 Boutique fermée.');};
$('hire').onclick=()=>{if(!s.business){say('Crée d’abord ta boutique.');return}if(s.money>=5000||s.free){if(!s.free)s.money-=5000;s.business.employees++;save();updateUI();say('👥 Un employé rejoint ton équipe.');}else say('💰 Il faut 5 000 NOMAD pour embaucher.');};
$('work').onclick=()=>{if(!s.business){say('Tu peux d’abord créer ton propre commerce.');return}if(!s.business.open){say('Ouvre ta boutique avant de travailler.');return}s.money+=250;s.needs=Math.max(0,s.needs-5);save();updateUI();say('🧑‍🔧 Journée de travail terminée : +250 NOMAD.');};

$('buyHouse').onclick=()=>{if(s.house){say('Tu as déjà une maison.');return}if(s.money<150000&&!s.free){say('Cette maison coûte 150 000 NOMAD.');return}if(!s.free)s.money-=150000;s.house={rooms:3,floors:1,basements:0,furniture:8};refreshHouse();save();updateUI();say('🏠 Maison existante achetée. Maintenant, transforme-la comme tu veux.');};
$('enter').onclick=()=>{if(!s.house){say('Pas encore de maison.');return}s.inside=!s.inside;s.mode=s.inside?'inside':'life';updateUI();say(s.inside?'🚪 Tu es à l’intérieur. Observe ton espace de vie.':'🚪 Tu sors dans le quartier.');};

document.querySelectorAll('[data-cheat]').forEach(b=>b.onclick=()=>{const x=b.dataset.cheat;if(x==='money')s.money+=1000000000;if(x==='materials')s.materials+=9999;if(x==='free')s.free=!s.free;if(x==='unlock')s.unlocked=true;if(x==='needs')s.needs=100;save();updateUI();say('🧪 Code NOMAD activé. Tu choisis ton style de jeu.');});
$('voice').onclick=()=>say('🎙️ Petite Voix : Je ne décide pas à ta place. Je regarde simplement ce que tu fabriques… et je prends des notes.');
$('save').onclick=()=>{save();say('💾 Vie NOMAD sauvegardée sur cet appareil.');};
$('reset').onclick=()=>{if(confirm('Recommencer cette vie NOMAD ?')){localStorage.removeItem(KEY);location.reload()}};

function move(){
 const speed=6*clock.getDelta();
 let dx=0,dz=0;
 if(keys.ArrowUp||keys.z||keys.w)dz-=1;if(keys.ArrowDown||keys.s)dz+=1;if(keys.ArrowLeft||keys.q||keys.a)dx-=1;if(keys.ArrowRight||keys.d)dx+=1;
 if(dx||dz){const len=Math.hypot(dx,dz);dx/=len;dz/=len;target.x+=dx*speed;target.z+=dz*speed;target.x=THREE.MathUtils.clamp(target.x,-62,62);target.z=THREE.MathUtils.clamp(target.z,-43,43);avatar.rotation.y=Math.atan2(dx,dz);}
 avatar.position.lerp(target,.35);
}
addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;keys[e.key]=true});
addEventListener('keyup',e=>keys[e.key]=false);
document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=()=>{const d=b.dataset.move;keys[d==='up'?'ArrowUp':d==='down'?'ArrowDown':d==='left'?'ArrowLeft':'ArrowRight']=true};b.onpointerup=b.onpointercancel=()=>{keys={}}});

function cameraFollow(){
 if(s.inside&&s.house){
  camera.position.lerp(new THREE.Vector3(-5,4,12),.08);
  camera.lookAt(-5,1.3,5);
 }else{
  const desired=new THREE.Vector3(avatar.position.x+9,7.5,avatar.position.z+11);
  camera.position.lerp(desired,.08);camera.lookAt(avatar.position.x,1.2,avatar.position.z);
 }
}
function animate(){requestAnimationFrame(animate);move();cameraFollow();bot.position.x+=Math.sin(Date.now()/1800)*.002;renderer.render(scene,camera)}
refreshHouse();updateUI();animate();
