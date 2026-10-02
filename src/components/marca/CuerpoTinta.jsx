import { useCallback, useRef } from 'react'
import { useMascota } from '../../hooks/useMascota'
import { energia, forma, movimientoCuerpo } from '../../lib/mascota'

const RADIO_DISCO = 112 // radio de la mascota en disco (lib/mascota)

/**
 * El cuerpo de la mascota hecho de tinta: va dentro del cartel, con el resto de gotas.
 * Disco a poco BPM, asterisco a tope: la lava del centro toma su forma y se funde con los círculos de al lado.
 * Se mueve con los mismos números que la mascota (movimientoCuerpo), así su cara cae siempre encima.
 */
export default function CuerpoTinta({ cx, cy, r, bpm, tocando = true, className }) {
  const camino = useRef(null)
  const giro = useRef(0)
  const kPintada = useRef(null)
  const u = r / RADIO_DISCO

  const pintar = useCallback(
    ({ t, k, vida }) => {
      const el = camino.current
      if (!el) return
      const m = movimientoCuerpo({ t, k, vida, bpm, tocando, giroAnterior: giro.current })
      giro.current = m.giro
      if (kPintada.current === null || Math.abs(kPintada.current - k) > 0.002) {
        el.setAttribute('d', forma(k))
        kPintada.current = k
      }
      // Igual que la mascota: grupo (vaivén, 15 % del giro, latido) y cuerpo (el resto del giro)
      el.setAttribute('transform', `translate(${(cx + m.dx * u).toFixed(2)} ${(cy + m.dy * u).toFixed(2)}) scale(${u.toFixed(4)}) rotate(${(m.giro * 0.15).toFixed(2)}) scale(${m.sx.toFixed(3)} ${m.sy.toFixed(3)}) rotate(${(m.giro * 0.85).toFixed(2)})`)
    },
    [bpm, tocando, cx, cy, u]
  )
  useMascota(bpm, tocando, { alPintar: pintar })

  return <path ref={camino} d={forma(energia(bpm))} transform={`translate(${cx} ${cy}) scale(${u})`} className={className} />
}
