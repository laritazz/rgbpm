// Lógica de armonías en notación Open Key (Traktor): 1d–12d mayores, 1m–12m menores.
// Funciones puras: reciben datos y devuelven datos, sin tocar la interfaz.

// "8m" → { numero: 8, modo: 'm' }
export function leerClave(clave) {
  const numero = parseInt(clave, 10)
  const modo = clave.slice(-1)
  return { numero, modo }
}

// Vuelta de rueda: después del 12 va el 1, antes del 1 va el 12
function girar(numero, pasos) {
  return ((numero - 1 + pasos + 12) % 12) + 1
}

// Relación armónica entre dos claves, o null si no mezclan
export function relacion(claveA, claveB) {
  const a = leerClave(claveA)
  const b = leerClave(claveB)

  if (a.numero === b.numero && a.modo === b.modo) return 'Perfecto'
  if (a.modo === b.modo && b.numero === girar(a.numero, 1)) return 'Sube +1'
  if (a.modo === b.modo && b.numero === girar(a.numero, -1)) return 'Baja −1'
  if (a.numero === b.numero) return a.modo === 'm' ? 'Menor → mayor' : 'Mayor → menor'
  return null
}

// Diferencia de tempo en porcentaje (positivo si B va más rápido)
export function diferenciaBpm(bpmA, bpmB) {
  return ((bpmB - bpmA) / bpmA) * 100
}

// Temas que mezclan con el elegido: misma familia armónica y tempo a ±6 %
export function compatibles(tema, biblioteca, margen = 6) {
  return biblioteca
    .filter((otro) => otro.id !== tema.id)
    .map((otro) => ({
      ...otro,
      relacion: relacion(tema.clave, otro.clave),
      difBpm: diferenciaBpm(tema.bpm, otro.bpm),
    }))
    .filter((otro) => otro.relacion && Math.abs(otro.difBpm) <= margen)
    .sort((x, y) => Math.abs(x.difBpm) - Math.abs(y.difBpm))
}
