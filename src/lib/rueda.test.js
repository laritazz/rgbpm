import { describe, expect, it } from 'vitest'
import { compatibles } from './armonia'
import { etiquetaClave, leerClave } from './claves'
import { azarConSemilla, relacionPorClave, sugerirSet, temasPorCategoria } from './rueda'

const k = (s) => leerClave(s)
const t = (id, bpm, clave) => ({ id, titulo: id, artista: 'x', bpm, clave: k(clave) })

describe('notación', () => {
  it('escribe la misma clave en Open Key, Camelot o tono', () => {
    expect(etiquetaClave(k('1m'), 'open')).toBe('1m')
    expect(etiquetaClave(k('1m'), 'camelot')).toBe('8A')
    expect(etiquetaClave(k('1m'), 'nombre')).toBe('Am')
    expect(etiquetaClave(null)).toBe('—')
  })
})

describe('corregir desfase', () => {
  it('corregido, la relativa de La menor es Do mayor; sin corregir, como en la hoja original', () => {
    expect(relacionPorClave(k('1m'), true).get('1d').id).toBe('clavado')
    expect(relacionPorClave(k('1m'), false).get('12d').id).toBe('clavado')
    expect(relacionPorClave(k('1m'), false).get('1d').id).toBe('sube') // en la hoja, Do mayor caía en «Sube»
  })
  it('la semilla no se pinta como relación de sí misma', () => {
    expect(relacionPorClave(k('8m')).has('8m')).toBe(false)
  })
})

describe('set sugerido', () => {
  const biblioteca = [t('a', 124, '1m'), t('b', 150, '1m'), t('c', 125, '1d'), t('d', 126, '2d'), t('e', 125, '12m'), t('lejos', 170, '2m')]

  it('sale de la semilla, no repite clave ni tema y respeta los pasos', () => {
    const set = sugerirSet(k('1m'), biblioteca, { pasos: 4, bpmInicio: 124, azar: () => 0 })
    expect(set).toHaveLength(4)
    expect(set[0].clave.id).toBe('1m')
    expect(new Set(set.map((p) => p.clave.id)).size).toBe(4)
    expect(set[0].elegido.id).toBe('a')
  })
  it('cada salto es una relación válida y va a la clave con tema a tu tempo', () => {
    const set = sugerirSet(k('1m'), biblioteca, { pasos: 3, bpmInicio: 124, azar: () => 0 })
    expect(set[1].categoria).not.toBeNull()
    expect(set.map((p) => p.elegido?.id)).not.toContain('lejos')
    expect(set[1].diferencia).toBe(1)
  })
  it('lo que fijas a mano se respeta y el resto se recalcula', () => {
    const set = sugerirSet(k('1m'), biblioteca, { pasos: 3, bpmInicio: 124, fijados: { 0: 'b' }, azar: () => 0 })
    expect(set[0].elegido.id).toBe('b')
    expect(set[0].alternativas.map((x) => x.id)).toContain('a')
  })
  it('sin temas posibles, el paso queda vacío sin romper la cadena', () => {
    const set = sugerirSet(k('6m'), biblioteca, { pasos: 3, azar: () => 0 })
    expect(set[0].elegido).toBeNull()
    expect(set).toHaveLength(3)
  })
  it('con subida, el set va ganando tempo; sin ella, se queda en el suyo', () => {
    const escalera = [t('s1', 120, '1m'), t('s2', 120, '1d'), t('s3', 126, '1d'), t('s4', 120, '12m'), t('s5', 132, '12m'), t('s6', 120, '2m'), t('s7', 132, '2m'), t('s8', 138, '2m')]
    const sube = sugerirSet(k('1m'), escalera, { pasos: 4, bpmInicio: 120, subida: 4, azar: () => 0 }).map((p) => p.elegido?.bpm).filter(Boolean)
    expect(sube[0]).toBe(120)
    expect(sube.at(-1)).toBeGreaterThan(120)
    const plano = sugerirSet(k('1m'), escalera, { pasos: 4, bpmInicio: 120, azar: () => 0 }).map((p) => p.elegido?.bpm).filter(Boolean)
    expect(plano.every((b) => b === 120)).toBe(true)
  })
  it('con la misma semilla de azar sale la misma tirada', () => {
    const a = azarConSemilla(7)
    const b = azarConSemilla(7)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})

describe('tolerancia de BPM', () => {
  const biblioteca = [t('cerca', 128, '1m'), t('lejos', 140, '1m'), t('doble', 64, '1m')]
  it('filtra por el margen elegido, contando doble y mitad', () => {
    const [clavado] = temasPorCategoria(k('1m'), biblioteca, { bpm: 128, tolerancia: 4 })
    expect(clavado.temas.map((o) => o.tema.id)).toEqual(['cerca', 'doble'])
    expect(clavado.fuera).toBe(1)
  })
  it('compatibles usa el margen que le pases', () => {
    const semilla = t('s', 128, '1m')
    expect(compatibles(semilla, biblioteca, 8, { tolerancia: 4 }).map((o) => o.tema.id)).not.toContain('lejos')
    expect(compatibles(semilla, biblioteca, 8, { tolerancia: 10 }).map((o) => o.tema.id)).toContain('lejos')
  })
})
