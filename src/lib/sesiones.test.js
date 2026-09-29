import { describe, expect, it } from 'vitest'
import { bpmDeTexto, bpmEnSesion } from './sesiones'

describe('sesiones de SoundCloud', () => {
  it('lee el rango de la descripción', () => {
    expect(bpmDeTexto('Amarillo verano 🌞\n💃 134–136 BPM de amor')).toEqual({ desde: 134, hasta: 136 })
    expect(bpmDeTexto('Mas lento 120-125 bpm')).toEqual({ desde: 120, hasta: 125 })
    expect(bpmDeTexto('No shame, get sweaty')).toBeNull()
  })
  it('el BPM sube con la sesión', () => {
    expect(bpmEnSesion({ desde: 136, hasta: 145 }, 0.5)).toBe(140.5)
  })
})
