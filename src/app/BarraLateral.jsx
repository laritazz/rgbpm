import { useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from '../components/marca/Logo'
import { useBiblioteca } from '../features/biblioteca/BibliotecaContext'
import { useMusica } from '../features/musica/MusicaContext'
import { colorBpm } from '../lib/color'

const SECCIONES = [
  { a: '/', nombre: 'Biblioteca', lista: true },
  { a: '/tap', nombre: 'Tap y escucha', lista: true },
  { a: '/radio', nombre: 'Radio', lista: true },
  { a: '/armonia', nombre: 'Armonía' },
  { a: '/sets', nombre: 'Sets' },
  { a: '/mezclador', nombre: 'Mezclador' },
]

// Muestra de color de un set: su recorrido de BPM, del más lento al más rápido
function resumenSet(playlist, porId) {
  const bpms = playlist.temas.map((id) => porId.get(id)?.bpm).filter(Boolean).sort((a, b) => a - b)
  if (!bpms.length) return { color: '#333333', rango: '—' }
  const [min, mediana, max] = [bpms[0], bpms[Math.floor(bpms.length / 2)], bpms.at(-1)]
  return {
    color: `linear-gradient(135deg, ${colorBpm(min)}, ${colorBpm(mediana)} 55%, ${colorBpm(max)})`,
    rango: `${Math.round(min)}–${Math.round(max)}`,
  }
}

export default function BarraLateral({ abierta, alCerrar }) {
  const { playlists, porId, origen, nombre, temas, estado, error, importar, volverADemo } = useBiblioteca()
  const musica = useMusica()
  const entrada = useRef(null)
  const navegar = useNavigate()

  async function alElegirArchivo(e) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (archivo && (await importar(archivo))) {
      navegar('/')
      alCerrar?.() // en el móvil, el cajón se cierra para ver la colección
    }
  }

  return (
    <nav id="menu-principal" className={`lateral${abierta ? ' lateral--abierta' : ''}`} aria-label="Principal">
      <div className="lateral__marca">
        <Logo ancho={168} />
        <span className="lateral__firma">by LaritaZZ</span>
      </div>

      <ul className="lateral__secciones">
        {SECCIONES.map((s) => (
          <li key={s.a}>
            <NavLink to={s.a} end className="lateral__enlace">
              <span className="lateral__punto" aria-hidden="true" />
              {s.nombre}
              {!s.lista && <span className="lateral__pronto">Pronto</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      {playlists.length > 0 && (
        <section className="lateral__sets" aria-labelledby="titulo-sets">
          <h2 id="titulo-sets" className="etiqueta-seccion">
            {origen === 'demo' ? 'Mis sets' : 'Tus playlists'}
          </h2>
          <ul>
            {playlists.map((p) => {
              const { color, rango } = resumenSet(p, porId)
              return (
                <li key={p.id}>
                  <NavLink to={`/set/${p.id}`} className="lateral__set">
                    <span className="lateral__muestra" style={{ background: color }} aria-hidden="true" />
                    <span>
                      <span className="lateral__set-nombre">{p.nombre}</span>
                      <span className="lateral__set-rango">
                        {p.temas.length} temas · {rango} BPM
                      </span>
                    </span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="lateral__pie">
        <p className="lateral__origen">
          {origen === 'demo' ? (
            <>Estás viendo una demo con mis sets. Importa tu <code>collection.nml</code> de Traktor: se queda en tu navegador.</>
          ) : (
            <>
              Tu colección: <strong>{temas.length.toLocaleString('es')} temas</strong> de {nombre}. Solo vive en este navegador.
            </>
          )}
        </p>
        {error && (
          <p className="lateral__error" role="alert">
            {error}
          </p>
        )}
        <button className="lateral__musica" onClick={musica.abrirAjustes}>
          <span className={`lateral__luz${musica.hayFuente ? ' lateral__luz--on' : ''}`} aria-hidden="true" />
          <span>
            <strong>Tu música</strong>
            <small>
              {musica.estadoLocal === 'reconectar'
                ? 'Falta dar permiso'
                : musica.hayFuente
                  ? [musica.totalLocal && 'carpeta', musica.privado.conTema && 'privada'].filter(Boolean).join(' + ')
                  : 'Conecta tus archivos para que suene'}
            </small>
          </span>
        </button>
        <input ref={entrada} type="file" accept=".nml" hidden onChange={alElegirArchivo} />
        <button className="boton boton--rosa" onClick={() => entrada.current.click()} disabled={estado === 'leyendo'}>
          {estado === 'leyendo' ? 'Leyendo colección…' : origen === 'demo' ? 'Importar colección' : 'Importar otra'}
        </button>
        {origen !== 'demo' && (
          <button className="boton boton--fantasma" onClick={volverADemo}>
            Volver a la demo
          </button>
        )}
        <span className="lateral__version">{__VERSION__}</span>
      </div>
    </nav>
  )
}
