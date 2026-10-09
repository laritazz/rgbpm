import { describe, expect, it } from 'vitest'
import { bpmDeAudio, bpmDeToques, envolventeDeGolpes } from './tempo'

const FRECUENCIA = 44100

// Azar con semilla: el mismo «ruido» en cada ejecución
function azar(semilla) {
  let s = semilla
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) * 2 - 1
}

/** Pista de clics inventada: un golpe de ruido de 20 ms en cada pulso. */
function clics(bpm, segundos, f = FRECUENCIA) {
  const senal = new Float32Array(f * segundos)
  const ruido = azar(7)
  const periodo = (60 / bpm) * f
  const largo = Math.round(f / 50)
  for (let t = 0; t < senal.length; t += periodo) {
    const inicio = Math.round(t)
    for (let i = 0; i < largo && inicio + i < senal.length; i++) senal[inicio + i] += ruido() * Math.exp(-i / (f / 250))
  }
  return senal
}

/** Marcas de tiempo (ms) de toques regulares. */
const toquesCada = (ms, cuantos) => Array.from({ length: cuantos }, (_, i) => i * ms)

describe('bpmDeToques: contar a mano', () => {
  it('hacen falta 3 toques', () => {
    expect(bpmDeToques([])).toBeNull()
    expect(bpmDeToques([0, 500])).toBeNull()
  })
  it('un toque cada 500 ms son 120 BPM, con estabilidad total', () => {
    expect(bpmDeToques(toquesCada(500, 8))).toEqual({ bpm: 120, estabilidad: 1, toques: 8 })
  })
  it('un toque perdido no estropea la cuenta', () => {
    expect(bpmDeToques([0, 500, 1000, 1500, 3000, 3500]).bpm).toBe(120)
  })
  it('solo cuentan los últimos 12 toques: manda el tempo nuevo', () => {
    const viejos = toquesCada(600, 10) // 100 BPM
    const nuevos = toquesCada(468.75, 12).map((m) => m + 6000) // 128 BPM
    expect(bpmDeToques([...viejos, ...nuevos])).toMatchObject({ bpm: 128, toques: 12 })
  })
  it('toques irregulares bajan la estabilidad', () => {
    const { estabilidad } = bpmDeToques([0, 480, 1010, 1490, 2030, 2490])
    expect(estabilidad).toBeGreaterThan(0)
    expect(estabilidad).toBeLessThan(1)
  })
})

describe('envolventeDeGolpes', () => {
  it('un fotograma cada 512 muestras; el silencio no tiene golpes', () => {
    const { curva, fps } = envolventeDeGolpes(new Float32Array(FRECUENCIA), FRECUENCIA)
    expect(fps).toBeCloseTo(FRECUENCIA / 512)
    expect(curva.length).toBe(Math.floor((FRECUENCIA - 1024) / 512) + 1)
    expect(curva.every((v) => v === 0)).toBe(true)
  })
})

describe('bpmDeAudio: escuchar el tempo', () => {
  it('menos de 4 s de audio: no se atreve', () => {
    expect(bpmDeAudio(clics(128, 3), FRECUENCIA)).toBeNull()
  })

  it.each([100, 120, 124, 128, 140, 160])('clics a %i BPM: acierta con ±1 BPM', (bpm) => {
    const resultado = bpmDeAudio(clics(bpm, 12), FRECUENCIA)
    expect(Math.abs(resultado.bpm - bpm)).toBeLessThanOrEqual(1)
    expect(resultado.confianza).toBeGreaterThan(0.5)
  })

  it('a 48 kHz (la frecuencia de muchas tarjetas de sonido) también', () => {
    expect(Math.abs(bpmDeAudio(clics(128, 12, 48000), 48000).bpm - 128)).toBeLessThanOrEqual(1)
  })

  // FALLO CONOCIDO: a 150 BPM devuelve la mitad (74,9). Va en su propia tarjeta.
  // Cuando se arregle, esta prueba fallará: quita el «.fails».
  it.fails('clics a 150 BPM no se confunden con 75', () => {
    expect(Math.abs(bpmDeAudio(clics(150, 12), FRECUENCIA).bpm - 150)).toBeLessThanOrEqual(1)
  })
})
