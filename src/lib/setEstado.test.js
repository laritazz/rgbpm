import { describe, expect, it } from 'vitest'
import { estadoInicial, setReducer } from './setEstado'

// Aplica varias acciones seguidas, como haría useReducer
const tras = (acciones, estado = { ...estadoInicial, listo: true }) => acciones.reduce(setReducer, estado)
const conTres = () => tras([{ tipo: 'anadir', ids: ['a', 'b', 'c'] }])

describe('setReducer', () => {
  it('cargar trae lo guardado, marca listo y empieza sin historial', () => {
    const estado = setReducer({ ...estadoInicial, historial: [{ nombre: 'x', ids: [] }] }, { tipo: 'cargar', datos: { nombre: 'Viernes', ids: ['a'] } })
    expect(estado).toMatchObject({ nombre: 'Viernes', ids: ['a'], historial: [], listo: true })
  })

  it('añadir no repite temas y respeta la posición', () => {
    const estado = tras([{ tipo: 'anadir', ids: ['b', 'a', 'd'], posicion: 1 }], conTres())
    expect(estado.ids).toEqual(['a', 'd', 'b', 'c'])
  })

  it('una acción que no cambia nada devuelve el mismo estado (no se apunta en el historial)', () => {
    const estado = conTres()
    expect(setReducer(estado, { tipo: 'anadir', ids: ['a'] })).toBe(estado)
    expect(setReducer(estado, { tipo: 'mover', desde: 0, hasta: 0 })).toBe(estado)
    expect(setReducer(estado, { tipo: 'mover', desde: 0, hasta: 3 })).toBe(estado)
    expect(setReducer(estado, { tipo: 'cambiar', indice: 0, id: 'b' })).toBe(estado)
  })

  it('quitar, mover y cambiar', () => {
    expect(tras([{ tipo: 'quitar', indice: 1 }], conTres()).ids).toEqual(['a', 'c'])
    expect(tras([{ tipo: 'mover', desde: 0, hasta: 2 }], conTres()).ids).toEqual(['b', 'c', 'a'])
    expect(tras([{ tipo: 'cambiar', indice: 1, id: 'z' }], conTres()).ids).toEqual(['a', 'z', 'c'])
  })

  it('reemplazar quita duplicados y conserva el nombre si no llega otro', () => {
    const estado = tras([{ tipo: 'reemplazar', ids: ['c', 'a', 'c'] }], conTres())
    expect(estado).toMatchObject({ ids: ['c', 'a'], nombre: 'Mi set' })
    expect(tras([{ tipo: 'reemplazar', ids: [], nombre: 'Vacío' }], conTres()).nombre).toBe('Vacío')
  })

  it('deshacer vuelve atrás paso a paso; renombrar no se deshace', () => {
    const estado = tras([{ tipo: 'quitar', indice: 0 }, { tipo: 'renombrar', nombre: 'Sábado' }, { tipo: 'quitar', indice: 0 }], conTres())
    expect(estado.ids).toEqual(['c'])
    const uno = setReducer(estado, { tipo: 'deshacer' })
    expect(uno.ids).toEqual(['b', 'c'])
    const dos = setReducer(uno, { tipo: 'deshacer' })
    expect(dos.ids).toEqual(['a', 'b', 'c'])
    const tres = setReducer(dos, { tipo: 'deshacer' })
    expect(tres.ids).toEqual([])
    expect(setReducer(tres, { tipo: 'deshacer' })).toBe(tres)
  })

  it('el historial guarda como mucho 40 pasos', () => {
    const acciones = Array.from({ length: 50 }, (_, i) => ({ tipo: 'anadir', ids: [`t${i}`] }))
    expect(tras(acciones).historial).toHaveLength(40)
  })

  it('guardar crea uno nuevo o actualiza el del mismo nombre (sin mirar mayúsculas)', () => {
    const primero = tras([{ tipo: 'renombrar', nombre: '  Warm-up ' }, { tipo: 'guardar', id: 'g1', fecha: 1 }], conTres())
    expect(primero.guardados).toEqual([{ id: 'g1', nombre: 'Warm-up', ids: ['a', 'b', 'c'], creado: 1 }])
    const segundo = tras([{ tipo: 'quitar', indice: 0 }, { tipo: 'renombrar', nombre: 'WARM-UP' }, { tipo: 'guardar', id: 'g2', fecha: 2 }], primero)
    expect(segundo.guardados).toEqual([{ id: 'g1', nombre: 'WARM-UP', ids: ['b', 'c'], creado: 2 }])
  })

  it('sin nombre se guarda como «Set»; borrar quita solo ese', () => {
    const estado = tras([{ tipo: 'renombrar', nombre: '   ' }, { tipo: 'guardar', id: 'g1', fecha: 1 }], conTres())
    expect(estado.guardados[0].nombre).toBe('Set')
    expect(setReducer(estado, { tipo: 'borrarGuardado', id: 'g1' }).guardados).toEqual([])
  })

  it('una acción desconocida avisa', () => {
    expect(() => setReducer(estadoInicial, { tipo: 'bailar' })).toThrow('Acción desconocida: bailar')
  })
})
