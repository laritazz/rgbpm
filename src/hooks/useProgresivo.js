import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Carga progresiva: pinta `paso` elementos y añade más cuando el centinela asoma.
 * Con 10.000 temas, el navegador solo pinta lo que ves.
 */
export function useProgresivo(lista, paso = 60) {
  const [cuantos, setCuantos] = useState(paso)
  const [anterior, setAnterior] = useState(lista)
  const observador = useRef(null)

  // Lista nueva (filtro, búsqueda): se vuelve a empezar por arriba
  if (anterior !== lista) {
    setAnterior(lista)
    setCuantos(paso)
  }

  // Ref de callback: se engancha al centinela cuando aparece en el DOM
  const centinela = useCallback(
    (nodo) => {
      observador.current?.disconnect()
      if (!nodo) return
      observador.current = new IntersectionObserver(
        ([e]) => e.isIntersecting && setCuantos((c) => c + paso),
        { rootMargin: '600px' }
      )
      observador.current.observe(nodo)
    },
    [paso]
  )

  useEffect(() => () => observador.current?.disconnect(), [])

  return { visibles: lista.slice(0, cuantos), quedan: lista.length > cuantos, centinela }
}
