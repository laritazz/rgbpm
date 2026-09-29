import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BarraLateral from './BarraLateral'
import Logo from '../components/marca/Logo'
import './Shell.css'

/** Estructura «Vinilo»: menú al lateral, contenido al centro. En móvil, el menú es un cajón. */
export default function Shell() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const [ruta, setRuta] = useState(pathname)

  // Al navegar se cierra el cajón (estado ajustado durante el render, sin efecto)
  if (ruta !== pathname) {
    setRuta(pathname)
    setMenuAbierto(false)
  }

  return (
    <div className="shell">
      <header className="shell__movil">
        <Logo ancho={112} />
        <button className="shell__hamburguesa" aria-expanded={menuAbierto} aria-controls="menu-principal" onClick={() => setMenuAbierto((v) => !v)}>
          <span className="solo-lectores">Menú</span>
          <span aria-hidden="true" />
        </button>
      </header>
      <BarraLateral abierta={menuAbierto} />
      {menuAbierto && <button className="shell__velo" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)} />}
      <div className="shell__contenido">
        <Outlet />
      </div>
    </div>
  )
}
