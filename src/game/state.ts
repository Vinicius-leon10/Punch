import {
  ARTS,
  ATTRS,
  BALANCE,
  DECK_SLOTS,
  DIVISIONS,
  GEAR_BONUS_CAP,
  GEAR_BY_ID,
  MISSIONS,
  TECHNIQUES,
  type ArtId,
  type Attrs,
  type Division,
  type HairStyle,
  type Slot,
} from './data';

export interface Appearance {
  skin: number;
  hairStyle: HairStyle;
  hairColor: number;
  beard: boolean;
  tattoo: boolean;
}

export interface FightRecord {
  at: number;
  opponent: string;
  opponentLevel: number;
  won: boolean;
  rankDelta: number;
}

export interface Fighter {
  name: string;
  nickname: string;
  art: ArtId;
  level: number;
  /** Atributos treinados (sem equipamento). Guardados com casas decimais; a tela mostra o valor inteiro. */
  attrs: Attrs;
  techniques: string[];
  deck: string[];
  equipped: Partial<Record<Slot, string>>;
  appearance: Appearance;
  /** Arte do oponente (fantasma), ex.: "oponente_3". O jogador não usa. */
  sprite?: string;
}

export interface SeasonResult {
  season: string;
  division: string;
  points: number;
  money: number;
  gold: number;
}

export interface Player extends Fighter {
  version: 1;
  createdAt: number;
  xp: number;
  energy: number;
  /** Momento em que a energia foi recalculada pela última vez. */
  energyAt: number;
  satiety: number;
  money: number;
  gold: number;
  rankPoints: number;
  wins: number;
  losses: number;
  inventory: string[];
  /** Validade da mensalidade de cada academia paga (timestamp). */
  gymPasses: Record<string, number>;
  currentGym: string;
  wheyCharges: number;
  lastSleep: number;
  vipUntil: number;
  missionsDay: string;
  missions: Record<string, { progress: number; claimed: boolean }>;
  history: FightRecord[];
  /** Temporada atual ("2026-11"). Saves antigos sem o campo recebem a temporada na primeira ação. */
  season: string;
  /** Resultado da última temporada encerrada, para mostrar ao jogador. */
  lastSeason?: SeasonResult;
}

export const xpToNext = (level: number) => Math.round(50 + 20 * Math.pow(level, 1.2));

export function deckSlots(level: number): number {
  let slots = DECK_SLOTS[0][1];
  for (const [lvl, n] of DECK_SLOTS) if (level >= lvl) slots = n;
  return slots;
}

export function isVip(p: Player, now: number): boolean {
  return p.vipUntil > now;
}

export function maxEnergy(p: Player, now: number): number {
  return isVip(p, now) ? BALANCE.vipMaxEnergy : BALANCE.maxEnergy;
}

/** Bônus somado dos equipamentos, com teto por atributo. */
export function gearBonus(f: Fighter): Attrs {
  const total: Attrs = { forca: 0, agilidade: 0, resistencia: 0, tecnica: 0, cardio: 0 };
  for (const id of Object.values(f.equipped)) {
    const g = id ? GEAR_BY_ID[id] : undefined;
    if (!g) continue;
    for (const k of ATTRS) total[k] += g.bonus[k] ?? 0;
  }
  for (const k of ATTRS) total[k] = Math.min(total[k], GEAR_BONUS_CAP);
  return total;
}

export function effectiveAttrs(f: Fighter): Attrs {
  const bonus = gearBonus(f);
  const out = { ...f.attrs };
  for (const k of ATTRS) out[k] = f.attrs[k] + bonus[k];
  return out;
}

export function division(points: number): Division {
  let d = DIVISIONS[0];
  for (const div of DIVISIONS) if (points >= div.min) d = div;
  return d;
}

export function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** Temporada mensal (UTC no protótipo). */
export function seasonKey(now: number): string {
  return new Date(now).toISOString().slice(0, 7);
}

/** Início da próxima temporada (dia 1 do mês seguinte, 00:00 UTC). */
export function seasonEndsAt(now: number): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
}

export function freshMissions(): Player['missions'] {
  return Object.fromEntries(MISSIONS.map((m) => [m.id, { progress: 0, claimed: false }]));
}

export interface NewCharacter {
  name: string;
  nickname: string;
  art: ArtId;
  appearance: Appearance;
}

export function createPlayer(c: NewCharacter, now: number): Player {
  const attrs = Object.fromEntries(ATTRS.map((k) => [k, BALANCE.startAttr])) as Attrs;
  for (const [k, v] of Object.entries(ARTS[c.art].startBonus)) attrs[k as keyof Attrs] += v ?? 0;
  const starters = TECHNIQUES.filter((t) => t.art === c.art && t.price === 0).map((t) => t.id);
  return {
    version: 1,
    createdAt: now,
    name: c.name.trim(),
    nickname: c.nickname.trim(),
    art: c.art,
    appearance: c.appearance,
    level: 1,
    xp: 0,
    attrs,
    techniques: starters,
    deck: starters.slice(0, deckSlots(1)),
    equipped: {},
    energy: BALANCE.maxEnergy,
    energyAt: now,
    satiety: 70,
    money: BALANCE.startMoney,
    gold: BALANCE.startGold,
    rankPoints: 0,
    wins: 0,
    losses: 0,
    inventory: [],
    gymPasses: {},
    currentGym: 'bairro',
    wheyCharges: 0,
    lastSleep: 0,
    vipUntil: 0,
    missionsDay: dayKey(now),
    missions: freshMissions(),
    history: [],
    season: seasonKey(now),
  };
}
