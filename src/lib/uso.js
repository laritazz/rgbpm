// Uso: cuánto entras en cada sección. Cada visita pesa menos con los días (la mitad cada semana),
// así el inicio refleja lo que usas ahora, no lo que usaste hace meses.

const DIA = 86_400_000
export const MEDIA_VIDA = 7 * DIA
const GUARDA = 60 * DIA // visitas más viejas se olvidan
const POR_SECCION = 60 // máximo de visitas recordadas por sección
const ENTRE_VISITAS = 30_000 // recargar o ir y volver en medio minuto no cuenta dos veces

/** Qué sección es una ruta: el primer tramo («/juego/bpm» → juego y juego:bpm). */
export function seccionesDeRuta(ruta) {
  const [primero, segundo] = ruta.replace(/^\/+/, '').split('/')
  if (!primero) return []
  if (primero === 'set') return ['biblioteca']
  return segundo && primero === 'juego' ? ['juego', `juego:${segundo}`] : [primero]
}

/** Apunta una visita y devuelve el historial nuevo (no modifica el que recibe). */
export function apuntarVisita(historial, id, ahora = Date.now()) {
  const antes = (historial[id] ?? []).filter((t) => ahora - t < GUARDA)
  if (antes.length && ahora - antes.at(-1) < ENTRE_VISITAS) return historial
  return { ...historial, [id]: [...antes, ahora].slice(-POR_SECCION) }
}

/** Peso de uso de cada sección: suma de visitas, cada una valiendo ½ por semana que pasa. */
export function pesosDeUso(historial, ahora = Date.now()) {
  const pesos = {}
  for (const [id, visitas] of Object.entries(historial)) {
    pesos[id] = visitas.reduce((s, t) => s + 0.5 ** (Math.max(0, ahora - t) / MEDIA_VIDA), 0)
  }
  return pesos
}

/**
 * Escala de cada círculo (minimo–maximo) según el uso, relativa a la sección más usada.
 * Con poco historial (menos de `arranque` visitas) todo queda en 1: la composición tal cual.
 */
export function escalasPorUso(historial, ids, { ahora = Date.now(), minimo = 0.8, maximo = 1.18, arranque = 4, prefijo = '' } = {}) {
  const pesos = pesosDeUso(historial, ahora)
  const valor = (id) => pesos[prefijo + id] ?? 0
  const total = ids.reduce((s, id) => s + (historial[prefijo + id]?.length ?? 0), 0)
  const mayor = Math.max(...ids.map(valor), 0)
  return Object.fromEntries(ids.map((id) => [id, total < arranque || !mayor ? 1 : minimo + (maximo - minimo) * Math.sqrt(valor(id) / mayor)]))
}
