(()=>{'use strict';
/* NOMAD VR — mains, pointeur et interactions */
function boot(){
 const r=window.NOMAD_XR_RENDERER;
 if(!r||!r.xr)return setTimeout(boot,400);
 let session=null,ray=new THREE.Raycaster(),hands=[];
 const status=m=>{const p=document.getElementById('prompt');if(p)p.textContent=m};
 function makeHand(side){
   const g=new THREE.Group(),p=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),new THREE.MeshBasicMaterial({color:0x6ee7ff,transparent:true,opacity:.8}));
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-2)]),new THREE.LineBasicMaterial({color:0x6ee7ff,transparent:true,opacity:.55}));
   g.add(p,line);g.userData.side=side;return g;
 }
 function attach(src){
   const g=makeHand(src.handedness||'none');r.scene?.add?.(g);hands.push({src,g});
 }
 function target(src){
   const p=(window.NOMAD_PEOPLE||[]).find(x=>x?.userData?.isPlayer);
   if(!p)return null;
   const cam=r.__nomadLastCamera;if(!cam)return null;
   const origin=new THREE.Vector3(),dir=new THREE.Vector3();
   src.grip?.getWorldPosition?.(origin);
   src.grip?.getWorldDirection?.(dir);
   if(!origin.length())return null;
   ray.set(origin,dir);
   const objects=(window.NOMAD_VR_INTERACTABLES||[]);
   const hit=ray.intersectObjects(objects,true)[0];
   return hit?.object||null;
 }
 function bindSession(s){
   session=s;
   s.addEventListener('inputsourceschange',e=>{
     e.added.forEach(src=>{if(src.gamepad&&!hands.some(h=>h.src===src))attach(src)});
     e.removed.forEach(src=>{hands=hands.filter(h=>h.src!==src)});
   });
   s.inputSources?.forEach(src=>{if(src.gamepad)attach(src)});
   r.setAnimationLoop((time,frame)=>{
     if(frame){
       for(const h of hands){
         const src=h.src;
         if(src.gamepad){
           const b=src.gamepad.buttons||[];
           if(b[0]?.pressed){
             const hit=target(src);
             if(hit){
               const label=hit.userData?.vrLabel||hit.userData?.name||hit.parent?.userData?.vrLabel;
               if(label){status('👋 VR · '+label);window.NOMAD_VR_ACTION?.(label,hit);}
             }
           }
         }
       }
     }
     if(r.__nomadLastScene&&r.__nomadLastCamera)r.render(r.__nomadLastScene,r.__nomadLastCamera);
   });
   status('🥽 VR · mains et contrôleurs actifs');
 }
 const original=r.xr.setSession.bind(r.xr);
 r.xr.setSession=async s=>{const out=await original(s);bindSession(s);return out};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();