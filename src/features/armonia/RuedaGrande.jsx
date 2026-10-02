import { memo } from 'react'
import Mascota from '../../components/marca/Mascota'
import { clave } from '../../lib/claves'
import { colorBpm } from '../../lib/color'

const C = 260
const R_MAYOR = 214
const R_MENOR = 150
const TONOS = Array.from({ length: 12 }, (_, i) => [clave(i + 1, false), clave(i + 1, true)]).flat()

const angulo = (k) => (((k.open - 1) * 30 - 90) * Math.PI) / 180
const surco = (k) => (k.menor ? R_MENOR : R_MAYOR)
const punto = (a, r) => [C + r * Math.cos(a), C + r * Math.sin(a)]
const f = (n) => n.toFixed(1)

// Surcos finos del disco, de la galleta al borde
const SURCOS = Array.from({ length: 42 }, (_, i) => 104 + i * 3.5)

/**
 * Tramo de la aguja entre dos tonos: avanza por el surco del primero (arco) y, si cambia
 * de mayor a menor, salta de pista en línea recta. Nunca cruza el disco.
 */
function tramo(a, b) {
  const [ra, rb] = [surco(a), surco(b)]
  const a0 = angulo(a)
  let giro = angulo(b) - a0
  while (giro > Math.PI) giro -= 2 * Math.PI
  while (giro < -Math.PI) giro += 2 * Math.PI
  const [x0, y0] = punto(a0, ra)
  const [x1, y1] = punto(a0 + giro, ra)
  const [x2, y2] = punto(a0 + giro, rb)
  let d = `M${f(x0)} ${f(y0)}`
  if (Math.abs(giro) > 0.01) d += ` A${ra} ${ra} 0 0 ${giro > 0 ? 1 : 0} ${f(x1)} ${f(y1)}`
  if (ra !== rb) d += ` L${f(x2)} ${f(y2)}`
  return d
}

/**
 * Rueda armónica en forma de vinilo: mayores en el surco de fuera, menores en el de dentro.
 * Rosa, la clave de salida; en el color de su categoría, lo que pega. El set sugerido es la ruta
 * de la aguja por los surcos, y la galleta central lleva la mascota con el color del BPM.
 * Cada tono es un botón: tocarlo cambia la clave de salida.
 */
function RuedaGrande({ semilla, relacion, camino, cuantos, bpm, etiqueta, alElegir }) {
  // Un tono puede repetirse en el set (quedarse en la clave): guarda todos sus pasos
  const pasoDe = new Map()
  camino.forEach((p, i) => pasoDe.set(p.clave.id, [...(pasoDe.get(p.clave.id) ?? []), i + 1]))
  const tramos = camino
    .slice(1)
    .map((p, i) => ({ desde: camino[i].clave, hasta: p.clave, color: p.categoria?.color ?? '#ffffff' }))
    .filter((t) => t.desde.id !== t.hasta.id) // quedarse en el tono no dibuja línea
    .map((t) => ({ d: tramo(t.desde, t.hasta), color: t.color }))
  const ruta = tramos.map((t) => t.d).join(' ')
  // Una vuelta del brillo cada dos compases, al tempo de salida
  const vuelta = `${((8 * 60) / (bpm || 120)).toFixed(2)}s`

  return (
    <div className="vinilo-rueda" style={{ '--vuelta': vuelta }}>
      <svg className="rueda" viewBox="0 0 520 520" role="group" aria-label={`Rueda armónica. Clave de salida: ${etiqueta(semilla)}`}>
        <defs>
          <radialGradient id="rueda-disco">
            <stop offset="0" stopColor="#1c1c1c" />
            <stop offset="0.65" stopColor="#0b0b0b" />
            <stop offset="1" stopColor="#040404" />
          </radialGradient>
          <filter id="rueda-brillo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <circle cx={C} cy={C} r="256" fill="url(#rueda-disco)" />
        {SURCOS.map((r, i) => (
          <circle key={r} cx={C} cy={C} r={r} className={`rueda__surco${i % 2 ? ' rueda__surco--par' : ''}`} />
        ))}
        {/* Dos reflejos de luz que giran al tempo, como un disco en el plato */}
        <g className="rueda__reflejos" aria-hidden="true">
          <path d={`M${C} ${C} L${f(C + 256 * Math.cos(-2.2))} ${f(C + 256 * Math.sin(-2.2))} A256 256 0 0 1 ${f(C + 256 * Math.cos(-1.7))} ${f(C + 256 * Math.sin(-1.7))}Z`} />
          <path d={`M${C} ${C} L${f(C + 256 * Math.cos(0.94))} ${f(C + 256 * Math.sin(0.94))} A256 256 0 0 1 ${f(C + 256 * Math.cos(1.44))} ${f(C + 256 * Math.sin(1.44))}Z`} />
        </g>
        <circle cx={C} cy={C} r={R_MAYOR} className="rueda__pista" />
        <circle cx={C} cy={C} r={R_MENOR} className="rueda__pista" />

        {/* key: al cambiar el camino, la ruta se vuelve a dibujar desde el principio */}
        <g key={ruta} className="rueda__camino" aria-hidden="true">
          {tramos.map((t, i) => (
            <g key={i} style={{ '--i': i }}>
              <path d={t.d} className="rueda__halo" stroke={t.color} filter="url(#rueda-brillo)" pathLength="1" />
              <path d={t.d} className="rueda__linea" stroke={t.color} pathLength="1" />
            </g>
          ))}
          {ruta && (
            <circle r="7" className="rueda__aguja">
              <animateMotion dur={`${Math.max(4, tramos.length * 1.6)}s`} repeatCount="indefinite" path={ruta} />
            </circle>
          )}
        </g>

        {TONOS.map((k) => {
          const [x, y] = punto(angulo(k), surco(k))
          const esSemilla = k.id === semilla.id
          const categoria = relacion.get(k.id)
          const pasos = pasoDe.get(k.id)
          // Si el tono se repite, «3+»: el número del primer paso y la pista de que vuelve (la lista completa va en el texto)
          const paso = pasos ? `${pasos[0]}${pasos.length > 1 ? '+' : ''}` : null
          const temas = cuantos.get(k.id) ?? 0
          const texto = `${etiqueta(k)} · ${k.nombre}${esSemilla ? ' (salida)' : categoria ? ` · ${categoria.nombre}` : ''} · ${temas} ${temas === 1 ? 'tema' : 'temas'}${pasos ? ` · ${pasos.length > 1 ? 'pasos' : 'paso'} ${pasos.join(', ')}` : ''}`
          const elegir = () => alElegir(k)
          const [bx, by] = punto(angulo(k), surco(k) + (k.menor ? -23 : 25))
          return (
            <g
              key={k.id}
              className={`rueda__tono${esSemilla ? ' rueda__tono--semilla' : ''}${categoria ? ' rueda__tono--pega' : ''}${temas ? '' : ' rueda__tono--vacio'}`}
              style={{ '--c': esSemilla ? 'var(--rosa)' : (categoria?.color ?? '#151515'), transformOrigin: `${x}px ${y}px` }}
              role="button"
              tabIndex={0}
              aria-label={texto}
              aria-pressed={esSemilla}
              onClick={elegir}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), elegir())}
            >
              <title>{texto}</title>
              <rect x={f(x - 21)} y={f(y - 12.5)} width="42" height="25" rx="12.5" className="rueda__nodo" />
              <text x={f(x)} y={f(y + 4.6)} className="rueda__etiqueta">
                {etiqueta(k)}
              </text>
              {paso && (
                <g className="rueda__paso" aria-hidden="true">
                  {pasos.length === 1 ? <circle cx={f(bx)} cy={f(by)} r="9" /> : <rect x={f(bx - 4 - paso.length * 3)} y={f(by - 9)} width={f(8 + paso.length * 6)} height="18" rx="9" />}
                  <text x={f(bx)} y={f(by + 3.4)}>
                    {paso}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Galleta central: el color es el BPM de salida */}
        <circle cx={C} cy={C} r="92" fill={colorBpm(bpm)} className="rueda__galleta" />
        <circle cx={C} cy={C} r="92" className="rueda__galleta-borde" />
        <text x={C} y={C + 72} className="rueda__galleta-texto">
          {etiqueta(semilla).toUpperCase()} · {bpm} BPM
        </text>
      </svg>
      <div className="vinilo-rueda__mascota">
        <Mascota bpm={bpm} variante="negra" tamano="100%" etiqueta={`Mascota a ${bpm} BPM`} />
      </div>
    </div>
  )
}

export default memo(RuedaGrande)
