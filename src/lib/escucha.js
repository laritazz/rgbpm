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
