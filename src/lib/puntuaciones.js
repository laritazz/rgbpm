// Récords en la nube (Supabase, tabla «puntuaciones»: servidor/supabase/puntuaciones.sql).
// Solo si has entrado con tu cuenta; si no, los récords se quedan en este navegador.
import { SUPABASE_CLAVE } from './config'
import { supabase } from './supabase'

const TABLA = 'puntuaciones'
const SESION = 'rgbpm-sesion' // donde guarda Supabase la sesión (lib/supabase.js)

// Sin sesión guardada ni siquiera se descarga la librería de Supabase
function haySesionGuardada() {
  try {
    return Boolean(SUPABASE_CLAVE && localStorage.getItem(SESION))
  } catch {
    return false
  }
}

async function clienteConSesion() {
  if (!haySesionGuardada()) return null
  const cliente = await supabase()
  const { data } = await cliente.auth.getSession()
  return data.session ? cliente : null
}

/** Mejor partida y número de partidas de cada juego, a partir de las filas de la tabla. */
export function mejoresPorJuego(filas) {
  const salida = {}
  for (const { juego, puntos } of filas) {
    const r = (salida[juego] ??= { mejor: 0, partidas: 0 })
    r.mejor = Math.max(r.mejor, puntos)
    r.partidas++
  }
  return salida
}

/** Apunta una partida. Devuelve false si no hay sesión (no es un error: juegas sin cuenta). */
export async function subirPuntuacion({ juego, puntos, maximo, detalle = {} }) {
  const cliente = await clienteConSesion()
  if (!cliente) return false
  const { error } = await cliente.from(TABLA).insert({ juego, puntos, maximo, detalle })
  if (error) throw new Error(`No pude guardar la partida en la nube: ${error.message}`)
  return true
}

/** Tus récords en la nube, o null si no hay sesión. */
export async function recordsDeLaNube() {
  const cliente = await clienteConSesion()
  if (!cliente) return null
  const { data, error } = await cliente.from(TABLA).select('juego, puntos').order('puntos', { ascending: false }).limit(2000)
  if (error) throw new Error(`No pude leer tus récords: ${error.message}`)
  return mejoresPorJuego(data)
}
