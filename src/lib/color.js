// Sistema de color Laritazz: color = BPM. Más BPM, más cálido.

// Las cinco franjas (una por letra del logo). Cortadas con tu colección real (10.554 temas, oct 2026):
// cada una guarda entre el 12 y el 25 % de tus temas, y el rojo entra donde empieza lo duro (150).
export const FRANJAS = [
  { id: 'violeta', nombre: 'Violeta', desde: 0, hasta: 110, color: '#7D4EA2', texto: 'Downtempo, hip hop, reggaetón' },
  { id: 'turquesa', nombre: 'Turquesa', desde: 110, hasta: 124, color: '#4ABDC4', texto: 'House, nu disco, afro' },
  { id: 'oliva', nombre: 'Oliva', desde: 124, hasta: 132, color: '#A0B03D', texto: 'Tech house, techno, el centro de la pista' },
  { id: 'amarillo', nombre: 'Amarillo', desde: 132, hasta: 150, color: '#E4BB2A', texto: 'Trance, techno duro, hard dance' },
  { id: 'carmesi', nombre: 'Carmesí', desde: 150, hasta: 999, color: '#A42640', texto: 'Hardstyle, jungle, drum & bass' },
]

// Escala fina: el color se funde entre puntos. Los puntos caen dentro de su franja,
// así el color de un tema siempre «pertenece» a la franja que le toca.
const ESCALA = [
  [92, '#7D4EA2'], [106, '#5B6FC0'], [114, '#4B9FC6'], [119, '#48C3B5'], [124, '#3FAF4A'], [128, '#A6BC4E'],
  [133, '#C2B545'], [140, '#E4CD2D'], [146, '#E5922F'], [152, '#C9452F'], [162, '#A42640'], [180, '#7A1A33'],
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

// ——— Color de la clave ———
// Cada tono tiene su color en la rueda: el número Open Key recorre el círculo de color como recorre
// las quintas, así dos claves vecinas tienen colores vecinos. Las menores, más oscuras; las mayores, más claras.

function hslAHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return aHex([f(0), f(8), f(4)].map((v) => v * 255))
}

const INICIO_RUEDA = 330 // 1m / 1d (La menor, Do mayor) en magenta, la casa

export function colorClave(clave) {
  if (!clave) return '#555555'
  const h = (INICIO_RUEDA + (clave.open - 1) * 30) % 360
  return clave.menor ? hslAHex(h, 0.62, 0.46) : hslAHex(h, 0.72, 0.66)
}

/**
 * El color de un tema: tempo y tono juntos. Arriba a la izquierda, su BPM (la franja);
 * abajo a la derecha, su clave. Sin clave, color plano.
 */
export function degradadoTema(tema, angulo = 135) {
  const bpm = colorBpm(tema?.bpm)
  if (!tema?.clave) return bpm
  return `linear-gradient(${angulo}deg, ${bpm} 0%, ${bpm} 38%, ${colorClave(tema.clave)} 100%)`
}

export const GRIS_ESCUCHA = '#8c8c8c'

/**
 * Color mientras la escucha aún duda: gris al principio, se tiñe del BPM intuido según crece la certeza
 * y llega a su color entero al fijarse (80 %). Así el color nunca promete más de lo que se sabe.
 */
export function colorProvisional(bpm, certeza) {
  if (!bpm || certeza <= 0.3) return GRIS_ESCUCHA
  if (certeza >= 0.8) return colorBpm(bpm)
  return mezclar(GRIS_ESCUCHA, colorBpm(bpm), 0.25 + (0.5 * (certeza - 0.31)) / 0.48)
}
