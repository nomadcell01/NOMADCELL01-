let state=JSON.parse(localStorage.getItem('nomadGame'))||{coins:100,materials:100,x:50,y:50,world:'earth',objects:[],floods:0};
let selected=null;const $=id=>document.getElementById(id);
function save(){localStorage.setItem('nomadGame',JSON.stringify(state))}
function say(t){$('message').textContent=t}
function cost(t){return{module:50,farm:35,solar:30,road:20,canal:15}[t]}
function label(t){return{module:'🏠 HABITAT',farm:'🌱 AGRICULTURE',solar:'☀️ ÉNERGIE',road:'🛣️ LIAISON',canal:'🌊 EAU'}[t]}
function render(){
 $('coins').textContent=state.coins;$('materials').textContent=state.materials;
 $('player').style.left=state.x+'%';$('player').style.top=state.y+'%';$('pos').textContent=state.world.toUpperCase();
 document.querySelectorAll('.placed').forEach(e=>e.remove());
 state.objects.filter(o=>o.world===state.world).forEach(o=>{let e=document.createElement('div');e.className='placed '+o.type+(o.damaged?' damaged':'');e.textContent=label(o.type);e.style.left=o.x+'%';e.style.top=o.y+'%';$('terrain').appendChild(e)})
}
function spend(n){if(state.coins<n){say('🎙️ Petite voix : Vous êtes fauché. La construction attendra.');return false}state.coins-=n;return true}
document.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>{selected=b.dataset.place;$('selection').textContent='Construction : '+label(selected)+' — touchez votre terrain.'});
$('terrain').onclick=e=>{
 if(!selected||e.target!==$('terrain'))return;
 let r=$('terrain').getBoundingClientRect(),px=(e.clientX-r.left)/r.width*100,py=(e.clientY-r.top)/r.height*100;
 if(!spend(cost(selected)))return;
 state.objects.push({type:selected,x:Math.max(3,Math.min(92,px)),y:Math.max(3,Math.min(92,py)),world:state.world});
 say(label(selected)+' placé sur votre plateforme. Le monde vivra avec votre décision.');
 selected=null;$('selection').textContent='Aucune construction sélectionnée.';save();render()
};
function switchWorld(w){
 state.world=w;state.x=50;state.y=50;
 let info={
 earth:'🌍 Terre : ville NOMAD existante. Greffez votre plateforme à la communauté ou partez construire en campagne, montagne, forêt, désert…',
 sea:'🌊 Mer : ville flottante NOMAD existante. Côte, haute mer et zones sous-marines sont accessibles au développement.',
 space:'🛰️ Espace : ville orbitale NOMAD déjà habitée, avec habitats, serres, docks et robotique.',
 moon:'🌙 Lune : ville NOMAD déjà installée, avec habitats protégés, énergie, ressources et ateliers.',
 mars:'🔴 Mars : ville NOMAD déjà habitée, avec habitats, serres, ressources, fabrication et robotique.'
 };
 $('worldInfo').textContent=info[w];say('Vous arrivez dans '+w.toUpperCase()+'. La communauté NOMAD existe déjà. Votre plateforme peut maintenant s’y greffer.');save();render()
}
$('earth').onclick=()=>switchWorld('earth');$('sea').onclick=()=>switchWorld('sea');$('space').onclick=()=>switchWorld('space');$('moon').onclick=()=>switchWorld('moon');$('mars').onclick=()=>switchWorld('mars');
$('rain').onclick=()=>{
 state.floods++;let damaged=0;
 state.objects=state.objects.map(o=>{if(o.world==='earth'&&(o.type==='module'||o.type==='farm')&&o.x>68&&Math.random()<.75){damaged++;return{...o,damaged:true}}return o});
 say(damaged?'🌧️ Inondation ! '+damaged+' construction(s) de votre plateforme sont endommagées.':'🌧️ Forte pluie. Cette fois, votre plateforme tient bon.');save();render()
};
$('storm').onclick=()=>{
 let targets=state.objects.filter(o=>o.world==='sea');let damaged=targets.length&&Math.random()<.6?targets[Math.floor(Math.random()*targets.length)]:null;
 if(damaged)damaged.damaged=true;say(damaged?'🌊 Tempête en mer : une installation de votre plateforme est endommagée.':'🌊 Tempête en mer : la ville NOMAD résiste et votre plateforme aussi.');save();render()
};
$('spaceEvent').onclick=()=>{say(Math.random()<.5?'☄️ Micrométéorite : un élément extérieur doit être réparé.':'🛰️ Incident technique : les robots de maintenance interviennent.');if(state.materials>=10)state.materials-=10;save();render()};
$('moonEvent').onclick=()=>{say('🌙 Alerte lunaire : poussière et environnement hostile. Les systèmes autonomes sécurisent la communauté.');save();render()};
$('marsEvent').onclick=()=>{say(Math.random()<.5?'🔴 Tempête de poussière martienne : visibilité et énergie perturbées.':'🔴 Incident de ressource : les robots réorganisent la production locale.');if(state.materials>=10)state.materials-=10;save();render()};
$('parkGame').onclick=()=>{state.coins+=15;say('🎯 Activité réussie : +15 pièces pour votre plateforme.');save();render()};
$('workGame').onclick=()=>{if(state.materials>=10){state.materials-=10;state.coins+=10;say('🏭 Production réussie : +10 pièces.')}else say('Plus assez de matériaux.');save();render()};
$('save').onclick=()=>{save();say('💾 Sauvegarde locale effectuée.');};
$('reset').onclick=()=>{if(confirm('Réinitialiser la partie locale ?')){localStorage.removeItem('nomadGame');location.reload()}};
$('voice').onclick=()=>say('🎙️ Petite voix : Je vous observe. Je ne décide pas à votre place. C’est probablement plus prudent ainsi.');
document.addEventListener('keydown',e=>move(e.key));
document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>move({left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}[b.dataset.move]));
function move(k){let s=4;if(k==='ArrowLeft')state.x=Math.max(2,state.x-s);if(k==='ArrowRight')state.x=Math.min(98,state.x+s);if(k==='ArrowUp')state.y=Math.max(2,state.y-s);if(k==='ArrowDown')state.y=Math.min(98,state.y+s);save();render()}
render();