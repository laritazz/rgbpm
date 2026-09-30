import { NavLink, useLocation } from 'react-router-dom'
import Mascota from '../components/marca/Mascota'
import { IconoBiblioteca, IconoMas, IconoRadio, IconoSets } from '../components/Iconos'
import { useReproductor } from '../features/musica/ReproductorContext'
import { pestanaDe } from '../lib/isla'

/**
 * Pestañas del móvil. En el centro, la mascota: es el botón de Escuchar,
 * lo que más se usa en la pista. Toma el color de lo que suena.
 * Compactas, solo queda la pestaña actual: tocarla vuelve a abrir la isla.
 */
export default function BarraPestanas({ alAbrirMenu, compacta = false, alExpandir }) {
  const { tema, sonando } = useReproductor()
  const actual = pestanaDe(useLocation().pathname)
  const clase = (id, extra = '') => `pestanas__item${extra}${id === actual ? ' pestanas__item--actual' : ''}`
  // En la isla compacta, la pestaña actual no navega: abre la isla
  const abrirSiCompacta = (id) => (e) => {
    if (compacta && id === actual) {
      e.preventDefault()
      alExpandir()
    }
  }

  return (
    <nav className="pestanas" aria-label="Secciones">
      <NavLink to="/" end className={clase('biblioteca')} onClick={abrirSiCompacta('biblioteca')}>
        <IconoBiblioteca />
        <span>Biblioteca</span>
      </NavLink>
      <NavLink to="/radio" className={clase('radio')} onClick={abrirSiCompacta('radio')}>
        <IconoRadio />
        <span>Radio</span>
      </NavLink>
      <NavLink to="/tap" className={clase('tap', ' pestanas__item--centro')} aria-label="Escuchar" onClick={abrirSiCompacta('tap')}>
        <Mascota bpm={tema?.bpm ?? 128} tocando={sonando} variante="icono" tamano={58} etiqueta="" />
        <span>Escuchar</span>
      </NavLink>
      <NavLink to="/sets" className={clase('sets')} onClick={abrirSiCompacta('sets')}>
        <IconoSets />
        <span>Sets</span>
      </NavLink>
      <button className={clase('mas')} onClick={(e) => (compacta && actual === 'mas' ? abrirSiCompacta('mas')(e) : alAbrirMenu())}>
        <IconoMas />
        <span>Más</span>
      </button>
    </nav>
  )
}
