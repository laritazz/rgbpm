import Mascota from '../../components/marca/Mascota'
import { IconoPausa, IconoPlay, IconoSiguiente } from '../../components/Iconos'
import { colorBpm } from '../../lib/color'
import { reloj } from '../../lib/formato'
import { useMusica } from './MusicaContext'
import { useReproductor, useTiempo } from './ReproductorContext'

/** Barra fija abajo: lo que suena, en cualquier pantalla. Al tocar el tema se abre a pantalla completa. */
export default function BarraReproductor({ alAbrir }) {
  const { tema, estado, sonando, origen, cola, indice, fundiendo, alternar, buscar, siguiente } = useReproductor()
  const { tiempo, duracion } = useTiempo()
  const { abrirAjustes } = useMusica()
  if (!tema) return null

  const sinArchivo = estado === 'sin-archivo' || estado === 'error'
  const haySiguiente = cola.length > 0 && indice < cola.length - 1

  return (
    <section className="barra" aria-label="Reproductor" style={{ '--color': colorBpm(tema.bpm), '--avance': duracion ? tiempo / duracion : 0 }}>
      <button className="barra__abrir" onClick={alAbrir} aria-label={`Abrir ${tema.titulo} a pantalla completa`}>
        <Mascota bpm={tema.bpm} tocando={sonando} variante="icono" tamano={48} etiqueta="" />
        <span className="barra__tema">
          <strong>{tema.titulo}</strong>
          <span>
            {tema.artista}
            {tema.bpm ? ` · ${tema.bpm} BPM` : ''}
            {tema.clave ? ` · ${tema.clave.id}` : ''}
          </span>
        </span>
      </button>

      {sinArchivo ? (
        <p className="barra__aviso">
          {estado === 'error' ? 'Este archivo no se puede reproducir aquí.' : 'No encuentro el archivo.'}{' '}
          <button onClick={abrirAjustes}>Tu música</button>
        </p>
      ) : (
        <>
          <button className="barra__play" onClick={alternar} aria-label={sonando ? 'Pausa' : 'Reproducir'} disabled={estado === 'cargando' && !duracion}>
            {sonando ? <IconoPausa /> : <IconoPlay />}
          </button>
          {haySiguiente && (
            <button className="barra__siguiente" onClick={siguiente} disabled={fundiendo} aria-label="Siguiente con fundido">
              <IconoSiguiente />
            </button>
          )}
          <div className="barra__tiempo">
            <span>{reloj(tiempo)}</span>
            <input type="range" min="0" max={duracion || 0} step="0.1" value={tiempo} onChange={(e) => buscar(Number(e.target.value))} aria-label="Posición" />
            <span>{reloj(duracion)}</span>
          </div>
          <span className="barra__origen">{estado === 'cargando' ? 'Cargando…' : fundiendo ? 'Mezclando…' : origen === 'privado' ? 'Fragmento' : 'Tu carpeta'}</span>
        </>
      )}
    </section>
  )
}
