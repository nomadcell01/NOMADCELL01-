(() => {
'use strict';
if(!window.THREE){document.getElementById('loading').textContent='Le moteur 3D n’a pas pu démarrer. Recharge la page.';return;}
const T=THREE, game=document.getElementById('game'), loading=document.getElementById('loading');
const scene=new T.Scene(); scene.background=new T.Color(0x9fc5d9); scene.fog=new T.Fog(0x9fc5d9,35,95);
const camera=new T.PerspectiveCamera(58,innerWidth/innerHeight,.1,180);
const renderer=new T.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
const hemi=new T.HemisphereLight(0xffffff,0x68766d,2.2); scene.add(hemi);
const sun=new T.DirectionalLight(0xffffff,2.5); sun.position.set(-15,25,10); sun.castShadow=true; scene.add(sun);

const mat=(c)=>new T.MeshStandardMaterial({color:c,roughness:.82});
const M={grass:mat(0x78966f),road:mat(0x4c5357),side:mat(0xb8b29c),wall:mat(0xe6ddd0),roof:mat(0x665d57),wood:mat(0x9a6b48),glass:mat(0x87b8c7),dark:mat(0x30363a),skin:mat(0xd39a78),cloth:mat(0x365a68),green:mat(0x6c8561),white:mat(0xf2eee5),metal:mat(0x879097)};

function box(w,h,d,x,y,z,ma,sh=true){const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);o.castShadow=sh;o.receiveShadow=true;scene.add(o);return o}
function cyl(r,h,x,y,z,ma){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),ma);o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o}
function house(x,z,angle=0){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);
 const b=new T.Mesh(new T.BoxGeometry(8,4.4,7),M.wall);b.position.y=2.2;b.castShadow=b.receiveShadow=true;g.add(b);
 const roof=new T.Mesh(new T.ConeGeometry(5.6,2.2,4),M.roof);roof.position.y=5.5;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);
 const door=new T.Mesh(new T.BoxGeometry(1.15,2.2,.15),M.wood);door.position.set(0,1.1,3.53);g.add(door);
 const win1=new T.Mesh(new T.BoxGeometry(1.7,1.3,.12),M.glass);win1.position.set(-2.2,2.3,3.54);g.add(win1);
 const win2=win1.clone();win2.position.x=2.2;g.add(win2);
 return g;
}
function tree(x,z){
 cyl(.28,3,x,1.5,z,M.wood);
 const crown=new T.Mesh(new T.SphereGeometry(1.35,12,9),M.green);crown.position.set(x,3.5,z);crown.castShadow=true;scene.add(crown);
}
function person(x,z,cloth=M.cloth){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);
 const body=new T.Mesh(new T.CapsuleGeometry(.38,.9,6,10),cloth);body.position.y=1.05;body.castShadow=true;g.add(body);
 const head=new T.Mesh(new T.SphereGeometry(.32,16,12),M.skin);head.position.y=2.05;head.castShadow=true;g.add(head);
 return g;
}
function furniture(x,y,z,w,h,d,ma){return box(w,h,d,x,y,z,ma)}

box(100,.2,100,0,-.1,0,M.grass);
box(12,.05,70,0,.02,0,M.road);
box(5,.08,70,-8.5,.04,0,M.side);box(5,.08,70,8.5,.04,0,M.side);
for(let z=-30;z<=30;z+=12){box(3,.12,7,-10,0.08,z,M.grass);box(3,.12,7,10,0.08,z,M.grass)}
house(-15,-14);house(15,-2);house(-15,12);house(15,25);
box(9,5,7,-15,2.5,0,M.wall);box(9,.25,7,-15,5.1,0,M.roof);box(1.2,2.2,.2,-15,1.1,3.55,M.wood);
box(7,4,6,15,2,-18,M.wall);box(7,.25,6,15,4.1,-18,M.roof);
const shop=box(8,4.5,7,-15,2.25,25,M.wall);box(1.5,2,.2,-15,1,28.55,M.glass);
for(let i=-35;i<=35;i+=8){tree(-12,i);tree(12,i+4)}
const npcs=[person(-5,-12,M.cloth),person(6,-2,M.green),person(-5,9,M.white),person(5,22,M.cloth)];
const workSpot=box(4,.15,4,18,.1,8,M.metal);

function humanoid(){
 const g=new T.Group();g.position.set(1,0,1);scene.add(g);
 const body=new T.Mesh(new T.CapsuleGeometry(.42,1.05,8,12),M.metal);body.position.y=1.15;body.castShadow=true;g.add(body);
 const head=new T.Mesh(new T.SphereGeometry(.36,16,12),M.dark);head.position.y=2.2;head.castShadow=true;g.add(head);
 const eye=box(.28,.08,.05,1.0,2.25,1.32,M.glass);g.add(eye);
 return g;
}
const player=new T.Group();scene.add(player);player.position.set(0,0,0);
const body=new T.Mesh(new T.CapsuleGeometry(.42,1.05,8,12),M.cloth);body.position.y=1.15;body.castShadow=true;player.add(body);
const head=new T.Mesh(new T.SphereGeometry(.36,16,12),M.skin);head.position.y=2.2;head.castShadow=true;player.add(head);
const companion=humanoid();

let indoor=false,money=500,clock=8;
const keys={};
addEventListener('keydown',e=>{keys[e.key]=true});
addEventListener('keyup',e=>{keys[e.key]=false});
document.querySelectorAll('#touch button').forEach(b=>{
 const k=b.dataset.key;b.addEventListener('pointerdown',()=>keys[k]=true);b.addEventListener('pointerup',()=>keys[k]=false);b.addEventListener('pointerleave',()=>keys[k]=false);
});
function say(t){document.getElementById('hint').textContent=t}
function updateHud(){document.getElementById('money').textContent='N$ '+Math.round(money);document.getElementById('clock').textContent=String(Math.floor(clock)).padStart(2,'0')+':'+String(Math.floor((clock%1)*60)).padStart(2,'0')}
document.getElementById('work').onclick=()=>{money+=50;clock=Math.min(23.5,clock+2);updateHud();say('Tu viens de travailler : +N$ 50.');player.position.set(16,0,8);companion.position.set(18,0,8)};
document.getElementById('home').onclick=()=>{player.position.set(0,0,0);companion.position.set(1,0,1);say('Retour à la maison. Tu peux aménager ton intérieur.')};
document.getElementById('catalog').onclick=()=>{
 if(!indoor){say('Entre chez toi pour acheter et placer tes meubles.');return}
 const item=prompt('Catalogue NOMAD — tape : chaise, table ou canapé');
 if(!item)return;
 const prices={chaise:5,table:10,canape:100};
 const p=prices[item.toLowerCase()];
 if(!p){say('Cet objet n’est pas encore dans le catalogue.');return}
 if(money<p){say('Pas assez de N$.');return}
 money-=p;updateHud();say(item+' acheté pour N$ '+p+'. Il rejoint ta maison.');
};
renderer.domElement.addEventListener('pointerdown',e=>{
 const x=(e.clientX/innerWidth)*2-1,y=-(e.clientY/innerHeight)*2+1;
 const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x,y),camera);
 const hits=ray.intersectObjects(scene.children,true);
 const doorHit=hits.find(h=>h.object.material===M.wood);
 if(doorHit){indoor=!indoor;buildInterior(indoor);say(indoor?'Tu es chez toi. Ici, tu peux aménager ton intérieur.':'Tu es sorti. La ville NOMAD continue de vivre autour de toi.');}
});

let interiorGroup=null;
function buildInterior(on){
 if(interiorGroup){scene.remove(interiorGroup);interiorGroup=null}
 if(!on){scene.background=new T.Color(0x9fc5d9);return}
 interiorGroup=new T.Group();scene.add(interiorGroup);
 const floor=box(20,.2,16,0,-.05,0,M.wood);floor.parent=interiorGroup;
 const back=box(20,4,0.2,0,2,-8,M.wall);back.parent=interiorGroup;
 const left=box(.2,4,16,-10,2,0,M.wall);left.parent=interiorGroup;
 const right=box(.2,4,16,10,2,0,M.wall);right.parent=interiorGroup;
 const sofa=box(4,1.1,1.6,-4,.6,-2,M.cloth);sofa.parent=interiorGroup;
 const table=box(2,.8,1.2,1,.4,-1,M.wood);table.parent=interiorGroup;
 const bed=box(4,.6,5,5,.3,3,M.white);bed.parent=interiorGroup;
 const kitchen=box(5,1.2,1,0,.6,6,M.white);kitchen.parent=interiorGroup;
 scene.background=new T.Color(0xc7b79e);player.position.set(0,0,5);companion.position.set(2,0,5);
}

const targetCam=new T.Vector3();
function animate(){
 requestAnimationFrame(animate);
 const speed=.105;
 if(!indoor){
  let dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),dz=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);
  const len=Math.hypot(dx,dz)||1;if(dx||dz){player.position.x+=dx/len*speed;player.position.z+=dz/len*speed;companion.position.x+=(player.position.x-companion.position.x)*.06;companion.position.z+=(player.position.z-companion.position.z)*.06;}
  player.position.x=Math.max(-7,Math.min(7,player.position.x));player.position.z=Math.max(-36,Math.min(36,player.position.z));
  targetCam.set(player.position.x,3.6,player.position.z+6.5);camera.position.lerp(targetCam,.12);camera.lookAt(player.position.x,1.25,player.position.z);
 }else{
  targetCam.set(player.position.x,4.2,player.position.z+7);camera.position.lerp(targetCam,.12);camera.lookAt(player.position.x,1.2,player.position.z);
 }
 renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
game.style.display='block';loading.style.display='none';updateHud();say('Tu es dans la ville NOMAD. Déplace-toi et vis ta vie.');animate();
})();