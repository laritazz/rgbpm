// Burbujas de la home: círculos de distintos tamaños empaquetados en racimo alrededor de la mascota.
// Cada círculo nuevo se apoya en dos que ya están y busca el hueco libre más cercano al centro.

const cerca = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// Los dos puntos donde un círculo de radio r toca a la vez a `a` y a `b` (con un hueco entre ellos)
function tangentes(a, b, r, hueco) {
  const ra = a.r + r + hueco
  const rb = b.r + r + hueco
  const d = cerca(a, b)
  if (d > ra + rb || d < Math.abs(ra - rb) || d === 0) return []
  const l = (ra * ra - rb * rb + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, ra * ra - l * l))
  const ux = (b.x - a.x) / d
  const uy = (b.y - a.y) / d
  const px = a.x + ux * l
  const py = a.y + uy * l
  return [
    { x: px - uy * h, y: py + ux * h },
    { x: px + uy * h, y: py - ux * h },
  ]
}

/**
 * Coloca los círculos en racimo. El primero va al centro; el segundo, a su lado en `angulo`;
 * los demás, en el hueco libre más cercano al centro (achatado para que el racimo quepa en pantalla).
 * @param circulos [{ id, r }] en el orden en que se colocan
 * @param hueco    separación entre círculos, en las mismas unidades que r
 * @param aspecto  ancho / alto de la zona: > 1 reparte más a los lados
 * @returns [{ id, r, x, y }] con x, y, r en % de una caja de ancho 100 (el alto sale de `aspecto`)
 */
export function empaquetar(circulos, { hueco = 1, angulo = -35, aspecto = 1, margen = 2 } = {}) {
  if (!circulos.length) return []
  const puestos = [{ ...circulos[0], x: 0, y: 0 }]
  if (circulos[1]) {
    const a = (angulo * Math.PI) / 180
    const d = circulos[0].r + circulos[1].r + hueco
    puestos.push({ ...circulos[1], x: Math.cos(a) * d, y: Math.sin(a) * d })
  }
  const coste = (p) => Math.hypot(p.x / aspecto, p.y)

  for (const c of circulos.slice(2)) {
    let mejor = null
    for (let i = 0; i < puestos.length; i++) {
      for (let j = i + 1; j < puestos.length; j++) {
        for (const p of tangentes(puestos[i], puestos[j], c.r, hueco)) {
          const libre = puestos.every((o) => cerca(o, p) >= o.r + c.r + hueco - 1e-6)
          if (libre && (!mejor || coste(p) < coste(mejor))) mejor = p
        }
      }
    }
    puestos.push({ ...c, ...(mejor ?? { x: 0, y: 1e3 }) })
  }

  // Encajar el racimo en la caja: ancho 100, alto 100 / aspecto, centrado y con margen
  const minX = Math.min(...puestos.map((p) => p.x - p.r))
  const maxX = Math.max(...puestos.map((p) => p.x + p.r))
  const minY = Math.min(...puestos.map((p) => p.y - p.r))
  const maxY = Math.max(...puestos.map((p) => p.y + p.r))
  const alto = 100 / aspecto
  const escala = Math.min((100 - 2 * margen) / (maxX - minX), (alto - 2 * margen) / (maxY - minY))
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return puestos.map((p) => ({ ...p, x: 50 + (p.x - cx) * escala, y: alto / 2 + (p.y - cy) * escala, r: p.r * escala }))
}
