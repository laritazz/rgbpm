import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useMusica } from './MusicaContext'

const ReproductorContext = createContext(null)
// El tiempo cambia varias veces por segundo: va aparte para que solo se repinte quien lo muestra
const TiempoContext = createContext({ tiempo: 0, duracion: 0 })

export const FUNDIDO = 10 // segundos de fundido cruzado en la radio

/**
 * Un solo reproductor para toda la app, con dos «platos» (<audio>) para poder fundir
 * el tema que sale con el que entra, como en la Radio de RGBPM original.
 * estado: parado · cargando · sonando · pausa · sin-archivo · error
 */
export function ReproductorProvider({ children }) {
  const { resolver } = useMusica()
  const platoA = useRef(null)
  const platoB = useRef(null)
  const activo = useRef(0) // qué plato manda (0 = A, 1 = B)
  const temporales = useRef([null, null]) // direcciones de archivos locales, para soltarlas
  const peticion = useRef(0)
  const fundido = useRef(null)
  const preparando = useRef(false) // evita preparar dos veces el mismo salto

  const [tema, setTema] = useState(null)
  const [estado, setEstado] = useState('parado')
  const [tiempo, setTiempo] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const [origen, setOrigen] = useState(null)
  const [cola, setCola] = useState([])
  const [indice, setIndice] = useState(-1)
  const [fundiendo, setFundiendo] = useState(false)

  // Copia de lo último para que las acciones no cambien en cada render
  const actual = useRef({ tema: null, estado: 'parado', cola: [], indice: -1 })
  useEffect(() => {
    actual.current = { tema, estado, cola, indice }
  }, [tema, estado, cola, indice])

  const plato = (i) => (i === 0 ? platoA.current : platoB.current)

  const soltar = (i) => {
    if (temporales.current[i]) URL.revokeObjectURL(temporales.current[i])
    temporales.current[i] = null
  }

  const cortarFundido = () => {
    clearInterval(fundido.current)
    fundido.current = null
    setFundiendo(false)
  }

  useEffect(
    () => () => {
      clearInterval(fundido.current)
      soltar(0)
      soltar(1)
    },
    []
  )

  // Pide el audio de un tema y lo deja cargado en un plato
  const cargar = useCallback(
    async (i, t) => {
      const fuente = await resolver(t).catch(() => null)
      if (!fuente) return null
      soltar(i)
      if (fuente.temporal) temporales.current[i] = fuente.url
      plato(i).src = fuente.url
      return fuente
    },
    [resolver]
  )

  const reproducir = useCallback(
    async (nuevo, { desdeCola = false } = {}) => {
      const el = plato(activo.current)
      const { tema: previo, estado: antes } = actual.current
      // Mismo tema: pausa o sigue
      if (!desdeCola && previo?.id === nuevo.id && el.src && antes !== 'error') {
        if (el.paused) el.play().catch(() => setEstado('error'))
        else el.pause()
        return
      }
      cortarFundido()
      plato(1 - activo.current).pause()
      const mia = ++peticion.current // si llega otro clic mientras carga, gana el último
      setTema(nuevo)
      setTiempo(0)
      setDuracion(nuevo.duracion ?? 0)
      setEstado('cargando')
      if (!desdeCola) {
        setCola([])
        setIndice(-1)
      }
      const fuente = await cargar(activo.current, nuevo)
      if (mia !== peticion.current) return
      if (!fuente) {
        el.pause()
        setOrigen(null)
        setEstado('sin-archivo')
        return
      }
      setOrigen(fuente.origen)
      el.volume = 1
      el.play().catch((e) => e.name !== 'AbortError' && setEstado('error'))
    },
    [cargar]
  )

  /** Pasa al siguiente de la cola fundiendo los dos platos. Si un tema no tiene archivo, lo salta. */
  const siguiente = useCallback(async () => {
    const { cola: lista, indice: i } = actual.current
    let destino = i + 1
    if (destino >= lista.length || fundido.current || preparando.current) return
    const sale = activo.current
    const entra = 1 - sale
    const mia = ++peticion.current
    preparando.current = true
    let fuente = null
    try {
      while (destino < lista.length) {
        fuente = await cargar(entra, lista[destino])
        if (fuente) break
        destino++
      }
    } finally {
      preparando.current = false
    }
    if (mia !== peticion.current || !fuente) return

    const eSale = plato(sale)
    const eEntra = plato(entra)
    eEntra.volume = 0
    await eEntra.play().catch(() => {})
    activo.current = entra
    actual.current = { ...actual.current, indice: destino, tema: lista[destino] }
    setIndice(destino)
    setTema(lista[destino])
    setOrigen(fuente.origen)
    setTiempo(0)
    // Sus metadatos llegaron mientras aún no mandaba: se leen ahora
    setDuracion(Number.isFinite(eEntra.duration) ? eEntra.duration : (lista[destino].duracion ?? 0))
    setEstado('sonando')
    setFundiendo(true)

    // El fundido nunca dura más de lo que le queda al que sale.
    // setInterval y no requestAnimationFrame: sigue funcionando con la pestaña en segundo plano
    const queda = eSale.duration - eSale.currentTime
    const dura = Math.max(0.5, Math.min(FUNDIDO, Number.isFinite(queda) && queda > 0 ? queda : FUNDIDO)) * 1000
    const inicio = performance.now()
    const v0 = eSale.paused ? 0 : eSale.volume
    fundido.current = setInterval(() => {
      const x = Math.min(1, (performance.now() - inicio) / dura)
      // Curva de igual potencia: el volumen total no baja a mitad del fundido
      eEntra.volume = Math.sin((x * Math.PI) / 2)
      eSale.volume = v0 * Math.cos((x * Math.PI) / 2)
      if (x >= 1) {
        eSale.pause()
        soltar(sale)
        cortarFundido()
      }
    }, 50)
  }, [cargar])

  const ponerCola = useCallback(
    (lista, desde = 0) => {
      if (!lista.length) return
      actual.current = { ...actual.current, cola: lista, indice: desde }
      setCola(lista)
      setIndice(desde)
      reproducir(lista[desde], { desdeCola: true })
    },
    [reproducir]
  )

  const vaciarCola = useCallback(() => {
    setCola([])
    setIndice(-1)
  }, [])

  const alternar = useCallback(() => {
    const el = plato(activo.current)
    if (!el.src) return
    if (el.paused) el.play().catch(() => setEstado('error'))
    else {
      cortarFundido()
      plato(1 - activo.current).pause()
      el.pause()
    }
  }, [])

  const buscar = useCallback((segundos) => {
    const el = plato(activo.current)
    if (el?.src) el.currentTime = segundos
  }, [])

  // Solo el plato que manda informa a la app; el que sale se apaga en silencio
  const manda = (e) => e.currentTarget === plato(activo.current)
  const alAvanzar = (e) => {
    if (!manda(e)) return
    const el = e.currentTarget
    setTiempo(el.currentTime)
    const { cola: lista, indice: i } = actual.current
    if (lista.length && i < lista.length - 1 && !fundido.current && el.duration - el.currentTime <= FUNDIDO) siguiente()
  }
  const eventos = {
    onPlaying: (e) => manda(e) && setEstado('sonando'),
    onPause: (e) => manda(e) && setEstado((s) => (s === 'sin-archivo' || s === 'error' ? s : 'pausa')),
    onWaiting: (e) => manda(e) && setEstado('cargando'),
    onEnded: (e) => {
      if (!manda(e)) return
      const { cola: lista, indice: i } = actual.current
      if (i < lista.length - 1) siguiente()
      else setEstado('pausa')
    },
    onError: (e) => manda(e) && e.currentTarget.getAttribute('src') && setEstado('error'),
    onTimeUpdate: alAvanzar,
    onLoadedMetadata: (e) => manda(e) && setDuracion(e.currentTarget.duration),
  }

  const valor = useMemo(
    () => ({ tema, estado, sonando: estado === 'sonando', origen, cola, indice, fundiendo, reproducir, ponerCola, vaciarCola, siguiente, alternar, buscar }),
    [tema, estado, origen, cola, indice, fundiendo, reproducir, ponerCola, vaciarCola, siguiente, alternar, buscar]
  )
  const reloj = useMemo(() => ({ tiempo, duracion }), [tiempo, duracion])

  return (
    <ReproductorContext.Provider value={valor}>
      <TiempoContext.Provider value={reloj}>{children}</TiempoContext.Provider>
      {/* controlsList: sin botón de descarga en el reproductor del navegador */}
      <audio ref={platoA} preload="auto" controlsList="nodownload" {...eventos} />
      <audio ref={platoB} preload="auto" controlsList="nodownload" {...eventos} />
    </ReproductorContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useReproductor() {
  const ctx = useContext(ReproductorContext)
  if (!ctx) throw new Error('useReproductor necesita <ReproductorProvider>')
  return ctx
}

// oxlint-disable-next-line react/only-export-components
export const useTiempo = () => useContext(TiempoContext)
