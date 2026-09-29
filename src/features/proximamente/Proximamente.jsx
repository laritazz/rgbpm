import { Link } from 'react-router-dom'
import Mascota from '../../components/marca/Mascota'
import './Proximamente.css'

/** Estado vacío con la mascota: cada sección cuenta qué hará y en qué sprint llega. */
export default function Proximamente({ titulo, texto, sprint, bpm }) {
  return (
    <main className="pronto">
      <Mascota bpm={bpm} variante="icono" tamano={200} />
      <span className="etiqueta-seccion">Sprint {sprint}</span>
      <h1>{titulo}</h1>
      <p>{texto}</p>
      <Link to="/" className="boton boton--rosa">
        Ir a la biblioteca
      </Link>
    </main>
  )
}
