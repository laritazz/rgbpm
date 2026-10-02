import { describe, expect, it } from 'vitest'
import { PLANO_JUEGO, componer, puntoEtiqueta } from './composicion'

describe('componer', () => {
  for (const [aspecto, plano] of [0.5, 0.75, 1.4, 2].flatMap((a) => [[a, undefined], [a, PLANO_JUEGO]])) {
    it(`todas las etiquetas se leen dentro de la pantalla (aspecto ${aspecto})`, () => {
      const { ancho, alto, circulos } = componer(aspecto, {}, null, plano)
      for (const c of circulos) {
        expect(c.etiqueta.x).toBeGreaterThan(0)
        expect(c.etiqueta.x).toBeLessThan(ancho)
        expect(c.etiqueta.y).toBeGreaterThan(0)
        expect(c.etiqueta.y).toBeLessThan(alto)
      }
    })
  }
  it('elige la composición según la forma de la pantalla', () => {
    expect(componer(0.5).alto).toBe(200)
    expect(componer(2).circulos.find((c) => c.id === 'biblioteca').x).toBeGreaterThan(80)
  })
  it('los datos cambian el tamaño', () => {
    const normal = componer(1.5).circulos.find((c) => c.id === 'sets').r
    const grande = componer(1.5, { sets: 1.1 }).circulos.find((c) => c.id === 'sets').r
    expect(grande).toBeCloseTo(normal * 1.1)
  })
})

describe('etiquetas y escalas', () => {
  it('un círculo cortado pone la etiqueta en la parte visible', () => {
    const p = puntoEtiqueta({ x: 100, y: 0, r: 40 }, 100, 60, 8)
    expect(p.x).toBeLessThan(100)
    expect(p.y).toBeGreaterThan(0)
    expect(Math.hypot(p.x - 100, p.y - 0)).toBeLessThanOrEqual(40 * 0.62 + 1e-9)
  })
  it('el plano de juegos tiene sus propios círculos', () => {
    const ids = componer(1.6, {}, null, PLANO_JUEGO).circulos.map((c) => c.id)
    expect(ids).toEqual(['mascota', 'bpm', 'pega', 'corre', 'cae', 'cuadra'])
  })
})
