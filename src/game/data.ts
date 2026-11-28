// Dados de design do jogo. Todo balanceamento fica aqui para ser fácil de ajustar.

export type AttrKey = 'forca' | 'agilidade' | 'resistencia' | 'tecnica' | 'cardio';
export const ATTRS: AttrKey[] = ['forca', 'agilidade', 'resistencia', 'tecnica', 'cardio'];
export const ATTR_LABEL: Record<AttrKey, string> = {
  forca: 'Força',
  agilidade: 'Agilidade',
  resistencia: 'Resistência',
  tecnica: 'Técnica',
  cardio: 'Cardio',
};
export type Attrs = Record<AttrKey, number>;

export type ArtId = 'boxe' | 'muaythai' | 'jiujitsu' | 'capoeira';

export interface Art {
  id: ArtId;
  name: string;
  master: string;
  description: string;
  /** Atributos iniciais extras de quem escolhe esta arte como principal. */
  startBonus: Partial<Attrs>;
  color: string;
}

export const ARTS: Record<ArtId, Art> = {
  boxe: {
    id: 'boxe',
    name: 'Boxe',
    master: 'Mestre Tião "Mão de Pedra"',
    description: 'Socos rápidos, esquivas e contra-ataques. Puxa por Agilidade e Técnica.',
    startBonus: { agilidade: 3, tecnica: 2 },
    color: '#d94a3d',
  },
  muaythai: {
    id: 'muaythai',
    name: 'Muay Thai',
    master: 'Kru Somchai',
    description: 'Chutes, joelhadas e cotoveladas devastadoras. Puxa por Força e Resistência.',
    startBonus: { forca: 3, resistencia: 2 },
    color: '#e0a020',
  },
  jiujitsu: {
    id: 'jiujitsu',
    name: 'Jiu-jitsu',
    master: 'Mestre Carla "Polvo"',
    description: 'Quedas, controle e finalizações. Puxa por Técnica e Cardio.',
    startBonus: { tecnica: 3, cardio: 2 },
    color: '#3d7bd9',
  },
  capoeira: {
    id: 'capoeira',
    name: 'Capoeira',
    master: 'Mestre Bimbinha',
    description: 'Ginga, golpes acrobáticos e rasteiras. Puxa por Agilidade e Cardio.',
    startBonus: { agilidade: 3, cardio: 2 },
    color: '#3dab5a',
  },
};
export const ART_IDS = Object.keys(ARTS) as ArtId[];

export type TechKind = 'ataque' | 'defesa' | 'preparo' | 'passiva';

export interface Technique {
  id: string;
  name: string;
  art: ArtId;
  kind: TechKind;
  minLevel: number;
  /** Preço com o mestre para quem é da arte. Fora da arte custa 50% a mais. 0 = inicial grátis. */
  price: number;
  description: string;
  // ataque
  power?: number;
  stamina?: number;
  cooldown?: number;
  /** Atordoa: o oponente perde a próxima ação. */
  stun?: boolean;
  // defesa (reativa): chance de ativar e quanto do dano é reduzido (1 = anula)
  chance?: number;
  reduce?: number;
  // preparo: os próximos N ataques causam +bonus de dano
  buffHits?: number;
  buffPower?: number;
  // passiva
  hpPct?: number;
  dodge?: number;
  crit?: number;
  staPct?: number;
}

const T = (t: Technique) => t;

export const TECHNIQUES: Technique[] = [
  // ---------- Boxe ----------
  T({ id: 'jab', name: 'Jab', art: 'boxe', kind: 'ataque', minLevel: 1, price: 0, power: 8, stamina: 4, cooldown: 0, description: 'Soco rápido e barato.' }),
  T({ id: 'direto', name: 'Direto', art: 'boxe', kind: 'ataque', minLevel: 1, price: 0, power: 13, stamina: 8, cooldown: 1, description: 'Soco reto com o peso do corpo.' }),
  T({ id: 'esquiva', name: 'Esquiva Lateral', art: 'boxe', kind: 'defesa', minLevel: 1, price: 0, chance: 0.4, reduce: 1, cooldown: 2, description: '40% de chance de escapar totalmente de um golpe.' }),
  T({ id: 'gancho', name: 'Gancho', art: 'boxe', kind: 'ataque', minLevel: 3, price: 120, power: 14, stamina: 12, cooldown: 2, description: 'Soco curvo na linha da cintura.' }),
  T({ id: 'guarda', name: 'Guarda Alta', art: 'boxe', kind: 'defesa', minLevel: 5, price: 200, chance: 0.5, reduce: 0.5, cooldown: 1, description: '50% de chance de reduzir o dano pela metade.' }),
  T({ id: 'cruzado', name: 'Cruzado de Direita', art: 'boxe', kind: 'ataque', minLevel: 8, price: 300, power: 19, stamina: 14, cooldown: 3, description: 'Golpe de nocaute por cima da guarda.' }),
  T({ id: 'footwork', name: 'Jogo de Pernas', art: 'boxe', kind: 'passiva', minLevel: 12, price: 500, dodge: 0.05, description: '+5% de esquiva permanente.' }),
  T({ id: 'uppercut', name: 'Uppercut', art: 'boxe', kind: 'ataque', minLevel: 15, price: 700, power: 22, stamina: 18, cooldown: 3, description: 'Soco de baixo para cima no queixo.' }),

  // ---------- Muay Thai ----------
  T({ id: 'chutebaixo', name: 'Chute Baixo', art: 'muaythai', kind: 'ataque', minLevel: 1, price: 0, power: 8, stamina: 6, cooldown: 0, description: 'Chute na coxa que desgasta.' }),
  T({ id: 'joelhada', name: 'Joelhada', art: 'muaythai', kind: 'ataque', minLevel: 1, price: 0, power: 14, stamina: 10, cooldown: 1, description: 'Joelho no corpo na curta distância.' }),
  T({ id: 'bloqueiocanela', name: 'Bloqueio de Canela', art: 'muaythai', kind: 'defesa', minLevel: 1, price: 0, chance: 0.45, reduce: 0.6, cooldown: 1, description: '45% de chance de reduzir 60% do dano.' }),
  T({ id: 'clinch', name: 'Clinch', art: 'muaythai', kind: 'preparo', minLevel: 4, price: 150, stamina: 8, cooldown: 4, buffHits: 2, buffPower: 0.6, description: 'Agarra a nuca: próximos 2 ataques +60% de dano.' }),
  T({ id: 'cotovelada', name: 'Cotovelada', art: 'muaythai', kind: 'ataque', minLevel: 6, price: 250, power: 19, stamina: 13, cooldown: 2, description: 'Corta o supercílio.' }),
  T({ id: 'corpofechado', name: 'Corpo Fechado', art: 'muaythai', kind: 'passiva', minLevel: 10, price: 450, hpPct: 0.1, description: '+10% de vida máxima.' }),
  T({ id: 'chutealto', name: 'Chute Alto', art: 'muaythai', kind: 'ataque', minLevel: 12, price: 600, power: 25, stamina: 18, cooldown: 3, description: 'Chute na cabeça. Arriscado e devastador.' }),

  // ---------- Jiu-jitsu ----------
  T({ id: 'queda', name: 'Queda', art: 'jiujitsu', kind: 'preparo', minLevel: 1, price: 0, stamina: 8, cooldown: 3, buffHits: 3, buffPower: 0.5, description: 'Leva ao chão: próximos 3 ataques +50% de dano.' }),
  T({ id: 'socosmontada', name: 'Socos na Montada', art: 'jiujitsu', kind: 'ataque', minLevel: 1, price: 0, power: 12, stamina: 7, cooldown: 0, description: 'Ground and pound por cima.' }),
  T({ id: 'raspagem', name: 'Raspagem', art: 'jiujitsu', kind: 'defesa', minLevel: 1, price: 0, chance: 0.4, reduce: 0.7, cooldown: 2, description: '40% de chance de reduzir 70% do dano.' }),
  T({ id: 'chavebraco', name: 'Chave de Braço', art: 'jiujitsu', kind: 'ataque', minLevel: 6, price: 250, power: 18, stamina: 16, cooldown: 3, description: 'Hiperextensão do cotovelo.' }),
  T({ id: 'guardafechada', name: 'Guarda Fechada', art: 'jiujitsu', kind: 'defesa', minLevel: 8, price: 350, chance: 0.5, reduce: 0.5, cooldown: 1, description: '50% de chance de reduzir o dano pela metade.' }),
  T({ id: 'foletatame', name: 'Fôlego de Tatame', art: 'jiujitsu', kind: 'passiva', minLevel: 10, price: 400, staPct: 0.2, description: '+20% de fôlego máximo.' }),
  T({ id: 'mataleao', name: 'Mata-leão', art: 'jiujitsu', kind: 'ataque', minLevel: 14, price: 700, power: 23, stamina: 22, cooldown: 4, description: 'Estrangulamento pelas costas.' }),

  // ---------- Capoeira ----------
  T({ id: 'meialua', name: 'Meia-lua de Frente', art: 'capoeira', kind: 'ataque', minLevel: 1, price: 0, power: 10, stamina: 6, cooldown: 0, description: 'Chute circular de frente.' }),
  T({ id: 'armada', name: 'Armada', art: 'capoeira', kind: 'ataque', minLevel: 1, price: 0, power: 14, stamina: 12, cooldown: 2, description: 'Chute giratório de costas.' }),
  T({ id: 'ginga', name: 'Ginga', art: 'capoeira', kind: 'defesa', minLevel: 1, price: 0, chance: 0.3, reduce: 1, cooldown: 3, description: '30% de chance de escapar totalmente de um golpe.' }),
  T({ id: 'rasteira', name: 'Rasteira', art: 'capoeira', kind: 'ataque', minLevel: 4, price: 180, power: 10, stamina: 8, cooldown: 3, stun: true, description: 'Derruba: o oponente perde a próxima ação.' }),
  T({ id: 'martelo', name: 'Martelo', art: 'capoeira', kind: 'ataque', minLevel: 7, price: 280, power: 18, stamina: 14, cooldown: 2, description: 'Chute lateral na altura da cabeça.' }),
  T({ id: 'au', name: 'Aú', art: 'capoeira', kind: 'passiva', minLevel: 9, price: 400, dodge: 0.07, description: '+7% de esquiva permanente.' }),
  T({ id: 'parafuso', name: 'Parafuso', art: 'capoeira', kind: 'ataque', minLevel: 14, price: 750, power: 24, stamina: 20, cooldown: 3, description: 'Chute giratório no ar.' }),
];

export const TECH_BY_ID: Record<string, Technique> = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t]));

/** Fator de preço para aprender técnica de outra arte. */
export const OFF_ART_PRICE = 1.5;
/** Bônus de dano das técnicas da arte principal. */
export const MAIN_ART_POWER = 1.2;
/** Bônus extra (dano e vida) para quem monta o deck só com a arte principal. */
export const SPECIALIST_BONUS = 0.1;

/** Espaços de deck por nível mínimo. */
export const DECK_SLOTS: [number, number][] = [
  [1, 3],
  [3, 4],
  [8, 5],
  [15, 6],
  [25, 7],
  [40, 8],
];

export interface Gym {
  id: string;
  name: string;
  minLevel: number;
  /** Custo em moedas por 7 dias reais. 0 = grátis. */
  weeklyFee: number;
  mult: number;
  description: string;
}

export const GYMS: Gym[] = [
  { id: 'bairro', name: 'Academia do Bairro', minLevel: 1, weeklyFee: 0, mult: 1, description: 'Aparelhos velhos, mas de graça.' },
  { id: 'ct', name: 'CT Profissional', minLevel: 8, weeklyFee: 200, mult: 1.4, description: 'Treino 40% mais eficiente.' },
  { id: 'elite', name: 'Centro de Elite', minLevel: 20, weeklyFee: 600, mult: 1.9, description: 'Onde treinam os campeões. Treino 90% mais eficiente.' },
];

export interface Station {
  id: string;
  name: string;
  attr: AttrKey;
}

export const STATIONS: Station[] = [
  { id: 'saco', name: 'Saco de Pancada', attr: 'forca' },
  { id: 'corda', name: 'Pular Corda', attr: 'agilidade' },
  { id: 'abdominal', name: 'Abdominal com Medicine Ball', attr: 'resistencia' },
  { id: 'sparring', name: 'Sparring', attr: 'tecnica' },
  { id: 'esteira', name: 'Esteira', attr: 'cardio' },
];

export interface Food {
  id: string;
  name: string;
  price: number;
  satiety: number;
  energy?: number;
}

export const FOODS: Food[] = [
  { id: 'paoovo', name: 'Pão com Ovo', price: 10, satiety: 20 },
  { id: 'marmita', name: 'Marmita', price: 25, satiety: 45 },
  { id: 'acai', name: 'Açaí', price: 40, satiety: 30, energy: 10 },
  { id: 'frango', name: 'Frango com Batata-doce', price: 60, satiety: 65 },
];

/**
 * Bicos: trocam energia por moedas, sem XP. Renda garantida para quem perde muito,
 * mas sempre rende menos moedas por energia do que a média das lutas (ver tests/).
 * Pagamento = energia × (rate + nível × BALANCE.jobPayPerLevel).
 */
export interface Job {
  id: string;
  name: string;
  minLevel: number;
  energy: number;
  satiety: number;
  rate: number;
  description: string;
}

export const JOBS: Job[] = [
  { id: 'lanchonete', name: 'Balcão da Lanchonete', minLevel: 1, energy: 10, satiety: 4, rate: 0.6, description: 'Servir pastel e caldo de cana no fim da tarde.' },
  { id: 'entregas', name: 'Entregas de Bicicleta', minLevel: 6, energy: 20, satiety: 10, rate: 0.7, description: 'Rodar o bairro entregando marmitas.' },
  { id: 'seguranca', name: 'Segurança de Show', minLevel: 15, energy: 30, satiety: 12, rate: 0.8, description: 'Cuidar da porta nos shows de sábado.' },
];

export type Slot = 'luvas' | 'shorts' | 'protetor';
export const SLOT_LABEL: Record<Slot, string> = { luvas: 'Luvas', shorts: 'Shorts', protetor: 'Protetor bucal' };
export type Rarity = 'comum' | 'raro' | 'epico' | 'lendario';
export const RARITY_LABEL: Record<Rarity, string> = { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' };

export interface Gear {
  id: string;
  name: string;
  slot: Slot;
  rarity: Rarity;
  minLevel: number;
  price: number;
  currency: 'moedas' | 'ouro';
  bonus: Partial<Attrs>;
  color: string;
}

export const GEAR: Gear[] = [
  { id: 'luva1', name: 'Luva de Treino', slot: 'luvas', rarity: 'comum', minLevel: 1, price: 80, currency: 'moedas', bonus: { forca: 2 }, color: '#b03a2e' },
  { id: 'luva2', name: 'Luva de Couro', slot: 'luvas', rarity: 'raro', minLevel: 5, price: 300, currency: 'moedas', bonus: { forca: 5, tecnica: 1 }, color: '#2e4fb0' },
  { id: 'luva3', name: 'Luva Profissional', slot: 'luvas', rarity: 'epico', minLevel: 12, price: 900, currency: 'moedas', bonus: { forca: 9, tecnica: 3 }, color: '#7a2eb0' },
  { id: 'luva4', name: 'Martelo de Ouro', slot: 'luvas', rarity: 'lendario', minLevel: 20, price: 60, currency: 'ouro', bonus: { forca: 14, tecnica: 5 }, color: '#e8b923' },
  { id: 'short1', name: 'Short de Tactel', slot: 'shorts', rarity: 'comum', minLevel: 1, price: 60, currency: 'moedas', bonus: { agilidade: 2 }, color: '#3a3a3a' },
  { id: 'short2', name: 'Short de Luta', slot: 'shorts', rarity: 'raro', minLevel: 5, price: 250, currency: 'moedas', bonus: { agilidade: 4, cardio: 2 }, color: '#1f6fbf' },
  { id: 'short3', name: 'Short Profissional', slot: 'shorts', rarity: 'epico', minLevel: 12, price: 800, currency: 'moedas', bonus: { agilidade: 7, cardio: 4 }, color: '#8e2fbf' },
  { id: 'short4', name: 'Relâmpago', slot: 'shorts', rarity: 'lendario', minLevel: 20, price: 55, currency: 'ouro', bonus: { agilidade: 11, cardio: 6 }, color: '#f2d21b' },
  { id: 'prot1', name: 'Protetor Simples', slot: 'protetor', rarity: 'comum', minLevel: 1, price: 50, currency: 'moedas', bonus: { resistencia: 2 }, color: '#ffffff' },
  { id: 'prot2', name: 'Protetor Moldado', slot: 'protetor', rarity: 'raro', minLevel: 6, price: 280, currency: 'moedas', bonus: { resistencia: 5 }, color: '#3daee9' },
  { id: 'prot3', name: 'Protetor Profissional', slot: 'protetor', rarity: 'epico', minLevel: 12, price: 750, currency: 'moedas', bonus: { resistencia: 8, cardio: 2 }, color: '#9b59b6' },
  { id: 'prot4', name: 'Muralha', slot: 'protetor', rarity: 'lendario', minLevel: 20, price: 50, currency: 'ouro', bonus: { resistencia: 13 }, color: '#f1c40f' },
];
export const GEAR_BY_ID: Record<string, Gear> = Object.fromEntries(GEAR.map((g) => [g.id, g]));
/** Teto do bônus somado dos equipamentos por atributo: quem treina bem ainda vence quem só comprou. */
export const GEAR_BONUS_CAP = 15;

export const BALANCE = {
  maxLevel: 50,
  maxEnergy: 100,
  vipMaxEnergy: 150,
  /** Minutos reais para recuperar 1 de energia. */
  energyRegenMin: 3,
  vipEnergyRegenMin: 2,
  maxSatiety: 100,
  trainEnergy: 10,
  trainSatiety: 8,
  /** XP de personagem por treino = trainXp + nível * trainXpPerLevel. */
  trainXp: 10,
  trainXpPerLevel: 1.5,
  fightEnergy: 20,
  fightSatiety: 12,
  hungryThreshold: 20,
  sleepEnergy: 50,
  sleepCooldownH: 6,
  vipBonus: 0.2,
  startMoney: 150,
  startGold: 20,
  startAttr: 5,
  levelRange: 2,
  wheyPrice: 150,
  wheyCharges: 5,
  wheyBonus: 0.5,
  energyDrinkGold: 5,
  energyDrinkAmount: 40,
  vipGoldPrice: 100,
  vipDays: 30,
  /** Quanto cada nível soma ao pagamento por ponto de energia dos bicos. */
  jobPayPerLevel: 0.06,
};

export interface Division {
  name: string;
  min: number;
  color: string;
}
export const DIVISIONS: Division[] = [
  { name: 'Bronze', min: 0, color: '#c07a3e' },
  { name: 'Prata', min: 300, color: '#b8c4cc' },
  { name: 'Ouro', min: 700, color: '#e8b923' },
  { name: 'Diamante', min: 1200, color: '#5fd3f3' },
  { name: 'Campeão', min: 2000, color: '#ff5470' },
];

export interface MissionDef {
  id: string;
  label: string;
  goal: number;
  reward: number;
}
export const MISSIONS: MissionDef[] = [
  { id: 'treinar', label: 'Treine 3 vezes', goal: 3, reward: 50 },
  { id: 'vencer', label: 'Vença 2 lutas', goal: 2, reward: 80 },
  { id: 'comer', label: 'Faça 2 refeições', goal: 2, reward: 30 },
];

export const SKIN_TONES = ['#f3d2b3', '#e0ac7e', '#c68642', '#8d5524', '#5a3519'];
export const HAIR_COLORS = ['#1b1b1b', '#5a3a1a', '#b8860b', '#a52a2a', '#d9d9d9'];
export const HAIR_STYLES = ['careca', 'curto', 'moicano', 'black'] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];
