import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Suena un tema y después otro (A → B), unos segundos cada uno, como al pinchar uno tras otro.
 * `sonando` dice cuál suena ahora ('a', 'b' o null).
 */
export function usePareja(sonar, parar, dura = 7000) {
  const [sonando, setSonando] = useState(null)
  const relojes = useRef([])

  const callar = useCallback(() => {
    relojes.current.forEach(clearTimeout)
    relojes.current = []
    parar()
    setSonando(null)
  }, [parar])

  const tocar = useCallback(
    (a, b) => {
      callar()
      setSonando('a')
      sonar(a)
      relojes.current = [
        setTimeout(() => {
          setSonando('b')
          sonar(b)
        }, dura),
        setTimeout(() => {
          parar()
          setSonando(null)
        }, dura * 2),
      ]
    },
    [callar, sonar, parar, dura]
  )

  useEffect(() => callar, [callar])
  return { sonando, tocar, callar }
}
