// Interfaz local (hot-seat: todos juegan en la misma pantalla).
// Toda la lógica de reglas vive en engine.js; acá solo se dibuja y se despachan acciones.

import { reduce, initialState, PHASES, isAutoCard } from './engine.js';
import { CARDS_BY_ID, CATEGORIES, CATEGORY_ORDER, FILL_OPTIONS, TYPE_LABELS } from './cards.js';
import { SQUARES, CHARACTERS, BOARD_IMAGE, BOARD_WIDTH, BOARD_HEIGHT, LOOP_START } from './board.js';

const DEBUG = new URLSearchParams(location.search).has('debug');
const DEFAULT_NAMES = ['René Favaloro', 'Wundt', 'Freud', 'Darwin', 'William James', 'MacLean'];

const STORAGE_KEY = 'cerebro-en-accion-v1';
const STEP_MS = 380;
const LANDING_PAUSE_MS = 1000;
const DEAL_MS = 2500; // giro (1.25 s) + carta a la vista antes de la pregunta

let state = load() || initialState();
let ui = { rolling: false, dieFace: null, setup: null };
let squarePositions = null;
let boardSvg = null;
let stepTimer = null;

const app = document.getElementById('app');

// ---------- persistencia ----------
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    // si se guardó a mitad de un movimiento, terminamos el movimiento al cargar
    return s;
  } catch { return null; }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* sin storage */ }
}

function dispatch(action) {
  state = reduce(state, action);
  save();
  render();
}

// ---------- helpers ----------
const charOf = (id) => CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
const el = (tag, attrs = {}, ...children) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) n.setAttribute(k, '');
    else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return n;
};
const svgEl = (tag, attrs = {}, ...children) => {
  const n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return n;
};

// ---------- render raíz ----------
function render() {
  if (state.phase === PHASES.SETUP) {
    boardSvg = null;
    app.replaceChildren(renderSetup());
    return;
  }
  if (!boardSvg) {
    app.replaceChildren(renderGameShell());
    computeSquarePositions();
    drawSquares();
  }
  updateBoard();
  updateSide();
  renderModal();
  if (state.phase === PHASES.MOVE && !stepTimer) scheduleStep();
}

// ---------- setup ----------
function defaultSetup() {
  return {
    count: 3,
    players: CHARACTERS.slice(0, 6).map((c, i) => ({ name: DEFAULT_NAMES[i], character: c.id })),
    repeatedCategory: 'faithful',
    error: null,
  };
}

function renderSetup() {
  if (!ui.setup) ui.setup = defaultSetup();
  const s = ui.setup;
  const rows = s.players.slice(0, s.count);
  const taken = (idx) => rows.filter((_, i) => i !== idx).map((p) => p.character);

  const playerRows = rows.map((p, i) =>
    el('div', { class: 'player-row' },
      el('div', { class: 'num' }, i + 1),
      el('input', {
        type: 'text', value: p.name, maxlength: 18, placeholder: 'Nombre',
        onInput: (e) => { p.name = e.target.value; },
      }),
      el('div', { class: 'chars' },
        CHARACTERS.map((c) => {
          const isTaken = taken(i).includes(c.id);
          return el('button', {
            class: `char-btn ${p.character === c.id ? 'selected' : ''} ${isTaken ? 'taken' : ''}`,
            title: c.name,
            style: `background:${c.color}22`,
            onClick: () => { if (!isTaken) { p.character = c.id; render(); } },
          }, c.emoji);
        }),
      ),
    ),
  );

  return el('div', { class: 'setup' },
    el('header', {},
      el('img', { class: 'logo', src: 'assets/logo.png', alt: 'Cerebro en Acción · El juego de las emociones' }),
      el('div', { class: 'subtitle' }, 'Neurociencias · Universidad Favaloro'),
    ),
    el('div', { class: 'card-panel' },
      el('h2', {}, 'Jugadores'),
      el('div', { class: 'field' },
        el('label', {}, 'Cantidad'),
        el('select', { onChange: (e) => { s.count = Number(e.target.value); render(); } },
          [2, 3, 4, 5, 6].map((n) => el('option', { value: n, selected: n === s.count ? '' : null }, n === 2 ? '2 (solo para probar)' : n)),
        ),
        el('span', { class: 'help' }, 'El manual recomienda de 3 a 6 personas, +16 años.'),
      ),
      playerRows,
      el('p', { class: 'help' }, 'Cada jugador elige una ficha de emoción: Alegría, Tristeza, Miedo, Ira, Asco o Sorpresa.'),
    ),
    el('div', { class: 'card-panel' },
      el('h2', {}, 'Reglas'),
      el('div', { class: 'field' },
        el('label', {}, 'Casillero repetido'),
        el('select', { onChange: (e) => { s.repeatedCategory = e.target.value; } },
          el('option', { value: 'faithful', selected: s.repeatedCategory === 'faithful' ? '' : null }, 'Respondés igual, sin sumar conexión (manual)'),
          el('option', { value: 'choose', selected: s.repeatedCategory === 'choose' ? '' : null }, 'Elegís una categoría que te falte (partida corta)'),
        ),
      ),
      el('p', { class: 'help' }, 'Objetivo: completar la Red Emocional con una conexión neuronal de cada categoría: Teoría, Cerebro, Dimensión, Emoción y Desafío Neuro. La primera persona en completarla gana.'),
    ),
    s.error && el('div', { class: 'error' }, s.error),
    el('div', { class: 'actions' },
      el('button', { onClick: startGame }, '¡Comenzar la partida!'),
    ),
  );
}

function startGame() {
  const s = ui.setup;
  const players = s.players.slice(0, s.count).map((p) => ({ name: p.name.trim() || 'Sin nombre', character: p.character }));
  const chars = new Set(players.map((p) => p.character));
  if (chars.size !== players.length) { s.error = 'Cada jugador tiene que elegir una ficha distinta.'; render(); return; }
  s.error = null;
  dispatch({ type: 'START_GAME', players, options: { repeatedCategory: s.repeatedCategory } });
}

// ---------- tablero ----------
function renderGameShell() {
  boardSvg = svgEl('svg', { viewBox: `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`, role: 'img', 'aria-label': 'Tablero' });
  const img = svgEl('image', { href: BOARD_IMAGE, x: 0, y: 0, width: BOARD_WIDTH, height: BOARD_HEIGHT, preserveAspectRatio: 'xMidYMid meet' });
  boardSvg.append(img);
  boardSvg.append(svgEl('g', { id: 'squares' }));
  boardSvg.append(svgEl('g', { id: 'pieces' }));
  const boardWrap = el('div', { class: 'board-wrap' }, boardSvg);
  const side = el('div', { class: 'side', id: 'side' });
  return el('div', { class: 'game' }, boardWrap, side);
}

function computeSquarePositions() {
  squarePositions = SQUARES.map((sq) => ({ x: sq.x, y: sq.y }));
}

function drawSquares() {
  const g = boardSvg.querySelector('#squares');
  g.replaceChildren();
  SQUARES.forEach((sq, i) => {
    const points = sq.poly.map(([x, y]) => `${x},${y}`).join(' ');
    g.append(svgEl('polygon', { class: 'sq', id: `sq-${i}`, points }));
    if (DEBUG) {
      const cat = sq.category ? CATEGORIES[sq.category] : null;
      g.append(svgEl('polygon', { points, fill: 'none', stroke: '#fff', 'stroke-width': 3 }));
      g.append(svgEl('circle', { cx: sq.x, cy: sq.y, r: 6, fill: cat ? cat.color : '#000', stroke: '#fff', 'stroke-width': 2 }));
      g.append(svgEl('text', { x: sq.x, y: sq.y - 12, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#000', stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, i === LOOP_START ? `${i}*` : i));
    }
  });
}

function updateBoard() {
  // casillero activo
  boardSvg.querySelectorAll('.sq.active').forEach((r) => r.classList.remove('active'));
  const cur = state.players[state.current];
  if (cur && state.phase !== PHASES.END) {
    const r = boardSvg.querySelector(`#sq-${cur.pos}`);
    if (r) r.classList.add('active');
  }

  // fichas
  const g = boardSvg.querySelector('#pieces');
  const bySquare = {};
  state.players.forEach((p) => { (bySquare[p.pos] ||= []).push(p); });

  state.players.forEach((p) => {
    let node = g.querySelector(`#piece-${p.id}`);
    const ch = charOf(p.character);
    if (!node) {
      node = svgEl('g', { id: `piece-${p.id}`, class: 'piece' });
      node.append(svgEl('circle', { r: 19, fill: ch.color }));
      node.append(svgEl('text', {}, ch.emoji));
      node.append(svgEl('text', { class: 'pname', y: 33 }, p.name));
      g.append(node);
    }
    const group = bySquare[p.pos];
    const k = group.indexOf(p);
    const base = squarePositions[p.pos];
    let ox = 0, oy = 0;
    if (group.length > 1) {
      // varias fichas en el mismo casillero: se reparten en fila con el nombre debajo
      ox = (k - (group.length - 1) / 2) * 30;
      oy = (k % 2 === 0 ? -1 : 1) * 12;
    }
    node.style.transform = `translate(${base.x + ox}px, ${base.y + oy}px)`;
    node.classList.toggle('current', p.id === state.current && state.phase !== PHASES.END);
  });
}

function scheduleStep() {
  stepTimer = setTimeout(() => {
    stepTimer = null;
    if (state.phase !== PHASES.MOVE) return;
    const lastStep = state.stepsLeft === 1;
    if (lastStep) ui.landingPause = true; // la carta espera a que se vea dónde cayó la ficha
    dispatch({ type: 'STEP' });
    if (lastStep) {
      setTimeout(() => {
        ui.landingPause = false;
        renderModal();
      }, LANDING_PAUSE_MS);
    }
  }, STEP_MS);
}

// ---------- panel lateral ----------
function updateSide() {
  const side = document.getElementById('side');
  const cur = state.players[state.current];
  const ch = charOf(cur.character);
  const canRoll = state.phase === PHASES.ROLL && !ui.rolling;
  const face = ui.rolling ? ui.dieFace : state.die;

  const turnPanel = el('div', { class: 'panel' },
    el('h3', {}, `Ronda ${state.round}`),
    el('div', { class: 'turn' },
      el('div', { class: 'avatar', style: `background:${ch.color}` }, ch.emoji),
      el('div', {},
        el('div', { class: 'name' }, state.phase === PHASES.END ? `🏆 ${cur.name}` : `Turno de ${cur.name}`),
        el('div', { class: 'meta' }, `${ch.name} · casillero ${cur.pos}`),
      ),
    ),
    el('div', { class: 'dice-row' },
      el('div', { class: `die ${ui.rolling ? 'rolling' : ''}` }, face ? String(face) : '?'),
      el('button', { disabled: !canRoll, onClick: rollDie }, 'Tirar el dado'),
    ),
    el('div', { class: 'hint' }, phaseHint()),
  );

  const nets = el('div', { class: 'panel' },
    el('h3', {}, 'Redes emocionales'),
    el('div', { class: 'networks' },
      state.players.map((p) => {
        const c = charOf(p.character);
        return el('div', { class: `net ${p.id === state.current ? 'current' : ''}` },
          el('div', { class: 'who' }, c.emoji),
          el('div', {},
            el('div', { class: 'nm' }, p.name),
            el('div', { class: 'slots' },
              CATEGORY_ORDER.map((catId) => {
                const cat = CATEGORIES[catId];
                const filled = p.network[catId];
                return el('div', {
                  class: `slot ${filled ? 'filled' : ''}`,
                  style: `border-color:${cat.color};${filled ? `background:${cat.color}` : ''}`,
                  title: cat.short,
                }, filled ? '🧠' : '', el('span', { class: 'lbl', style: `color:${cat.color}` }, cat.short));
              }),
            ),
          ),
        );
      }),
    ),
  );

  const activeDeck = state.phase === PHASES.CARD ? state.turn.category : null;
  const decks = el('div', { class: 'panel' },
    el('h3', {}, 'Mazos'),
    el('div', { class: 'decks' },
      CATEGORY_ORDER.map((catId) => {
        const cat = CATEGORIES[catId];
        const left = (state.decks[catId] || []).length;
        return el('div', { class: `deck-mini ${activeDeck === catId ? 'active' : ''}`, id: `deck-${catId}`, style: `--cat:${cat.color}`, title: `${cat.label}: ${left} cartas` },
          el('div', { class: 'dm-stack' },
            el('div', { class: 'dm-card b3' }),
            el('div', { class: 'dm-card b2' }),
            el('div', { class: 'dm-card top' }, el('img', { src: 'assets/logo.png', alt: '' })),
          ),
          el('div', { class: 'dm-label' }, cat.short),
        );
      }),
    ),
  );

  const legend = el('div', { class: 'panel' },
    el('h3', {}, 'Categorías'),
    el('div', { class: 'slots', style: 'gap:6px' },
      CATEGORY_ORDER.map((catId) => {
        const cat = CATEGORIES[catId];
        return el('div', { class: 'slot filled', style: `background:${cat.color};border-color:${cat.color};color:${cat.text};font-size:10px;font-weight:800;height:34px;text-align:center;line-height:1.05` }, cat.label);
      }),
    ),
  );

  const log = el('div', { class: 'panel' },
    el('h3', {}, 'Registro'),
    el('ul', { class: 'log' }, state.log.slice().reverse().slice(0, 12).map((l) => el('li', {}, l.text))),
    el('div', { style: 'margin-top:8px;text-align:right' },
      el('button', { class: 'ghost', onClick: resetGame }, 'Reiniciar partida'),
    ),
  );

  side.replaceChildren(turnPanel, nets, decks, legend, log);
}

function phaseHint() {
  switch (state.phase) {
    case PHASES.ROLL: return 'Tirá el dado y avanzá la cantidad de casilleros indicada.';
    case PHASES.MOVE: return 'Avanzando...';
    case PHASES.CARD: return 'El color del casillero determina qué tipo de carta debés responder.';
    case PHASES.CHOOSE: return 'Ya tenés esa conexión: elegí una categoría pendiente.';
    case PHASES.RESULT: return 'Continuá con el siguiente jugador.';
    case PHASES.END: return 'Partida terminada.';
    default: return '';
  }
}

function rollDie() {
  if (state.phase !== PHASES.ROLL || ui.rolling) return;
  ui.rolling = true;
  let ticks = 0;
  const iv = setInterval(() => {
    ui.dieFace = 1 + Math.floor(Math.random() * 6);
    ticks++;
    updateSide();
    if (ticks >= 9) {
      clearInterval(iv);
      ui.rolling = false;
      dispatch({ type: 'ROLL_DIE' });
    }
  }, 75);
}

function resetGame() {
  if (!confirm('¿Reiniciar la partida? Se pierde el progreso actual.')) return;
  if (stepTimer) { clearTimeout(stepTimer); stepTimer = null; }
  if (ui.orderTimer) clearTimeout(ui.orderTimer);
  if (ui.dealTimer) clearTimeout(ui.dealTimer);
  ui = { rolling: false, dieFace: null, setup: null };
  dispatch({ type: 'RESET' });
}

// ---------- modales ----------
function renderModal() {
  if (state.phase === PHASES.CARD && ui.dealtCardId !== state.turn.cardId && document.querySelector('.deal')) return;
  document.querySelectorAll('.overlay').forEach((o) => o.remove());
  if (ui.landingPause) return;
  let content = null;
  switch (state.phase) {
    case PHASES.ORDER: content = modalOrder(); break;
    case PHASES.CHOOSE: content = modalChoose(); break;
    case PHASES.CARD:
      if (ui.dealtCardId !== state.turn.cardId) {
        content = modalDeal();
        break;
      }
      content = modalCard();
      break;
    case PHASES.RESULT: content = modalResult(); break;
    case PHASES.END: content = modalEnd(); break;
    default: return;
  }
  app.append(el('div', { class: 'overlay' }, content));
}

function orderEntries() {
  return state.orderRolls.flatMap((rolls, ri) => Object.entries(rolls).map(([id, v]) => ({ ri, id: Number(id), v })));
}

function modalOrder() {
  const entries = orderEntries();
  if (ui.orderReveal === undefined) {
    // arranca la animación: se revela una tirada por vez
    ui.orderReveal = 0;
    const tick = () => {
      if (state.phase !== PHASES.ORDER) return;
      ui.orderReveal += 1;
      renderModal();
      if (ui.orderReveal < entries.length) ui.orderTimer = setTimeout(tick, 650);
    };
    ui.orderTimer = setTimeout(tick, 500);
  }
  const revealed = ui.orderReveal;
  const done = revealed >= entries.length;

  const rounds = state.orderRolls.map((rolls, ri) => {
    const roundEntries = entries.filter((e) => e.ri === ri);
    const firstIdx = entries.indexOf(roundEntries[0]);
    if (revealed < firstIdx) return null; // esta ronda todavía no empezó
    return el('div', {},
      state.orderRolls.length > 1 && el('div', { class: 'subtitle', style: 'margin-top:8px' }, ri === 0 ? 'Primera tirada' : `Desempate ${ri}`),
      el('div', { class: 'order-grid' },
        roundEntries.map((e) => {
          const p = state.players[e.id];
          const idx = entries.indexOf(e);
          const isRolling = idx === revealed;
          const shown = idx < revealed;
          const isWinner = done && ri === state.orderRolls.length - 1 && e.id === state.current;
          return el('div', { class: `order-row ${isWinner ? 'win' : ''}` },
            el('div', { class: 'avatar small', style: `background:${charOf(p.character).color}` }, charOf(p.character).emoji),
            el('div', { class: 'nm' }, p.name),
            el('div', { class: `die small ${isRolling ? 'rolling' : ''}` }, shown ? e.v : isRolling ? String(1 + Math.floor(Math.random() * 6)) : '·'),
          );
        }),
      ),
    );
  });

  return el('div', { class: 'modal' },
    el('div', { class: 'head', style: 'background:var(--pink-soft)' },
      el('div', { class: 'cat', style: 'color:var(--red)' }, 'Preparación'),
      el('div', { class: 'kind' }, '¿Quién empieza?'),
    ),
    el('div', { class: 'body' },
      el('p', {}, 'Todos tiran el dado. El número más alto comienza; luego se sigue en sentido horario.'),
      rounds,
      done && el('p', { class: 'centered', style: 'margin-top:14px' }, el('b', {}, `Empieza ${state.players[state.current].name}.`)),
      el('div', { class: 'actions' },
        el('button', { disabled: !done, onClick: () => { ui.orderReveal = undefined; dispatch({ type: 'BEGIN' }); } }, '¡A jugar!'),
      ),
    ),
  );
}

function modalChoose() {
  const cur = state.players[state.current];
  return el('div', { class: 'modal' },
    el('div', { class: 'head', style: 'background:var(--pink-soft)' },
      el('div', { class: 'cat', style: 'color:var(--red)' }, 'Elegí'),
      el('div', { class: 'kind' }, 'Casillero repetido'),
    ),
    el('div', { class: 'body' },
      el('p', {}, `${cur.name}, ya tenés esa conexión. Elegí una categoría que te falte:`),
      el('div', { class: 'options' },
        state.turn.pending.map((catId) => {
          const cat = CATEGORIES[catId];
          return el('button', {
            style: `border-color:${cat.color}`,
            onClick: () => dispatch({ type: 'CHOOSE_CATEGORY', category: catId }),
          }, el('span', { class: 'k', style: `color:${cat.color}` }, '■'), `${cat.label} · ${cat.desc}`);
        }),
      ),
    ),
  );
}

// Animación: la carta sale del mazo y se da vuelta antes de mostrar la pregunta.
function modalDeal() {
  const { cardId, category } = state.turn;
  const cat = CATEGORIES[category];
  const card = CARDS_BY_ID[cardId];
  const cur = state.players[state.current];
  if (!ui.dealTimer) {
    ui.dealTimer = setTimeout(() => {
      ui.dealTimer = null;
      ui.dealtCardId = cardId;
      renderModal();
    }, DEAL_MS);
  }
  const flip = el('div', { class: 'flip' },
    el('div', { class: 'cardback face back', style: `--cat:${cat.color}` }, el('img', { src: 'assets/logo.png', alt: '' })),
    el('div', { class: 'cardback face front', style: `--cat:${cat.color}` },
      el('div', { class: 'cb-label' }, cat.label),
      el('div', { class: 'cb-type' }, TYPE_LABELS[card.type]),
    ),
  );
  const root = el('div', { class: 'deal' },
    el('div', { class: 'deck' }, flip),
    el('p', { class: 'deal-caption' }, `${cur.name} saca una carta de ${cat.label}`),
  );
  // Punto de partida: el mazo de esa categoría en el panel lateral.
  requestAnimationFrame(() => {
    const from = document.querySelector(`#deck-${category} .dm-card.top`);
    const to = flip.getBoundingClientRect();
    if (from && to.width) {
      const f = from.getBoundingClientRect();
      flip.style.setProperty('--dx', `${f.left + f.width / 2 - (to.left + to.width / 2)}px`);
      flip.style.setProperty('--dy', `${f.top + f.height / 2 - (to.top + to.height / 2)}px`);
      flip.style.setProperty('--s', `${f.width / to.width}`);
    }
    flip.classList.add('go');
  });
  return root;
}

function modalCard() {
  const { cardId, category, reader, alreadyHad, revealed } = state.turn;
  const card = CARDS_BY_ID[cardId];
  const cat = CATEGORIES[category];
  const cur = state.players[state.current];
  const readerP = state.players[reader];

  let body;
  if (card.type === 'mc') {
    body = el('div', { class: 'options' },
      card.options.map((opt, i) => el('button', { onClick: () => dispatch({ type: 'ANSWER', value: i }) },
        el('span', { class: 'k' }, 'ABCD'[i] + ')'), opt)),
    );
  } else if (card.type === 'tf') {
    body = el('div', { class: 'options' },
      el('button', { onClick: () => dispatch({ type: 'ANSWER', value: true }) }, el('span', { class: 'k' }, 'V'), 'Verdadero'),
      el('button', { onClick: () => dispatch({ type: 'ANSWER', value: false }) }, el('span', { class: 'k' }, 'F'), 'Falso'),
    );
  } else if (card.type === 'myth') {
    body = el('div', { class: 'options' },
      el('button', { onClick: () => dispatch({ type: 'ANSWER', value: 'mito' }) }, el('span', { class: 'k' }, '✕'), 'Mito'),
      el('button', { onClick: () => dispatch({ type: 'ANSWER', value: 'realidad' }) }, el('span', { class: 'k' }, '✓'), 'Realidad'),
    );
  } else if (card.type === 'fill') {
    const chosen = {};
    const submit = el('button', { disabled: true, onClick: () => dispatch({ type: 'ANSWER', value: { ...chosen } }) }, 'Responder');
    const grid = el('div', { class: 'fill-grid' },
      Object.keys(card.fields).map((field) => [
        el('label', {}, field),
        el('select', {
          onChange: (e) => {
            chosen[field] = e.target.value;
            submit.disabled = Object.keys(card.fields).some((k) => !chosen[k]);
          },
        },
          el('option', { value: '' }, '—'),
          FILL_OPTIONS[field].map((o) => el('option', { value: o }, o)),
        ),
      ]),
    );
    body = el('div', {}, grid, el('div', { class: 'actions' }, submit));
  } else {
    // pregunta abierta: responde en voz alta y juzga el jugador de la izquierda
    body = el('div', {},
      !revealed && el('p', { class: 'help' }, `${cur.name} responde en voz alta. Cuando termine, ${readerP.name} revela la respuesta.`),
      !revealed && el('div', { class: 'actions' }, el('button', { class: 'secondary', onClick: () => dispatch({ type: 'REVEAL' }) }, 'Revelar respuesta')),
      revealed && el('div', { class: 'answer-box' }, el('b', {}, 'Respuesta: '), card.answer),
      revealed && el('p', { class: 'centered help' }, `${readerP.name}: ¿la respuesta de ${cur.name} fue correcta?`),
      revealed && el('div', { class: 'judge' },
        el('button', { class: 'ok', onClick: () => dispatch({ type: 'JUDGE', correct: true }) }, '✔ Correcta'),
        el('button', { class: 'no', onClick: () => dispatch({ type: 'JUDGE', correct: false }) }, '✘ Incorrecta'),
      ),
    );
  }

  return el('div', { class: 'modal card-enter' },
    el('div', { class: 'head', style: `background:${cat.color};color:${cat.text}` },
      el('div', { class: 'cat' }, cat.label),
      el('div', { class: 'kind' }, TYPE_LABELS[card.type]),
    ),
    el('div', { class: 'body' },
      el('div', { class: 'reader' }, 'Responde ', el('b', {}, cur.name), ' · lee la carta ', el('b', {}, readerP.name)),
      alreadyHad && el('div', { class: 'notice' }, 'Ya tenés esta conexión neuronal: respondés igual, pero no sumás una nueva.'),
      card.type === 'fill'
        ? [el('p', { class: 'prompt big' }, card.prompt), el('p', { class: 'help centered' }, 'Completá las tres dimensiones de esta emoción.')]
        : el('p', { class: 'prompt' }, card.prompt),
      body,
    ),
  );
}

function modalResult() {
  const t = state.turn;
  const cur = state.players[state.current];
  const cat = t.category ? CATEGORIES[t.category] : null;
  const card = t.cardId ? CARDS_BY_ID[t.cardId] : null;

  let banner, detail;
  if (t.skipped) {
    banner = el('div', { class: 'result-banner neutral' }, 'Casillero de inicio');
    detail = el('p', { class: 'centered' }, `${cur.name} descansa este turno.`);
  } else if (t.correct) {
    banner = el('div', { class: 'result-banner ok' }, '¡Correcto!');
    detail = t.gained
      ? el('p', { class: 'gain' }, `🧠 ${cur.name} gana una conexión neuronal de `, el('span', { style: `color:${cat.color}` }, cat.short), '.')
      : el('p', { class: 'gain' }, 'Bien respondido, pero esa conexión ya estaba en tu red.');
  } else {
    banner = el('div', { class: 'result-banner no' }, 'Incorrecto');
    detail = el('p', { class: 'gain' }, 'No obtenés la conexión y termina tu turno.');
  }

  let explanation = null;
  if (card) {
    if (card.type === 'mc') explanation = `Respuesta: ${'ABCD'[card.answer]}) ${card.options[card.answer]}. ${card.explanation || ''}`;
    else if (card.type === 'tf') explanation = `${card.answer ? 'Verdadero' : 'Falso'}. ${card.explanation || ''}`;
    else if (card.type === 'myth') explanation = `${card.answer === 'mito' ? 'Mito' : 'Realidad'}. ${card.explanation || ''}`;
    else if (card.type === 'fill') explanation = `Valencia ${card.fields.valencia} · arousal ${card.fields.arousal} · dominancia ${card.fields.dominancia}. ${card.explanation || ''}`;
    else explanation = card.answer;
  }

  return el('div', { class: 'modal' },
    el('div', { class: 'head', style: cat ? `background:${cat.color};color:${cat.text}` : 'background:var(--pink-soft)' },
      el('div', { class: 'cat' }, cat ? cat.label : 'Inicio'),
      el('div', { class: 'kind' }, cur.name),
    ),
    el('div', { class: 'body' },
      banner,
      detail,
      explanation && el('div', { class: 'answer-box' }, explanation),
      el('div', { class: 'actions' }, el('button', { onClick: () => dispatch({ type: 'CONTINUE' }) }, 'Continuar')),
    ),
  );
}

function modalEnd() {
  const w = state.players[state.winner];
  const ch = charOf(w.character);
  return el('div', { class: 'modal' },
    el('div', { class: 'head', style: 'background:var(--red);color:#fff' },
      el('div', { class: 'cat' }, '¡Ganador!'),
      el('div', { class: 'kind' }, `Ronda ${state.round}`),
    ),
    el('div', { class: 'body' },
      el('div', { class: 'winner-big' }, ch.emoji),
      el('p', { class: 'centered' }, el('b', { style: 'font-size:22px' }, w.name), ' completó su Red Emocional.'),
      el('div', { class: 'actions' },
        el('button', { onClick: () => { ui.setup = null; dispatch({ type: 'RESET' }); } }, 'Nueva partida'),
      ),
    ),
  );
}

// Atajo de desarrollo: index.html?quick arranca una partida de prueba de 3 jugadores.
if (state.phase === PHASES.SETUP && new URLSearchParams(location.search).has('quick')) {
  state = reduce(state, { type: 'START_GAME', players: [
    { name: 'Feli', character: 'alegria' }, { name: 'Ana', character: 'ira' }, { name: 'Ale', character: 'miedo' },
  ] });
  if (new URLSearchParams(location.search).get('quick') !== 'order') state = reduce(state, { type: 'BEGIN' });
  if (new URLSearchParams(location.search).get('quick') === 'card') {
    // avanza hasta caer en un casillero con carta
    do {
      state = reduce(state, { type: 'ROLL_DIE' });
      while (state.phase === PHASES.MOVE) state = reduce(state, { type: 'STEP' });
      if (state.phase === PHASES.RESULT) state = reduce(state, { type: 'CONTINUE' });
    } while (state.phase !== PHASES.CARD && state.phase !== PHASES.CHOOSE);
  }
  save();
}


render();
