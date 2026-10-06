import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { guardar, leer } from '../../lib/almacen'
import { huella } from '../../lib/vibra'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import DialVibra from './DialVibra'

const VibrasContext = createContext(null)
const CLAVE = 'vibras' // { [huella]: idFranja } en IndexedDB
const LOTE = 400 // huellas por tanda: con miles de temas, la pantalla no se queda pillada

/**
 * Las vibras que fuerza el DJ, guardadas en este navegador por la huella del tema (SHA-256 de su ruta de Traktor).
 * La huella no cambia aunque reimportes la colección: tu vibra vuelve cuando el tema vuelve a sonar.
 * También pinta el dial: cualquier pantalla puede abrirlo con `abrirDial(tema)`.
 */
export function VibrasProvider({ children }) {
  const { temas } = useBiblioteca()
  const [guardadas, setGuardadas] = useState({})
  const [porTema, setPorTema] = useState(() => new Map()) // tema.id → idFranja
  const [enDial, setEnDial] = useState(null)
  const huellas = useRef(new Map()) // tema.id → huella (se calcula una vez)

  useEffect(() => {
    leer(CLAVE)
      .then((v) => v && setGuardadas(v))
      .catch(() => {}) // sin IndexedDB (modo privado): las vibras viven solo en esta sesión
  }, [])

  const huellaDe = useCallback(async (tema) => {
    if (!huellas.current.has(tema.id)) huellas.current.set(tema.id, await huella(tema))
    return huellas.current.get(tema.id)
  }, [])

  // Sin vibras guardadas no hay nada que buscar: solo se calculan huellas si hacen falta
  useEffect(() => {
    if (!Object.keys(guardadas).length) return // ponerVibra ya quita del mapa lo que borras
    let vivo = true
    ;(async () => {
      const mapa = new Map()
      for (let i = 0; i < temas.length && vivo; i += LOTE) {
        const lote = temas.slice(i, i + LOTE)
        const ids = await Promise.all(lote.map(huellaDe))
        lote.forEach((t, j) => guardadas[ids[j]] && mapa.set(t.id, guardadas[ids[j]]))
      }
      if (vivo) setPorTema(mapa)
    })()
    return () => {
      vivo = false
    }
  }, [temas, guardadas, huellaDe])

  /** Fuerza la vibra de un tema (idFranja) o la devuelve al cálculo (null). */
  const ponerVibra = useCallback(
    async (tema, idFranja) => {
      const id = await huellaDe(tema)
      setPorTema((m) => {
        const n = new Map(m)
        if (idFranja) n.set(tema.id, idFranja)
        else n.delete(tema.id)
        return n
      })
      setGuardadas((g) => {
        const n = { ...g }
        if (idFranja) n[id] = idFranja
        else delete n[id]
        guardar(CLAVE, n).catch(() => {})
        return n
      })
    },
    [huellaDe]
  )

  const vibraDe = useCallback((tema) => (tema ? (porTema.get(tema.id) ?? null) : null), [porTema])
  const abrirDial = useCallback((tema) => setEnDial(tema), [])

  const valor = useMemo(() => ({ vibraDe, ponerVibra, abrirDial }), [vibraDe, ponerVibra, abrirDial])

  return (
    <VibrasContext.Provider value={valor}>
      {children}
      {enDial && <DialVibra tema={enDial} vibra={vibraDe(enDial)} alCambiar={(id) => ponerVibra(enDial, id)} alCerrar={() => setEnDial(null)} />}
    </VibrasContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useVibras() {
  const ctx = useContext(VibrasContext)
  if (!ctx) throw new Error('useVibras necesita <VibrasProvider>')
  return ctx
}
