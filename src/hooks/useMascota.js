import { useEffect, useRef, useState } from 'react'
import { energia } from '../lib/mascota'
import { useMovimientoReducido } from './useMovimientoReducido'

/**
 * Motor de la mascota: un bucle requestAnimationFrame que avanza el tiempo
 * y funde la forma (k) hacia la energía del BPM que suena.
 * El estado vivo va en una ref (no provoca renders); solo se publica una foto por fotograma.
 */
export function useMascota(bpm, activo = true) {
  const quieto = useMovimientoReducido()
  const objetivo = energia(bpm)
  const motor = useRef({ t: 0, k: objetivo, objetivo })
  const [foto, setFoto] = useState({ t: 0, k: objetivo, ahora: 0 })

  useEffect(() => {
    motor.current.objetivo = objetivo
    if (!activo || quieto) motor.current.k = objetivo
  }, [objetivo, activo, quieto])

  useEffect(() => {
    if (!activo || quieto) return
    let raf
    let antes = performance.now()
    const paso = (ahora) => {
      const dt = Math.min(0.1, (ahora - antes) / 1000)
      antes = ahora
      const m = motor.current
      m.t += dt
      m.k += (m.objetivo - m.k) * Math.min(1, dt * 2.5)
      setFoto({ t: m.t, k: m.k, ahora })
      raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [activo, quieto])

  const enMarcha = activo && !quieto
  // ahora: marca del fotograma (ms), para medir el tiempo desde un golpe externo (un tap)
  return { t: foto.t, k: enMarcha ? foto.k : objetivo, ahora: foto.ahora, enMarcha }
}
