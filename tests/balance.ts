import { ART_IDS } from '../src/game/data';
import { simulateFight } from '../src/game/fight';
import { makeOpponent } from '../src/game/opponents';
import { createPlayer } from '../src/game/state';

for (const lvl of [1, 10, 25]) {
  const wins: Record<string, number> = {}; const games: Record<string, number> = {};
  let rounds = 0, n = 0;
  for (let i = 0; i < 4000; i++) {
    const a = makeOpponent(lvl, `a${lvl}-${i}`), b = makeOpponent(lvl, `b${lvl}-${i}`);
    a.level = b.level = lvl;
    if (a.art === b.art) continue;
    const r = simulateFight(a, b, i);
    for (const [f, w] of [[a, r.winner === 0], [b, r.winner === 1]] as const) {
      games[f.art] = (games[f.art] ?? 0) + 1; if (w) wins[f.art] = (wins[f.art] ?? 0) + 1;
    }
    rounds += r.rounds; n++;
  }
  console.log(`nível ${lvl}: rounds médios ${(rounds / n).toFixed(2)} |`, ART_IDS.map((k) => `${k} ${(100 * (wins[k] ?? 0) / games[k]).toFixed(0)}%`).join(' '));
}
// Jogador novo de cada arte contra fantasmas da faixa
for (const art of ART_IDS) {
  let w = 0;
  for (let i = 0; i < 1000; i++) {
    const p = createPlayer({ name: 'x', nickname: 'y', art, appearance: { skin: 0, hairStyle: 'curto', hairColor: 0, beard: false, tattoo: false } }, 0);
    if (simulateFight(p, makeOpponent(1, `n${i}`), i).winner === 0) w++;
  }
  console.log(`novo ${art}: vence ${(w / 10).toFixed(0)}% no nível 1`);
}
