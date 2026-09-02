// Motor del juego: un reducer puro `reduce(state, action, rng)`.
// No toca el DOM. Está pensado para poder correr igual en un servidor
// cuando el juego pase a ser online (el servidor sería la autoridad).

import { DECKS, CARDS_BY_ID, CATEGORY_ORDER, CATEGORIES } from './cards.js';

const label = (c) => CATEGORIES[c].short;
import { SQUARES, nextIndex } from './board.js';

export const PHASES = {
  SETUP: 'setup',           // pantalla de configuración
  ORDER: 'order',           // se tiró el dado para ver quién empieza
  ROLL: 'roll',             // el jugador actual debe tirar el dado
  MOVE: 'move',             // la ficha se está moviendo
  CHOOSE: 'choose',         // casillero repetido: elegir categoría pendiente
  CARD: 'card',             // carta en pantalla, esperando respuesta
  RESULT: 'result',         // se mostró si fue correcta o no
  END: 'end',               // hay ganador
};

const DEFAULT_OPTIONS = {
  // Qué pasa al caer en una categoría que el jugador ya completó:
  //   'faithful' -> responde igual, pero no gana conexión (regla del manual)
  //   'choose'   -> elige una categoría pendiente (variante para partidas más cortas)
  repeatedCategory: 'faithful',
};

export function initialState() {
  return {
    phase: PHASES.SETUP,
    options: { ...DEFAULT_OPTIONS },
    players: [],
    current: 0,
    orderRolls: null,
    die: null,
    stepsLeft: 0,
    turn: null,
    decks: {},
    discards: {},
    winner: null,
    log: [],
    round: 1,
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rollDie(rng) {
  return 1 + Math.floor(rng() * 6);
}

function addLog(state, text) {
  return { ...state, log: [...state.log.slice(-49), { t: state.log.length, text }] };
}

function emptyNetwork() {
  return Object.fromEntries(CATEGORY_ORDER.map((c) => [c, false]));
}

function isNetworkComplete(network) {
  return CATEGORY_ORDER.every((c) => network[c]);
}

function drawCard(state, category, rng) {
  let deck = state.decks[category];
  let discards = state.discards[category];
  if (deck.length === 0) {
    deck = shuffle(discards, rng);
    discards = [];
  }
  const [cardId, ...rest] = deck;
  return {
    cardId,
    decks: { ...state.decks, [category]: rest },
    discards: { ...state.discards, [category]: [...discards, cardId] },
  };
}

// Evalúa una respuesta de tipo automático. Devuelve true/false.
export function checkAnswer(card, value) {
  switch (card.type) {
    case 'mc':
      return Number(value) === card.answer;
    case 'tf':
      return (value === true || value === 'true') === card.answer;
    case 'myth':
      return value === card.answer;
    case 'fill':
      return Object.keys(card.fields).every((k) => value && value[k] === card.fields[k]);
    default:
      return false;
  }
}

export function isAutoCard(card) {
  return card.type !== 'open';
}

function landOn(state, rng) {
  const player = state.players[state.current];
  const square = SQUARES[player.pos];

  if (!square.category) {
    const s = addLog(state, `${player.name} cae en INICIO y descansa este turno.`);
    return { ...s, phase: PHASES.RESULT, turn: { ...state.turn, square, cardId: null, correct: null, skipped: true } };
  }

  const alreadyHad = player.network[square.category];
  if (alreadyHad && state.options.repeatedCategory === 'choose') {
    const pending = CATEGORY_ORDER.filter((c) => !player.network[c]);
    return {
      ...addLog(state, `${player.name} ya tiene la conexión de ${label(square.category)}: elige otra categoría.`),
      phase: PHASES.CHOOSE,
      turn: { ...state.turn, square, pending },
    };
  }
  return dealCard(state, square.category, alreadyHad, rng);
}

function dealCard(state, category, alreadyHad, rng) {
  const player = state.players[state.current];
  const { cardId, decks, discards } = drawCard(state, category, rng);
  const reader = (state.current + 1) % state.players.length;
  return {
    ...state,
    decks,
    discards,
    phase: PHASES.CARD,
    turn: {
      ...state.turn,
      category,
      cardId,
      reader,
      alreadyHad,
      revealed: false,
      answer: null,
      correct: null,
    },
    log: addLog(state, `${player.name} saca una carta de ${CATEGORIES[category].label}.`).log,
  };
}

function resolveAnswer(state, correct) {
  const player = state.players[state.current];
  const { category, alreadyHad } = state.turn;
  let s = state;
  let gained = false;
  if (correct && !alreadyHad) {
    gained = true;
    const players = s.players.map((p, i) =>
      i === s.current ? { ...p, network: { ...p.network, [category]: true } } : p,
    );
    s = { ...s, players };
    s = addLog(s, `${player.name} responde bien y gana la conexión de ${label(category)}.`);
  } else if (correct) {
    s = addLog(s, `${player.name} responde bien, pero ya tenía esa conexión.`);
  } else {
    s = addLog(s, `${player.name} responde mal. No gana conexión.`);
  }
  return { ...s, phase: PHASES.RESULT, turn: { ...s.turn, correct, gained } };
}

function nextTurn(state) {
  const player = state.players[state.current];
  if (isNetworkComplete(player.network)) {
    return {
      ...addLog(state, `🏆 ${player.name} completó su Red Emocional y gana la partida.`),
      phase: PHASES.END,
      winner: state.current,
      turn: null,
    };
  }
  const next = (state.current + 1) % state.players.length;
  const round = next === state.starter ? state.round + 1 : state.round;
  return { ...state, current: next, round, phase: PHASES.ROLL, die: null, turn: null };
}

export function reduce(state, action, rng = Math.random) {
  switch (action.type) {
    case 'START_GAME': {
      const { players, options } = action;
      if (players.length < 2 || players.length > 6) throw new Error('El juego es para 3 a 6 jugadores (mínimo 2 para probar).');
      const decks = Object.fromEntries(
        Object.entries(DECKS).map(([cat, cards]) => [cat, shuffle(cards.map((c) => c.id), rng)]),
      );
      const discards = Object.fromEntries(Object.keys(DECKS).map((c) => [c, []]));
      const base = {
        ...initialState(),
        options: { ...DEFAULT_OPTIONS, ...(options || {}) },
        players: players.map((p, i) => ({
          id: i,
          name: p.name,
          character: p.character,
          pos: 0,
          network: emptyNetwork(),
        })),
        decks,
        discards,
      };
      // Todos tiran el dado; el más alto empieza. Los empates se vuelven a tirar entre los empatados.
      let candidates = base.players.map((p) => p.id);
      const rounds = [];
      let winner = null;
      while (winner === null) {
        const rolls = Object.fromEntries(candidates.map((id) => [id, rollDie(rng)]));
        rounds.push(rolls);
        const max = Math.max(...Object.values(rolls));
        const tied = candidates.filter((id) => rolls[id] === max);
        if (tied.length === 1) winner = tied[0];
        else candidates = tied;
      }
      const s = {
        ...base,
        phase: PHASES.ORDER,
        orderRolls: rounds,
        current: winner,
        starter: winner,
      };
      return addLog(s, `${base.players[winner].name} saca el número más alto y comienza.`);
    }

    case 'BEGIN': {
      if (state.phase !== PHASES.ORDER) return state;
      return { ...state, phase: PHASES.ROLL };
    }

    case 'ROLL_DIE': {
      if (state.phase !== PHASES.ROLL) return state;
      const die = rollDie(rng);
      const player = state.players[state.current];
      return {
        ...addLog(state, `${player.name} tira el dado: ${die}.`),
        die,
        stepsLeft: die,
        phase: PHASES.MOVE,
        turn: { from: player.pos },
      };
    }

    case 'STEP': {
      if (state.phase !== PHASES.MOVE) return state;
      const players = state.players.map((p, i) =>
        i === state.current ? { ...p, pos: nextIndex(p.pos) } : p,
      );
      const stepsLeft = state.stepsLeft - 1;
      const s = { ...state, players, stepsLeft };
      return stepsLeft > 0 ? s : landOn(s, rng);
    }

    case 'CHOOSE_CATEGORY': {
      if (state.phase !== PHASES.CHOOSE) return state;
      if (!state.turn.pending.includes(action.category)) return state;
      return dealCard(state, action.category, false, rng);
    }

    case 'ANSWER': {
      if (state.phase !== PHASES.CARD) return state;
      const card = CARDS_BY_ID[state.turn.cardId];
      if (!isAutoCard(card)) return state;
      const correct = checkAnswer(card, action.value);
      return resolveAnswer({ ...state, turn: { ...state.turn, answer: action.value } }, correct);
    }

    case 'REVEAL': {
      if (state.phase !== PHASES.CARD) return state;
      return { ...state, turn: { ...state.turn, revealed: true } };
    }

    case 'JUDGE': {
      if (state.phase !== PHASES.CARD) return state;
      const card = CARDS_BY_ID[state.turn.cardId];
      if (isAutoCard(card) || !state.turn.revealed) return state;
      return resolveAnswer(state, Boolean(action.correct));
    }

    case 'CONTINUE': {
      if (state.phase !== PHASES.RESULT) return state;
      return nextTurn(state);
    }

    case 'RESET':
      return initialState();

    default:
      return state;
  }
}

export { isNetworkComplete };
