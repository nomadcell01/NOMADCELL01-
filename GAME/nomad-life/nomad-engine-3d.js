(()=>{'use strict';
// NOMAD patch: humeur autonome + préférences persistantes
const oldEngine=window.NOMAD_ENGINE_STATE||{};
function updateNpcMood(p){const l=p?.userData?.life;if(!l)return;const n=l.needs||{};const avg=(Number(n.energy||50)+Number(n.hunger||50)+Number(n.hygiene||50)+Number(n.fun||50))/4;const bond=Number(p.userData.socialBond||50);let mood='Neutre';if(avg<30)mood='Fatigué';else if(avg<45)mood='Préoccupé';else if(avg>82&&bond>65)mood='Très heureux';else if(avg>68)mood='Bien';else if(bond<25)mood='Solitaire';l.mood=mood;l.moodScore=Math.round(avg*.7+bond*.3);return mood}
window.NOMAD_NPC_MOOD=updateNpcMood;
})();
