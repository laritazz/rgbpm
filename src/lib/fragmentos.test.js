import { describe, expect, it } from 'vitest'
import { idFragmento, idTitulo, inicioFragmento } from './fragmentos'

describe('fragmentos', () => {
  it('el nombre es anónimo, estable y no depende de mayúsculas ni acentos', async () => {
    const a = await idFragmento('/Users/laracp/Music/Amelie Lens/01 Canción.mp3')
    const b = await idFragmento('/users/laracp/music/amelie lens/01 CANCIÓN.mp3'.normalize('NFD'))
    expect(a).toMatch(/^[a-f0-9]{16}$/)
    expect(a).toBe(b)
    expect(a).not.toContain('amelie')
  })
  it('la llave por título ignora mayúsculas y espacios, y distingue artista de título', async () => {
    const a = await idTitulo({ artista: 'Ana Mena', titulo: 'LAS 12' })
    expect(a).toMatch(/^[a-f0-9]{16}$/)
    expect(await idTitulo({ artista: 'ana  mena ', titulo: 'las 12' })).toBe(a)
    expect(await idTitulo({ artista: 'Ana Mena LAS', titulo: '12' })).not.toBe(a)
    expect(a).not.toBe(await idFragmento('Ana Mena LAS 12'))
  })
  it('empieza 8 compases antes del primer hotcue', () => {
    // 128 BPM: 8 compases = 15 s
    expect(inicioFragmento({ duracion: 300, bpm: 128, cues: [0.01, 60, 120] })).toBe(45)
  })
  it('sin cues, al 30 % del tema; y nunca se pasa del final', () => {
    expect(inicioFragmento({ duracion: 200, bpm: 120, cues: [] })).toBe(60)
    expect(inicioFragmento({ duracion: 100, bpm: 120, cues: [95] })).toBe(10)
    expect(inicioFragmento({ duracion: 60, bpm: 120, cues: [] })).toBe(0)
  })
})
