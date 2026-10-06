// Escucha continua: piezas puras para leer el micro por tramos y decidir cuándo ya está claro.
import { notaBpm } from './armonia'
import { claveDeAudio } from './tonalidad'
import { bpmDeAudio } from './tempo'

/** Mitad de muestras (48 kHz → 24 kHz): el análisis va el doble de rápido y no pierde nada útil. */
export function reducirMitad(senal) {
  const salida = new Float32Array(Math.floor(senal.length / 2))
  for (let i = 0; i < salida.length; i++) salida[i] = (senal[2 * i] + senal[2 * i + 1]) / 2
  return salida
}

const rms = (s) => Math.sqrt(s.reduce((t, v) => t + v * v, 0) / (s.length || 1))

/** Analiza un tramo de audio. Devuelve null si casi no se oye nada. */
export function analizarTramo(senal, frecuencia) {
  if (rms(senal) < 0.003) return null
  const [s, fs] = frecuencia > 30000 ? [reducirMitad(senal), frecuencia / 2] : [senal, frecuencia]
  return { tempo: bpmDeAudio(s, fs), tono: claveDeAudio(s, fs) }
}

/**
 * ¿Ya está claro? Las tres últimas lecturas coinciden en clave y en BPM (±1).
 * Es lo que hace que la escucha pare sola, como Shazam.
 */
export function esEstable(lecturas, veces = 3) {
  const ultimas = lecturas.filter(Boolean).slice(-veces)
  if (ultimas.length < veces) return false
  const [primera] = ultimas
  return ultimas.every((l) => l.tono?.clave.id === primera.tono?.clave.id && l.tempo && primera.tempo && Math.abs(l.tempo.bpm - primera.tempo.bpm) <= 1)
}

/**
 * «Puede ser uno de tus temas»: misma clave y BPM casi igual (±2 %, admite doble o mitad).
 * No reconoce la canción, pero si está en tu biblioteca suele aparecer entre las primeras.
 */
export function puedeSer(temas, { bpm, clave }, limite = 5) {
  if (!bpm || !clave) return []
  return temas
    .filter((t) => t.clave?.id === clave.id && t.bpm)
    .map((t) => ({ tema: t, diferencia: Math.abs(notaBpm(bpm, t.bpm).porcentaje) }))
    .filter((o) => o.diferencia <= 2)
    .sort((a, b) => a.diferencia - b.diferencia)
    .slice(0, limite)
}

// ——— Certeza: cuánto se fía la escucha de lo que oye (0–1) ———
// Tres tramos que la pantalla enseña de forma distinta:
// pulso (0–30 %) aún no hay lectura · intuye (31–79 %) hay lectura pero oscila · fijada (80–100 %) tres lecturas iguales.

const coincide = (a, b) => a.tono?.clave.id === b.tono?.clave.id && a.tempo && b.tempo && Math.abs(a.tempo.bpm - b.tempo.bpm) <= 1

/**
 * @param lecturas  todas las lecturas de la escucha (null = tramo en silencio)
 * @param progreso  0–1 hasta la primera lectura: así el pulso inicial también avanza
 */
export function certeza(lecturas, progreso = 0, veces = 3) {
  const validas = lecturas.filter(Boolean)
  if (!validas.length) return Math.min(0.3, Math.max(0, progreso) * 0.3)
  if (esEstable(lecturas, veces)) return 1
  const ultima = validas.at(-1)
  const acuerdo = validas.slice(-veces).filter((l) => coincide(l, ultima)).length // 1…veces-1
  const confianza = ((ultima.tempo?.confianza ?? 0) + (ultima.tono?.confianza ?? 0)) / 2
  const mezcla = ((acuerdo - 1) / (veces - 1)) * 0.6 + confianza * 0.4
  return 0.31 + 0.48 * Math.min(1, mezcla)
}

/** El tramo de certeza en el que está la escucha. */
export const faseCerteza = (c) => (c >= 0.8 ? 'fijada' : c > 0.3 ? 'intuye' : 'pulso')
