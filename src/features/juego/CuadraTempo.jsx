import { useCallback, useEffect, useRef, useState } from 'react'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { colorBpm } from '../../lib/color'
import { puntuarCuadra, rondasCuadra } from '../../lib/juegos'
import { useReproductor } from '../musica/ReproductorContext'
import { BarraRonda, FinalJuego, InicioJuego } from './Pantallas'
import { usePartida } from './usePartida'
import { iniciarRitmo } from './ritmo'
import './Juego.css'

const RONDAS = 5
const RANGO = 12 // ± % del pitch, como un plato

/**
 * Cuadra el tempo: a la izquierda, el bombo de referencia; a la derecha, tus palmas, desviadas.
 * Mueve el pitch hasta que las dos mascotas latan a la vez. No se ven los BPM: se escucha.
 */
export default function CuadraTempo() {
  const rep = useReproductor()
  const crear = useCallback(() => rondasCuadra({ n: RONDAS }), [])
  const juego = usePartida('cuadra', crear)
  const { partida, ronda, resultado } = juego
  const [pitch, setPitch] = useState(0)
  const [golpes, setGolpes] = useState({ ref: null, tuyo: null })
  const ritmos = useRef(null)

  const tuyoBpm = ronda ? Math.round(ronda.inicio * (1 + pitch / 100) * 100) / 100 : null

  // Los dos ritmos suenan mientras dura la ronda; las mascotas laten con cada golpe que de verdad suena
  const enRonda = partida?.fase === 'ronda'
  useEffect(() => {
    if (!enRonda || !ronda) return
    const ref = iniciarRitmo(ronda.referencia, { sonido: 'bombo', lado: -0.7, volumen: 0.9 })
    const tuyo = iniciarRitmo(ronda.inicio, { sonido: 'palmas', lado: 0.7, volumen: 0.7 })
    ritmos.current = { ref, tuyo }
    let raf
    const mirar = () => {
      const nuevo = { ref: ref.ultimoGolpe(), tuyo: tuyo.ultimoGolpe() }
      setGolpes((g) => (g.ref === nuevo.ref && g.tuyo === nuevo.tuyo ? g : nuevo))
      raf = requestAnimationFrame(mirar)
    }
    raf = requestAnimationFrame(mirar)
    return () => {
      cancelAnimationFrame(raf)
      ref.parar()
      tuyo.parar()
      ritmos.current = null
    }
  }, [enRonda, ronda])

  function mover(valor) {
    const p = Math.max(-RANGO, Math.min(RANGO, Math.round(valor * 100) / 100))
    setPitch(p)
    ritmos.current?.tuyo.cambiarBpm(ronda.inicio * (1 + p / 100))
  }

  function empezar() {
    if (rep.sonando) rep.alternar()
    setPitch(0)
    juego.empezar()
  }

  function cuadrar() {
    juego.responder({ ronda, tuyo: tuyoBpm, ...puntuarCuadra(ronda.referencia, tuyoBpm) })
  }

  function siguiente() {
    setPitch(0)
    juego.siguiente()
  }

  if (!partida) {
    return <InicioJuego titulo="Cuadra el tempo" texto="Mueve el pitch hasta que las palmas caigan con el bombo. Con los cascos, mejor." rondas={RONDAS} record={juego.record} animo="guino" bpm={128} alEmpezar={empezar} />
  }

  if (partida.fase === 'final') {
    const filas = partida.resultados.map((r, i) => ({ id: i, titulo: `${r.ronda.referencia.toLocaleString('es')} BPM`, detalle: `tú ${r.tuyo.toLocaleString('es')} · ${r.error.toLocaleString('es')} % de error`, puntos: r.puntos, bpm: r.ronda.referencia }))
    return <FinalJuego resumen={partida.resumen} filas={filas} alOtra={empezar} />
  }

  return (
    <main className="adivina" style={{ '--color': resultado ? colorBpm(ronda.referencia) : '#333333' }}>
      <BarraRonda partida={partida} puntos={juego.puntos} />
      <div className="cuadra">
        <figure>
          <MascotaEscena bpm={ronda.referencia} ultimoGolpe={golpes.ref} tocando tamano={150} animo={resultado ? resultado.veredicto.animo : null} />
          <figcaption>Bombo</figcaption>
        </figure>
        <figure>
          <MascotaEscena bpm={ronda.referencia} ultimoGolpe={golpes.tuyo} tocando tamano={150} animo={resultado ? resultado.veredicto.animo : null} />
          <figcaption>Tus palmas</figcaption>
        </figure>
      </div>

      {!resultado ? (
        <div className="adivina__panel cuadra__mando">
          <label className="cuadra__pitch">
            <span>
              Pitch <output>{pitch > 0 ? '+' : ''}{pitch.toFixed(2).replace('.', ',')} %</output>
            </span>
            <input type="range" min={-RANGO} max={RANGO} step="0.05" value={pitch} onChange={(e) => mover(Number(e.target.value))} />
          </label>
          <div className="adivina__acciones">
            <button className="boton boton--fantasma" onClick={() => mover(pitch - 0.1)} aria-label="Bajar el pitch una décima">
              −0,1
            </button>
            <button className="boton boton--rosa" onClick={cuadrar}>
              Cuadrado
            </button>
            <button className="boton boton--fantasma" onClick={() => mover(pitch + 0.1)} aria-label="Subir el pitch una décima">
              +0,1
            </button>
          </div>
        </div>
      ) : (
        <div className="adivina__panel adivina__panel--resultado">
          <span className="adivina__veredicto">{resultado.veredicto.nombre}</span>
          <span className="adivina__cifras">
            <b>{ronda.referencia.toLocaleString('es')}</b> bombo · <b>{tuyoBpm.toLocaleString('es')}</b> tú · {resultado.error.toLocaleString('es')} %
          </span>
          <span className="adivina__puntos">+{resultado.puntos}</span>
          <button className="boton boton--rosa" onClick={siguiente}>
            {partida.i + 1 < partida.rondas.length ? 'Siguiente' : 'Ver resultado'}
          </button>
        </div>
      )}
    </main>
  )
}
