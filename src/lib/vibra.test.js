import { describe, expect, it } from 'vitest'
import { FRANJAS, colorBpm } from './color'
import { BARRIDO, anguloDeFranja, anguloDePunto, colorSonando, franjaDeAngulo, huella } from './vibra'

describe('dial de vibra', () => {
  it('cada franja vuelve a sí misma desde el centro de su porción', () => {
    for (const f of FRANJAS) expect(franjaDeAngulo(anguloDeFranja(f.id)).id).toBe(f.id)
  })

  it('los extremos del recorrido se quedan en la primera y la última franja', () => {
    expect(franjaDeAngulo(-BARRIDO).id).toBe(FRANJAS[0].id)
    expect(franjaDeAngulo(BARRIDO).id).toBe(FRANJAS.at(-1).id)
  })

  it('0° es arriba y gira como el reloj', () => {
    expect(anguloDePunto(0, -1)).toBeCloseTo(0)
    expect(anguloDePunto(1, 0)).toBeCloseTo(90)
    expect(anguloDePunto(-1, 0)).toBeCloseTo(-90)
  })
})

describe('vibra al sonar', () => {
  it('manda la vibra; sin ella, el color del BPM', () => {
    expect(colorSonando({ bpm: 128 }, 'violeta')).toBe(FRANJAS[0].color)
    expect(colorSonando({ bpm: 128 }, null)).toBe(colorBpm(128))
  })

  it('la huella sale de la ruta de Traktor y es estable', async () => {
    const a = await huella({ ruta: 'Macintosh HD/Música/Tema.mp3', titulo: 'x' })
    const b = await huella({ ruta: 'macintosh hd/música/tema.mp3', titulo: 'y' })
    expect(a).toMatch(/^[0-9a-f]{16}$/)
    expect(a).toBe(b)
    expect(await huella({ artista: 'A', titulo: 'B' })).not.toBe(a)
  })
})
