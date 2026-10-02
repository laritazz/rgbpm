import { describe, expect, it } from 'vitest'
import { mejoresPorJuego } from './puntuaciones'

describe('mejoresPorJuego', () => {
  it('se queda con la mejor partida y cuenta las partidas de cada juego', () => {
    const r = mejoresPorJuego([
      { juego: 'bpm', puntos: 300 },
      { juego: 'bpm', puntos: 404 },
      { juego: 'pega', puntos: 120 },
    ])
    expect(r).toEqual({ bpm: { mejor: 404, partidas: 2 }, pega: { mejor: 120, partidas: 1 } })
  })
  it('sin filas, nada', () => {
    expect(mejoresPorJuego([])).toEqual({})
  })
})
