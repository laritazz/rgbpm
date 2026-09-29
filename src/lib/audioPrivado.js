// Cliente de la puerta de audio privado (servidor/rgbpm-audio/firmar.php en IONOS)
import { AUDIO_PRIVADO } from './config'

export class SesionCaducada extends Error {}

async function llamar(token, cuerpo) {
  let r
  try {
    r = await fetch(`${AUDIO_PRIVADO}firmar.php`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
  } catch {
    throw new Error('No llego a tu servidor de audio')
  }
  if (r.status === 401) throw new SesionCaducada('Tu sesión ha caducado')
  if (r.status === 403) throw new Error('Esta cuenta no tiene permiso para escuchar')
  if (!r.ok) throw new Error(`El servidor de audio responde ${r.status}`)
  return r.json()
}

/** Qué fragmentos hay en el servidor (solo nombres anónimos). */
export const listaPrivada = async (token) => new Set((await llamar(token, { accion: 'lista' })).ids)

/** Enlaces firmados que caducan, para uno o varios fragmentos. */
export const firmarPrivado = (token, ids) => llamar(token, { accion: 'firmar', ids })
