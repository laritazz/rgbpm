// Ritmo sintetizado para jugar aunque el tema no tenga audio: bombo y charles, palmas
// y, si le das una clave, su acorde y su bajo (así también se juega a los tonos).
// Programa los golpes por adelantado con el reloj del audio: suena exacto aunque la pantalla vaya lenta.
import { openAPc } from '../../lib/claves'

const DO3 = 130.81

/**
 * @param bpm     tempo de salida (se puede cambiar en marcha con cambiarBpm)
 * @param clave   si la hay, suena su acorde en cada compás
 * @param sonido  'bombo' (bombo y charles) o 'palmas'
 * @param lado    −1 izquierda … 1 derecha
 * @returns { parar, cambiarBpm, ultimoGolpe } — ultimoGolpe en ms del reloj de performance.now
 */
export function iniciarRitmo(bpm, { clave = null, sonido = 'bombo', lado = 0, volumen = 1 } = {}) {
  const Contexto = window.AudioContext || window.webkitAudioContext
  if (!Contexto) return { parar() {}, cambiarBpm() {}, ultimoGolpe: () => null }
  const ctx = new Contexto()
  const salida = ctx.createGain()
  salida.gain.value = volumen
  if (ctx.createStereoPanner) {
    const panorama = ctx.createStereoPanner()
    panorama.pan.value = lado
    salida.connect(panorama).connect(ctx.destination)
  } else {
    salida.connect(ctx.destination)
  }

  let tempo = bpm
  let siguiente = ctx.currentTime + 0.12
  let n = 0
  const golpes = [] // tiempos del audio de los últimos golpes programados

  const envolvente = (nodo, t, pico, dura) => {
    nodo.gain.setValueAtTime(0.0001, t)
    nodo.gain.exponentialRampToValueAtTime(pico, t + 0.005)
    nodo.gain.exponentialRampToValueAtTime(0.0001, t + dura)
  }

  const bombo = (t) => {
    const osc = ctx.createOscillator()
    const vol = ctx.createGain()
    osc.frequency.setValueAtTime(140, t)
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12)
    envolvente(vol, t, 0.9, 0.28)
    osc.connect(vol).connect(salida)
    osc.start(t)
    osc.stop(t + 0.3)
  }

  const ruido = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
  const datos = ruido.getChannelData(0)
  for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1
  const rafaga = (t, { tipo, frecuencia, pico, dura }) => {
    const fuente = ctx.createBufferSource()
    const filtro = ctx.createBiquadFilter()
    const vol = ctx.createGain()
    fuente.buffer = ruido
    filtro.type = tipo
    filtro.frequency.value = frecuencia
    envolvente(vol, t, pico, dura)
    fuente.connect(filtro).connect(vol).connect(salida)
    fuente.start(t)
    fuente.stop(t + dura + 0.02)
  }
  const charles = (t) => rafaga(t, { tipo: 'highpass', frecuencia: 7000, pico: 0.25, dura: 0.05 })
  const palma = (t) => {
    rafaga(t, { tipo: 'bandpass', frecuencia: 1400, pico: 0.8, dura: 0.12 })
    rafaga(t + 0.012, { tipo: 'bandpass', frecuencia: 1100, pico: 0.5, dura: 0.1 })
  }

  // Acorde de la clave: fundamental, tercera (menor o mayor) y quinta, y el bajo en la fundamental
  const raiz = clave ? DO3 * 2 ** (openAPc(clave.open, clave.menor) / 12) : null
  const nota = (t, frecuencia, forma, pico, dura) => {
    const osc = ctx.createOscillator()
    const vol = ctx.createGain()
    osc.type = forma
    osc.frequency.value = frecuencia
    vol.gain.setValueAtTime(0.0001, t)
    vol.gain.exponentialRampToValueAtTime(pico, t + 0.04)
    vol.gain.exponentialRampToValueAtTime(0.0001, t + dura)
    osc.connect(vol).connect(salida)
    osc.start(t)
    osc.stop(t + dura + 0.05)
  }
  const acorde = (t, compas) => {
    for (const semitonos of [0, clave.menor ? 3 : 4, 7]) nota(t, raiz * 2 * 2 ** (semitonos / 12), 'triangle', 0.09, compas * 0.95)
  }

  const reloj = setInterval(() => {
    while (siguiente < ctx.currentTime + 0.2) {
      const golpe = 60 / tempo
      if (sonido === 'palmas') palma(siguiente)
      else {
        bombo(siguiente)
        charles(siguiente + golpe / 2)
      }
      if (raiz) {
        if (n % 4 === 0) acorde(siguiente, golpe * 4)
        if (n % 2 === 0) nota(siguiente, raiz / 2, 'sine', 0.35, golpe * 0.9)
      }
      golpes.push(siguiente)
      if (golpes.length > 8) golpes.shift()
      siguiente += golpe
      n++
    }
  }, 25)

  return {
    parar() {
      clearInterval(reloj)
      ctx.close().catch(() => {})
    },
    cambiarBpm(nuevo) {
      tempo = Math.max(40, Math.min(240, nuevo))
    },
    ultimoGolpe() {
      const ahora = ctx.currentTime
      const sonado = golpes.filter((t) => t <= ahora).at(-1)
      return sonado == null ? null : performance.now() - (ahora - sonado) * 1000
    },
  }
}
