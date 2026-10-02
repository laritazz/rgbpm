import { Link } from 'react-router-dom'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { colorBpm } from '../../lib/color'

/** Antes de jugar: la mascota, el nombre del juego y cómo se juega en una línea. */
export function InicioJuego({ titulo, texto, rondas, record, animo = 'guino', bpm = 124, alEmpezar, puede = true, aviso }) {
  return (
    <main className="adivina adivina--inicio">
      <Link to="/juego" className="adivina__volver">
        ← Juegos
      </Link>
      <MascotaEscena bpm={bpm} tamano={280} animo={animo} />
      <h1>{titulo}</h1>
      <p>{texto}</p>
      <button className="boton boton--rosa adivina__principal" onClick={alEmpezar} disabled={!puede}>
        Empezar
      </button>
      <span className="adivina__meta">
        {rondas} rondas{record.mejor ? ` · Récord ${record.mejor}` : ''}
        {record.nube ? ' · en la nube' : ''}
      </span>
      {aviso && <p className="adivina__aviso">{aviso}</p>}
    </main>
  )
}

/** La barra de arriba durante la partida. */
export function BarraRonda({ partida, puntos }) {
  return (
    <header className="adivina__barra">
      <span>
        Ronda {partida.i + 1} de {partida.rondas.length}
      </span>
      <span>{puntos} puntos</span>
    </header>
  )
}

/**
 * Final: total, récord y repaso de cada ronda.
 * @param filas [{ id, titulo, detalle, puntos, color }]
 */
export function FinalJuego({ resumen, filas, alOtra }) {
  const animo = resumen.total >= resumen.maximo * 0.7 ? 'euforia' : resumen.total >= resumen.maximo * 0.4 ? 'feliz' : 'calma'
  return (
    <main className="adivina adivina--final">
      <MascotaEscena bpm={140} tamano={240} animo={animo} />
      {resumen.nuevoRecord && <span className="adivina__sello">Nuevo récord</span>}
      <h1>
        {resumen.total}
        <small> / {resumen.maximo}</small>
      </h1>
      <p>
        {resumen.clavados} {resumen.clavados === 1 ? 'acierto' : 'aciertos'} · Récord {resumen.record}
      </p>
      <ol className="adivina__repaso">
        {filas.map((f) => (
          <li key={f.id} style={{ '--color': f.color ?? colorBpm(f.bpm) }}>
            <span className="adivina__muestra" aria-hidden="true" />
            <span className="adivina__repaso-texto">
              <strong>{f.titulo}</strong>
              <small>{f.detalle}</small>
            </span>
            <b>{f.puntos}</b>
          </li>
        ))}
      </ol>
      <div className="adivina__acciones">
        <button className="boton boton--rosa" onClick={alOtra}>
          Otra partida
        </button>
        <Link to="/juego" className="boton boton--fantasma">
          Juegos
        </Link>
      </div>
    </main>
  )
}
