let state=JSON.parse(localStorage.getItem('nomadGame'))||{coins:1000000,materials:100,x:50,y:50,world:'earth',objects:[],floods:0,avatar:null,humanoid:null,wallet:{cash:100000,bank:900000},transactions:[],vehicle:null};
if(!state.wallet)state.wallet={cash:0,bank:state.coins||0}; if(state.wallet.cash===undefined)state.wallet.cash=0;if(state.wallet.bank===undefined)state.wallet.bank=state.coins||0;if(!state.transactions)state.transactions=[];if(!('vehicle'in state))state.vehicle=null;state.coins=state.wallet.cash+state.wallet.bank;
let selected=null;const $=id=>document.getElementById(id);function save(){state.coins=state.wallet.cash+state.wallet.bank;localStorage.setItem('nomadGame',JSON.stringify(state))}function say(t){$('message').textContent=t}function cost(t){return{module:50,farm:35,solar:30,road:20,canal:15}[t]}function label(t){return{module:'🏠 HABITAT',farm:'🌱 AGRICULTURE',solar:'☀️ ÉNERGIE',road:'🛣️ LIAISON',canal:'🌊 EAU'}[t]}
const vehicles={earth:[['🚶','À pied'],['🚗','Voiture classique'],['🔋','Voiture électrique'],['🏍️','Moto'],['🚲','Vélo'],['🛴','Trottinette'],['🛹','Skate'],['🛸','Hoverboard'],['🚕','Voiture autonome expérimentale'],['🚌','Bus'],['🚋','Tram'],['🚇','Métro'],['🚆','Train'],['✈️','Avion']],sea:[['🚶','À pied / passerelle'],['🚲','Vélo'],['🛴','Trottinette'],['🛹','Skate'],['🛸','Hoverboard'],['🏄','Planche de surf'],['⛵','Voilier'],['🚤','Bateau'],['🛥️','Bateau électrique'],['🤖','Bateau autonome expérimental']],space:[['🚶','À pied / station'],['🚈','Navette orbitale'],['🤖','Navette autonome expérimentale'],['🚆','Train orbital']],moon:[['🚶','À pied / combinaison'],['🚙','Rover lunaire'],['🤖','Rover autonome expérimental'],['🚈','Navette lunaire']],mars:[['🚶','À pied / combinaison'],['🚙','Rover martien'],['🤖','Rover autonome expérimental'],['🚈','Navette martienne']]};
function renderVehicles(){let box=$('vehicleChoices');box.innerHTML='';(vehicles[state.world]||vehicles.earth).forEach(v=>{let b=document.createElement('button');b.type='button';b.textContent=v[0]+' '+v[1];b.className=state.vehicle===v[1]?'selected':'';b.onclick=()=>{state.vehicle=v[1];$('vehicleLabel').textContent=v[0]+' '+v[1];say('🚦 Transport choisi : '+v[1]+'.');save();render()};box.appendChild(b)});if(!state.vehicle||!(vehicles[state.world]||[]).some(v=>v[1]===state.vehicle)){state.vehicle=null;$('vehicleLabel').textContent='À pied'} }
function render(){state.coins=state.wallet.cash+state.wallet.bank;$('coins').textContent=state.coins.toLocaleString('fr-FR');$('cash').textContent=state.wallet.cash.toLocaleString('fr-FR');$('bank').textContent=state.wallet.bank.toLocaleString('fr-FR');$('materials').textContent=state.materials;$('player').style.left=state.x+'%';$('player').style.top=state.y+'%';$('pos').textContent=state.world.toUpperCase();$('avatarLabel').textContent=state.avatar?.name||'—';$('botLabel').textContent=state.humanoid?.name||'—';let av=state.avatar?.symbol||'👤';let vv=(vehicles[state.world]||[]).find(v=>v[1]===state.vehicle);$('player').textContent=vv?vv[0]:av;$('player').className='avatar-player';$('vehicleLabel').textContent=vv?vv[0]+' '+vv[1]:'À pied';document.querySelectorAll('.placed').forEach(e=>e.remove());state.objects.filter(o=>o.world===state.world).forEach(o=>{let e=document.createElement('div');e.className='placed '+o.type+(o.damaged?' damaged':'');e.textContent=label(o.type);e.style.left=o.x+'%';e.style.top=o.y+'%';$('terrain').appendChild(e)});renderVehicles()}
function spend(n){if(state.coins<n){say('🎙️ Petite voix : Votre compte est vide. La construction attendra.');return false}state.wallet.bank-=n;state.coins=state.wallet.cash+state.wallet.bank;state.transactions.unshift({type:'depense',amount:n,label:'Construction'});return true}function addMoney(n,labelTx){state.wallet.bank+=n;state.coins=state.wallet.cash+state.wallet.bank;state.transactions.unshift({type:'gain',amount:n,label:labelTx})}
function setupCreator(){let ac=[['👤 Explorateur','👤'],['🧑‍🔧 Bâtisseur','🧑‍🔧'],['🧑‍🔬 Chercheur','🧑‍🔬'],['🧑‍🌾 Cultivateur','🧑‍🌾']];let bc=[['🤖 Humanoïde polyvalent','🤖'],['🦾 Constructeur','🦾'],['🧑‍🚀 Explorateur','🧑‍🚀'],['🛠️ Technicien','🛠️']];$('avatarChoices').innerHTML=ac.map((x,i)=>'<button data-a="'+i+'">'+x[0]+'</button>').join('');$('botChoices').innerHTML=bc.map((x,i)=>'<button data-b="'+i+'">'+x[0]+'</button>').join('');let av=0,bo=0;document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{av=+b.dataset.a;document.querySelectorAll('[data-a]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});document.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{bo=+b.dataset.b;document.querySelectorAll('[data-b]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});$('startGame').onclick=()=>{let n=$('avatarName').value.trim()||'Nomad';let h=$('botName').value.trim()||'Mon humanoïde';state.avatar={name:n,symbol:ac[av][1],style:ac[av][0]};state.humanoid={name:h,symbol:bc[bo][1],style:bc[bo][0]};save();$('creation').style.display='none';say('🚀 Bienvenue '+n+' ! '+h+' vous accompagne. Vous disposez de '+state.coins.toLocaleString('fr-FR')+' NOMAD.');render()}}
if(!state.avatar||!state.humanoid)setupCreator();else $('creation').style.display='none';document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{selected=b.dataset.place;$('selection').textContent='Construction : '+label(selected)+' — touchez votre terrain.'});$('terrain').onclick=e=>{if(!selected||e.target!==$('terrain'))return;let r=$('terrain').getBoundingClientRect(),px=(e.clientX-r.left)/r.width*100,py=(e.clientY-r.top)/r.height*100;if(!spend(cost(selected)))return;state.objects.push({type:selected,x:Math.max(3,Math.min(92,px)),y:Math.max(3,Math.min(92,py)),world:state.world});say(label(selected)+' placé dans votre monde.');selected=null;$('selection').textContent='Aucune construction sélectionnée.';save();render()};
function buyCash(n){if(state.wallet.bank<n){say('💸 Fonds bancaires insuffisants.');return}state.wallet.bank-=n;state.wallet.cash+=n;state.transactions.unshift({type:'retrait',amount:n,label:'Retrait fictif'});say('🏧 Retrait de '+n.toLocaleString('fr-FR')+' NOMAD.');save();render()}function depositCash(n){if(state.wallet.cash<n){say('💵 Espèces insuffisantes.');return}state.wallet.cash-=n;state.wallet.bank+=n;state.transactions.unshift({type:'depot',amount:n,label:'Dépôt fictif'});say('🏦 Dépôt de '+n.toLocaleString('fr-FR')+' NOMAD.');save();render()}
function switchWorld(w){state.world=w;state.x=50;state.y=50;state.vehicle=null;let info={earth:'🌍 Terre : ville NOMAD existante. Greffez votre plateforme ou partez construire ailleurs.',sea:'🌊 Mer / Océan : ville flottante NOMAD existante. Côte, haute mer et zones sous-marines.',space:'🛰️ Espace : ville orbitale NOMAD déjà habitée.',moon:'🌙 Lune : ville NOMAD déjà installée.',mars:'🔴 Mars : ville NOMAD déjà habitée.'};$('worldInfo').textContent=info[w];say('Vous arrivez dans '+w.toUpperCase()+'. Votre avatar et votre humanoïde vous accompagnent.');save();render()}
$('earth').onclick=()=>switchWorld('earth');$('sea').onclick=()=>switchWorld('sea');$('space').onclick=()=>switchWorld('space');$('moon').onclick=()=>switchWorld('moon');$('mars').onclick=()=>switchWorld('mars');$('editAvatar').onclick=()=>{$('creation').style.display='grid';$('avatarName').value=state.avatar?.name||'';$('botName').value=state.humanoid?.name||''};$('rain').onclick=()=>{state.floods++;let d=0;state.objects=state.objects.map(o=>{if(o.world==='earth'&&(o.type==='module'||o.type==='farm')&&o.x>68&&Math.random()<.75){d++;return{...o,damaged:true}}return o});say(d?'🌧️ Inondation ! '+d+' construction(s) endommagée(s).':'🌧️ Forte pluie. Votre plateforme tient bon.');save();render()};$('storm').onclick=()=>{let t=state.objects.filter(o=>o.world==='sea');let d=t.length&&Math.random()<.6?t[Math.floor(Math.random()*t.length)]:null;if(d)d.damaged=true;say(d?'🌊 Tempête océanique : une installation est endommagée.':'🌊 Tempête : la ville NOMAD résiste.');save();render()};$('spaceEvent').onclick=()=>{say(Math.random()<.5?'☄️ Micrométéorite : réparation nécessaire.':'🛰️ Incident technique : maintenance en cours.');if(state.materials>=10)state.materials-=10;save();render()};$('moonEvent').onclick=()=>{say('🌙 Alerte lunaire : poussière et environnement hostile. Sécurisation en cours.');save();render()};$('marsEvent').onclick=()=>{say(Math.random()<.5?'🔴 Tempête de poussière martienne : énergie perturbée.':'🔴 Incident de ressource : production réorganisée.');if(state.materials>=10)state.materials-=10;save();render()};$('parkGame').onclick=()=>{addMoney(15,'Activité');say('🎯 Activité réussie : +15 NOMAD.');save();render()};$('workGame').onclick=()=>{if(state.materials>=10){state.materials-=10;addMoney(10,'Production');say('🏭 Production réussie : +10 NOMAD.')}else say('Plus assez de matériaux.');save();render()};$('withdraw').onclick=()=>{let n=Math.max(0,Number($('cashAmount').value)||0);if(n>0)buyCash(n)};$('deposit').onclick=()=>{let n=Math.max(0,Number($('cashAmount').value)||0);if(n>0)depositCash(n)};$('save').onclick=()=>{save();say('💾 Sauvegarde locale effectuée.')};$('reset').onclick=()=>{if(confirm('Réinitialiser la partie locale ?')){localStorage.removeItem('nomadGame');location.reload()}};$('voice').onclick=()=>say('🎙️ Petite voix : Je vous observe. Je ne décide pas à votre place.');document.addEventListener('keydown',e=>move(e.key));document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>move({left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}[b.dataset.move]));function move(k){let s=state.vehicle?6:4;if(k==='ArrowLeft')state.x=Math.max(2,state.x-s);if(k==='ArrowRight')state.x=Math.min(98,state.x+s);if(k==='ArrowUp')state.y=Math.max(2,state.y-s);if(k==='ArrowDown')state.y=Math.min(98,state.y+s);save();render()}save();render();
/* V1.0 — carte au centre : construire, sélectionner, déplacer, détruire */
let mapTool='select', movingObject=null, movingEl=null, roadDrawing=false;
const terrain=$('terrain');

function setMapTool(tool){
  mapTool=tool; selected=null; movingObject=null; movingEl=null;
  document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('selected',b.dataset.tool===tool));
  $('selection').textContent='Outil : '+({select:'Sélection',move:'Déplacer',delete:'Détruire'}[tool]||'Construction');
}
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setMapTool(b.dataset.tool));
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{
  selected=b.dataset.place; mapTool='build';
  document.querySelectorAll('[data-tool]').forEach(x=>x.classList.remove('selected'));
  $('selection').textContent='Construction : '+label(selected)+' — touchez la carte pour placer.';
  say('🛠️ '+label(selected)+' : choisissez un emplacement sur la carte.');
});
if(cancelBuild)cancelBuild.onclick=()=>{selected=null;mapTool='select';movingObject=null;movingEl=null;setMapTool('select');$('selection').textContent='Aucune construction sélectionnée.';say('Mode construction arrêté.')};

function mapPosition(e){
  const r=terrain.getBoundingClientRect();
  return {x:Math.max(3,Math.min(97,(e.clientX-r.left)/r.width*100)),y:Math.max(3,Math.min(97,(e.clientY-r.top)/r.height*100))};
}
function nearestObject(e){
  const p=mapPosition(e); let best=null,dist=6;
  state.objects.forEach((o,i)=>{
    if(o.world!==state.world)return;
    const d=Math.hypot(o.x-p.x,o.y-p.y);
    if(d<dist){dist=d;best={o,i}}
  });
  return best;
}
function objectElement(target){
  return target?.closest?.('.placed')||null;
}
function selectObject(hit){
  if(!hit){$('objectInfo').textContent='Aucune construction à proximité.';return}
  const o=hit.o;
  $('objectInfo').textContent=label(o.type)+' · position '+Math.round(o.x)+'% / '+Math.round(o.y)+'%'+(o.damaged?' · ⚠️ endommagé':'')+' · coût '+cost(o.type)+' NOMAD';
  $('selection').textContent='Sélection : '+label(o.type);
  say('👆 '+label(o.type)+' sélectionné.');
}
function placeObject(e,type,quiet=false){
  const p=mapPosition(e);
  if(type==='road' && state.objects.some(o=>o.world===state.world&&o.type==='road'&&Math.hypot(o.x-p.x,o.y-p.y)<2.5))return false;
  if(!spend(cost(type)))return false;
  state.objects.push({type,x:p.x,y:p.y,world:state.world});
  if(!quiet){say(label(type)+' placé.');selected=null;mapTool='select';$('selection').textContent='Aucune construction sélectionnée.'}
  save();render();return true;
}
terrain.addEventListener('pointerdown',e=>{
  const el=objectElement(e.target);
  if(mapTool==='build'&&selected){
    if(selected==='road'){roadDrawing=true;terrain.setPointerCapture?.(e.pointerId)}
    placeObject(e,selected,selected==='road');
    return;
  }
  const hit=nearestObject(e);
  if(mapTool==='move'&&hit){
    movingObject=hit.i; movingEl=el||[...terrain.querySelectorAll('.placed')].find(x=>Math.abs(parseFloat(x.style.left)-hit.o.x)<.2&&Math.abs(parseFloat(x.style.top)-hit.o.y)<.2);
    terrain.setPointerCapture?.(e.pointerId);
    say('↔️ Déplacez '+label(hit.o.type)+' sur la carte.');
  } else if(mapTool==='delete'&&hit){
    state.objects.splice(hit.i,1);
    state.materials+=Math.max(1,Math.floor((cost(hit.o.type)||10)*0.6));
    say('🗑️ '+label(hit.o.type)+' détruit. Une partie des matériaux est récupérée.');
    save();render();
  } else if(mapTool==='select'){
    selectObject(hit);
  }
});
terrain.addEventListener('pointermove',e=>{
  if(roadDrawing&&selected==='road'){placeObject(e,'road',true);return}
  if(movingObject===null)return;
  const o=state.objects[movingObject]; if(!o)return;
  const p=mapPosition(e); o.x=p.x;o.y=p.y;
  if(movingEl){movingEl.style.left=o.x+'%';movingEl.style.top=o.y+'%';}
});
terrain.addEventListener('pointerup',()=>{
  if(roadDrawing){roadDrawing=false;selected=null;mapTool='select';$('selection').textContent='Aucune construction sélectionnée.';save();render();return}
  if(movingObject!==null){movingObject=null;movingEl=null;save();say('📍 Construction déplacée.');render();}
});
terrain.addEventListener('pointercancel',()=>{roadDrawing=false;movingObject=null;movingEl=null;});
terrain.addEventListener('click',e=>{
  if(selected||mapTool==='build')return;
  const hit=nearestObject(e);
  if(mapTool==='select')selectObject(hit);
});
