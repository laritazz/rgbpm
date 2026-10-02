import { useMemo } from 'react'
import Cartel from '../../components/Cartel'
import Mascota from '../../components/marca/Mascota'
import { cargar } from '../../app/pantallas'
import { useUso } from '../../hooks/useUso'
import { PLANO_JUEGO } from '../../lib/composicion'
import { ROSA } from '../../lib/mascota'
import { escalasPorUso } from '../../lib/uso'
import { JUEGOS } from './juegos'
import { useRecords } from './useRecord'
import './Juego.css'

const IDS = JUEGOS.map((j) => j.id)
const CUERPO = { bpm: 140, tocando: true }

/**
 * Juego: el mismo cartel del inicio, al revés: fondo negro y círculos rosas.
 * Cada círculo es un juego con tu récord; crece cuanto más lo juegas.
 */
export default function Juego() {
  const { records, nube } = useRecords(IDS)
  const uso = useUso()
  const escalas = useMemo(() => escalasPorUso(uso, IDS, { prefijo: 'juego:' }), [uso])
  const items = useMemo(() => JUEGOS.map((j) => ({ ...j, dato: records[j.id]?.mejor ? `Récord ${records[j.id].mejor}` : 'Jugar' })), [records])
  const partidas = Object.values(records).reduce((s, r) => s + (r?.partidas ?? 0), 0)

  return (
    <main className="juego">
      <header className="juego__cabecera">
        <h1>Juego</h1>
        <p>
          {partidas ? `${partidas} ${partidas === 1 ? 'partida' : 'partidas'}` : 'Aprende a mezclar jugando'}
          {nube && ' · récords en la nube'}
        </p>
      </header>
      <Cartel
        plano={PLANO_JUEGO}
        items={items}
        escalas={escalas}
        entrada={ROSA}
        arriba={130}
        etiqueta="Juegos"
        className="cartel-zona--juego"
        alPasar={(j) => cargar[`juego_${j.id}`]?.().catch(() => {})}
        cuerpo={CUERPO}
        mascota={(mira) => <Mascota bpm={CUERPO.bpm} tocando variante="rosa" soloCara tamano="100%" mira={mira} etiqueta="Mascota" />}
      />
    </main>
  )
}
