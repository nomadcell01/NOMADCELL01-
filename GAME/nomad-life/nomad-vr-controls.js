(()=>{'use strict';
/* NOMAD VR — locomotion + contrôleurs + recentrage */
function boot(){
  const r=window.NOMAD_XR_RENDERER;
  if(!r||!r.xr)return setTimeout(boot,300);
  let session=null,refSpace=null;
  const state={moveX:0,moveY:0,turn:0};
  function getCamera(){
    return window.NOMAD_XR_CAMERA||r.__nomadLastCamera||r.xr.getCamera?.(r.__nomadLastCamera);
  }
  function applyMovement(dt){
    const p=(window.NOMAD_PEOPLE||[]).find(x=>x?.userData?.isPlayer);
    const rig=p?.parent||null;
    if(!rig)return;
    const cam=r.__nomadLastCamera||r.xr.getCamera?.(r.__nomadLastCamera);
    if(!cam)return;
    const dir=new THREE.Vector3();cam.getWorldDirection(dir);dir.y=0;dir.normalize();
    const right=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0)).normalize();
    const speed=state.fast?3.2:1.8;
    if(state.moveY||state.moveX){
      rig.position.addScaledVector(dir,-state.moveY*speed*dt);
      rig.position.addScaledVector(right,-state.moveX*speed*dt);
    }
    if(Math.abs(state.turn)>0.45){
      const step=state.turn>0?-0.045:0.045;
      rig.rotation.y+=step;
      state.turn=0;
    }
  }
  function controllerInput(src){
    const g=src.gamepad;if(!g)return;
    const a=g.axes||[];
    state.moveX=Math.abs(a[0]||0)>.15?(a[0]||0):0;
    state.moveY=Math.abs(a[1]||0)>.15?-(a[1]||0):0;
    state.turn=Math.abs(a[2]||0)>.25?(a[2]||0)*1.8:0;
    state.fast=!!g.buttons?.[1]?.pressed;
  }
  function onSessionStart(s){
    session=s;
    refSpace=null;
    s.requestReferenceSpace?.('local-floor').then(x=>refSpace=x).catch(()=>{});
    r.setAnimationLoop((time,frame)=>{
      if(frame){
        const dt=Math.min(.05,(time-(window.__NOMAD_VR_LAST||time))/1000);
        window.__NOMAD_VR_LAST=time;
        if(s.inputSources)for(const src of s.inputSources)controllerInput(src);
        applyMovement(dt);
      }
      if(r.__nomadLastScene&&r.__nomadLastCamera)r.render(r.__nomadLastScene,r.__nomadLastCamera);
    });
    s.addEventListener('end',()=>{session=null;state.moveX=state.moveY=state.turn=0;window.__NOMAD_VR_LAST=0;const p=(window.NOMAD_PEOPLE||[]).find(x=>x?.userData?.isPlayer);const rig=p?.parent;if(rig){rig.position.set(0,0,0);rig.rotation.y=0;} });
  }
  const originalSetSession=r.xr.setSession.bind(r.xr);
  r.xr.setSession=async s=>{const out=await originalSetSession(s);onSessionStart(s);return out};
  const b=document.createElement('button');
  b.id='vrCenterBtn';b.textContent='🎯 Recentrer VR';b.title='Recentrer la position VR';
  b.style.display='none';
  const actions=document.getElementById('actions');if(actions)actions.appendChild(b);
  b.addEventListener('click',async()=>{
    if(!session)return;
    try{
      const p=(window.NOMAD_PEOPLE||[]).find(x=>x?.userData?.isPlayer);
      const rig=p?.parent;
      if(rig){rig.position.set(0,0,0);rig.rotation.y=0;}
      status('🥽 VR recentrée');
    }catch(e){status('🥽 Recentrage VR indisponible');}
  });
  function status(msg){const p=document.getElementById('prompt');if(p)p.textContent=msg}
  const oldStatus=document.getElementById('vrBtn');
  if(oldStatus)oldStatus.addEventListener('click',()=>{b.style.display='inline-flex'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();