// Lector del collection.nml de Traktor. Todo ocurre en el navegador: nada sale del equipo.
import { leerClave } from './claves'

// Lo que NO es una canción: kits, one-shots, logos sonoros… (reglas del motor original)
const RUTA_SAMPLE = /(native instruments|maschine|battery|komplete|reaktor|kontakt|expansion|drum ?kit|one ?shots?|oneshot|samples?|loops?|sound ?pack|construction ?kit|library\/sounds|factory ?library|ableton\/|logic\/|serato\/sample)/i
const MATERIAL_ARCHIVO = /(getty ?images|shutterstock|audiojungle|envato|pond5|artlist|epidemic ?sound|sonic ?logo|audio ?logo|logo ?sting|\blogos?\b|jingle|bumper|cortinilla|whoosh|transition ?\d|ident\b|\b\d+\s?s(ec)?\b\s*$)/i
const TITULO_SAMPLE = /\b(kick|snare|clap|hi-?hat|hihat|closed hat|open hat|tom|rim|shaker|perc|crash|ride|cymbal|fx|riser|downlifter|impact|sweep|noise|sub ?bass|stab|one ?shot|loop \d|bpm loop)\b/i
const VIDEO = /\.(mp4|mov|m4v|webm|avi|mkv)$/i
const DURACION_MINIMA = 30

export function esSample(t) {
  if (t.duracion != null && t.duracion > 0 && t.duracion < DURACION_MINIMA) return true
  const ruta = `${t.ruta ?? ''} ${t.archivo ?? ''}`
  if (RUTA_SAMPLE.test(ruta) || MATERIAL_ARCHIVO.test(ruta) || VIDEO.test(ruta)) return true
  const nombre = `${t.artista ?? ''} ${t.titulo ?? ''}`.trim()
  if (nombre && MATERIAL_ARCHIVO.test(nombre)) return true
  return Boolean(nombre && TITULO_SAMPLE.test(nombre) && (t.duracion == null || t.duracion < 90))
}

// Traktor identifica cada tema en las playlists por «VOLUMEN/:carpeta/:archivo»
const claveRuta = (volumen, carpeta, archivo) => `${volumen}${carpeta}${archivo}`

/** Convierte el texto de un .nml en { temas, playlists, descartados }. */
export function leerNml(texto) {
  const doc = new DOMParser().parseFromString(texto, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('El archivo no es un .nml válido de Traktor')

  const porRuta = new Map()
  const temas = []
  let descartados = 0

  doc.querySelectorAll('COLLECTION > ENTRY').forEach((e, i) => {
    const titulo = e.getAttribute('TITLE') ?? ''
    const artista = e.getAttribute('ARTIST') ?? ''
    if (!titulo && !artista) return
    const loc = e.querySelector('LOCATION')
    const info = e.querySelector('INFO')
    const tempo = e.querySelector('TEMPO')
    const mk = e.querySelector('MUSICAL_KEY')

    // Manda el análisis de Traktor (MUSICAL_KEY); la etiqueta del archivo queda de recambio
    const clave = (mk && leerClave(mk.getAttribute('VALUE'))) || (info && leerClave(info.getAttribute('KEY'))) || null
    const bpm = tempo?.getAttribute('BPM') ? Math.round(parseFloat(tempo.getAttribute('BPM')) * 10) / 10 : null
    const volumen = loc?.getAttribute('VOLUME') ?? ''
    const carpeta = loc?.getAttribute('DIR') ?? ''
    const archivo = loc?.getAttribute('FILE') ?? ''

    const tema = {
      id: `t${i}`,
      titulo,
      artista,
      bpm,
      clave,
      genero: info?.getAttribute('GENRE') ?? '',
      duracion: info?.getAttribute('PLAYTIME') ? Number(info.getAttribute('PLAYTIME')) : null,
      ruta: carpeta.replace(/\/:/g, '/') + archivo,
      archivo,
    }
    if (esSample(tema)) {
      descartados++
      return
    }
    temas.push(tema)
    porRuta.set(claveRuta(volumen, carpeta, archivo), tema.id)
  })

  const playlists = []
  doc.querySelectorAll('NODE[TYPE="PLAYLIST"]').forEach((nodo) => {
    const nombre = nodo.getAttribute('NAME') ?? ''
    if (!nombre || nombre.startsWith('_')) return
    const ids = [...nodo.querySelectorAll('PRIMARYKEY')]
      .map((pk) => porRuta.get(pk.getAttribute('KEY')))
      .filter(Boolean)
    if (ids.length) playlists.push({ id: `p${playlists.length}`, nombre, temas: ids })
  })

  return { temas, playlists, descartados }
}
