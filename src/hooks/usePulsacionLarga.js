import { useEffect, useMemo, useRef } from 'react'

const ESPERA = 500 // ms de dedo quieto
const TOLERANCIA = 10 // px que se puede mover sin que cuente como scroll

/**
 * Pulsación larga (móvil) o clic derecho (escritorio, o tecla de menú) sobre un elemento.
 * - Si el dedo se mueve o el navegador empieza a hacer scroll, se cancela.
 * - Android también lanza `contextmenu` al mantener: se abre una sola vez.
 * - El clic que llega al soltar después de abrir no cuenta (no elige la tarjeta).
 * Devuelve los manejadores para esparcir en el elemento.
 */
export function usePulsacionLarga(alPulsar) {
  const pulsar = useRef(alPulsar)
  const toque = useRef(null) // { x, y, reloj, abierta } solo con el dedo
  useEffect(() => {
    pulsar.current = alPulsar
  })

  return useMemo(() => {
    const parar = () => {
      clearTimeout(toque.current?.reloj)
      if (toque.current) toque.current.reloj = null
    }
    return {
      onPointerDown(e) {
        parar()
        if (e.pointerType !== 'touch') {
          toque.current = null
          return
        }
        const el = e.currentTarget
        const t = { x: e.clientX, y: e.clientY, abierta: false, reloj: null }
        t.reloj = setTimeout(() => {
          t.abierta = true
          navigator.vibrate?.(12)
          pulsar.current(el)
        }, ESPERA)
        toque.current = t
      },
      onPointerMove(e) {
        const t = toque.current
        if (t?.reloj && Math.hypot(e.clientX - t.x, e.clientY - t.y) > TOLERANCIA) parar()
      },
      onPointerUp: parar,
      onPointerCancel: parar,
      onContextMenu(e) {
        e.preventDefault()
        const t = toque.current
        if (t?.abierta) return
        parar()
        if (t) t.abierta = true
        pulsar.current(e.currentTarget)
      },
      onClickCapture(e) {
        if (!toque.current?.abierta) return
        e.preventDefault()
        e.stopPropagation()
        toque.current = null
      },
    }
  }, [])
}
