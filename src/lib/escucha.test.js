import { describe, expect, it } from 'vitest'
import { claveDeAudio } from './tonalidad'
import { bpmDeAudio, bpmDeToques } from './tempo'
import { esEstable, puedeSer } from './escucha'
import { leerClave } from './claves'

const FS = 22050

// Bombo sintético: un pulso grave que decae, repetido al tempo, con algo de ruido
function bombo(bpm, segundos = 12) {
  const s = new Float32Array(FS * segundos)
  const cada = (60 / bpm) * FS
  for (let g = 0; g * cada < s.length; g++) {
    const inicio = Math.round(g * cada)
    for (let i = 0; i < 2000 && inicio + i < s.length; i++) s[inicio + i] += Math.sin((2 * Math.PI * 60 * i) / FS) * Math.exp(-i / 400)
  }
  for (let i = 0; i < s.length; i++) s[i] += (Math.random() - 0.5) * 0.02
  return s
}

// Acordes con sus armónicos: la tónica y la quinta suenan más
function acordes(notas, segundos = 6) {
  const s = new Float32Array(FS * segundos)
  for (const [midi, peso] of notas) {
    const f = 440 * 2 ** ((midi - 69) / 12)
    for (let i = 0; i < s.length; i++) s[i] += peso * Math.sin((2 * Math.PI * f * i) / FS)
  }
  return s
}

describe('tap tempo', () => {
  it('necesita al menos tres toques', () => {
    expect(bpmDeToques([0, 500])).toBeNull()
  })
  it('128 BPM con toques humanos y un toque perdido', () => {
    const marcas = [0, 470, 940, 1405, 1880, 2350, 3100, 3290, 3760]
    expect(bpmDeToques(marcas).bpm).toBeGreaterThan(125)
    expect(bpmDeToques(marcas).bpm).toBeLessThan(131)
  })
})

describe('escucha', () => {
  it('encuentra el tempo de un bombo a 128', () => {
    const { bpm } = bpmDeAudio(bombo(128), FS)
    expect(Math.abs(bpm - 128)).toBeLessThan(1.5)
  })
  it('no se va a la mitad con un bombo a 174', () => {
    const { bpm } = bpmDeAudio(bombo(174), FS)
    expect(Math.abs(bpm - 174)).toBeLessThan(2)
  })
  it('La menor: La, Do, Mi y Sol → 1m', () => {
    const { clave } = claveDeAudio(acordes([[57, 1], [60, 0.7], [64, 0.8], [69, 0.6], [67, 0.3], [62, 0.3]]), FS)
    expect(clave.id).toBe('1m')
  })
  it('Sol mayor: Sol, Si, Re y Fa# → 2d', () => {
    const { clave } = claveDeAudio(acordes([[55, 1], [59, 0.7], [62, 0.8], [67, 0.6], [66, 0.3], [60, 0.3]]), FS)
    expect(clave.id).toBe('2d')
  })
})

describe('escucha continua', () => {
  const lectura = (bpm, id) => ({ tempo: { bpm }, tono: { clave: leerClave(id) } })
  it('para cuando tres lecturas seguidas coinciden', () => {
    expect(esEstable([lectura(128, '8m'), lectura(128.4, '8m'), lectura(127.8, '8m')])).toBe(true)
    expect(esEstable([lectura(128, '8m'), lectura(128, '9m'), lectura(128, '8m')])).toBe(false)
    expect(esEstable([lectura(128, '8m'), lectura(128, '8m')])).toBe(false)
  })
  it('propone temas de la biblioteca con la misma clave y BPM cercano', () => {
    const temas = [
      { id: 'a', bpm: 128, clave: leerClave('8m') },
      { id: 'b', bpm: 64, clave: leerClave('8m') },
      { id: 'c', bpm: 128, clave: leerClave('9m') },
      { id: 'd', bpm: 135, clave: leerClave('8m') },
    ]
    expect(puedeSer(temas, { bpm: 127.6, clave: leerClave('8m') }).map((o) => o.tema.id)).toEqual(['a', 'b'])
  })
})
