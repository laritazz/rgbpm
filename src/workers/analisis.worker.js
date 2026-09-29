// Hilo aparte para el análisis: la FFT de 14 s de audio no bloquea la animación de la mascota
import { analizarTramo } from '../lib/escucha'

self.onmessage = ({ data: { id, senal, frecuencia } }) => {
  self.postMessage({ id, lectura: analizarTramo(senal, frecuencia) })
}
