import { useCallback, useEffect, useState } from 'react'
import { guardar, leer } from '../../lib/almacen'
import { recordsDeLaNube, subirPuntuacion } from '../../lib/puntuaciones'

const clave = (juego) => `juego:${juego}`
const VACIO = { mejor: 0, partidas: 0 }

/**
 * Récords de los juegos. Siempre en este navegador (IndexedDB, «juego:bpm», «juego:pega»…).
 * Si has entrado con tu cuenta, además en Supabase: cada partida se apunta y, al abrir,
 * gana el mejor de los dos sitios (así juegas en el móvil y el récord sale también en el Mac).
 */
export function useRecords(juegos) {
  const lista = juegos.join(',')
  const [records, setRecords] = useState({})
  const [nube, setNube] = useState(false)

  useEffect(() => {
    let vivo = true
    const ids = lista.split(',')
    Promise.all(ids.map((j) => leer(clave(j)).catch(() => null))).then(async (locales) => {
      const base = Object.fromEntries(ids.map((j, i) => [j, locales[i] ?? VACIO]))
      if (vivo) setRecords(base)
      try {
        const remotos = await recordsDeLaNube()
        if (!remotos || !vivo) return
        setNube(true)
        const juntos = Object.fromEntries(ids.map((j) => [j, { mejor: Math.max(base[j].mejor, remotos[j]?.mejor ?? 0), partidas: Math.max(base[j].partidas, remotos[j]?.partidas ?? 0) }]))
        setRecords(juntos)
        ids.forEach((j) => guardar(clave(j), juntos[j]).catch(() => {}))
      } catch (e) {
        console.warn(e.message) // sin tabla o sin conexión: seguimos con lo de este navegador
      }
    })
    return () => {
      vivo = false
    }
  }, [lista])

  const apuntar = useCallback((juego, puntos, maximo, detalle) => {
    setRecords((r) => {
      const antes = r[juego] ?? VACIO
      const nuevo = { mejor: Math.max(antes.mejor, puntos), partidas: antes.partidas + 1, ultima: Date.now() }
      guardar(clave(juego), nuevo).catch(() => {})
      return { ...r, [juego]: nuevo }
    })
    subirPuntuacion({ juego, puntos, maximo, detalle })
      .then((subida) => subida && setNube(true))
      .catch((e) => console.warn(e.message))
  }, [])

  return { records, nube, apuntar }
}

/** El récord de un solo juego. */
export function useRecord(juego) {
  const { records, nube, apuntar } = useRecords([juego])
  const r = records[juego] ?? VACIO
  return { ...r, nube, apuntar: useCallback((puntos, maximo, detalle) => apuntar(juego, puntos, maximo, detalle), [apuntar, juego]) }
}
