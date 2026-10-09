import { describe, expect, it } from 'vitest'
import { TODAS_LAS_CLAVES, clave, etiquetaClave, etiquetaCompleta, leerClave, openAPc, pcAOpen } from './claves'

describe('clave', () => {
  it('1d es Do mayor (8B) y 1m es La menor (8A)', () => {
    expect(clave(1, false)).toEqual({ open: 1, menor: false, id: '1d', camelot: '8B', nombre: 'C' })
    expect(clave(1, true)).toEqual({ open: 1, menor: true, id: '1m', camelot: '8A', nombre: 'Am' })
  })
  it('el número da la vuelta a la rueda', () => {
    expect(clave(13, true).id).toBe('1m')
    expect(clave(0, false)).toMatchObject({ id: '12d', camelot: '7B', nombre: 'F' })
  })
  it('hay 24 claves y ninguna repetida', () => {
    expect(TODAS_LAS_CLAVES).toHaveLength(24)
    expect(new Set(TODAS_LAS_CLAVES.map((k) => k.id)).size).toBe(24)
    expect(new Set(TODAS_LAS_CLAVES.map((k) => k.camelot)).size).toBe(24)
  })
  it('Open Key → nota → Open Key vuelve al mismo sitio', () => {
    for (let n = 1; n <= 12; n++) for (const menor of [false, true]) expect(pcAOpen(openAPc(n, menor), menor)).toBe(n)
  })
})

describe('leerClave: lector tolerante', () => {
  it.each([
    ['8m', '8m'],
    ['10 d', '10d'],
    ['8A', '1m'],
    ['8B', '1d'],
    ['5A', '10m'],
    ['Am', '1m'],
    ['A minor', '1m'],
    ['Amin', '1m'],
    ['Cmaj', '1d'],
    ['F#m', '4m'],
    ['Gbm', '4m'],
    ['F♯m', '4m'],
    ['Ebm', '7m'],
    ['Cb', '6d'],
    ['E#', '12d'],
  ])('«%s» → %s', (texto, id) => {
    expect(leerClave(texto).id).toBe(id)
  })

  it('MUSICAL_KEY de Traktor: 0–11 mayores, 12–23 menores', () => {
    expect(leerClave('0').nombre).toBe('C')
    expect(leerClave(21).nombre).toBe('Am')
    expect(leerClave('23')).toMatchObject({ nombre: 'Bm', camelot: '10A' })
  })

  it.each([null, undefined, '', '   ', '13m', '0A', '24', 'H', 'Do menor'])('«%s» no es una clave', (texto) => {
    expect(leerClave(texto)).toBeNull()
  })
})

describe('etiquetas en pantalla', () => {
  const am = leerClave('Am')
  it('cada notación escribe lo suyo; sin clave, raya', () => {
    expect(etiquetaClave(am)).toBe('1m')
    expect(etiquetaClave(am, 'camelot')).toBe('8A')
    expect(etiquetaClave(am, 'nombre')).toBe('Am')
    expect(etiquetaClave(null)).toBe('—')
  })
  it('la completa añade el tono, o el Open Key si ya se ve el tono', () => {
    expect(etiquetaCompleta(am)).toBe('1m · Am')
    expect(etiquetaCompleta(am, 'camelot')).toBe('8A · Am')
    expect(etiquetaCompleta(am, 'nombre')).toBe('Am · 1m')
    expect(etiquetaCompleta(undefined)).toBe('—')
  })
})
