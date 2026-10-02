import { clave } from '../../lib/claves'

const C = 160
const TONOS = Array.from({ length: 12 }, (_, i) => [clave(i + 1, false), clave(i + 1, true)]).flat()
const posicion = (k) => {
  const a = (((k.open - 1) * 30 - 90) * Math.PI) / 180
  const r = k.menor ? 92 : 136
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}

/**
 * Rueda para elegir un tono: mayores fuera, menores dentro. Al resolver, el real va en rosa
 * y el tuyo en blanco. Con `soloModo` ('m' o 'd') se apaga el anillo que no es (la pista).
 */
export default function RuedaElegir({ elegida, real, soloModo = null, etiqueta, alElegir, quieta = false }) {
  return (
    <svg className="rueda-elegir" viewBox="-6 -6 332 332" role="group" aria-label="Elige el tono">
      <circle cx={C} cy={C} r="158" className="rueda-elegir__fondo" />
      {TONOS.map((k) => {
        const [x, y] = posicion(k)
        const apagada = soloModo && (soloModo === 'm') !== k.menor
        const estado = real?.id === k.id ? ' rueda-elegir__tono--real' : elegida?.id === k.id ? ' rueda-elegir__tono--tuya' : ''
        const elegir = () => !quieta && !apagada && alElegir(k)
        return (
          <g
            key={k.id}
            className={`rueda-elegir__tono${estado}${apagada ? ' rueda-elegir__tono--apagada' : ''}`}
            style={{ transformOrigin: `${x}px ${y}px` }}
            role="button"
            tabIndex={quieta || apagada ? -1 : 0}
            aria-label={`${etiqueta(k)}, ${k.nombre}`}
            aria-pressed={elegida?.id === k.id}
            onClick={elegir}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), elegir())}
          >
            <circle cx={x} cy={y} r={k.menor ? 19 : 22} />
            <text x={x} y={y + 4.5}>
              {etiqueta(k)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
