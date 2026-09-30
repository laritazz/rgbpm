import { CATEGORIAS, clavesRelacionadas } from '../../lib/armonia'
import { clave } from '../../lib/claves'

// Sector de corona entre dos radios, en grados (0 = arriba)
function sector(r1, r2, desde, hasta) {
  const p = (r, a) => {
    const rad = ((a - 90) * Math.PI) / 180
    return `${(Math.cos(rad) * r).toFixed(2)},${(Math.sin(rad) * r).toFixed(2)}`
  }
  return `M${p(r2, desde)} A${r2},${r2} 0 0 1 ${p(r2, hasta)} L${p(r1, hasta)} A${r1},${r1} 0 0 0 ${p(r1, desde)} Z`
}

/**
 * Rueda Open Key: fuera las mayores (d), dentro las menores (m).
 * En rosa, la clave del tema; en el color de cada categoría, con qué mezcla.
 */
export default function RuedaMini({ semilla, tamano = 128, corregir = true, etiqueta = (k) => k.id }) {
  const relacion = new Map()
  if (semilla) {
    const rel = clavesRelacionadas(semilla, corregir)
    for (const c of CATEGORIAS) for (const k of rel[c.id]) if (!relacion.has(k.id)) relacion.set(k.id, c)
  }

  const sectores = []
  for (let n = 1; n <= 12; n++) {
    for (const menor of [false, true]) {
      const k = clave(n, menor)
      const [r1, r2] = menor ? [30, 45] : [46, 60]
      const cat = relacion.get(k.id)
      const esSemilla = semilla?.id === k.id
      sectores.push(
        <path
          key={k.id}
          d={sector(r1, r2, (n - 1) * 30 - 15 + 1, n * 30 - 15 - 1)}
          fill={esSemilla ? '#FF66C4' : cat ? cat.color : '#1c1c1c'}
          opacity={esSemilla || cat || !semilla ? 1 : 0.7}
        >
          <title>{`${etiqueta(k)} · ${k.nombre}${esSemilla ? ' (este tema)' : cat ? ` · ${cat.nombre}` : ''}`}</title>
        </path>
      )
    }
  }

  return (
    <svg width={tamano} height={tamano} viewBox="-62 -62 124 124" role="img" aria-label={semilla ? `Rueda armónica: clave ${etiqueta(semilla)}` : 'Rueda armónica'}>
      {sectores}
      <text x="0" y="7" textAnchor="middle" fill="#fff" fontFamily="Urbanist, sans-serif" fontWeight="800" fontSize="20">
        {semilla ? etiqueta(semilla) : '—'}
      </text>
    </svg>
  )
}
