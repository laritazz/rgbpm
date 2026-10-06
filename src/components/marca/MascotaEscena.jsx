import { useId } from 'react'
import { useMascota } from '../../hooks/useMascota'
import { GRIS_ESCUCHA, colorBpm, colorProvisional, mezclar } from '../../lib/color'
import { animoDe, conRebote, forma, suave } from '../../lib/mascota'
import Cara from './Cara'
import './Mascota.css'

const BARRAS = 48
const GOTAS = 5
const BLUR_GOTAS = 16 // desenfoque de las gotas mientras la escucha duda (unidades del dibujo)
const CAE = 0.7 // s que tardan las gotas en caer dentro de la mascota al fijar

/**
 * Gotas de tinta que brotan de la mascota mientras la escucha intuye un tempo.
 * Cada una nace en el centro, se aleja y se apaga; al fijar, todas vuelven y caen dentro (`caida` 0 → 1).
 */
function gotasEn(t, caida) {
  const vuelta = 1 - suave(caida)
  return Array.from({ length: GOTAS }, (_, i) => {
    const ciclo = (t * 0.32 + i / GOTAS) % 1
    const angulo = -Math.PI / 2 + (i * 2 * Math.PI) / GOTAS + Math.sin(t * 0.4 + i) * 0.35
    const distancia = (70 + ciclo * 190) * vuelta
    return { x: Math.cos(angulo) * distancia, y: Math.sin(angulo) * distancia, r: (40 - ciclo * 18) * (0.4 + 0.6 * vuelta), ciclo }
  })
}

/**
 * La mascota en escena (la del lienzo): cuerpo del color del BPM, cara negra,
 * halo y anillo de ecualizador que respiran con cada golpe.
 *
 * Dos formas de marcar el ritmo:
 * - reloj: late sola al `bpm` (modo reproductor).
 * - golpes: late cuando le llega `ultimoGolpe` (ms de performance.now), p. ej. un tap.
 * `nivel` (0–1) empuja el ecualizador con el volumen real del micro. `drop` (ms) dispara el estallido.
 * En pausa se duerme; siempre parpadea, mira alrededor y se mece.
 *
 * Escucha (`fase` + `certeza`, de lib/escucha): enseña cuánto se fía de lo que oye.
 * - pulso: gris, ojos en línea, respira.
 * - intuye: abre un poco los ojos y brotan gotas del color que intuye; ella las mira.
 * - fijada: las gotas pierden el desenfoque y caen dentro; el color llena y se pone en euforia.
 * `tinte`: color forzado por el DJ (su vibra). La forma y el tempo siguen siendo los del BPM.
 */
export default function MascotaEscena({ bpm, tocando = true, ultimoGolpe = null, nivel = 0, drop = null, tamano = 360, etiqueta, mira = null, animo = null, fase = null, certeza = 0, tinte = null }) {
  const dormida = fase === 'pulso' || !tocando
  const { t, k, ahora, vida } = useMascota(bpm ?? 110, !dormida, { mira })

  const desdeDrop = drop != null ? (ahora - drop) / 1000 : -1
  const cayendo = fase === 'fijada' && desdeDrop >= 0 && desdeDrop < CAE
  const conGotas = fase === 'intuye' || cayendo
  const gotasAhora = conGotas ? gotasEn(ahora / 1000, cayendo ? desdeDrop / CAE : 0) : null
  // Mira la gota más reciente (la que acaba de brotar)
  const guia = gotasAhora?.reduce((a, g) => (g.ciclo < a.ciclo ? g : a))
  const miraGota = guia && fase === 'intuye' ? [Math.max(-1, Math.min(1, guia.x / 160)), Math.max(-1, Math.min(1, guia.y / 160))] : null
  const halo = useId()
  const pegajoso = useId()
  const colorFinal = tinte ?? (bpm ? colorBpm(bpm) : GRIS_ESCUCHA)
  // Mientras duda, el gris se tiñe poco a poco del color que se va perfilando
  const color = fase === 'pulso' || fase === 'intuye' ? colorProvisional(bpm, certeza) : colorFinal

  const golpes = (t * (bpm ?? 110)) / 60
  const fase0 = golpes - Math.floor(golpes)
  const desdeGolpe = ultimoGolpe != null ? Math.max(0, (ahora - ultimoGolpe) / 1000) : null
  // Si los toques paran, sigue latiendo sola al último BPM
  const conGolpe = desdeGolpe != null && desdeGolpe < 1.5
  const pulso = dormida ? 0 : conGolpe ? Math.exp(-desdeGolpe * 7) : bpm ? Math.exp(-fase0 * 5) : 0

  const estallido = desdeDrop >= 0 && desdeDrop < 1.2 ? Math.sin((Math.PI * desdeDrop) / 1.2) : 0
  const kFinal = Math.min(1, k + estallido * (1 - k) * 1.1)
  // Al fijar la escucha: euforia mientras dura la fiesta; luego, el ánimo que toca por BPM
  const euforia = fase === 'fijada' && desdeDrop >= 0 && desdeDrop < 1.6

  const compas = Math.floor(golpes / 4)
  const resto = golpes / 4 - compas
  const giro = (compas + conRebote(Math.max(0, (resto - 0.75) / 0.25))) * 45 * kFinal + estallido * 180
  const sx = (1 + 0.07 * pulso + estallido * 0.12) * vida.respira
  const sy = (1 - 0.06 * pulso + estallido * 0.12) * vida.respira
  const [dx, dy] = vida.deriva
  const ladeo = miraGota ? miraGota[0] * 9 : 0 // gira la cabeza hacia las gotas
  const relleno = mezclar(color, '#ffffff', estallido * 0.35)
  // Intuye: ojos entreabiertos (sin dejar de parpadear)
  // Pulso: los ojos ya son una línea, no se cierran más (si no, el trazo se aplasta)
  const parpado = fase === 'pulso' ? 0 : fase === 'intuye' ? Math.max(vida.parpado, 0.5) : vida.parpado
  const cara = animo ?? (euforia ? 'euforia' : fase === 'pulso' ? 'escucha' : fase === 'intuye' ? 'feliz' : dormida ? 'dormida' : bpm ? animoDe(bpm).id : 'calma')

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
        {conGotas && (
          // Metaballs: desenfoque + umbral de alfa. Al fijar, el desenfoque baja a cero y las gotas se vuelven nítidas
          <filter id={pegajoso} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={(cayendo ? BLUR_GOTAS * (1 - suave(desdeDrop / CAE)) : BLUR_GOTAS).toFixed(2)} />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
          </filter>
        )}
      </defs>
      <circle r={250 + 60 * pulso + 80 * estallido} fill={`url(#${halo})`} />
      <g>{eq}</g>
      {gotasAhora && (
        <g filter={`url(#${pegajoso})`} opacity="0.5" fill={colorFinal} aria-hidden="true">
          <circle r="96" />
          {gotasAhora.map((g, i) => (
            <circle key={i} cx={g.x.toFixed(1)} cy={g.y.toFixed(1)} r={g.r.toFixed(1)} />
          ))}
        </g>
      )}
      <g transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${ladeo.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`}>
        <path d={forma(kFinal)} fill={relleno} transform={`rotate(${giro.toFixed(2)})`} />
        <Cara animo={cara} color="#000000" parpado={parpado} ojo={miraGota ?? vida.ojo} pulso={pulso} />
      </g>
    </svg>
  )
}
