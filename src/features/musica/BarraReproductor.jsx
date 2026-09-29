import Mascota from '../../components/marca/Mascota'
import { colorBpm } from '../../lib/color'
import { useMusica } from './MusicaContext'
import { useReproductor, useTiempo } from './ReproductorContext'

const reloj = (s) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

/** Barra fija abajo: lo que suena, en cualquier pantalla. */
export default function BarraReproductor() {
  const { tema, estado, sonando, origen, alternar, buscar } = useReproductor()
  const { tiempo, duracion } = useTiempo()
  const { abrirAjustes } = useMusica()
  if (!tema) return null

  const color = colorBpm(tema.bpm)
  const sinArchivo = estado === 'sin-archivo' || estado === 'error'

  return (
    <section className="barra" aria-label="Reproductor" style={{ '--color': color, '--avance': duracion ? tiempo / duracion : 0 }}>
      <Mascota bpm={tema.bpm} tocando={sonando} variante="icono" tamano={48} etiqueta="" />
      <div className="barra__tema">
        <strong>{tema.titulo}</strong>
        <span>
          {tema.artista}
          {tema.bpm ? ` · ${tema.bpm} BPM` : ''}
          {tema.clave ? ` · ${tema.clave.id}` : ''}
        </span>
      </div>

      {sinArchivo ? (
        <p className="barra__aviso">
          {estado === 'error' ? 'Este archivo no se puede reproducir aquí.' : 'No encuentro el archivo de este tema.'}{' '}
          <button onClick={abrirAjustes}>Tu música</button>
        </p>
      ) : (
        <>
          <button className="barra__play" onClick={alternar} aria-label={sonando ? 'Pausa' : 'Reproducir'} disabled={estado === 'cargando' && !duracion}>
            {sonando ? (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
            )}
          </button>
          <div className="barra__tiempo">
            <span>{reloj(tiempo)}</span>
            <input type="range" min="0" max={duracion || 0} step="0.1" value={tiempo} onChange={(e) => buscar(Number(e.target.value))} aria-label="Posición" />
            <span>{reloj(duracion)}</span>
          </div>
          <span className="barra__origen">{estado === 'cargando' ? 'Cargando…' : origen === 'servidor' ? 'Servidor' : 'Tu carpeta'}</span>
        </>
      )}
    </section>
  )
}
