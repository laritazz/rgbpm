import Portada from './Portada'

// Una fila de la biblioteca. Recibe el tema por props y avisa al padre al pulsar.
export default function TarjetaTema({ tema, activo, alElegir, detalle }) {
  return (
    <li>
      <button
        className={`tarjeta ${activo ? 'tarjeta--activa' : ''}`}
        onClick={() => alElegir(tema)}
      >
        <Portada clave={tema.clave} />
        <span className="tarjeta__texto">
          <strong>{tema.titulo}</strong>
          <span>{tema.artista}</span>
          {detalle && <em className="etiqueta">{detalle}</em>}
        </span>
        <span className="tarjeta__datos">
          <span>{tema.bpm} BPM</span>
          <span className="clave">{tema.clave}</span>
        </span>
      </button>
    </li>
  )
}
