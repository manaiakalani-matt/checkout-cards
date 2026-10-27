import { routes } from './routes.js';
export const scores = [...new Set(routes.map(r => r.score))].sort((a,b)=>b-a);
export function points(segment) {
  if(segment==='SB') return 25;
  if(segment==='DB') return 50;
  const match=/^([STD])(\d+)$/.exec(segment);
  if(!match || +match[2]<1 || +match[2]>20) throw new Error(`Invalid segment: ${segment}`);
  return +match[2]*({S:1,T:3,D:2}[match[1]]);
}
export function label(segment) { return segment==='DB'?'Bull':segment==='SB'?'SB':segment; }
export function steps(route) {
  let remaining=route.score;
  return route.segments.map(segment=>{const step={remaining,segment,points:points(segment)}; remaining-=step.points; return step;});
}
export function matchingRoutes(score, filters) {
  return routes.filter(r=>r.score===score && (!filters.finish || r.segments.at(-1)===filters.finish) && (!filters.darts || r.segments.length===Number(filters.darts)));
}
export function selectScores(filters, mastered) {
  return scores.filter(score=>score>=filters.min && score<=filters.max &&
    (filters.progress==='all' || (filters.progress==='mastered')===mastered.includes(score)) && matchingRoutes(score,filters).length);
}
export function shuffle(items) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function validateBackup(data) {
  if(data?.app!=='checkout-cards' || data.version!==1 || !Array.isArray(data.mastered) || !data.mastered.every(s=>Number.isInteger(s)&&scores.includes(s))) throw new Error('Choose a Checkout Cards backup file.');
  return [...new Set(data.mastered)];
}
