import { useId } from 'react'
import { colorBpm, colorClave } from '../../lib/color'

const MAXIMO = 12

/**
 * Portada del set, generada: una franja por tramo del set. Cada franja baja de su BPM (arriba)
 * a su clave (abajo): se lee de izquierda a derecha como la energía de la sesión, y de arriba abajo como su tono.
 */
export default function PortadaSet({ temas, tamano = 120, etiqueta }) {
  const id = useId()
  const paso = Math.max(1, temas.length / MAXIMO)
  const tramos = []
  for (let i = 0; i < temas.length && tramos.length < MAXIMO; i += paso) tramos.push(temas[Math.floor(i)])
  const ancho = 100 / Math.max(1, tramos.length)
  return (
    <svg className="portada-set" viewBox="0 0 100 100" width={tamano} height={tamano} role="img" aria-label={etiqueta ?? 'Portada del set'}>
      <defs>
        {tramos.map((t, i) => (
          <linearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.35" stopColor={colorBpm(t.bpm)} />
            <stop offset="1" stopColor={t.clave ? colorClave(t.clave) : colorBpm(t.bpm)} />
          </linearGradient>
        ))}
      </defs>
      <rect width="100" height="100" fill="#1c1c1c" />
      {tramos.map((t, i) => (
        <rect key={i} x={i * ancho} width={ancho + 0.4} height="100" fill={`url(#${id}-${i})`} />
      ))}
    </svg>
  )
}
