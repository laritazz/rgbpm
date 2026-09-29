/** Una cara por ánimo. El key hace que React la monte de nuevo y dispare la animación de entrada. */
export default function Cara({ animo, color, parpadea, pulso }) {
  const ojo = parpadea ? 1.2 : 7
  const trazo = { fill: 'none', stroke: color, strokeWidth: 7, strokeLinecap: 'round' }
  const arco = (x, abajo) => `M${x - 12},-14 Q${x},${abajo ? -4 : -26} ${x + 12},-14`
  const sonrisa = (w, h = w) => `M${-w},1 L${w},1 A${w},${h} 0 0 1 ${-w},1 Z`

  const caras = {
    calma: (
      <>
        <path d={arco(-34, true)} {...trazo} />
        <path d={arco(34, true)} {...trazo} />
        <path d={sonrisa(9, 7 + 3 * pulso)} fill={color} />
      </>
    ),
    feliz: (
      <>
        <ellipse cx="-34" cy="-14" rx="7" ry={ojo} fill={color} />
        <ellipse cx="34" cy="-14" rx="7" ry={ojo} fill={color} />
        <path d={sonrisa(12 + 4 * pulso)} fill={color} />
      </>
    ),
    guino: (
      <>
        <ellipse cx="-34" cy="-14" rx="7" ry={ojo} fill={color} />
        <path d={arco(34)} {...trazo} />
        <path d={sonrisa(19 + 4 * pulso)} fill={color} />
      </>
    ),
    sorpresa: (
      <>
        <ellipse cx="-34" cy="-16" rx="9" ry={parpadea ? 1.2 : 10} fill={color} />
        <ellipse cx="34" cy="-16" rx="9" ry={parpadea ? 1.2 : 10} fill={color} />
        <ellipse cx="0" cy="14" rx={9 + 2 * pulso} ry={11 + 5 * pulso} fill={color} />
      </>
    ),
    euforia: (
      <>
        <path d={arco(-34)} {...trazo} />
        <path d={arco(34)} {...trazo} />
        <path d={sonrisa(22 + 5 * pulso, 20 + 10 * pulso)} fill={color} />
      </>
    ),
  }

  return (
    <g key={animo} className="mascota__cara">
      {caras[animo] ?? caras.feliz}
    </g>
  )
}
