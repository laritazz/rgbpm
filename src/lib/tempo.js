// Tempo: contar BPM con toques en la pantalla o escuchando por el micro.
import { magnitudes } from './fft'

/**
 * BPM a partir de las marcas de tiempo de los toques (ms).
 * Usa los últimos toques, descarta los que se desvían más de un 25 % de la mediana y promedia.
 */
export function bpmDeToques(marcas, maximo = 12) {
  const ultimas = marcas.slice(-maximo)
  if (ultimas.length < 3) return null
  const intervalos = ultimas.slice(1).map((m, i) => m - ultimas[i])
  const orden = [...intervalos].sort((a, b) => a - b)
  const mediana = orden[Math.floor(orden.length / 2)]
  const buenos = intervalos.filter((d) => Math.abs(d - mediana) <= mediana * 0.25)
  const media = buenos.reduce((s, d) => s + d, 0) / buenos.length
  // Estabilidad 0–1: cuánto se parecen los toques entre sí
  const desviacion = Math.sqrt(buenos.reduce((s, d) => s + (d - media) ** 2, 0) / buenos.length)
  return { bpm: Math.round((60000 / media) * 10) / 10, estabilidad: Math.max(0, 1 - desviacion / media / 0.1), toques: ultimas.length }
}

/** Curva de «golpes»: cuánto sube la energía espectral de un fotograma al siguiente (flujo espectral). */
export function envolventeDeGolpes(senal, frecuencia, n = 1024, salto = 512) {
  const curva = []
  let anterior = null
  const hastaBin = Math.floor((8000 / frecuencia) * n) // por encima de 8 kHz solo hay ruido
  for (let inicio = 0; inicio + n <= senal.length; inicio += salto) {
    const mag = magnitudes(senal, inicio, n)
    let flujo = 0
    if (anterior) for (let k = 1; k < hastaBin; k++) flujo += Math.max(0, Math.log1p(mag[k]) - Math.log1p(anterior[k]))
    curva.push(flujo)
    anterior = mag
  }
  return { curva: Float32Array.from(curva), fps: frecuencia / salto }
}

/**
 * BPM de una curva de golpes por autocorrelación entre 70 y 180 BPM.
 * Una preferencia suave por los tempos de pista (~125) evita confundir 64 con 128.
 */
export function bpmDeEnvolvente(curva, fps, { minimo = 70, maximo = 180, centro = 125 } = {}) {
  const media = curva.reduce((s, v) => s + v, 0) / curva.length
  const x = curva.map((v) => v - media)
  const r = (lag) => {
    let s = 0
    for (let i = lag; i < x.length; i++) s += x[i] * x[i - lag]
    return s / (x.length - lag)
  }
  const r0 = r(0) || 1
  const lagMin = Math.floor((60 * fps) / maximo)
  const lagMax = Math.ceil((60 * fps) / minimo)
  const valores = []
  let mejor = null
  for (let lag = lagMin; lag <= lagMax; lag++) {
    const v = r(lag)
    valores[lag] = v
    const bpm = (60 * fps) / lag
    const peso = Math.exp(-0.5 * (Math.log2(bpm / centro) / 0.9) ** 2)
    if (!mejor || v * peso > mejor.puntos) mejor = { lag, puntos: v * peso }
  }
  // Interpolación parabólica: afina el pico entre dos muestras
  const { lag } = mejor
  const [a, b, c] = [valores[lag - 1] ?? valores[lag], valores[lag], valores[lag + 1] ?? valores[lag]]
  const desplazamiento = a - 2 * b + c !== 0 ? (0.5 * (a - c)) / (a - 2 * b + c) : 0
  const bpm = (60 * fps) / (lag + Math.max(-0.5, Math.min(0.5, desplazamiento)))
  return { bpm: Math.round(bpm * 10) / 10, confianza: Math.max(0, Math.min(1, b / r0)) }
}

export const bpmDeAudio = (senal, frecuencia) => {
  const { curva, fps } = envolventeDeGolpes(senal, frecuencia)
  return curva.length > fps * 4 ? bpmDeEnvolvente(curva, fps) : null
}
