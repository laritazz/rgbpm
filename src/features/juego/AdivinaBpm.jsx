import { useState } from 'react'
import { Link } from 'react-router-dom'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { colorBpm } from '../../lib/color'
import { RONDAS, elegirRondas, puntuarBpm, resumenPartida } from '../../lib/juego'
import { bpmDeToques } from '../../lib/tempo'
import { useReproductor } from '../musica/ReproductorContext'
import { useRecord } from './useRecord'
import { useSonido } from './useSonido'
import './Juego.css'
import { useMusica } from '../musica/MusicaContext'

const TOQUES_MINIMOS = 4
const TOQUES_MAXIMOS = 12

/**
 * Adivina el BPM: cinco rondas. Suena un tema (o su ritmo), marcas el tempo sobre la mascota
 * y te dice cuánto te has acercado. Vale marcar a doble o a medio tempo, como en cabina.
 */
export default function AdivinaBpm() {
  const { paraJugar: temas } = useMusica()
  const rep = useReproductor()
  const record = useRecord('bpm')
  const { sonar, parar } = useSonido()
  const [partida, setPartida] = useState(null) // { rondas, i, fase: 'ronda' | 'resultado' | 'final', resultados, fuente }
  const [marcas, setMarcas] = useState([])

  const lectura = bpmDeToques(marcas)
  const ronda = partida ? partida.rondas[partida.i] : null
  const resultado = partida?.fase === 'resultado' ? partida.resultados.at(-1) : null
  const resumen = partida?.resumen ?? null

  async function empezarRonda(rondas, i, resultados) {
    setMarcas([])
    setPartida({ rondas, i, fase: 'ronda', resultados, fuente: null })
    const fuente = await sonar(rondas[i])
    setPartida((p) => (p && p.i === i ? { ...p, fuente } : p))
  }

  function empezar() {
    if (rep.sonando) rep.alternar() // que no suenen dos cosas a la vez
    const rondas = elegirRondas(temas, { n: RONDAS })
    if (rondas.length) empezarRonda(rondas, 0, [])
  }

  function cerrarRonda(toques = marcas) {
    parar()
    const tuyo = bpmDeToques(toques)?.bpm ?? null
    setPartida((p) => ({ ...p, fase: 'resultado', resultados: [...p.resultados, { tema: p.rondas[p.i], tuyo, ...puntuarBpm(p.rondas[p.i].bpm, tuyo) }] }))
  }

  function siguiente() {
    const { rondas, i, resultados } = partida
    if (i + 1 < rondas.length) return empezarRonda(rondas, i + 1, resultados)
    // El resumen se calcula antes de apuntar: si no, el récord nuevo ya no contaría como nuevo
    const final = resumenPartida(resultados, record.mejor)
    record.apuntar(final.total, final.maximo, { rondas: rondas.length, clavados: final.clavados })
    setPartida({ ...partida, fase: 'final', resumen: final })
  }

  function tocar(e) {
    if (partida?.fase !== 'ronda') return
    navigator.vibrate?.(8)
    const nuevas = [...marcas, e.timeStamp]
    setMarcas(nuevas)
    if (nuevas.length >= TOQUES_MAXIMOS) cerrarRonda(nuevas)
  }

  // ——— Pantallas ———
  if (!partida) {
    return (
      <main className="adivina adivina--inicio">
        <Link to="/juego" className="adivina__volver">← Juegos</Link>
        <MascotaEscena bpm={124} tamano={300} animo="guino" />
        <h1>Adivina el BPM</h1>
        <p>Suena un tema. Toca la mascota al ritmo del bombo.</p>
        <button className="boton boton--rosa adivina__principal" onClick={empezar} disabled={!temas.some((t) => t.bpm)}>
          Empezar
        </button>
        <span className="adivina__meta">{RONDAS} rondas{record.mejor ? ` · Récord ${record.mejor}` : ''}</span>
      </main>
    )
  }

  if (partida.fase === 'final') {
    return (
      <main className="adivina adivina--final">
        <MascotaEscena bpm={140} tamano={260} animo={resumen.total >= 350 ? 'euforia' : resumen.total >= 200 ? 'feliz' : 'calma'} />
        {resumen.nuevoRecord && <span className="adivina__sello">Nuevo récord</span>}
        <h1>
          {resumen.total}
          <small> / {resumen.maximo}</small>
        </h1>
        <p>
          {resumen.clavados} {resumen.clavados === 1 ? 'clavado' : 'clavados'} · Récord {resumen.record}
        </p>
        <ol className="adivina__repaso">
          {partida.resultados.map((r) => (
            <li key={r.tema.id} style={{ '--color': colorBpm(r.tema.bpm) }}>
              <span className="adivina__muestra" aria-hidden="true" />
              <span className="adivina__repaso-texto">
                <strong>{r.tema.titulo}</strong>
                <small>
                  {r.tema.bpm} BPM · tú {r.tuyo ?? '—'}
                </small>
              </span>
              <b>{r.puntos}</b>
            </li>
          ))}
        </ol>
        <div className="adivina__acciones">
          <button className="boton boton--rosa" onClick={empezar}>
            Otra partida
          </button>
          <Link to="/juego" className="boton boton--fantasma">
            Juegos
          </Link>
        </div>
      </main>
    )
  }

  const tuBpm = lectura?.bpm ?? null
  return (
    <main className="adivina" style={{ '--color': resultado ? colorBpm(ronda.bpm) : tuBpm ? colorBpm(tuBpm) : '#333333' }}>
      <header className="adivina__barra">
        <span>
          Ronda {partida.i + 1} de {partida.rondas.length}
        </span>
        <span>{partida.resultados.reduce((s, r) => s + r.puntos, 0)} puntos</span>
      </header>

      <button className="adivina__escenario" onPointerDown={tocar} disabled={partida.fase !== 'ronda'} aria-label="Toca al ritmo">
        <MascotaEscena bpm={resultado ? ronda.bpm : tuBpm} ultimoGolpe={marcas.at(-1) ?? null} tamano={340} animo={resultado ? resultado.veredicto.animo : null} />
      </button>

      {partida.fase === 'ronda' ? (
        <div className="adivina__panel">
          <span className="adivina__lectura">{tuBpm ? Math.round(tuBpm) : '—'}</span>
          <span className="adivina__pista">
            {marcas.length < TOQUES_MINIMOS ? `Toca al ritmo · ${TOQUES_MINIMOS - marcas.length} más` : `${marcas.length} toques`}
            {partida.fuente === 'ritmo' && ' · ritmo de prueba'}
          </span>
          <button className="boton boton--rosa" onClick={() => cerrarRonda()} disabled={marcas.length < TOQUES_MINIMOS}>
            Listo
          </button>
        </div>
      ) : (
        <div className="adivina__panel adivina__panel--resultado">
          <span className="adivina__veredicto">{resultado.veredicto.nombre}</span>
          <span className="adivina__cifras">
            <b>{ronda.bpm}</b> real · <b>{resultado.tuyo ? Math.round(resultado.tuyo) : '—'}</b> tú
            {resultado.relacion !== 1 && ` (×${resultado.relacion})`}
          </span>
          <span className="adivina__tema">
            {ronda.titulo} · {ronda.artista}
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
