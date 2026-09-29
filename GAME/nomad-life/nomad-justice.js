(()=>{'use strict';
const KEY='NOMAD_JUSTICE_V2';
const SIM_DAY_MS=1440*1200;
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
let cases={};
try{cases=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){cases={}}

const css=document.createElement('style');
css.textContent=`
#justiceBtn{position:absolute;z-index:12;left:12px;bottom:54px;background:#17252bf2;color:#fff;border:1px solid #ffffff22;border-radius:16px;padding:10px 13px;box-shadow:0 6px 22px #0005;font-weight:800}
#justicePanel{position:absolute;z-index:25;left:12px;top:74px;width:min(390px,calc(100vw - 24px));max-height:72vh;overflow:auto;background:#17252bf7;color:#fff;border:1px solid #ffffff1c;border-radius:22px;padding:15px;box-shadow:0 14px 45px #0006;backdrop-filter:blur(14px);display:none}
#justicePanel.open{display:block}.justiceHead{display:flex;justify-content:space-between;align-items:center}.justiceClose{min-height:34px;padding:5px 9px;background:#ffffff12;color:#fff}
.justiceIntro{font-size:11px;opacity:.78;margin:7px 0 12px;line-height:1.4}.justicePerson{background:#ffffff0b;border:1px solid #ffffff12;border-radius:14px;padding:10px;margin:8px 0}
.justicePerson b{font-size:13px}.justicePerson small{display:block;opacity:.75;margin-top:3px}.justiceActions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.justiceActions button{background:#243447;color:#fff;border:0;border-radius:10px;padding:8px 9px;font-size:11px}
.justiceActive{border-color:#e6c86a!important;background:#5a4b20!important}
`;
document.head.appendChild(css);

const btn=document.createElement('button');btn.id='justiceBtn';btn.textContent='⚖️ Justice';document.getElementById('game')?.appendChild(btn);
const panel=document.createElement('section');panel.id='justicePanel';panel.innerHTML='<div class="justiceHead"><b>⚖️ Justice NOMAD</b><button class="justiceClose">✕</button></div><div class="justiceIntro">Pas de prison dans NOMAD. Une infraction peut entraîner une <b>assignation à domicile</b> pendant une durée déterminée. La personne continue à vivre chez elle ; ses sorties sont interdites pendant la mesure.</div><div id="justiceList"></div>';document.getElementById('game')?.appendChild(panel);

function save(){try{localStorage.setItem(KEY,JSON.stringify(cases))}catch(e){}}
try{const old=JSON.parse(localStorage.getItem('NOMAD_JUSTICE_V1')||'{}')||{};Object.keys(old).forEach(n=>{if(!cases[n]&&old[n]){const x=old[n];const remain=Math.max(0,Number(x.end||0)-currentSimStamp());cases[n]={...x,endAt:Date.now()+remain*1200}});save()}catch(e){}
function nowCase(name){return cases[name]||null}
function people(){return (window.NOMAD_PEOPLE||[]).filter(p=>p&&p.userData&&p.userData.life&&!p.userData.isPlayer&&!p.userData.isHumanoid)}
function clockMinutes(){
 const el=document.getElementById('clock');const m=String(el?.textContent||'08:00').match(/(\d{1,2}):(\d{2})/);
 return m?Number(m[1])*60+Number(m[2]):480;
}
function currentSimStamp(){
 const n=clockMinutes();const c=window.__NOMAD_JUSTICE_STAMP;
 if(!c){window.__NOMAD_JUSTICE_STAMP={day:1,last:n};return 1*1440+n}
 if(n<c.last) c.day++;
 c.last=n;return c.day*1440+n;
}
function homeOf(p){
 const h=p.userData.life.home;
 return h&&Number.isFinite(Number(h.x))&&Number.isFinite(Number(h.z))?{x:Number(h.x),z:Number(h.z)}:{x:p.position.x,z:p.position.z};
}
function assign(p,days,reason='Infraction NOMAD'){
 const name=p.userData.life.name;
 const start=currentSimStamp();
 const durationDays=Math.max(1,days);
 cases[name]={name,reason:String(reason||'Infraction NOMAD'),start,end:start+durationDays*1440,endAt:Date.now()+durationDays*SIM_DAY_MS,home:homeOf(p),violations:0,active:true};
 p.userData.life.justiceStatus='Assignation à domicile';
 p.userData.life.justiceReason=String(reason||'Infraction NOMAD')+' · interdiction de sortie';
 p.userData.life.justiceUntil=cases[name].end;
 save();render();window.showPrompt&&window.showPrompt('⚖️ '+name+' : '+String(reason||'Infraction NOMAD')+' · assignation à domicile pour '+days+' jour'+(days>1?'s':''));
}
function lift(p){
 const name=p.userData.life.name;delete cases[name];
 p.userData.life.justiceStatus='Mesure terminée';p.userData.life.justiceReason='Fin de l’assignation à domicile';p.userData.life.justiceUntil=0;
 save();render();window.showPrompt&&window.showPrompt('✅ '+name+' : fin de l’assignation à domicile');
}
function enforce(){
 const stamp=currentSimStamp();
 people().forEach(p=>{
   const name=p.userData.life.name,c=cases[name];
   if(!c||!c.active)return;
   if(Date.now()>=Number(c.endAt||0)){lift(p);return}
   const dx=p.position.x-c.home.x,dz=p.position.z-c.home.z;
   if(Math.hypot(dx,dz)>2.2){
     c.violations=(c.violations||0)+1;
     p.position.x=c.home.x;p.position.z=c.home.z;
     p.userData.life.justiceViolationCount=c.violations;
     window.showPrompt&&window.showPrompt('⚖️ Sortie interdite · '+name+' doit rester à domicile');
     save();
   }
   p.userData.life.justiceStatus='Assignation à domicile';
   p.userData.life.justiceReason='Interdiction de sortie · '+Math.max(0,Math.ceil((c.end-stamp)/1440))+' j restante(s)';
   p.userData.life.justiceUntil=c.endAt||c.end;
 });
}
function remaining(c){return Math.max(0,Math.ceil((Number(c.endAt||0)-Date.now())/SIM_DAY_MS))}
function render(){
 const list=document.getElementById('justiceList');if(!list)return;
 const a=people();
 list.innerHTML=a.length?a.map(p=>{
   const l=p.userData.life,name=l.name,c=cases[name],r=c?remaining(c):0;
   return '<div class="justicePerson"><b>👤 '+esc(name)+'</b><small>'+(l.job?esc(l.job):'Habitant NOMAD')+'</small>'+
   (c?'<small>⚖️ <b>Assignation à domicile</b> · '+r+' jour'+(r>1?'s':'')+' restant'+(r>1?'s':'')+' · sorties interdites · violations : '+(c.violations||0)+'</small>':'<small>✅ Aucune mesure en cours</small>')+
   '<div class="justiceActions"><select data-reason="'+esc(name)+'"><option>Infraction NOMAD</option><option>Nuisance</option><option>Dégradation</option><option>Vol</option><option>Agression</option><option>Mise en danger</option></select></div><div class="justiceActions">'+
   '<button data-name="'+esc(name)+'" data-days="1">1 jour</button><button data-name="'+esc(name)+'" data-days="3">3 jours</button><button data-name="'+esc(name)+'" data-days="7">7 jours</button>'+
   (c?'<button class="justiceActive" data-lift="'+esc(name)+'">✓ Lever la mesure</button>':'')+
   '</div></div>';
 }).join(''):'<small>Aucun habitant concerné pour le moment.</small>';
 list.querySelectorAll('[data-days]').forEach(b=>b.addEventListener('click',()=>{
   const p=a.find(x=>x.userData.life.name===b.dataset.name);const sel=list.querySelector('select[data-reason="'+CSS.escape(b.dataset.name)+'"]');if(p)assign(p,Number(b.dataset.days),sel?sel.value:'Infraction NOMAD');
 }));
 list.querySelectorAll('[data-lift]').forEach(b=>b.addEventListener('click',()=>{
   const p=a.find(x=>x.userData.life.name===b.dataset.lift);if(p)lift(p);
 }));
}
function open(){render();panel.classList.add('open')}function close(){panel.classList.remove('open')}
btn.addEventListener('click',open);panel.querySelector('.justiceClose').addEventListener('click',close);
setInterval(()=>{enforce();if(panel.classList.contains('open'))render()},1000);
window.NOMAD_JUSTICE={cases,assign, lift, refresh:render};
})();