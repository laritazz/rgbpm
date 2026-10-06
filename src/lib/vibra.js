// Vibra: el DJ tiene la última palabra sobre el color emocional de un tema.
// El BPM sigue siendo el dato (y su color en las tarjetas); la vibra es tu lectura, y manda cuando el tema suena.
import { FRANJAS, colorBpm } from './color'
import { idFragmento, idTitulo } from './fragmentos'

/** Recorrido del dial, como un potenciómetro de mesa: de −150° a 150°, una porción por franja. */
export const BARRIDO = 300
const PASO = BARRIDO / FRANJAS.length

export const franjaPorId = (id) => FRANJAS.find((f) => f.id === id) ?? null

/** Ángulo del centro de una franja en el dial. */
export function anguloDeFranja(id) {
  const i = FRANJAS.findIndex((f) => f.id === id)
  return -BARRIDO / 2 + PASO * (Math.max(0, i) + 0.5)
}

/** Franja que cae bajo un ángulo del dial (fuera del recorrido, la del extremo más cercano). */
export function franjaDeAngulo(angulo) {
  const a = Math.max(-BARRIDO / 2, Math.min(BARRIDO / 2, angulo))
  return FRANJAS[Math.min(FRANJAS.length - 1, Math.floor((a + BARRIDO / 2) / PASO))]
}

/** Ángulo de un punto respecto al centro del dial: 0° arriba y crece en el sentido del reloj. */
export const anguloDePunto = (x, y) => (Math.atan2(x, -y) * 180) / Math.PI

/** Huella del tema: la misma que nombra su fragmento en el servidor (SHA-256 de la ruta de Traktor o, si no hay, de artista y título). */
export const huella = (tema) => (tema.ruta ? idFragmento(tema.ruta) : idTitulo(tema))

/** El color con el que suena un tema: tu vibra si la hay; si no, el de su BPM. */
export const colorSonando = (tema, vibra) => franjaPorId(vibra)?.color ?? colorBpm(tema?.bpm)
