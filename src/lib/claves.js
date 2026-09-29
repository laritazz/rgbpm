// Tonalidades en notación Open Key (la de Traktor): 1d = Do mayor, 1m = La menor.
// Cada número sube una quinta. Portado de RGBPM.html (motor original).

const NOMBRES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const NOMBRE_A_PC = {
  C: 0, 'C#': 1, DB: 1, D: 2, 'D#': 3, EB: 3, E: 4, FB: 4, F: 5, 'E#': 5, 'F#': 6, GB: 6,
  G: 7, 'G#': 8, AB: 8, A: 9, 'A#': 10, BB: 10, B: 11, CB: 11,
}

export const openAPc = (n, menor) => ((menor ? 9 : 0) + 7 * (n - 1)) % 12

export function pcAOpen(pc, menor) {
  for (let n = 1; n <= 12; n++) if (openAPc(n, menor) === pc) return n
  return 1
}

const camelotDe = (n) => ((n + 6) % 12) + 1
const openDeCamelot = (c) => ((c + 4) % 12) + 1

/** Crea una clave normalizada. El número da la vuelta a la rueda (13 → 1). */
export function clave(n, menor) {
  const open = (((n - 1) % 12) + 12) % 12 + 1
  const pc = openAPc(open, menor)
  return {
    open,
    menor: Boolean(menor),
    id: `${open}${menor ? 'm' : 'd'}`,
    camelot: `${camelotDe(open)}${menor ? 'A' : 'B'}`,
    nombre: `${NOMBRES[pc]}${menor ? 'm' : ''}`,
  }
}

/** Lector tolerante: «8m», «1d», «8A», «Am», «F#m», o el número 0–23 de Traktor. */
export function leerClave(bruto) {
  if (bruto === null || bruto === undefined) return null
  const s = String(bruto).trim().replace(/♯/g, '#').replace(/♭/g, 'b').replace(/\s+/g, ' ')
  if (!s) return null
  let m
  if ((m = /^(\d{1,2})\s*([dm])$/i.exec(s))) {
    const n = Number(m[1])
    if (n >= 1 && n <= 12) return clave(n, m[2].toLowerCase() === 'm')
  }
  if ((m = /^(\d{1,2})\s*([ab])$/i.exec(s))) {
    const c = Number(m[1])
    if (c >= 1 && c <= 12) return clave(openDeCamelot(c), m[2].toLowerCase() === 'a')
  }
  if ((m = /^([a-gA-G][#b]?)\s*(m|min|minor|menor)?\s*(maj|major|mayor)?$/.exec(s))) {
    const pc = NOMBRE_A_PC[m[1].toUpperCase()]
    if (pc !== undefined) return clave(pcAOpen(pc, Boolean(m[2])), Boolean(m[2]))
  }
  if (/^\d{1,2}$/.test(s)) {
    // MUSICAL_KEY de Traktor: 0–11 mayores (Do…Si), 12–23 menores
    const v = Number(s)
    if (v >= 0 && v <= 23) {
      const menor = v >= 12
      return clave(pcAOpen(v % 12, menor), menor)
    }
  }
  return null
}

export const TODAS_LAS_CLAVES = Array.from({ length: 12 }, (_, i) => [clave(i + 1, false), clave(i + 1, true)]).flat()
