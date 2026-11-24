// Lutador desenhado em pixel art por código (arte provisória, original do projeto).
// Desenha em 1 pixel real por "pixel da arte" num canvas pequeno, aplica contorno escuro e amplia sem suavizar.
import { ARTS, GEAR_BY_ID, HAIR_COLORS, SKIN_TONES } from '../game/data';
import type { Fighter } from '../game/state';

export type Pose = 'idle' | 'punch' | 'kick' | 'hit' | 'ko' | 'guard' | 'win';

const W = 26;
const H = 40;
const BOX = 48; // canvas auxiliar quadrado (cabe o lutador deitado)
const OUTLINE = [20, 14, 28];

function hexToRgb(hex: string): [number, number, number] {
  if (hex.startsWith('rgb')) {
    const m = hex.match(/\d+/g)!.map(Number);
    return [m[0], m[1], m[2]];
  }
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
export function shade(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}

let scratch: HTMLCanvasElement | null = null;
function scratchCtx(): CanvasRenderingContext2D {
  if (!scratch) {
    scratch = document.createElement('canvas');
    scratch.width = scratch.height = BOX;
  }
  const ctx = scratch.getContext('2d', { willReadFrequently: true })!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, BOX, BOX);
  return ctx;
}

/** Desenha o corpo em escala 1 com os pés em (BOX/2, BOX-4). */
function drawBody(ctx: CanvasRenderingContext2D, f: Fighter, pose: Pose, t: number) {
  const skin = SKIN_TONES[f.appearance.skin] ?? SKIN_TONES[0];
  const skinD = shade(skin, -38);
  const skinL = shade(skin, 22);
  const hair = HAIR_COLORS[f.appearance.hairColor] ?? HAIR_COLORS[0];
  const hairL = shade(hair, 40);
  const gloves = f.equipped.luvas ? GEAR_BY_ID[f.equipped.luvas].color : '#c0392b';
  const glovesD = shade(gloves, -45);
  const glovesL = shade(gloves, 45);
  const shorts = f.equipped.shorts ? GEAR_BY_ID[f.equipped.shorts].color : ARTS[f.art].color;
  const shortsD = shade(shorts, -40);
  const mouth = f.equipped.protetor ? GEAR_BY_ID[f.equipped.protetor].color : null;
  const wrap = '#e9e4da';

  ctx.save();
  ctx.translate(BOX / 2 - W / 2, BOX - 4 - H);
  if (pose === 'ko') {
    ctx.translate(W / 2, H);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-W / 2 - 2, -H + 6);
  }
  const r = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };

  const breathe = pose === 'idle' || pose === 'guard' ? (Math.sin(t / 260) > 0.3 ? 1 : 0) : 0;
  const lean = pose === 'punch' ? 2 : pose === 'kick' ? -1 : pose === 'hit' ? -2 : 0;
  const by = breathe; // corpo sobe/desce
  const bx = lean;

  // ---- Pernas (base em y=H) ----
  const hip = 25;
  const leg = (x: number, kneeOut: number, c: string, cd: string) => {
    r(x, hip + 3, 4, 6, c);
    r(x + kneeOut, hip + 9, 4, 6, c);
    r(x + kneeOut, hip + 9, 1, 6, cd);
    r(x + kneeOut - 1, H - 1, 6, 1, '#2a2233'); // pé / sapatilha
    r(x + kneeOut, H - 2, 4, 1, '#3a3044');
  };
  if (pose === 'kick') {
    leg(7, -1, skinD, shade(skin, -60));
    // perna do chute estendida
    r(12, hip + 3, 6, 4, skin);
    r(17, hip + 2, 8, 4, skin);
    r(17, hip + 5, 8, 1, skinD);
    r(24, hip + 1, 2, 5, skinL);
  } else if (pose === 'win') {
    leg(6, -1, skinD, shade(skin, -60));
    leg(13, 1, skin, skinD);
  } else {
    leg(6, -1, skinD, shade(skin, -60));
    leg(13, 1, skin, skinD);
  }
  // ---- Shorts ----
  r(5, hip - 1, 14, 6, shorts);
  r(5, hip - 1, 14, 1, shade(shorts, 50));
  r(5, hip - 1, 3, 6, shortsD);
  r(11, hip + 2, 2, 3, shortsD); // abertura entre pernas
  r(16, hip, 2, 4, shade(shorts, 30)); // faixa lateral

  // ---- Tronco ----
  const tx = 5 + bx;
  const ty = 12 + by;
  r(tx + 1, ty, 12, 13, skin);
  r(tx, ty + 1, 14, 3, skin); // ombros
  r(tx + 1, ty, 3, 13, skinD); // lado na sombra
  r(tx + 9, ty + 1, 3, 2, skinL); // brilho no peito
  r(tx + 6, ty + 4, 1, 7, skinD); // linha do abdômen
  r(tx + 7, ty + 6, 3, 1, skinD);
  r(tx + 7, ty + 9, 3, 1, skinD);
  if (f.appearance.tattoo) {
    r(tx + 9, ty + 4, 3, 1, '#243447');
    r(tx + 10, ty + 5, 1, 3, '#243447');
    r(tx + 9, ty + 7, 3, 1, '#243447');
  }

  // ---- Cabeça ----
  const hx = 7 + bx + (pose === 'punch' ? 1 : 0);
  const hy = 2 + by;
  r(hx + 4, hy + 9, 4, 2, skinD); // pescoço
  r(hx, hy, 10, 10, skin);
  r(hx, hy, 2, 10, skinD);
  r(hx + 8, hy + 2, 2, 4, skinL);
  r(hx + 10, hy + 4, 1, 3, skin); // nariz
  r(hx + 7, hy + 4, 2, 1, '#1a1420'); // sobrancelha
  r(hx + 8, hy + 5, 1, 1, pose === 'ko' || pose === 'hit' ? '#1a1420' : '#ffffff');
  r(hx + 7, hy + 5, 1, 1, '#1a1420');
  r(hx + 7, hy + 8, 3, 1, mouth ?? shade(skin, -55));
  r(hx + 2, hy + 4, 2, 3, skinD); // orelha
  if (f.appearance.beard) {
    r(hx + 3, hy + 7, 7, 3, hair);
    r(hx + 6, hy + 8, 3, 1, mouth ?? shade(skin, -55));
  }
  switch (f.appearance.hairStyle) {
    case 'curto':
      r(hx, hy - 1, 10, 3, hair);
      r(hx, hy - 1, 3, 6, hair);
      r(hx + 3, hy - 1, 5, 1, hairL);
      break;
    case 'moicano':
      r(hx + 3, hy - 4, 4, 5, hair);
      r(hx + 4, hy - 4, 2, 1, hairL);
      r(hx, hy, 3, 2, shade(skin, -20));
      break;
    case 'black':
      r(hx - 2, hy - 4, 13, 7, hair);
      r(hx - 2, hy - 4, 4, 11, hair);
      r(hx + 2, hy - 4, 6, 1, hairL);
      break;
    default:
      r(hx + 2, hy, 6, 1, skinL);
  }
  if (pose === 'hit') {
    r(hx + 11, hy + 1, 1, 1, '#ffffff');
    r(hx + 12, hy, 1, 1, '#ffe08a');
  }

  // ---- Braços e luvas ----
  const glove = (x: number, y: number) => {
    r(x, y, 5, 5, gloves);
    r(x, y + 4, 5, 1, glovesD);
    r(x + 1, y, 3, 1, glovesL);
    r(x + 4, y + 1, 1, 3, glovesD);
    r(x + 1, y + 5, 3, 2, wrap); // bandagem no punho
  };
  const ax = tx;
  const ay = ty;
  if (pose === 'punch') {
    r(ax + 11, ay + 2, 9, 3, skin);
    r(ax + 11, ay + 4, 9, 1, skinD);
    glove(ax + 19, ay);
    r(ax + 2, ay + 3, 3, 6, skinD);
    glove(ax + 4, ay - 3);
  } else if (pose === 'win') {
    r(ax + 11, ay - 6, 3, 8, skin);
    glove(ax + 10, ay - 11);
    r(ax, ay - 6, 3, 8, skinD);
    glove(ax - 2, ay - 11);
  } else if (pose === 'hit' || pose === 'ko') {
    r(ax + 11, ay + 3, 3, 8, skin);
    glove(ax + 11, ay + 10);
    r(ax, ay + 3, 3, 8, skinD);
    glove(ax - 1, ay + 10);
  } else {
    // guarda alta
    r(ax + 11, ay + 3, 3, 6, skin);
    r(ax + 12, ay + 3, 2, 6, skinL);
    glove(ax + 12, ay - 3 + (breathe ? 0 : 1));
    r(ax + 2, ay + 3, 3, 6, skinD);
    glove(ax + 6, ay - 1 + (breathe ? 1 : 0));
  }
  ctx.restore();
}

/** Aplica contorno de 1 pixel em volta do desenho. */
function outline(ctx: CanvasRenderingContext2D) {
  const img = ctx.getImageData(0, 0, BOX, BOX);
  const d = img.data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < BOX && y < BOX && d[(y * BOX + x) * 4 + 3] > 0;
  const marks: number[] = [];
  for (let y = 0; y < BOX; y++)
    for (let x = 0; x < BOX; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) marks.push((y * BOX + x) * 4);
    }
  for (const i of marks) {
    d[i] = OUTLINE[0];
    d[i + 1] = OUTLINE[1];
    d[i + 2] = OUTLINE[2];
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Desenha o lutador com os pés em (x, y). `facing` 1 = olhando para a direita.
 * `px` é o tamanho de cada pixel da arte na tela.
 */
export function drawFighter(ctx: CanvasRenderingContext2D, f: Fighter, x: number, y: number, px: number, facing: 1 | -1, pose: Pose, t: number) {
  const s = scratchCtx();
  drawBody(s, f, pose, t);
  outline(s);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // sombra no chão
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y, (pose === 'ko' ? 20 : 11) * px, 2.2 * px, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);
  ctx.drawImage(scratch!, Math.round((-BOX / 2) * px), Math.round((-BOX + 4) * px), BOX * px, BOX * px);
  ctx.restore();
}

/** Desenha o lutador dentro de um canvas (retrato). */
export function portrait(canvas: HTMLCanvasElement, f: Fighter, pose: Pose = 'idle', t = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const px = Math.max(1, Math.floor(Math.min(canvas.width / (BOX - 8), canvas.height / (BOX - 2))));
  drawFighter(ctx, f, canvas.width / 2, canvas.height - px * 3, px, 1, pose, t);
}

/** Retrato do busto (cabeça e ombros) para avatares pequenos. */
export function avatar(canvas: HTMLCanvasElement, f: Fighter) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const px = Math.max(1, Math.floor(canvas.width / 20));
  drawFighter(ctx, f, canvas.width / 2 - px, canvas.height + 22 * px, px, 1, 'idle', 0);
}
