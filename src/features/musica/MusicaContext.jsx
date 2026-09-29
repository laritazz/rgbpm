import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { guardar, leer } from '../../lib/almacen'
import { buscarArchivo, crearIndice, esAudio } from '../../lib/indice'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { usePrivado } from './usePrivado'

const MusicaContext = createContext(null)
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
 * - Tus carpetas del ordenador: temas enteros (Chrome/Edge recuerdan el permiso).
 * - Tu música privada en creativezz: fragmentos de 90 s, con login y enlaces que caducan.
 */
export function MusicaProvider({ children }) {
  const { temas } = useBiblioteca()
  const privado = usePrivado(temas)
  const { resolver: resolverPrivado, tiene: tienePrivado } = privado
  const [carpetas, setCarpetas] = useState([]) // handles de carpeta (solo Chrome/Edge)
  const [archivos, setArchivos] = useState(new Map()) // ruta → () => Promise<File>
  const [estadoLocal, setEstadoLocal] = useState('vacio') // vacio · reconectar · leyendo · listo
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

  // Al abrir la app: recuperar las carpetas guardadas
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
    })()
    return () => {
      vivo = false
    }
  }, [])

  const indiceLocal = useMemo(() => crearIndice(archivos.keys()), [archivos])

  /** Dirección reproducible de un tema: primero el tema entero de tu carpeta; si no, su fragmento privado. */
  const resolver = useCallback(
    async (tema) => {
      const local = buscarArchivo(indiceLocal, tema)
      if (local) {
        const archivo = await archivos.get(local)()
        return { url: URL.createObjectURL(archivo), origen: 'carpeta', ruta: local, temporal: true }
      }
      return resolverPrivado(tema)
    },
    [indiceLocal, archivos, resolverPrivado]
  )

  const tieneArchivo = useCallback(
    (tema) => Boolean(buscarArchivo(indiceLocal, tema)) || tienePrivado(tema),
    [indiceLocal, tienePrivado]
  )

  const valor = useMemo(
    () => ({
      puedeElegirCarpeta,
      carpetas: carpetas.map((c) => c.name),
      totalLocal: archivos.size,
      estadoLocal,
      privado,
      hayFuente: archivos.size > 0 || privado.conTema > 0,
      anadirCarpeta,
      anadirArchivos,
      reconectar,
      olvidarCarpetas,
      resolver,
      tieneArchivo,
      ajustesAbiertos,
      abrirAjustes: () => setAjustesAbiertos(true),
      cerrarAjustes: () => setAjustesAbiertos(false),
    }),
    [ajustesAbiertos, carpetas, archivos, estadoLocal, privado, anadirCarpeta, anadirArchivos, reconectar, olvidarCarpetas, resolver, tieneArchivo]
  )

  return <MusicaContext.Provider value={valor}>{children}</MusicaContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useMusica() {
  const ctx = useContext(MusicaContext)
  if (!ctx) throw new Error('useMusica necesita <MusicaProvider>')
  return ctx
}
