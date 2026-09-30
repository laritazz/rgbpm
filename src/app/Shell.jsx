import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BarraLateral from './BarraLateral'
import BarraPestanas from './BarraPestanas'
import AjustesMusica from '../features/musica/AjustesMusica'
import BarraReproductor from '../features/musica/BarraReproductor'
import { useMusica } from '../features/musica/MusicaContext'
import PantallaSonando from '../features/musica/PantallaSonando'
import '../features/musica/Musica.css'
import Logo from '../components/marca/Logo'
import { useIsla } from '../hooks/useIsla'
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
    <div className="shell">
      <header className="shell__movil">
        <Logo ancho={112} />
        <button className="shell__musica" onClick={abrirAjustes}>
          <span className={`lateral__luz${hayFuente ? ' lateral__luz--on' : ''}`} aria-hidden="true" />
          Tu música
        </button>
      </header>
      <BarraLateral abierta={menuAbierto} alCerrar={() => setMenuAbierto(false)} />
      {menuAbierto && <button className="shell__velo" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)} />}
      <div className="shell__contenido" ref={contenido}>
        <Outlet />
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
