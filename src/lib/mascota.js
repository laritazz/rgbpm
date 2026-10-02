// Geometría y ánimo de la mascota: un Disco (O) que se convierte en Asterisco (✱) con la energía.
// Portado de brand/generar.py: r(θ) = (1 − k)·112 + k·radioAsterisco(θ)
import { colorBpm } from './color'

export const ROSA = '#FF66C4'
export const ROSA_MASCOTA = '#F780C0'

const R_DISCO = 112
const BARRA_ANCHO = 30
const BARRA_LARGO = 132
const PUNTOS = 144

// El radio del asterisco no cambia: se calcula una vez y se reutiliza en cada fotograma
const RADIOS = Array.from({ length: PUNTOS }, (_, i) => {
  const t = (2 * Math.PI * i) / PUNTOS
  let r = 0
  for (let j = 0; j < 4; j++) {
    const a = t - ((22.5 + 45 * j) * Math.PI) / 180
    const c = Math.abs(Math.cos(a))
    const s = Math.abs(Math.sin(a))
    r = Math.max(r, Math.min(c > 1e-6 ? BARRA_LARGO / c : 1e9, s > 1e-6 ? BARRA_ANCHO / s : 1e9))
  }
  return [t, r]
})

/** Contorno de la mascota. k = 0 es el Disco, k = 1 el Asterisco. */
export function forma(k) {
  let d = ''
  for (let i = 0; i < PUNTOS; i++) {
    const [t, ra] = RADIOS[i]
    const r = (1 - k) * R_DISCO + k * ra
    d += `${i ? 'L' : 'M'}${(Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r).toFixed(1)}`
  }
  return `${d}Z`
}

/** Energía 0–1 a partir del BPM: disco hasta 110 (violeta), asterisco entero desde 155 (carmesí). */
export function energia(bpm) {
  const x = Math.max(0, Math.min(1, ((bpm ?? 120) - 110) / (155 - 110)))
  return x * x * (3 - 2 * x)
}

// Un ánimo por franja: la cara también cambia donde cambia el color. El fondo lo pone el BPM.
export const ANIMOS = [
  { id: 'calma', nombre: 'Calma', hasta: 110, texto: 'Warm-up: sin prisa, que la pista se vaya llenando.' },
  { id: 'feliz', nombre: 'Feliz', hasta: 124, texto: 'Groove cómodo: ideal para enganchar a la gente.' },
  { id: 'guino', nombre: 'Guiño', hasta: 132, texto: 'Ya estamos dentro: es momento de jugar con las claves.' },
  { id: 'sorpresa', nombre: 'Sorpresa', hasta: 150, texto: 'Esto sube: cuida las transiciones, cada salto se nota.' },
  { id: 'euforia', nombre: 'Euforia', hasta: 999, texto: 'Pico del set: el asterisco a tope.' },
]

export const animoDe = (bpm) => ANIMOS.find((a) => (bpm ?? 120) < a.hasta) ?? ANIMOS[1]

/** Colores de la mascota según dónde vive: suelta, en un icono o en la etiqueta del vinilo. */
export function paleta(bpm, variante) {
  const fondo = colorBpm(bpm)
  if (variante === 'libre') return { fondo: null, cuerpo: ROSA_MASCOTA, cara: '#000000', eco: fondo }
  // Negra: para fondos rosas (la home), plana como los círculos que la rodean: cuerpo negro, cara rosa, sin eco
  if (variante === 'negra') return { fondo: null, cuerpo: '#000000', cara: ROSA, eco: null }
  // Rosa: lo mismo al revés, para los círculos rosas del menú de Juego
  if (variante === 'rosa') return { fondo: null, cuerpo: ROSA, cara: '#000000', eco: null }
  return { fondo, cuerpo: '#000000', cara: ROSA, eco: ROSA }
}

// Curvas de animación
export const suave = (x) => {
  const v = Math.max(0, Math.min(1, x))
  return v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2
}
export const conRebote = (x) => {
  const c = 1.9
  const v = Math.max(0, Math.min(1, x))
  return 1 + (c + 1) * (v - 1) ** 3 + c * (v - 1) ** 2
}

// ——— Vida: lo que hace la mascota aunque no suene nada ———
// Parpadea, mira alrededor, se mece un poco y, en pausa, se duerme.

const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Curva de un parpadeo: cierra rápido y abre algo más lento (0 abierto → 1 cerrado). */
function parpadeo(t, semilla) {
  const periodo = 3.4 + hash(semilla) * 1.6
  const fase = (t + semilla * 0.37) % periodo
  const cierra = 0.07
  const abre = 0.14
  if (fase < cierra) return fase / cierra
  if (fase < cierra + abre) return 1 - (fase - cierra) / abre
  return 0
}

// Punto al que mira en el tramo i: uno de cada tres vuelve al centro (mirar de frente también es mirar)
const destino = (i, semilla) => (i % 3 === 0 ? [0, 0] : [hash(semilla + i * 7.3) * 2 - 1, (hash(semilla + i * 5.9) * 2 - 1) * 0.6])

/** Mirada que vaga: cada ~2 s cambia de punto con un vistazo rápido, en un momento distinto de cada tramo. */
function vistazo(t, semilla) {
  const TRAMO = 2.1
  const i = Math.floor(t / TRAMO)
  const salta = hash(semilla + i * 1.7) * 0.9
  const x = Math.max(0, Math.min(1, (t - i * TRAMO - salta) / 0.16))
  const e = x * x * (3 - 2 * x)
  const [a, b] = [destino(i - 1, semilla), destino(i, semilla)]
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]
}

/**
 * Estado de vida en el instante `t` (s).
 * @param despierta  false = dormida: ojos cerrados y respiración lenta
 * @param desde      segundos desde que se despertó (abre los ojos poco a poco)
 * @param mira       { x, y } de −1 a 1: adónde mira (si no, mira alrededor sola)
 * @returns parpado (0–1), ojo [x, y] de −1 a 1, deriva [x, y] en unidades del dibujo, respira (escala)
 */
export function vida(t, { despierta = true, desde = 99, mira = null, semilla = 0 } = {}) {
  if (!despierta) {
    return { parpado: 1, ojo: [0, 0.35], deriva: [0, Math.sin(t * 1.3) * 3], respira: 1 + 0.025 * Math.sin(t * 1.3) }
  }
  const despertar = Math.max(0, 1 - desde / 0.45)
  const ojo = mira ? [Math.max(-1, Math.min(1, mira.x)), Math.max(-1, Math.min(1, mira.y))] : vistazo(t, semilla)
  return {
    parpado: Math.max(parpadeo(t, semilla), despertar),
    ojo,
    deriva: [Math.sin(t * 0.7 + semilla) * 5, Math.cos(t * 0.9 + semilla) * 4],
    respira: 1,
  }
}

/** Transformaciones de la cara para un instante: se usan igual desde React o escribiendo en el DOM. */
export function movimientoCara({ parpado = 0, ojo = [0, 0], pulso = 0 }) {
  return {
    cara: `translate(${(ojo[0] * 14).toFixed(1)} ${(ojo[1] * 10).toFixed(1)})`,
    ojos: `translate(0 -14) scale(1 ${(1 - parpado * 0.88).toFixed(3)}) translate(0 14)`,
    boca: `translate(0 4) scale(${(1 + 0.22 * pulso).toFixed(3)}) translate(0 -4)`,
  }
}

/**
 * Cómo se mueve el cuerpo en un instante: latido, giro por compás y vaivén.
 * Lo usan la mascota y su «cuerpo de tinta» del inicio: con los mismos números, los dos se mueven a la vez.
 * @param giroAnterior en pausa el giro se queda donde estaba
 */
export function movimientoCuerpo({ t, k, vida: v, bpm, tocando, giroAnterior = 0 }) {
  const golpes = (t * (bpm ?? 120)) / 60
  const fase = golpes - Math.floor(golpes)
  const pulso = tocando ? Math.exp(-fase * 5) : 0
  let giro = giroAnterior
  if (tocando) {
    const compas = Math.floor(golpes / 4)
    giro = (compas + conRebote(Math.max(0, (golpes / 4 - compas - 0.75) / 0.25))) * 45 * k
  }
  return { pulso, giro, sx: (1 + 0.07 * pulso) * v.respira, sy: (1 - 0.06 * pulso) * v.respira, dx: v.deriva[0], dy: v.deriva[1] }
}
