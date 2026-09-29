import { useState } from 'react'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { useSoundCloud } from '../../hooks/useSoundCloud'
import { colorBpm, franjaDe } from '../../lib/color'
import { bpmDeTexto, bpmEnSesion, portadaGrande } from '../../lib/sesiones'
import './Radio.css'

const PERFIL = 'https://soundcloud.com/laritazz'
const REPRODUCTOR = `https://w.soundcloud.com/player/?url=${encodeURIComponent(PERFIL)}&color=%23ff66c4&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`

/**
 * Radio: mis sesiones de SoundCloud sonando dentro de RGBPM.
 * El BPM sale de la descripción de cada sesión y avanza con ella: la mascota cambia de color mientras suena.
 */
export default function Radio() {
  const { iframe, listo, sonando, sonidos, actual, progreso, error, alternar, saltar } = useSoundCloud()
  const [drop, setDrop] = useState(null)

  const rango = bpmDeTexto(`${actual?.title ?? ''}\n${actual?.description ?? ''}`)
  const bpm = bpmEnSesion(rango, progreso)
  const [nombre, artistas] = (actual?.title ?? '').split('|').map((s) => s.trim())

  return (
    <main className="radio" style={{ '--color': bpm ? colorBpm(bpm) : '#333333' }}>
      <section className="radio__escenario" aria-label="Sonando">
        <header className="radio__titulo">
          <span className="etiqueta-seccion">{sonando ? 'Sonando' : listo ? 'Radio Laritazz' : 'Conectando con SoundCloud…'}</span>
          <h1>{nombre || 'Mis sesiones'}</h1>
          {artistas && <p>{artistas}</p>}
        </header>

        <MascotaEscena bpm={bpm} tocando={sonando} drop={drop} tamano={440} />

        <dl className="radio__datos">
          <div>
            <dt>Tempo</dt>
            <dd>{bpm ? `${Math.round(bpm)} BPM` : '—'}</dd>
          </div>
          <div>
            <dt>Color</dt>
            <dd>{bpm ? franjaDe(bpm).nombre : '—'}</dd>
          </div>
          <div>
            <dt>Rango del set</dt>
            <dd>{rango ? `${rango.desde}–${rango.hasta}` : '—'}</dd>
          </div>
        </dl>
      </section>

      <aside className="radio__lateral">
        <div className="radio__mandos">
          <button className="boton boton--blanco" onClick={alternar} disabled={!listo}>
            {sonando ? 'Pausa' : 'Play'}
          </button>
          <button className="boton boton--drop" onClick={() => setDrop(performance.now())} disabled={!sonando}>
            ¡Drop!
          </button>
        </div>

        {error && <p role="alert">{error}</p>}

        <ul className="radio__sesiones">
          {sonidos.map((s, i) => {
            const r = bpmDeTexto(`${s.title ?? ''}\n${s.description ?? ''}`)
            const elegida = actual?.id === s.id
            return (
              <li key={s.id}>
                <button className={`radio__sesion${elegida ? ' radio__sesion--elegida' : ''}`} onClick={() => saltar(i)} aria-pressed={elegida}>
                  {s.artwork_url ? (
                    <img src={portadaGrande(s.artwork_url)} alt="" loading="lazy" />
                  ) : (
                    <span className="radio__sin-portada" style={{ background: r ? colorBpm((r.desde + r.hasta) / 2) : '#333' }} />
                  )}
                  <span className="radio__sesion-texto">
                    <strong>{(s.title ?? 'Cargando…').split('|')[0]}</strong>
                    <small>{r ? `${r.desde}–${r.hasta} BPM` : 'Sin BPM'}</small>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* El reproductor oficial se queda a la vista: así lo piden las condiciones de SoundCloud */}
        <iframe ref={iframe} className="radio__widget" title="Reproductor de SoundCloud" src={REPRODUCTOR} allow="autoplay; encrypted-media" />
      </aside>
    </main>
  )
}
