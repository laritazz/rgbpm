import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/marca/Logo'
import Mascota from '../../components/marca/Mascota'
import { abrirDesde } from '../../app/circulo'
import { precargar } from '../../app/pantallas'
import { SECCIONES } from '../../app/secciones'
import { useCazados } from '../../hooks/useCazados'
import { componer, escalaPorDato, puntoEtiqueta } from '../../lib/composicion'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { useRecord } from '../juego/useRecord'
import { useMusica } from '../musica/MusicaContext'
import { useReproductor } from '../musica/ReproductorContext'
import { useSet } from '../sets/SetContext'
import './Home.css'

const entre = (v, min, max) => Math.min(max, Math.max(min, v))
const POR_ID = Object.fromEntries(SECCIONES.map((s) => [s.id, s]))

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

/** Lo que cuenta cada círculo, con tus datos. El tamaño sale de ahí: cuanto más usas algo, más grande. */
function useDatos() {
  const { temas, playlists } = useBiblioteca()
  const { guardados } = useSet()
  const { cazados } = useCazados()
  const { mejor } = useRecord()
  const { hayFuente, tieneArchivo } = useMusica()
  return useMemo(() => {
    const tonos = new Set(temas.map((t) => t.clave?.id).filter(Boolean)).size
    const bpms = temas.map((t) => t.bpm).filter(Boolean)
    const conAudio = hayFuente ? temas.filter(tieneArchivo).length : 0
    const sets = guardados.length + playlists.length
    return {
      resumen: bpms.length ? `${temas.length.toLocaleString('es')} temas · ${tonos} tonos · ${Math.round(Math.min(...bpms))}–${Math.round(Math.max(...bpms))} BPM` : '',
      secciones: {
        biblioteca: { valor: temas.length, lleno: 800, texto: `${temas.length.toLocaleString('es')} temas` },
        armonia: { valor: tonos, lleno: 24, texto: `${tonos} tonos` },
        sets: { valor: sets, lleno: 16, texto: `${sets} ${sets === 1 ? 'set' : 'sets'}` },
        tap: { valor: cazados.length, lleno: 20, texto: cazados.length ? `${cazados.length} cazados` : 'BPM y clave' },
        juego: { valor: mejor, lleno: 450, texto: mejor ? `Récord ${mejor}` : 'Adivina el BPM' },
        radio: { valor: conAudio, lleno: 400, texto: hayFuente ? `${conAudio.toLocaleString('es')} con audio` : 'Conecta tu música' },
        mezclador: { valor: 0, lleno: 1, texto: 'Pronto' },
      },
    }
  }, [temas, playlists, guardados, cazados, mejor, hayFuente, tieneArchivo])
}

/**
 * Inicio: un cartel vivo. Círculos negros de tamaños muy distintos, algunos cortados por el borde,
 * que se funden como gotas cuando se acercan. Cada uno es una sección, con su icono y un dato tuyo.
 * La mascota vive en el del centro y mira hacia donde vas. Al tocar un círculo, se abre en negro.
 */
export default function Home() {
  const navegar = useNavigate()
  const { hayFuente, abrirAjustes } = useMusica()
  const { tema, sonando } = useReproductor()
  const datos = useDatos()
  const [activo, setActivo] = useState(null)
  const zona = useRef(null)
  const medida = useMedida(zona)

  const aspecto = medida ? entre(medida.w / Math.max(1, medida.h), 0.42, 2.6) : 1
  const escalas = useMemo(() => Object.fromEntries(Object.entries(datos.secciones).map(([id, d]) => [id, escalaPorDato(d.valor, d.lleno)])), [datos])
  const pxPorUnidad = medida ? medida.w / 100 : 1
  const px = (valor) => valor / pxPorUnidad
  // Las etiquetas no caen bajo la cabecera ni tan al borde que el texto se corte
  const margenes = useMemo(() => (medida ? { arriba: (150 * 100) / medida.w, abajo: (64 * 100) / medida.w, lados: (96 * 100) / medida.w } : null), [medida])
  const cartel = useMemo(() => componer(aspecto, escalas, margenes), [aspecto, escalas, margenes])
  const { alto, circulos, gotas } = cartel
  const mascota = circulos.find((c) => c.id === 'mascota')
  const corto = Math.min(100, alto)

  const mira = activo && activo !== 'mascota' ? (() => {
    const c = circulos.find((x) => x.id === activo)
    const d = Math.hypot(c.etiqueta.x - mascota.x, c.etiqueta.y - mascota.y) || 1
    return { x: (c.etiqueta.x - mascota.x) / d, y: (c.etiqueta.y - mascota.y) / d }
  })() : null

  function entrar(e, seccion) {
    const destino = seccion.a
    abrirDesde(e.currentTarget.querySelector('.cartel__toque') ?? e.currentTarget, { color: '#000000', alCubrir: () => navegar(destino) })
  }

  // Animación de flotar: cada círculo con su ritmo; la tinta y su etiqueta comparten las mismas variables
  const flota = (i) => ({ '--dur': `${6 + (i % 4) * 1.3}s`, '--retraso': `${-i * 1.1}s`, '--i': i })

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

      <nav className="home__zona" ref={zona} aria-label="Secciones">
        {medida && (
          <>
            <svg className="cartel" viewBox={`0 0 100 ${alto}`} width="100%" height="100%" aria-hidden="true">
              <defs>
                {/* Gotas: desenfoque + umbral une lo que está cerca; el ruido hace el borde imperfecto */}
                <filter id="tinta" filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height={alto + 40}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation={(corto * 0.014).toFixed(2)} result="desenfoque" />
                  <feColorMatrix in="desenfoque" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 26 -11" result="gota" />
                  <feTurbulence type="fractalNoise" baseFrequency={(1 / (corto * 0.2)).toFixed(3)} numOctaves="2" seed="4" result="ruido" />
                  <feDisplacementMap in="gota" in2="ruido" scale={(corto * 0.022).toFixed(2)} xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
              <g filter="url(#tinta)">
                {circulos.map((c, i) => (
                  <circle
                    key={c.id}
                    cx={c.x}
                    cy={c.y}
                    r={c.r}
                    className={`cartel__tinta${activo === c.id ? ' cartel__tinta--activa' : ''}${c.id === 'mascota' ? ' cartel__tinta--quieta' : ''}`}
                    style={{ ...flota(i), transformOrigin: `${c.x}px ${c.y}px` }}
                  />
                ))}
                {gotas.map((g, i) => (
                  <circle key={g.id} cx={g.x} cy={g.y} r={g.r} className="cartel__gota" style={{ '--dur': `${7 + i * 1.7}s`, '--retraso': `${-i * 2}s` }} />
                ))}
              </g>

              {circulos
                .filter((c) => c.id !== 'mascota')
                .map((c) => {
                  const s = POR_ID[c.id]
                  const i = circulos.indexOf(c)
                  const radioPx = c.r * pxPorUnidad
                  // Todo cabe dentro del círculo: el texto se ajusta a su ancho (Urbanist ≈ 0,56 em por letra)
                  const texto = datos.secciones[c.id].texto
                  const cabe = (letras, ancho) => (ancho * radioPx) / (letras * 0.56)
                  const iconoPx = entre(radioPx * 0.3, 20, 72)
                  const nombrePx = Math.min(entre(radioPx * 0.19, 13, 36), cabe(s.nombre.length, 1.45))
                  const datoPx = Math.min(entre(radioPx * 0.1, 11, 17), cabe(texto.length, 1.35))
                  const [icono, nombre, dato] = [px(iconoPx), px(nombrePx), datoPx >= 10 ? px(datoPx) : 0]
                  // Si el círculo está cortado, la etiqueta va a la parte visible, sin que su texto toque el borde
                  const mitad = Math.max(nombrePx * s.nombre.length, dato ? datoPx * texto.length : 0) * 0.28 + 14
                  const { x, y } = puntoEtiqueta(c, 100, alto, { arriba: margenes.arriba, abajo: margenes.abajo, lados: px(mitad) })
                  return (
                    <g
                      key={c.id}
                      className={`cartel__seccion${s.lista ? '' : ' cartel__seccion--pronto'}${activo === c.id ? ' cartel__seccion--activa' : ''}`}
                      style={{ ...flota(i), transformOrigin: `${c.x}px ${c.y}px` }}
                      role="link"
                      tabIndex={0}
                      aria-label={`${s.nombre}: ${datos.secciones[c.id].texto}`}
                      aria-hidden="false"
                      onPointerEnter={() => (setActivo(c.id), precargar(c.id))}
                      onPointerLeave={() => setActivo(null)}
                      onFocus={() => (setActivo(c.id), precargar(c.id))}
                      onBlur={() => setActivo(null)}
                      onClick={(e) => entrar(e, s)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), entrar(e, s))}
                    >
                      <circle className="cartel__toque" cx={c.x} cy={c.y} r={c.r} />
                      <s.Icono x={x - icono / 2} y={y - icono - nombre * 0.35} width={icono} height={icono} className="cartel__icono" />
                      <text x={x} y={y + nombre * 0.75} className="cartel__nombre" fontSize={nombre}>
                        {s.nombre}
                      </text>
                      {dato > 0 && (
                        <text x={x} y={y + nombre * 0.75 + dato * 1.5} className="cartel__dato" fontSize={dato}>
                          {texto}
                        </text>
                      )}
                    </g>
                  )
                })}
            </svg>

            {/* La mascota, dentro de su círculo: su cuerpo negro se funde con la tinta, solo se ve la cara */}
            <div
              className="home__mascota"
              style={{ left: `${mascota.x}%`, top: `${(mascota.y / alto) * 100}%`, width: `${mascota.r * 2 * 1.36}%` }}
            >
              <Mascota bpm={tema?.bpm ?? 124} tocando variante="negra" tamano="100%" mira={mira} etiqueta={sonando ? 'Mascota bailando' : 'Mascota'} />
            </div>
          </>
        )}
      </nav>
    </main>
  )
}
