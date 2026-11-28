// Tela da luta: reproduz os eventos da simulação com animação em pixel art.
import { ARTS, TECH_BY_ID } from '../game/data';
import type { FightEvent, FightResult } from '../game/fight';
import type { Fighter } from '../game/state';
import { bodyOf, getImage, poseName } from './art';
import { ringBackground } from './scene';
import { drawFighter, type Pose } from './sprite';

type FPose = Pose | 'block';
const POSE_H: Partial<Record<FPose, number>> = { ko: 96, win: 262 };
const STAND_H = 236;

/** Imagens de cada pose de um lutador. Oponentes com só uma arte usam a guarda em todas. */
function looksOf(f: Fighter): Partial<Record<FPose, string>> | null {
  if (f.sprite === 'rival') return { guard: 'rival_guarda', punch: 'rival_soco', kick: 'rival_soco', hit: 'rival_golpe', ko: 'rival_nocaute', win: 'rival_guarda', block: 'rival_guarda' };
  if (f.sprite) return { guard: f.sprite };
  const b = bodyOf(f);
  const k = (key: string) => poseName(b, key);
  return { guard: k('guarda'), punch: k('soco'), kick: k('chute'), hit: k('golpe'), ko: k('nocaute'), win: k('vitoria'), block: k('defesa') };
}
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
      <canvas id="ring" width="640" height="360"></canvas>
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
  const poses: [FPose, FPose] = ['guard', 'guard'];
  const looks = [looksOf(fighters[0]), looksOf(fighters[1])];
  const hitAt = [-1e9, -1e9];
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
  const posX = (i: number) => (i === 0 ? canvas.width * 0.32 : canvas.width * 0.68);
  const BASE = 338;

  /** Desenha a pose em imagem. Devolve false se a imagem ainda não carregou (usa o boneco antigo). */
  const drawLook = (i: 0 | 1, pose: FPose, t: number): boolean => {
    const look = looks[i];
    if (!look) return false;
    const name = look[pose] ?? look.guard!;
    const im = getImage(name);
    if (!im || !im.complete || !im.naturalWidth) return false;
    const own = !!look[pose];
    const h = own ? (POSE_H[pose] ?? STAND_H) : STAND_H;
    const w = (im.naturalWidth / im.naturalHeight) * h;
    const dir = i === 0 ? 1 : -1;
    let x = posX(i);
    if (pose === 'punch' || pose === 'kick') x += dir * (own ? 18 : 34);
    if (pose === 'hit') x -= dir * 12;
    const since = t - hitAt[i];
    if (since < 220) x += Math.sin(since / 18) * 6;
    ctx.save();
    if (since < 220) ctx.filter = 'brightness(1.9) sepia(1) saturate(5) hue-rotate(-25deg)';
    if (pose === 'ko' && !own) {
      // Sem pose de nocaute: a guarda tomba para trás.
      ctx.translate(x, BASE - 8);
      ctx.rotate((dir * Math.PI) / 2);
      ctx.drawImage(im, -w / 2, -h + 10, w, h);
    } else if (pose === 'punch' && !own) {
      ctx.translate(x, BASE);
      ctx.rotate(-dir * 0.08);
      ctx.drawImage(im, -w / 2, -h, w, h);
    } else {
      ctx.drawImage(im, x - w / 2, BASE - h, w, h);
    }
    ctx.restore();
    return true;
  };
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
        hitAt[foe] = t;
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
        if (e.reason === 'defesa') {
          poses[foe] = 'block';
          poseUntil[foe] = t + hold;
        }
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

    // Fundo: o ringue do projeto (art/) cobrindo o quadro; o desenhado em código só enquanto carrega.
    const bg = getImage('bg_ringue');
    if (bg && bg.complete && bg.naturalWidth) {
      const sc = Math.max(canvas.width / bg.naturalWidth, canvas.height / bg.naturalHeight);
      const bw = bg.naturalWidth * sc;
      const bh = bg.naturalHeight * sc;
      ctx.drawImage(bg, (canvas.width - bw) / 2, (canvas.height - bh) / 2, bw, bh);
    } else {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(ringBackground(), 0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = 'rgba(0, 0, 0, .35)';
    for (const i of [0, 1]) {
      ctx.beginPath();
      ctx.ellipse(posX(i), BASE, 70, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const i of [0, 1] as const) {
      if (drawLook(i, poses[i], t)) continue;
      const pose: Pose = poses[i] === 'block' ? 'guard' : (poses[i] as Pose);
      const lunge = pose === 'punch' || pose === 'kick' ? 26 : pose === 'hit' ? -10 : 0;
      ctx.imageSmoothingEnabled = false;
      drawFighter(ctx, fighters[i], posX(i) + (i === 0 ? lunge : -lunge), BASE, 4, i === 0 ? 1 : -1, pose, t + i * 300);
    }

    ctx.textAlign = 'center';
    ctx.font = '22px "Lilita One", Impact, sans-serif';
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
      ctx.font = '52px "Lilita One", Impact, sans-serif';
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
