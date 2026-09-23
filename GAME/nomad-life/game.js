(() => {
'use strict';
if(!window.THREE){document.getElementById('loading').textContent='Le moteur 3D n’a pas pu démarrer.';return;}
const T=THREE, game=document.getElementById('game'), loading=document.getElementById('loading');
const scene=new T.Scene(); scene.background=new T.Color(0x9fc5d9); scene.fog=new T.Fog(0x9fc5d9,35,95);
const camera=new T.PerspectiveCamera(58,innerWidth/innerHeight,.1,180);
const renderer=new T.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const hemi=new T.HemisphereLight(0xffffff,0x68766d,2.2); scene.add(hemi);
const sun=new T.DirectionalLight(0xffffff,2.5); sun.position.set(-15,25,10); sun.castShadow=true; scene.add(sun);
function mat(c){return new T.MeshStandardMaterial({color:c,roughness:.82});}
function texture(fill,detail,size=128){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.fillStyle=fill;x.fillRect(0,0,size,size);for(let i=0;i<90;i++){x.globalAlpha=.16;x.fillStyle=detail;x.fillRect(Math.random()*size,Math.random()*size,2+Math.random()*8,2+Math.random()*8)}x.globalAlpha=1;const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,5);return t;}
const tex={grass:texture('#78966f','#d4d8a0'),road:texture('#4c5357','#92999b'),wall:texture('#e6ddd0','#a99e91'),roof:texture('#665d57','#b7aaa0'),wood:texture('#9a6b48','#d1a47a'),side:texture('#b8b29c','#eee6d2')};
function matTex(c,t){return new T.MeshStandardMaterial({color:c,map:tex[t],roughness:.9})}
const M={grass:matTex(0xffffff,'grass'),road:matTex(0xffffff,'road'),side:matTex(0xffffff,'side'),wall:matTex(0xffffff,'wall'),roof:matTex(0xffffff,'roof'),wood:matTex(0xffffff,'wood'),glass:mat(0x87b8c7),dark:mat(0x30363a),skin:mat(0xd39a78),cloth:mat(0x365a68),green:mat(0x6c8561),white:mat(0xf2eee5),metal:mat(0x879097)};
function box(w,h,d,x,y,z,ma,sh=true){const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);o.castShadow=sh;o.receiveShadow=true;scene.add(o);return o}
function cyl(r,h,x,y,z,ma){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),ma);o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o}
function house(x,z,angle=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);const b=new T.Mesh(new T.BoxGeometry(8,4.4,7),M.wall);b.position.y=2.2;b.castShadow=b.receiveShadow=true;g.add(b);const roof=new T.Mesh(new T.ConeGeometry(5.6,2.2,4),M.roof);roof.position.y=5.5;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);const door=new T.Mesh(new T.BoxGeometry(1.15,2.2,.15),M.wood);door.position.set(0,1.1,3.53);g.add(door);const win1=new T.Mesh(new T.BoxGeometry(1.7,1.3,.12),M.glass);win1.position.set(-2.2,2.3,3.54);g.add(win1);const win2=win1.clone();win2.position.x=2.2;g.add(win2);return g}
function tree(x,z){cyl(.28,3,x,1.5,z,M.wood);const crown=new T.Mesh(new T.SphereGeometry(1.35,12,9),M.green);crown.position.set(x,3.5,z);crown.castShadow=true;scene.add(crown)}
function person(x,z,cloth=M.cloth){const g=new T.Group();g.position.set(x,0,z);scene.add(g);const body=new T.Mesh(new T.CapsuleGeometry(.38,.9,6,10),cloth);body.position.y=1.05;body.castShadow=true;g.add(body);const head=new T.Mesh(new T.SphereGeometry(.32,16,12),M.skin);head.position.y=2.05;head.castShadow=true;g.add(head);return g}
box(100,.2,100,0,-.1,0,M.grass);box(12,.05,70,0,.02,0,M.road);box(5,.08,70,-8.5,.04,0,M.side);box(5,.08,70,8.5,.04,0,M.side);
for(let z=-30;z<=30;z+=12){box(3,.12,7,-10,0.08,z,M.grass);box(3,.12,7,10,0.08,z,M.grass)}
house(-15,-14);house(15,-2);house(-15,12);house(15,25);
box(9,5,7,-15,2.5,0,M.wall);box(9,.25,7,-15,5.1,0,M.roof);box(1.2,2.2,.2,-15,1.1,3.55,M.wood);
box(7,4,6,15,2,-18,M.wall);box(7,.25,6,15,4.1,-18,M.roof);box(8,4.5,7,-15,2.25,25,M.wall);box(1.5,2,.2,-15,1,28.55,M.glass);
for(let i=-35;i<=35;i+=8){tree(-12,i);tree(12,i+4)}
const npcs=[person(-5,-12),person(6,-2,M.green),person(-5,9,M.white),person(5,22)];
const workSpot=box(4,.15,4,18,.1,8,M.metal);
function humanoid(){const g=new T.Group();g.position.set(1,0,1);scene.add(g);const body=new T.Mesh(new T.CapsuleGeometry(.42,1.05,8,12),M.metal);body.position.y=1.15;body.castShadow=true;g.add(body);const head=new T.Mesh(new T.SphereGeometry(.36,16,12),M.dark);head.position.y=2.2;head.castShadow=true;g.add(head);const eye=new T.Mesh(new T.BoxGeometry(.28,.08,.05),M.glass);eye.position.set(0,2.25,.34);g.add(eye);return g}
const player=new T.Group();scene.add(player);player.position.set(0,0,0);const body=new T.Mesh(new T.CapsuleGeometry(.42,1.05,8,12),M.cloth);body.position.y=1.15;body.castShadow=true;player.add(body);const head=new T.Mesh(new T.SphereGeometry(.36,16,12),M.skin);head.position.y=2.2;head.castShadow=true;player.add(head);const companion=humanoid();
let indoor=false,money=500,clock=8;const keys={};addEventListener('keydown',e=>keys[e.key]=true);addEventListener('keyup',e=>keys[e.key]=false);
document.querySelectorAll('#touch button').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',()=>keys[k]=true);b.addEventListener('pointerup',()=>keys[k]=false);b.addEventListener('pointerleave',()=>keys[k]=false)});
function say(t){document.getElementById('hint').textContent=t} function updateHud(){document.getElementById('money').textContent='N$ '+Math.round(money);document.getElementById('clock').textContent=String(Math.floor(clock)).padStart(2,'0')+':'+String(Math.floor((clock%1)*60)).padStart(2,'0')}
document.getElementById('work').onclick=()=>{money+=50;clock=Math.min(23.5,clock+2);updateHud();say('Tu viens de travailler : +N$ 50.');player.position.set(6,0,8);companion.position.set(7,0,8)};
document.getElementById('home').onclick=()=>{player.position.set(0,0,0);companion.position.set(1,0,1);say('Retour à la maison.');};
document.getElementById('catalog').onclick=()=>say('Le catalogue NOMAD arrive dans la prochaine étape.');
let interiorGroup=null;
function buildInterior(on){if(interiorGroup){scene.remove(interiorGroup);interiorGroup=null}if(!on){scene.background=new T.Color(0x9fc5d9);return}interiorGroup=new T.Group();scene.add(interiorGroup);function ib(w,h,d,x,y,z,ma){const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;interiorGroup.add(o)}ib(20,.2,16,0,-.05,0,M.wood);ib(20,4,.2,0,2,-8,M.wall);ib(.2,4,16,-10,2,0,M.wall);ib(.2,4,16,10,2,0,M.wall);ib(4,1.1,1.6,-4,.6,-2,M.cloth);ib(2,.8,1.2,1,.4,-1,M.wood);ib(4,.6,5,5,.3,3,M.white);ib(5,1.2,1,0,.6,6,M.white);scene.background=new T.Color(0xc7b79e);player.position.set(0,0,5);companion.position.set(2,0,5)}
renderer.domElement.addEventListener('pointerdown',e=>{const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX/innerWidth)*2-1,-(e.clientY/innerHeight)*2+1),camera);const hits=ray.intersectObjects(scene.children,true);if(hits.some(h=>h.object.material===M.wood)){indoor=!indoor;buildInterior(indoor);say(indoor?'Tu es chez toi.':'Tu es sorti.') }});
const targetCam=new T.Vector3();
function animate(){requestAnimationFrame(animate);const speed=.105;if(!indoor){let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),dz=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);const len=Math.hypot(dx,dz)||1;if(dx||dz){player.position.x+=dx/len*speed;player.position.z+=dz/len*speed;companion.position.x+=(player.position.x-companion.position.x)*.06;companion.position.z+=(player.position.z-companion.position.z)*.06}player.position.x=Math.max(-7,Math.min(7,player.position.x));player.position.z=Math.max(-36,Math.min(36,player.position.z));targetCam.set(player.position.x,3.6,player.position.z+6.5);camera.position.lerp(targetCam,.12);camera.lookAt(player.position.x,1.25,player.position.z)}else{targetCam.set(player.position.x,4.2,player.position.z+7);camera.position.lerp(targetCam,.12);camera.lookAt(player.position.x,1.2,player.position.z)}renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
game.style.display='block';loading.style.display='none';updateHud();say('Tu es dans la ville NOMAD. Déplace-toi et vis ta vie.');animate();
})();