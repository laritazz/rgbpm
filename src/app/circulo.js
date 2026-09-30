// Transición entre pantallas: un círculo que se abre desde donde tocas hasta cubrirlo todo.
// Se dibuja fuera de React (en el body) para que sobreviva al cambio de pantalla y se funda después.

const CURVA = 'cubic-bezier(0.7, 0, 0.2, 1)'

/**
 * @param x, y      centro (px, en la ventana): donde tocaste
 * @param r         radio inicial (px): el del círculo tocado
 * @param color     con qué color se entra (negro a las secciones, rosa a la home)
 * @param alCubrir  se llama con la pantalla cubierta: ahí se navega
 */
export function abrirCirculo({ x, y, r = 0, color = '#000000', alCubrir }) {
  const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (quieto || !document.body.animate) {
    alCubrir()
    return
  }
  const lejos = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const capa = document.createElement('div')
  capa.className = 'circulo-transicion'
  capa.style.background = color
  document.body.append(capa)

  const abre = capa.animate([{ clipPath: `circle(${r}px at ${x}px ${y}px)` }, { clipPath: `circle(${lejos + 2}px at ${x}px ${y}px)` }], {
    duration: 560,
    easing: CURVA,
    fill: 'forwards',
  })
  abre.onfinish = () => {
    alCubrir()
    // Dos fotogramas: la pantalla nueva ya está pintada debajo cuando la capa empieza a fundirse
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 340, easing: 'ease-out', fill: 'forwards' }).onfinish = () => capa.remove()
      })
    )
  }
}

/** Abre el círculo desde un elemento (su centro y su tamaño). */
export function abrirDesde(elemento, opciones) {
  const caja = elemento.getBoundingClientRect()
  abrirCirculo({ x: caja.left + caja.width / 2, y: caja.top + caja.height / 2, r: Math.min(caja.width, caja.height) / 2, ...opciones })
}
