import * as A from '../game/actions';
import {
  ARTS,
  ART_IDS,
  ATTRS,
  ATTR_LABEL,
  BALANCE,
  DIVISIONS,
  FOODS,
  GEAR,
  GEAR_BY_ID,
  GYMS,
  JOBS,
  HAIR_COLORS,
  HAIR_STYLES,
  MISSIONS,
  SEASON_KEEP,
  RARITY_LABEL,
  SKIN_TONES,
  SLOT_LABEL,
  STATIONS,
  TECHNIQUES,
  TECH_BY_ID,
  type ArtId,
  type Slot,
  type Technique,
} from '../game/data';
import { combatStats } from '../game/fight';
import {
  createPlayer,
  deckSlots,
  division,
  effectiveAttrs,
  gearBonus,
  isVip,
  maxEnergy,
  seasonEndsAt,
  xpToNext,
  type Fighter,
  type NewCharacter,
  type Player,
} from '../game/state';
import { playFight } from './fightView';
import { ic } from './icons';
import { drawStreet } from './scene';
import { avatar, portrait } from './sprite';
import { esc, fmtDuration, pct } from './util';

const SAVE_KEY = 'lona.save.v1';
const CLOCK_KEY = 'lona.clock.v1';

type Tab = 'casa' | 'academia' | 'mestres' | 'lutador' | 'trabalho' | 'loja' | 'lutar' | 'missoes' | 'vip';
const MENU: Record<Tab, { label: string; icon: string; hint: string }> = {
  academia: { label: 'Treinar', icon: 'train', hint: 'Suba seus atributos' },
  mestres: { label: 'Mestres', icon: 'master', hint: 'Aprenda técnicas' },
  lutador: { label: 'Lutador', icon: 'fighter', hint: 'Deck e equipamento' },
  trabalho: { label: 'Trabalho', icon: 'work', hint: 'Bicos por moedas' },
  casa: { label: 'Casa', icon: 'home', hint: 'Comer e dormir' },
  loja: { label: 'Loja', icon: 'shop', hint: 'Luvas, shorts, protetor' },
  missoes: { label: 'Missões', icon: 'missions', hint: 'Recompensas do dia' },
  vip: { label: 'VIP', icon: 'vip', hint: 'Mais energia e bônus' },
  lutar: { label: 'Lutar', icon: 'fight', hint: 'Ranking PvP' },
};
const PANEL_TITLE: Record<Tab, string> = {
  academia: 'Academia',
  mestres: 'Mestres',
  lutador: 'Seu lutador',
  trabalho: 'Trabalho',
  casa: 'Casa',
  loja: 'Loja',
  missoes: 'Missões diárias',
  vip: 'VIP e ouro',
  lutar: 'Arena PvP',
};

function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* armazenamento indisponível: o jogo segue só na memória */
  }
}

export function startApp(root: HTMLElement) {
  let clockOffset = Number(readStore(CLOCK_KEY) ?? 0) || 0;
  const now = () => Date.now() + clockOffset;

  let player: Player | null = null;
  try {
    const raw = readStore(SAVE_KEY);
    if (raw) player = JSON.parse(raw) as Player;
  } catch {
    player = null;
  }

  let tab: Tab | null = null;
  let stageRaf = 0;
  let toast: { msg: string; ok: boolean; at: number } | null = null;
  let opponents: Fighter[] = [];
  let opponentsKey = '';
  let confirmReset = false;
  const draft: NewCharacter = {
    name: '',
    nickname: '',
    art: 'boxe',
    appearance: { skin: 1, hairStyle: 'curto', hairColor: 0, beard: false, tattoo: false },
  };
  const fightHost = document.createElement('div');
  document.body.appendChild(fightHost);

  const save = () => player && writeStore(SAVE_KEY, JSON.stringify(player));

  const run = (r: A.Result) => {
    toast = { msg: r.msg, ok: r.ok, at: Date.now() };
    save();
    render();
  };

  // ---------------- Criação ----------------
  const previewFighter = (): Fighter => ({
    name: draft.name,
    nickname: draft.nickname || 'Novato',
    art: draft.art,
    level: 1,
    attrs: { forca: 5, agilidade: 5, resistencia: 5, tecnica: 5, cardio: 5 },
    techniques: [],
    deck: [],
    equipped: {},
    appearance: draft.appearance,
  });

  const swatches = (field: 'skin' | 'hairColor', colors: string[]) =>
    colors
      .map(
        (c, i) =>
          `<button class="swatch ${draft.appearance[field] === i ? 'on' : ''}" style="background:${c}" data-act="look" data-arg="${field}:${i}" aria-label="Cor ${i + 1}"></button>`,
      )
      .join('');

  function createView(): string {
    return `
    <div class="create">
      <header class="brand"><h1>LONA</h1><p>Do beco ao cinturão. Crie seu lutador.</p></header>
      <div class="create-grid">
        <div class="card preview-card">
          <canvas data-portrait="preview" width="240" height="300"></canvas>
          <div class="muted center">${esc(draft.nickname || 'Seu apelido')}</div>
        </div>
        <div class="card">
          <label>Nome<input id="cname" maxlength="16" value="${esc(draft.name)}" placeholder="Ex.: Vinícius" /></label>
          <label>Apelido de lutador<input id="cnick" maxlength="16" value="${esc(draft.nickname)}" placeholder="Ex.: O Martelo" /></label>
          <div class="field-label">Arte principal (fixa — dá mais força nas técnicas dela)</div>
          <div class="arts">
            ${ART_IDS.map(
              (id) => `<button class="art ${draft.art === id ? 'on' : ''}" data-act="art" data-arg="${id}" style="--c:${ARTS[id].color}">
                <b>${ARTS[id].name}</b><small>${ARTS[id].description}</small></button>`,
            ).join('')}
          </div>
          <div class="field-label">Pele</div><div class="swatches">${swatches('skin', SKIN_TONES)}</div>
          <div class="field-label">Cabelo</div>
          <div class="chips">${HAIR_STYLES.map((h) => `<button class="chip cap ${draft.appearance.hairStyle === h ? 'on' : ''}" data-act="look" data-arg="hairStyle:${h}">${h}</button>`).join('')}</div>
          <div class="swatches">${swatches('hairColor', HAIR_COLORS)}</div>
          <div class="chips">
            <button class="chip ${draft.appearance.beard ? 'on' : ''}" data-act="look" data-arg="beard">Barba</button>
            <button class="chip ${draft.appearance.tattoo ? 'on' : ''}" data-act="look" data-arg="tattoo">Tatuagem</button>
          </div>
          <button class="primary big" data-act="create">Começar carreira</button>
          <p id="cerr" class="bad small" role="alert"></p>
          <p class="muted small">Protótipo: o progresso fica salvo neste navegador. Login com Google/Apple entra na versão online.</p>
        </div>
      </div>
    </div>`;
  }

  // ---------------- HUD ----------------
  function hud(p: Player): string {
    const t = now();
    const maxE = maxEnergy(p, t);
    const div = division(p.rankPoints);
    const full = p.energy >= maxE;
    const hungry = p.satiety < BALANCE.hungryThreshold;
    return `
    <div class="hud-id">
      <div class="avatar"><canvas data-portrait="hud" width="56" height="56"></canvas><span class="lvl">${p.level}</span></div>
      <div class="hud-who">
        <div class="hud-name">${esc(p.nickname)} ${isVip(p, t) ? '<span class="vip">VIP</span>' : ''}</div>
        <div class="meter xp" title="XP ${p.xp}/${xpToNext(p.level)}"><span style="width:${pct(p.xp, xpToNext(p.level))}"></span></div>
        <div class="hud-sub">${ARTS[p.art].name} · <span class="div" style="--c:${div.color}">${div.name} ${p.rankPoints}</span></div>
      </div>
    </div>
    <div class="hud-res">
      <div class="res" title="Energia">${ic('energy')}<div><b>${p.energy}<small>/${maxE}</small></b><div class="meter energy"><span style="width:${pct(p.energy, maxE)}"></span></div>
        <small class="res-sub">${full ? 'cheia' : `+1 em ${fmtDuration(A.nextEnergyIn(p, t))}`}</small></div></div>
      <div class="res ${hungry ? 'warn' : ''}" title="Saciedade">${ic('food')}<div><b>${Math.round(p.satiety)}<small>/${BALANCE.maxSatiety}</small></b><div class="meter food"><span style="width:${pct(p.satiety, BALANCE.maxSatiety)}"></span></div>
        <small class="res-sub">${hungry ? 'com fome!' : 'saciedade'}</small></div></div>
      <div class="res money" title="Moedas">${ic('coin')}<b>${p.money}</b></div>
      <div class="res money" title="Ouro">${ic('gold')}<b>${p.gold}</b></div>
    </div>`;
  }

  function home(p: Player): string {
    const left: Tab[] = ['academia', 'mestres', 'lutador', 'trabalho'];
    const right: Tab[] = ['casa', 'loja', 'missoes', 'vip'];
    const missionsReady = MISSIONS.some((m) => (p.missions[m.id]?.progress ?? 0) >= m.goal && !p.missions[m.id]?.claimed);
    const btn = (id: Tab) =>
      `<button class="mbtn" data-act="tab" data-arg="${id}">${ic(MENU[id].icon, 28)}<span><b>${MENU[id].label}</b><small>${MENU[id].hint}</small></span>${
        id === 'missoes' && missionsReady ? '<i class="badge">!</i>' : ''
      }</button>`;
    return `
    <section class="stage">
      <canvas id="stage" aria-label="${esc(p.nickname)} em frente à academia"></canvas>
      <div class="stage-tag"><b>${esc(p.nickname)}</b><small>${p.wins}V · ${p.losses}D</small></div>
      <nav class="menu menu-l">${left.map(btn).join('')}</nav>
      <nav class="menu menu-r">${right.map(btn).join('')}</nav>
      <button class="fight-cta" data-act="tab" data-arg="lutar">${ic('fight', 34)}<span>LUTAR</span><small>${BALANCE.fightEnergy} de energia</small></button>
    </section>`;
  }

  // ---------------- Abas ----------------
  function casa(p: Player): string {
    const t = now();
    const sleepAt = A.sleepReadyAt(p);
    return `
    <div class="grid2">
      <div class="card center">
        <h2>Sua casa</h2>
        <canvas data-portrait="home" width="200" height="260"></canvas>
        <p class="muted">${p.wins}V · ${p.losses}D</p>
        <button class="primary" data-act="sleep" ${t < sleepAt ? 'disabled' : ''}>${ic('sleep', 14)} Dormir (+${BALANCE.sleepEnergy} energia)</button>
        <p class="tiny muted">${t < sleepAt ? `Sono volta em ${fmtDuration(sleepAt - t)}` : `Pode dormir a cada ${BALANCE.sleepCooldownH}h`}</p>
      </div>
      <div class="card">
        <h2>Geladeira</h2>
        <p class="muted small">Treinar e lutar dão fome. Com menos de ${BALANCE.hungryThreshold} de saciedade o treino rende metade; com 0 você não treina nem luta.</p>
        <div class="list">
          ${FOODS.map(
            (f) => `<div class="row"><div><b>${f.name}</b><div class="tiny muted">+${f.satiety} saciedade${f.energy ? ` · +${f.energy} energia` : ''}</div></div>
              <button data-act="eat" data-arg="${f.id}" ${p.money < f.price ? 'disabled' : ''}>${ic('coin', 14)} ${f.price}</button></div>`,
          ).join('')}
        </div>
      </div>
    </div>`;
  }

  function trabalho(p: Player): string {
    return `
    <div class="card">
      <h2>Bicos</h2>
      <p class="muted small">Trabalhar troca energia por moedas, sem XP. Rende menos que lutar, mas é dinheiro garantido quando a fase está difícil.</p>
      <div class="list">
        ${JOBS.map((j) => {
          const btn =
            p.level < j.minLevel
              ? `<button disabled>Nível ${j.minLevel}</button>`
              : `<button data-act="work" data-arg="${j.id}" ${p.energy < j.energy ? 'disabled' : ''}>${ic('coin', 14)} +${A.jobPay(p.level, j.id)}</button>`;
          return `<div class="row"><div><b>${j.name}</b><div class="tiny muted">${j.description} ${ic('energy', 12)} ${j.energy} · ${ic('food', 12)} ${j.satiety}</div></div>${btn}</div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function academia(p: Player): string {
    const t = now();
    const gym = GYMS.find((g) => g.id === p.currentGym) ?? GYMS[0];
    return `
    <div class="card">
      <h2>${gym.name}</h2>
      <p class="muted small">Cada treino gasta ${BALANCE.trainEnergy} de energia e ${BALANCE.trainSatiety} de saciedade, dá XP ao personagem e aumenta um atributo. Quanto mais alto o atributo, menos ele sobe por treino.
      ${p.wheyCharges > 0 ? `<br><b>Whey ativo:</b> ${p.wheyCharges} treinos com +${BALANCE.wheyBonus * 100}%.` : ''}</p>
      <div class="stations">
        ${STATIONS.map(
          (s) => `<button class="station" data-act="train" data-arg="${s.id}" ${p.energy < BALANCE.trainEnergy ? 'disabled' : ''}>
            <b>${s.name}</b><span>${ATTR_LABEL[s.attr]} ${Math.floor(p.attrs[s.attr])}</span></button>`,
        ).join('')}
      </div>
    </div>
    <div class="card">
      <h2>Academias</h2>
      <div class="list">
        ${GYMS.map((g) => {
          const access = A.gymAccess(p, g.id, t);
          const until = p.gymPasses[g.id];
          let btn: string;
          if (p.level < g.minLevel) btn = `<button disabled>Nível ${g.minLevel}</button>`;
          else if (g.id === p.currentGym) btn = `<button disabled>Treinando aqui</button>`;
          else if (access) btn = `<button data-act="gym" data-arg="${g.id}">Treinar aqui</button>`;
          else btn = `<button data-act="gympass" data-arg="${g.id}" ${p.money < g.weeklyFee ? 'disabled' : ''}>${ic('coin', 14)} ${g.weeklyFee}/semana</button>`;
          return `<div class="row"><div><b>${g.name}</b><div class="tiny muted">${g.description}${
            g.weeklyFee && until && until > t ? ` · mensalidade vence em ${fmtDuration(until - t)}` : ''
          }</div></div>${btn}</div>`;
        }).join('')}
      </div>
    </div>`;
  }

  const techLine = (t: Technique) => {
    switch (t.kind) {
      case 'ataque':
        return `Dano ${t.power} · fôlego ${t.stamina} · recarga ${t.cooldown}${t.stun ? ' · atordoa' : ''}`;
      case 'defesa':
        return `${Math.round((t.chance ?? 0) * 100)}% · reduz ${Math.round((t.reduce ?? 0) * 100)}% · recarga ${t.cooldown}`;
      case 'preparo':
        return `+${Math.round((t.buffPower ?? 0) * 100)}% por ${t.buffHits} golpes · fôlego ${t.stamina}`;
      default:
        return 'Passiva';
    }
  };

  function mestres(p: Player): string {
    const order = [p.art, ...ART_IDS.filter((a) => a !== p.art)];
    return order
      .map(
        (art: ArtId) => `
      <div class="card">
        <h2 style="color:${ARTS[art].color}">${ARTS[art].master} · ${ARTS[art].name}</h2>
        <p class="muted small">${art === p.art ? 'Sua arte principal: técnicas com +20% de dano e preço normal.' : 'Outra arte: custa 50% a mais, sem bônus de dano. Use para cobrir fraquezas (defesa, chão, chutes).'}</p>
        <div class="list">
          ${TECHNIQUES.filter((t) => t.art === art)
            .map((t) => {
              const known = p.techniques.includes(t.id);
              const price = A.techPrice(p, t);
              const btn = known
                ? '<button disabled>Aprendida</button>'
                : p.level < t.minLevel
                  ? `<button disabled>Nível ${t.minLevel}</button>`
                  : t.requires && !p.techniques.includes(t.requires)
                    ? `<button disabled>Antes: ${TECH_BY_ID[t.requires].name}</button>`
                    : `<button data-act="learn" data-arg="${t.id}" ${p.money < price ? 'disabled' : ''}>${ic('coin', 14)} ${price}</button>`;
              return `<div class="row"><div><b>${t.name}</b> <span class="tag ${t.kind}">${t.kind}</span>
                <div class="tiny muted">${t.description} ${techLine(t)}${t.requires ? ` · requer ${TECH_BY_ID[t.requires].name}` : ''}</div></div>${btn}</div>`;
            })
            .join('')}
        </div>
      </div>`,
      )
      .join('');
  }

  function lutador(p: Player): string {
    const eff = effectiveAttrs(p);
    const gb = gearBonus(p);
    const cs = combatStats(p);
    const slots = deckSlots(p.level);
    return `
    <div class="grid2">
      <div class="card">
        <h2>Atributos</h2>
        <table class="attrs">
          ${ATTRS.map(
            (k) => `<tr><td>${ATTR_LABEL[k]}</td><td class="num">${Math.floor(eff[k])}</td><td class="tiny muted">${Math.floor(p.attrs[k])} treino${gb[k] ? ` + ${gb[k]} equip.` : ''}</td></tr>`,
          ).join('')}
        </table>
        <p class="tiny muted">Na luta: vida ${cs.maxHp} · fôlego ${cs.maxSta} · dano x${cs.dmgMult.toFixed(2)} · esquiva ${Math.round(cs.dodge * 100)}% · crítico ${Math.round(cs.crit * 100)}%${
          cs.specialist ? ' · <b>Especialista</b> (deck só da arte principal: +10% dano e vida)' : ''
        }</p>
        <h2>Equipamento</h2>
        ${(['luvas', 'shorts', 'protetor'] as Slot[])
          .map((slot) => {
            const owned = p.inventory.filter((id) => GEAR_BY_ID[id].slot === slot);
            return `<div class="field-label">${SLOT_LABEL[slot]}</div><div class="chips">${
              owned.length
                ? owned
                    .map((id) => `<button class="chip ${p.equipped[slot] === id ? 'on' : ''}" data-act="equip" data-arg="${id}">${GEAR_BY_ID[id].name}</button>`)
                    .join('')
                : '<span class="tiny muted">Nada ainda — veja a Loja.</span>'
            }</div>`;
          })
          .join('')}
      </div>
      <div class="card">
        <h2>Deck de luta (${p.deck.length}/${slots})</h2>
        <p class="muted small">A luta é automática: seu lutador usa só as técnicas do deck. Mais espaços nos níveis 3, 8, 15, 25 e 40.</p>
        <div class="list">
          ${p.techniques
            .map((id) => TECH_BY_ID[id])
            .map(
              (t) => `<div class="row ${p.deck.includes(t.id) ? 'in-deck' : ''}"><div><b>${t.name}</b> <span class="tag ${t.kind}">${t.kind}</span>
                <span class="tiny" style="color:${ARTS[t.art].color}">${ARTS[t.art].name}</span><div class="tiny muted">${techLine(t)}</div></div>
                <button data-act="deck" data-arg="${t.id}">${p.deck.includes(t.id) ? 'Tirar' : 'Usar'}</button></div>`,
            )
            .join('')}
        </div>
      </div>
    </div>`;
  }

  function loja(p: Player): string {
    return `
    <div class="card">
      <h2>Equipamentos</h2>
      <p class="muted small">Bônus somado dos equipamentos limitado a +15 por atributo: quem treina ainda vence quem só compra.</p>
      ${(['luvas', 'shorts', 'protetor'] as Slot[])
        .map(
          (slot) => `<div class="field-label">${SLOT_LABEL[slot]}</div><div class="shop">${GEAR.filter((g) => g.slot === slot)
            .map((g) => {
              const owned = p.inventory.includes(g.id);
              const cost = g.currency === 'moedas' ? `${ic('coin', 14)} ${g.price}` : `${ic('gold', 14)} ${g.price}`;
              const can = g.currency === 'moedas' ? p.money >= g.price : p.gold >= g.price;
              const btn = owned
                ? '<button disabled>Comprado</button>'
                : p.level < g.minLevel
                  ? `<button disabled>Nível ${g.minLevel}</button>`
                  : `<button data-act="buy" data-arg="${g.id}" ${can ? '' : 'disabled'}>${cost}</button>`;
              return `<div class="item r-${g.rarity}"><span class="swatch-sm" style="background:${g.color}"></span><b>${g.name}</b>
                <span class="tiny">${RARITY_LABEL[g.rarity]}</span>
                <span class="tiny muted">${Object.entries(g.bonus)
                  .map(([k, v]) => `+${v} ${ATTR_LABEL[k as keyof typeof ATTR_LABEL]}`)
                  .join(' · ')}</span>${btn}</div>`;
            })
            .join('')}</div>`,
        )
        .join('')}
    </div>
    <div class="card">
      <h2>Suplementos</h2>
      <div class="list">
        <div class="row"><div><b>Whey</b><div class="tiny muted">Próximos ${BALANCE.wheyCharges} treinos rendem +${BALANCE.wheyBonus * 100}%.</div></div>
          <button data-act="whey" ${p.money < BALANCE.wheyPrice ? 'disabled' : ''}>${ic('coin', 14)} ${BALANCE.wheyPrice}</button></div>
        <div class="row"><div><b>Energético</b><div class="tiny muted">+${BALANCE.energyDrinkAmount} de energia na hora.</div></div>
          <button data-act="drink" ${p.gold < BALANCE.energyDrinkGold ? 'disabled' : ''}>${ic('gold', 14)} ${BALANCE.energyDrinkGold}</button></div>
      </div>
    </div>`;
  }

  function lutar(p: Player): string {
    const t = now();
    const key = `${p.level}:${p.wins + p.losses}:${Math.floor(t / 3600_000)}`;
    if (key !== opponentsKey) {
      opponents = A.opponentList(p, t);
      opponentsKey = key;
    }
    const div = division(p.rankPoints);
    const nextDiv = DIVISIONS.find((d) => d.min > p.rankPoints);
    const prize = (r: { money: number; gold: number }) => `${ic('coin', 14)} ${r.money}${r.gold ? ` + ${ic('gold', 14)} ${r.gold}` : ''}`;
    const last = p.lastSeason;
    return `
    <div class="card">
      <h2>Ranking PvP — temporada ${new Date(t).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h2>
      <p><span class="div" style="--c:${div.color}">${div.name}</span> ${p.rankPoints} pts ${nextDiv ? `· faltam ${nextDiv.min - p.rankPoints} para ${nextDiv.name}` : '· topo!'}</p>
      <p class="small">Termina em ${fmtDuration(seasonEndsAt(t) - t)}. Prêmio se terminar agora: ${prize(div.reward)}. Na virada você mantém ${SEASON_KEEP * 100}% dos pontos.</p>
      ${last ? `<p class="tiny muted">Temporada passada (${last.season}): ${last.division} com ${last.points} pts · ganhou ${prize(last)}.</p>` : ''}
      <p class="muted small">Só aparecem oponentes até ±${BALANCE.levelRange} níveis do seu. Vitória: +25 pts (mais se o oponente for de nível maior). Derrota: −15 pts, mas você ganha XP e moedas igual.
      Cada luta gasta ${BALANCE.fightEnergy} de energia e ${BALANCE.fightSatiety} de saciedade.</p>
      <p class="tiny muted">Protótipo: os oponentes são "fantasmas" gerados pelo jogo. Na versão online serão personagens de outros jogadores.</p>
    </div>
    <div class="opps">
      ${opponents
        .map((o, i) => {
          const eff = effectiveAttrs(o);
          const power = Math.round(ATTRS.reduce((s, k) => s + eff[k], 0));
          const mine = Math.round(ATTRS.reduce((s, k) => s + effectiveAttrs(p)[k], 0));
          return `<div class="card opp">
            <canvas data-portrait="opp${i}" width="120" height="160"></canvas>
            <b>${esc(o.name)} "${esc(o.nickname)}"</b>
            <div class="small">Nível ${o.level} · <span style="color:${ARTS[o.art].color}">${ARTS[o.art].name}</span></div>
            <div class="tiny muted">Poder ${power} (você: ${mine})</div>
            <button class="primary" data-act="fight" data-arg="${i}" ${p.energy < BALANCE.fightEnergy ? 'disabled' : ''}>Lutar</button>
          </div>`;
        })
        .join('')}
    </div>
    <div class="card">
      <h2>Últimas lutas</h2>
      ${
        p.history.length
          ? `<div class="list">${p.history
              .map(
                (h) => `<div class="row"><div><b class="${h.won ? 'good' : 'bad'}">${h.won ? 'Vitória' : 'Derrota'}</b> vs ${esc(h.opponent)} (nv ${h.opponentLevel})</div>
                <span class="${h.rankDelta >= 0 ? 'good' : 'bad'}">${h.rankDelta >= 0 ? '+' : ''}${h.rankDelta} pts</span></div>`,
              )
              .join('')}</div>`
          : '<p class="muted small">Nenhuma luta ainda.</p>'
      }
    </div>`;
  }

  function missoes(p: Player): string {
    return `
    <div class="card">
      <h2>Missões diárias</h2>
      <p class="muted small">Renovam todo dia à meia-noite (UTC no protótipo).</p>
      <div class="list">
        ${MISSIONS.map((m) => {
          const st = p.missions[m.id] ?? { progress: 0, claimed: false };
          const done = st.progress >= m.goal;
          return `<div class="row"><div><b>${m.label}</b><div class="meter xp"><span style="width:${pct(st.progress, m.goal)}"></span></div>
            <div class="tiny muted">${Math.min(st.progress, m.goal)}/${m.goal}</div></div>
            <button data-act="claim" data-arg="${m.id}" ${!done || st.claimed ? 'disabled' : ''}>${st.claimed ? 'Resgatada' : `${ic('coin', 14)} ${m.reward}`}</button></div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function vip(p: Player): string {
    const t = now();
    return `
    <div class="grid2">
      <div class="card">
        <h2>VIP mensal</h2>
        <ul class="benefits">
          <li>Energia máxima ${BALANCE.vipMaxEnergy} (normal ${BALANCE.maxEnergy}) → mais lutas por dia</li>
          <li>Energia recarrega a cada ${BALANCE.vipEnergyRegenMin} min (normal ${BALANCE.energyRegenMin} min)</li>
          <li>+${BALANCE.vipBonus * 100}% de XP, treino e moedas nas lutas</li>
          <li>Selo VIP no nome (visuais exclusivos virão por temporada)</li>
        </ul>
        ${isVip(p, t) ? `<p class="good">VIP ativo — vence em ${fmtDuration(p.vipUntil - t)}</p>` : ''}
        <button class="primary" data-act="vip" ${p.gold < BALANCE.vipGoldPrice ? 'disabled' : ''}>${isVip(p, t) ? 'Renovar' : 'Ativar'} ${BALANCE.vipDays} dias · ${ic('gold', 14)} ${BALANCE.vipGoldPrice}</button>
      </div>
      <div class="card">
        <h2>Comprar ouro ${ic('gold', 14)}</h2>
        <p class="muted small">No jogo online, estes pacotes serão pagos com dinheiro real. Aqui no protótipo a compra é simulada e gratuita.</p>
        <div class="list">
          ${[
            [50, 'R$ 4,90'],
            [120, 'R$ 9,90'],
            [300, 'R$ 19,90'],
          ]
            .map(([g, price]) => `<div class="row"><b>${ic('gold', 14)} ${g}</b><button data-act="gold" data-arg="${g}">${price} (simulado)</button></div>`)
            .join('')}
        </div>
      </div>
    </div>`;
  }

  function gameView(p: Player): string {
    const views: Record<Tab, (p: Player) => string> = { casa, academia, mestres, lutador, trabalho, loja, lutar, missoes, vip };
    const body = tab
      ? `<section class="panel">
          <div class="panel-head"><button class="back" data-act="home">${ic('back', 14)} Menu</button><h1>${ic(MENU[tab].icon, 26)} ${PANEL_TITLE[tab]}</h1></div>
          ${views[tab](p)}
        </section>`
      : home(p);
    return `
    <header class="hud" id="hud">${hud(p)}</header>
    ${toast && Date.now() - toast.at < 6000 ? `<div class="toast ${toast.ok ? 'ok' : 'err'}" role="status">${esc(toast.msg)}</div>` : ''}
    <main>${body}</main>
    <footer class="dev">
      <span>Protótipo v0.2 · modo teste</span>
      <button data-act="skip" data-arg="1">Avançar 1h</button>
      <button data-act="skip" data-arg="6">Avançar 6h</button>
      <button data-act="reset" class="danger">${confirmReset ? 'Confirmar: apagar tudo?' : 'Apagar personagem'}</button>
      ${confirmReset ? '<button data-act="cancelreset">Cancelar</button>' : ''}
    </footer>`;
  }

  function animateStage() {
    cancelAnimationFrame(stageRaf);
    const c = root.querySelector<HTMLCanvasElement>('#stage');
    if (!c || !player) return;
    const loop = (t: number) => {
      if (!c.isConnected || !player) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round(c.clientHeight * dpr);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      drawStreet(c, player, 'idle', t);
      stageRaf = requestAnimationFrame(loop);
    };
    stageRaf = requestAnimationFrame(loop);
  }

  function drawPortraits() {
    root.querySelectorAll<HTMLCanvasElement>('canvas[data-portrait]').forEach((c) => {
      const k = c.dataset.portrait!;
      if (k === 'preview') portrait(c, previewFighter(), 'guard', performance.now());
      else if (k.startsWith('opp')) {
        const o = opponents[Number(k.slice(3))];
        if (o) portrait(c, o, 'guard');
      } else if (player && k === 'hud') avatar(c, player);
      else if (player) portrait(c, player, k === 'home' ? 'win' : 'idle');
    });
  }

  /** Avança o tempo do jogador e avisa quando uma temporada acabou de fechar. */
  function tickPlayer(p: Player): boolean {
    const season = p.season;
    const energy = p.energy;
    A.tick(p, now());
    if (season && p.season !== season && p.lastSeason) {
      const l = p.lastSeason;
      toast = { msg: `Temporada encerrada! Você terminou em ${l.division} e ganhou ${l.money} moedas${l.gold ? ` e ${l.gold} de ouro` : ''}.`, ok: true, at: Date.now() };
      save();
      return true;
    }
    if (p.energy !== energy) save();
    return false;
  }

  function render() {
    if (player) tickPlayer(player);
    root.innerHTML = player ? gameView(player) : createView();
    drawPortraits();
    animateStage();
  }

  // ---------------- Eventos ----------------
  root.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.id === 'cname') draft.name = el.value;
    if (el.id === 'cnick') {
      draft.nickname = el.value;
      const label = root.querySelector('.preview-card .muted');
      if (label) label.textContent = el.value || 'Seu apelido';
    }
  });

  root.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!el || (el as HTMLButtonElement).disabled) return;
    const act = el.dataset.act!;
    const arg = el.dataset.arg ?? '';
    const t = now();

    if (!player) {
      if (act === 'art') draft.art = arg as ArtId;
      if (act === 'look') {
        const [k, v] = arg.split(':');
        if (k === 'beard' || k === 'tattoo') draft.appearance[k] = !draft.appearance[k];
        else if (k === 'hairStyle') draft.appearance.hairStyle = v as NewCharacter['appearance']['hairStyle'];
        else if (k === 'skin' || k === 'hairColor') draft.appearance[k] = Number(v);
      }
      if (act === 'create') {
        if (!draft.name.trim() || !draft.nickname.trim()) {
          const err = root.querySelector('#cerr');
          if (err) err.textContent = 'Preencha o nome e o apelido para começar.';
          return;
        }
        player = createPlayer(draft, t);
        tab = null;
        toast = { msg: `Bem-vindo, ${player.nickname}! Treine, coma e suba no ranking.`, ok: true, at: Date.now() };
        save();
      }
      render();
      return;
    }

    const p = player;
    switch (act) {
      case 'home':
        tab = null;
        toast = null;
        render();
        window.scrollTo({ top: 0 });
        return;
      case 'tab':
        tab = arg as Tab;
        toast = null;
        render();
        window.scrollTo({ top: 0 });
        return;
      case 'train':
        return run(A.train(p, arg, t));
      case 'work':
        return run(A.work(p, arg, t));
      case 'eat':
        return run(A.eat(p, arg, t));
      case 'sleep':
        return run(A.sleep(p, t));
      case 'gym':
        return run(A.selectGym(p, arg, t));
      case 'gympass':
        return run(A.buyGymPass(p, arg, t));
      case 'learn':
        return run(A.learnTechnique(p, arg, t));
      case 'deck':
        return run(A.toggleDeck(p, arg));
      case 'equip':
        return run(A.equip(p, arg));
      case 'buy':
        return run(A.buyGear(p, arg, t));
      case 'whey':
        return run(A.buyWhey(p, t));
      case 'drink':
        return run(A.buyEnergyDrink(p, t));
      case 'vip':
        return run(A.buyVip(p, t));
      case 'gold':
        return run(A.addGold(p, Number(arg)));
      case 'claim':
        return run(A.claimMission(p, arg, t));
      case 'fight': {
        const opp = opponents[Number(arg)];
        if (!opp) return;
        const snapshot = JSON.parse(JSON.stringify(p)) as Player;
        const out = A.fight(p, opp, t);
        if (!out.ok || !out.fight) return run({ ok: false, msg: out.msg });
        save();
        const extra = ` ${out.rankDelta! >= 0 ? '+' : ''}${out.rankDelta} pts de rank · +${out.xp} XP.`;
        playFight(fightHost, [snapshot, opp], out.fight, out.msg + extra, () => {
          toast = { msg: out.msg, ok: true, at: Date.now() };
          render();
        });
        return;
      }
      case 'skip':
        clockOffset += Number(arg) * 3600_000;
        writeStore(CLOCK_KEY, String(clockOffset));
        return run({ ok: true, msg: `Relógio avançado ${arg}h (modo teste).` });
      case 'cancelreset':
        confirmReset = false;
        render();
        return;
      case 'reset':
        if (!confirmReset) {
          confirmReset = true;
          render();
          return;
        }
        confirmReset = false;
        player = null;
        clockOffset = 0;
        writeStore(SAVE_KEY, null);
        writeStore(CLOCK_KEY, null);
        render();
        return;
    }
  });

  // Atualiza o HUD a cada segundo (energia recarregando) sem redesenhar a tela toda.
  setInterval(() => {
    if (!player || fightHost.childElementCount) return;
    if (tickPlayer(player)) return render();
    const el = root.querySelector('#hud');
    if (el) {
      el.innerHTML = hud(player);
      const c = el.querySelector<HTMLCanvasElement>('canvas[data-portrait]');
      if (c) avatar(c, player);
    }
  }, 1000);

  render();
}
