import { describe, expect, it } from 'vitest'
import { duracionLarga, reloj } from './formato'

describe('reloj', () => {
  it('minutos y segundos con dos cifras', () => {
    expect(reloj(187)).toBe('3:07')
    expect(reloj(59.9)).toBe('0:59')
    expect(reloj(600)).toBe('10:00')
  })
  it('sin duración válida, 0:00', () => {
    for (const s of [0, -5, NaN, Infinity, null, undefined]) expect(reloj(s)).toBe('0:00')
  })
})

describe('duracionLarga', () => {
  it('menos de una hora, en minutos redondeados', () => {
    expect(duracionLarga(0)).toBe('0 min')
    expect(duracionLarga(null)).toBe('0 min')
    expect(duracionLarga(1530)).toBe('26 min')
  })
  it('desde una hora, con los minutos a dos cifras', () => {
    expect(duracionLarga(3570)).toBe('1 h 00 min')
    expect(duracionLarga(4320)).toBe('1 h 12 min')
    expect(duracionLarga(7500)).toBe('2 h 05 min')
  })
})
