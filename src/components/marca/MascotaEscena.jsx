import { useId } from 'react'
import { useMascota } from '../../hooks/useMascota'
import { colorBpm, mezclar } from '../../lib/color'
import { animoDe, conRebote, forma } from '../../lib/mascota'
import Cara from './Cara'
import './Mascota.css'

const BARRAS = 48

/**
 * La mascota en escena (la del lienzo): cuerpo del color del BPM, cara negra,
 * halo y anillo de ecualizador que respiran con cada golpe.
 *
 * Dos formas de marcar el ritmo:
 * - reloj: late sola al `bpm` (modo reproductor).
 * - golpes: late cuando le llega `ultimoGolpe` (ms de performance.now), p. ej. un tap.
 * `nivel` (0–1) empuja el ecualizador con el volumen real del micro. `drop` (ms) dispara el estallido.
 * En pausa se duerme; siempre parpadea, mira alrededor y se mece.
 */
export default function MascotaEscena({ bpm, tocando = true, ultimoGolpe = null, nivel = 0, drop = null, tamano = 360, etiqueta, mira = null }) {
  const { t, k, ahora, vida } = useMascota(bpm ?? 110, tocando, { mira })
  const halo = useId()
  const color = bpm ? colorBpm(bpm) : '#8c8c8c'

  const golpes = (t * (bpm ?? 110)) / 60
  const fase = golpes - Math.floor(golpes)
  const desdeGolpe = ultimoGolpe != null ? Math.max(0, (ahora - ultimoGolpe) / 1000) : null
  // Si los toques paran, sigue latiendo sola al último BPM
  const conGolpe = desdeGolpe != null && desdeGolpe < 1.5
  const pulso = !tocando ? 0 : conGolpe ? Math.exp(-desdeGolpe * 7) : bpm ? Math.exp(-fase * 5) : 0

  const desdeDrop = drop != null ? (ahora - drop) / 1000 : -1
  const estallido = desdeDrop >= 0 && desdeDrop < 1.2 ? Math.sin((Math.PI * desdeDrop) / 1.2) : 0
  const kFinal = Math.min(1, k + estallido * (1 - k) * 1.1)

  const compas = Math.floor(golpes / 4)
  const resto = golpes / 4 - compas
  const giro = (compas + conRebote(Math.max(0, (resto - 0.75) / 0.25))) * 45 * kFinal + estallido * 180
  const sx = (1 + 0.07 * pulso + estallido * 0.12) * vida.respira
  const sy = (1 - 0.06 * pulso + estallido * 0.12) * vida.respira
  const [dx, dy] = vida.deriva
  const relleno = mezclar(color, '#ffffff', estallido * 0.35)

  const eq = []
  for (let i = 0; i < BARRAS; i++) {
    const ruido = 0.5 + 0.5 * Math.sin(i * 1.7 + golpes * Math.PI * 0.5) * Math.cos(i * 0.6 - golpes * Math.PI * 0.25)
    const h = 10 + ruido * 48 * (0.35 + pulso * 0.9 + nivel * 0.8) + estallido * 40
    eq.push(<rect key={i} x="-4" y={(-236 - h).toFixed(1)} width="8" height={h.toFixed(1)} rx="4" fill={color} opacity={(0.35 + 0.5 * ruido).toFixed(2)} transform={`rotate(${i * 7.5})`} />)
  }

  return (
    <svg className="mascota mascota--escena" viewBox="-330 -330 660 660" width={tamano} height={tamano} role="img" aria-label={etiqueta ?? (bpm ? `Mascota bailando a ${bpm} BPM` : 'Mascota esperando el ritmo')}>
      <defs>
        <radialGradient id={halo}>
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={250 + 60 * pulso + 80 * estallido} fill={`url(#${halo})`} />
      <g>{eq}</g>
      <g transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`}>
        <path d={forma(kFinal)} fill={relleno} transform={`rotate(${giro.toFixed(2)})`} />
        <Cara animo={!tocando ? 'dormida' : bpm ? animoDe(bpm).id : 'calma'} color="#000000" parpado={vida.parpado} ojo={vida.ojo} pulso={pulso} />
      </g>
    </svg>
  )
}
