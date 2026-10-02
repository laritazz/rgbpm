import { useEffect, useState } from 'react'

/** Mide una caja y avisa cuando cambia de tamaño (girar el móvil, estirar la ventana). */
export function useMedida(ref) {
  const [medida, setMedida] = useState(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect
      setMedida((m) => (m && Math.abs(m.w - width) < 2 && Math.abs(m.h - height) < 2 ? m : { w: width, h: height }))
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref])
  return medida
}
