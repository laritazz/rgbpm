import { describe, expect, it } from 'vitest'
import { categoriaDe } from './armonia'
import { leerClave } from './claves'
import { generarRadio, sinRepetidos } from './radio'

// Una biblioteca de juguete: todas las claves menores y mayores entre 110 y 150 BPM
const temas = []
let n = 0
for (let bpm = 110; bpm <= 150; bpm += 2) {
  for (const id of ['1m', '2m', '12m', '1d', '2d', '5d', '8m', '3m']) temas.push({ id: `t${n++}`, titulo: `T${n}`, artista: 'A', bpm, clave: leerClave(id) })
}
const primero = () => 0

describe('radio', () => {
  it('empieza en la clave pedida y respeta el largo', () => {
    const lista = generarRadio(temas, { semilla: leerClave('1m'), bpmInicio: 120, subida: 10, cuantos: 12, azar: primero })
    expect(lista).toHaveLength(12)
    expect(lista[0].clave.id).toBe('1m')
  })
  it('cada salto es una mezcla armónica', () => {
    const lista = generarRadio(temas, { semilla: leerClave('1m'), bpmInicio: 120, subida: 10, cuantos: 12, azar: primero })
    for (let i = 1; i < lista.length; i++) expect(categoriaDe(lista[i - 1].clave, lista[i].clave)).not.toBeNull()
  })
  it('sube el BPM hasta donde se le pide', () => {
    const lista = generarRadio(temas, { semilla: leerClave('1m'), bpmInicio: 120, subida: 20, cuantos: 10, azar: primero })
    expect(lista[0].bpm).toBe(120)
    expect(lista.at(-1).bpm).toBeGreaterThanOrEqual(138)
  })
  it('no repite temas', () => {
    const lista = generarRadio(temas, { semilla: leerClave('1m'), cuantos: 40, azar: Math.random })
    expect(new Set(lista.map((t) => t.id)).size).toBe(lista.length)
  })
  it('quita duplicados de artista y título', () => {
    expect(sinRepetidos([{ artista: 'Amelie Lens', titulo: 'In Silence' }, { artista: 'amelie lens', titulo: 'In  Silence' }])).toHaveLength(1)
  })
})
