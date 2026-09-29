// Estado del set con useReducer: cada cambio es una acción con nombre, y todas se pueden deshacer.

const MAX_HISTORIAL = 40

export const estadoInicial = { nombre: 'Mi set', ids: [], historial: [], guardados: [], listo: false }

// Guarda cómo estaba antes de cambiar, para «Deshacer»
const conHistorial = (estado, cambio) => ({
  ...estado,
  ...cambio,
  historial: [...estado.historial, { nombre: estado.nombre, ids: estado.ids }].slice(-MAX_HISTORIAL),
})

export function setReducer(estado, accion) {
  switch (accion.tipo) {
    case 'cargar': // lo guardado en IndexedDB al arrancar
      return { ...estado, ...accion.datos, historial: [], listo: true }

    case 'anadir': {
      const nuevos = accion.ids.filter((id) => !estado.ids.includes(id))
      if (!nuevos.length) return estado
      const ids = [...estado.ids]
      ids.splice(accion.posicion ?? ids.length, 0, ...nuevos)
      return conHistorial(estado, { ids })
    }

    case 'quitar':
      return conHistorial(estado, { ids: estado.ids.filter((_, i) => i !== accion.indice) })

    case 'mover': {
      const { desde, hasta } = accion
      if (desde === hasta || hasta < 0 || hasta >= estado.ids.length) return estado
      const ids = [...estado.ids]
      const [movido] = ids.splice(desde, 1)
      ids.splice(hasta, 0, movido)
      return conHistorial(estado, { ids })
    }

    case 'cambiar': // cambiazo: otro tema en el mismo hueco
      if (estado.ids.includes(accion.id)) return estado
      return conHistorial(estado, { ids: estado.ids.map((id, i) => (i === accion.indice ? accion.id : id)) })

    case 'reemplazar': // reordenar, cargar un set guardado, importar un archivo, vaciar…
      return conHistorial(estado, { ids: [...new Set(accion.ids)], nombre: accion.nombre ?? estado.nombre })

    case 'renombrar':
      return { ...estado, nombre: accion.nombre }

    case 'deshacer': {
      const anterior = estado.historial.at(-1)
      if (!anterior) return estado
      return { ...estado, ...anterior, historial: estado.historial.slice(0, -1) }
    }

    case 'guardar': {
      // Si ya hay uno con ese nombre, se actualiza; si no, se crea
      const nombre = estado.nombre.trim() || 'Set'
      const existe = estado.guardados.find((g) => g.nombre.toLowerCase() === nombre.toLowerCase())
      const guardado = { id: existe?.id ?? accion.id, nombre, ids: estado.ids, creado: accion.fecha }
      const guardados = existe ? estado.guardados.map((g) => (g.id === existe.id ? guardado : g)) : [guardado, ...estado.guardados]
      return { ...estado, guardados }
    }

    case 'borrarGuardado':
      return { ...estado, guardados: estado.guardados.filter((g) => g.id !== accion.id) }

    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`)
  }
}
