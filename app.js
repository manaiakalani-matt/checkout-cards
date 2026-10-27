// Adapted from Jasleenkaur98/flashcards (MIT); see vendor/LICENSE.flashcards.
import { scores, points, label, steps, matchingRoutes, selectScores, shuffle, validateBackup } from './logic.js';
const $=id=>document.getElementById(id);
const STORAGE_KEY='checkout-cards.v1';
let mastered=[];
let storageWarning='';
try { const raw=localStorage.getItem(STORAGE_KEY); if(raw) mastered=validateBackup(JSON.parse(raw)); }
catch { storageWarning='Saved progress could not be read. Use a backup if you have one.'; }
let mode='main', filters={min:2,max:170,finish:'',darts:'',progress:'learning'};
let cards=selectScores(filters,mastered), index=0, showingBack=false;
const mainFilters=()=>({min:2,max:170,finish:'',darts:'',progress:'learning'});
function announce(message){$('status').textContent=message;}
function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({app:'checkout-cards',version:1,mastered}));return true;}
  catch{announce('Progress cannot be saved in this browser. Export a backup before closing.');return false;}
}
function refreshDeck({random=false,keep=false}={}){
  const current=cards[index];
  cards=selectScores(filters,mastered);if(random) cards=shuffle(cards);
  index=keep && cards.includes(current)?cards.indexOf(current):0;
  showingBack=false;render();
}
function render(){
  index=cards.length?(index+cards.length)%cards.length:0;
  $('mastery-count').textContent=`${mastered.length} / ${scores.length} mastered`;
  $('mastery-bar').max=scores.length;$('mastery-bar').value=mastered.length;
  $('percentage').textContent=`${Math.round(mastered.length/scores.length*100)}%`;
  $('main-mode').setAttribute('aria-pressed',String(mode==='main'));
  $('filtered-mode').setAttribute('aria-pressed',String(mode==='filtered'));
  $('filters').hidden=mode==='main';
  $('deck-label').textContent=mode==='main'?'MAIN PRACTICE':`${filters.min}–${filters.max} · ${filters.progress.toUpperCase()}`;
  $('position').textContent=cards.length?`${index+1} OF ${cards.length}`:'0 CARDS';
  $('question').hidden=!cards.length||showingBack;
  $('answer').hidden=!cards.length||!showingBack;
  $('empty').hidden=!!cards.length;
  $('grade-actions').hidden=!cards.length||!showingBack;
  for(const id of ['prev','next','shuffle']) $(id).disabled=!cards.length;
  if(!cards.length){
    $('empty-title').textContent=mode==='main'?'Every checkout mastered!':'No matching checkouts';
    $('empty-description').textContent=mode==='main'?'Nice work. Revisit your finishes in filtered practice, or untick a score in settings.':'Try a wider range, another double, or include mastered checkouts.';
    $('empty-action').textContent=mode==='main'?'Review all checkouts':'Adjust filters';return;
  }
  const score=cards[index], routes=matchingRoutes(score,filters);
  $('score').textContent=score;
  $('route-count').textContent=`${routes.length} ${routes.length===1?'route':'routes'} to the finish`;
  $('answer-title').textContent=`${score} checkout${mastered.includes(score)?' · mastered':''}`;
  $('master').textContent=mastered.includes(score)?'↩ Still learning':'✓ Mastered';
  $('routes').replaceChildren();
  routes.forEach((route,i)=>{
    const row=document.createElement('article');row.className='route';
    const tag=document.createElement('span');tag.className='route-tag';
    tag.textContent=`ROUTE ${i+1} · ${route.segments.length} ${route.segments.length===1?'DART':'DARTS'}${route.twoDartsNote?' · CHART: WITH 2 LEFT':''}`;
    const path=document.createElement('div');path.className='route-path';
    steps(route).forEach((step,j)=>{
      if(j){const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='→';arrow.setAttribute('aria-hidden','true');path.append(arrow);}
      const column=document.createElement('div');column.className='step'+(j===route.segments.length-1?' finish':'');
      const total=document.createElement('span');total.className='remaining';total.textContent=step.remaining;
      const dart=document.createElement('span');dart.className='throw';dart.textContent=`${label(step.segment)} (${step.points})`;
      column.setAttribute('aria-label',`${step.remaining} remaining, throw ${step.segment==='SB'?'single bull':step.segment==='DB'?'bull':step.segment}, scoring ${step.points}${j===route.segments.length-1?', finish':''}`);
      column.append(total,dart);path.append(column);
    });
    row.append(tag,path);$('routes').append(row);
  });
}
function flipCard(){if(!cards.length)return;showingBack=!showingBack;render();}
function nextCard(){if(!cards.length)return;index++;showingBack=false;render();}
function prevCard(){if(!cards.length)return;index--;showingBack=false;render();}
$('reveal').addEventListener('click',flipCard);
$('hide-answer').addEventListener('click',flipCard);
$('prev').addEventListener('click',prevCard);$('next').addEventListener('click',nextCard);
$('shuffle').addEventListener('click',()=>{cards=shuffle(cards);index=0;showingBack=false;render();announce('Cards shuffled.');});
$('again').addEventListener('click',()=>{const score=cards[index];nextCard();announce(`${score} stays in your practice pool.`);});
$('master').addEventListener('click',()=>{
  const score=cards[index],wasMastered=mastered.includes(score);
  mastered=wasMastered?mastered.filter(s=>s!==score):[...mastered,score];
  const saved=save();
  const permitted=selectScores(filters,mastered);
  cards=cards.filter(s=>permitted.includes(s));
  showingBack=false;render();
  if(saved)announce(wasMastered?`${score} is back in practice.`:`${score} mastered. Nice finish!`);
});
$('main-mode').addEventListener('click',()=>{mode='main';filters=mainFilters();refreshDeck();announce('All routes, still-learning checkouts.');});
function applyFilters(){
  const min=Number($('min').value),max=Number($('max').value);
  if(!Number.isInteger(min)||!Number.isInteger(max)||min<2||max>170||min>max){$('filter-error').textContent='Choose a range from 2 to 170, with From no higher than To.';return;}
  $('filter-error').textContent='';
  filters={min,max,finish:$('finish').value,darts:$('darts').value,progress:$('progress-filter').value};
  refreshDeck();announce(`${cards.length} matching checkouts.`);
}
$('filtered-mode').addEventListener('click',()=>{mode='filtered';applyFilters();});
$('filters').addEventListener('submit',e=>{e.preventDefault();applyFilters();});
for(let n=20;n>=1;n--){const option=document.createElement('option');option.value=`D${n}`;option.textContent=`D${n} · ${n*2} points`;$('finish').append(option);}
const bull=document.createElement('option');bull.value='DB';bull.textContent='Bull · 50 points';$('finish').append(bull);
$('empty-action').addEventListener('click',()=>{
  if(mode==='main'){$('min').value=2;$('max').value=170;$('finish').value='';$('darts').value='';$('progress-filter').value='all';mode='filtered';applyFilters();}
  $('min').focus();
});
function renderMastered(){
  $('mastered-list').replaceChildren();
  if(!mastered.length){$('mastered-list').textContent='No mastered checkouts yet.';return;}
  [...mastered].sort((a,b)=>a-b).forEach(score=>{
    const button=document.createElement('button');button.textContent=`${score} ✓`;button.setAttribute('aria-label',`Mark ${score} as still learning`);
    button.addEventListener('click',()=>{mastered=mastered.filter(s=>s!==score);const saved=save();renderMastered();refreshDeck({keep:true});$('backup-status').textContent=saved?`${score} is back in practice.`:'Change not saved. Export a backup before closing.';});
    $('mastered-list').append(button);
  });
}
$('settings-open').addEventListener('click',()=>{renderMastered();$('settings').showModal();});
$('help-open').addEventListener('click',()=>$('help').showModal());
document.querySelectorAll('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
$('export').addEventListener('click',()=>{
  const data={app:'checkout-cards',version:1,mastered,exportedAt:new Date().toISOString()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='checkout-cards-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  $('backup-status').textContent='Backup downloaded. Keep it somewhere safe.';
});
$('import').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    if(file.size>100000)throw new Error('This file is too large to be a progress backup.');
    const incoming=validateBackup(JSON.parse(await file.text()));
    mastered=[...new Set([...mastered,...incoming])];const saved=save();renderMastered();refreshDeck({keep:true});
    $('backup-status').textContent=saved?'Progress imported and merged with your existing mastery.':'Imported for this session, but storage is unavailable. Keep your backup.';
  }catch(error){$('backup-status').textContent=error instanceof SyntaxError?'This file is not valid JSON. Choose a progress backup.':error.message;}
  e.target.value='';
});
window.addEventListener('keydown',event=>{
  if(document.querySelector('dialog[open]')||event.target.closest('input,select,textarea,button,a'))return;
  if(event.code==='Space'){event.preventDefault();flipCard();}
  else if(event.code==='ArrowRight'){event.preventDefault();nextCard();}
  else if(event.code==='ArrowLeft'){event.preventDefault();prevCard();}
});
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY){try{mastered=e.newValue?validateBackup(JSON.parse(e.newValue)):[];refreshDeck({keep:true});}catch{announce('Another tab saved unreadable progress. Export your current progress.');}}});
render();if(storageWarning)announce(storageWarning);
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>announce('Offline setup could not complete. Keep this page online and try reloading.'));}
