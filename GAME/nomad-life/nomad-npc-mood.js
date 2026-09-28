(()=>{'use strict';
// NOMAD — module d'humeur non destructif. Le moteur 3D reste indépendant.
function moodFor(p){const l=p?.userData?.life;if(!l)return null;const n=l.needs||{};const avg=(Number(n.energy??50)+Number(n.hunger??50)+Number(n.hygiene??50)+Number(n.fun??50))/4;const bond=Number(p.userData.socialBond??50);let mood='Neutre';if(avg<30)mood='Fatigué';else if(avg<45)mood='Préoccupé';else if(bond<25)mood='Solitaire';else if(avg>82&&bond>65)mood='Très heureux';else if(avg>68)mood='Bien';l.mood=mood;l.moodScore=Math.round(avg*.7+bond*.3);return mood}
function refresh(){const list=Array.isArray(window.NOMAD_HABITANTS)?window.NOMAD_HABITANTS:[];window.NOMAD_HABITANTS_MOOD=list.map(x=>{const n=x.needs||{};const avg=(Number(n.energy??50)+Number(n.hunger??50)+Number(n.hygiene??50)+Number(n.fun??50))/4;const bond=Number(x.bond??50);let mood='Neutre';if(avg<30)mood='Fatigué';else if(avg<45)mood='Préoccupé';else if(bond<25)mood='Solitaire';else if(avg>82&&bond>65)mood='Très heureux';else if(avg>68)mood='Bien';return {...x,mood,moodScore:Math.round(avg*.7+bond*.3)}});return window.NOMAD_HABITANTS_MOOD}
window.NOMAD_NPC_MOOD={calculate:moodFor,refresh};
setInterval(()=>{try{if(Array.isArray(window.NOMAD_PEOPLE))window.NOMAD_PEOPLE.forEach(moodFor);refresh()}catch(e){}},5000);
})();
