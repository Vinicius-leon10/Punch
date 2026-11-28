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
  MISSIONS,
  SEASON_KEEP,
  RARITY_LABEL,
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
import { FOOD_IMG, GEAR_IMG, MASTER_IMG, bodyOf, imgUrl, img, jobImg, poseImg, stationImg, wearName, type Body, type PoseKey } from './art';
import { ic } from './icons';
import { portrait } from './sprite';
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
  /** Pose da casa e aparelho da academia: mudam com a última ação, só na tela. */
  let casaPose: PoseKey = 'descansando';
  let gymStation = 'saco';
  /** Aviso grande com a pose do personagem (nível, energia, fome, missão, resultado da luta). */
  let notice: { title: string; pose: PoseKey; text: string; tone: 'good' | 'bad' } | null = null;
  let toast: { msg: string; ok: boolean; at: number } | null = null;
  let opponents: Fighter[] = [];
  let opponentsKey = '';
  let confirmReset = false;
  let devOpen = false;
  const draft: NewCharacter = {
    name: '',
    nickname: '',
    art: 'boxe',
    appearance: { body: 'm', skin: 1, hairStyle: 'curto', hairColor: 0, beard: false, tattoo: false },
  };
  const fightHost = document.createElement('div');
  document.body.appendChild(fightHost);

  const save = () => player && writeStore(SAVE_KEY, JSON.stringify(player));

  const showEvent = (ev: A.GameEvent | undefined, p: Player, msg: string) => {
    if (ev === 'nivel') notice = { title: 'SUBIU DE NÍVEL!', pose: 'nivel', text: `Nível ${p.level} · ${deckSlots(p.level)} espaços no deck`, tone: 'good' };
    else if (ev === 'energia') notice = { title: 'SEM ENERGIA', pose: 'energia', text: `Volta +1 em ${fmtDuration(A.nextEnergyIn(p, now()))}. Durma na Casa ou use um energético.`, tone: 'bad' };
    else if (ev === 'fome') notice = { title: 'COM FOME', pose: 'fome', text: 'Coma alguma coisa na Casa antes de continuar.', tone: 'bad' };
    else if (ev === 'missao') notice = { title: 'MISSÃO CUMPRIDA!', pose: 'joinha', text: msg, tone: 'good' };
  };

  const run = (r: A.Result) => {
    toast = { msg: r.msg, ok: r.ok, at: Date.now() };
    if (player) showEvent(r.ev, player, r.msg);
    save();
    render();
  };

  const scene = (bg: string, inner: string, cls = '') => `<div class="scene ${cls}" style="background-image:url('${imgUrl(bg)}')">${inner}</div>`;

  function noticeView(p: Player): string {
    if (!notice) return '';
    const b = bodyOf(p);
    return `<div class="notice-dim"><div class="notice ${notice.tone}" role="dialog" aria-labelledby="ntitle">
      <div class="notice-title" id="ntitle">${esc(notice.title)}</div>
      ${poseImg(b, notice.pose, 'notice-img')}
      <p>${esc(notice.text)}</p>
      <button class="primary" data-act="closenotice">Continuar</button>
    </div></div>`;
  }

  // ---------------- Criação ----------------
  function createView(): string {
    return `
    <div class="create">
      <header class="brand"><h1>LONA</h1><p>Do beco ao cinturão. Crie seu personagem.</p></header>
      <div class="create-grid">
        <div class="card preview-card">
          ${poseImg(draft.appearance.body ?? 'm', 'menu', 'preview-img', 'Prévia do personagem')}
          <div class="muted center">${esc(draft.nickname || 'Seu apelido')}</div>
        </div>
        <div class="card">
          <label>Nome<input id="cname" maxlength="16" value="${esc(draft.name)}" placeholder="Ex.: Vinícius" /></label>
          <label>Apelido de lutador<input id="cnick" maxlength="16" value="${esc(draft.nickname)}" placeholder="Ex.: O Martelo" /></label>
          <div class="field-label">Arte principal (fixa)</div>
          <div class="arts">
            ${ART_IDS.map(
              (id) => `<button class="art ${draft.art === id ? 'on' : ''}" data-act="art" data-arg="${id}" style="--c:${ARTS[id].color}">
                <b>${ARTS[id].name}</b><small>${ARTS[id].description}</small></button>`,
            ).join('')}
          </div>
          <div class="field-label">Personagem</div>
          <div class="bodies">
            ${(['m', 'f'] as Body[])
              .map(
                (bd) => `<button class="body-pick ${(draft.appearance.body ?? 'm') === bd ? 'on' : ''}" data-act="body" data-arg="${bd}" aria-pressed="${(draft.appearance.body ?? 'm') === bd}">
                ${poseImg(bd, 'perfil', 'body-img')}<b>${bd === 'm' ? 'Lutador' : 'Lutadora'}</b></button>`,
              )
              .join('')}
          </div>
          <button class="primary big" data-act="create">Começar carreira</button>
          <p id="cerr" class="bad small" role="alert"></p>
          <p class="muted small">Protótipo: o progresso fica salvo neste navegador. Login com Google/Apple entra na versão online.</p>
        </div>
      </div>
    </div>`;
  }

  // ---------------- HUD ----------------
  // ---------------- Tela fixa: topo · conteúdo · abas ----------------
  /** Abas internas de cada tela (a escolha fica só nesta sessão). */
  const sub: Partial<Record<Tab, string>> = {};
  const curSub = (t: Tab, def: string) => sub[t] ?? def;
  const subtabs = (t: Tab, opts: [string, string][], def: string) =>
    `<div class="subtabs" role="tablist">${opts
      .map(([k, label]) => `<button role="tab" class="${curSub(t, def) === k ? 'on' : ''}" aria-selected="${curSub(t, def) === k}" data-act="sub" data-arg="${t}:${k}">${label}</button>`)
      .join('')}</div>`;

  function hud(p: Player): string {
    const t = now();
    const maxE = maxEnergy(p, t);
    const div = division(p.rankPoints);
    const full = p.energy >= maxE;
    const hungry = p.satiety < BALANCE.hungryThreshold;
    return `
    <div class="hud-row">
      <div class="avatar">${poseImg(bodyOf(p), 'perfil', 'avatar-img')}<span class="lvl">${p.level}</span></div>
      <div class="hud-who">
        <div class="hud-name">${esc(p.nickname)} ${isVip(p, t) ? '<span class="vip">VIP</span>' : ''}</div>
        <div class="meter xp" title="XP ${p.xp}/${xpToNext(p.level)}"><span style="width:${pct(p.xp, xpToNext(p.level))}"></span></div>
        <div class="hud-sub">${ARTS[p.art].name} · <span class="div" style="--c:${div.color}">${div.name} ${p.rankPoints}</span></div>
      </div>
      <button class="gear" data-act="dev" aria-label="Opções de teste" aria-expanded="${devOpen}">⚙</button>
    </div>
    <div class="hud-res">
      <div class="res" title="Energia${full ? '' : ` · +1 em ${fmtDuration(A.nextEnergyIn(p, t))}`}">${ic('energy', 18)}<div><b>${p.energy}<small>/${maxE}</small></b><div class="meter energy"><span style="width:${pct(p.energy, maxE)}"></span></div></div></div>
      <div class="res ${hungry ? 'warn' : ''}" title="Saciedade">${ic('food', 18)}<div><b>${Math.round(p.satiety)}<small>/${BALANCE.maxSatiety}</small></b><div class="meter food"><span style="width:${pct(p.satiety, BALANCE.maxSatiety)}"></span></div></div></div>
      <div class="res money" title="Moedas">${ic('coin', 20)}<b>${p.money}</b></div>
      <div class="res money" title="Ouro">${ic('gold', 20)}<b>${p.gold}</b></div>
    </div>`;
  }

  /** Atalhos coloridos da tela inicial (as abas principais ficam na barra de baixo). */
  const QUICK: { id: Tab; bg: string }[] = [
    { id: 'trabalho', bg: 'linear-gradient(#ffb347, #e07a1f)' },
    { id: 'loja', bg: 'linear-gradient(#ff7aa8, #e23b6a)' },
    { id: 'missoes', bg: 'linear-gradient(#4cd964, #22a548)' },
    { id: 'vip', bg: 'linear-gradient(#ffd23f, #f29a1b)' },
  ];

  function home(p: Player): string {
    const missionsReady = MISSIONS.some((m) => (p.missions[m.id]?.progress ?? 0) >= m.goal && !p.missions[m.id]?.claimed);
    const rb = ({ id, bg }: { id: Tab; bg: string }) =>
      `<button class="rb" data-act="tab" data-arg="${id}" style="--bg:${bg}" aria-label="${MENU[id].label}: ${MENU[id].hint}"><span class="rb-ic">${ic(MENU[id].icon, 26)}${
        id === 'missoes' && missionsReady ? '<i class="badge">!</i>' : ''
      }</span><small>${MENU[id].label}</small></button>`;
    return `
    <section class="stage">
      ${scene('bg_rua', poseImg(bodyOf(p), 'menu', 'pose breathe', `${esc(p.nickname)} em guarda na rua`), 'street')}
      <div class="stage-tag"><b>${esc(p.nickname)}</b><small>${p.wins}V · ${p.losses}D</small></div>
      <nav class="quick">${QUICK.map(rb).join('')}</nav>
      <button class="fight-cta" data-act="tab" data-arg="lutar"><span>LUTAR</span><small>Partida ranqueada · ${BALANCE.fightEnergy} de energia</small></button>
    </section>`;
  }

  /** Barra de abas embaixo, como no app: Casa · Treinar · Arena (início) · Mestres · Lutador. */
  function tabBar(): string {
    const item = (id: Tab | null, label: string, icon: string) => {
      const on = tab === id || (id === null && (tab === null || tab === 'lutar'));
      return `<button class="tab ${on ? 'on' : ''}" data-act="${id ? 'tab' : 'home'}" ${id ? `data-arg="${id}"` : ''} ${on ? 'aria-current="page"' : ''}><span class="tab-ic">${ic(icon, 22)}</span>${label}</button>`;
    };
    return `<nav class="tabs" aria-label="Navegação">${item('casa', 'Casa', 'home')}${item('academia', 'Treinar', 'train')}${item(null, 'Arena', 'fight')}${item('mestres', 'Mestres', 'master')}${item('lutador', 'Lutador', 'fighter')}</nav>`;
  }

  // ---------------- Abas ----------------
  function casa(p: Player): string {
    const t = now();
    const sleepAt = A.sleepReadyAt(p);
    return `
    ${scene('bg_casa', poseImg(bodyOf(p), casaPose, `pose ${casaPose}`), 'room')}
    <div class="bar-row">
      <button class="primary" data-act="sleep" ${t < sleepAt ? 'disabled' : ''}>${ic('sleep', 14)} Dormir +${BALANCE.sleepEnergy}</button>
      <span class="tiny muted">${t < sleepAt ? `Sono volta em ${fmtDuration(sleepAt - t)}` : `Pode dormir a cada ${BALANCE.sleepCooldownH}h`}</span>
    </div>
    <div class="pane">
      <div class="tiles">
        ${FOODS.map(
          (f) => `<div class="tile">${img(FOOD_IMG[f.id], 'tile-img')}<b>${f.name}</b><small>+${f.satiety} saciedade${f.energy ? ` · +${f.energy} energia` : ''}</small>
            <button data-act="eat" data-arg="${f.id}" ${p.money < f.price ? 'disabled' : ''}>${ic('coin', 14)} ${f.price}</button></div>`,
        ).join('')}
      </div>
      <p class="tiny muted">Com menos de ${BALANCE.hungryThreshold} de saciedade o treino rende metade; com 0 você não treina nem luta.</p>
    </div>`;
  }

  function trabalho(p: Player): string {
    return `
    <div class="host">${img('lanchonete', 'host-img')}<p class="muted small">Trabalhar troca energia por moedas, sem XP. Rende menos que lutar, mas é dinheiro garantido.</p></div>
    <div class="pane">
      <div class="list">
        ${JOBS.map((j) => {
          const btn =
            p.level < j.minLevel
              ? `<button disabled>Nível ${j.minLevel}</button>`
              : `<button data-act="work" data-arg="${j.id}" ${p.energy < j.energy ? 'disabled' : ''}>${ic('coin', 14)} +${A.jobPay(p.level, j.id)}</button>`;
          return `<div class="row">${img(jobImg(bodyOf(p), j.id), 'row-img job')}<div><b>${j.name}</b><div class="tiny muted">${ic('energy', 12)} ${j.energy} · ${ic('food', 12)} ${j.satiety}</div></div>${btn}</div>`;
        }).join('')}
      </div>
    </div>`;
  }

  const SHORT_STATION: Record<string, string> = { saco: 'Saco', corda: 'Corda', abdominal: 'Abdominal', sparring: 'Sparring', esteira: 'Esteira' };

  function academia(p: Player): string {
    const t = now();
    const gym = GYMS.find((g) => g.id === p.currentGym) ?? GYMS[0];
    const view = curSub('academia', 'treinar');
    const body =
      view === 'treinar'
        ? `
      ${scene('bg_academia', `${img(stationImg(bodyOf(p), gymStation), 'pose train')}${
        gym.id === 'bairro' ? `<div class="speech">${img('retrato_neide', 'speech-img', 'Dona Neide')}<span><b>Dona Neide</b>Cada treino: ${BALANCE.trainEnergy} de energia e ${BALANCE.trainSatiety} de saciedade.</span></div>` : ''
      }`, 'room')}
      <div class="pane">
        <div class="stations">
          ${STATIONS.map(
            (s) => `<button class="station" data-act="train" data-arg="${s.id}" ${p.energy < BALANCE.trainEnergy ? 'disabled' : ''}>
              ${img(stationImg(bodyOf(p), s.id), 'station-img')}<b>${SHORT_STATION[s.id] ?? s.name}</b><span>${ATTR_LABEL[s.attr]} ${Math.floor(p.attrs[s.attr])}</span></button>`,
          ).join('')}
        </div>
        ${p.wheyCharges > 0 ? `<p class="tiny"><b>Whey ativo:</b> ${p.wheyCharges} treinos com +${BALANCE.wheyBonus * 100}%.</p>` : ''}
      </div>`
        : `
      <div class="pane">
        <div class="list">
          ${GYMS.map((g) => {
            const access = A.gymAccess(p, g.id, t);
            const until = p.gymPasses[g.id];
            let btn: string;
            if (p.level < g.minLevel) btn = `<button disabled>Nível ${g.minLevel}</button>`;
            else if (g.id === p.currentGym) btn = `<button disabled>Aqui</button>`;
            else if (access) btn = `<button data-act="gym" data-arg="${g.id}">Treinar aqui</button>`;
            else btn = `<button data-act="gympass" data-arg="${g.id}" ${p.money < g.weeklyFee ? 'disabled' : ''}>${ic('coin', 14)} ${g.weeklyFee}/sem</button>`;
            return `<div class="row"><div><b>${g.name}</b><div class="tiny muted">${g.description}${
              g.weeklyFee && until && until > t ? ` · vence em ${fmtDuration(until - t)}` : ''
            }</div></div>${btn}</div>`;
          }).join('')}
        </div>
      </div>`;
    return subtabs('academia', [['treinar', gym.name], ['academias', 'Academias']], 'treinar') + body;
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
    const art = curSub('mestres', p.art) as ArtId;
    const short = (a: ArtId) => ARTS[a].master.replace(/^(Mestre|Mestra|Kru) /, '').replace(/ ".*"$/, '');
    return `
    ${subtabs('mestres', order.map((a) => [a, short(a)] as [string, string]), p.art)}
    <div class="host master-head" style="--c:${ARTS[art].color}">${img(MASTER_IMG[art], 'host-img', ARTS[art].master)}<div>
      <h2 style="color:${ARTS[art].color}">${ARTS[art].name}</h2>
      <p class="tiny muted">${art === p.art ? 'Sua arte principal: +20% de dano e preço normal.' : 'Outra arte: 50% mais cara, sem bônus. Serve para cobrir fraquezas.'}</p></div></div>
    <div class="pane">
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
              <div class="tiny muted">${techLine(t)}${t.requires ? ` · requer ${TECH_BY_ID[t.requires].name}` : ''}</div></div>${btn}</div>`;
          })
          .join('')}
      </div>
    </div>`;
  }

  function lutador(p: Player): string {
    const eff = effectiveAttrs(p);
    const gb = gearBonus(p);
    const cs = combatStats(p);
    const slots = deckSlots(p.level);
    const view = curSub('lutador', 'atributos');
    let body: string;
    if (view === 'atributos') {
      body = `
      <div class="pane">
        <div class="sheet">
          <div class="look">${img(wearName(bodyOf(p), p.equipped), 'look-img', 'Seu personagem com o equipamento')}</div>
          <table class="attrs">
            ${ATTRS.map(
              (k) => `<tr><td>${ATTR_LABEL[k]}</td><td class="num">${Math.floor(eff[k])}</td><td class="tiny muted">${gb[k] ? `+${gb[k]}` : ''}</td></tr>`,
            ).join('')}
          </table>
        </div>
        <p class="tiny muted">Na luta: vida ${cs.maxHp} · fôlego ${cs.maxSta} · dano x${cs.dmgMult.toFixed(2)} · esquiva ${Math.round(cs.dodge * 100)}% · crítico ${Math.round(cs.crit * 100)}%${
          cs.specialist ? ' · <b>Especialista</b> (+10% dano e vida)' : ''
        }</p>
      </div>`;
    } else if (view === 'deck') {
      body = `
      <p class="tiny muted">Deck ${p.deck.length}/${slots}. A luta é automática e usa só o deck. Mais espaços nos níveis 3, 8, 15, 25 e 40.</p>
      <div class="pane">
        <div class="list">
          ${p.techniques
            .map((id) => TECH_BY_ID[id])
            .map(
              (t) => `<div class="row ${p.deck.includes(t.id) ? 'in-deck' : ''}"><div><b>${t.name}</b> <span class="tag ${t.kind}">${t.kind}</span>
                <div class="tiny muted"><span style="color:${ARTS[t.art].color}">${ARTS[t.art].name}</span> · ${techLine(t)}</div></div>
                <button data-act="deck" data-arg="${t.id}">${p.deck.includes(t.id) ? 'Tirar' : 'Usar'}</button></div>`,
            )
            .join('')}
        </div>
      </div>`;
    } else {
      body = `
      <div class="pane">
        ${(['luvas', 'shorts', 'protetor'] as Slot[])
          .map((slot) => {
            const owned = p.inventory.filter((id) => GEAR_BY_ID[id].slot === slot);
            return `<div class="field-label">${SLOT_LABEL[slot]}</div><div class="chips">${
              owned.length
                ? owned
                    .map((id) => `<button class="chip ${p.equipped[slot] === id ? 'on' : ''}" data-act="equip" data-arg="${id}">${GEAR_BY_ID[id].name}</button>`)
                    .join('')
                : '<span class="tiny muted">Nada ainda. Veja a Loja.</span>'
            }</div>`;
          })
          .join('')}
      </div>`;
    }
    return subtabs('lutador', [['atributos', 'Atributos'], ['deck', `Deck ${p.deck.length}/${slots}`], ['equip', 'Equipamento']], 'atributos') + body;
  }

  function loja(p: Player): string {
    const view = curSub('loja', 'luvas');
    const tiles =
      view === 'sup'
        ? `<div class="tile">${img('whey', 'tile-img')}<b>Whey</b><small>Próximos ${BALANCE.wheyCharges} treinos +${BALANCE.wheyBonus * 100}%</small>
            <button data-act="whey" ${p.money < BALANCE.wheyPrice ? 'disabled' : ''}>${ic('coin', 14)} ${BALANCE.wheyPrice}</button></div>
           <div class="tile">${img('energetico', 'tile-img')}<b>Energético</b><small>+${BALANCE.energyDrinkAmount} de energia</small>
            <button data-act="drink" ${p.gold < BALANCE.energyDrinkGold ? 'disabled' : ''}>${ic('gold', 14)} ${BALANCE.energyDrinkGold}</button></div>`
        : GEAR.filter((g) => g.slot === view)
            .map((g) => {
              const owned = p.inventory.includes(g.id);
              const cost = g.currency === 'moedas' ? `${ic('coin', 14)} ${g.price}` : `${ic('gold', 14)} ${g.price}`;
              const can = g.currency === 'moedas' ? p.money >= g.price : p.gold >= g.price;
              const btn = owned
                ? '<button disabled>Comprado</button>'
                : p.level < g.minLevel
                  ? `<button disabled>Nível ${g.minLevel}</button>`
                  : `<button data-act="buy" data-arg="${g.id}" ${can ? '' : 'disabled'}>${cost}</button>`;
              return `<div class="tile item r-${g.rarity}">${img(GEAR_IMG[g.id], 'tile-img') || `<span class="swatch-sm" style="background:${g.color}"></span>`}<b>${g.name}</b>
                <small>${RARITY_LABEL[g.rarity]} · ${Object.entries(g.bonus)
                  .map(([k, v]) => `+${v} ${ATTR_LABEL[k as keyof typeof ATTR_LABEL]}`)
                  .join(' · ')}</small>${btn}</div>`;
            })
            .join('');
    return `
    ${scene('bg_loja', poseImg(bodyOf(p), 'loja', 'pose breathe'), 'room short')}
    ${subtabs('loja', [['luvas', 'Luvas'], ['shorts', 'Shorts'], ['protetor', 'Protetor'], ['sup', 'Suplem.']], 'luvas')}
    <div class="pane"><div class="tiles">${tiles}</div>
      ${view !== 'sup' ? '<p class="tiny muted">Bônus somado dos equipamentos limitado a +15 por atributo.</p>' : ''}</div>`;
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
    const view = curSub('lutar', 'oponentes');
    const rankLine = `<div class="rank-line">${img('cinturao', 'rank-belt')}<div><b><span class="div" style="--c:${div.color}">${div.name}</span> ${p.rankPoints} pts</b>
      <div class="tiny muted">${nextDiv ? `faltam ${nextDiv.min - p.rankPoints} para ${nextDiv.name}` : 'topo!'} · ${BALANCE.fightEnergy} de energia por luta</div></div></div>`;
    let body: string;
    if (view === 'oponentes') {
      const mine = Math.round(ATTRS.reduce((s, k) => s + effectiveAttrs(p)[k], 0));
      body = `${rankLine}
      <div class="pane">
        <div class="opps">
          ${opponents
            .map((o, i) => {
              const eff = effectiveAttrs(o);
              const power = Math.round(ATTRS.reduce((s, k) => s + eff[k], 0));
              return `<div class="opp">
                ${img(o.sprite === 'rival' ? 'rival_guarda' : o.sprite, 'opp-img', `${o.name} "${o.nickname}"`) || `<canvas data-portrait="opp${i}" width="120" height="160"></canvas>`}
                <b>${esc(o.nickname)}</b>
                <small>Nv ${o.level} · <span style="color:${ARTS[o.art].color}">${ARTS[o.art].name}</span></small>
                <small class="muted">Poder ${power} <span class="${power > mine ? 'bad' : 'good'}">(${mine})</span></small>
                <button class="primary" data-act="fight" data-arg="${i}" ${p.energy < BALANCE.fightEnergy ? 'disabled' : ''}>Lutar</button>
              </div>`;
            })
            .join('')}
        </div>
      </div>`;
    } else if (view === 'ranking') {
      body = `
      <div class="pane">
        ${rankLine}
        <p class="small">Temporada de ${new Date(t).toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })}: termina em ${fmtDuration(seasonEndsAt(t) - t)}.</p>
        <p class="small">${img('bau', 'inline-img')} Prêmio se terminar agora: ${prize(div.reward)}. Na virada você mantém ${SEASON_KEEP * 100}% dos pontos.</p>
        ${last ? `<p class="tiny muted">Temporada passada (${last.season}): ${last.division} com ${last.points} pts · ganhou ${prize(last)}.</p>` : ''}
        <p class="tiny muted">Vitória: +25 pts (mais contra nível maior). Derrota: −15 pts, mas você ganha XP e moedas igual. Oponentes até ±${BALANCE.levelRange} níveis.</p>
      </div>`;
    } else {
      body = `
      <div class="pane">
        ${
          p.history.length
            ? `<div class="list">${p.history
                .map(
                  (h) => `<div class="row"><div><b class="${h.won ? 'good' : 'bad'}">${h.won ? 'Vitória' : 'Derrota'}</b> <span class="tiny">vs ${esc(h.opponent)} (nv ${h.opponentLevel})</span></div>
                  <span class="${h.rankDelta >= 0 ? 'good' : 'bad'}">${h.rankDelta >= 0 ? '+' : ''}${h.rankDelta}</span></div>`,
                )
                .join('')}</div>`
            : '<p class="muted small">Nenhuma luta ainda.</p>'
        }
      </div>`;
    }
    return subtabs('lutar', [['oponentes', 'Oponentes'], ['ranking', 'Ranking'], ['historico', 'Histórico']], 'oponentes') + body;
  }

  function missoes(p: Player): string {
    return `
    <p class="tiny muted">Renovam todo dia à meia-noite (UTC no protótipo).</p>
    <div class="pane">
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
    const view = curSub('vip', 'vip');
    const body =
      view === 'vip'
        ? `
      <div class="pane">
        <div class="host">${img('icone_vip', 'host-img belt')}<ul class="benefits">
          <li>Energia máxima ${BALANCE.vipMaxEnergy} (normal ${BALANCE.maxEnergy})</li>
          <li>Recarrega a cada ${BALANCE.vipEnergyRegenMin} min (normal ${BALANCE.energyRegenMin})</li>
          <li>+${BALANCE.vipBonus * 100}% de XP, treino e moedas nas lutas</li>
          <li>Selo VIP no nome</li>
        </ul></div>
        ${isVip(p, t) ? `<p class="good">VIP ativo, vence em ${fmtDuration(p.vipUntil - t)}</p>` : ''}
        <button class="primary wide" data-act="vip" ${p.gold < BALANCE.vipGoldPrice ? 'disabled' : ''}>${isVip(p, t) ? 'Renovar' : 'Ativar'} ${BALANCE.vipDays} dias · ${ic('gold', 14)} ${BALANCE.vipGoldPrice}</button>
      </div>`
        : `
      <div class="pane">
        <p class="tiny muted">No jogo online estes pacotes serão pagos com dinheiro real. Aqui a compra é simulada e gratuita.</p>
        <div class="list">
          ${[
            [50, 'R$ 4,90'],
            [120, 'R$ 9,90'],
            [300, 'R$ 19,90'],
          ]
            .map(([g, price]) => `<div class="row"><b>${ic('gold', 18)} ${g}</b><button data-act="gold" data-arg="${g}">${price} (simulado)</button></div>`)
            .join('')}
        </div>
      </div>`;
    return subtabs('vip', [['vip', 'VIP mensal'], ['ouro', 'Comprar ouro']], 'vip') + body;
  }

  function devMenu(): string {
    if (!devOpen) return '';
    return `<div class="dev" role="menu">
      <b>Modo teste · v0.3</b>
      <button data-act="skip" data-arg="1">Avançar 1h</button>
      <button data-act="skip" data-arg="6">Avançar 6h</button>
      <button data-act="reset" class="danger">${confirmReset ? 'Confirmar: apagar tudo?' : 'Apagar personagem'}</button>
      ${confirmReset ? '<button data-act="cancelreset">Cancelar</button>' : ''}
    </div>`;
  }

  function gameView(p: Player): string {
    const views: Record<Tab, (p: Player) => string> = { casa, academia, mestres, lutador, trabalho, loja, lutar, missoes, vip };
    const title = tab === 'lutador' ? (bodyOf(p) === 'f' ? 'Sua lutadora' : 'Seu lutador') : tab ? PANEL_TITLE[tab] : '';
    const body = tab
      ? `<section class="panel">
          <div class="panel-head"><button class="back" data-act="home" aria-label="Voltar">${ic('back', 14)}</button><h1>${ic(MENU[tab].icon, 24)} ${title}</h1></div>
          <div class="panel-body">${views[tab](p)}</div>
        </section>`
      : home(p);
    return `
    <header class="hud" id="hud">${hud(p)}</header>
    ${devMenu()}
    <main>${body}${toast && Date.now() - toast.at < 4000 ? `<div class="toast ${toast.ok ? 'ok' : 'err'}" role="status">${esc(toast.msg)}</div>` : ''}</main>
    ${tabBar()}
    ${noticeView(p)}`;
  }

  function drawPortraits() {
    root.querySelectorAll<HTMLCanvasElement>('canvas[data-portrait]').forEach((c) => {
      const k = c.dataset.portrait!;
      // Só oponentes sem arte ainda usam o boneco desenhado em código.
      if (k.startsWith('opp')) {
        const o = opponents[Number(k.slice(3))];
        if (o) portrait(c, o, 'guard');
      }
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
      if (act === 'body') draft.appearance.body = arg === 'f' ? 'f' : 'm';
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
        gymStation = arg;
        return run(A.train(p, arg, t));
      case 'work':
        return run(A.work(p, arg, t));
      case 'eat': {
        const r = A.eat(p, arg, t);
        if (r.ok) casaPose = 'comendo';
        return run(r);
      }
      case 'sleep': {
        const r = A.sleep(p, t);
        if (r.ok) casaPose = 'dormindo';
        return run(r);
      }
      case 'sub': {
        const [tb, k] = arg.split(':');
        sub[tb as Tab] = k;
        render();
        return;
      }
      case 'dev':
        devOpen = !devOpen;
        confirmReset = false;
        render();
        return;
      case 'closenotice':
        notice = null;
        render();
        return;
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
        if (!out.ok || !out.fight) return run({ ok: false, msg: out.msg, ev: out.ev });
        save();
        const extra = ` ${out.rankDelta! >= 0 ? '+' : ''}${out.rankDelta} pts de rank · +${out.xp} XP.`;
        playFight(fightHost, [snapshot, opp], out.fight, out.msg + extra, () => {
          toast = { msg: out.msg, ok: true, at: Date.now() };
          const up = out.levels ? ` · Subiu para o nível ${p.level}!` : '';
          notice = out.won
            ? { title: 'VITÓRIA!', pose: 'vitoria', text: `+${out.rankDelta} pts · +${out.money} moedas · +${out.xp} XP${up}`, tone: 'good' }
            : { title: 'DERROTA', pose: 'derrota', text: `${out.rankDelta} pts · +${out.money} moedas · +${out.xp} XP${up}`, tone: 'bad' };
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
    }
  }, 1000);

  render();
}
