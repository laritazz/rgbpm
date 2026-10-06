import { useCallback, useEffect, useRef, useState } from 'react'
import { certeza as medirCerteza, esEstable } from '../lib/escucha'

const PRIMERA = 6 // s de audio antes de la primera lectura
const CADA = 2 // s entre lecturas
const VENTANA = 14 // s que se analizan cada vez (los más recientes)
const MINIMO = 8 // no se da por fijado antes de esto
const MAXIMO = 20 // si no se aclara, se queda con la última lectura

/**
 * Escucha continua por el micro, como Shazam: primera lectura a los 6 s,
 * la afina cada 2 s y para sola cuando tres lecturas coinciden.
 * El cálculo va en un Web Worker y el audio no se guarda ni sale del dispositivo.
 * estado: parado · pidiendo · escuchando · listo · error
 * certeza (0–1): cuánto se fía de lo que oye; la pantalla la convierte en gris → gotas → color (lib/escucha: faseCerteza).
 */
export function useEscucha({ alTerminar } = {}) {
  const [estado, setEstado] = useState('parado')
  const [nivel, setNivel] = useState(0)
  const [segundos, setSegundos] = useState(0)
  const [lectura, setLectura] = useState(null)
  const [certeza, setCerteza] = useState(0)
  const [fijado, setFijado] = useState(false)
  const [fijadoEn, setFijadoEn] = useState(null) // ms (performance.now): dispara el drop de la mascota
  const [error, setError] = useState(null)
  const recursos = useRef(null)
  // El aviso de fin se lee de una ref: cambiarlo no reinicia la escucha
  const avisar = useRef(alTerminar)
  useEffect(() => {
    avisar.current = alTerminar
  }, [alTerminar])

  const cerrar = useCallback(() => {
    const r = recursos.current
    if (!r) return
    cancelAnimationFrame(r.raf)
    clearInterval(r.reloj)
    r.trabajador.terminate()
    r.flujo.getTracks().forEach((pista) => pista.stop())
    r.ctx.close()
    recursos.current = null
    setNivel(0)
  }, [])

  useEffect(() => cerrar, [cerrar])

  const escuchar = useCallback(async () => {
    cerrar()
    setLectura(null)
    setCerteza(0)
    setFijado(false)
    setFijadoEn(null)
    setError(null)
    setSegundos(0)
    setEstado('pidiendo')
    try {
      // Sin cancelación de eco ni control de ganancia: queremos la música tal cual suena
      const flujo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      const ctx = new AudioContext()
      // El worklet vive en public/: se sirve tal cual, sin pasar por el empaquetador
      await ctx.audioWorklet.addModule(`${import.meta.env.BASE_URL}captura-worklet.js`)
      const fuente = ctx.createMediaStreamSource(flujo)
      const captura = new AudioWorkletNode(ctx, 'captura')
      const analizador = ctx.createAnalyser()
      analizador.fftSize = 1024
      fuente.connect(captura)
      fuente.connect(analizador)
      // Algunos navegadores solo procesan lo que llega a la salida: se conecta en silencio
      const silencio = ctx.createGain()
      silencio.gain.value = 0
      captura.connect(silencio).connect(ctx.destination)

      const trabajador = new Worker(new URL('../workers/analisis.worker.js', import.meta.url), { type: 'module' })
      const fs = ctx.sampleRate
      const trozos = []
      let recogidas = 0
      let ocupado = false
      const lecturas = []
      const r = { flujo, ctx, trabajador, raf: 0, reloj: 0 }
      recursos.current = r

      captura.port.onmessage = ({ data }) => {
        trozos.push(data)
        recogidas += data.length
      }

      const terminar = (conFijado) => {
        setFijado(conFijado)
        if (conFijado) setFijadoEn(performance.now())
        setEstado('listo')
        cerrar()
        const ultima = lecturas.filter(Boolean).at(-1)
        if (ultima) avisar.current?.(ultima, conFijado)
      }

      trabajador.onmessage = ({ data }) => {
        ocupado = false
        if (!recursos.current) return
        lecturas.push(data.lectura)
        if (data.lectura) setLectura(data.lectura)
        setCerteza(medirCerteza(lecturas))
        const t = recogidas / fs
        if (t >= MINIMO && esEstable(lecturas)) terminar(true)
        else if (t >= MAXIMO) {
          if (lecturas.some(Boolean)) terminar(false)
          else {
            setError('Casi no se oye nada. Acerca el móvil al altavoz.')
            setEstado('error')
            cerrar()
          }
        }
      }

      // Cada 2 s, los últimos 14 s de audio al trabajador (si no está ya pensando)
      r.reloj = setInterval(() => {
        const t = recogidas / fs
        setSegundos(t)
        if (!lecturas.some(Boolean)) setCerteza(medirCerteza(lecturas, t / PRIMERA))
        if (ocupado || t < PRIMERA) return
        const tramo = Math.min(recogidas, Math.round(VENTANA * fs))
        const senal = new Float32Array(tramo)
        let pos = tramo
        for (let i = trozos.length - 1; i >= 0 && pos > 0; i--) {
          const trozo = trozos[i]
          const n = Math.min(trozo.length, pos)
          senal.set(trozo.subarray(trozo.length - n), pos - n)
          pos -= n
        }
        ocupado = true
        trabajador.postMessage({ id: t, senal, frecuencia: fs }, [senal.buffer])
      }, CADA * 1000)

      // Nivel del micro para el ecualizador de la mascota, a ritmo de pantalla
      const muestra = new Float32Array(analizador.fftSize)
      const medir = () => {
        analizador.getFloatTimeDomainData(muestra)
        const v = Math.sqrt(muestra.reduce((s, x) => s + x * x, 0) / muestra.length)
        setNivel(Math.min(1, v * 6))
        if (recursos.current) recursos.current.raf = requestAnimationFrame(medir)
      }
      r.raf = requestAnimationFrame(medir)
      setEstado('escuchando')
    } catch (e) {
      cerrar()
      setError(e.name === 'NotAllowedError' ? 'Necesito permiso para usar el micrófono.' : 'Este navegador no me deja escuchar.')
      setEstado('error')
    }
  }, [cerrar])

  const parar = useCallback(() => {
    cerrar()
    setEstado((e) => (lectura && e === 'escuchando' ? 'listo' : 'parado'))
  }, [cerrar, lectura])

  return { estado, nivel, segundos, maximo: MAXIMO, lectura, certeza, fijado, fijadoEn, error, escuchar, parar }
}
