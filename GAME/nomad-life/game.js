(()=>{'use strict';
const load=document.getElementById('loading'),game=document.getElementById('game');
if(typeof THREE==='undefined'){load.textContent='Le moteur 3D n’a pas pu être chargé.';return}

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9fc7d9);
scene.fog=new THREE.Fog(0x9fc7d9,55,180);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,260);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.insertBefore(renderer.domElement,document.body.firstChild);
scene.add(new THREE.HemisphereLight(0xf7fbff,0x66736b,2.1));
const sun=new THREE.DirectionalLight(0xfff1d0,3.2);sun.position.set(-25,40,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const mat=(c,r=.7,transparent=false)=>new THREE.MeshStandardMaterial({color:c,roughness:r,transparent,opacity:transparent?.55:1});
const grass=mat(0x76a86d),road=mat(0x555b5b),sidewalk=mat(0xb9b5a8),white=mat(0xf2eee3),wood=mat(0x8d6345),glass=mat(0x75a9b5,.25),roof=mat(0x7b4e45),leaf=mat(0x4d8a57),trunk=mat(0x6b4b36);

function box(w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
function cyl(r,h,m,x,y,z,seg=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}

function house(x,z,accent=0xb9c8bd){
 box(10,5.5,8,mat(accent),x,0,z);const r=new THREE.Mesh(new THREE.ConeGeometry(7.1,3,4),roof);r.position.set(x,7,z);r.rotation.y=Math.PI/4;r.castShadow=true;scene.add(r);
 for(const dx of[-2.8,2.8]){box(1.65,1.7,.16,glass,x+dx,1.8,z-4.08);box(1.65,1.7,.16,glass,x+dx,1.8,z+4.08)}
 box(1.35,2.4,.18,wood,x,0,z-4.12);box(2.3,.18,4.1,mat(0x77736a),x,0,z-6.05);
}
function tree(x,z,s=1){cyl(.28*s,2.3*s,trunk,x,0,z,10);const a=cyl(1.5*s,2.4*s,leaf,x,1.7*s,z,12);a.scale.y=1.1}
function person(x,z,shirt=0x4d6f88,skin=0xe1b08e){
 const g=new THREE.Group();g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.43,.95,5,10),mat(shirt));body.position.y=1.05;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),mat(skin));head.position.y=2;head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.36,16,8,0,Math.PI*2,0,Math.PI/2),mat(0x4a3428));hair.position.y=2.12;g.add(hair);
 for(const sx of[-.23,.23]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.65,4,8),mat(shirt));arm.position.set(sx,1.15,0);arm.rotation.z=sx>0?-.12:.12;g.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.7,4,8),mat(0x374553));leg.position.set(sx*.65,.35,0);g.add(leg)}
 scene.add(g);return g
}
function humanoid(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);const skin=mat(0xd8ddd8,.35),dark=mat(0x263239,.45);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.9,6,12),skin);torso.position.y=1.1;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.34,18,14),skin);head.position.y=2;g.add(head);
 const visor=new THREE.Mesh(new THREE.SphereGeometry(.25,18,10),dark);visor.position.set(0,2.03,.22);visor.scale.set(1,.55,.35);g.add(visor);
 for(const sx of[-.58,.58]){const limb=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.8,5,9),skin);limb.position.set(sx,1.15,0);limb.rotation.z=sx>0?-.15:.15;g.add(limb)}
 scene.add(g);return g
}

box(150,.25,150,grass,0,-.25,0);box(10,.12,150,road,0,0,0);box(150,.12,8,road,0,0,-18);
box(150,.12,2,sidewalk,-6,0,0);box(150,.12,2,sidewalk,6,0,0);box(2,.12,150,sidewalk,-6,0,0);box(2,.12,150,sidewalk,6,0,0);
for(let z=-65;z<=60;z+=12)box(.12,.03,5,white,0,.14,z);
house(-19,-20,0xb9c8bd);house(19,-20,0xd7c4ae);house(-19,10,0xc6d2d8);house(19,10,0xd2b9a9);
box(12,5,8,mat(0xd7d2c5),0,0,23);const shopRoof=new THREE.Mesh(new THREE.ConeGeometry(8.5,2.5,4),roof);shopRoof.position.set(0,6.2,23);shopRoof.rotation.y=Math.PI/4;scene.add(shopRoof);box(7,2,.2,glass,0,1.5,18.9);
for(let z=-55;z<=55;z+=10){tree(-12,z+(z%20?2:-2),.9);tree(12,z+(z%20?-2:2),.8)}

const player=person(0,-7,0x4b7890,0xe0ad87);
const buddy=humanoid(1.35,-7.4);
const npcs=[person(-3,-14,0x9a6657,0xd8a17d),person(4,-24,0x6d8a62,0x9a725a),person(-4,5,0x806b9a,0xe3b79a),person(3,16,0xa77a4f,0xc89070)];

const keys={};addEventListener('keydown',e=>{keys[e.key]=1});addEventListener('keyup',e=>{keys[e.key]=0});
document.querySelectorAll('#touch button').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',()=>keys[k]=1);['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=0))});

let money=500,clock=8;
const moneyEl=document.getElementById('money'),clockEl=document.getElementById('clock'),prompt=document.getElementById('prompt');

document.getElementById('work').onclick=()=>{money+=50;moneyEl.textContent='N$ '+money;clock=Math.min(23,clock+2);clockEl.textContent=String(clock).padStart(2,'0')+':00';prompt.textContent='Journée de travail terminée. + N$50.'};
document.getElementById('home').onclick=()=>{player.position.set(0,0,-7);prompt.textContent='Chez toi. Ton espace est prêt à être personnalisé.'};

let buildMode=false,buildTool='wall',selected=null,ghost=null;
const buildables=[];
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const buildGroup=new THREE.Group();scene.add(buildGroup);

const colors={wall:0xd9d4c8,window:0x6da8b8,door:0x8a6044,floor:0xb9b0a0,roof:0x766b62};
function dimsFor(tool){return tool==='wall'?[4,2.6,.2]:tool==='window'?[2,1.5,.16]:tool==='door'?[1,2.2,.18]:tool==='floor'?[4,.12,4]:[4,.18,4]}
function makeBuildable(tool,ghosting=false){
 const d=dimsFor(tool),m=mat(colors[tool],tool==='window'?.2:.65,ghosting);
 const o=new THREE.Mesh(new THREE.BoxGeometry(...d),m);
 o.userData={nomadBuild:true,tool,w:d[0],h:d[1],d:d[2],cost:0};
 o.position.y=d[1]/2;o.castShadow=!ghosting;o.receiveShadow=true;
 if(!ghosting)buildGroup.add(o);else scene.add(o);
 return o
}
function setGhost(){
 if(ghost)scene.remove(ghost);
 ghost=makeBuildable(buildTool,true);ghost.material.opacity=.35;
}
function select(o){
 selected=o||null;
 document.getElementById('dimW').value=selected?selected.userData.w: dimsFor(buildTool)[0];
 document.getElementById('dimH').value=selected?selected.userData.h: dimsFor(buildTool)[1];
 document.getElementById('dimD').value=selected?selected.userData.d: dimsFor(buildTool)[2];
 document.getElementById('dimR').value=selected?THREE.MathUtils.radToDeg(selected.rotation.y):0;
 updateOutputs();
}
function updateOutputs(){
 [['dimW','dimWOut','m'],['dimH','dimHOut','m'],['dimD','dimDOut','m']].forEach(([a,b,u])=>document.getElementById(b).textContent=Number(document.getElementById(a).value).toFixed(2)+' '+u);
 document.getElementById('dimROut').textContent=Math.round(Number(document.getElementById('dimR').value))+'°';
}
function resizeSelected(){
 if(!selected)return;
 const w=Number(dimW.value),h=Number(dimH.value),d=Number(dimD.value);
 selected.geometry.dispose();selected.geometry=new THREE.BoxGeometry(w,h,d);selected.position.y=h/2;
 selected.userData.w=w;selected.userData.h=h;selected.userData.d=d;selected.rotation.y=THREE.MathUtils.degToRad(Number(dimR.value));
}
function groundPoint(ev){
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.x=((ev.clientX-rect.left)/rect.width)*2-1;pointer.y=-((ev.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObject(scene.children.find(o=>o.userData&&o.userData.buildGround),false);
 return hits[0]?.point||null
}
const ground=scene.children.find(o=>o.geometry instanceof THREE.BoxGeometry && o.position.x===0 && o.position.z===0 && o.position.y<0);
if(ground)ground.userData.buildGround=true;

renderer.domElement.addEventListener('pointermove',ev=>{
 if(!buildMode||!ghost)return;
 const p=groundPoint(ev);if(p){ghost.position.x=Math.round(p.x*2)/2;ghost.position.z=Math.round(p.z*2)/2}
});
renderer.domElement.addEventListener('pointerdown',ev=>{
 if(!buildMode)return;
 const rect=renderer.domElement.getBoundingClientRect();pointer.x=((ev.clientX-rect.left)/rect.width)*2-1;pointer.y=-((ev.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const objectHits=raycaster.intersectObjects(buildGroup.children,false);
 if(objectHits.length){select(objectHits[0].object);return}
 const p=groundPoint(ev);if(!p)return;
 const o=makeBuildable(buildTool);o.position.set(Math.round(p.x*2)/2,dimsFor(buildTool)[1]/2,Math.round(p.z*2)/2);
 buildables.push(o);select(o);prompt.textContent='Élément NOMAD ajouté — construction gratuite.';setGhost();
});

function openBuild(){
 buildMode=true;document.getElementById('buildPanel').classList.add('open');document.getElementById('actions').classList.add('buildOpen');setGhost();
 prompt.textContent='Mode Construction : choisis un élément puis touche le terrain.';
}
function closeBuildMode(){buildMode=false;document.getElementById('buildPanel').classList.remove('open');if(ghost){scene.remove(ghost);ghost=null}select(null);prompt.textContent='Mode Vie : ton habitat reste exactement comme tu l’as construit.'}

document.getElementById('buy').onclick=openBuild;
document.getElementById('closeBuild').onclick=closeBuildMode;
document.querySelectorAll('.buildTool').forEach(b=>b.onclick=()=>{document.querySelectorAll('.buildTool').forEach(x=>x.classList.remove('active'));b.classList.add('active');buildTool=b.dataset.tool;select(null);setGhost()});
['dimW','dimH','dimD','dimR'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{updateOutputs();resizeSelected()}));
document.getElementById('deleteBuild').onclick=()=>{if(selected){buildGroup.remove(selected);selected.geometry.dispose();selected=null;prompt.textContent='Élément retiré. La structure de base reste gratuite.'}};
document.getElementById('duplicateBuild').onclick=()=>{if(!selected)return;const c=selected.clone();c.material=selected.material.clone();c.position.x+=1;c.userData={...selected.userData};buildGroup.add(c);buildables.push(c);select(c);prompt.textContent='Élément dupliqué.'};

const target=new THREE.Vector3();let t=0;
function loop(){
 requestAnimationFrame(loop);
 let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),dz=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);
 if(dx||dz){const l=Math.hypot(dx,dz);dx/=l;dz/=l;player.position.x+=dx*.11;player.position.z+=dz*.11;player.rotation.y=Math.atan2(dx,dz);clock+=.003;clockEl.textContent=String(Math.floor(clock)%24).padStart(2,'0')+':'+String(Math.floor(clock*60)%60).padStart(2,'0')}
 npcs.forEach((n,i)=>{n.position.x+=Math.sin(t*.3+i)*.003;n.rotation.y=Math.sin(t*.25+i)*.2});t+=.016;
 const desired=new THREE.Vector3(player.position.x,3.4,player.position.z+6.2);camera.position.lerp(desired,.09);target.set(player.position.x,1.05,player.position.z);camera.lookAt(target);renderer.render(scene,camera)
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
load.style.display='none';game.style.display='block';updateOutputs();loop();
})();