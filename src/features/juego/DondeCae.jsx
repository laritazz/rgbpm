import { useCallback, useEffect, useState } from 'react'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { colorBpm } from '../../lib/color'
import { puntuarCae, rondasCae } from '../../lib/juegos'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'
import { useReproductor } from '../musica/ReproductorContext'
import { BarraRonda, FinalJuego, InicioJuego } from './Pantallas'
import RuedaElegir from './RuedaElegir'
import { usePartida } from './usePartida'
import { useSonido } from './useSonido'
import './Juego.css'
import { useMusica } from '../musica/MusicaContext'

const RONDAS = 5

/** ¿Dónde cae? Suena un tema: toca su tono en la rueda. La relativa y la vecina también puntúan. */
export default function DondeCae() {
  const { paraJugar: temas } = useMusica()
  const { etiqueta, corregir } = useAjustesArmonia()
  const rep = useReproductor()
  const { sonar, parar } = useSonido()
  const crear = useCallback(() => rondasCae(temas, { n: RONDAS }), [temas])
  const juego = usePartida('cae', crear)
  const { partida, ronda, resultado } = juego
  const [pista, setPista] = useState(false)
  const [elegida, setElegida] = useState(null)

  const enRonda = partida?.fase === 'ronda'
  useEffect(() => {
    if (!enRonda || !ronda) return
    sonar(ronda)
    return parar
  }, [enRonda, ronda, sonar, parar])

  // La pista y tu elección se limpian al pasar de ronda (en el clic, no en un efecto)
  function limpiar() {
    setPista(false)
    setElegida(null)
  }

  function empezar() {
    if (rep.sonando) rep.alternar()
    limpiar()
    juego.empezar()
  }

  function siguiente() {
    limpiar()
    juego.siguiente()
  }

  function elegir(k) {
    setElegida(k)
    parar()
    juego.responder({ tema: ronda, elegida: k, ...puntuarCae(ronda.clave, k, { corregir, pista }) })
  }

  if (!partida) {
    return <InicioJuego titulo="¿Dónde cae?" texto="Suena un tema. Toca su tono en la rueda: la relativa y la vecina también puntúan." rondas={RONDAS} record={juego.record} animo="feliz" alEmpezar={empezar} puede={temas.some((t) => t.clave)} />
  }

  if (partida.fase === 'final') {
    const filas = partida.resultados.map((r) => ({ id: r.tema.id, titulo: r.tema.titulo, detalle: `${etiqueta(r.tema.clave)} · tú ${etiqueta(r.elegida)}`, puntos: r.puntos, bpm: r.tema.bpm }))
    return <FinalJuego resumen={partida.resumen} filas={filas} alOtra={empezar} />
  }

  return (
    <main className="adivina" style={{ '--color': resultado ? colorBpm(ronda.bpm) : '#333333' }}>
      <BarraRonda partida={partida} puntos={juego.puntos} />
      <div className="cae__rueda">
        <RuedaElegir elegida={elegida} real={resultado ? ronda.clave : null} soloModo={pista ? (ronda.clave.menor ? 'm' : 'd') : null} etiqueta={etiqueta} alElegir={elegir} quieta={Boolean(resultado)} />
        <div className="cae__centro" aria-hidden="true">
          <MascotaEscena bpm={ronda.bpm} tocando={!resultado} tamano={110} animo={resultado ? resultado.veredicto.animo : null} />
        </div>
      </div>

      {!resultado ? (
        <div className="adivina__panel">
          <span className="adivina__pista">Escucha y toca su tono</span>
          <div className="adivina__acciones">
            <button className="boton boton--fantasma" onClick={() => sonar(ronda)}>
              Otra vez
            </button>
            <button className="boton boton--fantasma" onClick={() => setPista(true)} disabled={pista}>
              {pista ? (ronda.clave.menor ? 'Es menor' : 'Es mayor') : 'Pista (−30 %)'}
            </button>
          </div>
        </div>
      ) : (
        <div className="adivina__panel adivina__panel--resultado">
          <span className="adivina__veredicto">{resultado.veredicto.nombre}</span>
          <span className="adivina__cifras">
            Era <b>{etiqueta(ronda.clave)}</b> · {ronda.clave.nombre}
          </span>
          <span className="adivina__tema">
            {[ronda.titulo, ronda.artista].filter(Boolean).join(' · ')}
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
