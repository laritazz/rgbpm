import { describe, expect, it } from 'vitest'
import { categoriaDe } from './armonia'
import { leerClave } from './claves'
import { DIFERENCIAS, puntuarCae, puntuarCuadra, puntuarEleccion, rondasCae, rondasCorre, rondasCuadra, rondasPega } from './juegos'

const k = leerClave
const fijo = (() => {
  let n = 0
  return () => ((n = (n * 9301 + 49297) % 233280) / 233280)
})()
const claves = ['1m', '2m', '12m', '1d', '2d', '5m', '6m', '8m', '3d', '7d', '10m', '11m']
const temas = Array.from({ length: 48 }, (_, i) => ({ id: `t${i}`, titulo: `T${i}`, artista: `A${i % 7}`, bpm: 100 + i * 1.7, clave: k(claves[i % claves.length]) }))

describe('¿Pega o choca?', () => {
  const rondas = rondasPega(temas, { n: 6, azar: fijo })
  it('seis rondas, cada una con 4 respuestas y la buena entre ellas', () => {
    expect(rondas).toHaveLength(6)
    for (const r of rondas) {
      expect(r.opciones).toHaveLength(4)
      expect(r.opciones.map((o) => o.id)).toContain(r.correcta)
    }
  })
  it('la respuesta buena es la categoría real (o choque)', () => {
    for (const r of rondas) expect(categoriaDe(r.a.clave, r.b.clave)?.id ?? 'choque').toBe(r.correcta)
  })
  it('una de cada tres choca', () => {
    expect(rondas.filter((r) => r.correcta === 'choque')).toHaveLength(2)
  })
  it('acertar vale 100', () => {
    expect(puntuarEleccion('sube', 'sube').puntos).toBe(100)
    expect(puntuarEleccion('sube', 'baja').puntos).toBe(0)
  })
})

describe('¿Dónde cae?', () => {
  it('rondas con claves distintas', () => {
    const r = rondasCae(temas, { n: 5, azar: fijo })
    expect(new Set(r.map((t) => t.clave.id)).size).toBe(5)
  })
  it('exacto 100, relativa 60, vecina 40, lejos 0; la pista resta', () => {
    expect(puntuarCae(k('1m'), k('1m')).puntos).toBe(100)
    expect(puntuarCae(k('1m'), k('1d')).puntos).toBe(60)
    expect(puntuarCae(k('8m'), k('9m')).puntos).toBe(40)
    expect(puntuarCae(k('1m'), k('6m')).puntos).toBe(0)
    expect(puntuarCae(k('1m'), k('1m'), { pista: true }).puntos).toBe(70)
  })
})

describe('¿Cuál corre más?', () => {
  const rondas = rondasCorre(temas, { azar: fijo })
  it('cada ronda más fina y con la respuesta bien puesta', () => {
    expect(rondas.map((r) => r.diferencia)).toEqual(DIFERENCIAS)
    for (const r of rondas) {
      const rapido = r.correcta === 'a' ? r.a : r.b
      const lento = r.correcta === 'a' ? r.b : r.a
      expect(rapido.bpm).toBeGreaterThan(lento.bpm)
    }
  })
  it('sin temas, juega con ritmos', () => {
    const r = rondasCorre([], { azar: fijo })
    expect(r).toHaveLength(DIFERENCIAS.length)
    expect(r[0].a.titulo).toBe('Ritmo')
  })
})

describe('Cuadra el tempo', () => {
  it('el tuyo sale desviado entre un 3 y un 9 %', () => {
    for (const r of rondasCuadra({ n: 20, azar: fijo })) {
      const desvio = Math.abs(r.inicio / r.referencia - 1) * 100
      expect(desvio).toBeGreaterThan(2.9)
      expect(desvio).toBeLessThan(9.1)
    }
  })
  it('cuadrado da casi todo; a 2,5 % ya no puntúa', () => {
    expect(puntuarCuadra(128, 128.2).veredicto.id).toBe('clavado')
    expect(puntuarCuadra(128, 131.2).puntos).toBe(0)
  })
})
