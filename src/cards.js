// Mazos de cartas de "Cerebro en Acción".
// Tipos de carta:
//   mc    -> opción múltiple           { prompt, options[], answer: índice, explanation }
//   tf    -> verdadero o falso         { prompt, answer: true|false, explanation }
//   myth  -> mito o realidad           { prompt, answer: 'mito'|'realidad', explanation }
//   fill  -> completar dimensiones     { prompt, fields: {valencia, arousal, dominancia}, explanation }
//   open  -> pregunta abierta          { prompt, answer } (la juzga el jugador de la izquierda)

export const CATEGORIES = {
  teoria:    { id: 'teoria',    label: 'Teorías',      short: 'Teoría',    color: '#a34fd6', text: '#fff', desc: 'Teorías y conceptos' },
  cerebro:   { id: 'cerebro',   label: 'Cerebro',      short: 'Cerebro',   color: '#3b7dd8', text: '#fff', desc: 'Estructuras cerebrales' },
  dimension: { id: 'dimension', label: 'Dimensiones',  short: 'Dimensión', color: '#5aae3a', text: '#fff', desc: 'Dimensiones de la emoción' },
  emocion:   { id: 'emocion',   label: 'Emociones',    short: 'Emoción',   color: '#f2b422', text: '#3a2a00', desc: 'Emociones básicas' },
  desafio:   { id: 'desafio',   label: 'Desafío Neuro', short: 'Desafío',  color: '#e04b3c', text: '#fff', desc: 'Integración y aplicación' },
};

export const CATEGORY_ORDER = ['teoria', 'cerebro', 'dimension', 'emocion', 'desafio'];

export const FILL_OPTIONS = {
  valencia:   ['positiva', 'negativa', 'neutral'],
  arousal:    ['alto', 'bajo'],
  dominancia: ['alta', 'baja'],
};

export const TYPE_LABELS = {
  mc: 'Opción múltiple',
  tf: 'Verdadero o falso',
  myth: 'Mito o realidad',
  fill: 'Completar',
  open: 'Pregunta',
};

const teoria = [
  {
    type: 'myth',
    prompt: '¿Las emociones se sienten con el corazón?',
    answer: 'mito',
    explanation: 'El cuerpo participa de verdad: el corazón se acelera, el estómago se cierra, etc., pero la emoción se procesa en el cerebro.',
  },
  {
    type: 'mc',
    prompt: '¿Quién propuso el concepto de sistema límbico?',
    options: ['Charles Darwin', 'Paul MacLean', 'William James', 'Walter Cannon'],
    answer: 1,
    explanation: 'Paul MacLean, en 1949, describió el "cerebro visceral" que luego llamó sistema límbico.',
  },
  {
    type: 'mc',
    prompt: '¿Qué autor escribió un texto titulado "¿Qué es una emoción?"?',
    options: ['Charles Darwin', 'Paul MacLean', 'William James', 'Walter Cannon'],
    answer: 2,
    explanation: 'William James, en 1884. Propuso que la emoción es la percepción de los cambios corporales.',
  },
  {
    type: 'tf',
    prompt: '"El circuito de Papez fue la primera propuesta de un circuito cerebral dedicado a las emociones."',
    answer: true,
    explanation: 'Papez lo describió en 1937 y fue la primera teoría de un circuito neural central para las emociones.',
  },
  {
    type: 'open',
    prompt: 'Según Darwin, una persona de una cultura desconocida mira la cara de otra y entiende que siente asco, sin que nadie se lo explique. ¿Por qué puede hacerlo?',
    answer: 'Porque las emociones básicas tienen señales faciales distintivas que son universales, comunes a todas las culturas del mundo (y con valor adaptativo, heredado evolutivamente).',
  },
  {
    type: 'mc',
    prompt: '¿Qué estructura recibe primero la información en el modelo de Cannon-Bard, antes de que se disparen en paralelo la emoción y la reacción del cuerpo?',
    options: ['La amígdala', 'El tálamo e hipotálamo', 'El hipocampo', 'La corteza prefrontal'],
    answer: 1,
    explanation: 'El tálamo, junto con el hipotálamo, distribuye la señal en simultáneo a la corteza (experiencia) y al cuerpo (reacción).',
  },
  {
    type: 'tf',
    prompt: '"Una emoción y un estado de ánimo son lo mismo."',
    answer: false,
    explanation: 'Las emociones son episodios breves de cambios coordinados en varios sistemas del cuerpo ante un evento importante. Los estados de ánimo son más prolongados y difusos.',
  },
  {
    type: 'tf',
    prompt: '"Según la teoría central de Cannon-Bard, la emoción y la reacción del cuerpo ocurren al mismo tiempo."',
    answer: true,
    explanation: 'El estímulo llega al tálamo y desde ahí se disparan en paralelo la experiencia emocional y la respuesta corporal. Ninguna causa la otra.',
  },
  {
    type: 'mc',
    prompt: '"No lloro porque estoy triste: estoy triste porque lloro." ¿A qué teoría corresponde esta frase?',
    options: ['Cannon-Bard', 'William James', 'Circuito de Papez', 'Sistema límbico de MacLean'],
    answer: 1,
    explanation: 'Para James (teoría periférica), primero ocurre la respuesta corporal y la emoción es la percepción de esos cambios.',
  },
  {
    type: 'mc',
    prompt: '¿Cuál de estas estructuras NO forma parte del circuito de Papez original?',
    options: ['Hipocampo', 'Cuerpos mamilares', 'Amígdala', 'Giro cingulado'],
    answer: 2,
    explanation: 'El circuito de Papez incluye hipocampo, fórnix, cuerpos mamilares, tálamo anterior y giro cingulado. La amígdala fue incorporada después por MacLean.',
  },
  {
    type: 'myth',
    prompt: '¿Las expresiones faciales de las emociones básicas son universales?',
    answer: 'realidad',
    explanation: 'Darwin lo propuso en 1872 y estudios transculturales posteriores (Ekman) lo confirmaron: las emociones básicas se expresan y reconocen en todas las culturas.',
  },
  {
    type: 'mc',
    prompt: 'En el modelo del "cerebro triuno" de MacLean, ¿qué nivel se asocia con las emociones?',
    options: ['El complejo reptiliano', 'El sistema límbico (paleomamífero)', 'El neocórtex', 'El cerebelo'],
    answer: 1,
    explanation: 'MacLean ubicó las emociones en el cerebro paleomamífero o sistema límbico, entre el complejo reptiliano (instintos) y el neocórtex (razonamiento).',
  },
  {
    type: 'open',
    prompt: 'Explicá cuál es la principal crítica de Cannon a la teoría de William James.',
    answer: 'Cannon señaló que las respuestas corporales (viscerales) son demasiado lentas, poco específicas e iguales para distintas emociones como para explicar por sí solas la experiencia emocional; además, separar el cuerpo del cerebro (por ejemplo seccionando la médula) no elimina la emoción.',
  },
];

const cerebro = [
  {
    type: 'mc',
    prompt: '¿Qué estructura es clave para detectar amenazas y procesar el miedo?',
    options: ['Amígdala', 'Ínsula', 'Estriado ventral', 'Corteza cingulada anterior'],
    answer: 0,
    explanation: 'La amígdala, en el lóbulo temporal medial, evalúa la relevancia emocional de los estímulos y coordina la respuesta de miedo.',
  },
  {
    type: 'mc',
    prompt: '¿Qué estructura se asocia especialmente al asco y a la interocepción (percibir el estado interno del cuerpo)?',
    options: ['Amígdala', 'Ínsula', 'Hipocampo', 'Corteza prefrontal'],
    answer: 1,
    explanation: 'La ínsula integra las señales viscerales del cuerpo y se activa fuertemente al sentir o reconocer asco.',
  },
  {
    type: 'mc',
    prompt: '¿Qué región permite regular las emociones e inhibir respuestas impulsivas (control "de arriba hacia abajo" sobre la amígdala)?',
    options: ['Estriado ventral', 'Ínsula', 'Corteza prefrontal', 'Tálamo'],
    answer: 2,
    explanation: 'La corteza prefrontal (sobre todo la ventromedial y orbitofrontal) modula la actividad de la amígdala y participa en la toma de decisiones.',
  },
  {
    type: 'mc',
    prompt: '¿Qué estructura forma parte del sistema de recompensa y se activa ante el placer y la anticipación de una recompensa?',
    options: ['Corteza cingulada anterior', 'Estriado ventral (núcleo accumbens)', 'Amígdala', 'Ínsula'],
    answer: 1,
    explanation: 'El estriado ventral, con el núcleo accumbens, recibe dopamina del área tegmental ventral y codifica recompensa y motivación.',
  },
  {
    type: 'mc',
    prompt: '¿Qué estructura monitorea conflictos, participa en la motivación y se activa ante el "dolor social" del rechazo?',
    options: ['Corteza cingulada anterior', 'Hipocampo', 'Estriado ventral', 'Cuerpos mamilares'],
    answer: 0,
    explanation: 'La corteza cingulada anterior se activa tanto con el dolor físico como con el rechazo social, y monitorea errores y conflictos.',
  },
  {
    type: 'tf',
    prompt: '"El hemisferio derecho tiene un rol predominante en el procesamiento y la expresión de las emociones."',
    answer: true,
    explanation: 'Es la hipótesis del hemisferio derecho: lesiones derechas afectan el reconocimiento de expresiones faciales y de la prosodia emocional.',
  },
  {
    type: 'open',
    prompt: 'Una paciente con una lesión bilateral de la amígdala reconoce caras alegres o tristes, pero no logra identificar caras de miedo y no siente temor ante situaciones peligrosas. ¿Qué explica este cuadro?',
    answer: 'La amígdala es necesaria para reconocer expresiones de miedo y para generar la respuesta de miedo. Sin amígdala (como la paciente S.M. con enfermedad de Urbach-Wiethe) se pierde selectivamente el procesamiento del miedo.',
  },
  {
    type: 'open',
    prompt: 'Phineas Gage sobrevivió a que una barra de hierro le atravesara el cráneo, pero después se volvió impulsivo, irritable y con malas decisiones. ¿Qué región se lesionó y por qué cambió su conducta?',
    answer: 'La corteza prefrontal (ventromedial / orbitofrontal). Esa región regula las emociones, inhibe impulsos e integra la emoción en la toma de decisiones; al dañarse, la conducta social y emocional se desorganiza.',
  },
  {
    type: 'tf',
    prompt: '"La amígdala se ubica en el lóbulo occipital."',
    answer: false,
    explanation: 'La amígdala está en la parte medial del lóbulo temporal, por delante del hipocampo.',
  },
  {
    type: 'mc',
    prompt: 'Según la hipótesis de la valencia, ¿cómo se reparten las emociones entre los hemisferios?',
    options: [
      'Izquierdo: emociones positivas / de aproximación. Derecho: negativas / de evitación.',
      'Izquierdo: emociones negativas. Derecho: emociones positivas.',
      'Ambos hemisferios procesan todas las emociones por igual.',
      'Solo el hemisferio izquierdo procesa emociones.',
    ],
    answer: 0,
    explanation: 'La hipótesis de la valencia asocia el hemisferio izquierdo con emociones positivas (aproximación) y el derecho con negativas (evitación).',
  },
  {
    type: 'open',
    prompt: 'Escuchás un ruido fuerte y saltás del susto antes de darte cuenta de qué fue. ¿Qué vías explican que el cuerpo reaccione antes de "entender"?',
    answer: 'La vía rápida (tálamo → amígdala) dispara la respuesta de alarma en milisegundos, y la vía lenta (tálamo → corteza → amígdala) evalúa después el estímulo con más detalle (modelo de LeDoux del camino corto y el camino largo).',
  },
  {
    type: 'mc',
    prompt: 'Un paciente con enfermedad de Huntington tiene dificultades específicas para reconocer expresiones faciales de asco. ¿Qué estructuras están comprometidas?',
    options: ['Amígdala e hipocampo', 'Ínsula y ganglios basales', 'Corteza prefrontal y tálamo', 'Cerebelo y tronco'],
    answer: 1,
    explanation: 'El asco depende de la ínsula y los ganglios basales, que se degeneran en la enfermedad de Huntington.',
  },
  {
    type: 'myth',
    prompt: '¿Las emociones dependen únicamente del sistema límbico, sin participación de la corteza?',
    answer: 'mito',
    explanation: 'La corteza prefrontal, la ínsula y la cingulada anterior son corticales y participan en generar, sentir y regular las emociones.',
  },
];

const emocion = [
  {
    type: 'mc',
    prompt: '¿Cuál de estas NO es una de las seis emociones básicas?',
    options: ['Asco', 'Sorpresa', 'Vergüenza', 'Ira'],
    answer: 2,
    explanation: 'Las seis básicas son alegría, tristeza, sorpresa, miedo, asco e ira. La vergüenza es una emoción secundaria o autoconsciente.',
  },
  {
    type: 'mc',
    prompt: 'En la rueda de Plutchik, ¿qué emoción surge de combinar MIEDO + SORPRESA?',
    options: ['Alarma', 'Amor', 'Deleite', 'Optimismo'],
    answer: 0,
    explanation: 'Miedo + sorpresa = alarma (o temor sobresaltado).',
  },
  {
    type: 'mc',
    prompt: 'En la rueda de Plutchik, ¿qué emoción surge de combinar ALEGRÍA + CONFIANZA?',
    options: ['Deleite', 'Amor', 'Optimismo', 'Alarma'],
    answer: 1,
    explanation: 'Alegría + confianza = amor.',
  },
  {
    type: 'mc',
    prompt: 'En la rueda de Plutchik, ¿qué emoción surge de combinar ALEGRÍA + SORPRESA?',
    options: ['Amor', 'Optimismo', 'Deleite', 'Alarma'],
    answer: 2,
    explanation: 'Alegría + sorpresa = deleite.',
  },
  {
    type: 'mc',
    prompt: 'En la rueda de Plutchik, ¿qué emoción surge de combinar ANTICIPACIÓN + ALEGRÍA?',
    options: ['Optimismo', 'Deleite', 'Amor', 'Alarma'],
    answer: 0,
    explanation: 'Anticipación + alegría = optimismo.',
  },
  {
    type: 'open',
    prompt: 'Abrís la heladera, sentís un olor muy fuerte, arrugás la nariz, cerrás la boca y te alejás con náuseas. ¿Qué emoción es y cuál es su función adaptativa?',
    answer: 'Asco. Su función es proteger al organismo evitando la contaminación: alejarse de alimentos o sustancias potencialmente dañinas.',
  },
  {
    type: 'open',
    prompt: 'Alguien se cuela en la fila delante tuyo. Sentís calor en la cara, apretás los puños y la mandíbula. ¿Qué emoción es y para qué sirve?',
    answer: 'Ira. Prepara al organismo para enfrentar un obstáculo o una injusticia y defender los propios recursos o límites (activación para la lucha).',
  },
  {
    type: 'tf',
    prompt: '"La sorpresa es la emoción básica de más corta duración."',
    answer: true,
    explanation: 'La sorpresa dura apenas un instante y rápidamente se transforma en otra emoción (alegría, miedo, etc.) según la evaluación del estímulo.',
  },
  {
    type: 'open',
    prompt: 'Después de una pérdida importante, una persona llora, se retrae, tiene poca energía y busca compañía. ¿Qué emoción es y cuál es su función?',
    answer: 'Tristeza. Permite procesar la pérdida, reducir la actividad para recuperarse y comunicar a los demás la necesidad de apoyo social.',
  },
  {
    type: 'open',
    prompt: 'Caminás de noche, escuchás pasos detrás tuyo, el corazón se acelera y te quedás inmóvil. ¿Qué emoción es y qué función cumple?',
    answer: 'Miedo. Prepara al organismo ante una amenaza: activa la respuesta de lucha, huida o congelamiento para sobrevivir.',
  },
  {
    type: 'myth',
    prompt: '¿Las emociones "negativas" (miedo, ira, tristeza, asco) no tienen ninguna utilidad?',
    answer: 'mito',
    explanation: 'Todas las emociones básicas son adaptativas: el miedo protege, la ira defiende, la tristeza favorece la recuperación y el apoyo, el asco evita la contaminación.',
  },
  {
    type: 'mc',
    prompt: 'Una emoción tiene un componente fisiológico, uno expresivo/conductual y uno... ¿cuál falta?',
    options: ['Subjetivo (la experiencia sentida)', 'Genético', 'Cultural', 'Hormonal'],
    answer: 0,
    explanation: 'Los tres componentes clásicos son: fisiológico (cuerpo), conductual/expresivo (cara, postura, acción) y subjetivo/cognitivo (lo que se siente y se interpreta).',
  },
  {
    type: 'mc',
    prompt: '¿Cuál es la expresión facial característica de la SORPRESA?',
    options: [
      'Cejas levantadas, ojos muy abiertos y boca abierta',
      'Nariz arrugada y labio superior levantado',
      'Cejas fruncidas hacia abajo y labios apretados',
      'Comisuras de los labios hacia abajo y párpados caídos',
    ],
    answer: 0,
    explanation: 'La sorpresa amplía los ojos y abre la boca para captar más información del estímulo inesperado.',
  },
];

const dimension = [
  {
    type: 'open',
    prompt: 'Si el miedo y la tristeza tienen valencia negativa, ¿qué dimensión permite diferenciarlas principalmente según su nivel de energía?',
    answer: 'El arousal (activación): el miedo tiene arousal alto y la tristeza arousal bajo.',
  },
  {
    type: 'open',
    prompt: 'Una persona siente una emoción placentera (valencia positiva) pero con muy poca activación o energía (arousal bajo). Según el pétalo amarillo de Plutchik, ¿qué emoción es?',
    answer: 'Serenidad (la versión de baja intensidad de la alegría).',
  },
  {
    type: 'fill',
    prompt: 'SORPRESA',
    fields: { valencia: 'neutral', arousal: 'alto', dominancia: 'baja' },
    explanation: 'La sorpresa es neutral (puede virar a positiva o negativa), muy activadora y con poca sensación de control.',
  },
  {
    type: 'fill',
    prompt: 'VERGÜENZA',
    fields: { valencia: 'negativa', arousal: 'alto', dominancia: 'baja' },
    explanation: 'La vergüenza es desagradable, activadora (rubor, aceleración) y se siente con poco control sobre la situación.',
  },
  {
    type: 'open',
    prompt: 'Sorpresa y miedo pueden tener alto arousal. ¿Qué aspecto emocional permite distinguirlas?',
    answer: 'La valencia: la sorpresa es neutral y el miedo es claramente negativo.',
  },
  {
    type: 'open',
    prompt: 'Orgullo y alegría tienen valencia positiva. ¿Cuál suele implicar mayor sensación de control?',
    answer: 'El orgullo: implica alta dominancia (sensación de control y logro sobre la situación).',
  },
  {
    type: 'open',
    prompt: 'Una joven debe exponer frente a cientos de personas. Antes de comenzar siente tensión física, preocupación intensa y cree que podría equivocarse. ¿Qué emoción experimenta?',
    answer: 'Ansiedad (valencia negativa, arousal alto, dominancia baja).',
  },
  {
    type: 'open',
    prompt: 'Al finalizar unas vacaciones en un lugar tranquilo, una persona se siente relajada, en calma y sin necesidad de actuar o resolver problemas urgentes. ¿Qué emoción predomina?',
    answer: 'Serenidad (valencia positiva, arousal bajo).',
  },
  {
    type: 'fill',
    prompt: 'IRA',
    fields: { valencia: 'negativa', arousal: 'alto', dominancia: 'alta' },
    explanation: 'La ira es desagradable y muy activadora, pero se vive con sensación de poder y control (aproximación).',
  },
  {
    type: 'fill',
    prompt: 'TRISTEZA',
    fields: { valencia: 'negativa', arousal: 'bajo', dominancia: 'baja' },
    explanation: 'La tristeza es desagradable, con baja energía y poca sensación de control.',
  },
  {
    type: 'fill',
    prompt: 'ALEGRÍA',
    fields: { valencia: 'positiva', arousal: 'alto', dominancia: 'alta' },
    explanation: 'La alegría es agradable, activadora y se siente con control y confianza.',
  },
  {
    type: 'fill',
    prompt: 'MIEDO',
    fields: { valencia: 'negativa', arousal: 'alto', dominancia: 'baja' },
    explanation: 'El miedo es desagradable, muy activador y se vive con poca sensación de control (la amenaza domina).',
  },
  {
    type: 'mc',
    prompt: '¿Qué dimensión describe si una emoción se siente como agradable o desagradable?',
    options: ['Arousal', 'Valencia', 'Dominancia', 'Intensidad'],
    answer: 1,
    explanation: 'La valencia va de lo placentero a lo displacentero. El arousal es la activación y la dominancia es la sensación de control.',
  },
  {
    type: 'mc',
    prompt: '¿Qué dimensión describe cuánto control siente la persona sobre la situación?',
    options: ['Valencia', 'Arousal', 'Dominancia', 'Duración'],
    answer: 2,
    explanation: 'La dominancia va desde sentirse sometido o controlado hasta sentirse en control (por ejemplo, miedo = baja; ira = alta).',
  },
];

const desafio = [
  {
    type: 'open',
    prompt: 'Vas por la calle y una moto pasa a toda velocidad muy cerca tuyo. Te sobresaltás y el corazón se te acelera antes de entender qué pasó. Integrá: ¿qué estructura y qué vía se activan, y cómo describirías las tres dimensiones de esa emoción?',
    answer: 'La amígdala, por la vía rápida tálamo → amígdala (LeDoux), dispara la alarma antes de que la corteza evalúe. Emoción: miedo/alarma con valencia negativa, arousal alto y dominancia baja.',
  },
  {
    type: 'mc',
    prompt: 'Relacioná: emoción ASCO, función "evitar la contaminación", valencia negativa. ¿Qué estructura cerebral completa la red?',
    options: ['Ínsula', 'Estriado ventral', 'Corteza cingulada anterior', 'Hipocampo'],
    answer: 0,
    explanation: 'La ínsula procesa el asco y las sensaciones viscerales que lo acompañan.',
  },
  {
    type: 'open',
    prompt: 'Un amigo dice: "Vi al perro, empecé a temblar y recién ahí sentí miedo". Otro responde: "No, el miedo y el temblor te aparecieron juntos". ¿Qué teoría defiende cada uno?',
    answer: 'El primero describe la teoría de William James (periférica: la respuesta corporal precede y causa la emoción). El segundo describe Cannon-Bard (central: el tálamo dispara en paralelo la emoción y la reacción corporal).',
  },
  {
    type: 'open',
    prompt: 'Un paciente con lesión en la corteza prefrontal ventromedial reacciona con ira desproporcionada ante frustraciones mínimas y no logra calmarse. Explicá qué falla y qué estructura queda "sin freno".',
    answer: 'Falla la regulación emocional de arriba hacia abajo: la corteza prefrontal ya no modula ni inhibe a la amígdala, que dispara respuestas de ira intensas sin control.',
  },
  {
    type: 'mc',
    prompt: 'Te avisan que ganaste un premio que esperabas hace meses. Emoción: alegría; valencia positiva; arousal alto. ¿Qué estructura del sistema de recompensa se activa con más fuerza?',
    options: ['Amígdala', 'Estriado ventral (núcleo accumbens)', 'Ínsula', 'Cuerpos mamilares'],
    answer: 1,
    explanation: 'El estriado ventral codifica la recompensa y la anticipación placentera mediante la dopamina.',
  },
  {
    type: 'mc',
    prompt: 'Ordená correctamente el recorrido del circuito de Papez.',
    options: [
      'Hipocampo → fórnix → cuerpos mamilares → tálamo anterior → giro cingulado → hipocampo',
      'Amígdala → tálamo → corteza prefrontal → hipocampo',
      'Giro cingulado → amígdala → fórnix → hipotálamo',
      'Tálamo → ínsula → estriado ventral → corteza prefrontal',
    ],
    answer: 0,
    explanation: 'Papez propuso un circuito cerrado: hipocampo, fórnix, cuerpos mamilares, núcleo anterior del tálamo, giro cingulado y de vuelta al hipocampo.',
  },
  {
    type: 'open',
    prompt: 'Tras un ACV en el hemisferio derecho, un paciente entiende las palabras que le dicen, pero no capta si el tono de voz es enojado o alegre, y su propia voz suena monótona. ¿Qué concepto explica esto y cómo se llama el déficit?',
    answer: 'La lateralización hemisférica: el hemisferio derecho es dominante para la prosodia emocional. El déficit se llama aprosodia.',
  },
  {
    type: 'open',
    prompt: 'A una persona la excluyen de un grupo de chat y describe que "le duele". Explicá qué estructura cerebral vincula el rechazo social con el dolor y qué emoción básica suele acompañarlo.',
    answer: 'La corteza cingulada anterior se activa tanto con el dolor físico como con el rechazo social ("dolor social"). Suele acompañarse de tristeza (valencia negativa, arousal bajo, dominancia baja).',
  },
  {
    type: 'open',
    prompt: 'Integrá la emoción ALARMA (según Plutchik): ¿qué emociones básicas la componen, qué estructura cerebral es central y cuáles son sus dimensiones?',
    answer: 'Alarma = miedo + sorpresa. La amígdala es central para la detección de la amenaza. Dimensiones: valencia negativa, arousal muy alto, dominancia baja.',
  },
  {
    type: 'mc',
    prompt: 'Una persona con lesión bilateral de amígdala mira una película de terror sin inmutarse, pero disfruta de una comedia con normalidad. ¿Qué concepto ilustra mejor este caso?',
    options: [
      'La especificidad de la amígdala para el miedo',
      'La hipótesis de la valencia',
      'La teoría de William James',
      'El circuito de Papez',
    ],
    answer: 0,
    explanation: 'La amígdala es necesaria sobre todo para el miedo; las emociones positivas dependen de otras redes, como el estriado ventral.',
  },
  {
    type: 'open',
    prompt: 'Un estudiante dice: "Cuando estoy nervioso antes de un examen, respiro lento y me calmo". Explicá qué diría William James de esa estrategia y qué estructura cerebral está haciendo el trabajo de regulación.',
    answer: 'Para James, cambiar la respuesta corporal (respirar lento) modifica la emoción, porque la emoción es la percepción de esos cambios. La corteza prefrontal ejerce la regulación de arriba hacia abajo sobre la amígdala y la respuesta autonómica.',
  },
];

// Le asigna un id estable a cada carta (categoría + índice)
function withIds(category, cards) {
  return cards.map((c, i) => ({ ...c, id: `${category}-${i + 1}`, category }));
}

export const DECKS = {
  teoria: withIds('teoria', teoria),
  cerebro: withIds('cerebro', cerebro),
  dimension: withIds('dimension', dimension),
  emocion: withIds('emocion', emocion),
  desafio: withIds('desafio', desafio),
};

export const CARDS_BY_ID = Object.fromEntries(
  Object.values(DECKS).flat().map((c) => [c.id, c]),
);
