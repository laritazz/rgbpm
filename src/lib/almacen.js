// Mini envoltorio de IndexedDB: guarda la colección importada en TU navegador.
// No hay servidor de por medio: nada sale de tu equipo.

const BASE = 'rgbpm'
const CAJON = 'datos'

function abrir() {
  return new Promise((resolver, fallar) => {
    const peticion = indexedDB.open(BASE, 1)
    peticion.onupgradeneeded = () => peticion.result.createObjectStore(CAJON)
    peticion.onsuccess = () => resolver(peticion.result)
    peticion.onerror = () => fallar(peticion.error)
  })
}

async function operar(modo, accion) {
  const db = await abrir()
  return new Promise((resolver, fallar) => {
    const tx = db.transaction(CAJON, modo)
    const peticion = accion(tx.objectStore(CAJON))
    tx.oncomplete = () => {
      db.close()
      resolver(peticion.result)
    }
    tx.onerror = () => fallar(tx.error)
  })
}

export const leer = (clave) => operar('readonly', (c) => c.get(clave))
export const guardar = (clave, valor) => operar('readwrite', (c) => c.put(valor, clave))
export const borrar = (clave) => operar('readwrite', (c) => c.delete(clave))
