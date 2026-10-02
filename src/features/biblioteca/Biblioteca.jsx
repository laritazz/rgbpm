import { useCallback, useDeferredValue, useMemo } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useProgresivo } from '../../hooks/useProgresivo'
import { FRANJAS } from '../../lib/color'
import { useBiblioteca } from './BibliotecaContext'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import PanelSonando from './PanelSonando'
import TarjetaPantone from './TarjetaPantone'
import './Biblioteca.css'
import ElegirNotacion from '../armonia/ElegirNotacion'

const ORDENES = {
  set: { nombre: 'Orden del set', fn: null },
  bpm: { nombre: 'BPM', fn: (a, b) => (a.bpm ?? 999) - (b.bpm ?? 999) },
  clave: { nombre: 'Clave', fn: (a, b) => (a.clave?.open ?? 99) - (b.clave?.open ?? 99) || (a.clave?.menor ? 0 : 1) - (b.clave?.menor ? 0 : 1) },
  titulo: { nombre: 'Título', fn: (a, b) => a.titulo.localeCompare(b.titulo, 'es') },
}

const rango = (f) => (f.hasta > 300 ? `${f.desde}+` : f.desde ? `${f.desde}–${f.hasta}` : `<${f.hasta}`)

const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Biblioteca: portadas Pantone ordenadas por color = BPM.
 * Todo el estado de la vista vive en la URL (?q, ?franja, ?orden, ?tema): se puede compartir y volver atrás.
 */
export default function Biblioteca() {
  const { temas, playlists, porId, estado } = useBiblioteca()
  const { setId } = useParams()
  const [params, setParams] = useSearchParams()
  const { audibles, tieneArchivo } = useMusica()
  const { tema: temaSonando, sonando, reproducir } = useReproductor()
  const sonandoId = sonando ? temaSonando?.id : null

  const q = params.get('q') ?? ''
  const franja = params.get('franja') ?? 'todas'
  const playlist = setId ? playlists.find((p) => p.id === setId) : null
  const orden = params.get('orden') ?? (playlist ? 'set' : 'bpm')
  const temaId = params.get('tema')

  // Cambia un parámetro sin tocar los demás. replace: escribir no llena el historial
  const poner = useCallback(
    (clave, valor, historial = false) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p)
          if (valor === null || valor === '') n.delete(clave)
          else n.set(clave, valor)
          return n
        },
        { replace: !historial }
      ),
    [setParams]
  )

  const elegir = useCallback((id) => poner('tema', id, true), [poner])

  // La búsqueda se difiere: el campo responde al instante y la rejilla se pone al día después
  const qDiferida = useDeferredValue(q)

  // Por defecto solo lo que suena (si hay bastante); «Todos» enseña también los mudos
  const conAudio = audibles.length >= 12
  const soloAudio = conAudio && params.get('audio') !== 'todos'
  const base = useMemo(() => {
    const lista = playlist ? playlist.temas.map((id) => porId.get(id)).filter(Boolean) : temas
    return soloAudio ? lista.filter(tieneArchivo) : lista
  }, [playlist, porId, temas, soloAudio, tieneArchivo])

  const filtrados = useMemo(() => {
    const texto = normalizar(qDiferida.trim())
    const f = FRANJAS.find((x) => x.id === franja)
    let lista = base.filter((t) => {
      if (f && !(t.bpm >= f.desde && t.bpm < f.hasta)) return false
      if (!texto) return true
      return normalizar(`${t.titulo} ${t.artista} ${t.clave?.id ?? ''} ${t.clave?.camelot ?? ''} ${t.genero}`).includes(texto)
    })
    const fn = ORDENES[orden]?.fn
    if (fn) lista = [...lista].sort(fn)
    return lista
  }, [base, qDiferida, franja, orden])

  const { visibles, quedan, centinela } = useProgresivo(filtrados)
  const tema = temaId ? porId.get(temaId) : null

  if (setId && !playlist && estado !== 'cargando') return <Navigate to="/biblioteca" replace />

  return (
    <div className={`biblioteca${tema ? ' biblioteca--con-tema' : ''}`}>
      <main className="biblioteca__principal">
        <header className="biblioteca__cabecera">
          <h1>{playlist ? playlist.nombre : 'Biblioteca'}</h1>
          <span className="biblioteca__cuenta" aria-live="polite">
            {filtrados.length.toLocaleString('es')} {filtrados.length === 1 ? 'tema' : 'temas'}
          </span>
        </header>

        <ElegirNotacion />

        <div className="biblioteca__controles">
          <label className="buscador">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span className="solo-lectores">Buscar</span>
            <input type="search" value={q} onChange={(e) => poner('q', e.target.value)} placeholder="Tema, artista o clave (8m, 5A…)" />
          </label>
          <label className="selector">
            <span className="solo-lectores">Ordenar por</span>
            <select value={orden} onChange={(e) => poner('orden', e.target.value)}>
              {Object.entries(ORDENES)
                .filter(([id]) => id !== 'set' || playlist)
                .map(([id, o]) => (
                  <option key={id} value={id}>
                    {o.nombre}
                  </option>
                ))}
            </select>
          </label>
        </div>

        {conAudio && (
          <div className="biblioteca__audio" role="group" aria-label="Qué temas enseñar">
            <button aria-pressed={soloAudio} onClick={() => poner('audio', null)}>
              Con audio <span>{audibles.length.toLocaleString('es')}</span>
            </button>
            <button aria-pressed={!soloAudio} onClick={() => poner('audio', 'todos')}>
              Todos <span>{temas.length.toLocaleString('es')}</span>
            </button>
          </div>
        )}

        <div className="franjas" role="group" aria-label="Filtrar por franja de BPM">
          <button className="franja" aria-pressed={franja === 'todas'} onClick={() => poner('franja', null)}>
            <span className="franja__muestra franja__muestra--todas" aria-hidden="true" />
            Todas
          </button>
          {FRANJAS.map((f) => (
            <button key={f.id} className="franja" aria-pressed={franja === f.id} onClick={() => poner('franja', franja === f.id ? null : f.id)}>
              <span className="franja__muestra" style={{ background: f.color }} aria-hidden="true" />
              {f.nombre} <span className="franja__rango">{rango(f)}</span>
            </button>
          ))}
        </div>

        <div className="biblioteca__rejilla-caja">
          {filtrados.length === 0 ? (
            <p className="biblioteca__vacio">Nada por aquí. Prueba con otra franja o búsqueda.</p>
          ) : (
            <ul className="rejilla" style={{ opacity: q !== qDiferida ? 0.6 : 1 }}>
              {visibles.map((t) => (
                <li key={t.id}>
                  <TarjetaPantone tema={t} elegida={t.id === temaId} alElegir={elegir} sonando={t.id === sonandoId} alReproducir={tieneArchivo(t) ? reproducir : undefined} />
                </li>
              ))}
            </ul>
          )}
          {quedan && <div ref={centinela} className="biblioteca__centinela" aria-hidden="true" />}
        </div>
      </main>

      <PanelSonando tema={tema} alElegir={elegir} alCerrar={() => poner('tema', null, true)} />
    </div>
  )
}
