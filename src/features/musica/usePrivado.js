import { useCallback, useEffect, useRef, useState } from 'react'
import { firmarPrivado, listaPrivada, SesionCaducada } from '../../lib/audioPrivado'
import { SUPABASE_CLAVE } from '../../lib/config'
import { idFragmento } from '../../lib/fragmentos'
import { supabase } from '../../lib/supabase'

const MARGEN = 60_000 // una firma se renueva si le queda menos de un minuto

/**
 * Música privada: login con Supabase y fragmentos firmados desde tu servidor.
 * estado: sin-configurar · fuera · entrando · dentro · error
 */
export function usePrivado(temas) {
  const [estado, setEstado] = useState(SUPABASE_CLAVE ? 'fuera' : 'sin-configurar')
  const [email, setEmail] = useState(null)
  const [ids, setIds] = useState(() => new Set())
  const [porTema, setPorTema] = useState(() => new Map()) // tema.id → fragmento
  const [error, setError] = useState(null)
  const firmas = useRef(new Map()) // fragmento → { url, caduca }

  const token = async () => {
    const { data } = await (await supabase()).auth.getSession()
    if (!data.session) throw new SesionCaducada('Tu sesión ha caducado')
    return data.session.access_token
  }

  const cerrar = useCallback(async (motivo = null) => {
    await (await supabase()).auth.signOut().catch(() => {})
    firmas.current.clear()
    setIds(new Set())
    setPorTema(new Map())
    setEmail(null)
    setError(motivo)
    setEstado('fuera')
  }, [])

  const cargar = useCallback(
    async (sesion) => {
      setEstado('entrando')
      try {
        setIds(await listaPrivada(sesion.access_token))
        setEmail(sesion.user?.email ?? null)
        setError(null)
        setEstado('dentro')
      } catch (e) {
        if (e instanceof SesionCaducada) return cerrar(e.message)
        setError(e.message)
        setEstado('error')
      }
    },
    [cerrar]
  )

  // Si ya habías entrado en este navegador, la sesión sigue
  useEffect(() => {
    if (!SUPABASE_CLAVE) return
    let vivo = true
    supabase()
      .then((sb) => sb.auth.getSession())
      .then(({ data }) => vivo && data.session && cargar(data.session))
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [cargar])

  const entrar = useCallback(
    async (correo, clave) => {
      setEstado('entrando')
      setError(null)
      const { data, error: fallo } = await (await supabase()).auth.signInWithPassword({ email: correo, password: clave })
      if (fallo) {
        setError(fallo.status === 400 ? 'Email o contraseña incorrectos' : 'No puedo entrar ahora mismo')
        setEstado('fuera')
        return false
      }
      await cargar(data.session)
      return true
    },
    [cargar]
  )

  // Qué fragmento corresponde a cada tema: el nombre sale de su ruta (igual que en el script)
  useEffect(() => {
    if (!ids.size) return
    let vivo = true
    ;(async () => {
      const mapa = new Map()
      const conRuta = temas.filter((t) => t.ruta)
      for (let i = 0; i < conRuta.length && vivo; i += 500) {
        const trozo = conRuta.slice(i, i + 500)
        const nombres = await Promise.all(trozo.map((t) => idFragmento(t.ruta)))
        trozo.forEach((t, j) => ids.has(nombres[j]) && mapa.set(t.id, nombres[j]))
      }
      if (vivo) setPorTema(mapa)
    })()
    return () => {
      vivo = false
    }
  }, [temas, ids])

  /** Enlace firmado para un tema (o null si no tiene fragmento). */
  const resolver = useCallback(
    async (tema) => {
      const fragmento = porTema.get(tema.id)
      if (!fragmento) return null
      const guardada = firmas.current.get(fragmento)
      if (guardada && guardada.caduca * 1000 - Date.now() > MARGEN) return { url: guardada.url, origen: 'privado' }
      try {
        const { urls, caduca } = await firmarPrivado(await token(), [fragmento])
        if (!urls[fragmento]) return null
        firmas.current.set(fragmento, { url: urls[fragmento], caduca })
        return { url: urls[fragmento], origen: 'privado' }
      } catch (e) {
        if (e instanceof SesionCaducada) cerrar(e.message)
        return null
      }
    },
    [porTema, cerrar]
  )

  const tiene = useCallback((tema) => porTema.has(tema.id), [porTema])

  return { estado, email, total: ids.size, conTema: porTema.size, error, entrar, salir: () => cerrar(), resolver, tiene }
}
