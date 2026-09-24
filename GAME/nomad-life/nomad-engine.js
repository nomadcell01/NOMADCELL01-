(()=>{'use strict';
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),load=document.getElementById('loading'),game=document.getElementById('game');
if(!ctx){load.textContent='NOMAD Life — Canvas indisponible.';return}
const DPR=Math.min(devicePixelRatio||1,2);let W=innerWidth,H=innerHeight;
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0)}resize();addEventListener('resize',resize);
const C={sky:'#a9d4df',grass:'#7cab70',road:'#626866',sidewalk:'#d4cfc0',house:['#d5e1d9','#e4ceb8','#d0dce2','#dfc4ba'],roof:'#835b4f',glass:'#79b7c2',wood:'#966b49',skin:'#e3b28e',shirt:'#567f91',dark:'#263239',wall:'#e2ded3',floor:'#c6bbaa'};
const worlds={TERRE:['NOMAD TERRE','☀️ Doux · 21°C'],BEACH:['NOMAD BEACH','☀️ Marin · 25°C'],MER:['NOMAD MER','🌊 Brise · 23°C'],MONTAGNE:['NOMAD MONTAGNE','❄️ Frais · 8°C'],LUNE:['NOMAD LUNE','🌑 Base · -20°C'],MARS:['NOMAD MARS','🔴 Sec · -35°C'],ESPACE:['NOMAD ESPACE','✨ Station · 22°C'],HUB:['NOMAD HUB','🌐 Central · 21°C']};
const cam={x:0,z:-12,y:9,zoom:62,rot:0},player={x:0,z:-7,tx:0,tz:-7,rot:0,name:'Mon Nomade',shirt:'#567f91',hair:'#3b2d28',style:0,body:1,face:1};let money=500,clock=8,t=0,started=false,buildMode=false,tool='room',selected=null,ghost=null,roomStart=null,worldKey='TERRE';const objects=[];const pointers=new Map();let gesture=null;
const $=id=>document.getElementById(id),prompt=$('prompt'),moneyEl=$('money'),clockEl=$('clock'),hint=$('gestureHint');
function iso(x,y,z){const dx=x-cam.x,dz=z-cam.z,c=Math.cos(cam.rot),s=Math.sin(cam.rot),rx=dx*c-dz*s,rz=dx*s+dz*c;return{x:W/2+(rx-rz)*cam.zoom*.5,y:H*.52-(rx+rz)*cam.zoom*.24-y*cam.zoom*.55}}
function poly(a,f){ctx.beginPath();a.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f;ctx.fill()}
function shade(h,k){let n=parseInt(h.slice(1),16),r=Math.max(0,Math.min(255,((n>>16)&255)*k)),g=Math.max(0,Math.min(255,((n>>8)&255)*k)),b=Math.max(0,Math.min(255,(n&255)*k));return '#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}
function box(x,z,w,h,d,fill,rot=0){const c=Math.cos(rot),s=Math.sin(rot),p=[];[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].forEach(q=>{const X=q[0]*c-q[2]*s+x,Z=q[0]*s+q[2]*c+z;p.push(iso(X,q[1],Z))});poly([p[0],p[1],p[5],p[4]],shade(fill,.9));poly([p[1],p[2],p[6],p[5]],shade(fill,.72));poly([p[2],p[3],p[7],p[6]],shade(fill,.82));poly([p[3],p[0],p[4],p[7]],shade(fill,1));poly([p[4],p[5],p[6],p[7]],fill)}
function ground(){ctx.fillStyle=C.sky;ctx.fillRect(0,0,W,H);const a=iso(-90,0,-90),b=iso(90,0,-90),c=iso(90,0,90),d=iso(-90,0,90);poly([a,b,c,d],C.grass);box(0,-18,150,.04,8,C.road);box(-6,0,2,.05,150,C.sidewalk);box(6,0,2,.05,150,C.sidewalk);box(0,0,150,.05,2,C.sidewalk);for(let z=-60;z<60;z+=12)box(0,z,7,.04,1.3,C.road)}
function limb(x,z,h,thick,col,rot=0){box(x,z,thick,h,thick*.8,col,rot)}
function tree(x,z){limb(x,z,2.4,.35,'#70513a');box(x,z,2.9,2.1,2.9,'#4f8e59');box(x,z,2.2,1.6,2.2,'#69a765')}
function house(x,z,m){box(x,z,10,5.5,8,m);box(x,z-.02,11.5,.25,9.2,C.roof,Math.PI/4);box(x,z-4.05,2.4,2.2,.08,C.glass);box(x-2.7,z-4.08,1.2,2.2,.1,C.glass);box(x+2.7,z-4.08,1.2,2.2,.1,C.glass);box(x,z+4.05,1.5,2.4,.18,C.wood)}
function ellipse(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill()}
function roundRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
function person(x,z,col=C.shirt){
  const scale=player.body===0?.88:player.body===2?1.12:1;
  const head=player.face===0?.95:player.face===2?1.08:1;
  const moving=Math.hypot(player.tx-player.x,player.tz-player.z)>.08;
  const walk=moving?Math.sin(t*10)*.22:Math.sin(t*2)*.025;
  const p=iso(x,0,z);
  const unit=cam.zoom*.17*scale;
  // shadow
  ellipse(p.x,p.y+3,unit*1.25,unit*.28,'#00000030');
  // body is drawn in screen space for a more human silhouette
  const cx=p.x, base=p.y-unit*.05;
  const legL=walk, legR=-walk;
  // legs
  ctx.save();ctx.translate(cx-unit*.22,base-unit*.02);ctx.rotate(legL);
  roundRect(-unit*.11,0,unit*.22,unit*1.05,unit*.1,C.dark);ctx.restore();
  ctx.save();ctx.translate(cx+unit*.22,base-unit*.02);ctx.rotate(legR);
  roundRect(-unit*.11,0,unit*.22,unit*1.05,unit*.1,C.dark);ctx.restore();
  // shoes
  ellipse(cx-unit*.22+legL*unit,base+unit*.99,unit*.15,unit*.07,'#182126');
  ellipse(cx+unit*.22+legR*unit,base+unit*.99,unit*.15,unit*.07,'#182126');
  // torso
  roundRect(cx-unit*.48,base-unit*1.25,unit*.96,unit*1.35,unit*.22,col);
  // waist detail
  roundRect(cx-unit*.42,base+unit*.02,unit*.84,unit*.14,unit*.05,shade(col,.72));
  // arms
  ctx.save();ctx.translate(cx-unit*.48,base-unit*1.05);ctx.rotate(-.18+walk*.7);
  roundRect(-unit*.11,0,unit*.22,unit*.95,unit*.11,col);ellipse(0,unit*.98,unit*.13,unit*.13,C.skin);ctx.restore();
  ctx.save();ctx.translate(cx+unit*.48,base-unit*1.05);ctx.rotate(.18-walk*.7);
  roundRect(-unit*.11,0,unit*.22,unit*.95,unit*.11,col);ellipse(0,unit*.98,unit*.13,unit*.13,C.skin);ctx.restore();
  // neck
  roundRect(cx-unit*.14,base-unit*1.42,unit*.28,unit*.24,unit*.07,C.skin);
  // head + ears
  const hr=unit*.48*head;
  ellipse(cx,base-unit*1.78,hr,hr*1.08,C.skin);
  ellipse(cx-hr*.96,base-unit*1.76,hr*.13,hr*.20,C.skin);
  ellipse(cx+hr*.96,base-unit*1.76,hr*.13,hr*.20,C.skin);
  // hair cap
  ctx.beginPath();ctx.arc(cx,base-unit*1.84,hr*1.03,Math.PI,Math.PI*2);ctx.lineTo(cx+hr,base-unit*1.73);
  ctx.quadraticCurveTo(cx+hr*.55,base-unit*1.55,cx,base-unit*1.62);
  ctx.quadraticCurveTo(cx-hr*.55,base-unit*1.55,cx-hr,base-unit*1.73);ctx.closePath();ctx.fillStyle=player.hair;ctx.fill();
  // face
  ellipse(cx-hr*.32,base-unit*1.78,unit*.055,unit*.07,C.dark);
  ellipse(cx+hr*.32,base-unit*1.78,unit*.055,unit*.07,C.dark);
  ctx.strokeStyle=shade(C.skin,.62);ctx.lineWidth=Math.max(1,unit*.035);
  ctx.beginPath();ctx.arc(cx,base-unit*1.66,unit*.15,.15*Math.PI,.85*Math.PI);ctx.stroke();
};