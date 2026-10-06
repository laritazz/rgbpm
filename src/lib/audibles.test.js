import { describe, expect, it } from 'vitest'
import { MINIMO_PARA_JUGAR, temasParaJugar } from './audibles'

const temas = Array.from({ length: 30 }, (_, i) => ({ id: i }))

describe('temasParaJugar', () => {
  it('con bastantes temas con audio, juega solo con esos', () => {
    const audibles = temas.slice(0, MINIMO_PARA_JUGAR)
    expect(temasParaJugar(audibles, temas)).toBe(audibles)
  })

  it('con pocos, juega con toda la biblioteca (suena el ritmo sintetizado)', () => {
    expect(temasParaJugar(temas.slice(0, 3), temas)).toBe(temas)
    expect(temasParaJugar([], temas)).toBe(temas)
  })
})
