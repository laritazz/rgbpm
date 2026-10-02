import { useCallback, useEffect } from 'react'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { colorBpm } from '../../lib/color'
import { puntuarEleccion, rondasCorre } from '../../lib/juegos'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { useReproductor } from '../musica/ReproductorContext'
import { BarraRonda, FinalJuego, InicioJuego } from './Pantallas'
import { usePareja } from './usePareja'
import { usePartida } from './usePartida'
import { useSonido } from './useSonido'
import './Juego.css'

const signo = (n) => (n > 0 ? `+${n}` : `${n}`)

/** ¿Cuál corre más? Suenan dos temas: ¿cuál va más rápido? Cada ronda, la diferencia es más fina. */
export default function CualCorre() {
  const { temas } = useBiblioteca()
  const rep = useReproductor()
  const { sonar, parar } = useSonido()
  const crear = useCallback(() => rondasCorre(temas), [temas])
  const juego = usePartida('corre', crear)
  const { partida, ronda, resultado } = juego
  const pareja = usePareja(sonar, parar, 6000)
  const { tocar, callar } = pareja

  const enRonda = partida?.fase === 'ronda'
  useEffect(() => {
    if (enRonda && ronda) tocar(ronda.a, ronda.b)
  }, [enRonda, ronda, tocar])

  function empezar() {
    if (rep.sonando) rep.alternar()
    juego.empezar()
  }

  function elegir(lado) {
    callar()
    juego.responder({ ronda, elegida: lado, ...puntuarEleccion(ronda.correcta, lado) })
  }

  if (!partida) {
    return <InicioJuego titulo="¿Cuál corre más?" texto="Suenan dos temas. Di cuál va más rápido: cada ronda, más difícil." rondas={6} record={juego.record} animo="sorpresa" bpm={150} alEmpezar={empezar} />
  }

  if (partida.fase === 'final') {
    const filas = partida.resultados.map((r, i) => ({ id: i, titulo: `${r.ronda.diferencia.toLocaleString('es')} % de diferencia`, detalle: `${Math.round(r.ronda.a.bpm)} y ${Math.round(r.ronda.b.bpm)} BPM`, puntos: r.puntos, bpm: Math.max(r.ronda.a.bpm, r.ronda.b.bpm) }))
    return <FinalJuego resumen={partida.resumen} filas={filas} alOtra={empezar} />
  }

  return (
    <main className="adivina">
      <BarraRonda partida={partida} puntos={juego.puntos} />
      <span className="adivina__meta">{ronda.diferencia.toLocaleString('es')} % de diferencia</span>
      <div className="corre" role="group" aria-label="¿Cuál va más rápido?">
        {['a', 'b'].map((lado) => {
          const t = ronda[lado]
          const bueno = resultado && ronda.correcta === lado
          return (
            <button
              key={lado}
              className={`corre__opcion${pareja.sonando === lado ? ' corre__opcion--sonando' : ''}${bueno ? ' corre__opcion--buena' : ''}`}
              style={{ '--color': resultado ? colorBpm(t.bpm) : '#2a2a2a' }}
              onClick={() => elegir(lado)}
              disabled={Boolean(resultado)}
            >
              {/* Hasta responder no bailan: si no, se vería el tempo */}
              <MascotaEscena bpm={resultado ? t.bpm : 120} tocando={Boolean(resultado)} tamano={130} animo={resultado ? (bueno ? 'euforia' : 'calma') : pareja.sonando === lado ? 'sorpresa' : 'feliz'} />
              <strong>{lado === 'a' ? 'El primero' : 'El segundo'}</strong>
              {resultado && <small>{(Math.round(t.bpm * 10) / 10).toLocaleString('es')} BPM</small>}
            </button>
          )
        })}
      </div>

      {!resultado ? (
        <button className="boton boton--fantasma" onClick={() => tocar(ronda.a, ronda.b)}>
          {pareja.sonando ? `Suena ${pareja.sonando === 'a' ? 'el primero' : 'el segundo'}…` : 'Otra vez'}
        </button>
      ) : (
        <div className="adivina__panel adivina__panel--resultado">
          <span className="adivina__veredicto">{resultado.veredicto.nombre}</span>
          <span className="adivina__cifras">
            {ronda.correcta === 'a' ? 'El primero' : 'El segundo'} iba {signo(Math.round(Math.abs(ronda.a.bpm - ronda.b.bpm) * 10) / 10).replace('.', ',')} BPM
          </span>
          <span className="adivina__puntos">+{resultado.puntos}</span>
          <button className="boton boton--rosa" onClick={juego.siguiente}>
            {partida.i + 1 < partida.rondas.length ? 'Siguiente' : 'Ver resultado'}
          </button>
        </div>
      )}
    </main>
  )
}
