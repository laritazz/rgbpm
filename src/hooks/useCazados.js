import { useCallback, useEffect, useState } from 'react'
import { guardar, leer } from '../lib/almacen'

const CLAVE = 'cazados'
const MAXIMO = 30

/** Historial de lo que has cazado con la escucha (BPM y clave), guardado en este dispositivo. */
export function useCazados() {
  const [cazados, setCazados] = useState([])

  useEffect(() => {
    let vivo = true
    leer(CLAVE)
      .then((lista) => vivo && lista && setCazados(lista))
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  const anadir = useCallback((caza) => {
    setCazados((lista) => {
      const nueva = [{ ...caza, fecha: Date.now() }, ...lista].slice(0, MAXIMO)
      guardar(CLAVE, nueva).catch(() => {})
      return nueva
    })
  }, [])

  const borrar = useCallback((fecha) => {
    setCazados((lista) => {
      const nueva = lista.filter((c) => c.fecha !== fecha)
      guardar(CLAVE, nueva).catch(() => {})
      return nueva
    })
  }, [])

  return { cazados, anadir, borrar }
}
