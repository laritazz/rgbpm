// Fragmentos privados: cada tema se guarda en el servidor como un trozo de ~90 s
// con un nombre anónimo. El mismo código calcula el nombre en tu Mac (script) y en la web.

/** La ruta de Traktor tal cual la guarda RGBPM, normalizada: sin mayúsculas y con los acentos compuestos. */
export const claveRuta = (ruta) => ruta.normalize('NFC').toLowerCase()

/** 16 caracteres del SHA-256 de un texto: sirve de nombre y no deja leer lo que había dentro. */
async function resumen(texto) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return [...new Uint8Array(bytes)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Nombre del fragmento: sale de la ruta. Sin títulos ni artistas. */
export const idFragmento = (ruta) => resumen(claveRuta(ruta))

/** Artista y título normalizados: sin mayúsculas, acentos compuestos y espacios de más. */
const limpio = (texto) => String(texto ?? '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()
export const claveTitulo = ({ artista, titulo }) => `${limpio(artista)}\u0000${limpio(titulo)}`

/**
 * Segunda llave para temas sin ruta (la demo, o un móvil sin tu colección):
 * el servidor guarda resumen(artista + título) → fragmento, nunca el texto.
 */
export const idTitulo = (tema) => resumen(`t:${claveTitulo(tema)}`)

/**
 * Dónde empieza el fragmento: 8 compases antes de tu primer hotcue (la entrada o el drop).
 * Los cues de los 5 primeros segundos no cuentan (suelen marcar el inicio del tema).
 * Sin cues, al 30 % del tema. Nunca se sale del tema.
 */
export function inicioFragmento({ duracion, bpm, cues = [] }, segundos = 90) {
  const total = duracion ?? 0
  const primerCue = cues.filter((c) => c >= 5).sort((a, b) => a - b)[0]
  const compases = bpm ? (8 * 4 * 60) / bpm : 16
  let inicio = primerCue != null ? primerCue - compases : total * 0.3
  if (total > 0) inicio = Math.min(inicio, total - segundos)
  return Math.max(0, Math.round(inicio * 10) / 10)
}
