// Cenários em pixel art desenhados por código numa resolução baixa e ampliados sem suavizar.
// Arte provisória e original: rua à noite em frente à academia, e o ringue.
import type { Fighter } from '../game/state';
import { makeRng } from '../game/rng';
import { drawFighter, type Pose } from './sprite';

export const VW = 224;
export const VH = 126;

const C = {
  sky0: '#0b0d1f',
  sky1: '#171437',
  sky2: '#2a1d4a',
  far: '#1a1832',
  farLit: '#f3c46b',
  farLit2: '#7ad6e8',
  brick: '#4a2630',
  brickD: '#361b24',
  brickL: '#5d3039',
  mortar: '#2a141b',
  door: '#2b2a3c',
  doorD: '#1e1d2c',
  inside: '#ffb35c',
  insideD: '#c7703a',
  neon: '#ff4f8b',
  neonGlow: 'rgba(255,79,139,0.28)',
  teal: '#2de2c4',
  walk: '#3b3a52',
  walkD: '#2e2d42',
  curb: '#56556f',
  road: '#1b1a29',
  lamp: '#ffcf6b',
  lampGlow: 'rgba(255,190,90,0.16)',
  metal: '#5d6075',
  metalD: '#3a3c4e',
  tire: '#161520',
};

let low: HTMLCanvasElement | null = null;
let staticLayer: HTMLCanvasElement | null = null;

function lowCtx(): CanvasRenderingContext2D {
  if (!low) {
    low = document.createElement('canvas');
    low.width = VW;
    low.height = VH;
  }
  return low.getContext('2d')!;
}

function buildStatic(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = VW;
  c.height = VH;
  const g = c.getContext('2d')!;
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  };
  const rng = makeRng(7);

  // Céu em faixas com pontilhado entre elas.
  r(0, 0, VW, 30, C.sky0);
  r(0, 30, VW, 30, C.sky1);
  r(0, 60, VW, 40, C.sky2);
  for (let x = 0; x < VW; x += 2) {
    r(x + ((x / 2) % 2), 29, 1, 1, C.sky1);
    r(x + ((x / 2) % 2), 59, 1, 1, C.sky2);
  }
  for (let i = 0; i < 40; i++) r(Math.floor(rng() * VW), Math.floor(rng() * 40), 1, 1, rng() < 0.3 ? '#ffffff' : '#8f8cc8');
  // Lua
  r(178, 10, 10, 10, '#f4eccf');
  r(176, 12, 14, 6, '#f4eccf');
  r(181, 12, 3, 3, '#d9cfab');
  r(184, 16, 2, 2, '#d9cfab');

  // Prédios ao fundo
  let x = 0;
  while (x < VW) {
    const w = 14 + Math.floor(rng() * 18);
    const h = 30 + Math.floor(rng() * 40);
    const top = 92 - h;
    r(x, top, w, h + 10, C.far);
    if (rng() < 0.4) r(x + Math.floor(w / 2), top - 6, 1, 6, C.far); // antena
    for (let wy = top + 4; wy < 88; wy += 5)
      for (let wx = x + 2; wx < x + w - 2; wx += 4) if (rng() < 0.32) r(wx, wy, 2, 2, rng() < 0.85 ? C.farLit : C.farLit2);
    x += w + 1;
  }

  // Muro de tijolo da academia (esquerda) e da casa (direita)
  const wallTop = 46;
  r(0, wallTop, VW, 54, C.brick);
  for (let yy = wallTop; yy < 100; yy += 4) {
    r(0, yy, VW, 1, C.mortar);
    const off = (yy / 4) % 2 ? 0 : 4;
    for (let xx = off; xx < VW; xx += 8) r(xx, yy, 1, 4, C.mortar);
  }
  for (let i = 0; i < 70; i++) r(Math.floor(rng() * VW), wallTop + Math.floor(rng() * 50), 3, 1, rng() < 0.5 ? C.brickD : C.brickL);
  r(0, wallTop - 2, VW, 2, C.brickD);

  // Portão de garagem meio aberto com luz quente lá dentro (academia)
  const dx = 20;
  const dw = 62;
  r(dx - 2, 58, dw + 4, 42, C.metalD);
  r(dx, 60, dw, 40, C.inside);
  r(dx, 86, dw, 14, C.insideD);
  // silhueta de saco de pancada e banco lá dentro
  r(dx + 14, 74, 1, 6, '#5a2d1a');
  r(dx + 11, 80, 7, 14, '#7a2a24');
  r(dx + 11, 80, 2, 14, '#5c1f1b');
  r(dx + 36, 90, 18, 3, '#4a2a20');
  r(dx + 38, 93, 2, 7, '#4a2a20');
  r(dx + 50, 93, 2, 7, '#4a2a20');
  r(dx + 32, 84, 26, 2, '#8a8d9e'); // barra
  r(dx + 30, 81, 3, 8, '#2a2a36');
  r(dx + 57, 81, 3, 8, '#2a2a36');
  // portão enrolado (metade de cima)
  for (let yy = 60; yy < 76; yy += 2) {
    r(dx, yy, dw, 1, C.metal);
    r(dx, yy + 1, dw, 1, C.metalD);
  }
  r(dx, 76, dw, 2, '#24232f');

  // Janela da casa (direita) com cortina
  r(160, 62, 30, 22, C.metalD);
  r(162, 64, 26, 18, '#3e5d8a');
  r(162, 64, 26, 3, '#7fa6d6');
  r(162, 64, 6, 18, '#a33e52');
  r(182, 64, 6, 18, '#a33e52');
  r(174, 64, 1, 18, C.metalD);
  r(158, 84, 34, 2, C.curb);

  // Cartaz de luta colado no muro
  r(124, 60, 18, 24, '#e8dcc0');
  r(124, 60, 18, 5, '#c8323f');
  r(127, 68, 12, 1, '#2a2233');
  r(127, 71, 9, 1, '#2a2233');
  r(129, 75, 8, 7, '#2a2233');
  r(130, 74, 2, 2, '#2a2233');
  r(134, 74, 2, 2, '#2a2233');

  // Calçada, meio-fio e rua
  r(0, 100, VW, 14, C.walk);
  for (let xx = 0; xx < VW; xx += 16) r(xx, 100, 1, 14, C.walkD);
  r(0, 100, VW, 1, '#4a4963');
  r(0, 114, VW, 2, C.curb);
  r(0, 116, VW, 10, C.road);
  for (let xx = 4; xx < VW; xx += 24) r(xx, 121, 12, 1, '#c9b458');

  // Pneus empilhados e lixeira
  r(92, 94, 14, 3, C.tire);
  r(93, 90, 12, 4, C.tire);
  r(94, 91, 10, 2, '#252433');
  r(92, 97, 14, 3, C.tire);
  r(206, 88, 12, 12, '#2f5a43');
  r(206, 88, 12, 2, '#3f7a5b');
  r(208, 92, 1, 7, '#244634');
  r(212, 92, 1, 7, '#244634');

  // Poste
  r(150, 30, 2, 84, C.metalD);
  r(150, 30, 12, 2, C.metalD);
  r(158, 32, 6, 2, C.lamp);
  return c;
}

/** Rua à noite em frente à academia, com o lutador na calçada. */
export function drawStreet(target: HTMLCanvasElement, f: Fighter | null, pose: Pose, t: number) {
  if (!staticLayer) staticLayer = buildStatic();
  const g = lowCtx();
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, VW, VH);
  g.drawImage(staticLayer, 0, 0);

  // Luz do poste
  g.fillStyle = C.lampGlow;
  g.beginPath();
  g.moveTo(158, 34);
  g.lineTo(164, 34);
  g.lineTo(190, 114);
  g.lineTo(130, 114);
  g.closePath();
  g.fill();

  // Letreiro neon piscando
  const flick = Math.sin(t / 90) > 0.94 || (t % 7000 > 6600 && t % 7000 < 6700);
  const sx = 28;
  const sy = 49;
  if (!flick) {
    g.fillStyle = C.neonGlow;
    g.fillRect(sx - 4, sy - 3, 54, 13);
  }
  g.fillStyle = flick ? '#5a2a3e' : C.neon;
  // "LONA" em blocos de 1px
  const L = [
    '1....111..1...1..11.',
    '1....1.1..11..1.1..1',
    '1....1.1..1.1.1.1111',
    '1....1.1..1..11.1..1',
    '1111.111..1...1.1..1',
  ];
  L.forEach((row, yy) => [...row].forEach((ch, xx) => ch === '1' && g.fillRect(sx + xx * 2 + 4, sy + yy, 2, 1)));
  g.fillStyle = C.teal;
  g.fillRect(sx, sy + 6, 46, 1);

  if (f) drawFighter(g, f, 116, 103, 1, 1, pose, t);

  // Amplia para o canvas da tela (preenche cortando as bordas se precisar)
  const ctx = target.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const scale = Math.max(target.width / VW, target.height / VH);
  const w = VW * scale;
  const h = VH * scale;
  ctx.drawImage(low!, (target.width - w) / 2, target.height - h, w, h);
}

/** Fundo do ringue para a luta. */
let ringLayer: HTMLCanvasElement | null = null;
export function ringBackground(): HTMLCanvasElement {
  if (ringLayer) return ringLayer;
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 75;
  const g = c.getContext('2d')!;
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  };
  const rng = makeRng(3);
  r(0, 0, 160, 75, '#120f22');
  // público na penumbra
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rng() * 160);
    const y = 14 + Math.floor(rng() * 18);
    r(x, y, 3, 4, rng() < 0.5 ? '#1f1a36' : '#28214a');
    r(x + 1, y - 2, 2, 2, rng() < 0.5 ? '#1f1a36' : '#2e2752');
  }
  // holofotes
  for (const lx of [30, 80, 130]) {
    r(lx - 3, 2, 6, 3, '#3a3654');
    r(lx - 2, 5, 4, 1, '#fff2c2');
  }
  // lona e cordas
  r(0, 50, 160, 25, '#2b2442');
  r(10, 52, 140, 8, '#c9c3b0');
  r(10, 52, 140, 1, '#e8e2cf');
  r(10, 59, 140, 1, '#a49e8c');
  r(10, 60, 140, 15, '#3a2d4f');
  for (const yy of [32, 39, 46]) {
    r(8, yy, 144, 1, '#d6455a');
    r(8, yy + 1, 144, 1, '#8f2638');
  }
  r(6, 28, 4, 26, '#cfcfd8');
  r(150, 28, 4, 26, '#cfcfd8');
  r(6, 28, 4, 3, '#d6455a');
  r(150, 28, 4, 3, '#2d6fd6');
  ringLayer = c;
  return c;
}
