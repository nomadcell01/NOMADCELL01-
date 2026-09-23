let state=JSON.parse(localStorage.getItem('nomadGame'))||{coins:100,materials:100,x:50,y:50,objects:[],floods:0};
let selected=null;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem('nomadGame',JSON.stringify(state))}
function say(t){$('message').textContent=t}
function cost(type){return {module:50,farm:35,solar:30,road:20,canal:15}[type]}
function label(type){return {module:'🏠 MODULE',farm:'🌱 FERME',solar:'☀️ SOLAIRE',road:'🛣️ ROUTE',canal:'🌊 CANAL'}[type]}
function render(){
 $('coins').textContent=state.coins;$('materials').textContent=state.materials;
 $('player').style.left=state.x+'%';$('player').style.top=state.y+'%';
 $('pos').textContent=(state.x>35&&state.x<65&&state.y>30&&state.y<65)?'HUB':'TERRE';
 document.querySelectorAll('.placed').forEach(e=>e.remove());
 state.objects.forEach((o,i)=>{const e=document.createElement('div');e.className='placed '+o.type+(o.damaged?' damaged':'');e.textContent=label(o.type);e.style.left=o.x+'%';e.style.top=o.y+'%';e.title='Objet '+(i+1);$('terrain').appendChild(e)});
}
function spend(n){if(state.coins<n){say('🎙️ Petite voix : Vous êtes fauché. La construction attendra.');return false}state.coins-=n;return true}
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{selected=b.dataset.place;$('selection').textContent='Construction sélectionnée : '+label(selected)+' — touche le terrain.';say('📍 Choisis maintenant l’endroit. C’est toi qui décides.');});
$('terrain').onclick=e=>{
 if(!selected||e.target!==$('terrain'))return;
 const r=$('terrain').getBoundingClientRect(),px=((e.clientX-r.left)/r.width)*100,py=((e.clientY-r.top)/r.height)*100;
 if(selected==='module'&&px>68){say('🎙️ Petite voix : Construire dans l’eau ? Audacieux. Mais non.');return}
 if(!spend(cost(selected)))return;
 state.objects.push({type:selected,x:Math.max(3,Math.min(92,px)),y:Math.max(3,Math.min(92,py))});
 say(label(selected)+' placé. Le monde va maintenant vivre avec votre décision.');selected=null;$('selection').textContent='Aucune construction sélectionnée.';save();render();
};
$('rain').onclick=()=>{
 state.floods++;let damaged=0;
 state.objects=state.objects.map(o=>{if((o.type==='module'||o.type==='farm')&&o.x>68&&Math.random()<.75){damaged++;return {...o,damaged:true}}return o});
 if(damaged){state.materials=Math.max(0,state.materials-damaged*15);say('🌧️ Inondation ! '+damaged+' construction(s) ont pris l’eau. -'+damaged*15+' matériaux.')}else say('🌧️ Forte pluie. Cette fois, vos constructions ont tenu.');
 save();render();
};
$('parkGame').onclick=()=>{state.coins+=15;say('🎯 Parc réussi : +15 pièces. Aucun arbre n’a porté plainte.');save();render()};
$('workGame').onclick=()=>{if(state.materials>=10){state.materials-=10;state.coins+=10;say('🏭 Production réussie : +10 pièces.')}else say('Plus assez de matériaux.');save();render()};
$('buy').onclick=()=>{if(spend(25)){state.materials+=50;say('HUB NOMAD : +50 matériaux.');save();render()}};
$('sell').onclick=()=>{if(state.materials>=20){state.materials-=20;state.coins+=15;say('20 matériaux récupérés et revendus : +15 pièces.')}else say('Pas assez de matériaux récupérés.');save();render()};
$('save').onclick=()=>{save();say('💾 Sauvegarde locale effectuée. Pas besoin de Wi‑Fi.')};
$('reset').onclick=()=>{if(confirm('Réinitialiser la partie locale ?')){localStorage.removeItem('nomadGame');location.reload()}};
$('voice').onclick=()=>say('🎙️ Petite voix : Je vous observe. Je ne décide pas à votre place. C’est probablement plus prudent ainsi.');
document.addEventListener('keydown',e=>move(e.key));
document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>move({left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}[b.dataset.move]));
function move(k){const s=4;if(k==='ArrowLeft')state.x=Math.max(2,state.x-s);if(k==='ArrowRight')state.x=Math.min(98,state.x+s);if(k==='ArrowUp')state.y=Math.max(2,state.y-s);if(k==='ArrowDown')state.y=Math.min(98,state.y+s);save();render()}
render();