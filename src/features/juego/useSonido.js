import { useCallback, useEffect, useRef } from 'react'
import { useMusica } from '../musica/MusicaContext'
import { iniciarRitmo } from './ritmo'

/**
 * Hace sonar un tema para jugar: tu archivo (desde el minuto bueno, no la intro) o su fragmento privado.
 * Si no hay audio, un ritmo sintetizado a su BPM: así se juega también con la demo.
 * Va aparte del reproductor para no chivar el título en la barra de abajo.
 */
export function useSonido() {
  const { resolver, tieneArchivo } = useMusica()
  const audio = useRef(null)
  const ritmo = useRef(null)
  const temporal = useRef(null)

  const parar = useCallback(() => {
    audio.current?.pause()
    audio.current = null
    ritmo.current?.parar()
    ritmo.current = null
    if (temporal.current) URL.revokeObjectURL(temporal.current)
    temporal.current = null
  }, [])

  const sonar = useCallback(
    async (tema) => {
      parar()
      if (tieneArchivo(tema)) {
        try {
          const fuente = await resolver(tema)
          const a = new Audio(fuente.url)
          if (fuente.temporal) temporal.current = fuente.url
          // El tema entero: salta la intro. El fragmento privado ya empieza donde entra el ritmo.
          if (fuente.origen === 'carpeta') a.addEventListener('loadedmetadata', () => (a.currentTime = Math.min(60, a.duration * 0.3)), { once: true })
          await a.play()
          audio.current = a
          return 'tema'
        } catch {
          // sin permiso, sin conexión o formato raro: seguimos con el ritmo
        }
      }
      ritmo.current = iniciarRitmo(tema.bpm)
      return 'ritmo'
    },
    [parar, resolver, tieneArchivo]
  )

  useEffect(() => parar, [parar])
  return { sonar, parar }
}
