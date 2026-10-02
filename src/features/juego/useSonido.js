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
  const turno = useRef(0) // si pides otro sonido (o paras) mientras uno carga, el viejo no llega a sonar

  const parar = useCallback(() => {
    turno.current++
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
      const mio = turno.current
      if (tieneArchivo(tema)) {
        try {
          const fuente = await resolver(tema)
          const a = new Audio(fuente.url)
          if (fuente.temporal) temporal.current = fuente.url
          // El tema entero: salta la intro. El fragmento privado ya empieza donde entra el ritmo.
          if (fuente.origen === 'carpeta') a.addEventListener('loadedmetadata', () => (a.currentTime = Math.min(60, a.duration * 0.3)), { once: true })
          await a.play()
          if (mio !== turno.current) {
            a.pause()
            return 'parado'
          }
          audio.current = a
          return 'tema'
        } catch {
          // sin permiso, sin conexión o formato raro: seguimos con el ritmo
        }
      }
      if (mio !== turno.current) return 'parado'
      // Sin audio: el ritmo a su BPM y, si sabemos su clave, su acorde (para los juegos de tono)
      ritmo.current = iniciarRitmo(tema.bpm, { clave: tema.clave ?? null })
      return 'ritmo'
    },
    [parar, resolver, tieneArchivo]
  )

  useEffect(() => parar, [parar])
  return { sonar, parar }
}
