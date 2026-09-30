import { useCallback, useId, useRef } from 'react'
import { useMascota } from '../../hooks/useMascota'
import { animoDe, conRebote, energia, forma, movimientoCara, paleta } from '../../lib/mascota'
import Cara from './Cara'
import './Mascota.css'

/**
 * La mascota de RGBPM: Disco a poco BPM, Asterisco a tope.
 * - Sonando: late al tempo, gira una muesca por compás y cambia de cara según el ánimo.
 * - En pausa: se duerme (ojos cerrados, respira). Al volver a sonar, se despierta.
 * - Siempre: parpadea, mira alrededor (o hacia `mira`) y se mece un poco.
 *
 * No provoca renders por fotograma: el motor escribe directamente en el SVG a través de refs.
 * variante: 'icono' (cuadrado redondeado), 'etiqueta' (círculo, centro del vinilo), 'libre' o 'negra'.
 */
export default function Mascota({ bpm = 124, tocando = true, variante = 'icono', tamano = 160, animo, etiqueta, mira = null }) {
  const colores = paleta(bpm, variante)
  const estado = tocando ? (animo ?? animoDe(bpm).id) : 'dormida'
  const recorte = useId()
  const eco = useRef(null)
  const grupo = useRef(null)
  const cuerpo = useRef(null)
  const cara = useRef(null)
  const ojos = useRef(null)
  const boca = useRef(null)
  const giro = useRef(0)
  const kPintada = useRef(null)

  const pintar = useCallback(
    ({ t, k, vida: v }) => {
      const golpes = (t * (bpm ?? 120)) / 60
      const fase = golpes - Math.floor(golpes)
      const pulso = tocando ? Math.exp(-fase * 5) : 0
      if (tocando) {
        // Gira una muesca por compás, con un pequeño rebote al final
        const compas = Math.floor(golpes / 4)
        giro.current = (compas + conRebote(Math.max(0, (golpes / 4 - compas - 0.75) / 0.25))) * 45 * k
      }
      const g = giro.current
      const sx = ((1 + 0.07 * pulso) * v.respira).toFixed(3)
      const sy = ((1 - 0.06 * pulso) * v.respira).toFixed(3)
      const [dx, dy] = v.deriva
      const desfase = 16 + 6 * pulso // el eco va medio golpe por detrás

      if (!grupo.current) return
      if (kPintada.current === null || Math.abs(kPintada.current - k) > 0.002) {
        const d = forma(k)
        eco.current.setAttribute('d', d)
        cuerpo.current.setAttribute('d', d)
        kPintada.current = k
      }
      eco.current.setAttribute('transform', `translate(${(desfase + dx).toFixed(1)} ${(desfase + dy).toFixed(1)}) rotate(${g.toFixed(2)}) scale(${sx} ${sy})`)
      grupo.current.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${(g * 0.15).toFixed(2)}) scale(${sx} ${sy})`)
      cuerpo.current.setAttribute('transform', `rotate(${(g * 0.85).toFixed(2)})`)
      const m = movimientoCara({ parpado: v.parpado, ojo: v.ojo, pulso })
      cara.current?.setAttribute('transform', m.cara)
      ojos.current?.setAttribute('transform', m.ojos)
      boca.current?.setAttribute('transform', m.boca)
    },
    // las refs son estables: solo cambian el tempo y si suena
    [bpm, tocando]
  )

  useMascota(bpm, tocando, { alPintar: pintar, mira })

  const inicial = forma(energia(bpm))
  const escala = { libre: 1, negra: 1, icono: 0.78, etiqueta: 0.9 }[variante] ?? 1
  const conFondo = variante === 'icono' || variante === 'etiqueta'

  return (
    <svg
      className={`mascota mascota--${variante}`}
      viewBox="-170 -170 340 340"
      width={tamano}
      height={tamano}
      role="img"
      aria-label={etiqueta ?? `Mascota de RGBPM, ${tocando ? `ánimo ${estado}` : 'dormida'}`}
    >
      {variante === 'icono' && <rect x="-170" y="-170" width="340" height="340" rx="76" style={{ fill: colores.fondo }} className="mascota__fondo" />}
      {variante === 'etiqueta' && <circle r="170" style={{ fill: colores.fondo }} className="mascota__fondo" />}
      <defs>
        <clipPath id={recorte}>{variante === 'etiqueta' ? <circle r="170" /> : <rect x="-170" y="-170" width="340" height="340" rx="76" />}</clipPath>
      </defs>
      <g clipPath={conFondo ? `url(#${recorte})` : undefined} transform={`scale(${escala})`}>
        <path ref={eco} d={inicial} transform="translate(16 16)" style={{ fill: colores.eco ?? 'none' }} className="mascota__eco" />
        <g ref={grupo}>
          <path ref={cuerpo} d={inicial} style={{ fill: colores.cuerpo }} />
          <Cara animo={estado} color={colores.cara} refCara={cara} refOjos={ojos} refBoca={boca} />
        </g>
      </g>
    </svg>
  )
}
