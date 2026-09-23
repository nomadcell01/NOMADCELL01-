let state=JSON.parse(localStorage.getItem('nomadGame'))||{coins:100,materials:100,x:50,y:50,built:false,objects:[],floods:0};
const $=id=>document.getElementById(id);
function save(){localStorage.setItem('nomadGame',JSON.stringify(state))}
function say(t){$('message').textContent=t}
function render(){
 $('coins').textContent=state.coins;$('materials').textContent=state.materials;
 $('player').style.left=state.x+'%';$('player').style.top=state.y+'%';
 $('module').classList.toggle('built',state.built);
 $('pos').textContent=(state.x>35&&state.x<65&&state.y>30&&state.y<65)?'HUB':'TERRE';
 document.querySelectorAll('.placed').forEach(e=>e.remove());
 state.objects.forEach(o=>{const e=document.createElement('div');e.className='placed '+o.type;e.textContent=o.type==='road'?'ROUTE':'MODULE';e.style.left=o.x+'%';e.style.top=o.y+'%';$('terrain').appendChild(e)});
}
function spend(n){if(state.coins<n){say('🎙️ Petite voix : Vous êtes fauché. C’est un concept économique intéressant.');return false}state.coins-=n;return true}
document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>{
 const type=b.dataset.build;
 if(type==='module'){if(!spend(50))return;state.built=true;say('Module construit. Et cette fois, essayez de ne pas le mettre dans une rivière.')}
 if(type==='road'){if(!spend(20))return;state.objects.push({type:'road',x:52,y:54});say('Route ajoutée. Les trajets vont changer.')}
 save();render();
});
$('parkGame').onclick=()=>{state.coins+=15;say('🎙️ Petite voix : Bravo. 15 pièces gagnées. Aucun dégât collatéral. Pour le moment.');save();render()};
$('workGame').onclick=()=>{if(state.materials>=10){state.materials-=10;state.coins+=10;say('Production réussie : +10 pièces.');}else say('Plus assez de matériaux.');save();render()};
$('buy').onclick=()=>{if(spend(25)){state.materials+=50;say('Achat effectué au HUB NOMAD : +50 matériaux.');save();render()}};
$('sell').onclick=()=>{if(state.materials>=20){state.materials-=20;state.coins+=15;say('20 matériaux récupérés et revendus : +15 pièces.');save();render()}else say('Pas assez de matériaux récupérés.')};
$('save').onclick=()=>{save();say('Sauvegarde locale effectuée. Pas besoin de Wi‑Fi.')};
$('reset').onclick=()=>{if(confirm('Réinitialiser la partie locale ?')){localStorage.removeItem('nomadGame');location.reload()}};
$('canal').onclick=()=>{if(!spend(15))return;state.objects.push({type:'canal',x:72,y:48});say('Canal creusé. La pluie décidera maintenant si votre idée était brillante.');save();render()};
$('rain').onclick=()=>{
 state.floods++;let hit=state.built&&state.y>55;
 if(hit){state.materials=Math.max(0,state.materials-20);say('🌧️ Inondation ! Votre module a pris l’eau. -20 matériaux.');}
 else say('🌧️ Forte pluie : le terrain absorbe pour cette fois. La nature vous laisse une chance.');
 save();render()
};
$('park').onclick=()=>say('🎙️ Petite voix : Le parc est interactif. Touchez-le pour découvrir une activité.');
$('voice').onclick=()=>say('🎙️ Petite voix : Je vous observe. Je ne décide pas à votre place. C’est probablement plus prudent ainsi.');
document.addEventListener('keydown',e=>{const s=3;if(e.key==='ArrowLeft')state.x=Math.max(2,state.x-s);if(e.key==='ArrowRight')state.x=Math.min(98,state.x+s);if(e.key==='ArrowUp')state.y=Math.max(2,state.y-s);if(e.key==='ArrowDown')state.y=Math.min(98,state.y+s);save();render()});
document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const d=b.dataset.move,s=4;if(d==='left')state.x=Math.max(2,state.x-s);if(d==='right')state.x=Math.min(98,state.x+s);if(d==='up')state.y=Math.max(2,state.y-s);if(d==='down')state.y=Math.min(98,state.y+s);save();render()});
render();