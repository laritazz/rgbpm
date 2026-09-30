import { movimientoCara } from '../../lib/mascota'

// Ojos y boca de cada ánimo, dibujados en reposo. El movimiento (parpadeo, mirada, latido de la boca)
// son transformaciones: así la mascota pequeña las cambia en cada fotograma sin que React vuelva a pintar.

const trazo = (color) => ({ fill: 'none', stroke: color, strokeWidth: 7, strokeLinecap: 'round' })
const arco = (x, abajo, y = -14) => `M${x - 12},${y} Q${x},${y + (abajo ? 10 : -12)} ${x + 12},${y}`
const sonrisa = (w, h = w) => `M${-w},1 L${w},1 A${w},${h} 0 0 1 ${-w},1 Z`

const PARTES = {
  dormida: (c) => ({
    ojos: (
      <>
        <path d={arco(-34, true, -10)} {...trazo(c)} />
        <path d={arco(34, true, -10)} {...trazo(c)} />
      </>
    ),
    boca: <ellipse cx="0" cy="16" rx="6" ry="4" fill={c} />,
  }),
  calma: (c) => ({
    ojos: (
      <>
        <path d={arco(-34, true)} {...trazo(c)} />
        <path d={arco(34, true)} {...trazo(c)} />
      </>
    ),
    boca: <path d={sonrisa(9, 8)} fill={c} />,
  }),
  feliz: (c) => ({
    ojos: (
      <>
        <ellipse cx="-34" cy="-14" rx="7" ry="7" fill={c} />
        <ellipse cx="34" cy="-14" rx="7" ry="7" fill={c} />
      </>
    ),
    boca: <path d={sonrisa(14)} fill={c} />,
  }),
  guino: (c) => ({
    ojos: (
      <>
        <ellipse cx="-34" cy="-14" rx="7" ry="7" fill={c} />
        <path d={arco(34)} {...trazo(c)} />
      </>
    ),
    boca: <path d={sonrisa(21)} fill={c} />,
  }),
  sorpresa: (c) => ({
    ojos: (
      <>
        <ellipse cx="-34" cy="-16" rx="9" ry="10" fill={c} />
        <ellipse cx="34" cy="-16" rx="9" ry="10" fill={c} />
      </>
    ),
    boca: <ellipse cx="0" cy="16" rx="10" ry="13" fill={c} />,
  }),
  euforia: (c) => ({
    ojos: (
      <>
        <path d={arco(-34)} {...trazo(c)} />
        <path d={arco(34)} {...trazo(c)} />
      </>
    ),
    boca: <path d={sonrisa(24, 26)} fill={c} />,
  }),
}

/** Una cara por ánimo. El key la monta de nuevo al cambiar de ánimo y dispara su animación de entrada. */
export default function Cara({ animo, color, parpado, ojo, pulso, refCara, refOjos, refBoca }) {
  const { ojos, boca } = (PARTES[animo] ?? PARTES.feliz)(color)
  const m = movimientoCara({ parpado, ojo, pulso })
  return (
    <g ref={refCara} transform={m.cara}>
      <g key={animo} className="mascota__cara">
        <g ref={refOjos} transform={m.ojos}>
          {ojos}
        </g>
        <g ref={refBoca} transform={m.boca}>
          {boca}
        </g>
      </g>
    </g>
  )
}
