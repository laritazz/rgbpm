import { describe, expect, it } from 'vitest'
import { categoriaDe, clavesRelacionadas, notaBpm } from './armonia'
import { leerClave } from './claves'
import { colorBpm, franjaDe } from './color'

const k = (s) => leerClave(s)

describe('leerClave', () => {
  it('entiende Open Key, Camelot, nombres y el número de Traktor', () => {
    expect(k('8m').id).toBe('8m')
    expect(k('8A').id).toBe('1m') // Camelot 8A = La menor = 1m en Open Key
    expect(k('Am').id).toBe('1m')
    expect(k('C').id).toBe('1d')
    expect(k('21').id).toBe('1m') // Traktor: 12 + La (9) = 21 → La menor
  })
  it('devuelve null con basura', () => {
    expect(k('')).toBeNull()
    expect(k('hola')).toBeNull()
  })
})

describe('reglas de mezcla', () => {
  it('Clavado es la misma clave y su relativa', () => {
    const rel = clavesRelacionadas(k('1m'))
    expect(rel.clavado.map((c) => c.id)).toEqual(['1m', '1d'])
  })
  it('Sube es una quinta arriba y Baja una abajo', () => {
    expect(categoriaDe(k('8m'), k('9m')).id).toBe('sube')
    expect(categoriaDe(k('8m'), k('7m')).id).toBe('baja')
  })
  it('la dirección importa: de menor a mayor abre, de mayor a menor cierra', () => {
    expect(categoriaDe(k('1m'), k('5d')).id).toBe('abre')
    expect(categoriaDe(k('5d'), k('1m')).id).toBe('cierra')
  })
  it('un salto lejano no mezcla', () => {
    expect(categoriaDe(k('1m'), k('6m'))).toBeNull()
  })
})

describe('tempo y color', () => {
  it('admite doble tempo con penalización', () => {
    expect(notaBpm(128, 64).relacion).toBe(2)
    expect(notaBpm(128, 128).nota).toBe(100)
  })
  it('más BPM, color más cálido', () => {
    expect(franjaDe(100).id).toBe('violeta')
    expect(franjaDe(178).id).toBe('carmesi')
    expect(colorBpm(90)).toBe('#7d4ea2')
  })
})
