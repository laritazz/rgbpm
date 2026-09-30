// Radio: encadena temas de tu biblioteca por armonía y va llevando el BPM
// hasta donde le digas. Portado del generador de RGBPM.html.
import { CATEGORIAS, clavesRelacionadas } from './armonia'

/**
 * @param temas     temas disponibles (con clave y BPM, y con audio)
 * @param semilla   clave de salida
 * @param bpmInicio BPM de salida
 * @param subida    cuántos BPM sube de principio a fin (0 = mantener)
 * @param cuantos   largo de la lista
 * @param corregir  «corregir desfase» de Armonía
 * @param azar      función aleatoria (en las pruebas se fija para que el resultado sea repetible)
 */
export function generarRadio(temas, { semilla, bpmInicio = 120, subida = 10, cuantos = 15, azar = Math.random, corregir = true }) {
  const disponibles = temas.filter((t) => t.clave && t.bpm)
  const usados = new Set()
  const lista = []
  let actual = null

  for (let i = 0; i < cuantos; i++) {
    // Dónde debería estar el BPM en este punto de la subida
    const objetivo = bpmInicio + subida * (cuantos > 1 ? i / (cuantos - 1) : 0)
    let candidatos
    if (!actual) {
      candidatos = disponibles.filter((t) => t.clave.id === semilla?.id && !usados.has(t.id))
    } else {
      const rel = clavesRelacionadas(actual.clave, corregir)
      const permitidas = new Set(CATEGORIAS.flatMap((c) => rel[c.id].map((k) => k.id)))
      candidatos = disponibles.filter((t) => !usados.has(t.id) && permitidas.has(t.clave.id))
    }
    // Si la armonía deja sin opciones, se relaja antes que cortar la lista
    if (!candidatos.length) candidatos = disponibles.filter((t) => !usados.has(t.id))
    if (!candidatos.length) break
    candidatos.sort((a, b) => Math.abs(a.bpm - objetivo) - Math.abs(b.bpm - objetivo))
    // Un poco de variedad: entre los tres mejores, no siempre el primero
    const elegido = candidatos[Math.floor(azar() * Math.min(3, candidatos.length))]
    usados.add(elegido.id)
    lista.push(elegido)
    actual = elegido
  }
  return lista
}

/** Quita temas repetidos (mismo artista y título) para que la radio no suene dos veces lo mismo. */
export function sinRepetidos(temas) {
  const vistos = new Set()
  return temas.filter((t) => {
    const clave = `${t.artista}|${t.titulo}`.toLowerCase().replace(/\s+/g, ' ').trim()
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
}
