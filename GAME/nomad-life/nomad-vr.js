(()=>{'use strict';
if(!window.THREE)return;
const OriginalRenderer=THREE.WebGLRenderer;
if(!window.__NOMAD_XR_PATCHED){
 window.__NOMAD_XR_PATCHED=true;
 THREE.WebGLRenderer=function(...args){
  const r=new OriginalRenderer(...args);window.NOMAD_XR_RENDERER=r;
  const originalRender=r.render.bind(r);r.__nomadLastScene=null;r.__nomadLastCamera=null;
  r.render=function(scene,camera){r.__nomadLastScene=scene;r.__nomadLastCamera=camera;return originalRender(scene,camera)};
  r.__nomadOriginalSetAnimationLoop=r.setAnimationLoop.bind(r);return r;
 };
 THREE.WebGLRenderer.prototype=OriginalRenderer.prototype;
}
function status(msg){const p=document.getElementById('prompt');if(p)p.textContent=msg}
function addButton(){
 const actions=document.getElementById('actions');if(!actions||document.getElementById('vrBtn'))return;
 const b=document.createElement('button');b.id='vrBtn';b.textContent='🥽 VR NOMAD';b.title='Jouer en réalité virtuelle';actions.appendChild(b);
 const hud=document.createElement('div');hud.id='nomadVrHud';hud.style.cssText='display:none;position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;max-width:92vw;padding:12px 16px;border-radius:16px;background:rgba(8,12,20,.88);color:#fff;font:14px system-ui;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.35);backdrop-filter:blur(8px)';
 hud.innerHTML='<strong>🥽 NOMAD VR</strong><br><span id="nomadVrHelp">Joystick gauche : déplacement · joystick droit : rotation · bouton secondaire : course/saisie selon interaction</span><br><span id="nomadVrTarget">👉 Vise un élément pour voir son nom</span>';
 document.body.appendChild(hud);
 function setHud(on){hud.style.display=on?'block':'none';b.textContent=on?'🥽 Quitter VR':'🥽 VR NOMAD'}
 window.NOMAD_VR_SET_TARGET=name=>{const t=document.getElementById('nomadVrTarget');if(t)t.textContent=name?'🎯 Cible : '+name:'👉 Vise un élément pour voir son nom'};
 b.addEventListener('click',async()=>{
  const r=window.NOMAD_XR_RENDERER;if(!r){status('🥽 VR : moteur 3D pas encore prêt');return}
  if(r.xr&&r.xr.isPresenting){await r.xr.getSession()?.end();return}
  if(!navigator.xr){status('🥽 VR : WebXR n’est pas disponible sur cet appareil/navigateur');return}
  try{
   const supported=await navigator.xr.isSessionSupported('immersive-vr');
   if(!supported){status('🥽 VR : ce casque/navigateur ne prend pas en charge le mode immersif');return}
   const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});
   r.xr.enabled=true;r.xr.setReferenceSpaceType('local-floor');
   r.setAnimationLoop((time,frame)=>{
    if(frame)for(const t of (window.NOMAD_VR_TICKERS||[])){try{t.tick?.(time,frame)}catch(e){}}
    if(r.__nomadLastScene&&r.__nomadLastCamera)r.render(r.__nomadLastScene,r.__nomadLastCamera);
   });
   await r.xr.setSession(session);setHud(true);status('🥽 VR NOMAD activée · regarde autour de toi');
   session.addEventListener('end',()=>{r.setAnimationLoop(null);setHud(false);window.NOMAD_VR_SET_TARGET?.('');status('🥽 VR terminée · retour écran')});
  }catch(e){setHud(false);status('🥽 VR indisponible · '+(e?.message||'connexion au casque impossible'))}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton);else addButton();
})();