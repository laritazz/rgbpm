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

/** Energía 0–1 a partir del BPM: tranquila por debajo de 118, a tope desde 165. */
export function energia(bpm) {
  const x = Math.max(0, Math.min(1, ((bpm ?? 120) - 118) / (165 - 118)))
  return x * x * (3 - 2 * x)
}

// Cada ánimo tiene su cara. El fondo lo pone el BPM: color = BPM.
export const ANIMOS = [
  { id: 'calma', nombre: 'Calma', hasta: 112, texto: 'Warm-up: sin prisa, que la pista se vaya llenando.' },
  { id: 'feliz', nombre: 'Feliz', hasta: 126, texto: 'Groove cómodo: ideal para enganchar a la gente.' },
  { id: 'guino', nombre: 'Guiño', hasta: 140, texto: 'Ya estamos dentro: es momento de jugar con las claves.' },
  { id: 'sorpresa', nombre: 'Sorpresa', hasta: 155, texto: 'Esto sube: cuida las transiciones, cada salto se nota.' },
  { id: 'euforia', nombre: 'Euforia', hasta: 999, texto: 'Pico del set: el asterisco a tope.' },
]

export const animoDe = (bpm) => ANIMOS.find((a) => (bpm ?? 120) < a.hasta) ?? ANIMOS[1]

/** Colores de la mascota según dónde vive: suelta, en un icono o en la etiqueta del vinilo. */
export function paleta(bpm, variante) {
  const fondo = colorBpm(bpm)
  if (variante === 'libre') return { fondo: null, cuerpo: ROSA_MASCOTA, cara: '#000000', eco: fondo }
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
