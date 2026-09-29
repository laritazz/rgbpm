import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { borrar, guardar, leer } from '../../lib/almacen'
import { leerClave } from '../../lib/claves'
import { leerNml } from '../../lib/traktor'
import demo from '../../data/demo.json'

const BibliotecaContext = createContext(null)
const CLAVE = 'coleccion'

// En la demo, la clave viene como texto («8m»): se convierte en objeto una sola vez
const DEMO = {
  origen: 'demo',
  temas: demo.temas.map((t) => ({ ...t, clave: leerClave(t.clave) })),
  playlists: demo.playlists,
}

/**
 * Fuente única de verdad de la biblioteca.
 * Arranca con la demo (mis sets) y, si has importado tu collection.nml, la recupera de IndexedDB.
 */
export function BibliotecaProvider({ children }) {
  const [coleccion, setColeccion] = useState(DEMO)
  const [estado, setEstado] = useState('cargando') // cargando · listo · leyendo · error
  const [error, setError] = useState(null)

  useEffect(() => {
    let vivo = true
    leer(CLAVE)
      .then((guardada) => vivo && guardada && setColeccion(guardada))
      .catch(() => {}) // Sin IndexedDB (modo privado): seguimos con la demo
      .finally(() => vivo && setEstado('listo'))
    return () => {
      vivo = false
    }
  }, [])

  const importar = useCallback(async (archivo) => {
    setEstado('leyendo')
    setError(null)
    try {
      const { temas, playlists, descartados } = leerNml(await archivo.text())
      if (!temas.length) throw new Error('No he encontrado temas en ese archivo')
      const nueva = { origen: 'propia', nombre: archivo.name, fecha: Date.now(), temas, playlists, descartados }
      setColeccion(nueva)
      await guardar(CLAVE, nueva).catch(() => {})
      setEstado('listo')
      return nueva
    } catch (e) {
      setError(e.message)
      setEstado('error')
      return null
    }
  }, [])

  const volverADemo = useCallback(async () => {
    setColeccion(DEMO)
    await borrar(CLAVE).catch(() => {})
  }, [])

  const valor = useMemo(
    () => ({
      ...coleccion,
      porId: new Map(coleccion.temas.map((t) => [t.id, t])),
      estado,
      error,
      importar,
      volverADemo,
    }),
    [coleccion, estado, error, importar, volverADemo]
  )

  return <BibliotecaContext.Provider value={valor}>{children}</BibliotecaContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useBiblioteca() {
  const ctx = useContext(BibliotecaContext)
  if (!ctx) throw new Error('useBiblioteca necesita <BibliotecaProvider>')
  return ctx
}
