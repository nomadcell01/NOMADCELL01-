(()=>{'use strict';
const KEY='NOMAD_REAL_ARCHIVE_V1';
const REAL_SITE='https://nomadcell01.github.io/NOMADCELL01-/';
const entries=[
{id:'vision',type:'REAL',icon:'📖',title:'NOMAD — Vision du projet',text:'NOMAD imagine des habitats et des technologies au service du quotidien et du vivant : autonomie, coopération, respect, confidentialité et accompagnement de la vie.',tags:['NOMAD','vision','vivant']},
{id:'nomadcell01',type:'REAL',icon:'🧪',title:'NOMADCELL01 — laboratoire et identité',text:'NOMADCELL01 est l’identité de travail du projet : habitat durable, robotique, intelligence artificielle, modularité et expérimentation.',tags:['NOMADCELL01','laboratoire','habitat']},
{id:'terre',type:'CONCEPT',icon:'🌍',title:'NOMAD TERRE',text:'Concept d’habitat NOMAD sur Terre : autonomie, domotique, robotique et intégration de technologies modulaires.',tags:['TERRE','habitat']},
{id:'beach',type:'CONCEPT',icon:'🏖️',title:'NOMAD BEACH',text:'Concept d’habitat NOMAD Beach, pensé autour de cellules modulaires et de solutions autonomes adaptées au littoral.',tags:['BEACH','cellules']},
{id:'mer',type:'CONCEPT',icon:'🌊',title:'NOMAD MER',text:'Concept de village flottant modulaire organisé autour d’un espace central, avec habitat, agriculture, énergie, recherche, robotique, fabrication, eau et logistique.',tags:['MER','flottant']},
{id:'robotique',type:'CONCEPT',icon:'🤖',title:'Robotique & humanoïdes',text:'Pistes de recherche et de conception autour de robots et humanoïdes NOMAD, avec une logique d’accompagnement de la vie et de pièces remplaçables.',tags:['robotique','humanoïdes']},
{id:'theo',type:'CONCEPT',icon:'🧠',title:'T.H.E.O. Avel',text:'T.H.E.O. est une intelligence conçue pour accompagner l’univers NOMAD. Architecture de référence : CAPTEURS → DOMOTIQUE → T.H.E.O. → ACTIONNEURS.',tags:['T.H.E.O.','IA']},
{id:'jervis',type:'CONCEPT',icon:'🦾',title:'JERVIS',text:'Projet d’assistance et de robotique évolutive lié à l’écosystème NOMAD, avec continuité de mémoire, coordination et interaction physique.',tags:['JERVIS','robotique']},
{id:'documents',type:'REAL',icon:'📑',title:'Livre blanc, cahier des charges & archives',text:'Les documents réels du projet peuvent être référencés ici au fur et à mesure de leur publication : livre blanc, cahier des charges, recherches, plans, images et prototypes.',tags:['archives','documents']},
{id:'lune',type:'PROJECTION',icon:'🌙',title:'NOMAD LUNE',text:'Projection de l’univers du jeu. La Lune n’est pas présentée comme une réalisation actuelle du projet réel.',tags:['jeu','projection']},
{id:'mars',type:'PROJECTION',icon:'🔴',title:'NOMAD MARS',text:'Projection de l’univers du jeu. Mars n’est pas présentée comme une réalisation actuelle du projet réel.',tags:['jeu','projection']},
{id:'espace',type:'PROJECTION',icon:'🚀',title:'NOMAD ESPACE',text:'Projection de l’univers du jeu et de ses futurs environnements. Les éléments spatiaux sont séparés des réalisations et concepts réels documentés.',tags:['jeu','projection']}
];
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function style(){
if(document.getElementById('nomadArchiveStyle'))return;
const st=document.createElement('style');st.id='nomadArchiveStyle';
st.textContent='#nomadArchivePanel{position:fixed;inset:5vh 4vw;z-index:1200;background:rgba(8,16,25,.97);color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:24px;box-shadow:0 25px 80px rgba(0,0,0,.55);display:none;overflow:hidden;font-family:system-ui,sans-serif}#nomadArchivePanel.open{display:flex;flex-direction:column}#nomadArchiveHead{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12)}#nomadArchiveHead b{font-size:20px}#nomadArchiveClose{border:0;background:#243447;color:#fff;border-radius:12px;padding:8px 12px;font-size:18px}#nomadArchiveBody{display:grid;grid-template-columns:minmax(180px,.8fr) minmax(240px,1.5fr);min-height:0;flex:1}#nomadArchiveList{padding:14px;overflow:auto;border-right:1px solid rgba(255,255,255,.1)}.archiveEntry{display:block;width:100%;text-align:left;border:1px solid rgba(255,255,255,.1);background:#142333;color:#fff;border-radius:14px;padding:12px;margin-bottom:9px}.archiveEntry.active{outline:2px solid #75d9ff;background:#1b3449}.archiveEntry small{display:block;opacity:.72;margin-top:4px}.archiveTag{display:inline-block;font-size:10px;border-radius:8px;padding:3px 6px;margin-bottom:5px;background:#34536b}.archiveTag.real{background:#315c45}.archiveTag.concept{background:#62532f}.archiveTag.projection{background:#633d58}#nomadArchiveDetail{padding:24px;overflow:auto}#nomadArchiveDetail h2{margin:8px 0 10px;font-size:24px}#nomadArchiveDetail p{line-height:1.55;opacity:.92}.archiveMeta{font-size:12px;opacity:.68}.archiveSite{display:inline-block;margin-top:18px;padding:11px 14px;border-radius:12px;background:#246b88;color:#fff;text-decoration:none}.archiveNotice{margin-top:16px;padding:12px;border-radius:12px;background:rgba(255,255,255,.07);font-size:13px}.archiveCreator{display:flex;gap:8px;margin-top:18px}.archiveCreator input{flex:1;border:0;border-radius:10px;padding:10px;background:#fff;color:#111}.archiveCreator button{border:0;border-radius:10px;padding:10px 12px;background:#2f6d54;color:#fff}@media(max-width:700px){#nomadArchivePanel{inset:2vh 2vw}#nomadArchiveBody{grid-template-columns:1fr}.archiveEntry{display:inline-block;width:auto;margin-right:6px}#nomadArchiveList{max-height:31vh;border-right:0;border-bottom:1px solid rgba(255,255,255,.1)}}';
document.head.appendChild(st);
}
function getNotes(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
function renderDetail(id){
const e=entries.find(x=>x.id===id)||entries[0],box=document.getElementById('nomadArchiveDetail');if(!box)return;
const notes=getNotes().filter(x=>x.entryId===e.id);
box.innerHTML='<div class="archiveMeta">'+esc(e.icon)+' '+esc(e.type)+' · archive NOMAD</div><h2>'+esc(e.title)+'</h2><p>'+esc(e.text)+'</p><div class="archiveMeta">Mots-clés : '+esc(e.tags.join(' · '))+'</div>'+
(e.id==='lune'||e.id==='mars'||e.id==='espace'?'<div class="archiveNotice">🎮 <b>Projection du jeu</b> — cet élément appartient à l’univers simulé et ne doit pas être présenté comme une réalisation réelle actuelle.</div>':'')+
(e.type==='REAL'?'<div class="archiveNotice">🌍 <b>Projet réel</b> — cette fiche sert de mémoire publique du projet documenté.</div>':'')+
(e.type==='CONCEPT'?'<div class="archiveNotice">🛠️ <b>Concept en développement</b> — idée ou architecture de projet, à distinguer d’un prototype ou d’une réalisation finalisée.</div>':'')+
'<a class="archiveSite" href="'+REAL_SITE+'" target="_blank" rel="noopener">🌐 Ouvrir le site réel de NOMAD</a>'+
'<div class="archiveCreator"><input id="archiveNoteInput" placeholder="Ajouter une note publique du créateur…"><button id="archiveNoteSave">Ajouter</button></div>'+
(notes.length?'<div class="archiveNotice">📝 '+notes.map(n=>esc(n.text)).join('<br>')+'</div>':'');
document.getElementById('archiveNoteSave')?.addEventListener('click',()=>{const v=document.getElementById('archiveNoteInput')?.value.trim();if(!v)return;const all=getNotes();all.push({entryId:e.id,text:v,at:new Date().toISOString()});localStorage.setItem(KEY,JSON.stringify(all));renderDetail(e.id);});
}
function openArchive(preselect){
style();let p=document.getElementById('nomadArchivePanel');
if(!p){p=document.createElement('section');p.id='nomadArchivePanel';p.innerHTML='<div id="nomadArchiveHead"><div><b>📚 Archives NOMAD</b><div style="font-size:12px;opacity:.7">Bibliothèque · couloirs · ordinateurs · musée</div></div><button id="nomadArchiveClose">✕</button></div><div id="nomadArchiveBody"><div id="nomadArchiveList"></div><div id="nomadArchiveDetail"></div></div>';document.body.appendChild(p);p.querySelector('#nomadArchiveClose').onclick=()=>p.classList.remove('open');}
const list=p.querySelector('#nomadArchiveList');list.innerHTML=entries.map(e=>'<button class="archiveEntry" data-id="'+e.id+'"><span class="archiveTag '+e.type.toLowerCase()+'">'+esc(e.type)+'</span><br>'+esc(e.icon)+' '+esc(e.title)+'<small>'+esc(e.tags.join(' · '))+'</small></button>').join('');
list.querySelectorAll('.archiveEntry').forEach(b=>b.onclick=()=>{list.querySelectorAll('.archiveEntry').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderDetail(b.dataset.id)});
p.classList.add('open');const target=preselect&&entries.some(e=>e.id===preselect)?preselect:entries[0].id;list.querySelector('[data-id="'+target+'"]')?.click();
}
function injectButton(){
const actions=document.getElementById('actions');if(!actions||document.getElementById('realArchiveBtn'))return;
const b=document.createElement('button');b.id='realArchiveBtn';b.textContent='📚 Archives';b.onclick=()=>openArchive();actions.appendChild(b);
}
function hubNotice(){
const name=(document.getElementById('worldName')?.textContent||'').toUpperCase();
if(name.includes('HUB'))window.showPrompt&&window.showPrompt('📚 HUB · bibliothèque, archives et mémoire réelle de NOMAD disponibles');
}
function init(){injectButton();document.querySelectorAll('[data-world]').forEach(b=>b.addEventListener('click',()=>setTimeout(hubNotice,100)));setTimeout(hubNotice,800);}
window.NOMAD_REAL_ARCHIVE={entries,open:openArchive};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();