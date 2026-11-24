// Lutador desenhado em pixel art por código (arte provisória, original do projeto).
import { ARTS, GEAR_BY_ID, HAIR_COLORS, SKIN_TONES } from '../game/data';
import type { Fighter } from '../game/state';

export type Pose = 'idle' | 'punch' | 'kick' | 'hit' | 'ko' | 'guard' | 'win';

const W = 20;
const H = 34;

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

/**
 * Desenha o lutador com os pés em (x, y). `facing` 1 = olhando para a direita.
 * `px` é o tamanho de cada "pixel" da arte.
 */
export function drawFighter(ctx: CanvasRenderingContext2D, f: Fighter, x: number, y: number, px: number, facing: 1 | -1, pose: Pose, t: number) {
  const skin = SKIN_TONES[f.appearance.skin] ?? SKIN_TONES[0];
  const skinDark = shade(skin, -35);
  const hair = HAIR_COLORS[f.appearance.hairColor] ?? HAIR_COLORS[0];
  const gloves = f.equipped.luvas ? GEAR_BY_ID[f.equipped.luvas].color : '#c0392b';
  const shorts = f.equipped.shorts ? GEAR_BY_ID[f.equipped.shorts].color : ARTS[f.art].color;
  const mouth = f.equipped.protetor ? GEAR_BY_ID[f.equipped.protetor].color : null;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing * px, px);
  ctx.translate(-W / 2, -H);

  if (pose === 'ko') {
    // Caído no chão.
    ctx.translate(W / 2, H);
    ctx.rotate((-Math.PI / 2) * 0.98);
    ctx.translate(-W / 2, -H + 2);
  }

  const bob = pose === 'idle' || pose === 'guard' ? Math.round(Math.sin(t / 180)) : 0;
  const lean = pose === 'punch' ? 2 : pose === 'kick' ? 1 : pose === 'hit' ? -2 : 0;
  const r = (cx: number, cy: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx, cy, w, h);
  };

  // Sombra
  if (pose !== 'ko') {
    ctx.globalAlpha = 0.25;
    r(3, H - 1, 14, 1, '#000');
    ctx.globalAlpha = 1;
  }

  // Pernas
  const legY = 22;
  if (pose === 'kick') {
    r(6, legY, 3, 11, skin);
    r(9 + lean, legY + 1, 10, 3, skin); // perna esticada
    r(18 + lean, legY + 1, 2, 3, skinDark);
    r(5, H - 1, 4, 1, '#222');
  } else {
    r(6, legY, 3, 11, skin);
    r(11, legY, 3, 11, skin);
    r(5, H - 1, 4, 1, '#222');
    r(11, H - 1, 4, 1, '#222');
  }
  // Shorts
  r(5, legY - 1, 10, 6, shorts);
  r(5, legY - 1, 10, 1, shade(shorts, 40));

  const oy = bob;
  const ox = lean;
  // Tronco
  r(5 + ox, 11 + oy, 10, 11, skin);
  r(5 + ox, 11 + oy, 2, 11, skinDark);
  if (f.appearance.tattoo) {
    r(10 + ox, 13 + oy, 3, 1, '#2c3e50');
    r(11 + ox, 14 + oy, 1, 2, '#2c3e50');
  }
  // Cabeça
  r(6 + ox, 2 + oy, 8, 9, skin);
  r(12 + ox, 5 + oy, 1, 1, '#111'); // olho
  r(14 + ox, 6 + oy, 1, 2, skinDark); // nariz
  if (mouth) r(11 + ox, 9 + oy, 3, 1, mouth);
  if (f.appearance.beard) r(8 + ox, 8 + oy, 6, 3, hair);
  switch (f.appearance.hairStyle) {
    case 'curto':
      r(6 + ox, 1 + oy, 8, 3, hair);
      r(6 + ox, 1 + oy, 2, 5, hair);
      break;
    case 'moicano':
      r(8 + ox, -1 + oy, 3, 4, hair);
      break;
    case 'black':
      r(4 + ox, -1 + oy, 11, 5, hair);
      r(4 + ox, -1 + oy, 3, 8, hair);
      break;
    default:
      r(7 + ox, 2 + oy, 6, 1, shade(skin, 20));
  }
  if (pose === 'hit') r(12 + ox, 4 + oy, 2, 2, '#fff');

  // Braços e luvas
  if (pose === 'punch') {
    r(12 + ox, 13 + oy, 8, 3, skin);
    r(19 + ox, 12 + oy, 4, 5, gloves);
    r(7 + ox, 13 + oy, 3, 5, skin);
    r(9 + ox, 10 + oy, 4, 4, gloves);
  } else if (pose === 'win') {
    r(13 + ox, 4 + oy, 3, 8, skin);
    r(13 + ox, 0 + oy, 4, 4, gloves);
    r(3 + ox, 4 + oy, 3, 8, skin);
    r(2 + ox, 0 + oy, 4, 4, gloves);
  } else {
    // guarda
    r(13 + ox, 13 + oy, 3, 5, skin);
    r(14 + ox, 9 + oy, 4, 5, gloves);
    r(7 + ox, 13 + oy, 3, 5, skin);
    r(9 + ox, 10 + oy, 4, 4, gloves);
  }
  ctx.restore();
}

/** Desenha o lutador parado dentro de um canvas (retrato). */
export function portrait(canvas: HTMLCanvasElement, f: Fighter, pose: Pose = 'idle', t = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const px = Math.floor(Math.min(canvas.width / (W + 6), canvas.height / (H + 4)));
  drawFighter(ctx, f, canvas.width / 2, canvas.height - px * 2, px, 1, pose, t);
}
