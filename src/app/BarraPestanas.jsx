import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Mascota from '../components/marca/Mascota'
import { IconoDiscos, IconoMas, IconoRadio, IconoSets } from '../components/Iconos'
import { useReproductor } from '../features/musica/ReproductorContext'
import { pestanaDe } from '../lib/isla'
import { ROSA } from '../lib/mascota'
import { abrirDesde } from './circulo'

/**
 * Pestañas del móvil. En el centro, la mascota: lleva al inicio (el racimo de secciones).
 * Toma el color de lo que suena y duerme en pausa.
 * Compactas, solo queda la pestaña actual: tocarla vuelve a abrir la isla.
 */
export default function BarraPestanas({ alAbrirMenu, compacta = false, alExpandir }) {
  const { tema, sonando } = useReproductor()
  const actual = pestanaDe(useLocation().pathname)
  const navegar = useNavigate()
  const clase = (id, extra = '') => `pestanas__item${extra}${id === actual ? ' pestanas__item--actual' : ''}`
  // En la isla compacta, la pestaña actual no navega: abre la isla
  const abrirSiCompacta = (id) => (e) => {
    if (compacta && id === actual) {
      e.preventDefault()
      alExpandir()
    }
  }

  // La mascota lleva al inicio abriendo un círculo rosa desde ella
  function volverAInicio(e) {
    e.preventDefault()
    if (actual === 'inicio') return
    abrirDesde(e.currentTarget.querySelector('.mascota') ?? e.currentTarget, { color: ROSA, alCubrir: () => navegar('/') })
  }

  return (
    <nav className="pestanas" aria-label="Secciones">
      <NavLink to="/biblioteca" className={clase('biblioteca')} onClick={abrirSiCompacta('biblioteca')}>
        <IconoDiscos />
        <span>Biblioteca</span>
      </NavLink>
      <NavLink to="/radio" className={clase('radio')} onClick={abrirSiCompacta('radio')}>
        <IconoRadio />
        <span>Radio</span>
      </NavLink>
      <NavLink to="/" end className={clase('inicio', ' pestanas__item--centro')} aria-label="Inicio" onClick={volverAInicio}>
        <Mascota bpm={tema?.bpm ?? 100} tocando={sonando} variante="icono" tamano={58} etiqueta="" />
        <span>Inicio</span>
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
