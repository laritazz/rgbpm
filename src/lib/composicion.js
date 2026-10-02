// Composiciones de cartel: círculos de tamaños muy distintos, algunos cortados por el borde de la pantalla.
// Cada plano tiene dos (apaisada y vertical); el tamaño de cada círculo se ajusta con tu uso (lib/uso.js).

// x, y en fracción del ancho y del alto; r en fracción del lado corto
const INICIO_APAISADA = {
  mascota: { x: 0.52, y: 0.5, r: 0.22 },
  biblioteca: { x: 0.92, y: 0.02, r: 0.48 },
  armonia: { x: 0.2, y: 1.05, r: 0.4 },
  sets: { x: 0.76, y: 0.86, r: 0.2 },
  tap: { x: 0.09, y: 0.36, r: 0.15 },
  juego: { x: 0.3, y: 0.18, r: 0.12 },
  radio: { x: 0.95, y: 0.66, r: 0.12 },
  mezclador: { x: 0.45, y: 0.22, r: 0.08 },
}

const INICIO_VERTICAL = {
  mascota: { x: 0.47, y: 0.5, r: 0.26 },
  biblioteca: { x: 0.95, y: 0.05, r: 0.5 },
  armonia: { x: 0.05, y: 0.97, r: 0.5 },
  sets: { x: 0.85, y: 0.72, r: 0.22 },
  tap: { x: 0.16, y: 0.32, r: 0.17 },
  juego: { x: 0.12, y: 0.6, r: 0.13 },
  radio: { x: 0.72, y: 0.9, r: 0.15 },
  mezclador: { x: 0.3, y: 0.2, r: 0.12 },
}

// Gotas: pequeñas, sueltas entre dos círculos; al flotar se unen y se separan de ellos
const INICIO_GOTAS_APAISADA = [
  { x: 0.645, y: 0.69, r: 0.03 },
  { x: 0.4, y: 0.34, r: 0.025 },
  { x: 0.14, y: 0.64, r: 0.028 },
  { x: 0.965, y: 0.39, r: 0.022 },
]
const INICIO_GOTAS_VERTICAL = [
  { x: 0.7, y: 0.6, r: 0.04 },
  { x: 0.24, y: 0.4, r: 0.03 },
  { x: 0.42, y: 0.83, r: 0.035 },
  { x: 0.62, y: 0.33, r: 0.028 },
]

export const PLANO_INICIO = { apaisada: INICIO_APAISADA, vertical: INICIO_VERTICAL, gotas: { apaisada: INICIO_GOTAS_APAISADA, vertical: INICIO_GOTAS_VERTICAL } }

// Juegos: el más jugado arriba a la derecha, como Biblioteca en el inicio
export const PLANO_JUEGO = {
  apaisada: {
    mascota: { x: 0.5, y: 0.55, r: 0.22 },
    bpm: { x: 0.9, y: 0.04, r: 0.46 },
    pega: { x: 0.2, y: 1.04, r: 0.4 },
    corre: { x: 0.78, y: 0.9, r: 0.2 },
    cae: { x: 0.11, y: 0.36, r: 0.16 },
    cuadra: { x: 0.33, y: 0.2, r: 0.12 },
  },
  vertical: {
    mascota: { x: 0.48, y: 0.5, r: 0.26 },
    bpm: { x: 0.84, y: 0.15, r: 0.46 },
    pega: { x: 0.14, y: 0.92, r: 0.46 },
    corre: { x: 0.84, y: 0.74, r: 0.22 },
    cae: { x: 0.18, y: 0.32, r: 0.18 },
    cuadra: { x: 0.14, y: 0.6, r: 0.13 },
  },
  gotas: {
    apaisada: [{ x: 0.66, y: 0.7, r: 0.03 }, { x: 0.22, y: 0.62, r: 0.026 }, { x: 0.42, y: 0.32, r: 0.024 }],
    vertical: [{ x: 0.7, y: 0.6, r: 0.04 }, { x: 0.3, y: 0.42, r: 0.03 }, { x: 0.44, y: 0.82, r: 0.034 }],
  },
}

/**
 * Dónde leer la etiqueta de un círculo: en su centro si se ve entero; si está cortado,
 * en la parte que queda dentro de la pantalla (y siempre dentro del círculo).
 */
export function puntoEtiqueta({ x, y, r }, ancho, alto, margen) {
  const m = typeof margen === 'number' ? { arriba: margen, abajo: margen, lados: margen } : margen
  const lx = Math.min(ancho - m.lados, Math.max(m.lados, x))
  const ly = Math.min(alto - m.abajo, Math.max(m.arriba, y))
  const dx = lx - x
  const dy = ly - y
  const d = Math.hypot(dx, dy)
  const maximo = r * 0.62
  if (d <= maximo) return { x: lx, y: ly }
  return { x: x + (dx / d) * maximo, y: y + (dy / d) * maximo }
}

/**
 * @param aspecto ancho / alto de la zona
 * @param escalas { [id]: 0.8–1.18 } cuánto crece cada círculo según tu uso
 * @param margenes { arriba, abajo, lados } dónde no puede caer una etiqueta (la cabecera, el ancho del texto)
 * @param plano PLANO_INICIO o PLANO_JUEGO
 * @returns { ancho, alto, circulos: [{ id, x, y, r, etiqueta }], gotas } en unidades de SVG (ancho 100)
 */
export function componer(aspecto, escalas = {}, margenes = null, plano = PLANO_INICIO) {
  const vertical = aspecto < 1
  const base = vertical ? plano.vertical : plano.apaisada
  const ancho = 100
  const alto = 100 / aspecto
  const corto = Math.min(ancho, alto)
  const circulos = Object.entries(base).map(([id, c]) => {
    const r = c.r * corto * (escalas[id] ?? 1)
    const circulo = { id, x: c.x * ancho, y: c.y * alto, r }
    return { ...circulo, etiqueta: puntoEtiqueta(circulo, ancho, alto, margenes ?? corto * 0.12) }
  })
  const gotas = (vertical ? plano.gotas.vertical : plano.gotas.apaisada).map((g, i) => ({ id: `gota${i}`, x: g.x * ancho, y: g.y * alto, r: g.r * corto }))
  return { ancho, alto, circulos, gotas }
}
