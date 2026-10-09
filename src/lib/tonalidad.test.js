import { describe, expect, it } from 'vitest'
import { claveDeAudio, clavesDeCroma, cromagrama } from './tonalidad'

const FRECUENCIA = 22050
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)

/** Acordes inventados, uno tras otro, con senos puros. Cada acorde es una lista de notas MIDI. */
function acordes(lista, segundos) {
  const porAcorde = FRECUENCIA * segundos
  const senal = new Float32Array(porAcorde * lista.length)
  lista.forEach((notas, j) => {
    for (let i = 0; i < porAcorde; i++) {
      let v = 0
      for (const m of notas) v += Math.sin((2 * Math.PI * hz(m) * i) / FRECUENCIA)
      senal[j * porAcorde + i] = v / notas.length
    }
  })
  return senal
}

const LA_MENOR = [57, 60, 64]
const RE_MENOR = [50, 53, 57]
const MI_MAYOR = [52, 56, 59]
const DO_MAYOR = [48, 52, 55]
const FA_MAYOR = [53, 57, 60]
const SOL_MAYOR = [55, 59, 62]

describe('cromagrama', () => {
  it('un La menor (La, Do, Mi) enciende justo esas tres notas', () => {
    const croma = cromagrama(acordes([LA_MENOR], 2), FRECUENCIA)
    expect(croma).toHaveLength(12)
    const tres = croma
      .map((v, nota) => ({ v, nota }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 3)
      .map((x) => x.nota)
    expect(tres.sort((a, b) => a - b)).toEqual([0, 4, 9]) // Do, Mi, La
  })
})

describe('clavesDeCroma', () => {
  it('devuelve las 24 tonalidades, de más a menos parecida', () => {
    const lista = clavesDeCroma(Array.from({ length: 12 }, (_, i) => (i === 9 ? 1 : 0.1)))
    expect(lista).toHaveLength(24)
    expect(new Set(lista.map((c) => c.clave.id)).size).toBe(24)
    for (let i = 1; i < lista.length; i++) expect(lista[i].r).toBeLessThanOrEqual(lista[i - 1].r)
  })
  it('el perfil de La menor de Krumhansl da La menor', () => {
    const MENOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
    const croma = Array.from({ length: 12 }, (_, nota) => MENOR[(nota - 9 + 12) % 12])
    const [primera] = clavesDeCroma(croma)
    expect(primera.clave.id).toBe('1m')
    expect(primera.r).toBeCloseTo(1)
  })
})

describe('claveDeAudio', () => {
  it('La menor – Re menor – Mi mayor – La menor: 1m (8A)', () => {
    const { clave, alternativa, confianza } = claveDeAudio(acordes([LA_MENOR, RE_MENOR, MI_MAYOR, LA_MENOR], 1), FRECUENCIA)
    expect(clave.id).toBe('1m')
    expect(clave.camelot).toBe('8A')
    expect(alternativa.id).not.toBe(clave.id)
    expect(confianza).toBeGreaterThan(0.5)
    expect(confianza).toBeLessThanOrEqual(1)
  })
  it('Do – Fa – Sol – Do: 1d (8B), no su relativa menor', () => {
    expect(claveDeAudio(acordes([DO_MAYOR, FA_MAYOR, SOL_MAYOR, DO_MAYOR], 1), FRECUENCIA).clave.id).toBe('1d')
  })
})
