import { describe, expect, it } from 'vitest'
import { buscarPrevia, consulta, mejorCoincidencia, tituloLimpio } from './previas'

const resultado = (artistName, trackName, previewUrl = 'https://audio/p.m4a') => ({ artistName, trackName, previewUrl, trackViewUrl: 'https://music.apple.com/x' })

describe('previas', () => {
  it('limpia versiones y paréntesis para buscar', () => {
    expect(tituloLimpio('Heads Will Roll (Funk Tribu Mix)')).toBe('heads will roll')
    expect(tituloLimpio('Rush - Extended Mix')).toBe('rush')
  })
  it('si el artista va dentro del título, lo separa', () => {
    expect(consulta({ artista: '', titulo: 'Tegan and Sara - Walking with a Ghost' })).toBe('tegan and sara walking with a ghost')
    expect(consulta({ artista: 'Jarabe de Palo', titulo: 'La flaca' })).toBe('jarabe de palo la flaca')
  })
  it('elige tu tema y no otro parecido', () => {
    const r = mejorCoincidencia({ artista: 'Jarabe de Palo', titulo: 'La flaca' }, [resultado('Otro', 'Flaca de amor'), resultado('Jarabe de Palo', 'La Flaca')])
    expect(r.artista).toBe('Jarabe de Palo')
  })
  it('mejor sin previa que con otra canción', () => {
    expect(mejorCoincidencia({ artista: 'Jaymo', titulo: 'Heads will roll' }, [resultado('Coldplay', 'Yellow')])).toBeNull()
    expect(mejorCoincidencia({ artista: 'A', titulo: 'B' }, [{ ...resultado('A', 'B'), previewUrl: null }])).toBeNull()
  })
  it('pregunta al catálogo y devuelve la previa', async () => {
    const pedir = async (url) => {
      expect(url).toContain('term=jarabe%20de%20palo%20la%20flaca')
      return { ok: true, json: async () => ({ results: [resultado('Jarabe de Palo', 'La Flaca')] }) }
    }
    expect((await buscarPrevia({ artista: 'Jarabe de Palo', titulo: 'La flaca' }, { pedir })).url).toBe('https://audio/p.m4a')
  })
})
