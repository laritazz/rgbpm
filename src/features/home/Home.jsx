import { useMemo } from 'react'
import Cartel from '../../components/Cartel'
import Logo from '../../components/marca/Logo'
import Mascota from '../../components/marca/Mascota'
import { precargar } from '../../app/pantallas'
import { SECCIONES } from '../../app/secciones'
import { useCazados } from '../../hooks/useCazados'
import { useUso } from '../../hooks/useUso'
import { PLANO_INICIO } from '../../lib/composicion'
import { escalasPorUso } from '../../lib/uso'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { useRecord } from '../juego/useRecord'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import { useSet } from '../sets/SetContext'
import './Home.css'

/** Lo que cuenta cada círculo, con tus datos. */
function useDatos() {
  const { temas, playlists } = useBiblioteca()
  const { guardados } = useSet()
  const { cazados } = useCazados()
  const { mejor } = useRecord('bpm')
  const { hayFuente, tieneArchivo } = useMusica()
  return useMemo(() => {
    const tonos = new Set(temas.map((t) => t.clave?.id).filter(Boolean)).size
    const bpms = temas.map((t) => t.bpm).filter(Boolean)
    const conAudio = hayFuente ? temas.filter(tieneArchivo).length : 0
    const sets = guardados.length + playlists.length
    return {
      resumen: bpms.length ? `${temas.length.toLocaleString('es')}\u00a0temas · ${tonos}\u00a0tonos · ${Math.round(Math.min(...bpms))}–${Math.round(Math.max(...bpms))}\u00a0BPM` : '',
      secciones: {
        biblioteca: `${temas.length.toLocaleString('es')} temas`,
        armonia: `${tonos} tonos`,
        sets: `${sets} ${sets === 1 ? 'set' : 'sets'}`,
        tap: cazados.length ? `${cazados.length} cazados` : 'BPM y clave',
        juego: mejor ? `Récord ${mejor}` : '5 juegos',
        radio: hayFuente ? `${conAudio.toLocaleString('es')} con audio` : 'Conecta tu música',
        mezclador: 'Pronto',
      },
    }
  }, [temas, playlists, guardados, cazados, mejor, hayFuente, tieneArchivo])
}

/**
 * Inicio: un cartel vivo en rosa. Cada círculo negro es una sección, con su icono y un dato tuyo;
 * su tamaño sale de cuánto la usas esta temporada. La mascota vive en el del centro.
 */
export default function Home() {
  const { hayFuente, abrirAjustes } = useMusica()
  const { tema, sonando } = useReproductor()
  const datos = useDatos()
  const uso = useUso()
  const escalas = useMemo(() => escalasPorUso(uso, SECCIONES.map((s) => s.id)), [uso])
  const items = useMemo(() => SECCIONES.map((s) => ({ ...s, dato: datos.secciones[s.id] })), [datos])

  return (
    <main className="home">
      <header className="home__cabecera">
        <div className="home__marca">
          <Logo variante="negro" ancho={132} />
          {datos.resumen && <span className="home__resumen">{datos.resumen}</span>}
        </div>
        <button className="home__musica" onClick={abrirAjustes}>
          <span className={`home__luz${hayFuente ? ' home__luz--on' : ''}`} aria-hidden="true" />
          Tu música
        </button>
      </header>

      <Cartel
        plano={PLANO_INICIO}
        items={items}
        escalas={escalas}
        alPasar={(s) => precargar(s.id)}
        cuerpo={{ bpm: tema?.bpm ?? 124, tocando: true }}
        mascota={(mira) => <Mascota bpm={tema?.bpm ?? 124} tocando variante="negra" soloCara tamano="100%" mira={mira} etiqueta={sonando ? 'Mascota bailando' : 'Mascota'} />}
      />
    </main>
  )
}
