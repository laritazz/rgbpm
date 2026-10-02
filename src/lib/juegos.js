// Juegos para aprender a mezclar con tus temas. Solo reglas: elegir rondas y puntuar.
// La parte de sonido y pantalla vive en features/juego.
import { CATEGORIAS, categoriaDe, notaBpm } from './armonia.js'

const barajar = (lista, azar) => lista.map((x) => [azar(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x)
const elegir = (lista, azar) => (lista.length ? lista[Math.floor(azar() * lista.length)] : null)

export const ACIERTO = { id: 'clavado', nombre: '¡Bien!', animo: 'euforia' }
export const FALLO = { id: 'lejos', nombre: 'No era esa', animo: 'calma' }

// ——— ¿Pega o choca? ———

export const RESPUESTAS_PEGA = [...CATEGORIAS.map(({ id, nombre, color, texto }) => ({ id, nombre, color, texto })), { id: 'choque', nombre: 'Contraste', color: '#8C8C8C', texto: 'No casan por tono: contraste buscado o tropiezo' }]

/**
 * Parejas de temas: dos de cada tres pegan (con alguna de tus 7 categorías) y una choca.
 * Con BPM parecido (±8 %) siempre que se pueda: así solo cuenta el tono.
 * Cada ronda trae 4 respuestas posibles, una buena.
 */
export function rondasPega(temas, { n = 6, corregir = true, azar = Math.random } = {}) {
  const con = temas.filter((t) => t.clave)
  const usados = new Set()
  const rondas = []
  for (let intento = 0; intento < n * 8 && rondas.length < n; intento++) {
    const a = elegir(con.filter((t) => !usados.has(t.id)), azar)
    if (!a) break
    const quiereChoque = rondas.length % 3 === 2
    const candidatos = con.filter((b) => b.id !== a.id && !usados.has(b.id) && Boolean(categoriaDe(a.clave, b.clave, corregir)) !== quiereChoque && b.clave.id !== a.clave.id)
    const cerca = candidatos.filter((b) => a.bpm && b.bpm && Math.abs(notaBpm(a.bpm, b.bpm).porcentaje) <= 8)
    const b = elegir(cerca.length ? cerca : candidatos, azar)
    if (!b) continue
    const correcta = categoriaDe(a.clave, b.clave, corregir)?.id ?? 'choque'
    const otras = barajar(RESPUESTAS_PEGA.filter((r) => r.id !== correcta), azar).slice(0, 3)
    rondas.push({ a, b, correcta, opciones: barajar([RESPUESTAS_PEGA.find((r) => r.id === correcta), ...otras], azar) })
    usados.add(a.id)
    usados.add(b.id)
  }
  return rondas
}

export const puntuarEleccion = (correcta, elegida) => (correcta === elegida ? { puntos: 100, veredicto: ACIERTO } : { puntos: 0, veredicto: FALLO })

// ——— ¿Dónde cae? ———

const VEREDICTOS_CAE = {
  clavado: { id: 'clavado', nombre: '¡Clavado!', animo: 'euforia' },
  relativa: { id: 'relativa', nombre: 'Su relativa', animo: 'feliz' },
  vecina: { id: 'vecina', nombre: 'Al lado', animo: 'sorpresa' },
  lejos: { id: 'lejos', nombre: 'Lejos', animo: 'calma' },
}

/** Temas con clave, todos de claves distintas. */
export function rondasCae(temas, { n = 5, azar = Math.random } = {}) {
  const vistas = new Set()
  return barajar(temas.filter((t) => t.clave), azar).filter((t) => !vistas.has(t.clave.id) && vistas.add(t.clave.id)).slice(0, n)
}

/**
 * Tocar el tono exacto vale 100. La relativa (misma escala) 60 y la vecina (una quinta) 40: en cabina,
 * equivocarte ahí todavía mezcla. Con pista (mayor o menor), un 30 % menos.
 */
export function puntuarCae(real, elegida, { corregir = true, pista = false } = {}) {
  const factor = pista ? 0.7 : 1
  if (real.id === elegida.id) return { puntos: Math.round(100 * factor), veredicto: VEREDICTOS_CAE.clavado }
  const categoria = categoriaDe(real, elegida, corregir)?.id
  if (categoria === 'clavado') return { puntos: Math.round(60 * factor), veredicto: VEREDICTOS_CAE.relativa }
  if (categoria === 'sube' || categoria === 'baja') return { puntos: Math.round(40 * factor), veredicto: VEREDICTOS_CAE.vecina }
  return { puntos: 0, veredicto: VEREDICTOS_CAE.lejos }
}

// ——— ¿Cuál corre más? ———

/** Diferencia de tempo de cada ronda (%): cada vez más fina. */
export const DIFERENCIAS = [10, 7, 5, 3.5, 2.5, 1.5]

/**
 * Parejas de temas cuya diferencia de tempo se acerca a la de cada ronda.
 * Si tu biblioteca no tiene una pareja así, la ronda es con dos ritmos (sin tema).
 */
export function rondasCorre(temas, { azar = Math.random } = {}) {
  const orden = temas.filter((t) => t.bpm >= 70 && t.bpm <= 190).sort((a, b) => a.bpm - b.bpm)
  const usados = new Set()
  return DIFERENCIAS.map((objetivo, i) => {
    let mejor = null
    for (const a of barajar(orden, azar).slice(0, 150)) {
      if (usados.has(a.id)) continue
      const b = masCercano(orden, a.bpm * (1 + objetivo / 100), (t) => t.id !== a.id && !usados.has(t.id))
      if (!b) continue
      const desvio = Math.abs(((b.bpm - a.bpm) / a.bpm) * 100 - objetivo)
      if (!mejor || desvio < mejor.desvio) mejor = { a, b, desvio }
    }
    let lento
    let rapido
    if (mejor && mejor.desvio <= objetivo * 0.35) {
      ;[lento, rapido] = [mejor.a, mejor.b]
      usados.add(lento.id)
      usados.add(rapido.id)
    } else {
      const base = 110 + Math.round(azar() * 30)
      lento = { id: `ritmo-${i}-a`, titulo: 'Ritmo', artista: 'RGBPM', bpm: base }
      rapido = { id: `ritmo-${i}-b`, titulo: 'Ritmo', artista: 'RGBPM', bpm: Math.round(base * (1 + objetivo / 100) * 10) / 10 }
    }
    const alReves = azar() < 0.5
    return { a: alReves ? rapido : lento, b: alReves ? lento : rapido, correcta: alReves ? 'a' : 'b', diferencia: objetivo }
  })
}

function masCercano(orden, bpm, vale) {
  let [bajo, alto] = [0, orden.length - 1]
  while (bajo < alto) {
    const medio = (bajo + alto) >> 1
    if (orden[medio].bpm < bpm) bajo = medio + 1
    else alto = medio
  }
  let mejor = null
  for (let d = 0; d < 12; d++) {
    for (const i of [bajo - d, bajo + d]) {
      const t = orden[i]
      if (t && vale(t) && (!mejor || Math.abs(t.bpm - bpm) < Math.abs(mejor.bpm - bpm))) mejor = t
    }
  }
  return mejor
}

// ——— Cuadra el tempo ———

/** Rondas: un tempo de referencia y el tuyo, desviado entre un 3 y un 9 %. */
export function rondasCuadra({ n = 5, azar = Math.random } = {}) {
  return Array.from({ length: n }, () => {
    const referencia = Math.round((100 + azar() * 50) * 10) / 10
    const desvio = (3 + azar() * 6) * (azar() < 0.5 ? -1 : 1)
    return { referencia, inicio: Math.round(referencia * (1 + desvio / 100) * 10) / 10 }
  })
}

/** 0,25 % de error son 90 puntos; a partir de 2,5 % no puntúa. */
export function puntuarCuadra(referencia, tuyo) {
  const error = (Math.abs(tuyo - referencia) / referencia) * 100
  const puntos = Math.max(0, Math.round(100 - error * 40))
  const veredicto = error <= 0.3 ? { id: 'clavado', nombre: '¡Cuadrado!', animo: 'euforia' } : error <= 0.8 ? { id: 'cerca', nombre: 'Muy cerca', animo: 'feliz' } : error <= 1.5 ? { id: 'casi', nombre: 'Casi', animo: 'sorpresa' } : { id: 'lejos', nombre: 'Se te va', animo: 'calma' }
  return { puntos, error: Math.round(error * 100) / 100, veredicto }
}
