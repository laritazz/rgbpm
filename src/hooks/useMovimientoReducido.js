import { useSyncExternalStore } from 'react'

const consulta = '(prefers-reduced-motion: reduce)'

function suscribir(avisar) {
  const mq = window.matchMedia(consulta)
  mq.addEventListener('change', avisar)
  return () => mq.removeEventListener('change', avisar)
}

/** true si la persona ha pedido menos movimiento en su sistema. */
export const useMovimientoReducido = () =>
  useSyncExternalStore(suscribir, () => window.matchMedia(consulta).matches, () => false)
