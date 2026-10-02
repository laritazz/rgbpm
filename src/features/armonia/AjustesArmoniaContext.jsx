import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { TOLERANCIA } from '../../lib/armonia'
import { NOTACIONES, etiquetaClave, etiquetaCompleta } from '../../lib/claves'

const AjustesArmoniaContext = createContext(null)
const CLAVE = 'rgbpm:armonia'
const POR_DEFECTO = { notacion: 'open', elegida: false, corregir: true, tolerancia: TOLERANCIA }

// localStorage puede fallar (modo privado, permisos): sin él, valen los de por defecto
function leerGuardados() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) ?? '{}')
    return {
      notacion: NOTACIONES.some((n) => n.id === g.notacion) ? g.notacion : POR_DEFECTO.notacion,
      elegida: g.elegida === true, // ¿ya dijo con qué pincha? Si no, se le pregunta una vez
      corregir: typeof g.corregir === 'boolean' ? g.corregir : POR_DEFECTO.corregir,
      tolerancia: Number.isFinite(g.tolerancia) ? Math.min(16, Math.max(2, g.tolerancia)) : POR_DEFECTO.tolerancia,
    }
  } catch {
    return POR_DEFECTO
  }
}

/**
 * Preferencias de armonía para toda la app: notación, «corregir desfase» y margen de BPM.
 * No son estado de una vista (no van en la URL): te acompañan en todas las pantallas.
 */
export function AjustesArmoniaProvider({ children }) {
  const [ajustes, setAjustes] = useState(leerGuardados)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(ajustes))
    } catch {
      // sin almacenamiento, se pierden al recargar; la app sigue igual
    }
  }, [ajustes])

  // Cambiar la notación, desde donde sea, cuenta como haberla elegido
  const cambiar = useCallback((campo, valor) => setAjustes((a) => ({ ...a, [campo]: valor, ...(campo === 'notacion' ? { elegida: true } : {}) })), [])
  const etiqueta = useCallback((k) => etiquetaClave(k, ajustes.notacion), [ajustes.notacion])
  const completa = useCallback((k) => etiquetaCompleta(k, ajustes.notacion), [ajustes.notacion])

  // Lo que necesitan las funciones de lib/ para calcular: se pasa tal cual
  const opciones = useMemo(() => ({ corregir: ajustes.corregir, tolerancia: ajustes.tolerancia }), [ajustes.corregir, ajustes.tolerancia])

  const valor = useMemo(() => ({ ...ajustes, opciones, etiqueta, completa, cambiar }), [ajustes, opciones, etiqueta, completa, cambiar])
  return <AjustesArmoniaContext.Provider value={valor}>{children}</AjustesArmoniaContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAjustesArmonia() {
  const ctx = useContext(AjustesArmoniaContext)
  if (!ctx) throw new Error('useAjustesArmonia necesita <AjustesArmoniaProvider>')
  return ctx
}
