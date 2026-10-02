// Rueda armónica: qué claves pegan con una semilla y el set sugerido desde ella,
// con temas reales. Portado de la vista «Rueda» de RGBPM.html.
import { CATEGORIAS, TOLERANCIA, clavesRelacionadas, notaBpm } from './armonia.js'

/** Para pintar la rueda: cada clave que pega → su categoría (gana la primera, la más limpia). */
export function relacionPorClave(semilla, corregir = true) {
  const mapa = new Map()
  if (!semilla) return mapa
  const rel = clavesRelacionadas(semilla, corregir)
  for (const c of CATEGORIAS) for (const k of rel[c.id]) if (!mapa.has(k.id) && k.id !== semilla.id) mapa.set(k.id, c)
  return mapa
}

/** Azar repetible: con la misma semilla, la misma tirada. Así «Usar este set» guarda justo lo que ves. */
export function azarConSemilla(semilla) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Cómo de bien sigue un tema al anterior en tempo. Elige solo, así que castiga
// los saltos fuera del margen y los muy grandes aunque el ×2 / ÷2 «cuadre».
function puntosTempo(bpmPrevio, tema, tolerancia) {
  if (!bpmPrevio || !tema.bpm) return 50
  const b = notaBpm(bpmPrevio, tema.bpm, (bpmPrevio * tolerancia) / 100)
  const pct = Math.abs(b.porcentaje)
  let s = b.nota
  if (pct > tolerancia) s -= 20
  if (pct > 25) s -= (pct - 25) * 1.5
  return s
}

/**
 * Set sugerido desde una clave: en cada paso salta a una clave que pega (o se queda: Clavado)
 * y elige un tema tuyo en ella. Clave y tema se deciden juntos: pesa más no romper
 * el tempo que la categoría, así el camino esquiva las claves sin temas a tu BPM.
 * @param fijados   { [paso]: idTema } — lo que eliges tú en «Usar este»; lo demás se recalcula
 * @param bpmInicio de dónde sale el tempo del primer paso
 * @param azar      entre los mejores no siempre el primero: así hay «Otras canciones»
 */
// `subida`: BPM que sube (o baja, si es negativo) en cada paso. 0 = mantener el tempo.
export function sugerirSet(semilla, biblioteca, { pasos = 8, corregir = true, bpmInicio = null, subida = 0, tolerancia = TOLERANCIA, fijados = {}, azar = Math.random } = {}) {
  if (!semilla) return []
  const porClave = new Map()
  for (const t of biblioteca) if (t.clave) porClave.set(t.clave.id, [...(porClave.get(t.clave.id) ?? []), t])

  const usados = new Set()
  const clavesUsadas = new Map() // clave → cuántas veces ha salido
  const salida = []
  let actual = null
  let bpmPrevio = bpmInicio
  let base = bpmInicio // de dónde sale la curva de energía

  while (salida.length < pasos) {
    // Con subida, cada paso apunta a su BPM en la curva; sin ella, al tempo del tema anterior
    const objetivo = subida && base != null ? base + subida * salida.length : bpmPrevio
    const opciones = actual ? saltosPosibles(actual, clavesUsadas, corregir) : [{ clave: semilla, categoria: null }]
    if (!opciones.length) break

    const pares = []
    for (const o of opciones) {
      for (const tema of porClave.get(o.clave.id) ?? []) {
        if (!usados.has(tema.id)) pares.push({ ...o, tema, puntos: (o.categoria?.peso ?? 100) * 0.35 - (o.castigo ?? 0) + puntosTempo(objetivo, tema, tolerancia) * 0.65 })
      }
    }
    pares.sort((a, b) => b.puntos - a.puntos)

    let elegido = pares.find((p) => p.tema.id === fijados[salida.length])
    if (!elegido && pares.length) {
      const buenos = pares.filter((p) => p.puntos >= pares[0].puntos - 8).slice(0, 3)
      elegido = buenos[Math.floor(azar() * buenos.length)]
    }
    // Sin temas en ninguna clave posible: el paso queda vacío, en la clave de más peso
    const { clave, categoria } = elegido ?? opciones[0]
    const tema = elegido?.tema ?? null
    salida.push({
      clave,
      categoria,
      elegido: tema,
      alternativas: pares.filter((p) => p.clave.id === clave.id && p.tema.id !== tema?.id).slice(0, 4).map((p) => p.tema),
      diferencia: tema?.bpm && bpmPrevio && actual ? Math.round((tema.bpm - bpmPrevio) * 10) / 10 : null,
    })

    clavesUsadas.set(clave.id, (clavesUsadas.get(clave.id) ?? 0) + 1)
    actual = clave
    if (tema) {
      usados.add(tema.id)
      if (tema.bpm) bpmPrevio = tema.bpm
      if (base == null && tema.bpm) base = tema.bpm
    }
  }
  return salida
}

// Claves a las que se puede saltar desde `desde`, cada una con su mejor categoría.
// Quedarse en el mismo tono es Clavado. Repetir se permite, pero cada vez que una clave
// ya salió pierde puntos: el set puede quedarse (hipnosis) sin volverse monótono.
const REPETIR = 5
function saltosPosibles(desde, usadas, corregir) {
  const rel = clavesRelacionadas(desde, corregir)
  const mejor = new Map()
  for (const c of CATEGORIAS) {
    for (const k of rel[c.id]) if (!mejor.has(k.id) || mejor.get(k.id).categoria.peso < c.peso) mejor.set(k.id, { clave: k, categoria: c })
  }
  return [...mejor.values()].map((o) => ({ ...o, castigo: (usadas.get(o.clave.id) ?? 0) * REPETIR })).sort((a, b) => b.categoria.peso - b.castigo - (a.categoria.peso - a.castigo))
}

/**
 * Qué pega con una clave, categoría a categoría, con temas de tu biblioteca.
 * Con BPM, se quedan los que caben en el margen (contando doble y mitad) y se ordenan por cercanía.
 */
export function temasPorCategoria(semilla, biblioteca, { bpm = null, corregir = true, tolerancia = TOLERANCIA, limite = 30 } = {}) {
  if (!semilla) return []
  const rel = clavesRelacionadas(semilla, corregir)
  return CATEGORIAS.map((categoria) => {
    const ids = new Set(rel[categoria.id].map((k) => k.id))
    const todos = biblioteca
      .filter((t) => t.clave && ids.has(t.clave.id))
      .map((t) => ({ tema: t, tempo: bpm && t.bpm ? notaBpm(bpm, t.bpm) : null }))
    const dentro = bpm ? todos.filter((o) => !o.tempo || Math.abs(o.tempo.porcentaje) <= tolerancia) : todos
    dentro.sort((a, b) => Math.abs(a.tempo?.porcentaje ?? 999) - Math.abs(b.tempo?.porcentaje ?? 999))
    return { categoria, claves: rel[categoria.id], temas: dentro.slice(0, limite), total: dentro.length, fuera: todos.length - dentro.length }
  })
}
