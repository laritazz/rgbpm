import { describe, expect, it } from 'vitest'
import { leerClave } from './claves'
import { claveTraktor, exportarCsv, exportarM3u, exportarNml, importarSet, reordenar, saludSet } from './set'
import { estadoInicial, setReducer } from './setEstado'

const t = (id, bpm, clave, extra = {}) => ({ id, titulo: `Tema ${id}`, artista: 'Laritazz', bpm, clave: leerClave(clave), ...extra })

describe('salud del set', () => {
  it('cuenta transiciones buenas, choques y saltos', () => {
    const s = saludSet([t('a', 124, '8m'), t('b', 125, '9m'), t('c', 126, '3d'), t('d', 140, '3d')])
    expect(s.total).toBe(3)
    expect(s.choques).toBe(1) // 9m → 3d no pega
    expect(s.saltos).toBe(1) // 126 → 140
    expect(s.porcentaje).toBe(67)
  })
})

describe('reordenar', () => {
  it('encadena sin choques cuando se puede y sube el BPM', () => {
    const lio = [t('a', 130, '10m'), t('b', 122, '8m'), t('c', 126, '9m'), t('d', 124, '8m'), t('e', 128, '10m')]
    const { orden } = reordenar(lio)
    expect(orden.map((x) => x.id)).toEqual(['b', 'd', 'c', 'e', 'a'])
    expect(saludSet(orden).choques).toBe(0)
  })
  it('deja al final los temas sin clave', () => {
    const { orden } = reordenar([t('x', 120, ''), t('a', 122, '8m'), t('b', 123, '8m')])
    expect(orden.at(-1).id).toBe('x')
  })
})

describe('exportar', () => {
  const temas = [
    t('a', 128, '8m', { volumen: 'Macintosh HD', carpeta: '/:Users/:lara/:Music/:', archivo: 'A & B.mp3', ruta: '/Users/lara/Music/A & B.mp3', duracion: 200 }),
    t('b', 130, '1d', { ruta: '/Volumes/LaritaZZ/x/b.mp3', archivo: 'b.mp3' }),
  ]
  it('el .nml lleva claves de Traktor y escapa el XML', () => {
    const nml = exportarNml(temas, 'Mi set', 'u1')
    expect(nml).toContain('KEY="Macintosh HD/:Users/:lara/:Music/:A &amp; B.mp3"')
    expect(nml).toContain(`<MUSICAL_KEY VALUE="${claveTraktor(leerClave('8m'))}">`)
    expect(nml).toContain('<PLAYLIST ENTRIES="2"')
  })
  it('la clave de Traktor es la inversa de la que leemos', () => {
    for (const id of ['1m', '8m', '12d', '5d']) expect(leerClave(String(claveTraktor(leerClave(id)))).id).toBe(id)
  })
  it('m3u y csv', () => {
    expect(exportarM3u(temas)).toContain('#EXTINF:200,Laritazz - Tema a')
    expect(exportarCsv(temas).split('\n')[1]).toBe('"1","Laritazz","Tema a","128","8m","3A","Bbm","200"')
  })
})

describe('importar', () => {
  const biblioteca = [
    t('a', 128, '8m', { volumen: 'Macintosh HD', carpeta: '/:Users/:lara/:', archivo: 'Uno.mp3' }),
    t('b', 124, '8m', { archivo: 'Dos (Extended).mp3', artista: 'Amelie Lens', titulo: 'In Silence' }),
  ]
  it('casa un .nml de Traktor, un .m3u y un .txt', () => {
    expect(importarSet('<PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Users/:lara/:Uno.mp3">', 'x.nml', biblioteca).ids).toEqual(['a'])
    expect(importarSet('#EXTM3U\n/Volumes/X/Dos (Extended).mp3\n/otro/No.mp3', 'x.m3u', biblioteca)).toEqual({ ids: ['b'], sinCasar: 1 })
    expect(importarSet('01. Amelie Lens – In Silence  (124 BPM · 8m)', 'x.txt', biblioteca).ids).toEqual(['b'])
  })
})

describe('estado del set (reducer)', () => {
  const r = (acciones, inicio = estadoInicial) => acciones.reduce(setReducer, inicio)
  it('añade sin repetir, mueve y deshace paso a paso', () => {
    const e = r([
      { tipo: 'anadir', ids: ['a', 'b'] },
      { tipo: 'anadir', ids: ['b', 'c'] },
      { tipo: 'mover', desde: 2, hasta: 0 },
    ])
    expect(e.ids).toEqual(['c', 'a', 'b'])
    expect(setReducer(e, { tipo: 'deshacer' }).ids).toEqual(['a', 'b', 'c'])
    expect(r([{ tipo: 'deshacer' }, { tipo: 'deshacer' }], e).ids).toEqual(['a', 'b'])
  })
  it('guardar con el mismo nombre actualiza en vez de duplicar', () => {
    const e = r([
      { tipo: 'anadir', ids: ['a'] },
      { tipo: 'guardar', id: 's1', fecha: 1 },
      { tipo: 'anadir', ids: ['b'] },
      { tipo: 'guardar', id: 's2', fecha: 2 },
    ])
    expect(e.guardados).toHaveLength(1)
    expect(e.guardados[0]).toMatchObject({ id: 's1', ids: ['a', 'b'] })
  })
})
