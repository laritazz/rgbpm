import { useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { abrirDesde } from '../app/circulo'
import { useMedida } from '../hooks/useMedida'
import { componer, puntoEtiqueta } from '../lib/composicion'
import './Cartel.css'

const entre = (v, min, max) => Math.min(max, Math.max(min, v))
// Ancho medio de una letra de RGBPM Letras y de Urbanist, en em: para que el texto quepa en su círculo
const LETRA_NOMBRE = 0.72
const LETRA_DATO = 0.56

/** Los nombres largos van en dos líneas, partidos por el espacio más cercano a la mitad. */
function partir(nombre) {
  if (nombre.length <= 10 || !nombre.includes(' ')) return [nombre]
  let corte = -1
  for (let i = 0; i < nombre.length; i++) if (nombre[i] === ' ' && (corte < 0 || Math.abs(i - nombre.length / 2) < Math.abs(corte - nombre.length / 2))) corte = i
  return [nombre.slice(0, corte), nombre.slice(corte + 1)]
}

/**
 * Un cartel vivo: círculos de tamaños muy distintos, algunos cortados por el borde, que se funden
 * como gotas al acercarse. Cada círculo es un sitio al que ir, con su icono, su nombre y un dato.
 * El del centro es de la mascota: `mascota(mira)` la pinta, mirando hacia el círculo que señalas.
 *
 * @param plano     composición (lib/composicion: PLANO_INICIO, PLANO_JUEGO)
 * @param items     [{ id, a, nombre, Icono, dato, lista }]
 * @param escalas   { [id]: escala } según tu uso
 * @param entrada   color del círculo que se abre al entrar
 * @param arriba    px libres bajo la cabecera (ahí no cae ninguna etiqueta)
 * @param alPasar   al señalar un círculo (para precargar su pantalla)
 */
export default function Cartel({ plano, items, escalas, entrada = '#000000', arriba = 150, alPasar, mascota, etiqueta = 'Secciones', className = '' }) {
  const navegar = useNavigate()
  const filtro = useId()
  const zona = useRef(null)
  const medida = useMedida(zona)
  const [activo, setActivo] = useState(null)

  const aspecto = medida ? entre(medida.w / Math.max(1, medida.h), 0.42, 2.6) : 1
  const pxPorUnidad = medida ? medida.w / 100 : 1
  const px = (valor) => valor / pxPorUnidad
  const margenes = useMemo(() => (medida ? { arriba: (arriba * 100) / medida.w, abajo: (24 * 100) / medida.w, lados: (96 * 100) / medida.w } : null), [medida, arriba])
  const { alto, circulos, gotas } = useMemo(() => componer(aspecto, escalas, margenes, plano), [aspecto, escalas, margenes, plano])
  const porId = useMemo(() => Object.fromEntries(items.map((it) => [it.id, it])), [items])
  const centro = circulos.find((c) => c.id === 'mascota')
  const corto = Math.min(100, alto)

  const señalado = activo ? circulos.find((c) => c.id === activo) : null
  const mira = señalado && centro ? (() => {
    const d = Math.hypot(señalado.x - centro.x, señalado.y - centro.y) || 1
    return { x: (señalado.x - centro.x) / d, y: (señalado.y - centro.y) / d }
  })() : null

  function entrar(e, item) {
    const destino = item.a
    abrirDesde(e.currentTarget.querySelector('.cartel__toque') ?? e.currentTarget, { color: entrada, alCubrir: () => navegar(destino) })
  }

  const señalar = (item) => {
    setActivo(item.id)
    alPasar?.(item)
  }

  // Cada círculo flota a su ritmo; su tinta y su etiqueta comparten las mismas variables
  const flota = (i) => ({ '--dur': `${6 + (i % 4) * 1.3}s`, '--retraso': `${-i * 1.1}s`, '--i': i })

  return (
    <nav className={`cartel-zona ${className}`} ref={zona} aria-label={etiqueta}>
      {medida && (
        <>
          <svg className="cartel" viewBox={`0 0 100 ${alto}`} width="100%" height="100%" aria-hidden="true">
            <defs>
              {/* Gotas: desenfoque + umbral une lo que está cerca; el ruido hace el borde imperfecto */}
              <filter id={filtro} filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height={alto + 40}>
                <feGaussianBlur in="SourceGraphic" stdDeviation={(corto * 0.014).toFixed(2)} result="desenfoque" />
                <feColorMatrix in="desenfoque" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11" result="gota" />
                <feTurbulence type="fractalNoise" baseFrequency={(1 / (corto * 0.2)).toFixed(3)} numOctaves="2" seed="4" result="ruido" />
                <feDisplacementMap in="gota" in2="ruido" scale={(corto * 0.022).toFixed(2)} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g filter={`url(#${filtro})`} className="cartel__capa">
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
              .filter((c) => porId[c.id])
              .map((c) => {
                const item = porId[c.id]
                const i = circulos.indexOf(c)
                const radioPx = c.r * pxPorUnidad
                const texto = item.dato ?? ''
                const cabe = (letras, ancho, em) => (ancho * radioPx) / (Math.max(1, letras) * em)
                const lineas = partir(item.nombre)
                const largo = Math.max(...lineas.map((l) => l.length))
                const iconoPx = entre(radioPx * 0.32, 20, 80)
                // Ancho del círculo que de verdad se ve (si está cortado por el borde, menos)
                const yRef = entre(c.y, margenes.arriba + px(60), alto - px(60))
                const media = Math.sqrt(Math.max(0, c.r * c.r - (yRef - c.y) ** 2))
                const [izq, der] = [Math.max(0, c.x - media), Math.min(100, c.x + media)]
                const visiblePx = (der - izq) * pxPorUnidad
                // El nombre cabe en esa parte visible
                const nombrePx = Math.min(entre(radioPx * 0.2, 13, 40), cabe(largo, 1.45, LETRA_NOMBRE), (visiblePx * 0.84) / (largo * LETRA_NOMBRE))
                const datoPx = Math.min(entre(radioPx * 0.1, 11, 17), cabe(texto.length, 1.35, LETRA_DATO), (visiblePx * 0.84) / (Math.max(1, texto.length) * LETRA_DATO))
                const [icono, nombre, dato] = [px(iconoPx), px(nombrePx), texto && datoPx >= 10 ? px(datoPx) : 0]
                // Si el círculo está cortado, la etiqueta va a la parte visible, sin que su texto toque el borde
                const mitad = Math.max(nombrePx * largo * LETRA_NOMBRE, dato ? datoPx * texto.length * LETRA_DATO : 0) / 2 + 14
                // El bloque entero (icono arriba, nombre y dato abajo) queda dentro de la pantalla
                const encima = iconoPx + nombrePx * 0.4 + ((lineas.length - 1) * nombrePx) / 2
                const debajo = nombrePx * 0.78 + ((lineas.length - 1) * nombrePx) / 2 + (texto ? datoPx * 1.7 : 0) + 18
                const punto = puntoEtiqueta(c, 100, alto, { arriba: margenes.arriba + px(encima), abajo: px(debajo), lados: px(mitad) })
                const x = entre(punto.x, Math.min(izq + px(mitad), (izq + der) / 2), Math.max(der - px(mitad), (izq + der) / 2))
                const y = punto.y - ((lineas.length - 1) * nombre) / 2
                const bajo = y + nombre * 0.78 + (lineas.length - 1) * nombre
                return (
                  <g
                    key={c.id}
                    className={`cartel__item${item.lista === false ? ' cartel__item--pronto' : ''}${activo === c.id ? ' cartel__item--activo' : ''}`}
                    style={{ ...flota(i), transformOrigin: `${c.x}px ${c.y}px` }}
                    role="link"
                    tabIndex={0}
                    aria-label={`${item.nombre}${texto ? `: ${texto}` : ''}`}
                    aria-hidden="false"
                    onPointerEnter={() => señalar(item)}
                    onPointerLeave={() => setActivo(null)}
                    onFocus={() => señalar(item)}
                    onBlur={() => setActivo(null)}
                    onClick={(e) => entrar(e, item)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), entrar(e, item))}
                  >
                    <circle className="cartel__toque" cx={c.x} cy={c.y} r={c.r} />
                    <item.Icono x={x - icono / 2} y={y - icono - nombre * 0.4} width={icono} height={icono} className="cartel__icono" />
                    <text x={x} y={y + nombre * 0.78} className="cartel__nombre" fontSize={nombre}>
                      {lineas.map((l, n) => (
                        <tspan key={l} x={x} dy={n ? nombre : 0}>
                          {l}
                        </tspan>
                      ))}
                    </text>
                    {dato > 0 && (
                      <text x={x} y={bajo + dato * 1.55} className="cartel__dato" fontSize={dato}>
                        {texto}
                      </text>
                    )}
                  </g>
                )
              })}
          </svg>

          {centro && mascota && (
            <div className="cartel__mascota" style={{ left: `${centro.x}%`, top: `${(centro.y / alto) * 100}%`, width: `${centro.r * 2 * 1.36}%` }}>
              {mascota(mira)}
            </div>
          )}
        </>
      )}
    </nav>
  )
}
