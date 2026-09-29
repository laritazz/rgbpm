import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { guardar, leer } from '../../lib/almacen'
import { buscarArchivo, crearIndice, esAudio, urlEnServidor } from '../../lib/indice'
import { descargarTexto } from '../../lib/servidor'

const MusicaContext = createContext(null)
export const NOMBRE_INDICE = 'rgbpm-indice.json'
const puedeElegirCarpeta = typeof window !== 'undefined' && 'showDirectoryPicker' in window

// Recorre una carpeta y guarda, por cada audio, su ruta y cómo abrirlo
async function recorrer(dir, prefijo, salida) {
  for await (const [nombre, h] of dir.entries()) {
    if (nombre.startsWith('.')) continue
    const ruta = `${prefijo}/${nombre}`
    if (h.kind === 'directory') await recorrer(h, ruta, salida)
    else if (esAudio(nombre)) salida.set(ruta, () => h.getFile())
  }
}

async function indexarCarpetas(carpetas) {
  const archivos = new Map()
  for (const c of carpetas) await recorrer(c, c.name, archivos)
  return archivos
}

/**
 * De dónde sale el audio:
 * - Carpetas de tu ordenador (Chrome/Edge recuerdan el permiso; en otros navegadores se eligen en cada visita).
 * - Tu servidor: una carpeta pública por https con el índice que genera RGBPM.
 */
export function MusicaProvider({ children }) {
  const [carpetas, setCarpetas] = useState([]) // handles de carpeta (solo Chrome/Edge)
  const [archivos, setArchivos] = useState(new Map()) // ruta → () => Promise<File>
  const [estadoLocal, setEstadoLocal] = useState('vacio') // vacio · reconectar · leyendo · listo
  const [servidor, setServidor] = useState({ base: '', indice: null, estado: 'vacio', error: null })
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false) // la ventana «Tu música»

  const anadirCarpeta = useCallback(async () => {
    if (!puedeElegirCarpeta) return false
    try {
      const dir = await window.showDirectoryPicker({ id: 'rgbpm-musica', mode: 'read' })
      const nuevas = [...carpetas.filter((c) => c.name !== dir.name), dir]
      setCarpetas(nuevas)
      setEstadoLocal('leyendo')
      setArchivos(await indexarCarpetas(nuevas))
      setEstadoLocal('listo')
      await guardar('carpetas', nuevas).catch(() => {})
      return true
    } catch {
      setEstadoLocal((e) => (e === 'leyendo' ? 'vacio' : e))
      return false // cancelada
    }
  }, [carpetas])

  // Plan B (Safari, Firefox, móvil): <input webkitdirectory>. Vale para esta visita
  const anadirArchivos = useCallback((lista) => {
    setArchivos((previos) => {
      const a = new Map(previos)
      for (const f of lista) if (esAudio(f.name)) a.set(f.webkitRelativePath || f.name, () => Promise.resolve(f))
      return a
    })
    setEstadoLocal('listo')
  }, [])

  const reconectar = useCallback(async () => {
    const permisos = await Promise.all(carpetas.map((c) => c.requestPermission({ mode: 'read' })))
    if (!permisos.every((p) => p === 'granted')) return
    setEstadoLocal('leyendo')
    setArchivos(await indexarCarpetas(carpetas))
    setEstadoLocal('listo')
  }, [carpetas])

  const olvidarCarpetas = useCallback(async () => {
    setCarpetas([])
    setArchivos(new Map())
    setEstadoLocal('vacio')
    await guardar('carpetas', []).catch(() => {})
  }, [])

  const conectarServidor = useCallback(async (base) => {
    const limpia = base.trim().replace(/\/?$/, '/')
    setServidor({ base: limpia, indice: null, estado: 'leyendo', error: null })
    try {
      const r = await fetch(limpia + NOMBRE_INDICE, { cache: 'no-cache' })
      if (!r.ok) throw new Error(r.status === 404 ? `No encuentro ${NOMBRE_INDICE} en esa carpeta` : `El servidor responde ${r.status}`)
      const datos = await r.json()
      setServidor({ base: limpia, indice: crearIndice(datos.archivos ?? []), estado: 'listo', error: null })
      await guardar('servidor', { base: limpia }).catch(() => {})
    } catch (e) {
      // Un fallo de red sin respuesta suele ser el permiso CORS del servidor (el .htaccess)
      const mensaje = e instanceof TypeError ? 'El servidor no deja leer desde RGBPM: revisa el .htaccess' : e.message
      setServidor({ base: limpia, indice: null, estado: 'error', error: mensaje })
    }
  }, [])

  const olvidarServidor = useCallback(async () => {
    setServidor({ base: '', indice: null, estado: 'vacio', error: null })
    await guardar('servidor', null).catch(() => {})
  }, [])

  // Al abrir la app: recuperar carpetas y servidor guardados
  useEffect(() => {
    let vivo = true
    ;(async () => {
      const guardadas = await leer('carpetas').catch(() => null)
      if (guardadas?.length && vivo) {
        setCarpetas(guardadas)
        const permisos = await Promise.all(guardadas.map((c) => c.queryPermission?.({ mode: 'read' })))
        if (!vivo) return
        if (permisos.every((p) => p === 'granted')) {
          setEstadoLocal('leyendo')
          const a = await indexarCarpetas(guardadas)
          if (vivo) {
            setArchivos(a)
            setEstadoLocal('listo')
          }
        } else setEstadoLocal('reconectar') // el navegador pide un clic para volver a dar permiso
      }
      const srv = await leer('servidor').catch(() => null)
      if (srv?.base && vivo) conectarServidor(srv.base)
    })()
    return () => {
      vivo = false
    }
  }, [conectarServidor])

  const indiceLocal = useMemo(() => crearIndice(archivos.keys()), [archivos])

  /** Dirección reproducible de un tema: primero tu carpeta, si no, tu servidor. */
  const resolver = useCallback(
    async (tema) => {
      const local = buscarArchivo(indiceLocal, tema)
      if (local) {
        const archivo = await archivos.get(local)()
        return { url: URL.createObjectURL(archivo), origen: 'carpeta', ruta: local, temporal: true }
      }
      const remoto = servidor.indice && buscarArchivo(servidor.indice, tema)
      if (remoto) return { url: urlEnServidor(servidor.base, remoto), origen: 'servidor', ruta: remoto }
      return null
    },
    [indiceLocal, archivos, servidor]
  )

  const tieneArchivo = useCallback(
    (tema) => Boolean(buscarArchivo(indiceLocal, tema) || (servidor.indice && buscarArchivo(servidor.indice, tema))),
    [indiceLocal, servidor]
  )

  /** Índice para subir al servidor junto a la música, con las mismas carpetas. */
  const descargarIndice = useCallback(() => {
    const datos = { version: 1, creado: new Date().toISOString(), archivos: [...archivos.keys()].sort() }
    descargarTexto(NOMBRE_INDICE, JSON.stringify(datos), 'application/json')
  }, [archivos])

  const valor = useMemo(
    () => ({
      puedeElegirCarpeta,
      carpetas: carpetas.map((c) => c.name),
      totalLocal: archivos.size,
      estadoLocal,
      servidor: { base: servidor.base, estado: servidor.estado, error: servidor.error, total: servidor.indice ? [...servidor.indice.values()].reduce((s, l) => s + l.length, 0) : 0 },
      hayFuente: archivos.size > 0 || Boolean(servidor.indice),
      anadirCarpeta,
      anadirArchivos,
      reconectar,
      olvidarCarpetas,
      conectarServidor,
      olvidarServidor,
      resolver,
      tieneArchivo,
      descargarIndice,
      ajustesAbiertos,
      abrirAjustes: () => setAjustesAbiertos(true),
      cerrarAjustes: () => setAjustesAbiertos(false),
    }),
    [ajustesAbiertos, carpetas, archivos, estadoLocal, servidor, anadirCarpeta, anadirArchivos, reconectar, olvidarCarpetas, conectarServidor, olvidarServidor, resolver, tieneArchivo, descargarIndice]
  )

  return <MusicaContext.Provider value={valor}>{children}</MusicaContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useMusica() {
  const ctx = useContext(MusicaContext)
  if (!ctx) throw new Error('useMusica necesita <MusicaProvider>')
  return ctx
}
