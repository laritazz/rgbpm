import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/marca/Logo'
import Mascota from '../../components/marca/Mascota'
import { abrirDesde } from '../../app/circulo'
import { precargar } from '../../app/pantallas'
import { empaquetar } from '../../lib/burbujas'
import { colorBpm } from '../../lib/color'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import './Home.css'

// Las secciones son los círculos negros; el tamaño dice cuánto se usan
const SECCIONES = [
  { id: 'biblioteca', a: '/biblioteca', nombre: 'Biblioteca', r: 17 },
  { id: 'armonia', a: '/armonia', nombre: 'Armonía', r: 16 },
  { id: 'sets', a: '/sets', nombre: 'Sets', r: 15 },
  { id: 'juego', a: '/juego', nombre: 'Juego', r: 12.5 },
  { id: 'tap', a: '/tap', nombre: 'Escuchar', r: 12 },
  { id: 'radio', a: '/radio', nombre: 'Radio', r: 11.5 },
  { id: 'mezclador', a: '/mezclador', nombre: 'Mezclador', r: 11 },
]

// Burbujas de adorno: rellenan los huecos y dan ritmo. Pocas, en tonos de la casa y alguna de la escala de BPM.
const ADORNOS = [
  [7, '#ffffff'], [4.5, '#ff009d'], [8.5, '#ffb8e2'], [3.5, '#000000'], [6, '#ffffff'], [5, colorBpm(124)],
  [3, '#ff009d'], [7.5, '#ffb8e2'], [4, '#ffffff'], [2.5, '#000000'], [5.5, colorBpm(165)], [3.5, '#ffb8e2'],
].map(([r, color], i) => ({ id: `adorno${i}`, r, color }))

// Orden de colocación: la mascota, luego secciones y adornos intercalados (así los huecos quedan repartidos)
const ORDEN = [
  { id: 'mascota', r: 22 },
  SECCIONES[0], SECCIONES[1], SECCIONES[2], ADORNOS[0], SECCIONES[3], ADORNOS[1], SECCIONES[4], ADORNOS[2],
  SECCIONES[5], SECCIONES[6], ...ADORNOS.slice(3),
]

/**
 * Home: la mascota en el centro de un racimo de círculos. Cada círculo negro es una sección:
 * al tocarlo se abre en negro y entras. La mascota mira hacia donde vas.
 */
export default function Home() {
  const navegar = useNavigate()
  const { hayFuente, abrirAjustes } = useMusica()
  const { tema, sonando } = useReproductor()
  const [mira, setMira] = useState(null)
  // El racimo se adapta a la forma de la pantalla (se mide al entrar): apaisado en escritorio, alto en el móvil
  const aspecto = useMemo(() => Math.min(1.5, Math.max(0.55, window.innerWidth / Math.max(1, window.innerHeight - 130))), [])
  const vertical = aspecto < 1

  const burbujas = useMemo(() => empaquetar(ORDEN, { hueco: 2, aspecto, angulo: vertical ? -60 : -20 }), [aspecto, vertical])
  const mascota = burbujas[0]
  const alto = 100 / aspecto

  function mirarA(b) {
    const dx = b.x - mascota.x
    const dy = b.y - mascota.y
    const d = Math.hypot(dx, dy) || 1
    setMira({ x: dx / d, y: dy / d })
  }

  function entrar(e, b) {
    const destino = b.a
    abrirDesde(e.currentTarget, { color: '#000000', alCubrir: () => navegar(destino) })
  }

  return (
    <main className="home">
      <header className="home__cabecera">
        <Logo variante="negro" ancho={132} />
        <button className="home__musica" onClick={abrirAjustes}>
          <span className={`home__luz${hayFuente ? ' home__luz--on' : ''}`} aria-hidden="true" />
          Tu música
        </button>
      </header>

      <nav className="home__zona" aria-label="Secciones">
        <div className="burbujas" style={{ '--aspecto': aspecto }}>
          {burbujas.map((b, i) => {
            const estilo = {
              '--i': i,
              '--r': b.r,
              left: `${b.x - b.r}%`,
              top: `${((b.y - b.r) / alto) * 100}%`,
              width: `${b.r * 2}%`,
              '--dur': `${5 + (i % 4)}s`,
              '--retraso': `${-i * 0.6}s`,
            }
            if (b.id === 'mascota') {
              return (
                <div key={b.id} className="burbuja burbuja--mascota" style={estilo}>
                  <Mascota bpm={tema?.bpm ?? 124} tocando variante="negra" tamano="100%" mira={mira} etiqueta={sonando ? 'Mascota bailando' : 'Mascota'} />
                </div>
              )
            }
            if (b.a) {
              return (
                <button
                  key={b.id}
                  className="burbuja burbuja--seccion"
                  style={estilo}
                  onPointerEnter={() => (mirarA(b), precargar(b.id))}
                  onPointerLeave={() => setMira(null)}
                  onFocus={() => (mirarA(b), precargar(b.id))}
                  onBlur={() => setMira(null)}
                  onClick={(e) => entrar(e, b)}
                >
                  {b.nombre}
                </button>
              )
            }
            return <span key={b.id} className="burbuja burbuja--adorno" style={{ ...estilo, background: b.color }} aria-hidden="true" />
          })}
        </div>
      </nav>
    </main>
  )
}
