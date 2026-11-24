import { MAIN_ART_POWER, SPECIALIST_BONUS, TECH_BY_ID, type Technique } from './data';
import { makeRng, type Rng } from './rng';
import { effectiveAttrs, type Fighter } from './state';

/** Ações por round. Sem limite de rounds: a luta só termina por nocaute. */
export const ACTIONS_PER_ROUND = 12;
/** A partir do 4º round o cansaço aumenta o dano, garantindo que alguém caia. */
const FATIGUE_FROM_ROUND = 4;
const FATIGUE_STEP = 0.3;
const SAFETY_MAX_ACTIONS = 600;

export interface CombatStats {
  maxHp: number;
  maxSta: number;
  dmgMult: number;
  dodge: number;
  crit: number;
  speed: number;
  armor: number;
  specialist: boolean;
}

export function combatStats(f: Fighter): CombatStats {
  const a = effectiveAttrs(f);
  const deck = f.deck.map((id) => TECH_BY_ID[id]).filter(Boolean);
  const specialist = deck.length > 0 && deck.every((t) => t.art === f.art);
  let hpPct = specialist ? SPECIALIST_BONUS : 0;
  let staPct = 0;
  let dodge = 0.04 + a.agilidade * 0.003;
  let crit = 0.05 + a.tecnica * 0.003;
  for (const t of deck) {
    if (t.kind !== 'passiva') continue;
    hpPct += t.hpPct ?? 0;
    staPct += t.staPct ?? 0;
    dodge += t.dodge ?? 0;
    crit += t.crit ?? 0;
  }
  return {
    maxHp: Math.round((100 + a.resistencia * 4) * (1 + hpPct)),
    maxSta: Math.round((60 + a.cardio * 3) * (1 + staPct)),
    dmgMult: (1 + a.forca / 40) * (specialist ? 1 + SPECIALIST_BONUS : 1),
    dodge,
    crit: Math.min(crit, 0.35),
    speed: 10 + a.agilidade * 0.35,
    armor: a.resistencia * 0.15,
    specialist,
  };
}

export type FightEvent =
  | { t: 'round'; round: number }
  | { t: 'hit'; who: 0 | 1; tech: string; dmg: number; crit: boolean; blocked?: string; hp: [number, number]; sta: [number, number] }
  | { t: 'miss'; who: 0 | 1; tech: string; reason: 'esquiva' | 'defesa'; defense?: string; hp: [number, number]; sta: [number, number] }
  | { t: 'buff'; who: 0 | 1; tech: string; sta: [number, number] }
  | { t: 'stun'; who: 0 | 1 }
  | { t: 'rest'; who: 0 | 1; sta: [number, number] }
  | { t: 'ko'; who: 0 | 1 };

export interface FightResult {
  winner: 0 | 1;
  rounds: number;
  events: FightEvent[];
  stats: [CombatStats, CombatStats];
}

interface Live {
  f: Fighter;
  s: CombatStats;
  hp: number;
  sta: number;
  gauge: number;
  cd: Record<string, number>;
  buffHits: number;
  buffPower: number;
  stunned: boolean;
  attacks: Technique[];
  defenses: Technique[];
  preps: Technique[];
}

function live(f: Fighter): Live {
  const s = combatStats(f);
  const deck = f.deck.map((id) => TECH_BY_ID[id]).filter(Boolean);
  return {
    f,
    s,
    hp: s.maxHp,
    sta: s.maxSta,
    gauge: 0,
    cd: {},
    buffHits: 0,
    buffPower: 0,
    stunned: false,
    attacks: deck.filter((t) => t.kind === 'ataque'),
    defenses: deck.filter((t) => t.kind === 'defesa'),
    preps: deck.filter((t) => t.kind === 'preparo'),
  };
}

const ready = (l: Live, t: Technique) => (l.cd[t.id] ?? 0) <= 0 && l.sta >= (t.stamina ?? 0);

function chooseAction(l: Live, rng: Rng): Technique | null {
  const preps = l.buffHits === 0 ? l.preps.filter((t) => ready(l, t)) : [];
  if (preps.length && rng() < 0.5) return preps[0];
  const options = l.attacks.filter((t) => ready(l, t));
  if (!options.length) return null;
  // Golpes mais fortes têm mais chance de serem escolhidos.
  const total = options.reduce((s, t) => s + (t.power ?? 1), 0);
  let r = rng() * total;
  for (const t of options) {
    r -= t.power ?? 1;
    if (r <= 0) return t;
  }
  return options[options.length - 1];
}

/** Simula uma luta inteira de forma determinística a partir da semente. */
export function simulateFight(a: Fighter, b: Fighter, seed: number): FightResult {
  const rng = makeRng(seed);
  const L: [Live, Live] = [live(a), live(b)];
  const events: FightEvent[] = [{ t: 'round', round: 1 }];
  const hp = (): [number, number] => [Math.max(0, Math.round(L[0].hp)), Math.max(0, Math.round(L[1].hp))];
  const sta = (): [number, number] => [Math.round(L[0].sta), Math.round(L[1].sta)];
  let actions = 0;
  let round = 1;

  while (actions < SAFETY_MAX_ACTIONS) {
    // Barra de iniciativa: quem é mais ágil age mais vezes.
    for (const l of L) l.gauge += l.s.speed * (0.8 + rng() * 0.4);
    const who: 0 | 1 = L[0].gauge >= L[1].gauge ? 0 : 1;
    if (L[who].gauge < 100) continue;
    const me = L[who];
    const foe = L[who === 0 ? 1 : 0];
    me.gauge -= 100;
    actions++;
    for (const id of Object.keys(me.cd)) me.cd[id]--;

    if (me.stunned) {
      me.stunned = false;
      events.push({ t: 'stun', who });
    } else {
      const tech = chooseAction(me, rng);
      if (!tech) {
        me.sta = Math.min(me.s.maxSta, me.sta + me.s.maxSta * 0.25);
        events.push({ t: 'rest', who, sta: sta() });
      } else if (tech.kind === 'preparo') {
        me.sta -= tech.stamina ?? 0;
        me.cd[tech.id] = (tech.cooldown ?? 0) + 1;
        me.buffHits = tech.buffHits ?? 0;
        me.buffPower = tech.buffPower ?? 0;
        events.push({ t: 'buff', who, tech: tech.id, sta: sta() });
      } else {
        me.sta -= tech.stamina ?? 0;
        me.cd[tech.id] = (tech.cooldown ?? 0) + 1;
        if (rng() < Math.min(0.4, Math.max(0.03, foe.s.dodge - me.s.crit * 0.3))) {
          events.push({ t: 'miss', who, tech: tech.id, reason: 'esquiva', hp: hp(), sta: sta() });
        } else {
          let dmg = (tech.power ?? 0) * me.s.dmgMult;
          if (tech.art === me.f.art) dmg *= MAIN_ART_POWER;
          if (me.buffHits > 0) {
            dmg *= 1 + me.buffPower;
            me.buffHits--;
          }
          const crit = rng() < me.s.crit;
          if (crit) dmg *= 1.6;
          if (me.sta < me.s.maxSta * 0.2) dmg *= 0.7;
          if (round >= FATIGUE_FROM_ROUND) dmg *= 1 + FATIGUE_STEP * (round - FATIGUE_FROM_ROUND + 1);
          dmg *= 0.85 + rng() * 0.3;
          dmg = Math.max(1, dmg - foe.s.armor);

          const def = foe.defenses.find((d) => (foe.cd[d.id] ?? 0) <= 0);
          let blocked: string | undefined;
          if (def && rng() < (def.chance ?? 0)) {
            foe.cd[def.id] = (def.cooldown ?? 0) + 1;
            if ((def.reduce ?? 0) >= 1) {
              events.push({ t: 'miss', who, tech: tech.id, reason: 'defesa', defense: def.id, hp: hp(), sta: sta() });
              dmg = 0;
            } else {
              dmg *= 1 - (def.reduce ?? 0);
              blocked = def.id;
            }
          }
          if (dmg > 0) {
            foe.hp -= dmg;
            if (tech.stun) foe.stunned = true;
            events.push({ t: 'hit', who, tech: tech.id, dmg: Math.round(dmg), crit, blocked, hp: hp(), sta: sta() });
          }
          if (foe.hp <= 0) {
            events.push({ t: 'ko', who: who === 0 ? 1 : 0 });
            return { winner: who, rounds: round, events, stats: [L[0].s, L[1].s] };
          }
        }
      }
    }

    if (actions % ACTIONS_PER_ROUND === 0) {
      round++;
      for (const l of L) l.sta = Math.min(l.s.maxSta, l.sta + l.s.maxSta * 0.3);
      events.push({ t: 'round', round });
    }
  }
  // Nunca deveria acontecer (o cansaço garante o nocaute), mas por segurança vence quem tem mais vida.
  const winner: 0 | 1 = L[0].hp / L[0].s.maxHp >= L[1].hp / L[1].s.maxHp ? 0 : 1;
  events.push({ t: 'ko', who: winner === 0 ? 1 : 0 });
  return { winner, rounds: round, events, stats: [L[0].s, L[1].s] };
}
