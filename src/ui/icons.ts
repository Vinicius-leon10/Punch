// Ícones em pixel art (8x8 ou 10x10) gerados como SVG. Cada letra é uma cor da paleta do ícone.
import { hasImg, img } from './art';

type Icon = { rows: string[]; pal: Record<string, string> };

const ICONS: Record<string, Icon> = {
  coin: {
    rows: ['..aaaa..', '.abbbba.', 'abbccbba', 'abcbbcba', 'abcbbcba', 'abbccbba', '.abbbba.', '..aaaa..'],
    pal: { a: '#8a5a12', b: '#f2c230', c: '#fff1a8' },
  },
  gold: {
    rows: ['.aaaaaa.', 'abbcbbba', 'bbcbbbbb', '.bbbbbb.', '..bbbb..', '...bb...', '........', '........'],
    pal: { a: '#9be7ff', b: '#3fb6e8', c: '#ffffff' },
  },
  energy: {
    rows: ['....aa..', '...aa...', '..aa....', '.aaaaa..', '...aa...', '..aa....', '.aa.....', 'a.......'],
    pal: { a: '#ffd23f' },
  },
  food: {
    rows: ['.....aa.', '....abba', '...abbba', '..abbbba', '.acbbba.', 'acc.aa..', 'cc......', 'c.......'],
    pal: { a: '#8a3d12', b: '#d9772b', c: '#f4ead2' },
  },
  train: {
    rows: ['........', 'aa....aa', 'aa....aa', 'aabbbbaa', 'aabbbbaa', 'aa....aa', 'aa....aa', '........'],
    pal: { a: '#e9e4f5', b: '#9a96b8' },
  },
  fight: {
    rows: ['.aaaaa..', 'abbbbba.', 'abcbbbba', 'abbbbbba', 'abbbbbba', '.abbbba.', '..dddd..', '..dddd..'],
    pal: { a: '#5c1218', b: '#e23b4a', c: '#ff9aa4', d: '#f4ead2' },
  },
  master: {
    rows: ['........', 'aaaaaaaa', 'abbbbbba', 'aaaaaaaa', '...aa...', '..a..a..', '.a....a.', '........'],
    pal: { a: '#f4ead2', b: '#e23b4a' },
  },
  fighter: {
    rows: ['..aaa...', '..aaa...', '...a....', '.bbbbb..', 'b.bbb.b.', '..bbb...', '..b.b...', '.bb.bb..'],
    pal: { a: '#f0c9a0', b: '#7ad6e8' },
  },
  home: {
    rows: ['...aa...', '..aaaa..', '.aaaaaa.', 'aaaaaaaa', '.bbbbbb.', '.bcbbdb.', '.bcbbbb.', '.bcbbbb.'],
    pal: { a: '#e2504f', b: '#d9c6a3', c: '#5b3a22', d: '#7fc6ff' },
  },
  shop: {
    rows: ['..aaaa..', '.a....a.', '.a....a.', 'bbbbbbbb', 'bccccccb', 'bccddccb', 'bccccccb', 'bbbbbbbb'],
    pal: { a: '#e9e4f5', b: '#a3562b', c: '#e08a3c', d: '#ffd23f' },
  },
  missions: {
    rows: ['.aaaaaa.', 'abbbbbba', 'ab....ba', 'ab.c..ba', 'abcc..ba', 'ab.cc.ba', 'ab..c.ba', '.aaaaaa.'],
    pal: { a: '#8a6a3d', b: '#f4ead2', c: '#2fa860' },
  },
  vip: {
    rows: ['........', 'a..a..a.', 'aa.a.aa.', 'aaaaaaa.', 'abaaaba.', 'aaaaaaa.', 'cccccccc', '........'],
    pal: { a: '#ffd23f', b: '#e23b4a', c: '#a87b12' },
  },
  sleep: {
    rows: ['....aaaa', '......a.', '.....a..', '....aaaa', 'bbb.....', '..b.....', '.b......', 'bbb.....'],
    pal: { a: '#c9c6ff', b: '#8f8cc8' },
  },
  work: {
    rows: ['........', '..aaaa..', '..a..a..', 'bbbbbbbb', 'bccccccb', 'bbbddbbb', 'bccccccb', 'bbbbbbbb'],
    pal: { a: '#5b3a22', b: '#8a5a32', c: '#b87b45', d: '#ffd23f' },
  },
  back: {
    rows: ['...a....', '..aa....', '.aaaaaaa', 'aaaaaaaa', '.aaaaaaa', '..aa....', '...a....', '........'],
    pal: { a: '#ffffff' },
  },
};

/** Ícones que usam a arte do projeto em vez do desenho em pixels. */
const ART_ICONS: Record<string, string> = {
  coin: 'moedas',
  gold: 'diamante',
  vip: 'icone_vip',
  missions: 'icone_missoes',
  energy: 'icone_energia',
  home: 'icone_casa',
  train: 'icone_treinar',
  fight: 'icone_arena',
  master: 'icone_mestres',
  fighter: 'icone_lutador',
  work: 'icone_trabalho',
  shop: 'icone_loja',
};

export function ic(name: string, size = 16): string {
  if (ART_ICONS[name] && hasImg(ART_ICONS[name])) return img(ART_ICONS[name], 'ic').replace('<img ', `<img width="${size}" height="${size}" `);
  const icon = ICONS[name];
  if (!icon) return '';
  const h = icon.rows.length;
  const w = icon.rows[0].length;
  let rects = '';
  icon.rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const c = icon.pal[ch];
      if (c) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;
    }),
  );
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}
