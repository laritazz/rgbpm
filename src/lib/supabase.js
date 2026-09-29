import { SUPABASE_CLAVE, SUPABASE_URL } from './config'

let cliente = null

/** Cliente de Supabase, cargado solo cuando hace falta (la librería no pesa en el arranque). */
export async function supabase() {
  if (!cliente) {
    const { createClient } = await import('@supabase/supabase-js')
    cliente = createClient(SUPABASE_URL, SUPABASE_CLAVE, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'rgbpm-sesion' } })
  }
  return cliente
}
