// Sesiones de SoundCloud: el BPM viene escrito en la descripción («128–130 BPM»).

/** Rango de BPM en un texto: «128–130 BPM», «120-125 bpm» o «174 BPM». */
export function bpmDeTexto(texto = '') {
  const rango = /(\d{2,3})\s*[–—-]\s*(\d{2,3})\s*bpm/i.exec(texto)
  if (rango) {
    const [a, b] = [Number(rango[1]), Number(rango[2])].sort((x, y) => x - y)
    if (a >= 50 && b <= 250) return { desde: a, hasta: b }
  }
  const solo = /(\d{2,3})\s*bpm/i.exec(texto)
  if (solo && Number(solo[1]) >= 50 && Number(solo[1]) <= 250) return { desde: Number(solo[1]), hasta: Number(solo[1]) }
  return null
}

/** Mis sets suben de tempo: el BPM avanza por el rango a medida que avanza la sesión. */
export function bpmEnSesion(rango, progreso = 0) {
  if (!rango) return null
  const p = Math.max(0, Math.min(1, progreso))
  return Math.round((rango.desde + (rango.hasta - rango.desde) * p) * 10) / 10
}

/** Portada grande de SoundCloud (vienen en -large, 100 px). */
export const portadaGrande = (url) => (url ? url.replace('-large.', '-t500x500.') : null)
