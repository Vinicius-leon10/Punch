import { ART_IDS, ATTRS, BALANCE, GEAR, HAIR_COLORS, HAIR_STYLES, SKIN_TONES, TECHNIQUES, type Attrs } from './data';
import { hashString, makeRng, pick, randInt, shuffle } from './rng';
import { deckSlots, type Fighter } from './state';

const FIRST = ['Zé', 'Rafa', 'Bruno', 'Thiago', 'Duda', 'Leo', 'Marcão', 'Japa', 'Biel', 'Nando', 'Lu', 'Carol', 'Bia', 'Rose', 'Dani', 'Fê'];
const NICK = ['Trovão', 'Furacão', 'Marreta', 'Pitbull', 'Sombra', 'Muralha', 'Navalha', 'Tanque', 'Cobra', 'Fera', 'Tsunami', 'Raio'];

/** Pontos de atributo esperados para um lutador do nível dado (média de quem treina normalmente). */
export function expectedAttr(level: number): number {
  return BALANCE.startAttr + (level - 1) * 2.2;
}

/**
 * Gera um oponente "fantasma" da faixa de nível do jogador.
 * No jogo online isso será trocado pelo personagem real de outro jogador (mesmo offline);
 * o fantasma continua existindo só para quando a faixa estiver vazia.
 */
export function makeOpponent(playerLevel: number, seedKey: string): Fighter {
  const rng = makeRng(hashString(seedKey));
  const level = Math.max(1, Math.min(BALANCE.maxLevel, playerLevel + randInt(rng, -BALANCE.levelRange, BALANCE.levelRange)));
  const art = pick(rng, ART_IDS);
  const base = expectedAttr(level);
  const attrs = Object.fromEntries(ATTRS.map((k) => [k, Math.max(1, base * (0.75 + rng() * 0.5))])) as Attrs;

  const learnable = TECHNIQUES.filter((t) => t.minLevel <= level && (t.art === art || rng() < 0.15));
  const own = learnable.filter((t) => t.art === art);
  const others = learnable.filter((t) => t.art !== art);
  const pool = [...shuffle(rng, own), ...others];
  const slots = deckSlots(level);
  const deck: string[] = [];
  // Garante ao menos dois ataques.
  for (const t of pool.filter((t) => t.kind === 'ataque')) if (deck.length < 2) deck.push(t.id);
  for (const t of pool) if (deck.length < slots && !deck.includes(t.id)) deck.push(t.id);

  const equipped: Fighter['equipped'] = {};
  for (const g of GEAR) {
    if (g.minLevel <= level && g.currency === 'moedas' && rng() < 0.7) equipped[g.slot] = g.id;
  }

  return {
    name: pick(rng, FIRST),
    nickname: pick(rng, NICK),
    art,
    level,
    attrs,
    techniques: deck.slice(),
    deck,
    equipped,
    appearance: {
      skin: randInt(rng, 0, SKIN_TONES.length - 1),
      hairStyle: pick(rng, HAIR_STYLES),
      hairColor: randInt(rng, 0, HAIR_COLORS.length - 1),
      beard: rng() < 0.4,
      tattoo: rng() < 0.4,
    },
  };
}
