// Arte do projeto (pasta art/), reduzida para o jogo em src/assets/img/.
// O vite troca cada arquivo por uma URL com hash no build.

const files = import.meta.glob<string>('../assets/img/*.{png,jpg}', { eager: true, import: 'default' });
const URLS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.(png|jpg)$/, ''), url]),
);

/** URL de uma imagem da pasta (para fundos em CSS). */
export const imgUrl = (name: string): string => URLS[name] ?? '';

/** Tag <img> para uma imagem da pasta src/assets/img (nome sem extensão). Vazio se a imagem não existir. */
export function img(name: string | undefined, cls = '', alt = ''): string {
  const src = name ? URLS[name] : undefined;
  if (!src) return '';
  return `<img class="gfx ${cls}" src="${src}" alt="${alt}" ${alt ? '' : 'aria-hidden="true"'} decoding="async">`;
}

export const hasImg = (name: string) => name in URLS;

export const GEAR_IMG: Record<string, string> = {
  luva1: 'luva_comum',
  luva2: 'luva_rara',
  luva3: 'luva_epica',
  luva4: 'luva_lendaria',
  short1: 'short_comum',
  short2: 'short_raro',
  short3: 'short_epico',
  short4: 'short_lendario',
  prot1: 'protetor_comum',
  prot2: 'protetor_raro',
  prot3: 'protetor_epico',
  prot4: 'protetor_lendario',
};

export const FOOD_IMG: Record<string, string> = { paoovo: 'pao_ovo', marmita: 'marmita', acai: 'acai', frango: 'frango' };

export const STATION_IMG: Record<string, string> = {
  saco: 'treino_saco',
  corda: 'treino_corda',
  abdominal: 'treino_abdominal',
  sparring: 'treino_manopla',
  esteira: 'treino_esteira',
};

export const MASTER_IMG: Record<string, string> = {
  boxe: 'retrato_tiao',
  muaythai: 'retrato_somchai',
  jiujitsu: 'retrato_carla',
  capoeira: 'retrato_bimbinha',
};

export const JOB_IMG: Record<string, string> = { lanchonete: 'trabalho_lanchonete', entregas: 'trabalho_entregas', seguranca: 'trabalho_seguranca' };

// ---------- Poses do personagem (art/: lutador e lutadora) ----------
export type Body = 'm' | 'f';
export type PoseKey =
  | 'menu' | 'pers' | 'perfil' | 'vs' | 'guarda' | 'soco' | 'golpe' | 'chute' | 'defesa' | 'nocaute'
  | 'vitoria' | 'derrota' | 'nivel' | 'energia' | 'fome' | 'joinha' | 'loja' | 'mestres'
  | 'dormindo' | 'comendo' | 'descansando';

export const bodyOf = (f: { appearance: { body?: Body } }): Body => f.appearance.body ?? 'm';

/** Nome da imagem da pose; usa a do lutador se a da lutadora ainda não existir. */
export function poseName(body: Body, key: string): string {
  const own = `p_${body}_${key}`;
  return own in URLS ? own : `p_m_${key}`;
}

export function poseImg(body: Body, key: PoseKey, cls = '', alt = ''): string {
  return img(poseName(body, key), cls, alt);
}

/** Aparelho de treino: lutador usa as imagens do Lote 3, lutadora as do Lote 9. */
export const stationImg = (body: Body, stationId: string): string =>
  body === 'f' ? `p_f_${STATION_IMG[stationId]}` : STATION_IMG[stationId];

export const jobImg = (body: Body, jobId: string): string => (body === 'f' ? `p_f_${JOB_IMG[jobId]}` : JOB_IMG[jobId]);

/** Short e luva vestidos (Lote 1). Só existe para o lutador por enquanto. */
const WEAR_IMG: Record<string, string> = {
  short1: 'short_cinza',
  short2: 'short_azul',
  short3: 'short_roxo',
  short4: 'short_raio',
  luva1: 'luva_vermelha',
  luva2: 'luva_azul',
  luva3: 'luva_roxa',
  luva4: 'luva_ouro',
};
/** Pose de personalização com o equipamento: mostra a luva se tiver, senão o short. */
export function wearName(body: Body, equipped: { luvas?: string; shorts?: string }): string {
  for (const id of [equipped.luvas, equipped.shorts]) {
    const n = id && WEAR_IMG[id] ? `p_${body}_${WEAR_IMG[id]}` : '';
    if (n && n in URLS) return n;
  }
  return poseName(body, 'pers');
}

// ---------- Imagens para o canvas da luta ----------
const cache = new Map<string, HTMLImageElement>();
export function getImage(name: string): HTMLImageElement | null {
  const src = URLS[name];
  if (!src) return null;
  let im = cache.get(name);
  if (!im) {
    im = new Image();
    im.src = src;
    cache.set(name, im);
  }
  return im;
}
