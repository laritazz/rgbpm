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

// ——— Iconos de sección (inicio, menú lateral y pestañas) ———

/** Biblioteca: un disco asomando de su funda. */
export const IconoDiscos = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="12" height="14" rx="1.5" />
    <path d="M15 7.2a6 6 0 1 1 0 9.6" />
    <circle cx="15" cy="12" r="1.2" />
  </svg>
)

/** Armonía: la rueda de tonos, con un sector encendido. */
export const IconoRueda = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 3.5v5M20.5 12h-5M12 20.5v-5M3.5 12h5" />
    <path d="M12 3.5A8.5 8.5 0 0 1 20.5 12H15.5A3.5 3.5 0 0 0 12 8.5Z" fill="currentColor" />
  </svg>
)

/** Juego: un mando. */
export const IconoJuego = (p) => (
  <svg {...base} {...p}>
    <path d="M7.5 7h9a4.5 4.5 0 0 1 4.4 5.4l-.8 4a2.4 2.4 0 0 1-4.2 1L14 15.5h-4l-1.9 1.9a2.4 2.4 0 0 1-4.2-1l-.8-4A4.5 4.5 0 0 1 7.5 7Z" />
    <path d="M8 10v3M6.5 11.5h3" />
    <circle cx="15.5" cy="10.5" r=".6" fill="currentColor" />
    <circle cx="17.5" cy="12.5" r=".6" fill="currentColor" />
  </svg>
)

/** Escuchar: un micro captando el ritmo. */
export const IconoEscuchar = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
  </svg>
)

/** Mezclador: dos faders y el crossfader. */
export const IconoMezclador = (p) => (
  <svg {...base} {...p}>
    <path d="M7 3v10M17 3v10M4 19.5h16" />
    <rect x="5" y="5.5" width="4" height="3" rx="1" fill="currentColor" />
    <rect x="15" y="8.5" width="4" height="3" rx="1" fill="currentColor" />
    <rect x="10" y="18" width="4" height="3" rx="1" fill="currentColor" />
  </svg>
)
