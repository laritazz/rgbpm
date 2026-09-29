import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BarraLateral from './BarraLateral'
import BarraPestanas from './BarraPestanas'
import AjustesMusica from '../features/musica/AjustesMusica'
import BarraReproductor from '../features/musica/BarraReproductor'
import { useMusica } from '../features/musica/MusicaContext'
import PantallaSonando from '../features/musica/PantallaSonando'
import '../features/musica/Musica.css'
import Logo from '../components/marca/Logo'
import './Shell.css'

/**
 * Estructura «Vinilo»: menú al lateral, contenido al centro y reproductor abajo.
 * En el móvil: cabecera mínima, pestañas abajo y el menú completo en un cajón («Más»).
 */
export default function Shell() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [escena, setEscena] = useState(false)
  const { hayFuente, abrirAjustes } = useMusica()
  const { pathname } = useLocation()
  const [ruta, setRuta] = useState(pathname)

  // Al navegar se cierran el cajón y la pantalla completa (estado ajustado durante el render, sin efecto)
  if (ruta !== pathname) {
    setRuta(pathname)
    setMenuAbierto(false)
    setEscena(false)
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
      <div className="shell__contenido">
        <Outlet />
      </div>
      <BarraReproductor alAbrir={() => setEscena(true)} />
      <BarraPestanas alAbrirMenu={() => setMenuAbierto(true)} />
      <PantallaSonando abierta={escena} alCerrar={() => setEscena(false)} />
      <AjustesMusica />
    </div>
  )
}
