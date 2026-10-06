import { useEffect, useRef, useState } from 'react'
import { FRANJAS, colorBpm, franjaDe, tintaSobre } from '../../lib/color'
import { BARRIDO, anguloDeFranja, anguloDePunto, franjaDeAngulo, franjaPorId } from '../../lib/vibra'
import './DialVibra.css'

const R = 92 // radio del arco de colores
const PASO = BARRIDO / FRANJAS.length

/** Trozo de arco del dial, de a0 a a1 grados (0° arriba, sentido del reloj). */
function arco(a0, a1, r = R) {
  const p = (a) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r]
  const [[x0, y0], [x1, y1]] = [p(a0), p(a1)]
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`
}

/**
 * Potenciómetro de vibra: giras y fuerzas la franja de color con la que suena el tema.
 * El cálculo (BPM) se ve siempre como referencia; «Volver al cálculo» quita tu vibra.
 * Se arrastra con el dedo o el ratón y se mueve con las flechas. Se guarda al soltar.
 */
export default function DialVibra({ tema, vibra, alCambiar, alCerrar }) {
  const ventana = useRef(null)
  const dial = useRef(null)
  const calculada = franjaDe(tema.bpm ?? 0)
  const elegida = franjaPorId(vibra) ?? calculada
  const [angulo, setAngulo] = useState(() => anguloDeFranja(elegida.id))
  const [arrastrando, setArrastrando] = useState(false)
  const bajo = franjaDeAngulo(angulo)

  useEffect(() => {
    const d = ventana.current
    if (!d.open) d.showModal()
  }, [])

  const anguloDe = (e) => {
    const caja = dial.current.getBoundingClientRect()
    return anguloDePunto(e.clientX - caja.left - caja.width / 2, e.clientY - caja.top - caja.height / 2)
  }

  const mover = (e) => {
    if (!arrastrando) return
    const a = Math.max(-BARRIDO / 2, Math.min(BARRIDO / 2, anguloDe(e)))
    if (franjaDeAngulo(a).id !== bajo.id) navigator.vibrate?.(6)
    setAngulo(a)
  }

  const fijar = (id) => {
    setAngulo(anguloDeFranja(id))
    alCambiar(id === calculada.id ? null : id) // elegir lo mismo que el cálculo no es forzar nada
  }

  const soltar = () => {
    if (!arrastrando) return
    setArrastrando(false)
    fijar(bajo.id)
  }

  const conTeclado = (e) => {
    const i = FRANJAS.findIndex((f) => f.id === bajo.id)
    const paso = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]
    if (!paso) return
    e.preventDefault()
    fijar(FRANJAS[Math.max(0, Math.min(FRANJAS.length - 1, i + paso))].id)
  }

  const forzada = bajo.id !== calculada.id

  return (
    <dialog ref={ventana} className="dial-vibra" onClose={alCerrar} onClick={(e) => e.target === ventana.current && ventana.current.close()} aria-labelledby="dial-vibra-titulo" style={{ '--vibra': bajo.color, '--tinta': tintaSobre(bajo.color) }}>
      {/* El relleno va en la caja: un clic en el propio <dialog> es un clic fuera (cierra) */}
      <div className="dial-vibra__caja">
      <span className="etiqueta-seccion">Tu vibra</span>
      <h2 id="dial-vibra-titulo">{tema.titulo}</h2>
      <p className="dial-vibra__ia">
        Cálculo: <span style={{ '--color': colorBpm(tema.bpm) }}>{calculada.nombre}</span> · {tema.bpm ? `${tema.bpm} BPM` : 'sin BPM'}
      </p>

      <svg
        ref={dial}
        className={`dial-vibra__dial${arrastrando ? ' dial-vibra__dial--arrastre' : ''}`}
        viewBox="-120 -120 240 240"
        role="slider"
        tabIndex={0}
        aria-label="Franja de vibra"
        aria-valuemin={0}
        aria-valuemax={FRANJAS.length - 1}
        aria-valuenow={FRANJAS.findIndex((f) => f.id === bajo.id)}
        aria-valuetext={`${bajo.nombre}${forzada ? ', forzada por ti' : ', la del cálculo'}`}
        onKeyDown={conTeclado}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setArrastrando(true)
          setAngulo(Math.max(-BARRIDO / 2, Math.min(BARRIDO / 2, anguloDe(e))))
        }}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
      >
        {FRANJAS.map((f, i) => (
          <path key={f.id} d={arco(-BARRIDO / 2 + PASO * i + 2, -BARRIDO / 2 + PASO * (i + 1) - 2)} className={`dial-vibra__arco${f.id === bajo.id ? ' dial-vibra__arco--activa' : ''}`} style={{ stroke: f.color }} />
        ))}
        {/* Muesca del cálculo: dónde lo dejaría la IA */}
        <circle className="dial-vibra__ia-marca" cx={Math.sin((anguloDeFranja(calculada.id) * Math.PI) / 180) * (R + 17)} cy={-Math.cos((anguloDeFranja(calculada.id) * Math.PI) / 180) * (R + 17)} r="3.5" />
        <g className="dial-vibra__mando" style={{ rotate: `${angulo}deg` }}>
          <circle r="66" />
          <rect x="-3.5" y="-62" width="7" height="24" rx="3.5" />
        </g>
        <text className="dial-vibra__nombre" y="6" textAnchor="middle">
          {bajo.nombre}
        </text>
      </svg>

      <p className="dial-vibra__texto">{forzada ? `Sonará en ${bajo.nombre.toLowerCase()}: ${bajo.texto.toLowerCase()}.` : 'Suena con el color de su BPM.'}</p>

      <div className="dial-vibra__acciones">
        <button className="boton" onClick={() => fijar(calculada.id)} disabled={!forzada}>
          Volver al cálculo
        </button>
        <button className="boton boton--rosa" onClick={() => ventana.current.close()}>
          Hecho
        </button>
      </div>
      </div>
    </dialog>
  )
}
