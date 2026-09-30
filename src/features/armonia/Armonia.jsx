import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IconoPlay } from '../../components/Iconos'
import { CATEGORIAS } from '../../lib/armonia'
import { NOTACIONES, clave, leerClave } from '../../lib/claves'
import { colorBpm } from '../../lib/color'
import { azarConSemilla, relacionPorClave, sugerirSet, temasPorCategoria } from '../../lib/rueda'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import BotonSet from '../sets/BotonSet'
import { useSet } from '../sets/SetContext'
import { useAjustesArmonia } from './AjustesArmoniaContext'
import RuedaGrande from './RuedaGrande'
import './Armonia.css'

const entre = (v, min, max) => Math.min(max, Math.max(min, v))
const mediana = (valores) => (valores.length ? valores.toSorted((a, b) => a - b)[Math.floor(valores.length / 2)] : 124)
const SIN_FIJAR = {}
const signo = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0')

/**
 * Armonía: la rueda grande. Tocas un tono y ves con qué pega, el camino armónico
 * desde ahí y un set sugerido con tus temas, listo para «Usar este set».
 * Clave, BPM, pasos y pestaña viven en la URL: el enlace se comparte tal cual.
 */
export default function Armonia() {
  const { temas } = useBiblioteca()
  const rep = useReproductor()
  const ajustes = useAjustesArmonia()
  const { etiqueta, opciones } = ajustes
  const [params, setParams] = useSearchParams()

  const bpmTipico = useMemo(() => Math.round(mediana(temas.map((t) => t.bpm).filter(Boolean))), [temas])
  const semilla = leerClave(params.get('clave')) ?? rep.tema?.clave ?? clave(1, true)
  const bpm = entre(Number(params.get('bpm')) || Math.round(rep.tema?.bpm ?? bpmTipico), 60, 200)
  const pasos = entre(Number(params.get('pasos')) || 8, 4, 16)
  const ver = params.get('ver') === 'pegan' ? 'pegan' : 'set'

  const poner = (cambios) =>
    setParams(
      (p) => {
        const nuevos = new URLSearchParams(p)
        for (const [campo, valor] of Object.entries(cambios)) nuevos.set(campo, valor)
        return nuevos
      },
      { replace: true }
    )

  const cuantos = useMemo(() => {
    const mapa = new Map()
    for (const t of temas) if (t.clave) mapa.set(t.clave.id, (mapa.get(t.clave.id) ?? 0) + 1)
    return mapa
  }, [temas])
  const relacion = useMemo(() => relacionPorClave(semilla, opciones.corregir), [semilla, opciones.corregir])

  // El set sugerido se calcula aquí porque lo usan la rueda (la línea) y el panel (la lista)
  const [tirada, setTirada] = useState(1)
  // Lo que fijas con «Usar este» vale para esta clave, largo y reglas; si cambian, se olvida solo (sin efectos)
  const contexto = `${semilla.id}|${pasos}|${opciones.corregir}`
  const [fijados, setFijados] = useState({ contexto, mapa: SIN_FIJAR })
  const mapa = fijados.contexto === contexto ? fijados.mapa : SIN_FIJAR
  const sugerido = useMemo(
    () => sugerirSet(semilla, temas, { pasos, bpmInicio: bpm, ...opciones, fijados: mapa, azar: azarConSemilla(tirada * 7919 + semilla.open * 31 + (semilla.menor ? 1 : 0)) }),
    [semilla, temas, pasos, bpm, opciones, mapa, tirada]
  )
  const fijar = (paso, id) => setFijados({ contexto, mapa: { ...mapa, [paso]: id } })
  const otraTirada = () => {
    setTirada((t) => t + 1)
    setFijados({ contexto, mapa: SIN_FIJAR })
  }

  const elegirClave = (k) => poner({ clave: k.id })

  return (
    <div className="armonia">
      <main className="armonia__principal">
        <header className="armonia__cabecera">
          <h1>Armonía</h1>
          <p>Toca un tono y mira qué pega.</p>
        </header>

        <div className="armonia__rueda">
          <RuedaGrande semilla={semilla} relacion={relacion} camino={sugerido} cuantos={cuantos} etiqueta={etiqueta} alElegir={elegirClave} />
        </div>

        <ul className="armonia__leyenda" aria-label="Categorías de mezcla">
          <li>
            <i style={{ background: 'var(--rosa)' }} />
            Salida
          </li>
          {CATEGORIAS.map((c) => (
            <li key={c.id} title={c.texto}>
              <i style={{ background: c.color }} />
              {c.nombre}
            </li>
          ))}
        </ul>

        <Controles bpm={bpm} pasos={pasos} poner={poner} />
      </main>

      <aside className="armonia__panel" aria-label="Qué hacer con esta clave">
        <div className="armonia__pestanas" role="tablist">
          <button role="tab" aria-selected={ver === 'set'} onClick={() => poner({ ver: 'set' })}>
            Set sugerido
          </button>
          <button role="tab" aria-selected={ver === 'pegan'} onClick={() => poner({ ver: 'pegan' })}>
            Qué pega con {etiqueta(semilla)}
          </button>
        </div>
        {ver === 'set' ? (
          <SetSugerido key={contexto} semilla={semilla} cadena={sugerido} bpm={bpm} alFijar={fijar} alOtraTirada={otraTirada} />
        ) : (
          <QuePega semilla={semilla} bpm={bpm} temas={temas} alElegir={elegirClave} />
        )}
      </aside>
    </div>
  )
}

/** Notación, corregir desfase, margen de BPM, BPM de salida y largo del set. */
function Controles({ bpm, pasos, poner }) {
  const { notacion, corregir, tolerancia, cambiar } = useAjustesArmonia()
  const rep = useReproductor()
  const sonando = rep.tema?.clave ? rep.tema : null

  return (
    <section className="controles" aria-label="Ajustes de la rueda">
      <div className="control">
        <span className="control__nombre" id="control-notacion">
          Notación
        </span>
        <div className="segmentado" role="radiogroup" aria-labelledby="control-notacion">
          {NOTACIONES.map((n) => (
            <button key={n.id} role="radio" aria-checked={notacion === n.id} onClick={() => cambiar('notacion', n.id)}>
              {n.nombre}
              <small>{n.ejemplo}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="control control--fila">
        <span className="control__texto">
          <span className="control__nombre" id="control-desfase">
            Corregir desfase
          </span>
          <small>{corregir ? 'Clavado es la relativa real: Am con C.' : 'Reglas tal cual tu hoja «Armonías».'}</small>
        </span>
        <button className="interruptor" role="switch" aria-checked={corregir} aria-labelledby="control-desfase" onClick={() => cambiar('corregir', !corregir)}>
          <span />
        </button>
      </div>

      <label className="control">
        <span className="control__nombre">
          Margen de BPM <output>±{tolerancia} %</output>
        </span>
        <input type="range" min="2" max="16" step="1" value={tolerancia} onChange={(e) => cambiar('tolerancia', Number(e.target.value))} />
        <small>Cuenta doble y mitad de tempo.</small>
      </label>

      <div className="control control--dos">
        <label>
          <span className="control__nombre">BPM de salida</span>
          <input className="control__numero" type="number" min="60" max="200" value={bpm} onChange={(e) => e.target.value && poner({ bpm: Math.round(Number(e.target.value)) })} />
        </label>
        <label>
          <span className="control__nombre">
            Pasos <output>{pasos}</output>
          </span>
          <input type="range" min="4" max="16" step="1" value={pasos} onChange={(e) => poner({ pasos: e.target.value })} />
        </label>
      </div>

      {sonando && (
        <button className="boton boton--fantasma controles__sonando" onClick={() => poner({ clave: sonando.clave.id, bpm: Math.round(sonando.bpm ?? bpm) })}>
          Salir de lo que suena · {sonando.titulo}
        </button>
      )}
      <p className="controles__nota">Se aplica en toda la app.</p>
    </section>
  )
}

/** Un tema real por cada tono del camino, enlazado por BPM. Toca una fila para ver otras opciones en ese tono. */
function SetSugerido({ semilla, cadena, bpm, alFijar, alOtraTirada }) {
  const { etiqueta, opciones } = useAjustesArmonia()
  const set = useSet()
  const navegar = useNavigate()
  const [abierto, setAbierto] = useState(null)
  const [aviso, setAviso] = useState(null)
  const conTema = cadena.filter((p) => p.elegido)

  function fijar(paso, id) {
    alFijar(paso, id)
    setAbierto(null)
  }

  function usarSet() {
    if (!conTema.length) return setAviso('No hay temas en esas claves.')
    set.reemplazar(
      conTema.map((p) => p.elegido.id),
      `Camino desde ${etiqueta(semilla)}`
    )
    navegar('/sets', { state: { aviso: 'Set armado desde la rueda. Puedes deshacer.' } })
  }

  return (
    <section className="sugerido">
      <header className="sugerido__cabecera">
        <h2>
          Desde {etiqueta(semilla)} · {bpm} BPM
        </h2>
        <p>
          {conTema.length} de {cadena.length} pasos con tema · margen ±{opciones.tolerancia} %
        </p>
      </header>

      <ol className="sugerido__lista">
        {cadena.map((paso, i) => (
          <li key={paso.clave.id}>
            {i > 0 && (
              <div className="sugerido__salto" style={{ '--c': paso.categoria?.color }}>
                <i aria-hidden="true" />
                <span>{paso.categoria?.nombre}</span>
                {paso.diferencia !== null && <small>{signo(paso.diferencia)} BPM</small>}
              </div>
            )}
            <PasoSugerido paso={paso} numero={i + 1} abierto={abierto === i} alAbrir={() => setAbierto((a) => (a === i ? null : i))} alFijar={(id) => fijar(i, id)} />
          </li>
        ))}
      </ol>

      <footer className="sugerido__pie">
        <button className="boton boton--rosa" onClick={usarSet}>
          Usar este set
        </button>
        <button className="boton boton--fantasma" onClick={alOtraTirada}>
          Otras canciones
        </button>
      </footer>
      {aviso && (
        <p className="sugerido__aviso" role="status">
          {aviso}
        </p>
      )}
    </section>
  )
}

function PasoSugerido({ paso, numero, abierto, alAbrir, alFijar }) {
  const { etiqueta } = useAjustesArmonia()
  const { elegido, alternativas } = paso

  return (
    <div className={`paso${abierto ? ' paso--abierto' : ''}${elegido ? '' : ' paso--vacio'}`}>
      <div className="paso__fila">
        <span className="paso__numero">{numero}</span>
        <span className="paso__muestra" style={{ background: colorBpm(elegido?.bpm) }} aria-hidden="true" />
        <button className="paso__texto" onClick={alAbrir} disabled={!alternativas.length} aria-expanded={alternativas.length ? abierto : undefined}>
          <strong>{elegido ? elegido.titulo : `Sin temas en ${etiqueta(paso.clave)}`}</strong>
          <small>
            {elegido?.artista}
            {alternativas.length > 0 && ` · +${alternativas.length}`}
          </small>
        </button>
        <span className="paso__clave" style={{ '--c': paso.categoria?.color ?? 'var(--rosa)' }}>
          {etiqueta(paso.clave)}
        </span>
        <span className="paso__bpm">{elegido?.bpm ? Math.round(elegido.bpm) : '—'}</span>
        {elegido && <AccionesTema tema={elegido} />}
      </div>
      {abierto && (
        <ul className="paso__otras" aria-label={`Otras opciones en ${etiqueta(paso.clave)}`}>
          {alternativas.map((t) => (
            <li key={t.id}>
              <span className="paso__muestra paso__muestra--mini" style={{ background: colorBpm(t.bpm) }} aria-hidden="true" />
              <span className="paso__texto paso__texto--quieto">
                <strong>{t.titulo}</strong>
                <small>
                  {t.artista} · {t.bpm ? Math.round(t.bpm) : '—'} BPM
                </small>
              </span>
              <button className="boton-set" onClick={() => alFijar(t.id)}>
                Usar este
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Las siete categorías con tus temas, ordenados por cercanía al BPM de salida. */
function QuePega({ semilla, bpm, temas, alElegir }) {
  const { etiqueta, opciones } = useAjustesArmonia()
  const [abiertas, setAbiertas] = useState(() => new Set())
  const grupos = useMemo(() => temasPorCategoria(semilla, temas, { bpm, ...opciones, limite: 30 }), [semilla, temas, bpm, opciones])

  const alternar = (id) =>
    setAbiertas((a) => {
      const n = new Set(a)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  return (
    <section className="pegan">
      <p className="pegan__nota">
        {bpm} BPM · ±{opciones.tolerancia} %
      </p>
      {grupos.map(({ categoria, claves, temas: lista, total, fuera }) => {
        const abierta = abiertas.has(categoria.id)
        const visibles = abierta ? lista : lista.slice(0, 4)
        return (
          <article key={categoria.id} className="grupo" style={{ '--c': categoria.color }}>
            <header className="grupo__cabecera">
              <i aria-hidden="true" />
              <h3>{categoria.nombre}</h3>
              <span className="grupo__cuantos">{total}</span>
            </header>
            <p className="grupo__texto">{categoria.texto}</p>
            {claves.length > 0 ? (
              <div className="grupo__claves">
                {claves.map((k) => (
                  <button key={k.id} onClick={() => alElegir(k)} aria-label={`Salir desde ${etiqueta(k)}, ${k.nombre}`}>
                    <b>{etiqueta(k)}</b> {k.nombre}
                  </button>
                ))}
              </div>
            ) : (
              <p className="grupo__texto">No aplica desde {semilla.menor ? 'una menor' : 'una mayor'}.</p>
            )}
            {visibles.length > 0 && (
              <ul className="grupo__temas">
                {visibles.map(({ tema, tempo }) => (
                  <li key={tema.id}>
                    <span className="paso__muestra paso__muestra--mini" style={{ background: colorBpm(tema.bpm) }} aria-hidden="true" />
                    <span className="paso__texto paso__texto--quieto">
                      <strong>{tema.titulo}</strong>
                      <small>
                        {tema.artista} · {etiqueta(tema.clave)} · {tema.bpm ? Math.round(tema.bpm) : '—'} BPM
                        {tempo && ` (${signo(Math.round(tempo.porcentaje * 10) / 10)} %${tempo.relacion !== 1 ? ` · ×${tempo.relacion}` : ''})`}
                      </small>
                    </span>
                    <AccionesTema tema={tema} />
                  </li>
                ))}
              </ul>
            )}
            {(lista.length > 4 || fuera > 0) && (
              <footer className="grupo__pie">
                {lista.length > 4 && (
                  <button onClick={() => alternar(categoria.id)} aria-expanded={abierta}>
                    {abierta ? 'Ver menos' : `Ver ${lista.length - 4} más`}
                  </button>
                )}
                {fuera > 0 && (
                  <small>
                    {fuera} fuera del margen ±{opciones.tolerancia} %
                  </small>
                )}
              </footer>
            )}
          </article>
        )
      })}
    </section>
  )
}

function AccionesTema({ tema }) {
  const { tieneArchivo } = useMusica()
  const { reproducir } = useReproductor()
  return (
    <span className="acciones-tema">
      {tieneArchivo(tema) && (
        <button className="acciones-tema__play" onClick={() => reproducir(tema)} aria-label={`Escuchar ${tema.titulo}`}>
          <IconoPlay width={14} height={14} />
        </button>
      )}
      <BotonSet tema={tema} compacto />
    </span>
  )
}
