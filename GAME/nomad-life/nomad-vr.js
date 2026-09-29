(()=>{'use strict';
if(!window.THREE)return;
const OriginalRenderer=THREE.WebGLRenderer;
if(!window.__NOMAD_XR_PATCHED){
  window.__NOMAD_XR_PATCHED=true;
  THREE.WebGLRenderer=function(...args){
    const r=new OriginalRenderer(...args);
    window.NOMAD_XR_RENDERER=r;
    const originalRender=r.render.bind(r);
    r.__nomadLastScene=null;r.__nomadLastCamera=null;
    r.render=function(scene,camera){r.__nomadLastScene=scene;r.__nomadLastCamera=camera;return originalRender(scene,camera)};
    r.__nomadOriginalSetAnimationLoop=r.setAnimationLoop.bind(r);
    return r;
  };
  THREE.WebGLRenderer.prototype=OriginalRenderer.prototype;
}
function status(msg){const p=document.getElementById('prompt');if(p)p.textContent=msg}
function addButton(){
  const actions=document.getElementById('actions');if(!actions||document.getElementById('vrBtn'))return;
  const b=document.createElement('button');b.id='vrBtn';b.textContent='🥽 VR NOMAD';b.title='Jouer en réalité virtuelle';actions.appendChild(b);
  b.addEventListener('click',async()=>{
    const r=window.NOMAD_XR_RENDERER;
    if(!r){status('🥽 VR : moteur 3D pas encore prêt');return}
    if(!navigator.xr){status('🥽 VR : WebXR n’est pas disponible sur cet appareil/navigateur');return}
    try{
      if(r.xr&&r.xr.isPresenting){await r.xr.getSession()?.end();return}
      const supported=await navigator.xr.isSessionSupported('immersive-vr');
      if(!supported){status('🥽 VR : ce casque/navigateur ne prend pas en charge le mode immersif');return}
      const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});
      r.xr.enabled=true;
      r.xr.setReferenceSpaceType('local-floor');
      r.setAnimationLoop(()=>{if(r.__nomadLastScene&&r.__nomadLastCamera)r.render(r.__nomadLastScene,r.__nomadLastCamera)});
      await r.xr.setSession(session);
      session.addEventListener('end',()=>{r.setAnimationLoop(null);status('🥽 VR terminée · retour écran');});
      status('🥽 VR NOMAD activée · regarde autour de toi');
    }catch(e){status('🥽 VR indisponible · '+(e?.message||'connexion au casque impossible'))}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addButton);else addButton();
})();