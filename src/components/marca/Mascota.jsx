import { useId } from 'react'
import { useMascota } from '../../hooks/useMascota'
import { animoDe, conRebote, forma, paleta } from '../../lib/mascota'
import './Mascota.css'

/**
 * La mascota de RGBPM: Disco a poco BPM, Asterisco a tope.
 * - Late al tempo (compresión en cada golpe) y gira una muesca por compás.
 * - Cambia de cara según el ánimo y el fondo toma el color del BPM.
 * - Su «eco» (sombra desplazada de serigrafía) la sigue medio paso por detrás.
 *
 * variante: 'icono' (cuadrado redondeado), 'etiqueta' (círculo, centro del vinilo) o 'libre'.
 */
export default function Mascota({ bpm = 124, tocando = true, variante = 'icono', tamano = 160, animo, etiqueta }) {
  const { t, k } = useMascota(bpm, tocando)
  const colores = paleta(bpm, variante)
  const estado = animo ?? animoDe(bpm).id
  const recorte = useId()

  // Pulso de cada golpe (1 → 0) y giro por compás con un pequeño rebote al final
  const golpes = (t * (bpm ?? 120)) / 60
  const fase = golpes - Math.floor(golpes)
  const pulso = tocando ? Math.exp(-fase * 5) : 0
  const compas = Math.floor(golpes / 4)
  const resto = golpes / 4 - compas
  const giro = (compas + conRebote(Math.max(0, (resto - 0.75) / 0.25))) * 45 * k
  const sx = 1 + 0.07 * pulso
  const sy = 1 - 0.06 * pulso
  const parpadea = t % 3.7 < 0.13

  const cuerpo = forma(k)
  const escala = { libre: 1, icono: 0.78, etiqueta: 0.9 }[variante]
  // El eco va medio golpe por detrás: se desplaza más cuando la mascota se comprime
  const desfase = 16 + 6 * pulso

  return (
    <svg
      className={`mascota mascota--${variante}`}
      viewBox="-170 -170 340 340"
      width={tamano}
      height={tamano}
      role="img"
      aria-label={etiqueta ?? `Mascota de RGBPM, ánimo ${estado}`}
    >
      {variante === 'icono' && <rect x="-170" y="-170" width="340" height="340" rx="76" style={{ fill: colores.fondo }} className="mascota__fondo" />}
      {variante === 'etiqueta' && <circle r="170" style={{ fill: colores.fondo }} className="mascota__fondo" />}
      <defs>
        <clipPath id={recorte}>{variante === 'etiqueta' ? <circle r="170" /> : <rect x="-170" y="-170" width="340" height="340" rx="76" />}</clipPath>
      </defs>
      <g clipPath={variante === 'libre' ? undefined : `url(#${recorte})`} transform={`scale(${escala})`}>
        <path d={cuerpo} transform={`translate(${desfase} ${desfase}) rotate(${giro.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`} style={{ fill: colores.eco }} className="mascota__eco" />
        <g transform={`rotate(${(giro * 0.15).toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`}>
          <path d={cuerpo} transform={`rotate(${(giro * 0.85).toFixed(2)})`} style={{ fill: colores.cuerpo }} />
          <Cara animo={estado} color={colores.cara} parpadea={parpadea} pulso={pulso} />
        </g>
      </g>
    </svg>
  )
}

/** Una cara por ánimo. El key hace que React la monte de nuevo y dispare la animación de entrada. */
function Cara({ animo, color, parpadea, pulso }) {
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
