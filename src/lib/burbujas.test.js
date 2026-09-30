import { describe, expect, it } from 'vitest'
import { empaquetar } from './burbujas'

const circulos = [
  { id: 'mascota', r: 24 },
  { id: 'a', r: 16 },
  { id: 'b', r: 15 },
  { id: 'c', r: 12 },
  { id: 'd', r: 6 },
  { id: 'e', r: 4 },
  { id: 'f', r: 9 },
]

describe('empaquetar', () => {
  const puestos = empaquetar(circulos, { hueco: 1.5 })

  it('coloca todos, en su orden', () => {
    expect(puestos.map((p) => p.id)).toEqual(circulos.map((c) => c.id))
  })
  it('ningún círculo pisa a otro', () => {
    for (let i = 0; i < puestos.length; i++) {
      for (let j = i + 1; j < puestos.length; j++) {
        const [a, b] = [puestos[i], puestos[j]]
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(a.r + b.r - 1e-6)
      }
    }
  })
  it('todo cabe en la caja', () => {
    for (const p of puestos) {
      expect(p.x - p.r).toBeGreaterThanOrEqual(-1e-6)
      expect(p.x + p.r).toBeLessThanOrEqual(100 + 1e-6)
    }
  })
  it('la mascota queda cerca del centro', () => {
    expect(Math.abs(puestos[0].x - 50)).toBeLessThan(15)
  })
  it('los tamaños mantienen su proporción', () => {
    expect(puestos[1].r / puestos[0].r).toBeCloseTo(16 / 24)
  })
})
