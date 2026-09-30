import { memo } from 'react'
import { clave } from '../../lib/claves'

const CENTRO = 260
const RADIO_MAYORES = 208
const RADIO_MENORES = 132
const NODO_MAYOR = 26
const NODO_MENOR = 22

// Posición de cada tono: el número Open Key da la vuelta como un reloj (1 arriba)
function posicion(k) {
  const angulo = (((k.open - 1) * 30 - 90) * Math.PI) / 180
  const r = k.menor ? RADIO_MENORES : RADIO_MAYORES
  return { x: CENTRO + r * Math.cos(angulo), y: CENTRO + r * Math.sin(angulo), angulo }
}

// El camino del set sugerido: curvas que se doblan hacia el centro, como un impulso entre neuronas
function trazado(camino) {
  let d = ''
  for (let i = 1; i < camino.length; i++) {
    const a = posicion(camino[i - 1].clave)
    const b = posicion(camino[i].clave)
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const qx = mx + (CENTRO - mx) * 0.38
    const qy = my + (CENTRO - my) * 0.38
    d += `${i === 1 ? `M${a.x.toFixed(1)} ${a.y.toFixed(1)}` : ''}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
  }
  return d
}

const TONOS = Array.from({ length: 12 }, (_, i) => [clave(i + 1, false), clave(i + 1, true)]).flat()

/**
 * Rueda armónica grande: mayores fuera, menores dentro.
 * Rosa, la clave de salida; en el color de su categoría, lo que pega; la línea, el set sugerido.
 * Cada tono es un botón: tocarlo cambia la clave de salida.
 */
function RuedaGrande({ semilla, relacion, camino, cuantos, etiqueta, alElegir }) {
  const pasoDe = new Map(camino.map((p, i) => [p.clave.id, i + 1]))
  const d = trazado(camino)

  return (
    <svg className="rueda" viewBox="0 0 520 520" role="group" aria-label={`Rueda armónica. Clave de salida: ${etiqueta(semilla)}`}>
      <defs>
        <filter id="rueda-brillo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <circle className="rueda__fondo" cx={CENTRO} cy={CENTRO} r="256" />
      <circle className="rueda__guia" cx={CENTRO} cy={CENTRO} r={RADIO_MAYORES} />
      <circle className="rueda__guia" cx={CENTRO} cy={CENTRO} r={RADIO_MENORES} />

      {/* key: al cambiar el camino, la línea se vuelve a dibujar desde el principio */}
      {d && (
        <g key={d} className="rueda__camino" aria-hidden="true">
          <path d={d} className="rueda__halo" filter="url(#rueda-brillo)" pathLength="1" />
          <path d={d} className="rueda__linea" pathLength="1" />
        </g>
      )}

      {TONOS.map((k) => {
        const { x, y, angulo } = posicion(k)
        const r = k.menor ? NODO_MENOR : NODO_MAYOR
        const esSemilla = k.id === semilla.id
        const categoria = relacion.get(k.id)
        const paso = pasoDe.get(k.id)
        const temas = cuantos.get(k.id) ?? 0
        const texto = `${etiqueta(k)} · ${k.nombre}${esSemilla ? ' (salida)' : categoria ? ` · ${categoria.nombre}` : ''} · ${temas} ${temas === 1 ? 'tema' : 'temas'}${paso ? ` · paso ${paso}` : ''}`
        const elegir = () => alElegir(k)
        return (
          <g
            key={k.id}
            className={`rueda__tono${esSemilla ? ' rueda__tono--semilla' : ''}${categoria ? ' rueda__tono--pega' : ''}${temas ? '' : ' rueda__tono--vacio'}`}
            style={{ '--c': esSemilla ? 'var(--rosa)' : (categoria?.color ?? 'var(--superficie-2)'), transformOrigin: `${x}px ${y}px` }}
            role="button"
            tabIndex={0}
            aria-label={texto}
            aria-pressed={esSemilla}
            onClick={elegir}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), elegir())}
          >
            <title>{texto}</title>
            {esSemilla && <circle cx={x} cy={y} r={r + 10} className="rueda__aura" filter="url(#rueda-brillo)" />}
            <circle cx={x} cy={y} r={r} className="rueda__nodo" />
            <text x={x} y={y + 4.5} className="rueda__etiqueta" fontSize={k.menor ? 12.5 : 13.5}>
              {etiqueta(k)}
            </text>
            {paso && (
              <g className="rueda__paso" aria-hidden="true">
                <circle cx={x + (r + 13) * Math.cos(angulo)} cy={y + (r + 13) * Math.sin(angulo)} r="9" />
                <text x={x + (r + 13) * Math.cos(angulo)} y={y + (r + 13) * Math.sin(angulo) + 3.4}>
                  {paso}
                </text>
              </g>
            )}
          </g>
        )
      })}

      <text x={CENTRO} y={CENTRO + 8} className="rueda__centro">
        {etiqueta(semilla)}
      </text>
      <text x={CENTRO} y={CENTRO + 36} className="rueda__centro-nombre">
        {etiqueta(semilla) === semilla.nombre ? semilla.id : semilla.nombre} · {cuantos.get(semilla.id) ?? 0} temas
      </text>
    </svg>
  )
}

export default memo(RuedaGrande)
