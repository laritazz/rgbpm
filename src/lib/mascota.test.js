import { describe, expect, it } from 'vitest'
import { energia, forma, vida } from './mascota'

describe('forma y energía', () => {
  it('disco a poco BPM, asterisco a tope', () => {
    expect(energia(100)).toBe(0)
    expect(energia(170)).toBe(1)
    expect(forma(0)).toMatch(/^M112\.0,0\.0/)
  })
})

describe('vida', () => {
  it('dormida: ojos cerrados y respira', () => {
    const v = vida(2, { despierta: false })
    expect(v.parpado).toBe(1)
    expect(v.respira).not.toBe(1)
  })
  it('al despertar abre los ojos poco a poco', () => {
    expect(vida(10, { desde: 0 }).parpado).toBe(1)
    expect(vida(10, { desde: 0.2 }).parpado).toBeGreaterThan(0.4)
  })
  it('despierta, casi siempre tiene los ojos abiertos', () => {
    const abiertos = Array.from({ length: 400 }, (_, i) => vida(i * 0.05, { semilla: 3 }).parpado).filter((p) => p === 0).length
    expect(abiertos / 400).toBeGreaterThan(0.85)
  })
  it('mira adonde le digas, sin salirse de −1…1', () => {
    expect(vida(1, { mira: { x: 5, y: -0.5 } }).ojo).toEqual([1, -0.5])
  })
  it('sola, mira alrededor: los ojos no se quedan quietos', () => {
    const posiciones = new Set(Array.from({ length: 12 }, (_, i) => vida(i * 1.3, { semilla: 1 }).ojo[0].toFixed(2)))
    expect(posiciones.size).toBeGreaterThan(2)
  })
})
