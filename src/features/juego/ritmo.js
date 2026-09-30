// Ritmo sintetizado (bombo y charles) para jugar aunque el tema no tenga audio.
// Programa los golpes por adelantado con el reloj del audio: suena exacto aunque la pantalla vaya lenta.

export function iniciarRitmo(bpm) {
  const Contexto = window.AudioContext || window.webkitAudioContext
  if (!Contexto) return { parar() {} }
  const ctx = new Contexto()
  const golpe = 60 / bpm
  let siguiente = ctx.currentTime + 0.12
  let n = 0

  const bombo = (t) => {
    const osc = ctx.createOscillator()
    const vol = ctx.createGain()
    osc.frequency.setValueAtTime(140, t)
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12)
    vol.gain.setValueAtTime(0.9, t)
    vol.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
    osc.connect(vol).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.3)
  }

  const ruido = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
  const datos = ruido.getChannelData(0)
  for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1
  const charles = (t) => {
    const fuente = ctx.createBufferSource()
    const filtro = ctx.createBiquadFilter()
    const vol = ctx.createGain()
    fuente.buffer = ruido
    filtro.type = 'highpass'
    filtro.frequency.value = 7000
    vol.gain.setValueAtTime(0.25, t)
    vol.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    fuente.connect(filtro).connect(vol).connect(ctx.destination)
    fuente.start(t)
  }

  const reloj = setInterval(() => {
    while (siguiente < ctx.currentTime + 0.2) {
      bombo(siguiente)
      charles(siguiente + golpe / 2)
      siguiente += golpe
      n++
    }
  }, 25)

  return {
    parar() {
      clearInterval(reloj)
      ctx.close().catch(() => {})
    },
    golpes: () => n,
  }
}
