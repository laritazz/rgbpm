// Sistema de color Laritazz: color = BPM. Más BPM, más cálido.

export const FRANJAS = [
  { id: 'violeta', nombre: 'Violeta', desde: 0, hasta: 120, color: '#7D4EA2' },
  { id: 'turquesa', nombre: 'Turquesa', desde: 120, hasta: 132, color: '#4ABDC4' },
  { id: 'oliva', nombre: 'Oliva', desde: 132, hasta: 153, color: '#A0B03D' },
  { id: 'amarillo', nombre: 'Amarillo', desde: 153, hasta: 168, color: '#E4BB2A' },
  { id: 'carmesi', nombre: 'Carmesí', desde: 168, hasta: 999, color: '#A42640' },
]

// Escala fina, sacada de tus portadas de canciones: el color se funde entre puntos
const ESCALA = [
  [100, '#7D4EA2'], [116, '#4B8EC6'], [124, '#48C3A5'], [127, '#3FAF4A'], [132, '#A6BC4E'],
  [142, '#C2B545'], [152, '#E4CD2D'], [165, '#E5922F'], [180, '#A42640'],
]

const aRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const aHex = (c) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`

export const mezclar = (a, b, t) => aHex(aRgb(a).map((v, i) => v + (aRgb(b)[i] - v) * t))

export function colorBpm(bpm) {
  if (!bpm) return '#555555'
  if (bpm <= ESCALA[0][0]) return ESCALA[0][1].toLowerCase()
  for (let i = 1; i < ESCALA.length; i++) {
    const [b1, c1] = ESCALA[i]
    if (bpm <= b1) {
      const [b0, c0] = ESCALA[i - 1]
      return mezclar(c0, c1, (bpm - b0) / (b1 - b0))
    }
  }
  return ESCALA[ESCALA.length - 1][1].toLowerCase()
}

export const franjaDe = (bpm) => FRANJAS.find((f) => bpm >= f.desde && bpm < f.hasta) ?? FRANJAS[0]

/** Tinta legible (negra o blanca) sobre un color de fondo. */
export function tintaSobre(hex) {
  const [r, g, b] = aRgb(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05) ? '#000000' : '#FFFFFF'
}

/** Portada Pantone: degradado que gira con el BPM, como tus portadas de sets. */
export function degradadoPortada(bpm) {
  const base = colorBpm(bpm)
  const siguiente = colorBpm((bpm ?? 120) + 8)
  const giro = Math.round(((bpm ?? 120) * 7) % 360)
  return `conic-gradient(from ${giro}deg at 30% 70%, ${base}, ${siguiente}, ${base})`
}
