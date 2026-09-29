// Índice de archivos de música: encuentra el archivo de cada tema de Traktor
// en tus carpetas o en tu servidor, aunque estén organizados de otra forma.

export const EXTENSIONES_AUDIO = ['mp3', 'm4a', 'aac', 'wav', 'aif', 'aiff', 'flac', 'ogg', 'opus']

const extension = (nombre) => nombre.split('.').pop()?.toLowerCase() ?? ''
export const esAudio = (nombre) => EXTENSIONES_AUDIO.includes(extension(nombre)) && !nombre.startsWith('._')

// macOS guarda algunos acentos descompuestos (NFD): se normaliza para que «Canción» sea siempre igual
export const normalizar = (s) => s.normalize('NFC').toLowerCase()

const partes = (ruta) => normalizar(ruta).split('/').filter(Boolean)

/** Índice por nombre de archivo. `rutas`: rutas relativas («Music/Amelie Lens/01 In Silence.mp3»). */
export function crearIndice(rutas) {
  const indice = new Map()
  for (const ruta of rutas) {
    const nombre = partes(ruta).at(-1)
    if (!nombre || !esAudio(nombre)) continue
    if (!indice.has(nombre)) indice.set(nombre, [])
    indice.get(nombre).push(ruta)
  }
  return indice
}

/**
 * Busca el archivo de un tema. Si hay varios con el mismo nombre («01 Intro.mp3»),
 * gana el que comparte más carpetas finales con la ruta de Traktor (artista, álbum…).
 */
export function buscarArchivo(indice, tema) {
  if (!tema?.archivo) return null
  const candidatos = indice.get(normalizar(tema.archivo))
  if (!candidatos?.length) return null
  if (candidatos.length === 1) return candidatos[0]
  const carpetasTema = partes(tema.ruta ?? '').slice(0, -1).reverse()
  const puntos = (ruta) => {
    const carpetas = partes(ruta).slice(0, -1).reverse()
    let n = 0
    while (n < carpetas.length && n < carpetasTema.length && carpetas[n] === carpetasTema[n]) n++
    return n
  }
  return candidatos.reduce((mejor, c) => (puntos(c) > puntos(mejor) ? c : mejor))
}

/** Formatos que este navegador sabe reproducir (Safari, por ejemplo, no abre FLAC). */
const TIPOS = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', aif: 'audio/aiff', aiff: 'audio/aiff', flac: 'audio/flac', ogg: 'audio/ogg', opus: 'audio/ogg; codecs=opus' }
export function sePuedeReproducir(nombre, audio = typeof Audio !== 'undefined' ? new Audio() : null) {
  const tipo = TIPOS[extension(nombre)]
  return Boolean(tipo && audio?.canPlayType(tipo))
}
