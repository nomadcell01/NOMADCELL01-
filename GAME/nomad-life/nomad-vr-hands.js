(()=>{'use strict';
/* NOMAD VR — mains, pointeur et interactions naturelles */
function boot(){
 const r=window.NOMAD_XR_RENDERER;
 if(!r||!r.xr)return setTimeout(boot,400);
 let session=null,ray=new THREE.Raycaster(),hands=[],grabbed=null,lastAction=0;
 const ACTION_COOLDOWN=420;
 window.NOMAD_VR_TICKERS=window.NOMAD_VR_TICKERS||[];
 const status=m=>{const p=document.getElementById('prompt');if(p)p.textContent=m};
 function haptic(src,strong=false){try{const act=src.gamepad?.hapticActuators?.[0];act?.pulse?.(strong?.55:.25,90)}catch(e){}}
 function makeHand(side){
   const g=new THREE.Group(),p=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),new THREE.MeshBasicMaterial({color:0x6ee7ff,transparent:true,opacity:.8}));
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-2)]),new THREE.LineBasicMaterial({color:0x6ee7ff,transparent:true,opacity:.55}));
   g.add(p,line);g.userData.side=side;return g;
 }
 function attach(src){
   const index=Array.from(session?.inputSources||[]).indexOf(src);
   const controller=index>=0?(r.xr.getController?.(index)||null):null;
   const g=makeHand(src.handedness||'none'),scene=r.__nomadLastScene;
   if(scene)scene.add(g);if(controller)g.userData.controller=controller;
   hands.push({src,g,controller});
 }
 function refreshInteractables(){
   const scene=r.__nomadLastScene;if(!scene)return;
   const list=[];
   scene.traverse(o=>{
     if(o?.userData?.nomadObject||o?.userData?.vrLabel||o?.userData?.interactionLabel)list.push(o);
     if(o?.geometry?.type==='RingGeometry'){
       const p=o.position,key=Math.round(p.x)+'|'+Math.round(p.z);
       const labels={'0|0':'Habitat','2|1':'Cuisine','-2|1':'Douche','0|-3':'Loisirs','6|-1':'Travail','4|-5':'Atelier','-6|-2':'Laboratoire','-7|4':'Assemblage','7|-5':'Déploiement','3|6':'Humanoïde','-3|6':'Tâche humanoïde','-1|6':'État humanoïde','2|6':'Utiliser meuble','5|6':'Choisir métier','7|6':'Travailler','9|6':'Statut joueur','11|6':'Parler habitant','-4|5':'Marché','8|4':'Commerce','-8|-4':'Transport','-12|-10':'Bibliothèque NOMAD','3|-10':'Ordinateur archives','0|-15':'Galerie projet NOMAD'};
       if(labels[key]){o.userData.vrLabel=labels[key];list.push(o);}
     }
   });
   window.NOMAD_VR_INTERACTABLES=list;
 }
 function findGrabbable(hit){let o=hit;while(o&&o.parent){if(o.userData?.nomadObject)return o;o=o.parent}return null}
 function target(src){
   const origin=new THREE.Vector3(),dir=new THREE.Vector3();
   if(src.targetRaySpace)src.targetRaySpace.getWorldPosition(origin);else if(src.grip)src.grip.getWorldPosition(origin);else return null;
   if(src.targetRaySpace)src.targetRaySpace.getWorldDirection(dir);else src.grip?.getWorldDirection?.(dir);
   if(!dir.lengthSq())return null;
   ray.set(origin,dir.normalize());refreshInteractables();
   return ray.intersectObjects(window.NOMAD_VR_INTERACTABLES||[],true)[0]?.object||null;
 }
 function labelOf(hit){return hit?.userData?.vrLabel||hit?.userData?.interactionLabel||hit?.userData?.name||hit?.parent?.userData?.vrLabel||''}
 function fireAction(label,hit,h){if(!label||performance.now()-lastAction<ACTION_COOLDOWN)return;lastAction=performance.now();status('👋 VR · '+label);haptic(h.src,true);window.NOMAD_VR_ACTION?.(label,hit);if(['Bibliothèque NOMAD','Ordinateur archives','Ordinateur site NOMAD','Galerie projet NOMAD','Musée NOMAD','Archives techniques'].includes(label))window.NOMAD_REAL_ARCHIVE?.open?.(label)}
 function bindSession(s){
   session=s;
   s.addEventListener('inputsourceschange',e=>{e.added.forEach(src=>{if(src.gamepad&&!hands.some(h=>h.src===src))attach(src)});e.removed.forEach(src=>{hands=hands.filter(h=>h.src!==src);if(grabbed?.hand?.src===src)grabbed=null})});
   s.inputSources?.forEach(src=>{if(src.gamepad)attach(src)});
   window.NOMAD_VR_TICKERS=window.NOMAD_VR_TICKERS.filter(x=>x.id!=='hands');
   window.NOMAD_VR_TICKERS.push({id:'hands',tick:(time,frame)=>{
     if(!frame)return;
     for(const h of hands){
       if(h.controller){h.g.position.copy(h.controller.position);h.g.quaternion.copy(h.controller.quaternion)}
       const src=h.src,b=src.gamepad?.buttons||[],hit=target(src),label=labelOf(hit);
       if(label&&b[0]?.pressed)fireAction(label,hit,h);
       if(b[1]?.pressed&&!grabbed){const g=findGrabbable(hit);if(g){grabbed={obj:g,hand:h};h.g.add(g);g.position.set(0,0,-.45);g.rotation.set(0,0,0);haptic(src,true);status('✋ Objet saisi · '+(g.userData.item||'objet NOMAD'))}}
       else if(grabbed?.hand===h&&b[1]&&!b[1].pressed){const obj=grabbed.obj,scene=r.__nomadLastScene;if(scene){const p=obj.getWorldPosition(new THREE.Vector3()),q=obj.getWorldQuaternion(new THREE.Quaternion());scene.add(obj);obj.position.set(p.x,Math.max(.2,p.y),p.z);obj.quaternion.copy(q)}haptic(src,false);status('📦 Objet posé');grabbed=null}
       if(label&&!b[0]?.pressed&&!b[1]?.pressed&&performance.now()-lastAction>900)status('👉 '+label);
     }
   }});
   status('🥽 VR · pointeur, mains et contrôleurs actifs');
 }
 const original=r.xr.setSession.bind(r.xr);r.xr.setSession=async s=>{const out=await original(s);bindSession(s);return out};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();