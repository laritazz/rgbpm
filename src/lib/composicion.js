// Composición del inicio, como un cartel: círculos de tamaños muy distintos, algunos cortados por el
// borde de la pantalla. Hay dos composiciones (apaisada y vertical); el tamaño de cada sección
// se ajusta con tus datos: cuanto más usas algo, más grande.

// x, y en fracción del ancho y del alto; r en fracción del lado corto
const APAISADA = {
  mascota: { x: 0.52, y: 0.5, r: 0.22 },
  biblioteca: { x: 0.92, y: 0.02, r: 0.48 },
  armonia: { x: 0.2, y: 1.05, r: 0.4 },
  sets: { x: 0.76, y: 0.86, r: 0.2 },
  tap: { x: 0.09, y: 0.36, r: 0.15 },
  juego: { x: 0.3, y: 0.18, r: 0.12 },
  radio: { x: 0.95, y: 0.66, r: 0.12 },
  mezclador: { x: 0.45, y: 0.22, r: 0.08 },
}

const VERTICAL = {
  mascota: { x: 0.47, y: 0.5, r: 0.26 },
  biblioteca: { x: 0.95, y: 0.05, r: 0.5 },
  armonia: { x: 0.05, y: 0.97, r: 0.5 },
  sets: { x: 0.85, y: 0.72, r: 0.22 },
  tap: { x: 0.16, y: 0.32, r: 0.17 },
  juego: { x: 0.12, y: 0.6, r: 0.13 },
  radio: { x: 0.72, y: 0.9, r: 0.15 },
  mezclador: { x: 0.3, y: 0.2, r: 0.1 },
}

// Gotas: pequeñas, sueltas entre dos círculos; al flotar se unen y se separan de ellos
const GOTAS_APAISADA = [
  { x: 0.645, y: 0.69, r: 0.03 },
  { x: 0.4, y: 0.34, r: 0.025 },
  { x: 0.14, y: 0.64, r: 0.028 },
  { x: 0.965, y: 0.39, r: 0.022 },
]
const GOTAS_VERTICAL = [
  { x: 0.7, y: 0.6, r: 0.04 },
  { x: 0.24, y: 0.4, r: 0.03 },
  { x: 0.42, y: 0.83, r: 0.035 },
  { x: 0.62, y: 0.33, r: 0.028 },
]

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
 * @param escalas { [id]: 0.8–1.15 } cuánto crece cada sección según tus datos
 * @param margenes { arriba, abajo, lados } dónde no puede caer una etiqueta (la cabecera, el ancho del texto)
 * @returns { ancho, alto, circulos: [{ id, x, y, r, etiqueta }], gotas } en unidades de SVG (ancho 100)
 */
export function componer(aspecto, escalas = {}, margenes = null) {
  const vertical = aspecto < 1
  const base = vertical ? VERTICAL : APAISADA
  const ancho = 100
  const alto = 100 / aspecto
  const corto = Math.min(ancho, alto)
  const circulos = Object.entries(base).map(([id, c]) => {
    const r = c.r * corto * (escalas[id] ?? 1)
    const circulo = { id, x: c.x * ancho, y: c.y * alto, r }
    return { ...circulo, etiqueta: puntoEtiqueta(circulo, ancho, alto, margenes ?? corto * 0.12) }
  })
  const gotas = (vertical ? GOTAS_VERTICAL : GOTAS_APAISADA).map((g, i) => ({ id: `gota${i}`, x: g.x * ancho, y: g.y * alto, r: g.r * corto }))
  return { ancho, alto, circulos, gotas }
}

/** Escala de una sección según un dato (0 = mínimo, `lleno` o más = máximo). Raíz: el área crece con el dato. */
export function escalaPorDato(valor, lleno, { minimo = 0.82, maximo = 1.12 } = {}) {
  const t = Math.sqrt(Math.min(1, Math.max(0, (valor ?? 0) / lleno)))
  return minimo + (maximo - minimo) * t
}
