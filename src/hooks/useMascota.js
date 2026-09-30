import { useEffect, useRef, useState } from 'react'
import { energia, vida } from '../lib/mascota'
import { useMovimientoReducido } from './useMovimientoReducido'

const foto = (m, ahora) => ({
  t: m.t,
  k: m.k,
  ahora,
  despierta: m.despierta,
  vida: vida(m.t, { despierta: m.despierta, desde: m.desde, mira: m.mira, semilla: m.semilla }),
})

/**
 * Motor de la mascota: un bucle requestAnimationFrame que avanza el tiempo, funde la forma (k)
 * hacia la energía del BPM y calcula su «vida» (parpadeo, mirada, sueño).
 *
 * Dos maneras de usarlo:
 * - Sin `alPintar`: devuelve una foto por fotograma (provoca un render). Para la mascota grande.
 * - Con `alPintar(foto)`: no provoca renders; la función escribe directamente en el SVG. Para las pequeñas.
 *
 * `tocando` = false la duerme; al volver a sonar se despierta abriendo los ojos.
 */
export function useMascota(bpm, tocando = true, { alPintar = null, mira = null, semilla = 0 } = {}) {
  const quieto = useMovimientoReducido()
  const objetivo = energia(bpm)
  const motor = useRef({ t: 0, k: objetivo, objetivo, despierta: tocando, desde: 99, mira, semilla })
  const pintar = useRef(alPintar)
  const [ultima, setUltima] = useState(() => foto({ t: 0, k: objetivo, despierta: tocando, desde: 99, mira, semilla }, 0))

  // Las refs se actualizan después de pintar (no durante el render): el bucle lee siempre lo último
  useEffect(() => {
    pintar.current = alPintar
    motor.current.mira = mira
  })

  useEffect(() => {
    const m = motor.current
    m.objetivo = objetivo
    if (m.despierta !== tocando) {
      m.despierta = tocando
      m.desde = 0
    }
    if (quieto) {
      m.k = objetivo
      m.desde = 99
      const f = foto(m, performance.now())
      if (pintar.current) pintar.current(f)
      else setUltima(f)
    }
  }, [objetivo, tocando, quieto])

  useEffect(() => {
    if (quieto) return
    let raf
    let antes = performance.now()
    const paso = (ahora) => {
      const dt = Math.min(0.1, (ahora - antes) / 1000)
      antes = ahora
      const m = motor.current
      m.t += dt
      m.desde += dt
      m.k += (m.objetivo - m.k) * Math.min(1, dt * 2.5)
      const f = foto(m, ahora)
      if (pintar.current) pintar.current(f)
      else setUltima(f)
      raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [quieto])

  return { ...ultima, enMarcha: !quieto }
}
