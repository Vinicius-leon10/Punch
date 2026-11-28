import { describe, expect, it } from 'vitest';
import { BALANCE, JOBS, TECHNIQUES } from '../src/game/data';
import { simulateFight } from '../src/game/fight';
import { makeOpponent } from '../src/game/opponents';
import { createPlayer, deckSlots, effectiveAttrs, xpToNext } from '../src/game/state';
import * as A from '../src/game/actions';

const T0 = Date.UTC(2026, 10, 24, 12);
const newPlayer = () =>
  createPlayer(
    { name: 'Teste', nickname: 'Cobaia', art: 'boxe', appearance: { skin: 0, hairStyle: 'curto', hairColor: 0, beard: false, tattoo: false } },
    T0,
  );

describe('criação', () => {
  it('começa com técnicas grátis da arte e bônus de atributo', () => {
    const p = newPlayer();
    expect(p.deck).toEqual(['jab', 'direto', 'esquiva']);
    expect(p.attrs.agilidade).toBe(BALANCE.startAttr + 3);
    expect(p.money).toBe(BALANCE.startMoney);
  });
  it('toda arte tem 3 técnicas iniciais com pelo menos um ataque', () => {
    for (const art of ['boxe', 'muaythai', 'jiujitsu', 'capoeira']) {
      const free = TECHNIQUES.filter((t) => t.art === art && t.price === 0);
      expect(free).toHaveLength(3);
      expect(free.some((t) => t.kind === 'ataque')).toBe(true);
    }
  });
});

describe('energia e necessidades', () => {
  it('treinar gasta energia e fome e aumenta o atributo', () => {
    const p = newPlayer();
    const before = p.attrs.forca;
    const r = A.train(p, 'saco', T0);
    expect(r.ok).toBe(true);
    expect(p.attrs.forca).toBeGreaterThan(before);
    expect(p.energy).toBe(BALANCE.maxEnergy - BALANCE.trainEnergy);
    expect(p.satiety).toBe(70 - BALANCE.trainSatiety);
  });
  it('energia recarrega com o tempo real', () => {
    const p = newPlayer();
    p.energy = 0;
    A.tick(p, T0 + BALANCE.energyRegenMin * 60_000 * 10 + 1000);
    expect(p.energy).toBe(10);
  });
  it('VIP recarrega mais rápido e tem mais energia máxima', () => {
    const p = newPlayer();
    p.gold = 1000;
    A.buyVip(p, T0);
    p.energy = 0;
    p.energyAt = T0;
    A.tick(p, T0 + 60 * 60_000);
    expect(p.energy).toBe(60 / BALANCE.vipEnergyRegenMin);
    A.tick(p, T0 + 24 * 3600_000);
    expect(p.energy).toBe(BALANCE.vipMaxEnergy);
  });
  it('não treina sem energia', () => {
    const p = newPlayer();
    p.energy = 5;
    expect(A.train(p, 'saco', T0).ok).toBe(false);
  });
  it('dormir tem intervalo mínimo', () => {
    const p = newPlayer();
    p.energy = 0;
    expect(A.sleep(p, T0).ok).toBe(true);
    expect(A.sleep(p, T0 + 1000).ok).toBe(false);
  });
});

describe('progressão', () => {
  it('sobe de nível e ganha espaços no deck', () => {
    const p = newPlayer();
    A.addXp(p, xpToNext(1) + xpToNext(2) + 1, T0);
    expect(p.level).toBe(3);
    expect(deckSlots(3)).toBe(4);
  });
  it('técnica de outra arte custa mais e exige nível', () => {
    const p = newPlayer();
    p.money = 10_000;
    expect(A.learnTechnique(p, 'chavebraco', T0).ok).toBe(false);
    p.level = 6;
    const before = p.money;
    expect(A.learnTechnique(p, 'chavebraco', T0).ok).toBe(true);
    expect(before - p.money).toBe(375);
  });
  it('bônus de equipamento tem teto', () => {
    const p = newPlayer();
    p.inventory = ['luva4', 'short4', 'prot4'];
    p.equipped = { luvas: 'luva4', shorts: 'short4', protetor: 'prot4' };
    const eff = effectiveAttrs(p);
    expect(eff.forca - p.attrs.forca).toBeLessThanOrEqual(15);
  });
  it('missões diárias renovam no dia seguinte', () => {
    const p = newPlayer();
    A.train(p, 'saco', T0);
    expect(p.missions.treinar.progress).toBe(1);
    A.tick(p, T0 + 24 * 3600_000);
    expect(p.missions.treinar.progress).toBe(0);
  });
});

describe('luta', () => {
  it('é determinística pela semente e sempre termina em nocaute', () => {
    const a = makeOpponent(10, 'a');
    const b = makeOpponent(10, 'b');
    const r1 = simulateFight(a, b, 42);
    const r2 = simulateFight(a, b, 42);
    expect(r1).toEqual(r2);
    expect(r1.events[r1.events.length - 1].t).toBe('ko');
  });
  it('oponentes ficam na faixa de ±2 níveis', () => {
    for (let i = 0; i < 50; i++) {
      const o = makeOpponent(10, `x${i}`);
      expect(Math.abs(o.level - 10)).toBeLessThanOrEqual(2);
    }
  });
  it('lutas terminam em tempo razoável e são equilibradas entre lutadores parecidos', () => {
    let wins = 0;
    let rounds = 0;
    const N = 400;
    for (let i = 0; i < N; i++) {
      const a = makeOpponent(15, `p${i}`);
      const b = makeOpponent(15, `q${i}`);
      a.level = b.level = 15;
      const r = simulateFight(a, b, i);
      if (r.winner === 0) wins++;
      rounds += r.rounds;
    }
    expect(wins / N).toBeGreaterThan(0.35);
    expect(wins / N).toBeLessThan(0.65);
    expect(rounds / N).toBeLessThan(6);
  });
  it('lutar dá recompensa e mexe no rank', () => {
    const p = newPlayer();
    const [o] = A.opponentList(p, T0);
    const r = A.fight(p, o, T0);
    expect(r.ok).toBe(true);
    expect(p.wins + p.losses).toBe(1);
    expect(p.energy).toBe(BALANCE.maxEnergy - BALANCE.fightEnergy);
  });
});

describe('trabalho', () => {
  it('troca energia e saciedade por moedas, sem XP', () => {
    const p = newPlayer();
    const r = A.work(p, 'lanchonete', T0);
    expect(r.ok).toBe(true);
    expect(p.money).toBe(BALANCE.startMoney + A.jobPay(1, 'lanchonete'));
    expect(p.energy).toBe(BALANCE.maxEnergy - JOBS[0].energy);
    expect(p.satiety).toBe(70 - JOBS[0].satiety);
    expect(p.xp).toBe(0);
  });
  it('exige nível, energia e comida', () => {
    const p = newPlayer();
    expect(A.work(p, 'seguranca', T0).ok).toBe(false);
    p.energy = 5;
    expect(A.work(p, 'lanchonete', T0).ok).toBe(false);
    p.energy = 100;
    p.satiety = 0;
    expect(A.work(p, 'lanchonete', T0).ok).toBe(false);
  });
  it('rende mais que perder, mas menos que a média de lutar (50% de vitórias)', () => {
    for (let lvl = 1; lvl <= BALANCE.maxLevel; lvl++) {
      const win = 30 + 5 * lvl;
      const avgFight = (win + 10) / 2 / BALANCE.fightEnergy;
      const loss = 10 / BALANCE.fightEnergy;
      for (const j of JOBS.filter((j) => j.minLevel <= lvl)) {
        const perEnergy = A.jobPay(lvl, j.id) / j.energy;
        expect(perEnergy).toBeGreaterThan(loss);
        expect(perEnergy).toBeLessThan(avgFight * 0.7);
      }
    }
  });
  it('bicos de nível maior pagam mais por energia', () => {
    for (let i = 1; i < JOBS.length; i++) {
      const lvl = JOBS[i].minLevel;
      expect(A.jobPay(lvl, JOBS[i].id) / JOBS[i].energy).toBeGreaterThan(A.jobPay(lvl, JOBS[i - 1].id) / JOBS[i - 1].energy);
    }
  });
});

describe('pré-requisitos de técnicas', () => {
  it('apontam para técnica da mesma arte, de nível menor, sem ciclo', () => {
    for (const t of TECHNIQUES.filter((t) => t.requires)) {
      const r = TECHNIQUES.find((x) => x.id === t.requires);
      expect(r, t.id).toBeDefined();
      expect(r!.art).toBe(t.art);
      expect(r!.minLevel).toBeLessThan(t.minLevel);
    }
  });
  it('toda técnica inicial e pelo menos uma paga de cada arte ficam livres de pré-requisito', () => {
    for (const art of ['boxe', 'muaythai', 'jiujitsu', 'capoeira']) {
      const list = TECHNIQUES.filter((t) => t.art === art);
      expect(list.filter((t) => t.price === 0).every((t) => !t.requires)).toBe(true);
      expect(list.some((t) => t.price > 0 && !t.requires)).toBe(true);
    }
  });
  it('não aprende sem o pré-requisito', () => {
    const p = newPlayer();
    p.money = 10_000;
    p.level = 8;
    expect(A.learnTechnique(p, 'cruzado', T0).ok).toBe(false);
    expect(A.learnTechnique(p, 'gancho', T0).ok).toBe(true);
    expect(A.learnTechnique(p, 'cruzado', T0).ok).toBe(true);
  });
  it('fantasmas só levam técnicas com pré-requisito cumprido', () => {
    for (let i = 0; i < 200; i++) {
      const o = makeOpponent(20, `pre${i}`);
      for (const id of o.techniques) {
        const t = TECHNIQUES.find((x) => x.id === id)!;
        if (t.requires) expect(o.techniques).toContain(t.requires);
      }
    }
  });
});
