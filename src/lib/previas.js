// Previas públicas: 30 s de cada tema desde el catálogo de Apple Music (iTunes Search API).
// Son legales para cualquiera que visite la web, a cambio de enlazar al tema en Apple Music.
// Orden de fuentes de audio: tu carpeta (tema entero) → tus fragmentos privados (90 s) → la previa (30 s).
import { claveTitulo } from './fragmentos.js'

export const BUSQUEDA = 'https://itunes.apple.com/search'

const normal = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9ñ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Lo que sobra para buscar: versiones, «feat.», «original mix», lo que va entre paréntesis
const RUIDO = /\b(feat|ft|featuring|prod|original mix|extended mix|radio edit|extended|edit|remaster(ed)?|vip)\b.*$/i

/** Título limpio para buscar: sin paréntesis ni versiones. */
export function tituloLimpio(titulo) {
  return normal(String(titulo ?? '').replace(/[([].*?[)\]]/g, ' ').replace(RUIDO, ' '))
}

/**
 * Qué buscar. Muchos temas de DJ traen el artista dentro del título («Artista - Tema»):
 * si no hay artista, se separa por el guion.
 */
export function consulta(tema) {
  let { artista, titulo } = tema
  if (!artista && /\s[-–]\s/.test(titulo ?? '')) [artista, titulo] = titulo.split(/\s[-–]\s/)
  return `${normal(artista).split(' ').slice(0, 3).join(' ')} ${tituloLimpio(titulo)}`.trim()
}

const palabras = (s) => new Set(normal(s).split(' ').filter((p) => p.length > 1))
function parecido(a, b) {
  const [x, y] = [palabras(a), palabras(b)]
  if (!x.size || !y.size) return 0
  let comunes = 0
  for (const p of x) if (y.has(p)) comunes++
  return comunes / Math.min(x.size, y.size)
}

/**
 * El resultado que de verdad es tu tema. Pesa más el título que el artista;
 * si no llega al 60 % de parecido, mejor sin previa que con otra canción.
 */
export function mejorCoincidencia(tema, resultados) {
  let { artista, titulo } = tema
  if (!artista && /\s[-–]\s/.test(titulo ?? '')) [artista, titulo] = titulo.split(/\s[-–]\s/)
  let mejor = null
  for (const r of resultados) {
    if (!r.previewUrl) continue
    const nota = parecido(tituloLimpio(titulo), tituloLimpio(r.trackName)) * 0.65 + (artista ? parecido(artista, r.artistName) : 0.5) * 0.35
    if (!mejor || nota > mejor.nota) mejor = { nota, r }
  }
  if (!mejor || mejor.nota < 0.6) return null
  return { url: mejor.r.previewUrl, enlace: mejor.r.trackViewUrl, artista: mejor.r.artistName, titulo: mejor.r.trackName }
}

/** Busca la previa de un tema. Devuelve null si no está en el catálogo. */
export async function buscarPrevia(tema, { pais = 'ES', pedir = fetch } = {}) {
  const q = consulta(tema)
  if (q.length < 3) return null
  const respuesta = await pedir(`${BUSQUEDA}?term=${encodeURIComponent(q)}&entity=song&limit=10&country=${pais}`)
  if (!respuesta.ok) throw new Error(`Apple Music respondió ${respuesta.status}`)
  const { results = [] } = await respuesta.json()
  return mejorCoincidencia(tema, results)
}

/** Llave de un tema en el mapa de previas: artista y título normalizados (la misma que los fragmentos). */
export const llavePrevia = claveTitulo
