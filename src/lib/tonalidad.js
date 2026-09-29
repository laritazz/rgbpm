// Clave de un audio: cromagrama (energía de cada una de las 12 notas) + perfiles de Krumhansl.
import { clave, pcAOpen } from './claves'
import { magnitudes } from './fft'

// Perfiles de Krumhansl y Kessler: cuánto «pesa» cada grado en una tonalidad mayor o menor
const MAYOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const MENOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

/** Suma, nota a nota (Do = 0 … Si = 11), la energía del espectro entre 65 Hz y 2,1 kHz. */
export function cromagrama(senal, frecuencia, n = 8192, salto = 4096) {
  const croma = new Float64Array(12)
  const notaDeBin = new Int8Array(n / 2).fill(-1)
  for (let k = 1; k < n / 2; k++) {
    const f = (k * frecuencia) / n
    if (f >= 65 && f <= 2100) notaDeBin[k] = (((Math.round(69 + 12 * Math.log2(f / 440)) % 12) + 12) % 12)
  }
  for (let inicio = 0; inicio + n <= senal.length; inicio += salto) {
    const mag = magnitudes(senal, inicio, n)
    const total = mag.reduce((s, v) => s + v, 0) || 1
    // Cada fotograma pesa lo mismo: un golpe fuerte no tapa la armonía del resto
    for (let k = 1; k < n / 2; k++) if (notaDeBin[k] >= 0) croma[notaDeBin[k]] += mag[k] / total
  }
  return Array.from(croma)
}

function correlacion(a, b) {
  const ma = a.reduce((s, v) => s + v, 0) / 12
  const mb = b.reduce((s, v) => s + v, 0) / 12
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < 12; i++) {
    num += (a[i] - ma) * (b[i] - mb)
    da += (a[i] - ma) ** 2
    db += (b[i] - mb) ** 2
  }
  return num / Math.sqrt(da * db || 1)
}

/** Las 24 tonalidades ordenadas por parecido con el cromagrama. La primera es la clave. */
export function clavesDeCroma(croma) {
  const candidatas = []
  for (let pc = 0; pc < 12; pc++) {
    for (const menor of [false, true]) {
      const perfil = menor ? MENOR : MAYOR
      const rotado = croma.map((_, i) => croma[(i + pc) % 12])
      candidatas.push({ clave: clave(pcAOpen(pc, menor), menor), r: correlacion(rotado, perfil) })
    }
  }
  return candidatas.sort((a, b) => b.r - a.r)
}

export function claveDeAudio(senal, frecuencia) {
  const [primera, segunda] = clavesDeCroma(cromagrama(senal, frecuencia))
  // Confianza: correlación alta y ventaja clara sobre la segunda opción
  const confianza = Math.max(0, Math.min(1, primera.r * 0.6 + (primera.r - segunda.r) * 4))
  return { clave: primera.clave, alternativa: segunda.clave, confianza }
}
