import { NavLink } from 'react-router-dom'
import Mascota from '../components/marca/Mascota'
import { IconoBiblioteca, IconoMas, IconoRadio, IconoSets } from '../components/Iconos'
import { useReproductor } from '../features/musica/ReproductorContext'

/**
 * Pestañas del móvil. En el centro, la mascota: es el botón de Escuchar,
 * lo que más se usa en la pista. Toma el color de lo que suena.
 */
export default function BarraPestanas({ alAbrirMenu }) {
  const { tema, sonando } = useReproductor()
  return (
    <nav className="pestanas" aria-label="Secciones">
      <NavLink to="/" end className="pestanas__item">
        <IconoBiblioteca />
        <span>Biblioteca</span>
      </NavLink>
      <NavLink to="/radio" className="pestanas__item">
        <IconoRadio />
        <span>Radio</span>
      </NavLink>
      <NavLink to="/tap" className="pestanas__item pestanas__item--centro" aria-label="Escuchar">
        <Mascota bpm={tema?.bpm ?? 128} tocando={sonando} variante="icono" tamano={58} etiqueta="" />
        <span>Escuchar</span>
      </NavLink>
      <NavLink to="/sets" className="pestanas__item">
        <IconoSets />
        <span>Sets</span>
      </NavLink>
      <button className="pestanas__item" onClick={alAbrirMenu}>
        <IconoMas />
        <span>Más</span>
      </button>
    </nav>
  )
}
