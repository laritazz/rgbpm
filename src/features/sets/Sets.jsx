import { Fragment, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Mascota from '../../components/marca/Mascota'
import { IconoMasSimple, IconoPlay } from '../../components/Iconos'
import { CATEGORIAS } from '../../lib/armonia'
import { colorBpm } from '../../lib/color'
import { descargar } from '../../lib/descargar'
import { reloj } from '../../lib/formato'
import { cambiazos, candidatosTras, duracionTotal, exportarCsv, exportarM3u, exportarNml, exportarTxt, importarSet, reordenar, saludSet, transicion } from '../../lib/set'
import { useMovimientoReducido } from '../../hooks/useMovimientoReducido'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import CurvaSet from './CurvaSet'
import FilaSet from './FilaSet'
import PortadaSet from './PortadaSet'
import { useSet } from './SetContext'
import './Sets.css'

const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Sets: montar, ordenar y exportar a Traktor. Todo lo del Set de RGBPM original,
 * más la curva de energía, la portada Pantone del set y deshacer cualquier cambio.
 */
export default function Sets() {
  const set = useSet()
  const { temas: biblioteca, playlists, porId } = useBiblioteca()
  const { hayFuente } = useMusica()
  const rep = useReproductor()
  const quieto = useMovimientoReducido()
  const [anclaElegida, setAnclaElegida] = useState(null)
  const [cambiando, setCambiando] = useState(null)
  const [arrastre, setArrastre] = useState(null) // { desde, sobre, lado }
  const [aviso, setAviso] = useState(null)
  const entradaArchivo = useRef(null)

  const temas = set.temas
  const ancla = temas.find((t) => t.id === anclaElegida) ?? temas.at(-1) ?? null
  const salud = useMemo(() => saludSet(temas), [temas])
  const bpms = temas.map((t) => t.bpm).filter(Boolean)
  const sonandoId = rep.sonando ? rep.tema?.id : null

  // ——— Animación FLIP: al reordenar, cada fila viaja desde donde estaba ———
  const lista = useRef(null)
  const posiciones = useRef(new Map())
  useLayoutEffect(() => {
    const nuevas = new Map()
    lista.current?.querySelectorAll('[data-fila]').forEach((el) => {
      const id = el.dataset.fila
      const arriba = el.getBoundingClientRect().top
      nuevas.set(id, arriba)
      const antes = posiciones.current.get(id)
      if (!quieto && antes != null && Math.abs(antes - arriba) > 2) {
        el.animate([{ transform: `translateY(${antes - arriba}px)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' })
      }
    })
    posiciones.current = nuevas
  }, [temas, quieto])

  // ——— Acciones ———
  const avisar = (texto) => {
    setAviso(texto)
    setTimeout(() => setAviso((a) => (a === texto ? null : a)), 4000)
  }

  const alSoltar = useCallback(
    (sobre, lado, soltar) => {
      setArrastre((a) => {
        if (!a) return a
        if (!soltar) return a.sobre === sobre && a.lado === lado ? a : { ...a, sobre, lado }
        const { desde } = a
        let hasta = lado === 'arriba' ? sobre : sobre + 1
        if (desde < hasta) hasta--
        if (hasta !== desde) set.mover(desde, hasta)
        return null
      })
    },
    [set]
  )

  const reproducir = useCallback((t) => rep.reproducir(t), [rep])
  const anclar = useCallback((id) => setAnclaElegida((a) => (a === id ? null : id)), [])
  const quitar = useCallback((id) => set.quitar(id), [set])
  const pedirCambio = useCallback((id) => setCambiando((c) => (c === id ? null : id)), [])

  function autoOrden() {
    const { orden, arranques } = reordenar(temas)
    set.reemplazar(orden.map((t) => t.id))
    avisar(`Reordenado: encadena por armonía y evita saltos de BPM. Probé ${arranques} arranques y me quedé con el mejor.`)
  }

  function exportar(formato) {
    const nombre = set.nombre.trim() || 'Set RGBPM'
    const archivo = nombre.replace(/[^\w\sáéíóúñüÁÉÍÓÚÑÜ-]/g, '').trim() || 'set'
    const formatos = {
      nml: [exportarNml(temas, nombre), 'application/xml', 'En Traktor: clic derecho en Playlists → Import Playlist → elige el .nml.'],
      m3u: [exportarM3u(temas), 'audio/x-mpegurl', 'Lista .m3u lista para cualquier reproductor.'],
      txt: [exportarTxt(temas, nombre), 'text/plain', 'Tracklist en texto: para Instagram o SoundCloud.'],
      csv: [exportarCsv(temas), 'text/csv', 'Hoja de cálculo con BPM, clave y duración.'],
    }
    const [texto, tipo, pista] = formatos[formato]
    descargar(`${archivo}.${formato}`, texto, tipo)
    avisar(pista)
  }

  async function importar(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    const { ids, sinCasar } = importarSet(await f.text(), f.name, biblioteca)
    if (!ids.length) return avisar('No he encontrado ninguno de esos temas en tu biblioteca.')
    set.reemplazar(ids, f.name.replace(/\.[^.]+$/, ''))
    avisar(`${ids.length} temas cargados${sinCasar ? ` · ${sinCasar} no están en tu biblioteca` : ''}.`)
  }

  const guardadoActual = set.guardados.find((g) => g.nombre.toLowerCase() === set.nombre.trim().toLowerCase())
  const sinGuardar = !guardadoActual || guardadoActual.ids.join() !== temas.map((t) => t.id).join()

  return (
    <div className="sets">
      <main className="sets__principal">
        <header className="sets__cabecera">
          <PortadaSet temas={temas} tamano={96} />
          <div className="sets__titulo">
            <label className="solo-lectores" htmlFor="nombre-set">
              Nombre del set
            </label>
            <input id="nombre-set" value={set.nombre} onChange={(e) => set.renombrar(e.target.value)} spellCheck={false} />
            <p>
              {temas.length} {temas.length === 1 ? 'tema' : 'temas'}
              {temas.length > 0 && ` · ${reloj(duracionTotal(temas))}`}
              {bpms.length > 1 && ` · ${Math.round(Math.min(...bpms))}–${Math.round(Math.max(...bpms))} BPM`}
            </p>
          </div>
        </header>

        <div className="sets__barra">
          <button className="boton boton--rosa" onClick={() => rep.ponerCola(temas)} disabled={!temas.length || !hayFuente} title={hayFuente ? 'Suena de principio a fin, con fundidos' : 'Conecta tu música para escucharlo'}>
            <IconoPlay width={16} height={16} /> Escuchar el set
          </button>
          <button className="boton boton--fantasma" onClick={autoOrden} disabled={temas.length < 3}>
            Reordenar
          </button>
          <button className="boton boton--fantasma" onClick={set.deshacer} disabled={!set.puedeDeshacer}>
            Deshacer
          </button>
          <button className="boton boton--fantasma" onClick={() => (set.guardar(), avisar(`«${set.nombre}» guardado.`))} disabled={!temas.length || !sinGuardar}>
            {sinGuardar ? 'Guardar' : 'Guardado'}
          </button>
          <details className="sets__menu">
            <summary className="boton boton--fantasma">Exportar</summary>
            <div>
              <button onClick={() => exportar('nml')} disabled={!temas.length}>
                Traktor (.nml)
              </button>
              <button onClick={() => exportar('m3u')} disabled={!temas.length}>
                Playlist (.m3u)
              </button>
              <button onClick={() => exportar('txt')} disabled={!temas.length}>
                Tracklist (.txt)
              </button>
              <button onClick={() => exportar('csv')} disabled={!temas.length}>
                Hoja de cálculo (.csv)
              </button>
            </div>
          </details>
          <button className="boton boton--fantasma" onClick={() => entradaArchivo.current.click()}>
            Importar
          </button>
          <input ref={entradaArchivo} type="file" accept=".nml,.m3u,.m3u8,.txt" hidden onChange={importar} />
          {temas.length > 0 && (
            <button className="sets__vaciar" onClick={() => set.reemplazar([])}>
              Vaciar
            </button>
          )}
        </div>

        {aviso && (
          <p className="sets__aviso" role="status">
            {aviso}
          </p>
        )}

        {temas.length >= 2 && (
          <section className="salud" aria-label="Salud del set">
            <div className="salud__cifras">
              <div className={salud.porcentaje >= 85 ? 'bien' : salud.porcentaje >= 60 ? 'regular' : 'mal'}>
                <strong>
                  {salud.porcentaje}
                  <small>%</small>
                </strong>
                <span>transiciones que pegan</span>
              </div>
              <div>
                <strong>{salud.media}</strong>
                <span>nota media</span>
              </div>
              <div className={salud.choques ? 'mal' : ''}>
                <strong>{salud.choques}</strong>
                <span>choques de tono</span>
              </div>
              <div className={salud.saltos ? 'regular' : ''}>
                <strong>{salud.saltos}</strong>
                <span>saltos de BPM</span>
              </div>
            </div>
            <CurvaSet temas={temas} anclaId={ancla?.id} alElegir={anclar} />
            <ul className="salud__categorias">
              {CATEGORIAS.filter((c) => salud.categorias[c.id]).map((c) => (
                <li key={c.id} style={{ '--cat': c.color }}>
                  {c.nombre} · {salud.categorias[c.id]}
                </li>
              ))}
            </ul>
          </section>
        )}

        {temas.length === 0 ? (
          <div className="sets__vacio">
            <Mascota bpm={124} variante="icono" tamano={120} />
            <p>Tu set está vacío. Añade temas desde la derecha, desde la biblioteca o carga una de tus playlists.</p>
          </div>
        ) : (
          <ol ref={lista} className="lista-set" onDragEnd={() => setArrastre(null)}>
            {temas.map((t, i) => {
              const tr = i > 0 ? transicion(temas[i - 1], t) : null
              return (
                <Fragment key={t.id}>
                  {tr && (
                    <li className="transicion" style={{ '--cat': tr.categoria?.color ?? '#555' }} aria-label={tr.categoria ? `Transición ${tr.categoria.nombre}, ${tr.nota} sobre 100` : 'Choque de tono'}>
                      <span className="transicion__chip">{tr.categoria ? `${tr.categoria.nombre} · ${tr.nota}` : 'Choca'}</span>
                      {tr.diferencia != null && <span className="transicion__bpm">{tr.diferencia > 0 ? `+${tr.diferencia}` : tr.diferencia === 0 ? '±0' : tr.diferencia} BPM</span>}
                    </li>
                  )}
                  <li>
                    <FilaSet
                      tema={t}
                      indice={i}
                      total={temas.length}
                      esAncla={t.id === ancla?.id}
                      sonando={t.id === sonandoId}
                      arrastre={arrastre?.sobre === i ? arrastre.lado : arrastre?.desde === i ? 'origen' : null}
                      alArrastrar={(desde) => setArrastre({ desde, sobre: null, lado: null })}
                      alSoltar={alSoltar}
                      alMover={set.mover}
                      alAnclar={anclar}
                      alCambiar={pedirCambio}
                      alQuitar={quitar}
                      alReproducir={reproducir}
                    />
                    {cambiando === t.id && <Cambiazo tema={t} alElegir={(nuevo) => (set.cambiar(t.id, nuevo.id), setCambiando(null))} alCerrar={() => setCambiando(null)} />}
                  </li>
                </Fragment>
              )
            })}
          </ol>
        )}
      </main>

      <PanelAnadir ancla={ancla} biblioteca={biblioteca} playlists={playlists} porId={porId} avisar={avisar} />
    </div>
  )
}

/** Otros temas para el mismo hueco: misma clave y BPM parecido. */
function Cambiazo({ tema, alElegir, alCerrar }) {
  const { temas: biblioteca } = useBiblioteca()
  const { enSet } = useSet()
  const opciones = useMemo(() => cambiazos(tema, biblioteca, enSet), [tema, biblioteca, enSet])
  return (
    <div className="cambiazo">
      <div className="cambiazo__cabecera">
        <span className="etiqueta-seccion">Cambiar por · {tema.clave?.id} · ±4 %</span>
        <button onClick={alCerrar} aria-label="Cerrar">
          ✕
        </button>
      </div>
      {opciones.length === 0 ? (
        <p>No hay otro tema con la misma clave y un BPM tan parecido.</p>
      ) : (
        <ul>
          {opciones.map((o) => (
            <li key={o.tema.id}>
              <button onClick={() => alElegir(o.tema)}>
                <span className="muestra" style={{ background: colorBpm(o.tema.bpm) }} />
                <span>
                  <strong>{o.tema.titulo}</strong>
                  <small>
                    {o.tema.artista} · {o.tema.bpm} BPM
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Panel derecho: qué pega con el ancla, buscar en la biblioteca, tus playlists y tus sets guardados. */
function PanelAnadir({ ancla, biblioteca, playlists, porId, avisar }) {
  const set = useSet()
  const [pestana, setPestana] = useState('pegan')
  const [busqueda, setBusqueda] = useState('')

  const candidatos = useMemo(() => candidatosTras(ancla, biblioteca, set.enSet, 12), [ancla, biblioteca, set.enSet])
  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim())
    if (q.length < 2) return []
    return biblioteca.filter((t) => !set.enSet.has(t.id) && normalizar(`${t.titulo} ${t.artista} ${t.clave?.id ?? ''}`).includes(q)).slice(0, 30)
  }, [busqueda, biblioteca, set.enSet])

  const pestanas = [
    ['pegan', 'Pegan'],
    ['buscar', 'Buscar'],
    ['listas', 'Playlists'],
    ['guardados', `Guardados · ${set.guardados.length}`],
  ]

  return (
    <aside className="anadir" aria-label="Añadir al set">
      <div className="anadir__pestanas" role="tablist">
        {pestanas.map(([id, nombre]) => (
          <button key={id} role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}>
            {nombre}
          </button>
        ))}
      </div>

      {pestana === 'pegan' && (
        <>
          <p className="anadir__nota">{ancla ? <>Pegan después de <strong>{ancla.titulo}</strong>. Pulsa ◎ en otra fila para cambiar de ancla.</> : 'Añade un tema y te digo qué pega después.'}</p>
          <ListaAnadir items={candidatos.map((c) => ({ tema: c.tema, detalle: `${c.categoria.nombre} · ${c.nota}`, color: c.categoria.color }))} alAnadir={(t) => set.anadir(t.id, ancla?.id)} />
        </>
      )}

      {pestana === 'buscar' && (
        <>
          <label className="buscador anadir__buscador">
            <span className="solo-lectores">Buscar en la biblioteca</span>
            <input type="search" placeholder="Tema, artista o clave" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoFocus />
          </label>
          <ListaAnadir items={resultados.map((t) => ({ tema: t, detalle: `${t.artista}` }))} alAnadir={(t) => set.anadir(t.id)} />
        </>
      )}

      {pestana === 'listas' && (
        <ul className="anadir__listas">
          {playlists.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  set.reemplazar(p.temas, p.nombre)
                  avisar(`«${p.nombre}» cargada como set (${p.temas.length} temas). Puedes deshacer.`)
                }}
              >
                <PortadaSet temas={p.temas.map((id) => porId.get(id)).filter(Boolean)} tamano={44} />
                <span>
                  <strong>{p.nombre}</strong>
                  <small>{p.temas.length} temas</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {pestana === 'guardados' &&
        (set.guardados.length === 0 ? (
          <p className="anadir__nota">Todavía no has guardado ningún set.</p>
        ) : (
          <ul className="anadir__guardados">
            {set.guardados.map((g) => (
              <li key={g.id}>
                <button
                  className="guardado"
                  onClick={() => {
                    set.reemplazar(g.ids, g.nombre)
                    avisar(`«${g.nombre}» cargado. Puedes deshacer.`)
                  }}
                >
                  <PortadaSet temas={g.ids.map((id) => porId.get(id)).filter(Boolean)} tamano={140} />
                  <span className="guardado__etiqueta">
                    <strong>{g.nombre}</strong>
                    <small>
                      {g.ids.length} temas · {new Date(g.creado).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    </small>
                  </span>
                </button>
                <button className="guardado__borrar" onClick={() => set.borrarGuardado(g.id)} aria-label={`Borrar ${g.nombre}`}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ))}
    </aside>
  )
}

function ListaAnadir({ items, alAnadir }) {
  const { hayFuente } = useMusica()
  const { reproducir } = useReproductor()
  if (!items.length) return null
  return (
    <ul className="anadir__lista">
      {items.map(({ tema, detalle, color }) => (
        <li key={tema.id}>
          <span className="muestra" style={{ background: colorBpm(tema.bpm) }} aria-hidden="true" />
          <span className="anadir__texto">
            <strong>{tema.titulo}</strong>
            <small>
              {color && <i style={{ background: color }} aria-hidden="true" />}
              {detalle} · {tema.bpm} BPM · {tema.clave?.id ?? '—'}
            </small>
          </span>
          {hayFuente && (
            <button className="anadir__boton" onClick={() => reproducir(tema)} aria-label={`Escuchar ${tema.titulo}`}>
              <IconoPlay width={14} height={14} />
            </button>
          )}
          <button className="anadir__boton anadir__boton--mas" onClick={() => alAnadir(tema)} aria-label={`Añadir ${tema.titulo} al set`}>
            <IconoMasSimple width={16} height={16} />
          </button>
        </li>
      ))}
    </ul>
  )
}
