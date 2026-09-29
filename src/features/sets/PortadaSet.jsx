import { colorBpm } from '../../lib/color'
import { coloresSet } from '../../lib/set'

/**
 * Portada Pantone del set, generada: una franja por tramo del set, en su color de BPM.
 * Se lee de izquierda a derecha como la energía de la sesión.
 */
export default function PortadaSet({ temas, tamano = 120, etiqueta }) {
  const colores = coloresSet(temas, colorBpm)
  const ancho = 100 / Math.max(1, colores.length)
  return (
    <svg className="portada-set" viewBox="0 0 100 100" width={tamano} height={tamano} role="img" aria-label={etiqueta ?? 'Portada del set'}>
      <rect width="100" height="100" fill="#1c1c1c" />
      {colores.map((c, i) => (
        <rect key={i} x={i * ancho} width={ancho + 0.4} height="100" fill={c} />
      ))}
    </svg>
  )
}
