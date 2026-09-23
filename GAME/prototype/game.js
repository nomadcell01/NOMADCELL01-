let coins=100,materials=100,x=50,y=50;
const $=id=>document.getElementById(id);
function render(){$('coins').textContent=coins;$('materials').textContent=materials;$('player').style.left=x+'%';$('player').style.top=y+'%'}
function say(t){$('message').textContent=t}
document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>{
 const type=b.dataset.build,cost=type==='module'?50:20;
 if(coins<cost){say('🎙️ Petite voix : Vous êtes fauché. C’est un concept économique intéressant.');return}
 coins-=cost;
 if(type==='module'){$('module').classList.add('built');say('Module construit. Vous pouvez maintenant y habiter.');}
 else{const r=document.createElement('div');r.className='road';r.style.left='52%';r.style.top='54%';r.style.width='35%';r.style.transform='rotate(12deg)';$('terrain').appendChild(r);say('Route ajoutée. Les trajets vont changer.');}
 render();
});
$('parkGame').onclick=()=>{coins+=15;say('🎙️ Petite voix : Bravo. Vous avez gagné 15 pièces sans inonder votre maison.');render()};
$('workGame').onclick=()=>{if(materials>=10){materials-=10;coins+=10;say('Production réussie : 10 pièces gagnées.');}else say('Plus assez de matériaux.');render()};
$('voice').onclick=()=>say('🎙️ Petite voix : Je vous observe. Je ne décide pas à votre place. C’est probablement plus prudent ainsi.');
document.addEventListener('keydown',e=>{const s=3;if(e.key==='ArrowLeft')x=Math.max(2,x-s);if(e.key==='ArrowRight')x=Math.min(98,x+s);if(e.key==='ArrowUp')y=Math.max(2,y-s);if(e.key==='ArrowDown')y=Math.min(98,y+s);$('pos').textContent=(x>35&&x<65&&y>30&&y<65)?'HUB':'TERRE';render()});
render();