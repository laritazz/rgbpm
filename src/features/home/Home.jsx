import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/marca/Logo'
import Mascota from '../../components/marca/Mascota'
import { abrirDesde } from '../../app/circulo'
import { precargar } from '../../app/pantallas'
import { SECCIONES } from '../../app/secciones'
import { empaquetar, inflar } from '../../lib/burbujas'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import './Home.css'

const MASCOTA = { id: 'mascota', r: 25 }
const CIRCULOS = [MASCOTA, ...SECCIONES.map((s) => ({ ...s, r: s.peso }))]

/** Mide una caja y avisa cuando cambia de tamaño (girar el móvil, estirar la ventana). */
function useMedida(ref) {
  const [medida, setMedida] = useState(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect
      setMedida((m) => (m && Math.abs(m.w - width) < 2 && Math.abs(m.h - height) < 2 ? m : { w: width, h: height }))
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [ref])
  return medida
}

/**
 * Inicio: la mascota en el centro de un racimo de círculos que llena la pantalla.
 * Cada círculo es una sección, con su icono. Al tocarlo se abre en negro y entras.
 */
export default function Home() {
  const navegar = useNavigate()
  const { hayFuente, abrirAjustes } = useMusica()
  const { tema, sonando } = useReproductor()
  const [mira, setMira] = useState(null)
  const zona = useRef(null)
  const medida = useMedida(zona)

  // El racimo toma la forma de la zona libre: apaisado en escritorio, alto en el móvil
  const aspecto = medida ? Math.min(2.4, Math.max(0.45, medida.w / Math.max(1, medida.h))) : 1
  // Primero en racimo; luego se inflan hasta llenar toda la zona
  const circulos = useMemo(() => inflar(empaquetar(CIRCULOS, { hueco: 1.2, aspecto, angulo: aspecto < 1 ? -70 : -15, margen: 0.5 }), { aspecto, hueco: 1.2 }), [aspecto])
  const mascota = circulos[0]
  const alto = 100 / aspecto

  function mirarA(c) {
    const dx = c.x - mascota.x
    const dy = c.y - mascota.y
    const d = Math.hypot(dx, dy) || 1
    setMira({ x: dx / d, y: dy / d })
  }

  const posicion = (c, i) => ({
    '--i': i,
    '--r': c.r,
    left: `${c.x - c.r}%`,
    top: `${((c.y - c.r) / alto) * 100}%`,
    width: `${c.r * 2}%`,
    '--dur': `${5 + (i % 4)}s`,
    '--retraso': `${-i * 0.6}s`,
  })

  return (
    <main className="home">
      <header className="home__cabecera">
        <Logo variante="negro" ancho={132} />
        <button className="home__musica" onClick={abrirAjustes}>
          <span className={`home__luz${hayFuente ? ' home__luz--on' : ''}`} aria-hidden="true" />
          Tu música
        </button>
      </header>

      <nav className="home__zona" ref={zona} aria-label="Secciones">
        {medida && (
          <div className="burbujas" style={{ '--aspecto': aspecto }}>
            <div className="burbuja burbuja--mascota" style={posicion(mascota, 0)}>
              <Mascota bpm={tema?.bpm ?? 124} tocando variante="negra" tamano="100%" mira={mira} etiqueta={sonando ? 'Mascota bailando' : 'Mascota'} />
            </div>
            {circulos.slice(1).map((c, i) => (
              <button
                key={c.id}
                className={`burbuja burbuja--seccion${c.lista ? '' : ' burbuja--pronto'}`}
                style={posicion(c, i + 1)}
                onPointerEnter={() => (mirarA(c), precargar(c.id))}
                onPointerLeave={() => setMira(null)}
                onFocus={() => (mirarA(c), precargar(c.id))}
                onBlur={() => setMira(null)}
                onClick={(e) => abrirDesde(e.currentTarget, { color: '#000000', alCubrir: () => navegar(c.a) })}
              >
                <c.Icono className="burbuja__icono" />
                <span>{c.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </nav>
    </main>
  )
}
