import { useEffect, useRef, useState } from 'react'
import { islaCompacta } from '../lib/isla'

/**
 * Isla del móvil: se encoge al bajar por cualquier lista y vuelve al subir.
 * - `contenido`: ref del contenedor de las páginas. Cada página hace scroll en su propio elemento,
 *   así que escucho en fase de captura (el evento scroll no sube, pero sí se puede capturar).
 * - `isla`: ref de la isla. Su alto real se publica en `--hueco-isla` para que nada quede debajo.
 */
export function useIsla(contenido, isla) {
  const [compacta, setCompacta] = useState(false)
  const posiciones = useRef(new WeakMap()) // elemento → última posición

  useEffect(() => {
    const caja = contenido.current
    if (!caja) return
    const alMover = (e) => {
      const el = e.target
      if (!(el instanceof Element)) return
      const y = el.scrollTop
      const anterior = posiciones.current.get(el) ?? y
      posiciones.current.set(el, y)
      setCompacta((c) => islaCompacta({ y, anterior, compacta: c }))
    }
    caja.addEventListener('scroll', alMover, { capture: true, passive: true })
    return () => caja.removeEventListener('scroll', alMover, { capture: true })
  }, [contenido])

  // El alto de la isla cambia (con o sin reproductor): lo mido solo abierta, para que el hueco no baile al encogerse
  useEffect(() => {
    const el = isla.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const raiz = document.documentElement
    const medir = new ResizeObserver(([entrada]) => {
      if (el.classList.contains('isla--compacta')) return
      raiz.style.setProperty('--hueco-isla', `${Math.ceil(entrada.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight)}px`)
    })
    medir.observe(el)
    return () => {
      medir.disconnect()
      raiz.style.removeProperty('--hueco-isla')
    }
  }, [isla])

  return [compacta, setCompacta]
}
