import { useCallback, useEffect, useRef, useState } from 'react'
import { claveDeAudio } from '../lib/tonalidad'
import { bpmDeAudio } from '../lib/tempo'

/**
 * Escucha por el micrófono durante unos segundos y calcula BPM y clave en el propio navegador.
 * El audio no se guarda ni sale del dispositivo.
 * estado: parado · pidiendo · escuchando · analizando · listo · error
 */
export function useEscucha(segundos = 12) {
  const [estado, setEstado] = useState('parado')
  const [nivel, setNivel] = useState(0)
  const [progreso, setProgreso] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const recursos = useRef(null)

  const cerrar = useCallback(() => {
    const r = recursos.current
    if (!r) return
    cancelAnimationFrame(r.raf)
    r.flujo.getTracks().forEach((pista) => pista.stop())
    r.ctx.close()
    recursos.current = null
  }, [])

  useEffect(() => cerrar, [cerrar])

  const escuchar = useCallback(async () => {
    cerrar()
    setResultado(null)
    setError(null)
    setProgreso(0)
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
      // Algunos navegadores solo procesan lo que llega a la salida: se conecta en silencio
      const silencio = ctx.createGain()
      silencio.gain.value = 0
      captura.connect(silencio).connect(ctx.destination)
      fuente.connect(analizador)

      const trozos = []
      const total = Math.round(segundos * ctx.sampleRate)
      let recogidas = 0
      recursos.current = { flujo, ctx, raf: 0 }

      captura.port.onmessage = ({ data }) => {
        trozos.push(data)
        recogidas += data.length
        if (recogidas >= total && recursos.current) terminar()
      }

      // Nivel del micro para el ecualizador de la mascota, a ritmo de pantalla
      const muestra = new Float32Array(analizador.fftSize)
      const medir = () => {
        analizador.getFloatTimeDomainData(muestra)
        const rms = Math.sqrt(muestra.reduce((s, v) => s + v * v, 0) / muestra.length)
        setNivel(Math.min(1, rms * 6))
        setProgreso(Math.min(1, recogidas / total))
        if (recursos.current) recursos.current.raf = requestAnimationFrame(medir)
      }
      recursos.current.raf = requestAnimationFrame(medir)
      setEstado('escuchando')

      function terminar() {
        const frecuencia = ctx.sampleRate
        cerrar()
        setNivel(0)
        setProgreso(1)
        setEstado('analizando')
        // Un respiro para que se pinte «analizando» antes del cálculo
        setTimeout(() => {
          const senal = new Float32Array(recogidas)
          let pos = 0
          for (const t of trozos) {
            senal.set(t, pos)
            pos += t.length
          }
          const casiNada = Math.sqrt(senal.reduce((s, v) => s + v * v, 0) / senal.length) < 0.003
          if (casiNada) {
            setError('Casi no se oye nada. Acerca el móvil al altavoz.')
            setEstado('error')
            return
          }
          setResultado({ tempo: bpmDeAudio(senal, frecuencia), tono: claveDeAudio(senal, frecuencia) })
          setEstado('listo')
        }, 50)
      }
    } catch (e) {
      cerrar()
      setError(e.name === 'NotAllowedError' ? 'Necesito permiso para usar el micrófono.' : 'Este navegador no me deja escuchar.')
      setEstado('error')
    }
  }, [cerrar, segundos])

  const parar = useCallback(() => {
    cerrar()
    setNivel(0)
    setEstado('parado')
  }, [cerrar])

  return { estado, nivel, progreso, resultado, error, escuchar, parar }
}
