import { colorBpm } from '../../lib/color'
import Mascota from './Mascota'
import './Vinilo.css'

/**
 * Vinilo que gira al tempo (una vuelta cada dos compases) con la mascota como galleta central.
 * El brillo del surco toma el color del BPM.
 */
export default function Vinilo({ bpm = 124, tocando = false, tamano = 280 }) {
  const vuelta = (8 * 60) / (bpm || 120)
  return (
    <div
      className={`vinilo${tocando ? ' vinilo--tocando' : ''}`}
      style={{ '--tamano': `${tamano}px`, '--vuelta': `${vuelta}s`, '--brillo': colorBpm(bpm) }}
    >
      <div className="vinilo__disco" aria-hidden="true" />
      <div className="vinilo__galleta">
        <Mascota bpm={bpm} tocando={tocando} variante="etiqueta" tamano={tamano * 0.44} />
      </div>
    </div>
  )
}
