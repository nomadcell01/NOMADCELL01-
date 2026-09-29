(()=>{'use strict';
/* NOMAD VR — locomotion + contrôleurs + recentrage */
function boot(){
  const r=window.NOMAD_XR_RENDERER;
  if(!r||!r.xr)return setTimeout(boot,300);
  let session=null,refSpace=null,rig=null;
  const state={moveX:0,moveY:0,turn:0};
  function getCamera(){
    return window.NOMAD_XR_CAMERA||r.__nomadLastCamera||r.xr.getCamera?.(r.__nomadLastCamera);
  }
  function applyMovement(dt){
    const c=getCamera(); if(!c||!c.position)return;
    const speed=state.fast?3.2:1.8;
    const yaw=new THREE.Vector3();
    c.getWorldDirection(yaw); yaw.y=0; yaw.normalize();
    const right=new THREE.Vector3().crossVectors(yaw,new THREE.Vector3(0,1,0)).normalize();
    c.position.addScaledVector(yaw,state.moveY*speed*dt);
    c.position.addScaledVector(right,state.moveX*speed*dt);
    if(state.turn) c.rotation.y+=state.turn*dt;
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
    const oldLoop=r.__nomadOriginalSetAnimationLoop;
    r.setAnimationLoop((time,frame)=>{
      if(frame){
        const dt=Math.min(.05,(time-(window.__NOMAD_VR_LAST||time))/1000);
        window.__NOMAD_VR_LAST=time;
        if(s.inputSources)for(const src of s.inputSources)controllerInput(src);
        applyMovement(dt);
      }
      if(r.__nomadLastScene&&r.__nomadLastCamera)r.render(r.__nomadLastScene,r.__nomadLastCamera);
    });
    s.addEventListener('end',()=>{session=null;state.moveX=state.moveY=state.turn=0;window.__NOMAD_VR_LAST=0;});
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
      const base=await session.requestReferenceSpace('local-floor');
      if(r.xr.setReferenceSpaceType)r.xr.setReferenceSpaceType('local-floor');
      refSpace=base;
      status('🥽 VR recentrée');
    }catch(e){status('🥽 Recentrage VR indisponible');}
  });
  function status(msg){const p=document.getElementById('prompt');if(p)p.textContent=msg}
  const oldStatus=document.getElementById('vrBtn');
  if(oldStatus)oldStatus.addEventListener('click',()=>{b.style.display='inline-flex'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();