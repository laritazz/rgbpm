import { Suspense, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BarraLateral from './BarraLateral'
import BarraPestanas from './BarraPestanas'
import AjustesMusica from '../features/musica/AjustesMusica'
import BarraReproductor from '../features/musica/BarraReproductor'
import { useMusica } from '../features/musica/MusicaContext'
import PantallaSonando from '../features/musica/PantallaSonando'
import '../features/musica/Musica.css'
import Logo from '../components/marca/Logo'
import Mascota from '../components/marca/Mascota'
import { useIsla } from '../hooks/useIsla'
import { useApuntarUso } from '../hooks/useUso'
import { ROSA } from '../lib/mascota'
import { abrirDesde } from './circulo'
import './Shell.css'

/**
 * Estructura «Vinilo»: menú al lateral, contenido al centro y reproductor abajo.
 * En el móvil: cabecera mínima, isla flotante abajo (mini reproductor + pestañas) y el menú completo en un cajón («Más»).
 */
export default function Shell() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [escena, setEscena] = useState(false)
  const { hayFuente, abrirAjustes } = useMusica()
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const enInicio = pathname === '/'
  useApuntarUso(pathname) // cuánto usas cada sección: da tamaño a los círculos del inicio
  const [ruta, setRuta] = useState(pathname)
  const contenido = useRef(null)
  const isla = useRef(null)
  const [compacta, setCompacta] = useIsla(contenido, isla)

  // Al navegar se cierran el cajón y la pantalla completa (estado ajustado durante el render, sin efecto)
  if (ruta !== pathname) {
    setRuta(pathname)
    setMenuAbierto(false)
    setEscena(false)
    setCompacta(false)
  }

  return (
    <div className={`shell${enInicio ? ' shell--inicio' : ''}`}>
      <header className="shell__movil">
        <button className="shell__logo" onClick={(e) => abrirDesde(e.currentTarget, { color: ROSA, alCubrir: () => navegar('/') })} aria-label="RGBPM, ir al inicio">
          <Logo ancho={112} />
        </button>
        <button className="shell__musica" onClick={abrirAjustes}>
          <span className={`lateral__luz${hayFuente ? ' lateral__luz--on' : ''}`} aria-hidden="true" />
          Tu música
        </button>
      </header>
      <BarraLateral abierta={menuAbierto} alCerrar={() => setMenuAbierto(false)} />
      {menuAbierto && <button className="shell__velo" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)} />}
      <div className="shell__contenido" ref={contenido}>
        {/* key: cada pantalla entra con su fundido; mientras se descarga, la espera no se ve vacía */}
        <div className="shell__pagina" key={pathname}>
          <Suspense fallback={<Cargando />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
      {/* En el móvil, reproductor y pestañas flotan juntos en una isla que se encoge al bajar */}
      <div className={`isla${compacta ? ' isla--compacta' : ''}`} ref={isla}>
        <BarraReproductor alAbrir={() => setEscena(true)} />
        <BarraPestanas alAbrirMenu={() => setMenuAbierto(true)} compacta={compacta} alExpandir={() => setCompacta(false)} />
      </div>
      <PantallaSonando abierta={escena} alCerrar={() => setEscena(false)} />
      <AjustesMusica />
    </div>
  )
}

/** Mientras llega una pantalla: la mascota pequeña, que solo aparece si la espera se alarga. */
function Cargando() {
  return (
    <div className="shell__cargando" role="status" aria-label="Cargando">
      <Mascota bpm={100} variante="icono" tamano={64} etiqueta="" />
    </div>
  )
}
