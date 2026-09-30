// Isla del móvil (pestañas + mini reproductor): cuándo se encoge y cuándo vuelve.

export const ARRIBA = 48 // px: cerca del principio, siempre abierta
const BAJANDO = 6 // px de un scroll a otro para encogerla
const SUBIENDO = 12 // px para abrirla (un poco más: que no parpadee con el rebote)

/** Dada la posición de scroll de ahora y la anterior, ¿la isla va compacta? */
export function islaCompacta({ y, anterior, compacta }) {
  if (y <= ARRIBA) return false
  const paso = y - anterior
  if (paso > BAJANDO) return true
  if (paso < -SUBIENDO) return false
  return compacta
}

/** Qué pestaña corresponde a la ruta actual (la que queda visible en la isla compacta). */
export function pestanaDe(ruta) {
  if (ruta === '/') return 'inicio'
  if (ruta.startsWith('/biblioteca') || ruta.startsWith('/set/')) return 'biblioteca'
  if (ruta.startsWith('/radio')) return 'radio'
  if (ruta.startsWith('/tap')) return 'tap'
  if (ruta === '/sets') return 'sets'
  return 'mas'
}
