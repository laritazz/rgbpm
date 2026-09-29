import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { useEscucha } from '../../hooks/useEscucha'
import { compatibles, porTempo } from '../../lib/armonia'
import { colorBpm, franjaDe } from '../../lib/color'
import { bpmDeToques } from '../../lib/tempo'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import RuedaMini from '../biblioteca/RuedaMini'
import './Tap.css'

const REINICIO = 2000 // más de 2 s sin tocar: empieza una cuenta nueva

/**
 * Tap y escucha: el BPM a toques o por el micro, con la mascota bailando lo que encuentra.
 * Pensada para el móvil en cabina o en la pista.
 */
export default function Tap() {
  const [modo, setModo] = useState('tap')
  return (
    <main className="tap">
      <div className="tap__modos" role="tablist" aria-label="Modo">
        <button role="tab" aria-selected={modo === 'tap'} onClick={() => setModo('tap')}>
          Tap BPM
        </button>
        <button role="tab" aria-selected={modo === 'escucha'} onClick={() => setModo('escucha')}>
          Escuchar
        </button>
      </div>
      {modo === 'tap' ? <ModoTap /> : <ModoEscucha />}
    </main>
  )
}

function ModoTap() {
  const [marcas, setMarcas] = useState([])
  const lectura = bpmDeToques(marcas)
  const bpm = lectura?.bpm ?? null

  function tocar(e) {
    // timeStamp del evento: el mismo reloj que performance.now y que requestAnimationFrame
    const ahora = e.timeStamp
    navigator.vibrate?.(8)
    setMarcas((m) => (m.length && ahora - m.at(-1) > REINICIO ? [ahora] : [...m, ahora]))
  }

  function conTeclado(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!e.repeat) tocar(e)
    }
  }

  return (
    <>
      <button className="tap__escenario" onPointerDown={tocar} onKeyDown={conTeclado} aria-label="Toca al ritmo" style={{ '--color': bpm ? colorBpm(bpm) : '#333' }}>
        <MascotaEscena bpm={bpm} ultimoGolpe={marcas.at(-1) ?? null} tamano={360} />
        <span className="tap__pista">{marcas.length === 0 ? 'Toca al ritmo' : marcas.length < 3 ? 'Sigue…' : ''}</span>
      </button>

      <Lectura bpm={bpm}>
        {lectura && (
          <div className="tap__estabilidad" aria-label={`Estabilidad ${Math.round(lectura.estabilidad * 100)} %`}>
            <span style={{ width: `${Math.round(lectura.estabilidad * 100)}%` }} />
          </div>
        )}
        {marcas.length > 0 && (
          <button className="boton boton--fantasma" onClick={() => setMarcas([])}>
            Reiniciar
          </button>
        )}
      </Lectura>

      {bpm && <Sugerencias bpm={bpm} />}
    </>
  )
}

function ModoEscucha() {
  const { estado, nivel, progreso, resultado, error, escuchar, parar } = useEscucha(12)
  const bpm = resultado?.tempo?.bpm ?? null
  const clave = resultado?.tono?.clave ?? null
  const ocupado = estado === 'pidiendo' || estado === 'escuchando' || estado === 'analizando'

  return (
    <>
      <div className="tap__escenario tap__escenario--escucha" style={{ '--color': bpm ? colorBpm(bpm) : '#333', '--progreso': progreso }}>
        <MascotaEscena bpm={bpm} nivel={nivel} tamano={360} etiqueta={estado === 'escuchando' ? 'La mascota está escuchando' : undefined} />
        {estado === 'escuchando' && <span className="tap__progreso" aria-hidden="true" />}
        <span className="tap__pista" aria-live="polite">
          {estado === 'pidiendo' && 'Dame permiso para el micro…'}
          {estado === 'escuchando' && `Escuchando… ${Math.ceil(12 * (1 - progreso))} s`}
          {estado === 'analizando' && 'Pensando…'}
          {estado === 'parado' && 'Acerca el móvil al altavoz'}
          {estado === 'error' && error}
        </span>
      </div>

      <Lectura bpm={bpm} clave={clave} confianza={resultado?.tono?.confianza}>
        {ocupado ? (
          <button className="boton boton--fantasma" onClick={parar}>
            Parar
          </button>
        ) : (
          <button className="boton boton--rosa" onClick={escuchar}>
            {resultado ? 'Escuchar otra vez' : 'Escuchar 12 s'}
          </button>
        )}
        <p className="tap__privacidad">El audio se analiza en tu móvil y no se guarda.</p>
      </Lectura>

      {bpm && <Sugerencias bpm={bpm} clave={clave} />}
    </>
  )
}

function Lectura({ bpm, clave, confianza, children }) {
  return (
    <section className="tap__lectura" aria-live="polite">
      <div className="tap__cifras">
        <div>
          <span className="etiqueta-seccion">BPM</span>
          <strong className={`tap__bpm${bpm ? '' : ' tap__bpm--vacio'}`}>{bpm ? Math.round(bpm) : '000'}</strong>
          {bpm && <span className="tap__franja" style={{ '--color': colorBpm(bpm) }}>{franjaDe(bpm).nombre}</span>}
        </div>
        {clave !== undefined && (
          <div className="tap__clave">
            <RuedaMini semilla={clave} tamano={104} />
            {clave && (
              <span>
                {clave.nombre} · {clave.camelot}
                {confianza != null && confianza < 0.35 && <em> (dudosa)</em>}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="tap__acciones">{children}</div>
    </section>
  )
}

/** Qué pinchar a continuación desde tu biblioteca. */
function Sugerencias({ bpm, clave }) {
  const { temas } = useBiblioteca()
  const opciones = useMemo(
    () => (clave ? compatibles({ id: 'escucha', bpm, clave }, temas, 6) : porTempo(bpm, temas, 6)),
    [bpm, clave, temas]
  )
  if (!opciones.length) return null
  return (
    <section className="tap__sugerencias" aria-labelledby="titulo-sugerencias">
      <h2 id="titulo-sugerencias" className="etiqueta-seccion">
        {clave ? 'Mezcla con esto' : 'A este tempo en tu biblioteca'}
      </h2>
      <ul>
        {opciones.map((o) => (
          <li key={o.tema.id}>
            <Link to={`/?tema=${o.tema.id}`} className="tap__tema">
              <span className="tap__muestra" style={{ background: colorBpm(o.tema.bpm) }} aria-hidden="true" />
              <span>
                <strong>{o.tema.titulo}</strong>
                <small>
                  {o.categoria ? `${o.categoria.nombre} · ` : ''}
                  {o.tema.bpm} BPM{o.tema.clave ? ` · ${o.tema.clave.id}` : ''}
                </small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
