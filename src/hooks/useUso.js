import { useEffect, useState } from 'react'
import { apuntarVisita, seccionesDeRuta } from '../lib/uso'

const CLAVE = 'rgbpm:uso'
const EVENTO = 'rgbpm:uso'

// localStorage: se lee al momento (sin esperas) y, si falla (modo privado), el inicio queda con la composición base
function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? '{}')
  } catch {
    return {}
  }
}

/** Apunta cada sección que visitas. Se usa una vez, en el Shell. */
export function useApuntarUso(ruta) {
  useEffect(() => {
    const secciones = seccionesDeRuta(ruta)
    if (!secciones.length) return
    try {
      const nuevo = secciones.reduce((h, id) => apuntarVisita(h, id), leer())
      localStorage.setItem(CLAVE, JSON.stringify(nuevo))
      window.dispatchEvent(new Event(EVENTO))
    } catch {
      // sin almacenamiento no se apunta: no pasa nada
    }
  }, [ruta])
}

/** El historial de uso, para dar tamaño a los círculos. */
export function useUso() {
  const [historial, setHistorial] = useState(leer)
  useEffect(() => {
    const actualizar = () => setHistorial(leer())
    window.addEventListener(EVENTO, actualizar)
    return () => window.removeEventListener(EVENTO, actualizar)
  }, [])
  return historial
}
