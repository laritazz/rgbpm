import { describe, expect, it } from 'vitest'
import { leerClave } from './claves'
import { FRANJAS, colorBpm, colorClave, degradadoTema, franjaDe } from './color'

describe('franjas de BPM', () => {
  it('cortes nuevos: violeta hasta 110, rojo desde 150', () => {
    expect(franjaDe(105).id).toBe('violeta')
    expect(franjaDe(115).id).toBe('turquesa')
    expect(franjaDe(126).id).toBe('oliva')
    expect(franjaDe(140).id).toBe('amarillo')
    expect(franjaDe(150).id).toBe('carmesi')
  })
  it('las franjas se tocan, sin huecos', () => {
    for (let i = 1; i < FRANJAS.length; i++) expect(FRANJAS[i].desde).toBe(FRANJAS[i - 1].hasta)
  })
  it('más BPM, color más cálido; sin BPM, gris', () => {
    expect(colorBpm(90)).toBe('#7d4ea2')
    expect(colorBpm(170)).not.toBe(colorBpm(120))
    expect(colorBpm(null)).toBe('#555555')
  })
})

describe('color de la clave', () => {
  it('cada tono tiene el suyo; la menor más oscura que su mayor', () => {
    const colores = new Set(Array.from({ length: 12 }, (_, i) => colorClave(leerClave(`${i + 1}m`))))
    expect(colores.size).toBe(12)
    const luz = (hex) => parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16)
    expect(luz(colorClave(leerClave('1m')))).toBeLessThan(luz(colorClave(leerClave('1d'))))
  })
  it('un tema con clave es un degradado de BPM a clave; sin clave, plano', () => {
    expect(degradadoTema({ bpm: 128, clave: leerClave('8m') })).toMatch(/^linear-gradient/)
    expect(degradadoTema({ bpm: 128, clave: null })).toBe(colorBpm(128))
  })
})
