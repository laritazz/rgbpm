import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useMusica } from './MusicaContext'

const ReproductorContext = createContext(null)
// El tiempo cambia varias veces por segundo: va aparte para que solo se repinte quien lo muestra
const TiempoContext = createContext({ tiempo: 0, duracion: 0 })

/**
 * Un solo reproductor para toda la app: la biblioteca, el panel y la barra de abajo
 * leen y mandan sobre el mismo <audio>.
 * estado: parado · cargando · sonando · pausa · sin-archivo · error
 */
export function ReproductorProvider({ children }) {
  const { resolver } = useMusica()
  const audio = useRef(null)
  const urlTemporal = useRef(null)
  const peticion = useRef(0)
  const [tema, setTema] = useState(null)
  const [estado, setEstado] = useState('parado')
  const [tiempo, setTiempo] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const [origen, setOrigen] = useState(null)
  // Copia de lo último que sonó, para que `reproducir` no cambie en cada render
  const actual = useRef({ tema: null, estado: 'parado' })
  useEffect(() => {
    actual.current = { tema, estado }
  }, [tema, estado])

  const soltarTemporal = () => {
    if (urlTemporal.current) URL.revokeObjectURL(urlTemporal.current)
    urlTemporal.current = null
  }

  useEffect(() => soltarTemporal, [])

  const reproducir = useCallback(
    async (nuevo) => {
      const el = audio.current
      // Mismo tema: pausa o sigue
      const { tema: previo, estado: antes } = actual.current
      if (previo?.id === nuevo.id && el.src && antes !== 'error') {
        if (el.paused) el.play().catch(() => setEstado('error'))
        else el.pause()
        return
      }
      const mia = ++peticion.current // si llega otro clic mientras carga, gana el último
      setTema(nuevo)
      setTiempo(0)
      setDuracion(nuevo.duracion ?? 0)
      setEstado('cargando')
      const fuente = await resolver(nuevo).catch(() => null)
      if (mia !== peticion.current) {
        if (fuente?.temporal) URL.revokeObjectURL(fuente.url)
        return
      }
      if (!fuente) {
        el.removeAttribute('src')
        el.load()
        setOrigen(null)
        setEstado('sin-archivo')
        return
      }
      soltarTemporal()
      if (fuente.temporal) urlTemporal.current = fuente.url
      setOrigen(fuente.origen)
      el.src = fuente.url
      el.play().catch((e) => e.name !== 'AbortError' && setEstado('error'))
    },
    [resolver]
  )

  const alternar = useCallback(() => {
    const el = audio.current
    if (!el.src) return
    if (el.paused) el.play().catch(() => setEstado('error'))
    else el.pause()
  }, [])

  const buscar = useCallback((segundos) => {
    if (audio.current?.src) audio.current.currentTime = segundos
  }, [])

  const valor = useMemo(
    () => ({ tema, estado, sonando: estado === 'sonando', origen, reproducir, alternar, buscar }),
    [tema, estado, origen, reproducir, alternar, buscar]
  )
  const reloj = useMemo(() => ({ tiempo, duracion }), [tiempo, duracion])

  return (
    <ReproductorContext.Provider value={valor}>
      <TiempoContext.Provider value={reloj}>{children}</TiempoContext.Provider>
      <audio
        ref={audio}
        preload="auto"
        onPlaying={() => setEstado('sonando')}
        onPause={() => setEstado((e) => (e === 'sin-archivo' || e === 'error' ? e : 'pausa'))}
        onWaiting={() => setEstado('cargando')}
        onEnded={() => setEstado('pausa')}
        onError={() => audio.current?.getAttribute('src') && setEstado('error')}
        onTimeUpdate={(e) => setTiempo(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration)}
      />
    </ReproductorContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useReproductor() {
  const ctx = useContext(ReproductorContext)
  if (!ctx) throw new Error('useReproductor necesita <ReproductorProvider>')
  return ctx
}

// oxlint-disable-next-line react/only-export-components
export const useTiempo = () => useContext(TiempoContext)
