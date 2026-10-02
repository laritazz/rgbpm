// Iconos de línea de RGBPM: un solo trazo, esquinas redondas, 24 × 24.
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const IconoPlay = (p) => (
  <svg {...base} {...p}>
    <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconoPausa = (p) => (
  <svg {...base} {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconoSiguiente = (p) => (
  <svg {...base} {...p}>
    <path d="M5 5.5v13l9-6.5z" fill="currentColor" stroke="none" />
    <path d="M18 5v14" />
  </svg>
)

export const IconoBiblioteca = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
  </svg>
)

export const IconoRadio = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="2" />
    <path d="M8 8a5.5 5.5 0 0 0 0 8M16 8a5.5 5.5 0 0 1 0 8M5 5a9.9 9.9 0 0 0 0 14M19 5a9.9 9.9 0 0 1 0 14" />
  </svg>
)

export const IconoSets = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6h11M4 12h11M4 18h7" />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M20.5 17V6.5L17 8" />
  </svg>
)

export const IconoMas = (p) => (
  <svg {...base} {...p}>
    <circle cx="5" cy="12" r="1.3" fill="currentColor" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    <circle cx="19" cy="12" r="1.3" fill="currentColor" />
  </svg>
)

export const IconoBajar = (p) => (
  <svg {...base} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export const IconoArrastrar = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="6" r="1.2" fill="currentColor" />
    <circle cx="15" cy="6" r="1.2" fill="currentColor" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" />
    <circle cx="15" cy="12" r="1.2" fill="currentColor" />
    <circle cx="9" cy="18" r="1.2" fill="currentColor" />
    <circle cx="15" cy="18" r="1.2" fill="currentColor" />
  </svg>
)

export const IconoAncla = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </svg>
)

export const IconoCambiar = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
  </svg>
)

export const IconoQuitar = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconoMasSimple = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconoSubir = (p) => (
  <svg {...base} {...p}>
    <path d="M6 15l6-6 6 6" />
  </svg>
)

// ——— Iconos RGBPM: gotas. Puntos sobre una rejilla de 24 que se unen con un cuello, como dos gotas al tocarse ———
// Es el mismo lenguaje que los círculos del inicio: cada icono se describe con puntos y uniones, nada más.

const f1 = (n) => n.toFixed(2)

/** Cuello entre dos puntos: sale de cada círculo a ±55° y se estrecha en el medio. */
function cuello(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  const [ux, uy] = [dx / d, dy / d]
  const [nx, ny] = [-uy, ux]
  const t = (55 * Math.PI) / 180
  const borde = (c, sentido, lado) => [c.x + c.r * (sentido * ux * Math.cos(t) + lado * nx * Math.sin(t)), c.y + c.r * (sentido * uy * Math.cos(t) + lado * ny * Math.sin(t))]
  const ancho = Math.min(a.r, b.r) * 0.5
  const [mx, my] = [(a.x + b.x) / 2, (a.y + b.y) / 2]
  const [a1, b1, b2, a2] = [borde(a, 1, 1), borde(b, -1, 1), borde(b, -1, -1), borde(a, 1, -1)]
  return `M${f1(a1[0])} ${f1(a1[1])}Q${f1(mx + nx * ancho)} ${f1(my + ny * ancho)} ${f1(b1[0])} ${f1(b1[1])}L${f1(b2[0])} ${f1(b2[1])}Q${f1(mx - nx * ancho)} ${f1(my - ny * ancho)} ${f1(a2[0])} ${f1(a2[1])}Z`
}

/**
 * Pinta un icono de gotas.
 * @param puntos  [[x, y, r]] o [[x, y, r, 'hueco']] para un aro
 * @param uniones [[i, j]]: qué puntos se tocan
 */
function Gotas({ puntos, uniones = [], ...props }) {
  const p = puntos.map(([x, y, r, tipo]) => ({ x, y, r, hueco: tipo === 'hueco' }))
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      {uniones.map(([i, j]) => (
        <path key={`${i}-${j}`} d={cuello(p[i], p[j])} />
      ))}
      {p.map((c, i) => (c.hueco ? <circle key={i} cx={c.x} cy={c.y} r={c.r - 1} fill="none" stroke="currentColor" strokeWidth="2" /> : <circle key={i} cx={c.x} cy={c.y} r={c.r} />))}
    </svg>
  )
}

const anillo = (n, radio, r, grande = -1) => Array.from({ length: n }, (_, i) => {
  const a = ((i * 360) / n - 90) * (Math.PI / 180)
  return [12 + Math.cos(a) * radio, 12 + Math.sin(a) * radio, i === grande ? r * 2 : r]
})

/** Biblioteca: tu colección. Tres discos juntos y uno suelto. */
export const IconoDiscos = (p) => <Gotas puntos={[[6.5, 6.5, 4.3], [17.5, 6.5, 4.3], [17.5, 17.5, 4.3], [6.5, 17.5, 4.3]]} uniones={[[0, 1], [1, 2]]} {...p} />

/** Armonía: cuatro tonos que se cierran en rueda, con la clave de salida en el centro. */
export const IconoRueda = (p) => <Gotas puntos={[[6, 6, 4.4], [18, 6, 4.4], [18, 18, 4.4], [6, 18, 4.4], [12, 12, 2]]} uniones={[[0, 1], [1, 2], [2, 3], [3, 0]]} {...p} />

/** Sets: temas encadenados, uno tras otro. */
export const IconoCadena = (p) => <Gotas puntos={[[4, 16, 3.4], [10, 8, 3.4], [15, 16, 3.4], [20.5, 8, 3.4]]} uniones={[[0, 1], [1, 2], [2, 3]]} {...p} />

/** Escuchar: un punto y el anillo de lo que capta. */
export const IconoEscuchar = (p) => <Gotas puntos={[[12, 12, 3.6], ...anillo(8, 8.6, 1.4)]} {...p} />

/** Juego: la cara del cinco de un dado. */
export const IconoDado = (p) => <Gotas puntos={[[5.5, 5.5, 3], [18.5, 5.5, 3], [12, 12, 3], [5.5, 18.5, 3], [18.5, 18.5, 3]]} {...p} />

/** Radio: un punto que emite, en gotas cada vez más pequeñas. */
export const IconoOndas = (p) => <Gotas puntos={[[12, 12, 3.4], [5.4, 12, 2.3], [18.6, 12, 2.3], [1.6, 12, 1.2], [22.4, 12, 1.2]]} uniones={[[0, 1], [0, 2]]} {...p} />

/** Mezclador: dos faders, uno arriba y otro abajo, y el crossfader. */
export const IconoMezclador = (p) => <Gotas puntos={[[7, 5, 3.2], [7, 13, 3.2], [17, 9, 3.2], [17, 17, 3.2], [12, 21.5, 1.8]]} uniones={[[0, 1], [2, 3]]} {...p} />

// ——— Juegos ———

/** Adivina el BPM: golpes que crecen, como un tempo que entra. */
export const IconoPulso = (p) => <Gotas puntos={[[3.5, 12, 2], [10, 12, 3.2], [18.5, 12, 4.8]]} {...p} />

/** ¿Pega o choca?: dos que se unen y uno que no. */
export const IconoPega = (p) => <Gotas puntos={[[6, 8, 4.2], [14.5, 8, 4.2], [18, 18, 3.6]]} uniones={[[0, 1]]} {...p} />

/** ¿Dónde cae?: la rueda con un tono encendido. */
export const IconoCae = (p) => <Gotas puntos={anillo(8, 8, 1.8, 0)} {...p} />

/** ¿Cuál corre más?: el mismo tiempo, pocos golpes arriba y muchos abajo. */
export const IconoCorre = (p) => <Gotas puntos={[[6, 7, 2.4], [18, 7, 2.4], [3.5, 17, 1.9], [9.2, 17, 1.9], [14.8, 17, 1.9], [20.5, 17, 1.9]]} {...p} />

/** Cuadra el tempo: dos golpes que se funden en uno. */
export const IconoCuadra = (p) => <Gotas puntos={[[7.5, 12, 4.8], [16.5, 12, 4.8]]} uniones={[[0, 1]]} {...p} />
