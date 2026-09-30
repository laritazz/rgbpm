import { useMemo } from 'react'
import Vinilo from '../../components/marca/Vinilo'
import { compatibles } from '../../lib/armonia'
import { colorBpm, franjaDe } from '../../lib/color'
import { animoDe } from '../../lib/mascota'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import BotonSet from '../sets/BotonSet'
import RuedaMini from './RuedaMini'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'

const minutos = (s) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '—')

/** Panel derecho: el tema elegido gira en el vinilo y la mascota propone con qué mezclarlo. */
export default function PanelSonando({ tema, temas, alElegir, alCerrar }) {
  const rep = useReproductor()
  const { hayFuente, abrirAjustes } = useMusica()
  const { etiqueta, notacion, opciones: ajustes, corregir, tolerancia } = useAjustesArmonia()
  const opciones = useMemo(() => (tema ? compatibles(tema, temas, 6, ajustes) : []), [tema, temas, ajustes])

  if (!tema) {
    return (
      <aside className="sonando sonando--vacio" aria-label="Tema elegido">
        <Vinilo bpm={124} tocando={false} tamano={220} />
        <p>Elige un tema y te digo con qué mezclarlo.</p>
      </aside>
    )
  }

  const esEste = rep.tema?.id === tema.id
  const tocando = esEste && rep.sonando
  const animo = animoDe(tema.bpm)
  const mejor = opciones[0]

  return (
    <aside className="sonando" aria-label="Tema elegido" style={{ '--ambiente': colorBpm(tema.bpm) }}>
      <button className="sonando__cerrar" onClick={alCerrar} aria-label="Cerrar panel">
        ✕
      </button>

      <div className="sonando__plato">
        <Vinilo bpm={tema.bpm} tocando={tocando} tamano={236} />
        {hayFuente ? (
          <button className="sonando__play" onClick={() => rep.reproducir(tema)} aria-pressed={tocando}>
            {tocando ? 'Pausa' : esEste && rep.estado === 'cargando' ? 'Cargando…' : 'Play'}
          </button>
        ) : (
          <button className="sonando__play" onClick={abrirAjustes}>
            Conectar música
          </button>
        )}
      </div>

      <header className="sonando__ficha">
        <span className="etiqueta-seccion">
          {animo.nombre} · franja {franjaDe(tema.bpm ?? 0).nombre}
        </span>
        <h2>{tema.titulo}</h2>
        <p>{tema.artista}</p>
        <dl>
          <div>
            <dt>BPM</dt>
            <dd>{tema.bpm ?? '—'}</dd>
          </div>
          <div>
            <dt>Clave</dt>
            <dd>{tema.clave ? (notacion === 'camelot' ? `${tema.clave.camelot} · ${tema.clave.id}` : `${tema.clave.id} · ${tema.clave.camelot}`) : '—'}</dd>
          </div>
          <div>
            <dt>Tono</dt>
            <dd>{tema.clave?.nombre ?? '—'}</dd>
          </div>
          <div>
            <dt>Dura</dt>
            <dd>{minutos(tema.duracion)}</dd>
          </div>
        </dl>
        <div className="sonando__acciones">
          <BotonSet tema={tema} />
        </div>
      </header>

      <div className="sonando__rueda">
        <RuedaMini semilla={tema.clave} corregir={corregir} etiqueta={etiqueta} />
        <p>
          En rosa, su clave. En color, con qué mezcla: cada color es una de tus siete categorías.
        </p>
      </div>

      <section className="sonando__mezcla" aria-labelledby="titulo-mezcla">
        <h3 id="titulo-mezcla" className="etiqueta-seccion">
          Mezcla con
        </h3>
        {opciones.length === 0 && <p className="sonando__nada">{tema.clave ? `Nada en ±${tolerancia} % de tempo que case de clave.` : 'Sin clave no puedo recomendar: analízalo en Traktor.'}</p>}
        <ul>
          {opciones.map((o) => (
            <li key={o.tema.id}>
              <button onClick={() => alElegir(o.tema.id)} className="sonando__opcion">
                <span className="sonando__muestra" style={{ background: colorBpm(o.tema.bpm) }} aria-hidden="true" />
                <span className="sonando__opcion-texto">
                  <span className="sonando__opcion-titulo">{o.tema.titulo}</span>
                  <span className="sonando__opcion-datos">
                    <span className="sonando__categoria" style={{ '--cat': o.categoria.color }}>
                      {o.categoria.nombre}
                    </span>
                    {etiqueta(o.tema.clave)} · {o.bpm.porcentaje >= 0 ? '+' : ''}
                    {o.bpm.porcentaje.toFixed(1)} %{o.bpm.relacion !== 1 ? ' (doble/mitad)' : ''}
                  </span>
                </span>
                <span className="sonando__nota">{o.nota}</span>
              </button>
              <BotonSet tema={o.tema} compacto />
            </li>
          ))}
        </ul>
      </section>

      <p className="sonando__consejo">
        {mejor ? (
          <>
            <strong>{mejor.categoria.nombre}:</strong> {mejor.categoria.texto.toLowerCase()}. Con «{mejor.tema.titulo}» tienes {mejor.nota}/100.
          </>
        ) : (
          animo.texto
        )}
      </p>
    </aside>
  )
}
