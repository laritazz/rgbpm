import { useCallback, useEffect, useRef, useState } from 'react'

// El script del widget se carga una sola vez para toda la app
let promesaScript = null
function cargarScript() {
  promesaScript ??= new Promise((resolver, fallar) => {
    const s = document.createElement('script')
    s.src = 'https://w.soundcloud.com/player/api.js'
    s.onload = () => resolver(window.SC)
    s.onerror = () => {
      promesaScript = null
      fallar(new Error('No se pudo cargar SoundCloud'))
    }
    document.head.appendChild(s)
  })
  return promesaScript
}

/**
 * Controla desde React el reproductor oficial de SoundCloud (Widget API).
 * Devuelve la ref para el <iframe>, el estado de reproducción y los mandos.
 */
export function useSoundCloud() {
  const iframe = useRef(null)
  const widget = useRef(null)
  const [listo, setListo] = useState(false)
  const [sonando, setSonando] = useState(false)
  const [sonidos, setSonidos] = useState([])
  const [actual, setActual] = useState(null)
  const [progreso, setProgreso] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    let vivo = true
    cargarScript()
      .then((SC) => {
        if (!vivo || !iframe.current) return
        const w = SC.Widget(iframe.current)
        widget.current = w
        const { READY, PLAY, PAUSE, FINISH, PLAY_PROGRESS } = SC.Widget.Events
        const leerActual = () => w.getCurrentSound((s) => vivo && s && setActual(s))
        w.bind(READY, () => {
          setListo(true)
          w.getSounds((lista) => vivo && setSonidos(lista ?? []))
          leerActual()
        })
        w.bind(PLAY, () => {
          setSonando(true)
          leerActual()
          // La lista completa llega poco a poco: se pide otra vez al empezar a sonar
          w.getSounds((lista) => vivo && setSonidos(lista ?? []))
        })
        w.bind(PAUSE, () => setSonando(false))
        w.bind(FINISH, () => setSonando(false))
        w.bind(PLAY_PROGRESS, (e) => setProgreso(e.relativePosition ?? 0))
      })
      .catch((e) => vivo && setError(e.message))
    return () => {
      vivo = false
      const w = widget.current
      if (w && window.SC) Object.values(window.SC.Widget.Events).forEach((ev) => w.unbind(ev))
    }
  }, [])

  const alternar = useCallback(() => widget.current?.toggle(), [])
  const saltar = useCallback((indice) => {
    widget.current?.skip(indice)
    setProgreso(0)
  }, [])

  return { iframe, listo, sonando, sonidos, actual, progreso, error, alternar, saltar }
}
