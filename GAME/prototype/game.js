const $=id=>document.getElementById(id), canvas=$('world'),ctx=canvas.getContext('2d');
const key='nomadSimsV1';const base={avatar:null,bot:null,money:1000000,materials:100,free:false,unlocked:false,world:'Terre',player:{x:620,y:420},house:null};
let s=JSON.parse(localStorage.getItem(key)||'null')||structuredClone(base), mode=null, moving={};
function save(){localStorage.setItem(key,JSON.stringify(s))}
function resize(){canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=canvas.clientHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}addEventListener('resize',resize);resize();
function start(){s.avatar={name:$('avatarName').value.trim()||'Nomad'};s.bot={name:$('botName').value.trim()||'Humanoïde'};save();$('creator').classList.add('hidden');renderUI()}
if(!s.avatar||!s.bot){}else $('creator').classList.add('hidden');$('start').onclick=start;
function worldSize(){return{x:2200,y:1500}}function cam(){let w=worldSize();return{x:Math.max(0,Math.min(w.x-canvas.clientWidth,s.player.x-canvas.clientWidth/2)),y:Math.max(0,Math.min(w.y-canvas.clientHeight,s.player.y-canvas.clientHeight/2))}}
function drawHouse(h,c){ctx.fillStyle=h.bought?'#d9c9b4':'#eee1cf';ctx.fillRect(h.x-c.x,h.y-c.y,h.w,h.h);ctx.strokeStyle='#4a4139';ctx.lineWidth=3;ctx.strokeRect(h.x-c.x,h.y-c.y,h.w,h.h);ctx.fillStyle='#59483b';ctx.fillRect(h.x-c.x+h.w*.42,h.y-c.y+h.h-8,28,8);for(let i=0;i<h.floors;i++){ctx.strokeStyle='#8c7d6e';ctx.strokeRect(h.x-c.x+6,h.y-c.y+6-i*2,h.w-12,h.h-12)}}
function render(){let W=canvas.clientWidth,H=canvas.clientHeight,c=cam();ctx.clearRect(0,0,W,H);ctx.fillStyle='#9bb88a';ctx.fillRect(0,0,W,H);
ctx.fillStyle='#78906f';ctx.fillRect(-c.x,-c.y,2200,1500);
ctx.fillStyle='#596268';ctx.fillRect(-c.x,560-c.y,2200,120);ctx.fillStyle='#777f80';ctx.fillRect(1020-c.x,-c.y,130,1500);
ctx.fillStyle='#6d9ca8';ctx.fillRect(1500-c.x,-c.y,700,260);ctx.fillStyle='#e8e0bf';ctx.font='bold 20px system-ui';ctx.fillText('NOMAD PRINCIPAL',80-c.x,90-c.y);
for(let i=0;i<7;i++){ctx.fillStyle='#d5d9dc';ctx.fillRect(80+i*115-c.x,180-c.y,85,70);ctx.fillStyle='#b7c0c6';ctx.fillRect(95+i*115-c.x,205-c.y,18,45);ctx.fillRect(135+i*115-c.x,205-c.y,18,45)}
ctx.fillStyle='#fff';ctx.font='14px system-ui';ctx.fillText('HÔPITAL',150-c.x,300-c.y);ctx.fillText('MARCHÉ',390-c.x,300-c.y);ctx.fillText('PISCINE',620-c.x,300-c.y);ctx.fillText('USINE',850-c.x,300-c.y);
if(s.house){drawHouse(s.house,c);for(let i=0;i<s.house.floors;i++){ctx.fillStyle='#263238';ctx.fillText('Niveau '+(i+1),s.house.x+8-c.x,s.house.y+20+i*16-c.y)}if(s.house.basements){ctx.fillText('⬇ '+s.house.basements+' sous-sol(s)',s.house.x-c.x,s.house.y+s.house.h+22-c.y)}}
ctx.fillStyle='#20272b';ctx.beginPath();ctx.arc(s.player.x-c.x,s.player.y-c.y,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='12px system-ui';ctx.fillText(s.avatar?.name||'Nomad',s.player.x-25-c.x,s.player.y-23-c.y);
ctx.fillStyle='#263238';ctx.fillText('Terrain / espace disponible',1280-c.x,520-c.y);ctx.strokeStyle='#fff8';ctx.setLineDash([8,8]);ctx.strokeRect(1220-c.x,540-c.y,430,300);ctx.setLineDash([]);
}
function renderUI(){ $('avatarLabel').textContent=s.avatar?.name||'—';$('botLabel').textContent=s.bot?.name||'—';$('money').textContent=s.money.toLocaleString('fr-FR');$('mat').textContent=s.materials; $('houseInfo').textContent=s.house?('Maison: '+s.house.floors+' étage(s), '+s.house.basements+' sous-sol(s), '+s.house.furniture+' meuble(s)'):'Terrain vide — construisez ou achetez';}
function nearPlot(){return s.player.x>1180&&s.player.x<1700&&s.player.y>500&&s.player.y<900}
function build(type){if(!nearPlot()){say('🎙️ Petite Voix : rapprochez-vous de l’espace disponible pour construire.');return}
if(type==='buy'){if(s.house){say('Vous avez déjà une habitation.');return}if(!s.free&&s.money<150000){say('Il faut 150 000 NOMAD pour acheter la maison de base.');return}s.money=s.free?s.money:s.money-150000;s.house={x:1280,y:590,w:280,h:180,floors:1,basements:0,furniture:3,bought:true};say('🏠 Maison de base achetée. Vous pouvez maintenant la transformer.')}
if(type==='house'){s.house=s.house||{x:1280,y:590,w:280,h:180,floors:1,basements:0,furniture:0,bought:false};say('🏠 Vous avez construit votre première maison.')}
if(type==='room'){s.house=s.house||{x:1280,y:590,w:280,h:180,floors:1,basements:0,furniture:0,bought:false};s.house.w+=40;s.house.h+=20;if(!s.free)s.materials=Math.max(0,s.materials-10);say('🧱 Extension construite. La maison grandit réellement dans le monde.')}
if(type==='floor'){s.house=s.house||{x:1280,y:590,w:280,h:180,floors:1,basements:0,furniture:0,bought:false};if(s.house.floors<5){s.house.floors++;if(!s.free)s.materials=Math.max(0,s.materials-20)}say('⬆️ Niveau ajouté.')}
if(type==='basement'){s.house=s.house||{x:1280,y:590,w:280,h:180,floors:1,basements:0,furniture:0,bought:false};if(s.house.basements<4){s.house.basements++;if(!s.free)s.materials=Math.max(0,s.materials-25)}say('⬇️ Sous-sol creusé.')}
if(type==='furniture'){if(!s.house){say('Construisez ou achetez une maison d’abord.');return}s.house.furniture++;if(!s.free)s.money=Math.max(0,s.money-500);say('🛋️ Meuble ajouté.')}
save();renderUI()}
document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>build(b.dataset.build));$('build').onclick=()=>{$('buildBar').classList.toggle('hidden');say('🏗️ Mode construction : choisissez ce que vous voulez créer.');};$('finish').onclick=()=>{$('buildBar').classList.add('hidden');say('🏠 Construction terminée. Sortez et continuez votre vie dans le monde.');save()};
$('enter').onclick=()=>{if(!s.house){say('🚪 Il n’y a pas encore de maison.');return}say('🚪 Vous entrez dans votre habitation. Prochaine étape : intérieur Sims complet.')}
function say(t){$('hint').textContent=t}
$('voice').onclick=()=>say('🎙️ Petite Voix : Je ne décide pas à votre place. Je constate simplement que vous venez encore de rajouter un sous-sol.');
$('save').onclick=()=>{save();say('💾 Partie sauvegardée sur cet appareil.')};$('reset').onclick=()=>{if(confirm('Réinitialiser cette partie ?')){localStorage.removeItem(key);location.reload()}}
$('cheat').onclick=()=>{$('cheats').classList.toggle('hidden')};document.querySelectorAll('[data-cheat]').forEach(b=>b.onclick=()=>{let x=b.dataset.cheat;if(x==='money')s.money+=1000000000;if(x==='materials')s.materials+=9999;if(x==='free')s.free=!s.free;if(x==='unlock')s.unlocked=true;save();renderUI();say('🧪 Code de triche activé. Vous jouez comme VOUS le souhaitez.')});
function move(dx,dy){s.player.x=Math.max(20,Math.min(2180,s.player.x+dx));s.player.y=Math.max(20,Math.min(1480,s.player.y+dy));render()}
addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;let k=e.key.toLowerCase();if(k==='arrowup'||k==='z'||k==='w')move(0,-18);if(k==='arrowdown'||k==='s')move(0,18);if(k==='arrowleft'||k==='q'||k==='a')move(-18,0);if(k==='arrowright'||k==='d')move(18,0);if(k==='b')$('build').click()});
document.querySelectorAll('[data-move]').forEach(b=>b.onpointerdown=()=>{let d=b.dataset.move;move(d==='left'?-18:d==='right'?18:0,d==='up'?-18:d==='down'?18:0)});
renderUI();render();setInterval(render,250);