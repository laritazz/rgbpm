// Juego «Adivina el BPM»: suena un tema, marcas el ritmo sobre la mascota y te puntúa.

export const RONDAS = 5

/**
 * Elige temas para una partida, repartidos por todo el rango de BPM de tu biblioteca
 * (uno lento, uno rápido y los del medio), sin repetir artista si se puede.
 */
export function elegirRondas(temas, { n = RONDAS, azar = Math.random } = {}) {
  const conBpm = temas.filter((t) => t.bpm >= 60 && t.bpm <= 200).sort((a, b) => a.bpm - b.bpm)
  if (!conBpm.length) return []
  const elegidos = []
  const artistas = new Set()
  for (let i = 0; i < n && elegidos.length < conBpm.length; i++) {
    // Tramo i de n del rango ordenado; dentro de él, uno al azar que no repita
    const desde = Math.floor((i / n) * conBpm.length)
    const hasta = Math.max(desde + 1, Math.floor(((i + 1) / n) * conBpm.length))
    const tramo = conBpm.slice(desde, hasta).filter((t) => !elegidos.includes(t))
    const nuevos = tramo.filter((t) => !artistas.has(t.artista))
    const opciones = nuevos.length ? nuevos : tramo.length ? tramo : conBpm.filter((t) => !elegidos.includes(t))
    const tema = opciones[Math.floor(azar() * opciones.length)]
    elegidos.push(tema)
    artistas.add(tema.artista)
  }
  // Barajado: que no vayan siempre de lento a rápido
  return elegidos.map((t) => [azar(), t]).sort((a, b) => a[0] - b[0]).map(([, t]) => t)
}

const VEREDICTOS = [
  { id: 'clavado', hasta: 2, nombre: '¡Clavado!', animo: 'euforia' },
  { id: 'cerca', hasta: 5, nombre: 'Muy cerca', animo: 'feliz' },
  { id: 'casi', hasta: 10, nombre: 'Casi', animo: 'sorpresa' },
  { id: 'lejos', hasta: Infinity, nombre: 'Lejos', animo: 'calma' },
]

/**
 * Puntos de una ronda (0–100). Vale marcar a doble o a medio tempo, como en cabina.
 * 1 % de error son 92 puntos; a partir de 12,5 % no puntúa.
 */
export function puntuarBpm(real, tuyo) {
  if (!real || !tuyo) return { puntos: 0, error: null, relacion: 1, veredicto: VEREDICTOS.at(-1) }
  let mejor = null
  for (const relacion of [1, 2, 0.5]) {
    const error = (Math.abs(tuyo * relacion - real) / real) * 100
    if (!mejor || error < mejor.error) mejor = { error, relacion }
  }
  const puntos = Math.max(0, Math.round(100 - mejor.error * 8))
  return { puntos, error: Math.round(mejor.error * 10) / 10, relacion: mejor.relacion, veredicto: VEREDICTOS.find((v) => mejor.error <= v.hasta) }
}

/** Resumen de la partida y si bate el récord. */
export function resumenPartida(resultados, recordAnterior = 0) {
  const total = resultados.reduce((s, r) => s + r.puntos, 0)
  const clavados = resultados.filter((r) => r.veredicto.id === 'clavado').length
  return { total, clavados, maximo: resultados.length * 100, record: Math.max(total, recordAnterior), nuevoRecord: total > recordAnterior && resultados.length > 0 }
}
