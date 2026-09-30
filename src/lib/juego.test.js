import { describe, expect, it } from 'vitest'
import { elegirRondas, puntuarBpm, resumenPartida } from './juego'

const tema = (id, bpm, artista = id) => ({ id, bpm, artista, titulo: id })

describe('puntuarBpm', () => {
  it('clavado da casi todos los puntos', () => {
    const r = puntuarBpm(128, 128.5)
    expect(r.puntos).toBeGreaterThan(95)
    expect(r.veredicto.id).toBe('clavado')
  })
  it('vale marcar a medio o a doble tempo', () => {
    expect(puntuarBpm(174, 87).relacion).toBe(2)
    expect(puntuarBpm(174, 87).veredicto.id).toBe('clavado')
    expect(puntuarBpm(70, 140).relacion).toBe(0.5)
  })
  it('lejos no puntúa', () => {
    expect(puntuarBpm(128, 100).puntos).toBe(0)
    expect(puntuarBpm(128, 100).veredicto.id).toBe('lejos')
  })
  it('sin toques, cero', () => {
    expect(puntuarBpm(128, null).puntos).toBe(0)
  })
})

describe('elegirRondas', () => {
  const temas = [tema('a', 90), tema('b', 100), tema('c', 120), tema('d', 124), tema('e', 128), tema('f', 140), tema('g', 150), tema('h', 174), tema('x', null)]
  const rondas = elegirRondas(temas, { n: 5, azar: () => 0.3 })

  it('cinco temas distintos y todos con BPM', () => {
    expect(rondas).toHaveLength(5)
    expect(new Set(rondas.map((t) => t.id)).size).toBe(5)
    expect(rondas.every((t) => t.bpm)).toBe(true)
  })
  it('cubre el rango: uno lento y uno rápido', () => {
    const bpms = rondas.map((t) => t.bpm)
    expect(Math.min(...bpms)).toBeLessThanOrEqual(100)
    expect(Math.max(...bpms)).toBeGreaterThanOrEqual(150)
  })
  it('con pocos temas, los que haya', () => {
    expect(elegirRondas([tema('a', 120)], { n: 5 })).toHaveLength(1)
    expect(elegirRondas([])).toEqual([])
  })
})

describe('resumenPartida', () => {
  it('suma, cuenta clavados y detecta récord', () => {
    const res = [puntuarBpm(128, 128), puntuarBpm(128, 120)]
    const r = resumenPartida(res, 50)
    expect(r.clavados).toBe(1)
    expect(r.nuevoRecord).toBe(true)
    expect(r.record).toBe(r.total)
  })
})
