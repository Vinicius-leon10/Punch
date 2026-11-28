import { ART_IDS, ATTRS, BALANCE, GEAR, HAIR_COLORS, HAIR_STYLES, SKIN_TONES, TECHNIQUES, type Attrs } from './data';
import { hashString, makeRng, pick, randInt, shuffle } from './rng';
import { deckSlots, type Fighter } from './state';

const FIRST = ['Zé', 'Rafa', 'Bruno', 'Thiago', 'Duda', 'Leo', 'Marcão', 'Japa', 'Biel', 'Nando', 'Lu', 'Carol', 'Bia', 'Rose', 'Dani', 'Fê'];
const WOMEN = new Set(['Lu', 'Carol', 'Bia', 'Rose', 'Dani', 'Fê']);
/** Artes de oponente (art/v7-lote6 e art/v8-chatgpt), separadas para combinar com o nome. */
export const OPPONENT_SPRITES = {
  homem: ['oponente_1', 'oponente_2', 'oponente_3', 'oponente_5', 'oponente_6', 'oponente_8'],
  mulher: ['oponente_4', 'oponente_7'],
};
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

  const picked = TECHNIQUES.filter((t) => t.minLevel <= level && (t.art === art || rng() < 0.15));
  // Respeita os pré-requisitos: o fantasma só usa o que um jogador real conseguiria ter aprendido.
  const has = (id: string): boolean => {
    const t = picked.find((x) => x.id === id);
    return !!t && (!t.requires || has(t.requires));
  };
  const learnable = picked.filter((t) => has(t.id));
  const own = learnable.filter((t) => t.art === art);
  const others = learnable.filter((t) => t.art !== art);
  const pool = [...shuffle(rng, own), ...others];
  const slots = deckSlots(level);
  const deck: string[] = [];
  // Garante ao menos dois ataques.
  for (const t of pool.filter((t) => t.kind === 'ataque')) if (deck.length < 2) deck.push(t.id);
  for (const t of pool) if (deck.length < slots && !deck.includes(t.id)) deck.push(t.id);

  // Técnicas conhecidas = deck + os pré-requisitos de cada uma.
  const techniques = deck.slice();
  for (let i = 0; i < techniques.length; i++) {
    const req = learnable.find((t) => t.id === techniques[i])?.requires;
    if (req && !techniques.includes(req)) techniques.push(req);
  }

  const equipped: Fighter['equipped'] = {};
  for (const g of GEAR) {
    if (g.minLevel <= level && g.currency === 'moedas' && rng() < 0.7) equipped[g.slot] = g.id;
  }

  const name = pick(rng, FIRST);
  return {
    name,
    nickname: pick(rng, NICK),
    art,
    level,
    attrs,
    techniques,
    deck,
    equipped,
    appearance: {
      skin: randInt(rng, 0, SKIN_TONES.length - 1),
      hairStyle: pick(rng, HAIR_STYLES),
      hairColor: randInt(rng, 0, HAIR_COLORS.length - 1),
      beard: rng() < 0.4,
      tattoo: rng() < 0.4,
    },
    // Sorteado por último para não mudar os números da luta.
    sprite: pick(rng, WOMEN.has(name) ? OPPONENT_SPRITES.mulher : OPPONENT_SPRITES.homem),
  };
}
