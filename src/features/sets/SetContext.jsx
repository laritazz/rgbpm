import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { guardar as guardarEnDisco, leer } from '../../lib/almacen'
import { estadoInicial, setReducer } from '../../lib/setEstado'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'

const SetContext = createContext(null)
const CLAVE = 'set'

/**
 * El set en curso y los guardados. useReducer: cada cambio es una acción con nombre
 * y todo se puede deshacer. Se guarda solo en IndexedDB (sobrevive a recargar).
 */
export function SetProvider({ children }) {
  const { porId } = useBiblioteca()
  const [estado, despachar] = useReducer(setReducer, estadoInicial)

  useEffect(() => {
    let vivo = true
    leer(CLAVE)
      .catch(() => null)
      .then((datos) => vivo && despachar({ tipo: 'cargar', datos: datos ?? {} }))
    return () => {
      vivo = false
    }
  }, [])

  // Guardar con un pequeño retraso: arrastrar diez veces no son diez escrituras
  useEffect(() => {
    if (!estado.listo) return
    const t = setTimeout(() => guardarEnDisco(CLAVE, { nombre: estado.nombre, ids: estado.ids, guardados: estado.guardados }).catch(() => {}), 300)
    return () => clearTimeout(t)
  }, [estado.listo, estado.nombre, estado.ids, estado.guardados])

  // Si cambias de colección, los temas que ya no existen no se pintan (pero no se pierden del set)
  const temas = useMemo(() => estado.ids.map((id) => porId.get(id)).filter(Boolean), [estado.ids, porId])
  const indiceReal = useCallback((i) => estado.ids.indexOf(temas[i]?.id), [estado.ids, temas])

  const acciones = useMemo(
    () => ({
      // despuesDe: el id del tema tras el que se mete (el ancla); sin él, al final
      anadir: (ids, despuesDe) => despachar({ tipo: 'anadir', ids: [].concat(ids), posicion: despuesDe ? estado.ids.indexOf(despuesDe) + 1 : undefined }),
      quitar: (id) => despachar({ tipo: 'quitar', indice: estado.ids.indexOf(id) }),
      mover: (desde, hasta) => despachar({ tipo: 'mover', desde: indiceReal(desde), hasta: indiceReal(hasta) }),
      cambiar: (idViejo, idNuevo) => despachar({ tipo: 'cambiar', indice: estado.ids.indexOf(idViejo), id: idNuevo }),
      reemplazar: (ids, nombre) => despachar({ tipo: 'reemplazar', ids, nombre }),
      renombrar: (nombre) => despachar({ tipo: 'renombrar', nombre }),
      deshacer: () => despachar({ tipo: 'deshacer' }),
      guardar: () => despachar({ tipo: 'guardar', id: `s${Date.now().toString(36)}`, fecha: Date.now() }),
      borrarGuardado: (id) => despachar({ tipo: 'borrarGuardado', id }),
    }),
    [estado.ids, indiceReal]
  )

  const enSet = useMemo(() => new Set(estado.ids), [estado.ids])

  const valor = useMemo(
    () => ({ nombre: estado.nombre, temas, guardados: estado.guardados, enSet, puedeDeshacer: estado.historial.length > 0, listo: estado.listo, ...acciones }),
    [estado.nombre, temas, estado.guardados, enSet, estado.historial.length, estado.listo, acciones]
  )

  return <SetContext.Provider value={valor}>{children}</SetContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useSet() {
  const ctx = useContext(SetContext)
  if (!ctx) throw new Error('useSet necesita <SetProvider>')
  return ctx
}
