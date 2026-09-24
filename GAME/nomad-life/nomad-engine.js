(()=>{'use strict';
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),load=document.getElementById('loading'),game=document.getElementById('game');
if(!ctx){load.textContent='NOMAD Life — Canvas indisponible.';return}
const DPR=Math.min(devicePixelRatio||1,2);let W=innerWidth,H=innerHeight;
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0)}resize();addEventListener('resize',resize);
const C={sky:'#a9d4df',grass:'#7cab70',road:'#626866',sidewalk:'#d4cfc0',house:['#d5e1d9','#e4ceb8','#d0dce2','#dfc4ba'],roof:'#835b4f',glass:'#79b7c2',wood:'#966b49',skin:'#e3b28e',shirt:'#567f91',dark:'#263239',wall:'#e2ded3',floor:'#c6bbaa'};
const worlds={TERRE:['NOMAD TERRE','☀️ Doux · 21°C'],BEACH:['NOMAD BEACH','☀️ Marin · 25°C'],MER:['NOMAD MER','🌊 Brise · 23°C'],MONTAGNE:['NOMAD MONTAGNE','❄️ Frais · 8°C'],LUNE:['NOMAD LUNE','🌑 Base · -20°C'],MARS:['NOMAD MARS','🔴 Sec · -35°C'],ESPACE:['NOMAD ESPACE','✨ Station · 22°C'],HUB:['NOMAD HUB','🌐 Central · 21°C']};
const cam={x:0,z:0,y:9,zoom:42,rot:0},player={x:0,z:8,tx:0,tz:8,rot:0,name:'Mon Nomade',shirt:'#567f91',hair:'#3b2d28',style:0,body:1,face:1};let money=100000,clock=8,t=0,started=false,working=false,lastPayClock=8,buildMode=false,tool='room',selected=null,ghost=null,roomStart=null,worldKey='TERRE',buildView='2d';const objects=[];const pointers=new Map();let gesture=null;
const MATERIALS={wood:{label:'Bois',base:'#966b49',props:['structure','furniture','floor','door','window']},glass:{label:'Verre',base:'#79b7c2',props:['wall','floor','door','window','roof']},steel:{label:'Acier',base:'#8b969b',props:['structure','wall','door','window','roof','furniture']},plastic:{label:'Plastique',base:'#d9d9df',props:['wall','floor','door','window','furniture']},stone:{label:'Pierre',base:'#9b9389',props:['wall','floor','structure','roof']},earth:{label:'Terre',base:'#9b7655',props:['wall','floor','roof']},vegetation:{label:'Végétal',base:'#6fa56a',props:['wall','roof','floor','furniture']},fabric:{label:'Tissu',base:'#b58c9d',props:['wall','floor','furniture','door']},concrete:{label:'Béton',base:'#b8b8b2',props:['wall','floor','structure','roof']},metal:{label:'Tôle',base:'#a8adb0',props:['wall','roof','door','window']},neon:{label:'Néon',base:'#e7edf2',props:['wall','floor','ceiling','furniture']},wood2:{label:'Bambou',base:'#c6a55a',props:['wall','floor','roof','furniture']}};
const FINISHES={raw:{label:'Brut',filter:1},paint:{label:'Peinture',filter:1.04},wallpaper:{label:'Papier peint',filter:1.08},plaster:{label:'Enduit',filter:.98},varnish:{label:'Vernis',filter:1.12},matte:{label:'Mat',filter:.9},satin:{label:'Satiné',filter:1.03},polished:{label:'Poli',filter:1.16},rough:{label:'Rugueux',filter:.86},translucent:{label:'Translucide',filter:1.08}};
const EFFECTS={none:{label:'Sans effet'},backlit:{label:'Rétroéclairé'},led:{label:'LED'},glow:{label:'Lumineux'},mirror:{label:'Miroir'},frosted:{label:'Dépoli'}};
const COLORS=['#ffffff','#111827','#d94848','#e58b38','#e8c547','#6da95b','#4c9a78','#4b87c5','#6554c0','#a85aa7','#d97b9a','#9b7655','#8d8d8d','#d6d0c5'];
function applySurface(o,material='concrete',finish='raw',effect='none',color=null){o.material=material;o.finish=finish;o.effect=effect;o.surfaceColor=color||MATERIALS[material]?.base||C.wall;o.color=o.surfaceColor;return o}
function materialCompatible(o,material){const m=MATERIALS[material];if(!m)return false;const type=o.tool==='room'?'wall':o.tool;return m.props.includes(type)||m.props.includes('structure')&&type==='wall'}
function surfaceColor(o){let col=o.surfaceColor||o.color||C.wall;if(o.finish&&FINISHES[o.finish])col=shade(col,FINISHES[o.finish].filter);return col}
const $=id=>document.getElementById(id),prompt=$('prompt'),moneyEl=$('money'),clockEl=$('clock'),hint=$('gestureHint');
function iso(x,y,z){const dx=x-cam.x,dz=z-cam.z,c=Math.cos(cam.rot),s=Math.sin(cam.rot),rx=dx*c-dz*s,rz=dx*s+dz*c;return{x:W/2+(rx-rz)*cam.zoom*.5,y:H*.52-(rx+rz)*cam.zoom*.24-y*cam.zoom*.55}}
function poly(a,f){ctx.beginPath();a.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f;ctx.fill()}
function shade(h,k){let n=parseInt(h.slice(1),16),r=Math.max(0,Math.min(255,((n>>16)&255)*k)),g=Math.max(0,Math.min(255,((n>>8)&255)*k)),b=Math.max(0,Math.min(255,(n&255)*k));return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
function box(x,z,w,h,d,fill,rot=0){const c=Math.cos(rot),s=Math.sin(rot),p=[];[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].forEach(q=>{const X=q[0]*c-q[2]*s+x,Z=q[0]*s+q[2]*c+z;p.push(iso(X,q[1],Z))});poly([p[0],p[1],p[5],p[4]],shade(fill,.9));poly([p[1],p[2],p[6],p[5]],shade(fill,.72));poly([p[2],p[3],p[7],p[6]],shade(fill,.82));poly([p[3],p[0],p[4],p[7]],shade(fill,1));poly([p[4],p[5],p[6],p[7]],fill)}
function ground(){const bg={TERRE:['#bfe3ed','#79b56f'],BEACH:['#8fd4e5','#e2cf91'],MER:['#69b9ce','#74aeb0'],MONTAGNE:['#c7d4da','#9ca6a4'],LUNE:['#111925','#60656b'],MARS:['#9b5b4c','#b87957'],ESPACE:['#091225','#252d45'],HUB:['#8bc4d2','#78967e']}[worldKey]||['#bfe3ed','#79b56f'];ctx.fillStyle=bg[0];ctx.fillRect(0,0,W,H);const a=iso(-120,0,-120),b=iso(120,0,-120),c=iso(120,0,120),d=iso(-120,0,120);poly([a,b,c,d],bg[1]);if(worldKey==='MER'){ctx.fillStyle='#7fc4d2';ctx.fillRect(0,H*.52,W,H*.48)}else{box(0,-18,150,.04,8,C.road);box(-6,0,2,.05,150,C.sidewalk);box(6,0,2,.05,150,C.sidewalk);box(0,0,150,.05,2,C.sidewalk);for(let z=-60;z<60;z+=12)box(0,z,7,.04,1.3,C.road)}}
function limb(x,z,h,thick,col,rot=0){box(x,z,thick,h,thick*.8,col,rot)}
function tree(x,z){limb(x,z,2.4,.35,'#70513a');box(x,z,2.9,2.1,2.9,'#4f8e59');box(x,z,2.2,1.6,2.2,'#69a765')}
function house(x,z,m){
  // Maison style simulation de vie : volumes propres, façade lisible, toit posé.
  const w=10,d=8,h=5.5,t=.28;
  // Murs latéraux et arrière.
  box(x-w/2+t/2,z,t,h,d,m);
  box(x+w/2-t/2,z,t,h,d,m);
  box(x,z+d/2-t/2,w,h,t,m);
  // Façade avant avec vraie ouverture centrale pour la porte.
  const front=z-d/2+t/2, doorW=1.55, doorH=2.65, sideW=(w-doorW)/2;
  box(x-(doorW/2+sideW/2),front,sideW,h,t,m);
  box(x+(doorW/2+sideW/2),front,sideW,h,t,m);
  box(x,front,doorW,h-doorH,t,m);
  // Porte et fenêtres affleurantes à la façade.
  box(x,front-t/2-.015,doorW-.10,doorH-.06,.12,C.wood);
  box(x-3.05,front-t/2-.02,1.55,1.7,.12,C.glass);
  box(x+3.05,front-t/2-.02,1.55,1.7,.12,C.glass);
  // Encadrements pour éviter l'effet « fenêtres qui flottent ».
  box(x-3.05,front-t/2-.035,1.72,.10,.14,shade(C.wood,.9));
  box(x+3.05,front-t/2-.035,1.72,.10,.14,shade(C.wood,.9));
  // Toit à deux pans, dessiné après les murs pour rester posé dessus.
  const ry=h+.03,rw=w/2+.75,rd=d/2+.65,ridge=ry+1.05;
  const a=iso(x-rw,ry,z-rd),b=iso(x+rw,ry,z-rd),c=iso(x+rw,ry,z+rd),dd=iso(x-rw,ry,z+rd);
  const e=iso(x,ridge,z-rd+.12),f=iso(x,ridge,z+rd-.12);
  poly([a,b,e],C.roof); poly([b,c,f,e],shade(C.roof,.72)); poly([c,dd,f],shade(C.roof,.82)); poly([dd,a,e,f],shade(C.roof,.92));
};