import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { useCazados } from '../../hooks/useCazados'
import { useEscucha } from '../../hooks/useEscucha'
import { compatibles, porTempo } from '../../lib/armonia'
import { colorBpm, degradadoTema, franjaDe } from '../../lib/color'
import { puedeSer } from '../../lib/escucha'
import { bpmDeToques } from '../../lib/tempo'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import RuedaMini from '../biblioteca/RuedaMini'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import './Tap.css'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'

const REINICIO = 2000 // más de 2 s sin tocar: empieza una cuenta nueva

/**
 * Escucha y Tap: el BPM y la clave de lo que suena, en el móvil, en la pista o en cabina.
 * El modo va en la URL (?modo=tap) para que la pestaña del centro abra directamente la escucha.
 */
export default function Tap() {
  const [params, setParams] = useSearchParams()
  const modo = params.get('modo') === 'tap' ? 'tap' : 'escucha'
  const { cazados, anadir, borrar } = useCazados()
  const [vista, setVista] = useState(null) // un cazado del historial que se vuelve a mirar

  const cambiarModo = (m) => {
    setVista(null)
    setParams(m === 'tap' ? { modo: 'tap' } : {}, { replace: true })
  }

  return (
    <main className="tap">
      <div className="tap__modos" role="tablist" aria-label="Modo">
        <button role="tab" aria-selected={modo === 'escucha'} onClick={() => cambiarModo('escucha')}>
          Escuchar
        </button>
        <button role="tab" aria-selected={modo === 'tap'} onClick={() => cambiarModo('tap')}>
          Tap BPM
        </button>
      </div>
      {modo === 'tap' ? <ModoTap alGuardar={anadir} /> : <ModoEscucha alCazar={anadir} vista={vista} alSoltarVista={() => setVista(null)} />}
      <Cazados cazados={cazados} alVer={(c) => (cambiarModo('escucha'), setVista(c))} alBorrar={borrar} />
    </main>
  )
}

/* ——— Escucha ——— */

function ModoEscucha({ alCazar, vista, alSoltarVista }) {
  const { estado, nivel, segundos, maximo, lectura, fijado, fijadoEn, error, escuchar, parar } = useEscucha({
    alTerminar: (l, seguro) => alCazar({ bpm: l.tempo?.bpm ?? null, clave: l.tono?.clave ?? null, confianza: l.tono?.confianza ?? 0, seguro, origen: 'escucha' }),
  })
  const escuchando = estado === 'pidiendo' || estado === 'escuchando'
  const { sonando, alternar } = useReproductor()
  const actual = vista && !escuchando ? { bpm: vista.bpm, clave: vista.clave, confianza: vista.confianza } : { bpm: lectura?.tempo?.bpm ?? null, clave: lectura?.tono?.clave ?? null, confianza: lectura?.tono?.confianza }
  const { bpm, clave } = actual

  const empezar = () => {
    alSoltarVista()
    // Si RGBPM está sonando, se pausa: si no, el micro se escucharía a sí mismo
    if (sonando) alternar()
    navigator.vibrate?.(10)
    escuchar()
  }

  const texto = {
    parado: 'Toca la mascota para escuchar',
    pidiendo: 'Dame permiso para el micro…',
    escuchando: lectura ? 'Afinando…' : 'Escuchando…',
    listo: fijado ? '¡Lo tengo!' : 'Esto es lo que he oído',
    error,
  }[estado]

  return (
    <>
      <button
        className={`tap__escenario${escuchando ? ' tap__escenario--escuchando' : ''}`}
        onClick={escuchando ? parar : empezar}
        aria-label={escuchando ? 'Parar la escucha' : 'Escuchar lo que suena'}
        style={{ '--color': bpm ? colorBpm(bpm) : '#333', '--avance': Math.min(1, segundos / maximo) }}
      >
        <MascotaEscena bpm={bpm} nivel={nivel} drop={fijadoEn} tocando={escuchando || Boolean(bpm)} tamano={360} />
        {escuchando && (
          <svg className="tap__anillo" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" pathLength="1" />
          </svg>
        )}
        <span className="tap__pista" aria-live="polite">
          {texto}
        </span>
      </button>

      <Lectura bpm={bpm} clave={clave} confianza={actual.confianza} provisional={escuchando}>
        <p className="tap__privacidad">El audio se analiza aquí y no se guarda.</p>
      </Lectura>

      {bpm && clave && <PuedeSer bpm={bpm} clave={clave} />}
      {bpm && <Sugerencias bpm={bpm} clave={clave} />}
    </>
  )
}

/* ——— Tap ——— */

function ModoTap({ alGuardar }) {
  const [marcas, setMarcas] = useState([])
  const [factor, setFactor] = useState(1) // ×2 / ÷2 por si has tocado a doble o a medio tempo
  const lectura = bpmDeToques(marcas)
  const bpm = lectura ? Math.round(lectura.bpm * factor * 10) / 10 : null

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
        <span className="tap__pista">{marcas.length === 0 ? 'Toca al ritmo' : marcas.length < 3 ? 'Sigue…' : `${marcas.length} toques`}</span>
      </button>

      <Lectura bpm={bpm}>
        {lectura && (
          <div className="tap__estabilidad" aria-label={`Estabilidad ${Math.round(lectura.estabilidad * 100)} %`}>
            <span style={{ width: `${Math.round(lectura.estabilidad * 100)}%` }} />
          </div>
        )}
        <div className="tap__fila">
          <button className="boton boton--fantasma" onClick={() => setFactor((f) => f / 2)} disabled={!bpm}>
            ÷2
          </button>
          <button className="boton boton--fantasma" onClick={() => setFactor((f) => f * 2)} disabled={!bpm}>
            ×2
          </button>
          <button
            className="boton boton--fantasma"
            onClick={() => {
              setMarcas([])
              setFactor(1)
            }}
            disabled={!marcas.length}
          >
            Reiniciar
          </button>
          <button className="boton boton--rosa" onClick={() => alGuardar({ bpm, clave: null, confianza: lectura.estabilidad, seguro: lectura.estabilidad > 0.7, origen: 'tap' })} disabled={!bpm}>
            Guardar
          </button>
        </div>
      </Lectura>

      {bpm && <Sugerencias bpm={bpm} />}
    </>
  )
}

/* ——— Piezas comunes ——— */

function Lectura({ bpm, clave, confianza, provisional = false, children }) {
  const { etiqueta, completa, corregir } = useAjustesArmonia()
  return (
    <section className={`tap__lectura${provisional && bpm ? ' tap__lectura--provisional' : ''}`} aria-live="polite">
      <div className="tap__cifras">
        <div>
          <span className="etiqueta-seccion">BPM</span>
          <strong key={bpm ? Math.round(bpm) : 'vacio'} className={`tap__bpm${bpm ? '' : ' tap__bpm--vacio'}`}>
            {bpm ? Math.round(bpm) : '000'}
          </strong>
          {bpm && (
            <span className="tap__franja" style={{ '--color': colorBpm(bpm) }}>
              {franjaDe(bpm).nombre}
            </span>
          )}
        </div>
        {clave !== undefined && (
          <div className="tap__clave">
            <RuedaMini semilla={clave} tamano={104} corregir={corregir} etiqueta={etiqueta} />
            {clave && (
              <span>
                {completa(clave)}
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

function FilaTema({ tema, detalle }) {
  const { hayFuente } = useMusica()
  const { tema: sonando, sonando: suena, reproducir } = useReproductor()
  const esEste = suena && sonando?.id === tema.id
  return (
    <li className="tap__fila-tema">
      <Link to={`/?tema=${tema.id}`} className="tap__tema">
        <span className="tap__muestra" style={{ background: degradadoTema(tema) }} aria-hidden="true" />
        <span>
          <strong>{tema.titulo}</strong>
          <small>{detalle}</small>
        </span>
      </Link>
      {hayFuente && (
        <button className={`tap__play${esEste ? ' tap__play--on' : ''}`} onClick={() => reproducir(tema)} aria-label={`${esEste ? 'Pausar' : 'Escuchar'} ${tema.titulo}`}>
          {esEste ? '❚❚' : '▶'}
        </button>
      )}
    </li>
  )
}

/** Si lo que suena está en tu biblioteca, suele salir aquí: misma clave y BPM casi igual. */
function PuedeSer({ bpm, clave }) {
  const { etiqueta } = useAjustesArmonia()
  const { temas } = useBiblioteca()
  const opciones = useMemo(() => puedeSer(temas, { bpm, clave }), [temas, bpm, clave])
  if (!opciones.length) return null
  return (
    <section className="tap__sugerencias tap__puede-ser" aria-labelledby="titulo-puede-ser">
      <h2 id="titulo-puede-ser" className="etiqueta-seccion">
        ¿Es uno de tus temas?
      </h2>
      <ul>
        {opciones.map((o) => (
          <FilaTema key={o.tema.id} tema={o.tema} detalle={`${o.tema.artista} · ${o.tema.bpm} BPM · ${etiqueta(o.tema.clave)}`} />
        ))}
      </ul>
    </section>
  )
}

/** Qué pinchar a continuación desde tu biblioteca. */
function Sugerencias({ bpm, clave }) {
  const { etiqueta, opciones: ajustes } = useAjustesArmonia()
  const { paraSugerir: temas } = useMusica()
  const opciones = useMemo(() => (clave ? compatibles({ id: 'escucha', bpm, clave }, temas, 6, ajustes) : porTempo(bpm, temas, 6)), [bpm, clave, temas, ajustes])
  if (!opciones.length) return null
  return (
    <section className="tap__sugerencias" aria-labelledby="titulo-sugerencias">
      <h2 id="titulo-sugerencias" className="etiqueta-seccion">
        {clave ? 'Mezcla con esto' : 'A este tempo en tu biblioteca'}
      </h2>
      <ul>
        {opciones.map((o) => (
          <FilaTema key={o.tema.id} tema={o.tema} detalle={`${o.categoria ? `${o.categoria.nombre} · ` : ''}${o.tema.bpm} BPM${o.tema.clave ? ` · ${etiqueta(o.tema.clave)}` : ''}`} />
        ))}
      </ul>
    </section>
  )
}

const haceCuanto = (fecha) => {
  const min = Math.round((Date.now() - fecha) / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  return h < 24 ? `hace ${h} h` : new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

/** Historial: lo que has cazado en la pista, para mirarlo luego. */
function Cazados({ cazados, alVer, alBorrar }) {
  const { etiqueta } = useAjustesArmonia()
  if (!cazados.length) return null
  return (
    <section className="tap__cazados" aria-labelledby="titulo-cazados">
      <h2 id="titulo-cazados" className="etiqueta-seccion">
        Cazados
      </h2>
      <ul>
        {cazados.map((c) => (
          <li key={c.fecha} className="cazado" style={{ '--color': c.bpm ? colorBpm(c.bpm) : '#333' }}>
            <button className="cazado__ver" onClick={() => alVer(c)}>
              <strong>{c.bpm ? Math.round(c.bpm) : '—'}</strong>
              <span>{c.clave ? etiqueta(c.clave) : c.origen === 'tap' ? 'tap' : '?'}</span>
              <small>{haceCuanto(c.fecha)}</small>
            </button>
            <button className="cazado__borrar" onClick={() => alBorrar(c.fecha)} aria-label="Borrar del historial">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
