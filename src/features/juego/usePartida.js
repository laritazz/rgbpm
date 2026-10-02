import { useCallback, useState } from 'react'
import { resumenPartida } from '../../lib/juego'
import { useRecord } from './useRecord'

/**
 * Lo común a todos los juegos: rondas, fase (ronda → resultado → … → final), puntos y récord.
 * Cada juego solo decide cómo se crean sus rondas y cómo se puntúa una respuesta.
 */
export function usePartida(juego, crearRondas) {
  const record = useRecord(juego)
  const [partida, setPartida] = useState(null) // { rondas, i, fase, resultados, resumen }

  const empezar = useCallback(() => {
    const rondas = crearRondas()
    if (rondas.length) setPartida({ rondas, i: 0, fase: 'ronda', resultados: [], resumen: null })
    return rondas.length
  }, [crearRondas])

  const responder = useCallback((resultado) => setPartida((p) => (p?.fase === 'ronda' ? { ...p, fase: 'resultado', resultados: [...p.resultados, resultado] } : p)), [])

  function siguiente() {
    const { rondas, i, resultados } = partida
    if (i + 1 < rondas.length) return setPartida({ ...partida, i: i + 1, fase: 'ronda' })
    // El resumen se calcula antes de apuntar: si no, el récord nuevo ya no contaría como nuevo
    const resumen = resumenPartida(resultados, record.mejor)
    record.apuntar(resumen.total, resumen.maximo, { rondas: resultados.length, clavados: resumen.clavados })
    setPartida({ ...partida, fase: 'final', resumen })
  }

  const ronda = partida ? partida.rondas[partida.i] : null
  const resultado = partida?.fase === 'resultado' ? partida.resultados.at(-1) : null
  const puntos = partida ? partida.resultados.reduce((s, r) => s + r.puntos, 0) : 0
  return { partida, ronda, resultado, puntos, record, empezar, responder, siguiente, salir: () => setPartida(null) }
}
