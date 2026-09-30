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

// ——— Iconos de sección: puntos y gotas, el mismo lenguaje que los círculos del inicio ———
const relleno = { fill: 'currentColor', stroke: 'none' }

/** Biblioteca: cuatro discos, tu colección. */
export const IconoDiscos = (p) => (
  <svg {...base} {...p}>
    <circle cx="7" cy="7" r="4.2" {...relleno} />
    <circle cx="17" cy="7" r="4.2" {...relleno} />
    <circle cx="7" cy="17" r="4.2" {...relleno} />
    <circle cx="17" cy="17" r="4.2" />
  </svg>
)

/** Armonía: la rueda de tonos; uno encendido. */
export const IconoRueda = (p) => (
  <svg {...base} {...p}>
    {Array.from({ length: 12 }, (_, i) => {
      const a = ((i * 30 - 90) * Math.PI) / 180
      return <circle key={i} cx={12 + Math.cos(a) * 8.6} cy={12 + Math.sin(a) * 8.6} r={i === 0 ? 2.6 : 1.3} {...relleno} />
    })}
    <circle cx="12" cy="12" r="3.2" {...relleno} />
  </svg>
)

/** Sets: temas encadenados, como gotas que se unen. */
export const IconoCadena = (p) => (
  <svg {...base} {...p}>
    <path d="M5.5 16.5 12 9.5l6.5 5" strokeWidth="3.4" />
    <circle cx="5.5" cy="16.5" r="3.3" {...relleno} />
    <circle cx="12" cy="9.5" r="3.3" {...relleno} />
    <circle cx="18.5" cy="14.5" r="3.3" {...relleno} />
  </svg>
)

/** Escuchar: un punto y las ondas que capta. */
export const IconoEscuchar = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.4" {...relleno} />
    <circle cx="12" cy="12" r="6.6" strokeWidth="2" />
    <circle cx="12" cy="12" r="9.8" strokeWidth="1.6" strokeDasharray="2.2 3" />
  </svg>
)

/** Juego: un dado (cinco). */
export const IconoDado = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5.5" strokeWidth="2" />
    {[
      [8, 8],
      [16, 8],
      [12, 12],
      [8, 16],
      [16, 16],
    ].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="1.7" {...relleno} />
    ))}
  </svg>
)

/** Radio: un punto que emite, en gotas cada vez más pequeñas. */
export const IconoOndas = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" {...relleno} />
    <circle cx="5.5" cy="12" r="2" {...relleno} />
    <circle cx="18.5" cy="12" r="2" {...relleno} />
    <circle cx="1.8" cy="12" r="1.2" {...relleno} />
    <circle cx="22.2" cy="12" r="1.2" {...relleno} />
  </svg>
)

/** Mezclador: dos faders y el crossfader. */
export const IconoMezclador = (p) => (
  <svg {...base} {...p}>
    <path d="M7 3v12M17 3v12M4 20.5h16" strokeWidth="1.8" />
    <circle cx="7" cy="7" r="2.8" {...relleno} />
    <circle cx="17" cy="11" r="2.8" {...relleno} />
    <circle cx="11" cy="20.5" r="2.8" {...relleno} />
  </svg>
)
