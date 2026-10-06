import { useMusica } from './MusicaContext'
import './AvisoSinAudio.css'

/** Cuando ningún tema suena: no se sugiere nada mudo, se explica por qué y se ofrece la salida. */
export default function AvisoSinAudio({ texto = 'Aún no suena ningún tema. Solo te propongo lo que puedes oír.' }) {
  const { abrirAjustes } = useMusica()
  return (
    <div className="aviso-sin-audio" role="status">
      <p>{texto}</p>
      <button className="boton boton--rosa" onClick={abrirAjustes}>
        Conectar música
      </button>
    </div>
  )
}
