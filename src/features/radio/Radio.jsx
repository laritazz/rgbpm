import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { TODAS_LAS_CLAVES } from '../../lib/claves'
import { colorBpm, franjaDe } from '../../lib/color'
import { generarRadio, sinRepetidos } from '../../lib/radio'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { useMusica } from '../musica/MusicaContext'
import { FUNDIDO, useReproductor } from '../musica/ReproductorContext'
import { useSet } from '../sets/SetContext'
import './Radio.css'

const SUBIDAS = [
  { valor: 0, nombre: 'Mantener el ritmo' },
  { valor: 10, nombre: 'Poco a poco (+10)' },
  { valor: 20, nombre: 'Bastante (+20)' },
  { valor: 35, nombre: 'A saco (+35)' },
]

/**
 * Radio: suena sola con tu música, tema tras tema y con fundido.
 * Encadena por armonía desde la clave que elijas y va subiendo el BPM.
 */
export default function Radio() {
  const { temas } = useBiblioteca()
  const musica = useMusica()
  const rep = useReproductor()
  const set = useSet()
  const navegar = useNavigate()
  const [drop, setDrop] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [ajustes, setAjustes] = useState(() => ({
    clave: rep.tema?.clave?.id ?? '1m',
    bpm: Math.round(rep.tema?.bpm ?? 120),
    subida: 10,
    cuantos: 15,
  }))

  // Solo cuenta lo que tiene audio, sin repetir el mismo tema
  const disponibles = useMemo(() => sinRepetidos(temas.filter(musica.tieneArchivo)), [temas, musica.tieneArchivo])
  const enRadio = rep.cola.length > 0
  const tema = enRadio ? rep.tema : null
  const bpm = tema?.bpm ?? null

  function montar(e) {
    e.preventDefault()
    const lista = generarRadio(disponibles, {
      semilla: TODAS_LAS_CLAVES.find((k) => k.id === ajustes.clave),
      bpmInicio: Number(ajustes.bpm),
      subida: Number(ajustes.subida),
      cuantos: Math.max(5, Math.min(60, Number(ajustes.cuantos))),
    })
    if (!lista.length) {
      setAviso('No encuentro temas con clave y BPM para montar la radio.')
      return
    }
    setAviso(`${lista.length} temas: de ${lista[0].clave.id} · ${lista[0].bpm} BPM a ${lista.at(-1).clave.id} · ${lista.at(-1).bpm} BPM.`)
    rep.ponerCola(lista)
  }

  const cambiar = (campo) => (e) => setAjustes((a) => ({ ...a, [campo]: e.target.value }))

  if (!musica.hayFuente) {
    return (
      <main className="radio radio--vacia">
        <MascotaEscena bpm={null} tamano={300} />
        <h1>Radio</h1>
        <p>Suena sola con tu música, encadenando por armonía. Primero dime dónde está tu música.</p>
        <button className="boton boton--rosa" onClick={musica.abrirAjustes}>
          Conectar tu música
        </button>
      </main>
    )
  }

  return (
    <main className="radio" style={{ '--color': bpm ? colorBpm(bpm) : '#333333' }}>
      <section className="radio__escenario" aria-label="Sonando">
        <header className="radio__titulo">
          <span className="etiqueta-seccion">{!enRadio ? 'Radio' : rep.fundiendo ? 'Mezclando…' : rep.sonando ? 'Sonando' : 'En pausa'}</span>
          <h1>{tema?.titulo ?? 'Tu radio'}</h1>
          <p>{tema ? tema.artista : `${disponibles.length.toLocaleString('es')} temas con audio listos para sonar.`}</p>
        </header>

        <MascotaEscena bpm={bpm} tocando={rep.sonando} drop={drop} tamano={440} />

        <dl className="radio__datos">
          <div>
            <dt>Tempo</dt>
            <dd>{bpm ? `${Math.round(bpm)} BPM` : '—'}</dd>
          </div>
          <div>
            <dt>Clave</dt>
            <dd>{tema?.clave ? `${tema.clave.id} · ${tema.clave.nombre}` : '—'}</dd>
          </div>
          <div>
            <dt>Color</dt>
            <dd>{bpm ? franjaDe(bpm).nombre : '—'}</dd>
          </div>
        </dl>
      </section>

      <aside className="radio__lateral">
        {enRadio && (
          <div className="radio__mandos">
            <button className="boton boton--blanco" onClick={rep.alternar}>
              {rep.sonando ? 'Pausa' : 'Play'}
            </button>
            <button className="boton boton--fantasma" onClick={rep.siguiente} disabled={rep.indice >= rep.cola.length - 1 || rep.fundiendo} title={`Salta al siguiente con un fundido de ${FUNDIDO} s`}>
              Siguiente
            </button>
            <button className="boton boton--drop" onClick={() => setDrop(performance.now())} disabled={!rep.sonando}>
              ¡Drop!
            </button>
          </div>
        )}

        <form className="radio__generador" onSubmit={montar}>
          <h2 className="etiqueta-seccion">{enRadio ? 'Montar otra' : 'Montar la radio'}</h2>
          <div className="radio__campos">
            <label>
              Empieza en
              <select value={ajustes.clave} onChange={cambiar('clave')}>
                {TODAS_LAS_CLAVES.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.id} · {k.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              a
              <input type="number" min="60" max="200" value={ajustes.bpm} onChange={cambiar('bpm')} /> BPM
            </label>
            <label>
              y sube
              <select value={ajustes.subida} onChange={cambiar('subida')}>
                {SUBIDAS.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input type="number" min="5" max="60" value={ajustes.cuantos} onChange={cambiar('cuantos')} /> temas
            </label>
          </div>
          <button className="boton boton--rosa">{enRadio ? 'Montar y poner' : 'Poner la radio'}</button>
          {aviso && (
            <p className="radio__aviso" role="status">
              {aviso}
            </p>
          )}
        </form>

        {enRadio && (
          <section aria-labelledby="titulo-cola">
            <div className="radio__cabecera-cola">
              <h2 id="titulo-cola" className="etiqueta-seccion">
                En cola · {rep.indice + 1} de {rep.cola.length}
              </h2>
              <span>
                <button
                  className="radio__vaciar"
                  onClick={() => {
                    const d = new Date()
                    set.reemplazar(rep.cola.map((t) => t.id), `Radio ${d.getDate()}/${d.getMonth() + 1}`)
                    navegar('/sets')
                  }}
                >
                  Guardar como set
                </button>
                {' · '}
                <button className="radio__vaciar" onClick={rep.vaciarCola}>
                  Vaciar
                </button>
              </span>
            </div>
            <ol className="radio__cola">
              {rep.cola.map((t, i) => (
                <li key={t.id}>
                  <button className={`radio__pista${i === rep.indice ? ' radio__pista--actual' : ''}${i < rep.indice ? ' radio__pista--sonada' : ''}`} onClick={() => rep.ponerCola(rep.cola, i)}>
                    <span className="radio__muestra" style={{ background: colorBpm(t.bpm) }}>
                      {i + 1}
                    </span>
                    <span className="radio__pista-texto">
                      <strong>{t.titulo}</strong>
                      <small>
                        {t.artista} · {t.bpm} BPM · {t.clave.id}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </aside>
    </main>
  )
}
