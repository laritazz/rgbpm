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

// Cuánto se pisan (o se salen de la caja) en el peor caso: 0 = todo en su sitio
function peorSolape(c, alto, hueco) {
  let peor = 0
  for (let i = 0; i < c.length; i++) {
    const a = c[i]
    peor = Math.max(peor, a.r - a.x, a.x + a.r - 100, a.r - a.y, a.y + a.r - alto)
    for (let j = i + 1; j < c.length; j++) peor = Math.max(peor, a.r + c[j].r + hueco - cerca(a, c[j]))
  }
  return peor
}

// Empuja los que se pisan y mete dentro de la caja a los que se salen. El `fijo` no se mueve.
function relajar(c, alto, hueco, fijo, vueltas) {
  for (let v = 0; v < vueltas; v++) {
    for (let i = 0; i < c.length; i++) {
      for (let j = i + 1; j < c.length; j++) {
        const [a, b] = [c[i], c[j]]
        const d = cerca(a, b) || 0.001
        const falta = a.r + b.r + hueco - d
        if (falta <= 0) continue
        const [ux, uy] = [(b.x - a.x) / d, (b.y - a.y) / d]
        const [pa, pb] = i === fijo ? [0, 1] : j === fijo ? [1, 0] : [0.5, 0.5]
        a.x -= ux * falta * pa
        a.y -= uy * falta * pa
        b.x += ux * falta * pb
        b.y += uy * falta * pb
      }
    }
    for (let i = 0; i < c.length; i++) {
      if (i === fijo) continue
      const p = c[i]
      p.x = Math.min(100 - p.r, Math.max(p.r, p.x))
      p.y = Math.min(alto - p.r, Math.max(p.r, p.y))
    }
  }
}

/**
 * Infla el racimo hasta llenar la caja: todos crecen a la vez y se empujan hasta que no cabe más.
 * Así ocupa la pantalla entera, sea apaisada (escritorio) o alta (móvil).
 * @param fijo índice del círculo que se queda en el centro (la mascota)
 */
export function inflar(puestos, { aspecto = 1, hueco = 1, fijo = 0, paso = 1.012, maximo = 250 } = {}) {
  const alto = 100 / aspecto
  let actual = puestos.map((p) => ({ ...p }))
  if (actual[fijo]) Object.assign(actual[fijo], { x: 50, y: alto / 2 })
  relajar(actual, alto, hueco, fijo, 80)
  for (let n = 0; n < maximo; n++) {
    const prueba = actual.map((p) => ({ ...p, r: p.r * paso }))
    relajar(prueba, alto, hueco, fijo, 40)
    if (peorSolape(prueba, alto, hueco) > 0.05) break
    actual = prueba
  }
  return actual
}
