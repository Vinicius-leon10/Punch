// Tela da luta: reproduz os eventos da simulação com animação em pixel art.
import { ARTS, TECH_BY_ID } from '../game/data';
import type { FightEvent, FightResult } from '../game/fight';
import type { Fighter } from '../game/state';
import { drawFighter, type Pose } from './sprite';
import { esc } from './util';

interface Floating {
  x: number;
  y: number;
  text: string;
  color: string;
  born: number;
}

export function playFight(
  host: HTMLElement,
  fighters: [Fighter, Fighter],
  result: FightResult,
  summary: string,
  onClose: () => void,
) {
  host.innerHTML = `
  <div class="fight-overlay" role="dialog" aria-label="Luta">
    <div class="fight-box">
      <div class="fight-bars">
        ${[0, 1]
          .map(
            (i) => `
          <div class="fbar ${i === 1 ? 'right' : ''}">
            <div class="fname">${esc(fighters[i].nickname)} <small>nv ${fighters[i].level} · ${ARTS[fighters[i].art].name}</small></div>
            <div class="meter hp"><span id="hp${i}" style="width:100%"></span></div>
            <div class="meter sta"><span id="sta${i}" style="width:100%"></span></div>
          </div>`,
          )
          .join('<div class="vs">VS</div>')}
      </div>
      <canvas id="ring" width="640" height="300"></canvas>
      <div class="fight-log" id="flog" aria-live="polite"></div>
      <div class="fight-actions" id="factions">
        <button data-f="speed">Velocidade: 1x</button>
        <button data-f="skip">Pular para o resultado</button>
      </div>
    </div>
  </div>`;

  const canvas = host.querySelector<HTMLCanvasElement>('#ring')!;
  const ctx = canvas.getContext('2d')!;
  const log = host.querySelector<HTMLElement>('#flog')!;
  const actions = host.querySelector<HTMLElement>('#factions')!;
  const { stats } = result;
  const poses: [Pose, Pose] = ['guard', 'guard'];
  const poseUntil = [0, 0];
  const floats: Floating[] = [];
  let banner = { text: 'ROUND 1', born: performance.now() };
  let idx = 0;
  let speed = 1;
  let nextAt = performance.now() + 900;
  let done = false;
  let raf = 0;

  const setBars = (hp: [number, number], sta?: [number, number]) => {
    for (const i of [0, 1]) {
      host.querySelector<HTMLElement>(`#hp${i}`)!.style.width = `${(100 * hp[i]) / stats[i].maxHp}%`;
      if (sta) host.querySelector<HTMLElement>(`#sta${i}`)!.style.width = `${Math.max(0, (100 * sta[i]) / stats[i].maxSta)}%`;
    }
  };
  const posX = (i: number) => (i === 0 ? canvas.width * 0.36 : canvas.width * 0.64);
  const addLog = (html: string) => {
    const p = document.createElement('p');
    p.innerHTML = html;
    log.prepend(p);
  };
  const name = (i: 0 | 1) => `<b class="c${i}">${esc(fighters[i].nickname)}</b>`;
  const techName = (id: string) => TECH_BY_ID[id]?.name ?? id;
  const attackPose = (id: string): Pose => {
    const n = techName(id).toLowerCase();
    return /chute|meia|armada|martelo|parafuso|rasteira|joelh/.test(n) ? 'kick' : 'punch';
  };

  const apply = (e: FightEvent, t: number) => {
    const hold = 380 / speed;
    switch (e.t) {
      case 'round':
        banner = { text: `ROUND ${e.round}`, born: t };
        if (e.round > 1) addLog(`<i>— Round ${e.round} —</i>`);
        break;
      case 'hit': {
        const foe = e.who === 0 ? 1 : 0;
        poses[e.who] = attackPose(e.tech);
        poses[foe] = 'hit';
        poseUntil[e.who] = poseUntil[foe] = t + hold;
        floats.push({ x: posX(foe), y: 120, text: `${e.crit ? 'CRÍTICO ' : ''}-${e.dmg}`, color: e.crit ? '#ffd23f' : '#ff5a5a', born: t });
        setBars(e.hp, e.sta);
        addLog(
          `${name(e.who)} acertou <b>${techName(e.tech)}</b> (${e.dmg}${e.crit ? ', crítico' : ''})${e.blocked ? ` — ${techName(e.blocked)} reduziu o dano` : ''}.`,
        );
        break;
      }
      case 'miss': {
        const foe = e.who === 0 ? 1 : 0;
        poses[e.who] = attackPose(e.tech);
        poseUntil[e.who] = t + hold;
        floats.push({ x: posX(foe), y: 120, text: e.reason === 'esquiva' ? 'ESQUIVOU' : techName(e.defense ?? ''), color: '#9ad1ff', born: t });
        setBars(e.hp, e.sta);
        addLog(`${name(foe)} ${e.reason === 'esquiva' ? 'esquivou de' : `usou ${techName(e.defense ?? '')} contra`} ${techName(e.tech)}.`);
        break;
      }
      case 'buff':
        poses[e.who] = 'punch';
        poseUntil[e.who] = t + hold;
        floats.push({ x: posX(e.who), y: 110, text: techName(e.tech), color: '#7CFC9A', born: t });
        setBars(hpNow(), e.sta);
        addLog(`${name(e.who)} usou <b>${techName(e.tech)}</b>: próximos golpes mais fortes.`);
        break;
      case 'stun':
        floats.push({ x: posX(e.who), y: 110, text: 'ATORDOADO', color: '#ffb347', born: t });
        addLog(`${name(e.who)} está atordoado e perdeu a vez.`);
        break;
      case 'rest':
        floats.push({ x: posX(e.who), y: 110, text: 'recuperando fôlego', color: '#cccccc', born: t });
        setBars(hpNow(), e.sta);
        addLog(`${name(e.who)} está sem fôlego e recua para respirar.`);
        break;
      case 'ko':
        poses[e.who] = 'ko';
        poses[e.who === 0 ? 1 : 0] = 'win';
        poseUntil[0] = poseUntil[1] = Infinity;
        banner = { text: 'NOCAUTE!', born: t };
        addLog(`<b>NOCAUTE!</b> ${name(e.who)} caiu.`);
        finish();
        break;
    }
  };

  let lastHp: [number, number] = [stats[0].maxHp, stats[1].maxHp];
  const hpNow = () => lastHp;
  const trackHp = (e: FightEvent) => {
    if ('hp' in e) lastHp = e.hp;
  };

  const finish = () => {
    if (done) return;
    done = true;
    actions.innerHTML = `<div class="fight-result ${result.winner === 0 ? 'win' : 'lose'}">${esc(summary)}</div><button data-f="close" class="primary">Continuar</button>`;
  };

  const frame = (t: number) => {
    while (!done && idx < result.events.length && t >= nextAt) {
      const e = result.events[idx++];
      trackHp(e);
      apply(e, t);
      nextAt = t + (e.t === 'round' ? 900 : 520) / speed;
    }
    for (const i of [0, 1]) if (t > poseUntil[i]) poses[i] = 'guard';

    ctx.imageSmoothingEnabled = false;
    // Fundo: ringue numa garagem da cidade.
    ctx.fillStyle = '#1b1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#26243f';
    for (let i = 0; i < 8; i++) ctx.fillRect(i * 90 + 10, 30, 50, 120);
    ctx.fillStyle = '#ffd23f22';
    for (let i = 0; i < 8; i++) ctx.fillRect(i * 90 + 20, 45, 12, 12);
    ctx.fillStyle = '#3c3a5c';
    ctx.fillRect(0, 230, canvas.width, 70);
    ctx.fillStyle = '#5b2a2a';
    ctx.fillRect(60, 225, canvas.width - 120, 12);
    ctx.fillStyle = '#c94b4b';
    for (const yy of [130, 160, 190]) ctx.fillRect(40, yy, canvas.width - 80, 3);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(36, 120, 8, 110);
    ctx.fillRect(canvas.width - 44, 120, 8, 110);

    for (const i of [0, 1] as const) {
      const lunge = poses[i] === 'punch' || poses[i] === 'kick' ? 26 : poses[i] === 'hit' ? -10 : 0;
      drawFighter(ctx, fighters[i], posX(i) + (i === 0 ? lunge : -lunge), 232, 5, i === 0 ? 1 : -1, poses[i], t + i * 300);
    }

    ctx.textAlign = 'center';
    ctx.font = '14px "Press Start 2P", monospace';
    for (let k = floats.length - 1; k >= 0; k--) {
      const fl = floats[k];
      const age = (t - fl.born) / 900;
      if (age > 1) {
        floats.splice(k, 1);
        continue;
      }
      ctx.globalAlpha = 1 - age;
      ctx.fillStyle = '#000';
      ctx.fillText(fl.text, fl.x + 2, fl.y - age * 40 + 2);
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.text, fl.x, fl.y - age * 40);
      ctx.globalAlpha = 1;
    }
    const bAge = (t - banner.born) / 1200;
    if (bAge < 1 || banner.text === 'NOCAUTE!') {
      ctx.globalAlpha = banner.text === 'NOCAUTE!' ? 1 : 1 - bAge;
      ctx.font = '28px "Press Start 2P", monospace';
      ctx.fillStyle = '#000';
      ctx.fillText(banner.text, canvas.width / 2 + 3, 93);
      ctx.fillStyle = banner.text === 'NOCAUTE!' ? '#ff5470' : '#ffd23f';
      ctx.fillText(banner.text, canvas.width / 2, 90);
      ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  host.querySelector('.fight-box')!.addEventListener('click', (ev) => {
    const b = (ev.target as HTMLElement).closest<HTMLButtonElement>('[data-f]');
    if (!b) return;
    if (b.dataset.f === 'speed') {
      speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
      b.textContent = `Velocidade: ${speed}x`;
    } else if (b.dataset.f === 'skip') {
      const t = performance.now();
      while (idx < result.events.length) {
        const e = result.events[idx++];
        trackHp(e);
        if (e.t === 'hit' || e.t === 'miss' || e.t === 'buff' || e.t === 'rest') setBars(lastHp, e.sta);
        if (e.t === 'ko') apply(e, t);
      }
    } else if (b.dataset.f === 'close') {
      cancelAnimationFrame(raf);
      host.innerHTML = '';
      onClose();
    }
  });
}
