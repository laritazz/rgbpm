import { colorBpm } from '../../lib/color'
import { transicion } from '../../lib/set'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'

/**
 * La curva de energía del set: el BPM tema a tema.
 * Cada tramo lleva el color de su categoría de mezcla; los contrastes de tono, en discontinua.
 */
export default function CurvaSet({ temas, anclaId, alElegir }) {
  const { etiqueta, corregir } = useAjustesArmonia()
  const conBpm = temas.filter((t) => t.bpm)
  if (conBpm.length < 2) return null
  const bpms = conBpm.map((t) => t.bpm)
  const min = Math.min(...bpms) - 2
  const max = Math.max(...bpms) + 2
  const W = 600
  const H = 120
  const x = (i) => 16 + (i * (W - 32)) / Math.max(1, temas.length - 1)
  const y = (bpm) => H - 16 - ((bpm - min) / (max - min || 1)) * (H - 32)

  const tramos = []
  for (let i = 1; i < temas.length; i++) {
    const a = temas[i - 1]
    const b = temas[i]
    if (!a.bpm || !b.bpm) continue
    const t = transicion(a, b, corregir)
    tramos.push(
      <line
        key={`${a.id}-${b.id}`}
        x1={x(i - 1)}
        y1={y(a.bpm)}
        x2={x(i)}
        y2={y(b.bpm)}
        stroke={t.categoria?.color ?? '#8C8C8C'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={t.categoria ? undefined : '4 5'}
      >
        <title>{t.categoria ? `${t.categoria.nombre} · ${t.nota}/100` : 'Contraste de tono'}</title>
      </line>
    )
  }

  return (
    <svg className="curva-set" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Curva de BPM: de ${Math.round(bpms[0])} a ${Math.round(bpms.at(-1))}`}>
      <text x="4" y="12" className="curva-set__eje">
        {Math.round(max - 2)}
      </text>
      <text x="4" y={H - 4} className="curva-set__eje">
        {Math.round(min + 2)}
      </text>
      <g key={temas.map((t) => t.id).join()} className="curva-set__tramos">
        {tramos}
      </g>
      {temas.map((t, i) =>
        t.bpm ? (
          <circle
            key={t.id}
            cx={x(i)}
            cy={y(t.bpm)}
            r={t.id === anclaId ? 7 : 4.5}
            fill={colorBpm(t.bpm)}
            stroke={t.id === anclaId ? '#FF66C4' : '#000'}
            strokeWidth="2"
            onClick={() => alElegir?.(t.id)}
            style={{ cursor: alElegir ? 'pointer' : undefined }}
          >
            <title>{`${i + 1}. ${t.titulo} · ${t.bpm} BPM · ${etiqueta(t.clave)}`}</title>
          </circle>
        ) : null
      )}
    </svg>
  )
}
