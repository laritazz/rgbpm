import { describe, expect, it } from 'vitest'
import { MEDIA_VIDA, apuntarVisita, escalasPorUso, pesosDeUso, seccionesDeRuta } from './uso'

const DIA = 86_400_000
const ahora = 1_000 * DIA

describe('rutas', () => {
  it('cada ruta cuenta para su sección', () => {
    expect(seccionesDeRuta('/')).toEqual([])
    expect(seccionesDeRuta('/biblioteca')).toEqual(['biblioteca'])
    expect(seccionesDeRuta('/set/p1')).toEqual(['biblioteca'])
    expect(seccionesDeRuta('/juego/bpm')).toEqual(['juego', 'juego:bpm'])
  })
})

describe('visitas', () => {
  it('ir y volver en medio minuto no cuenta dos veces', () => {
    let h = apuntarVisita({}, 'sets', ahora)
    h = apuntarVisita(h, 'sets', ahora + 5_000)
    expect(h.sets).toHaveLength(1)
    h = apuntarVisita(h, 'sets', ahora + 60_000)
    expect(h.sets).toHaveLength(2)
  })
  it('una visita vale la mitad cada semana', () => {
    expect(pesosDeUso({ sets: [ahora - MEDIA_VIDA] }, ahora).sets).toBeCloseTo(0.5)
    expect(pesosDeUso({ sets: [ahora] }, ahora).sets).toBeCloseTo(1)
  })
  it('las de hace más de dos meses se olvidan', () => {
    const h = apuntarVisita({ sets: [ahora - 70 * DIA] }, 'sets', ahora)
    expect(h.sets).toEqual([ahora])
  })
})

describe('escalas', () => {
  const ids = ['sets', 'radio', 'tap']
  it('sin historial, la composición tal cual', () => {
    expect(escalasPorUso({}, ids, { ahora })).toEqual({ sets: 1, radio: 1, tap: 1 })
  })
  it('lo más usado crece y lo que no, encoge', () => {
    const h = { sets: [ahora - DIA, ahora - 2 * DIA, ahora - 3 * DIA, ahora], radio: [ahora - 30 * DIA] }
    const e = escalasPorUso(h, ids, { ahora })
    expect(e.sets).toBeCloseTo(1.18)
    expect(e.tap).toBeCloseTo(0.8)
    expect(e.radio).toBeGreaterThan(0.8)
    expect(e.radio).toBeLessThan(e.sets)
  })
  it('con prefijo, mide los juegos por separado', () => {
    const h = { 'juego:bpm': [ahora, ahora - DIA, ahora - 2 * DIA, ahora - 3 * DIA] }
    expect(escalasPorUso(h, ['bpm', 'pega'], { ahora, prefijo: 'juego:' }).bpm).toBeCloseTo(1.18)
  })
})
