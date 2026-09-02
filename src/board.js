// Tablero: la ilustración original (assets/tablero.png, 1120x792) es el fondo.
// Acá solo se definen las coordenadas de cada casillero sobre esa imagen y el recorrido.
//
// Recorrido: desde INICIO (0) se sale por el arco exterior (hacia la izquierda y arriba),
// se baja por la derecha y se entra al bucle central. El bucle (lado derecho, base y rulo
// interior) se recorre para siempre: el último casillero vuelve a LOOP_START, no a INICIO.

export const BOARD_IMAGE = 'assets/tablero.png';
export const BOARD_WIDTH = 1120;
export const BOARD_HEIGHT = 792;

// [categoría, x, y]
const RAW = [
  [null, 320, 478],          // 0 INICIO
  // arco exterior (se pasa una sola vez)
  ['cerebro', 212, 428],     // 1
  ['desafio', 172, 388],     // 2
  ['teoria', 158, 343],      // 3
  ['emocion', 158, 296],     // 4
  ['teoria', 188, 243],      // 5
  ['teoria', 240, 192],      // 6
  ['cerebro', 300, 152],     // 7
  ['dimension', 365, 125],   // 8
  ['desafio', 450, 117],     // 9
  ['teoria', 540, 118],      // 10
  ['cerebro', 622, 140],     // 11
  ['emocion', 700, 165],     // 12
  ['dimension', 765, 210],   // 13
  ['teoria', 800, 268],      // 14
  // bucle: lado derecho
  ['emocion', 742, 342],     // 15  <- LOOP_START (acá confluye el rulo interior)
  ['desafio', 822, 362],     // 16
  ['cerebro', 905, 388],     // 17
  ['emocion', 965, 442],     // 18
  ['dimension', 958, 500],   // 19
  // bucle: base
  ['teoria', 855, 555],      // 20
  ['desafio', 740, 530],     // 21
  ['cerebro', 665, 540],     // 22
  ['emocion', 588, 558],     // 23
  ['cerebro', 515, 590],     // 24
  ['desafio', 450, 600],     // 25
  ['teoria', 410, 565],      // 26
  // bucle: rulo interior
  ['dimension', 445, 480],   // 27
  ['emocion', 398, 430],     // 28
  ['teoria', 330, 395],      // 29
  ['dimension', 345, 330],   // 30
  ['emocion', 400, 285],     // 31
  ['cerebro', 470, 265],     // 32
  ['dimension', 535, 265],   // 33
  ['desafio', 600, 275],     // 34
  ['cerebro', 660, 330],     // 35  -> vuelve a 15
];

export const LOOP_START = 15;

export const SQUARES = RAW.map(([category, x, y], index) => ({ index, category, x, y, label: category ? null : 'INICIO' }));
export const SQUARE_COUNT = SQUARES.length;

export function nextIndex(pos) {
  return pos + 1 < SQUARE_COUNT ? pos + 1 : LOOP_START;
}

export const CHARACTERS = [
  { id: 'alegria',  name: 'Alegría',  emoji: '😄', color: '#f5c518' },
  { id: 'tristeza', name: 'Tristeza', emoji: '😢', color: '#4a90e2' },
  { id: 'miedo',    name: 'Miedo',    emoji: '😨', color: '#9b59b6' },
  { id: 'ira',      name: 'Ira',      emoji: '😡', color: '#e74c3c' },
  { id: 'asco',     name: 'Asco',     emoji: '🤢', color: '#27ae60' },
  { id: 'sorpresa', name: 'Sorpresa', emoji: '😲', color: '#f39c12' },
];
