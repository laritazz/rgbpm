import { describe, expect, it } from 'vitest'
import { islaCompacta, pestanaDe } from './isla'

describe('isla', () => {
  it('se encoge al bajar y se abre al subir', () => {
    expect(islaCompacta({ y: 300, anterior: 290, compacta: false })).toBe(true)
    expect(islaCompacta({ y: 280, anterior: 300, compacta: true })).toBe(false)
  })
  it('ignora movimientos pequeños (rebote, inercia)', () => {
    expect(islaCompacta({ y: 303, anterior: 300, compacta: false })).toBe(false)
    expect(islaCompacta({ y: 295, anterior: 300, compacta: true })).toBe(true)
  })
  it('arriba del todo, siempre abierta', () => {
    expect(islaCompacta({ y: 20, anterior: 0, compacta: true })).toBe(false)
  })
  it('cada ruta tiene su pestaña', () => {
    expect(pestanaDe('/')).toBe('biblioteca')
    expect(pestanaDe('/set/p1')).toBe('biblioteca')
    expect(pestanaDe('/tap')).toBe('tap')
    expect(pestanaDe('/sets')).toBe('sets')
    expect(pestanaDe('/armonia')).toBe('mas')
  })
})
