// Arte do projeto (pasta art/), reduzida para o jogo em src/assets/img/.
// O vite troca cada arquivo por uma URL com hash no build.

const files = import.meta.glob<string>('../assets/img/*.png', { eager: true, import: 'default' });
const URLS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.png', ''), url]),
);

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

export const JOB_IMG: Record<string, string> = { lanchonete: 'lanchonete' };
