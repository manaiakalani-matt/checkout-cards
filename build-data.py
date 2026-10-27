import json
from pathlib import Path
root=Path(__file__).parent
routes=[]
for line in (root/'chart.txt').read_text().splitlines():
    score,*segments=line.split()
    special=segments[0]=='w2'
    if special: segments=segments[1:]
    routes.append(dict(score=int(score),segments=segments,twoDartsNote=special,source='chart'))
# Supplement the chart (which starts at 40) with straightforward low finishes.
for score in range(2,40):
    segments=[f'D{score//2}'] if score%2==0 else ['S1',f'D{(score-1)//2}']
    routes.append(dict(score=score,segments=segments,twoDartsNote=False,source='basic'))
(root/'routes.js').write_text('export const routes = '+json.dumps(routes,indent=2)+';\n')
print(f'{len(routes)} routes across {len(set(r["score"] for r in routes))} scores')
