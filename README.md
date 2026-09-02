# Cerebro en Acción · El juego de las emociones

Prototipo local del juego de mesa educativo (Neurociencias, Universidad Favaloro).
Se juega en una sola pantalla, pasando el turno entre jugadores (modo *hot-seat*).

## Cómo correrlo

No hay build ni dependencias. Solo hace falta servir la carpeta por HTTP
(los módulos ES no cargan desde `file://`):

```bash
cd neuro-game
python3 -m http.server 8080
```

Después abrí <http://localhost:8080>.

## Reglas implementadas

- 3 a 6 jugadores (se permite 2 para probar). Cada uno elige una ficha de emoción.
- Todos tiran el dado; el más alto empieza y se sigue en orden.
- El tablero es la ilustración original (`assets/tablero.png`): INICIO más 34 casilleros. Desde INICIO
  se sale por el arco exterior y, al llegar al bucle central, se queda girando ahí (no se vuelve a
  pasar por INICIO).
- Al empezar, todos tiran el dado con una animación; el más alto comienza (desempates incluidos).
- Tirás el dado, avanzás, y el color del casillero determina la carta:
  Teorías (violeta), Cerebro (azul), Dimensiones (verde), Emociones (amarillo), Desafío Neuro (rojo).
- Las cartas de opción múltiple, verdadero/falso, mito/realidad y "completar dimensiones"
  se corrigen solas. Las preguntas abiertas se responden en voz alta y las juzga
  el jugador de la izquierda (quien "lee la carta").
- Cada respuesta correcta da una conexión neuronal para esa categoría de la Red Emocional.
- Gana quien completa las cinco categorías.
- Opción configurable: qué pasa al caer en una categoría ya completa
  (regla del manual: respondés sin sumar; variante corta: elegís una pendiente).
- La partida se guarda en `localStorage`, así que sobrevive a un refresh.

## Estructura

```
index.html      punto de entrada
styles.css      estilos
src/cards.js    mazos de cartas (contenido editable)
src/board.js    coordenadas de los casilleros sobre la imagen, bucle y fichas
assets/         ilustración del tablero
src/engine.js   reglas: reducer puro `reduce(state, action, rng)`
src/app.js      interfaz (DOM + SVG), despacha acciones al motor
```

`engine.js` no toca el DOM: el mismo reducer puede correr en un servidor
como autoridad de la partida cuando el juego pase a ser online.

## Editar cartas

Agregá objetos en `src/cards.js`. Tipos: `mc`, `tf`, `myth`, `fill`, `open`.

## Atajos de desarrollo

- `index.html?quick` arranca una partida de prueba de 3 jugadores.
- `index.html?quick=card` además avanza hasta abrir la primera carta.
- `index.html?quick&debug` muestra el número y la categoría de cada casillero sobre el tablero,
  útil para ajustar coordenadas en `src/board.js`.

## Publicar en GitHub Pages

El sitio es estático, así que GitHub Pages lo sirve tal cual. En el repo:
Settings → Pages → Source: "Deploy from a branch" → Branch `main`, carpeta `/ (root)` → Save.
Queda en `https://aveltri.github.io/tp-neuro-juego-de-mesa/`.

## Próximo paso: versión online

El motor ya es un reducer puro y determinista (recibe el `rng`). Para jugar online:
servidor con WebSockets que guarde el `state` por sala, reciba acciones de cada
cliente, valide que vengan del jugador en turno (o del "lector" para juzgar
preguntas abiertas) y reenvíe el nuevo estado a todos.

## Detección de casilleros

Los polígonos de `src/board.js` se obtuvieron segmentando la imagen por color (violeta, azul, verde,
amarillo, rojo) con NumPy/SciPy: componentes conexas, filtro por área y envolvente convexa. Si se
cambia la ilustración hay que regenerarlos; `index.html?quick&debug` dibuja los polígonos y su
número sobre el tablero para verificar.
