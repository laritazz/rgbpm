import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarPrevia, llavePrevia } from '../../lib/previas'

const CACHE = 'rgbpm:previas'
const DURA = 30 * 86_400_000 // un mes: Apple cambia de vez en cuando las direcciones de las previas

function leerCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) ?? '{}')
    const ahora = Date.now()
    return Object.fromEntries(Object.entries(c).filter(([, v]) => ahora - v.f < DURA))
  } catch {
    return {}
  }
}

/**
 * Previas de 30 s de Apple Music: la fuente que oye cualquiera que entre en la web.
 * - La demo trae su mapa ya hecho (public/previas.json, scripts/previas.mjs): suena al momento.
 * - Para tu colección importada, cada tema se busca al pulsar play y se recuerda un mes en este navegador.
 */
export function usePrevias() {
  const [mapa, setMapa] = useState(() => new Map()) // llave → { u, e } (u = audio, e = enlace a Apple Music)
  const [sin, setSin] = useState(() => new Set()) // llaves que se buscaron y no están
  const cache = useRef(leerCache())

  useEffect(() => {
    let vivo = true
    fetch(`${import.meta.env.BASE_URL}previas.json`)
      .then((r) => (r.ok ? r.json() : { previas: {}, sin: [] }))
      .catch(() => ({ previas: {}, sin: [] }))
      .then(({ previas = {}, sin: ausentes = [] }) => {
        if (!vivo) return
        const m = new Map(Object.entries(previas))
        const s = new Set(ausentes)
        for (const [llave, v] of Object.entries(cache.current)) {
          if (v.u) m.set(llave, v)
          else s.add(llave)
        }
        setMapa(m)
        setSin(s)
      })
    return () => {
      vivo = false
    }
  }, [])

  const tiene = useCallback((tema) => mapa.has(llavePrevia(tema)), [mapa])

  /** Dirección de la previa de un tema; si aún no se sabe, se busca (y se recuerda). */
  const resolver = useCallback(
    async (tema) => {
      const llave = llavePrevia(tema)
      const conocida = mapa.get(llave)
      if (conocida) return { url: conocida.u, enlace: conocida.e, origen: 'previa' }
      if (sin.has(llave)) return null
      try {
        const p = await buscarPrevia(tema)
        cache.current[llave] = p ? { u: p.url, e: p.enlace, f: Date.now() } : { f: Date.now() }
        localStorage.setItem(CACHE, JSON.stringify(cache.current))
        if (p) setMapa((m) => new Map(m).set(llave, { u: p.url, e: p.enlace }))
        else setSin((s) => new Set(s).add(llave))
        return p ? { url: p.url, enlace: p.enlace, origen: 'previa' } : null
      } catch {
        return null // sin conexión o Apple no responde: este tema no suena ahora
      }
    },
    [mapa, sin]
  )

  return { tiene, resolver, total: mapa.size }
}
