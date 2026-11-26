# Uso: cutsheet.py folha.png pasta_saida nome1,nome2,...  (grade 5x2, ordem por linha)
import sys
from PIL import Image
from collections import deque
src, out, names = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
im = Image.open(src).convert('RGBA'); w, h = im.size; A = im.getchannel('A').load(); px = im.load()
T = 200
lab = [0] * (w * h); comps = []
for y in range(h):
    for x in range(w):
        i = y * w + x
        if A[x, y] > T and not lab[i]:
            cid = len(comps) + 1; lab[i] = cid; q = deque([i]); b = [x, y, x, y]; n = 0
            while q:
                j = q.popleft(); n += 1; cx, cy = j % w, j // w
                b = [min(b[0], cx), min(b[1], cy), max(b[2], cx), max(b[3], cy)]
                for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
                    k = ny * w + nx
                    if 0 <= nx < w and 0 <= ny < h and A[nx, ny] > T and not lab[k]: lab[k] = cid; q.append(k)
            comps.append({'id': cid, 'b': [b[0], b[1], b[2] + 1, b[3] + 1], 'n': n, 'ids': {cid}})
comps.sort(key=lambda c: -c['n'])
big = comps[:len(names)]; rest = [c for c in comps[len(names):] if c['n'] > 15]
def dist(a, b): return max(0, max(a[0], b[0]) - min(a[2], b[2])) + max(0, max(a[1], b[1]) - min(a[3], b[3]))
for s in rest:
    t = min(big, key=lambda c: dist(s['b'], c['b']))
    if dist(s['b'], t['b']) < 70:
        t['ids'].add(s['id']); t['b'] = [min(t['b'][0], s['b'][0]), min(t['b'][1], s['b'][1]), max(t['b'][2], s['b'][2]), max(t['b'][3], s['b'][3])]
big.sort(key=lambda c: (0 if (c['b'][1] + c['b'][3]) / 2 < h / 2 else 1, (c['b'][0] + c['b'][2]) / 2))
for n, c in zip(names, big):
    x0, y0, x1, y1 = c['b']; o = Image.new('RGBA', (x1 - x0, y1 - y0)); op = o.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            if lab[y * w + x] in c['ids']: op[x - x0, y - y0] = px[x, y][:3] + (255,)
    o.save(f'{out}/{n}.png', optimize=True); print(n, c['b'], 'menor bloco', c['n'])
