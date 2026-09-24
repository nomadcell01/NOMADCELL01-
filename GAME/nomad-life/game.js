(()=>{'use strict';
const load=document.getElementById('loading');const game=document.getElementById('game');
if(typeof THREE==='undefined'){load.textContent='Le moteur 3D n’a pas pu être chargé.';return}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fc7d9);scene.fog=new THREE.Fog(0x9fc7d9,55,150);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,220);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.insertBefore(renderer.domElement,document.body.firstChild);
scene.add(new THREE.HemisphereLight(0xf7fbff,0x66736b,2.1));
const sun=new THREE.DirectionalLight(0xfff1d0,3.2);sun.position.set(-25,40,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const mat=(c,r=.7)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const grass=mat(0x76a86d), road=mat(0x555b5b), sidewalk=mat(0xb9b5a8), white=mat(0xf2eee3), wood=mat(0x8d6345), glass=mat(0x75a9b5,.25), roof=mat(0x7b4e45), leaf=mat(0x4d8a57), trunk=mat(0x6b4b36);
function box(w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
function cyl(r,h,m,x,y,z,seg=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o}
function house(x,z,accent=0xb9c8bd){
 box(10,5.5,8,mat(accent),x,0,z);const r=new THREE.Mesh(new THREE.ConeGeometry(7.1,3.0,4),roof);r.position.set(x,7,z);r.rotation.y=Math.PI/4;r.castShadow=true;scene.add(r);
 for(const dx of [-2.8,2.8]){box(1.65,1.7,.16,glass,x+dx,1.8,z-4.08);box(1.65,1.7,.16,glass,x+dx,1.8,z+4.08)}
 box(1.35,2.4,.18,wood,x,0,z-4.12);box(2.3,.18,4.1,mat(0x77736a),x,0,z-6.05);
 box(1.8,.15,1.0,mat(0x7a9b67),x-3.4,.03,z-4.7);box(1.8,.15,1.0,mat(0x7a9b67),x+3.4,.03,z-4.7);
}
function tree(x,z,s=1){cyl(.28*s,2.3*s,trunk,x,0,z,10);const a=cyl(1.5*s,2.4*s,leaf,x,1.7*s,z,12);a.scale.y=1.1}
function person(x,z,shirt=0x4d6f88,skin=0xe1b08e){const g=new THREE.Group();g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.43,.95,5,10),mat(shirt));body.position.y=1.05;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),mat(skin));head.position.y=2.0;head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.36,16,8,0,Math.PI*2,0,Math.PI/2),mat(0x4a3428));hair.position.y=2.12;g.add(hair);
 for(const sx of [-.23,.23]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.65,4,8),mat(shirt));arm.position.set(sx,1.15,0);arm.rotation.z=sx>0?-.12:.12;arm.castShadow=true;g.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.7,4,8),mat(0x374553));leg.position.set(sx*.65,.35,0);leg.castShadow=true;g.add(leg)}
 scene.add(g);return g}
function humanoid(x,z){const g=new THREE.Group();g.position.set(x,0,z);const skin=mat(0xd8ddd8,.35),dark=mat(0x263239,.45);const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.9,6,12),skin);torso.position.y=1.1;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.34,18,14),skin);head.position.y=2.0;g.add(head);const visor=new THREE.Mesh(new THREE.SphereGeometry(.25,18,10),dark);visor.position.set(0,2.03,.22);visor.scale.set(1,.55,.35);g.add(visor);for(const sx of[-.58,.58]){const limb=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.8,5,9),skin);limb.position.set(sx,1.15,0);limb.rotation.z=sx>0?-.15:.15;g.add(limb)}scene.add(g);return g}
box(150,.25,150,grass,0,-.25,0);box(10,.12,150,road,0,0,0);box(150,.12,8,road,0,0,-18);box(150,.12,2,sidewalk,-6,0,0);box(150,.12,2,sidewalk,6,0,0);box(2,.12,150,sidewalk,-6,0,0);box(2,.12,150,sidewalk,6,0,0);
for(let z=-65;z<=60;z+=12)box(.12,.03,5,white,0,.14,z);
house(-19,-20,0xb9c8bd);house(19,-20,0xd7c4ae);house(-19,10,0xc6d2d8);house(19,10,0xd2b9a9);
box(12,5,8,mat(0xd7d2c5),0,0,23);const shopRoof=new THREE.Mesh(new THREE.ConeGeometry(8.5,2.5,4),roof);shopRoof.position.set(0,6.2,23);shopRoof.rotation.y=Math.PI/4;scene.add(shopRoof);box(7,2,.2,glass,0,1.5,18.9);
for(let z=-55;z<=55;z+=10){tree(-12,z+(z%20?2:-2),.9);tree(12,z+(z%20?-2:2),.8)}
const player=person(0,-7,0x4b7890,0xe0ad87);const buddy=humanoid(1.35,-7.4);
const npcs=[person(-3,-14,0x9a6657,0xd8a17d),person(4,-24,0x6d8a62,0x9a725a),person(-4,5,0x806b9a,0xe3b79a),person(3,16,0xa77a4f,0xc89070)];
const keys={};addEventListener('keydown',e=>{keys[e.key]=1});addEventListener('keyup',e=>{keys[e.key]=0});document.querySelectorAll('#touch button').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',()=>keys[k]=1);['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=0))});
let money=500,clock=8;const moneyEl=document.getElementById('money'),clockEl=document.getElementById('clock'),prompt=document.getElementById('prompt');
document.getElementById('work').onclick=()=>{money+=50;clock=Math.min(23,clock+2);moneyEl.textContent='N$ '+money;clockEl.textContent=String(clock).padStart(2,'0')+':00';prompt.textContent='Journée de travail terminée. + N$50.'};
document.getElementById('home').onclick=()=>{player.position.set(0,0,-7);buddy.position.set(1.35,0,-7.4);prompt.textContent='Chez toi. Ton espace est prêt à être personnalisé.'};
document.getElementById('buy').onclick=()=>{money=Math.max(0,money-25);moneyEl.textContent='N$ '+money;prompt.textContent='Mode construction : choisis bientôt tes meubles et ton atelier.'};
const target=new THREE.Vector3();let t=0;
function loop(){requestAnimationFrame(loop);const dt=Math.min(.04,clock.getElapsedTime?0.016:0.016);let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),dz=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);if(dx||dz){const l=Math.hypot(dx,dz);dx/=l;dz/=l;player.position.x+=dx*.11;player.position.z+=dz*.11;player.rotation.y=Math.atan2(dx,dz);buddy.position.x+=(player.position.x+1.35-buddy.position.x)*.08;buddy.position.z+=(player.position.z-.4-buddy.position.z)*.08;clock+=.003;clockEl.textContent=String(Math.floor(clock)%24).padStart(2,'0')+':'+String(Math.floor(clock*60)%60).padStart(2,'0')}
npcs.forEach((n,i)=>{n.position.x+=Math.sin(t*.3+i)*.003;n.rotation.y=Math.sin(t*.25+i)*.2});t+=.016;
const desired=new THREE.Vector3(player.position.x,3.0,player.position.z+5.8);camera.position.lerp(desired,.09);target.set(player.position.x,1.05,player.position.z);camera.lookAt(target);renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
load.style.display='none';game.style.display='block';prompt.textContent='Bienvenue dans ton quartier NOMAD. Explore la ville et entre dans ta vie.';loop();
})();