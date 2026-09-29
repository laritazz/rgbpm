// Worklet de captura: corre en el hilo de audio y manda al hilo principal bloques de 4096 muestras.
class Captura extends AudioWorkletProcessor {
  constructor() {
    super()
    this.bloque = new Float32Array(4096)
    this.lleno = 0
  }

  process(entradas) {
    const canal = entradas[0]?.[0]
    if (canal) {
      for (let i = 0; i < canal.length; i++) {
        this.bloque[this.lleno++] = canal[i]
        if (this.lleno === this.bloque.length) {
          this.port.postMessage(this.bloque)
          this.bloque = new Float32Array(4096)
          this.lleno = 0
        }
      }
    }
    return true
  }
}

registerProcessor('captura', Captura)
