// Sets: salud, reordenado automático, cambiazos, importar y exportar.
// Portado de RGBPM.html (renderSalud, cadena, sesNml, sesM3u) y ampliado.
import { CATEGORIAS, clavesRelacionadas, compatibles, notaBpm, notaTransicion } from './armonia.js'
import { TODAS_LAS_CLAVES, openAPc } from './claves.js'

// ——— Salud ———

/**
 * Cómo de bien engancha el set: % de transiciones que pegan, nota media,
 * choques de tono, saltos grandes de BPM y cuántas de cada categoría.
 */
export function saludSet(temas, tolerancia = 6) {
  const res = { total: Math.max(0, temas.length - 1), choques: 0, saltos: 0, media: 0, porcentaje: 0, categorias: {} }
  let suma = 0
  for (let i = 1; i < temas.length; i++) {
    const t = notaTransicion(temas[i - 1], temas[i])
    if (!t) {
      res.choques++
      continue
    }
    res.categorias[t.categoria.id] = (res.categorias[t.categoria.id] ?? 0) + 1
    suma += t.nota
    if (temas[i - 1].bpm && temas[i].bpm && Math.abs(t.bpm.porcentaje) > (tolerancia / temas[i - 1].bpm) * 100) res.saltos++
  }
  const buenas = res.total - res.choques
  res.media = buenas ? Math.round(suma / buenas) : 0
  res.porcentaje = res.total ? Math.round((buenas / res.total) * 100) : 0
  return res
}

/** Transición entre dos temas seguidos, para pintarla entre filas. null = chocan (o falta clave). */
export function transicion(a, b) {
  const t = notaTransicion(a, b)
  const diferencia = a.bpm && b.bpm ? Math.round((b.bpm - a.bpm) * 10) / 10 : null
  return { ...(t ?? { categoria: null, nota: null }), diferencia }
}

export function duracionTotal(temas) {
  return temas.reduce((s, t) => s + (t.duracion ?? 0), 0)
}

// ——— Reordenar automáticamente ———

// Peso de la mejor categoría entre dos claves, precalculado una vez (24 × 24)
const PESOS = new Map(
  TODAS_LAS_CLAVES.map((desde) => {
    const rel = clavesRelacionadas(desde)
    const interior = new Map()
    for (const c of CATEGORIAS) for (const k of rel[c.id]) if (!interior.has(k.id) || interior.get(k.id) < c.peso) interior.set(k.id, c.peso)
    return [desde.id, interior]
  })
)

/**
 * Nota de poner `b` después de `a` para el orden automático.
 * El BPM pesa más que el tono a propósito: armando el set solo, no debe dar saltos de tempo grandes.
 */
export function puntosPar(a, b, tolerancia = 6) {
  const peso = PESOS.get(a.clave.id)?.get(b.clave.id)
  if (peso === undefined) return -1 // choque armónico
  const bpm = notaBpm(a.bpm, b.bpm, tolerancia)
  let s = peso * 0.3 + bpm.nota * 0.7
  const pct = Math.abs(bpm.porcentaje ?? 0)
  if (a.bpm && b.bpm && pct > 25) s -= (pct - 25) * 1.5
  if (a.bpm && b.bpm && b.bpm >= a.bpm) s += 3 // mejor ir subiendo
  return s
}

function cadena(pool, inicio, tolerancia) {
  const resto = pool.slice()
  const orden = [resto.splice(inicio, 1)[0]]
  let total = 0
  while (resto.length) {
    const ultimo = orden.at(-1)
    let mejor = -Infinity
    let indice = 0
    for (let i = 0; i < resto.length; i++) {
      const s = puntosPar(ultimo, resto[i], tolerancia)
      if (s > mejor) {
        mejor = s
        indice = i
      }
    }
    total += Math.max(0, mejor)
    orden.push(resto.splice(indice, 1)[0])
  }
  return { orden, total }
}

/**
 * Reordena encadenando por armonía y evitando saltos de BPM.
 * Prueba varios arranques (los de BPM más bajo) y se queda con la mejor cadena.
 * Los temas sin clave quedan al final, en su orden.
 */
export function reordenar(temas, tolerancia = 6) {
  const pool = temas.filter((t) => t.clave)
  const sinClave = temas.filter((t) => !t.clave)
  if (pool.length < 2) return { orden: temas, arranques: 0 }
  const porBpm = pool.map((_, i) => i).sort((a, b) => (pool[a].bpm ?? 0) - (pool[b].bpm ?? 0))
  const arranques = pool.length > 400 ? 3 : pool.length > 120 ? 8 : Math.min(25, pool.length)
  let mejor = null
  for (let s = 0; s < arranques; s++) {
    const r = cadena(pool, porBpm[s], tolerancia)
    if (!mejor || r.total > mejor.total) mejor = r
  }
  return { orden: [...mejor.orden, ...sinClave], arranques }
}

// ——— Cambiazo y candidatos ———

/** Otros temas que pueden ocupar el mismo hueco: misma clave y BPM parecido (±4 %). */
export function cambiazos(tema, biblioteca, excluir = new Set(), limite = 8) {
  if (!tema.clave) return []
  return biblioteca
    .filter((t) => t.id !== tema.id && !excluir.has(t.id) && t.clave?.id === tema.clave.id && t.bpm)
    .map((t) => ({ tema: t, diferencia: Math.abs(notaBpm(tema.bpm, t.bpm).porcentaje ?? 99) }))
    .filter((o) => o.diferencia <= 4)
    .sort((a, b) => a.diferencia - b.diferencia)
    .slice(0, limite)
}

/** Qué meter después del tema ancla, sin repetir lo que ya está en el set. */
export function candidatosTras(ancla, biblioteca, excluir = new Set(), limite = 12) {
  if (!ancla?.clave) return []
  return compatibles(ancla, biblioteca.filter((t) => !excluir.has(t.id)), limite)
}

// ——— Exportar ———

const xml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** "/Users/x/y/" → "/:Users/:x/:y/:" (así escribe Traktor las carpetas) */
const aDirNml = (ruta) => `${ruta.replace(/\/$/, '').split('/').map((s) => (s ? `/:${s}` : '')).join('')}/:`

function ubicacion(t) {
  if (t.carpeta && t.archivo) return { vol: t.volumen || 'Macintosh HD', dir: t.carpeta, file: t.archivo }
  const ruta = t.ruta ?? ''
  const corte = ruta.lastIndexOf('/')
  if (corte < 0) return null
  return { vol: t.volumen || 'Macintosh HD', dir: aDirNml(ruta.slice(0, corte + 1)), file: ruta.slice(corte + 1) }
}

/** MUSICAL_KEY de Traktor: 0–11 mayores (Do…Si), 12–23 menores. */
export const claveTraktor = (k) => (k ? (k.menor ? 12 : 0) + openAPc(k.open, k.menor) : null)

/** Playlist de Traktor: en Traktor, clic derecho en Playlists → Import Playlist. */
export function exportarNml(temas, nombre = 'Set RGBPM', uuid = crypto.randomUUID().replace(/-/g, '')) {
  const conSitio = temas.map((t) => ({ t, u: ubicacion(t) })).filter((x) => x.u)
  const entradas = conSitio
    .map(({ t, u }) => {
      const mk = claveTraktor(t.clave)
      return [
        `<ENTRY TITLE="${xml(t.titulo)}" ARTIST="${xml(t.artista)}">`,
        `<LOCATION DIR="${xml(u.dir)}" FILE="${xml(u.file)}" VOLUME="${xml(u.vol)}" VOLUMEID="${xml(u.vol)}"></LOCATION>`,
        `<INFO GENRE="${xml(t.genero)}"${t.duracion ? ` PLAYTIME="${t.duracion}"` : ''}></INFO>`,
        t.bpm ? `<TEMPO BPM="${t.bpm.toFixed(6)}" BPM_QUALITY="100.000000"></TEMPO>` : '',
        mk !== null ? `<MUSICAL_KEY VALUE="${mk}"></MUSICAL_KEY>` : '',
        '</ENTRY>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')
  const claves = conSitio.map(({ u }) => `<ENTRY><PRIMARYKEY TYPE="TRACK" KEY="${xml(u.vol + u.dir + u.file)}"></PRIMARYKEY></ENTRY>`).join('\n')
  const n = conSitio.length
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<NML VERSION="19">
<HEAD COMPANY="www.native-instruments.com" PROGRAM="Traktor"></HEAD>
<MUSICFOLDERS></MUSICFOLDERS>
<COLLECTION ENTRIES="${n}">
${entradas}
</COLLECTION>
<SETS ENTRIES="0"></SETS>
<PLAYLISTS>
<NODE TYPE="FOLDER" NAME="$ROOT">
<SUBNODES COUNT="1">
<NODE TYPE="PLAYLIST" NAME="${xml(nombre)}">
<PLAYLIST ENTRIES="${n}" TYPE="LIST" UUID="${uuid}">
${claves}
</PLAYLIST>
</NODE>
</SUBNODES>
</NODE>
</PLAYLISTS>
</NML>
`
}

const rutaAbsoluta = (t) => (t.volumen && t.volumen !== 'Macintosh HD' ? `/Volumes/${t.volumen}${t.ruta ?? ''}` : (t.ruta ?? t.archivo ?? t.titulo))

export function exportarM3u(temas) {
  return ['#EXTM3U', ...temas.flatMap((t) => [`#EXTINF:${t.duracion ?? 0},${t.artista} - ${t.titulo}`, rutaAbsoluta(t)])].join('\n') + '\n'
}

export function exportarTxt(temas, nombre = 'Set') {
  const lineas = temas.map((t, i) => `${String(i + 1).padStart(2, '0')}. ${t.artista} – ${t.titulo}  (${t.bpm ?? '—'} BPM · ${t.clave?.id ?? '—'})`)
  return `${nombre}\n\n${lineas.join('\n')}\n`
}

export function exportarCsv(temas) {
  const celda = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const filas = temas.map((t, i) => [i + 1, t.artista, t.titulo, t.bpm, t.clave?.id, t.clave?.camelot, t.clave?.nombre, t.duracion].map(celda).join(','))
  // BOM: así Excel abre bien los acentos
  return '﻿' + ['"#","Artista","Título","BPM","Open Key","Camelot","Tono","Segundos"', ...filas].join('\n') + '\n'
}

// ——— Importar ———

const normal = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.(mp3|wav|aiff?|m4a|flac|ogg)$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/**
 * Lee un set de un archivo (.nml de Traktor, .m3u o .txt) y lo casa con tu biblioteca:
 * por clave de Traktor, por nombre de archivo o por «Artista - Título».
 */
export function importarSet(texto, nombreArchivo, biblioteca) {
  const porClave = new Map()
  const porArchivo = new Map()
  const porNombre = new Map()
  for (const t of biblioteca) {
    const u = ubicacion(t)
    if (u) porClave.set(u.vol + u.dir + u.file, t.id)
    if (t.archivo) porArchivo.set(normal(t.archivo), t.id)
    porNombre.set(normal(`${t.artista} ${t.titulo}`), t.id)
  }

  let pistas = []
  if (/\.nml$/i.test(nombreArchivo)) {
    pistas = [...texto.matchAll(/<PRIMARYKEY[^>]*KEY="([^"]+)"/g)].map((m) => {
      const clave = m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      return { clave, archivo: clave.split('/:').pop() }
    })
  } else if (/\.m3u8?$/i.test(nombreArchivo)) {
    pistas = texto
      .split(/\r?\n/)
      .filter((l) => l.trim() && !l.startsWith('#'))
      .map((l) => ({ archivo: l.trim().split(/[\\/]/).pop() }))
  } else {
    pistas = texto
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*\d+[.)-]?\s*/, '').replace(/\s*\(.*BPM.*\)\s*$/, '').trim())
      .filter((l) => l.includes('-') || l.includes('–'))
      .map((l) => ({ nombre: l }))
  }

  const ids = []
  let sinCasar = 0
  for (const p of pistas) {
    const id = (p.clave && porClave.get(p.clave)) || (p.archivo && porArchivo.get(normal(p.archivo))) || (p.nombre && porNombre.get(normal(p.nombre)))
    if (id && !ids.includes(id)) ids.push(id)
    else if (!id) sinCasar++
  }
  return { ids, sinCasar }
}

/** Colores del set, en orden: sirven para su portada Pantone. */
export const coloresSet = (temas, colorBpm, maximo = 12) => {
  if (!temas.length) return []
  const paso = Math.max(1, temas.length / maximo)
  const salida = []
  for (let i = 0; i < temas.length && salida.length < maximo; i += paso) salida.push(colorBpm(temas[Math.floor(i)].bpm))
  return salida
}
