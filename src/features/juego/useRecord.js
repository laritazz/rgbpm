import { useCallback, useEffect, useState } from 'react'
import { guardar, leer } from '../../lib/almacen'

const CLAVE = 'juego:bpm'

/** Récord y partidas del juego «Adivina el BPM», guardados en este dispositivo. */
export function useRecord() {
  const [datos, setDatos] = useState({ mejor: 0, partidas: 0 })

  useEffect(() => {
    let vivo = true
    leer(CLAVE)
      .then((d) => vivo && d && setDatos(d))
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  const apuntar = useCallback((total) => {
    setDatos((d) => {
      const nuevos = { mejor: Math.max(d.mejor, total), partidas: d.partidas + 1, ultima: Date.now() }
      guardar(CLAVE, nuevos).catch(() => {})
      return nuevos
    })
  }, [])

  return { ...datos, apuntar }
}
