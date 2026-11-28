// Ações do jogador. Cada ação recebe o estado e o horário, altera o estado e devolve o resultado.
// No jogo online estas mesmas funções rodam no servidor, que é quem decide o resultado.

import {
  BALANCE,
  FOODS,
  GEAR_BY_ID,
  GYMS,
  JOBS,
  MISSIONS,
  OFF_ART_PRICE,
  STATIONS,
  TECH_BY_ID,
  ATTR_LABEL,
  SEASON_KEEP,
  type Technique,
} from './data';
import { simulateFight, type FightResult } from './fight';
import { hashString } from './rng';
import { makeOpponent } from './opponents';
import { dayKey, deckSlots, division, freshMissions, isVip, maxEnergy, seasonKey, xpToNext, type Fighter, type Player } from './state';

/** Momentos que a tela mostra com um aviso grande (pose do personagem). */
export type GameEvent = 'nivel' | 'energia' | 'fome' | 'missao';
export type Result = { ok: true; msg: string; ev?: GameEvent } | { ok: false; msg: string; ev?: GameEvent };
const ok = (msg: string, ev?: GameEvent): Result => ({ ok: true, msg, ev });
const fail = (msg: string, ev?: GameEvent): Result => ({ ok: false, msg, ev });

/** Recupera energia pelo tempo real passado e renova as missões quando muda o dia. Chamar antes de toda ação. */
export function tick(p: Player, now: number): void {
  const regenMin = isVip(p, now) ? BALANCE.vipEnergyRegenMin : BALANCE.energyRegenMin;
  const max = maxEnergy(p, now);
  const step = regenMin * 60_000;
  if (p.energy >= max) {
    p.energyAt = now;
  } else {
    const gained = Math.floor((now - p.energyAt) / step);
    if (gained > 0) {
      p.energy = Math.min(max, p.energy + gained);
      p.energyAt += gained * step;
    }
  }
  const day = dayKey(now);
  if (p.missionsDay !== day) {
    p.missionsDay = day;
    p.missions = freshMissions();
  }
  endSeasonIfDue(p, now);
}

/**
 * Fecha a temporada quando o mês muda: paga o prêmio da divisão em que o jogador terminou e mantém
 * parte dos pontos. Paga uma vez só, mesmo que o jogador tenha ficado meses sem entrar.
 */
export function endSeasonIfDue(p: Player, now: number): boolean {
  const current = seasonKey(now);
  if (!p.season) p.season = current;
  if (p.season === current) return false;
  const div = division(p.rankPoints);
  p.money += div.reward.money;
  p.gold += div.reward.gold;
  p.lastSeason = { season: p.season, division: div.name, points: p.rankPoints, money: div.reward.money, gold: div.reward.gold };
  p.rankPoints = Math.floor(p.rankPoints * SEASON_KEEP);
  p.season = current;
  return true;
}

/** Milissegundos até o próximo ponto de energia. */
export function nextEnergyIn(p: Player, now: number): number {
  const regenMin = isVip(p, now) ? BALANCE.vipEnergyRegenMin : BALANCE.energyRegenMin;
  return Math.max(0, p.energyAt + regenMin * 60_000 - now);
}

function bump(p: Player, mission: string) {
  const m = p.missions[mission];
  if (m) m.progress++;
}

/** Soma XP e sobe de nível. Devolve quantos níveis subiu. */
export function addXp(p: Player, amount: number, now: number): number {
  let gained = 0;
  p.xp += Math.round(amount * (isVip(p, now) ? 1 + BALANCE.vipBonus : 1));
  while (p.level < BALANCE.maxLevel && p.xp >= xpToNext(p.level)) {
    p.xp -= xpToNext(p.level);
    p.level++;
    gained++;
  }
  if (p.level >= BALANCE.maxLevel) p.xp = Math.min(p.xp, xpToNext(p.level));
  return gained;
}

const levelMsg = (n: number, p: Player) => (n > 0 ? ` Subiu para o nível ${p.level}!` : '');

export function gymAccess(p: Player, gymId: string, now: number): boolean {
  const gym = GYMS.find((g) => g.id === gymId);
  if (!gym || p.level < gym.minLevel) return false;
  return gym.weeklyFee === 0 || (p.gymPasses[gymId] ?? 0) > now;
}

export function buyGymPass(p: Player, gymId: string, now: number): Result {
  const gym = GYMS.find((g) => g.id === gymId);
  if (!gym) return fail('Academia não existe.');
  if (p.level < gym.minLevel) return fail(`Precisa do nível ${gym.minLevel}.`);
  if (gym.weeklyFee === 0) return fail('Essa academia é grátis.');
  if (p.money < gym.weeklyFee) return fail('Moedas insuficientes.');
  p.money -= gym.weeklyFee;
  const from = Math.max(now, p.gymPasses[gymId] ?? 0);
  p.gymPasses[gymId] = from + 7 * 24 * 3600_000;
  p.currentGym = gymId;
  return ok(`Mensalidade do ${gym.name} paga por 7 dias.`);
}

export function selectGym(p: Player, gymId: string, now: number): Result {
  if (!gymAccess(p, gymId, now)) return fail('Você não tem acesso a essa academia.');
  p.currentGym = gymId;
  return ok('Academia trocada.');
}

export function train(p: Player, stationId: string, now: number): Result {
  tick(p, now);
  const st = STATIONS.find((s) => s.id === stationId);
  if (!st) return fail('Aparelho não existe.');
  if (!gymAccess(p, p.currentGym, now)) p.currentGym = 'bairro';
  if (p.energy < BALANCE.trainEnergy) return fail('Sem energia. Descanse ou espere recarregar.', 'energia');
  if (p.satiety <= 0) return fail('Você está com muita fome para treinar. Coma algo.', 'fome');
  const gym = GYMS.find((g) => g.id === p.currentGym)!;
  const hungry = p.satiety < BALANCE.hungryThreshold;
  const value = p.attrs[st.attr];
  let gain = 3 * gym.mult * (25 / (25 + value));
  if (hungry) gain *= 0.5;
  if (p.wheyCharges > 0) {
    gain *= 1 + BALANCE.wheyBonus;
    p.wheyCharges--;
  }
  if (isVip(p, now)) gain *= 1 + BALANCE.vipBonus;
  p.attrs[st.attr] = value + gain;
  p.energy -= BALANCE.trainEnergy;
  p.satiety = Math.max(0, p.satiety - BALANCE.trainSatiety);
  bump(p, 'treinar');
  const lv = addXp(p, BALANCE.trainXp + p.level * BALANCE.trainXpPerLevel, now);
  return ok(`${st.name}: +${gain.toFixed(1)} ${ATTR_LABEL[st.attr]}${hungry ? ' (rendeu menos: com fome)' : ''}.${levelMsg(lv, p)}`, lv > 0 ? 'nivel' : undefined);
}

export function eat(p: Player, foodId: string, now: number): Result {
  tick(p, now);
  const food = FOODS.find((f) => f.id === foodId);
  if (!food) return fail('Comida não existe.');
  if (p.money < food.price) return fail('Moedas insuficientes.');
  if (p.satiety >= BALANCE.maxSatiety) return fail('Você está cheio.');
  p.money -= food.price;
  p.satiety = Math.min(BALANCE.maxSatiety, p.satiety + food.satiety);
  if (food.energy) p.energy = Math.min(maxEnergy(p, now), p.energy + food.energy);
  bump(p, 'comer');
  return ok(`Comeu ${food.name}.`);
}

export function sleepReadyAt(p: Player): number {
  return p.lastSleep + BALANCE.sleepCooldownH * 3600_000;
}

export function sleep(p: Player, now: number): Result {
  tick(p, now);
  if (now < sleepReadyAt(p)) return fail('Você ainda não está com sono.');
  p.energy = Math.min(maxEnergy(p, now), p.energy + BALANCE.sleepEnergy);
  p.lastSleep = now;
  return ok(`Dormiu bem: +${BALANCE.sleepEnergy} de energia.`);
}

export function jobPay(level: number, jobId: string): number {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return 0;
  return Math.round(job.energy * (job.rate + level * BALANCE.jobPayPerLevel));
}

/** Bico: gasta energia e saciedade, paga moedas. Não dá XP nem bônus VIP. */
export function work(p: Player, jobId: string, now: number): Result {
  tick(p, now);
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return fail('Esse trabalho não existe.');
  if (p.level < job.minLevel) return fail(`Precisa do nível ${job.minLevel}.`);
  if (p.energy < job.energy) return fail('Sem energia para trabalhar.', 'energia');
  if (p.satiety <= 0) return fail('Você está com muita fome para trabalhar. Coma algo.', 'fome');
  const pay = jobPay(p.level, job.id);
  p.energy -= job.energy;
  p.satiety = Math.max(0, p.satiety - job.satiety);
  p.money += pay;
  return ok(`${job.name}: +${pay} moedas.`);
}

export function techPrice(p: Player, t: Technique): number {
  return Math.round(t.price * (t.art === p.art ? 1 : OFF_ART_PRICE));
}

export function learnTechnique(p: Player, techId: string, now: number): Result {
  tick(p, now);
  const t = TECH_BY_ID[techId];
  if (!t) return fail('Técnica não existe.');
  if (p.techniques.includes(t.id)) return fail('Você já sabe essa técnica.');
  if (p.level < t.minLevel) return fail(`Precisa do nível ${t.minLevel}.`);
  if (t.requires && !p.techniques.includes(t.requires)) return fail(`Aprenda ${TECH_BY_ID[t.requires].name} antes.`);
  const price = techPrice(p, t);
  if (p.money < price) return fail('Moedas insuficientes.');
  p.money -= price;
  p.techniques.push(t.id);
  if (p.deck.length < deckSlots(p.level)) p.deck.push(t.id);
  return ok(`Aprendeu ${t.name}!`);
}

export function toggleDeck(p: Player, techId: string): Result {
  if (!p.techniques.includes(techId)) return fail('Você não sabe essa técnica.');
  const i = p.deck.indexOf(techId);
  if (i >= 0) {
    p.deck.splice(i, 1);
    return ok('Técnica retirada do deck.');
  }
  if (p.deck.length >= deckSlots(p.level)) return fail('Deck cheio. Retire uma técnica antes.');
  p.deck.push(techId);
  return ok('Técnica colocada no deck.');
}

export function buyGear(p: Player, gearId: string, now: number): Result {
  tick(p, now);
  const g = GEAR_BY_ID[gearId];
  if (!g) return fail('Item não existe.');
  if (p.inventory.includes(g.id)) return fail('Você já tem esse item.');
  if (p.level < g.minLevel) return fail(`Precisa do nível ${g.minLevel}.`);
  if (g.currency === 'moedas') {
    if (p.money < g.price) return fail('Moedas insuficientes.');
    p.money -= g.price;
  } else {
    if (p.gold < g.price) return fail('Ouro insuficiente.');
    p.gold -= g.price;
  }
  p.inventory.push(g.id);
  p.equipped[g.slot] = g.id;
  return ok(`Comprou e equipou ${g.name}.`);
}

export function equip(p: Player, gearId: string): Result {
  const g = GEAR_BY_ID[gearId];
  if (!g || !p.inventory.includes(gearId)) return fail('Você não tem esse item.');
  if (p.equipped[g.slot] === gearId) {
    delete p.equipped[g.slot];
    return ok(`${g.name} desequipado.`);
  }
  p.equipped[g.slot] = gearId;
  return ok(`${g.name} equipado.`);
}

export function buyWhey(p: Player, now: number): Result {
  tick(p, now);
  if (p.money < BALANCE.wheyPrice) return fail('Moedas insuficientes.');
  p.money -= BALANCE.wheyPrice;
  p.wheyCharges += BALANCE.wheyCharges;
  return ok(`Whey: próximos ${BALANCE.wheyCharges} treinos rendem +${BALANCE.wheyBonus * 100}%.`);
}

export function buyEnergyDrink(p: Player, now: number): Result {
  tick(p, now);
  if (p.gold < BALANCE.energyDrinkGold) return fail('Ouro insuficiente.');
  p.gold -= BALANCE.energyDrinkGold;
  p.energy = Math.min(maxEnergy(p, now), p.energy + BALANCE.energyDrinkAmount);
  return ok(`Energético: +${BALANCE.energyDrinkAmount} de energia.`);
}

export function buyVip(p: Player, now: number): Result {
  tick(p, now);
  if (p.gold < BALANCE.vipGoldPrice) return fail('Ouro insuficiente.');
  p.gold -= BALANCE.vipGoldPrice;
  p.vipUntil = Math.max(now, p.vipUntil) + BALANCE.vipDays * 24 * 3600_000;
  return ok(`VIP ativo por ${BALANCE.vipDays} dias!`);
}

/** Simulação de compra de ouro com dinheiro real (no jogo online passa por um meio de pagamento). */
export function addGold(p: Player, amount: number): Result {
  p.gold += amount;
  return ok(`+${amount} de ouro (compra simulada).`);
}

export function claimMission(p: Player, id: string, now: number): Result {
  tick(p, now);
  const def = MISSIONS.find((m) => m.id === id);
  const m = p.missions[id];
  if (!def || !m) return fail('Missão não existe.');
  if (m.claimed) return fail('Recompensa já resgatada.');
  if (m.progress < def.goal) return fail('Missão ainda não concluída.');
  m.claimed = true;
  p.money += def.reward;
  return ok(`Missão cumprida: +${def.reward} moedas.`, 'missao');
}

/** Lista os oponentes disponíveis agora (mudam a cada hora e a cada luta). */
export function opponentList(p: Player, now: number, count = 3): Fighter[] {
  const hour = Math.floor(now / 3600_000);
  return Array.from({ length: count }, (_, i) => makeOpponent(p.level, `${p.createdAt}:${hour}:${p.wins + p.losses}:${i}`));
}

export type FightOutcome = {
  ok: boolean;
  msg: string;
  ev?: GameEvent;
  fight?: FightResult;
  opponent?: Fighter;
  won?: boolean;
  rankDelta?: number;
  money?: number;
  xp?: number;
  levels?: number;
};

export function fight(p: Player, opponent: Fighter, now: number): FightOutcome {
  tick(p, now);
  if (Math.abs(opponent.level - p.level) > BALANCE.levelRange) return fail('Oponente fora da sua faixa de nível.');
  if (p.energy < BALANCE.fightEnergy) return fail('Sem energia para lutar.', 'energia');
  if (p.satiety <= 0) return fail('Você está com muita fome para lutar. Coma algo.', 'fome');
  if (!p.deck.some((id) => TECH_BY_ID[id]?.kind === 'ataque')) return fail('Coloque ao menos uma técnica de ataque no deck.');

  const seed = hashString(`${p.createdAt}:${now}:${opponent.name}:${opponent.nickname}`);
  const result = simulateFight(p, opponent, seed);
  const won = result.winner === 0;
  p.energy -= BALANCE.fightEnergy;
  p.satiety = Math.max(0, p.satiety - BALANCE.fightSatiety);

  const vipMult = isVip(p, now) ? 1 + BALANCE.vipBonus : 1;
  let rankDelta: number;
  let money: number;
  let xp: number;
  if (won) {
    rankDelta = 25 + Math.max(0, opponent.level - p.level) * 5;
    money = Math.round((30 + p.level * 5) * vipMult);
    xp = 40 + p.level * 5;
    p.wins++;
    bump(p, 'vencer');
  } else {
    rankDelta = -Math.min(15, p.rankPoints);
    money = Math.round(10 * vipMult);
    xp = 15 + p.level * 2;
    p.losses++;
  }
  p.rankPoints += rankDelta;
  p.money += money;
  const levels = addXp(p, xp, now);
  p.history.unshift({ at: now, opponent: `${opponent.name} "${opponent.nickname}"`, opponentLevel: opponent.level, won, rankDelta });
  p.history = p.history.slice(0, 20);
  return {
    ok: true,
    msg: won ? `Vitória por nocaute! +${money} moedas.${levelMsg(levels, p)}` : `Derrota por nocaute. +${money} moedas pela luta.${levelMsg(levels, p)}`,
    fight: result,
    opponent,
    won,
    rankDelta,
    money,
    xp,
    levels,
  };
}
