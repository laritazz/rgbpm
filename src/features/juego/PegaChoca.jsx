import { useCallback, useEffect } from 'react'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { colorBpm } from '../../lib/color'
import { puntuarEleccion, rondasPega } from '../../lib/juegos'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'
import { useReproductor } from '../musica/ReproductorContext'
import { BarraRonda, FinalJuego, InicioJuego } from './Pantallas'
import { usePareja } from './usePareja'
import { usePartida } from './usePartida'
import { useSonido } from './useSonido'
import './Juego.css'
import { useMusica } from '../musica/MusicaContext'

const RONDAS = 6

/** ¿Pega o choca? Suenan dos temas seguidos: di qué salto armónico hay entre ellos. */
export default function PegaChoca() {
  const { paraSugerir: temas } = useMusica()
  const { etiqueta, corregir } = useAjustesArmonia()
  const rep = useReproductor()
  const { sonar, parar } = useSonido()
  const crear = useCallback(() => rondasPega(temas, { n: RONDAS, corregir }), [temas, corregir])
  const juego = usePartida('pega', crear)
  const { partida, ronda, resultado } = juego
  const pareja = usePareja(sonar, parar)
  const { tocar, callar } = pareja

  // Cada ronda nueva suena sola: A y luego B
  const enRonda = partida?.fase === 'ronda'
  useEffect(() => {
    if (enRonda && ronda) tocar(ronda.a, ronda.b)
  }, [enRonda, ronda, tocar])

  function empezar() {
    if (rep.sonando) rep.alternar()
    juego.empezar()
  }

  function elegir(opcion) {
    callar()
    juego.responder({ ronda, elegida: opcion.id, ...puntuarEleccion(ronda.correcta, opcion.id) })
  }

  if (!partida) {
    return <InicioJuego titulo="¿Pega o choca?" texto="Suenan dos temas seguidos. ¿Qué salto armónico hay entre ellos?" rondas={RONDAS} record={juego.record} animo="sorpresa" alEmpezar={empezar} puede={temas.filter((t) => t.clave).length > 6} />
  }

  if (partida.fase === 'final') {
    const filas = partida.resultados.map((r, i) => ({
      id: i,
      titulo: `${etiqueta(r.ronda.a.clave)} → ${etiqueta(r.ronda.b.clave)}`,
      detalle: `Era ${r.ronda.opciones.find((o) => o.id === r.ronda.correcta).nombre}`,
      puntos: r.puntos,
      color: r.ronda.opciones.find((o) => o.id === r.ronda.correcta).color,
    }))
    return <FinalJuego resumen={partida.resumen} filas={filas} alOtra={empezar} />
  }

  const correcta = ronda.opciones.find((o) => o.id === ronda.correcta)
  return (
    <main className="adivina">
      <BarraRonda partida={partida} puntos={juego.puntos} />
      <div className="pareja">
        {['a', 'b'].map((lado) => {
          const t = ronda[lado]
          return (
            <div key={lado} className={`pareja__tema${pareja.sonando === lado ? ' pareja__tema--sonando' : ''}`} style={{ '--color': colorBpm(t.bpm) }}>
              <span className="pareja__lado">{lado === 'a' ? 'Sale' : 'Entra'}</span>
              <span className="pareja__clave">{etiqueta(t.clave)}</span>
              <span className="pareja__titulo">{t.titulo}</span>
              <small>
                {t.clave.nombre} · {Math.round(t.bpm)} BPM
              </small>
            </div>
          )
        })}
      </div>
      <button className="boton boton--fantasma" onClick={() => tocar(ronda.a, ronda.b)}>
        {pareja.sonando ? `Suena ${pareja.sonando === 'a' ? 'el primero' : 'el segundo'}…` : 'Otra vez'}
      </button>

      <div className="respuestas" role="group" aria-label="¿Qué salto es?">
        {ronda.opciones.map((o) => (
          <button
            key={o.id}
            className={`respuesta${resultado && o.id === ronda.correcta ? ' respuesta--buena' : ''}${resultado && o.id === resultado.elegida && o.id !== ronda.correcta ? ' respuesta--mala' : ''}`}
            style={{ '--c': o.color }}
            onClick={() => elegir(o)}
            disabled={Boolean(resultado)}
          >
            <i aria-hidden="true" />
            {o.nombre}
          </button>
        ))}
      </div>

      {resultado && (
        <div className="adivina__panel adivina__panel--resultado">
          <MascotaEscena bpm={ronda.b.bpm} tamano={120} animo={resultado.veredicto.animo} />
          <span className="adivina__veredicto">{resultado.veredicto.nombre}</span>
          <span className="adivina__tema">
            {correcta.nombre}: {correcta.texto.toLowerCase()}
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
