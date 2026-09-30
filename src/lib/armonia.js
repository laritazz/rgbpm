// Reglas de mezcla de Laritazz: siete categorías, en desplazamientos Open Key.
// Portado de RGBPM.html. `corregir` arregla el desfase de la columna de mayores de la hoja
// original (así Clavado es la relativa de verdad: La menor con Do mayor).
import { clave } from './claves'

const REGLAS = {
  menor: {
    clavado: [[0, 'm'], [-1, 'd']],
    subidon: [[2, 'm'], [7, 'm']],
    sube: [[1, 'm'], [0, 'd']],
    baja: [[-1, 'm']],
    tercera: [[9, 'm']],
    abre: [[3, 'd'], [9, 'd']],
    cierra: [],
  },
  mayor: {
    clavado: [[0, 'd'], [1, 'm']],
    subidon: [[2, 'd'], [7, 'd']],
    sube: [[1, 'd']],
    baja: [[-1, 'd']],
    tercera: [[9, 'd']],
    abre: [],
    cierra: [[9, 'm'], [3, 'm']],
  },
}

export const CATEGORIAS = [
  { id: 'clavado', nombre: 'Clavado', peso: 100, color: '#FFFFFF', texto: 'Mezcla limpia, el pilar del set' },
  { id: 'subidon', nombre: 'Subidón', peso: 78, color: '#FF4D6D', texto: 'Sube la energía de golpe' },
  { id: 'sube', nombre: 'Sube', peso: 84, color: '#FFB319', texto: 'Una quinta arriba: empuja sin romper' },
  { id: 'baja', nombre: 'Baja', peso: 84, color: '#6FA8FF', texto: 'Una quinta abajo: afloja sin cortar' },
  { id: 'tercera', nombre: 'Tercera', peso: 80, color: '#B983FF', texto: 'Salto de tercera, cambio de color' },
  { id: 'abre', nombre: 'Abre', peso: 66, color: '#FF9AD5', texto: 'Pasa a mayor: das aire, animas' },
  { id: 'cierra', nombre: 'Cierra', peso: 66, color: '#A7A7A7', texto: 'Pasa a menor: bajas, invitas a respirar' },
]

/** Claves que pegan con `semilla`, agrupadas por categoría. */
export function clavesRelacionadas(semilla, corregir = true) {
  const reglas = semilla.menor ? REGLAS.menor : REGLAS.mayor
  const salida = {}
  for (const c of CATEGORIAS) {
    salida[c.id] = reglas[c.id].map(([desplazamiento, modo]) => {
      const destinoMenor = modo === 'm'
      let n = semilla.open + desplazamiento
      if (corregir && destinoMenor !== semilla.menor) n += semilla.menor ? 1 : -1
      return clave(n, destinoMenor)
    })
  }
  return salida
}

export function categoriaDe(desde, hacia, corregir = true) {
  const rel = clavesRelacionadas(desde, corregir)
  return CATEGORIAS.find((c) => rel[c.id].some((k) => k.id === hacia.id)) ?? null
}

/** Nota del tempo (0–100). Admite doble y mitad de tempo, con penalización. */
export function notaBpm(a, b, tolerancia = 6) {
  if (!a || !b) return { nota: 60, porcentaje: null, relacion: 1 }
  let mejor = null
  for (const [valor, relacion] of [[b, 1], [b * 2, 2], [b / 2, 0.5]]) {
    const porcentaje = ((valor - a) / a) * 100
    if (!mejor || Math.abs(porcentaje) < Math.abs(mejor.porcentaje)) mejor = { porcentaje, relacion }
  }
  const tolPct = (tolerancia / a) * 100
  let nota = 100 - (Math.abs(mejor.porcentaje) / Math.max(tolPct, 0.01)) * 45
  if (mejor.relacion !== 1) nota -= 10
  return { nota: Math.max(0, Math.min(100, nota)), ...mejor }
}

export function notaTransicion(desde, hacia, corregir = true) {
  if (!desde.clave || !hacia.clave) return null
  const categoria = categoriaDe(desde.clave, hacia.clave, corregir)
  if (!categoria) return null
  const bpm = notaBpm(desde.bpm, hacia.bpm)
  return { categoria, bpm, nota: Math.round(categoria.peso * 0.62 + bpm.nota * 0.38) }
}

/** Margen de tempo por defecto (± %): lo que alcanza el pitch de un plato sin que se note. */
export const TOLERANCIA = 8

/** Los mejores temas para mezclar después de `tema`, dentro del margen de BPM. */
export function compatibles(tema, biblioteca, limite = 8, { corregir = true, tolerancia = TOLERANCIA } = {}) {
  const salida = []
  for (const otro of biblioteca) {
    if (otro.id === tema.id) continue
    const t = notaTransicion(tema, otro, corregir)
    if (t && Math.abs(t.bpm.porcentaje ?? 99) <= tolerancia) salida.push({ tema: otro, ...t })
  }
  return salida.sort((a, b) => b.nota - a.nota).slice(0, limite)
}

/** Solo con el tempo (sin clave): los temas más cercanos en BPM, admitiendo doble y mitad. */
export function porTempo(bpm, biblioteca, limite = 6, margen = 4) {
  return biblioteca
    .filter((t) => t.bpm)
    .map((t) => ({ tema: t, bpm: notaBpm(bpm, t.bpm) }))
    .filter((o) => Math.abs(o.bpm.porcentaje) <= margen)
    .sort((a, b) => Math.abs(a.bpm.porcentaje) - Math.abs(b.bpm.porcentaje))
    .slice(0, limite)
}
