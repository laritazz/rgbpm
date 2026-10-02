// Busca la previa de 30 s de cada tema de la demo en Apple Music y la guarda en public/previas.json.
// Así la web suena para cualquiera desde el primer clic, sin esperar búsquedas.
//
// Uso (en el Mac, con conexión):  node scripts/previas.mjs
// Apple permite unas 20 búsquedas por minuto: tarda ~8 min con la demo. Se puede parar y seguir.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { buscarPrevia, llavePrevia } from '../src/lib/previas.js'

const DEMO = new URL('../src/data/demo.json', import.meta.url)
const SALIDA = new URL('../public/previas.json', import.meta.url)
const PAUSA = 3200 // ms entre búsquedas (≤ 20 por minuto)

const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const { temas } = JSON.parse(readFileSync(DEMO, 'utf8'))
const previo = existsSync(SALIDA) ? JSON.parse(readFileSync(SALIDA, 'utf8')) : { previas: {}, sin: [] }
const previas = previo.previas ?? {}
const sin = new Set(previo.sin ?? [])

let nuevas = 0
for (const [i, tema] of temas.entries()) {
  const llave = llavePrevia(tema)
  if (previas[llave] || sin.has(llave)) continue
  try {
    const p = await buscarPrevia(tema)
    if (p) previas[llave] = { u: p.url, e: p.enlace }
    else sin.add(llave)
    nuevas++
    console.log(`${i + 1}/${temas.length} ${p ? '♪' : '·'} ${tema.artista} – ${tema.titulo}`)
  } catch (e) {
    console.log(`Parada en ${i + 1}: ${e.message}. Vuelve a lanzarlo y sigue donde se quedó.`)
    break
  }
  // Se guarda cada 10: si se corta, no se pierde nada
  if (nuevas % 10 === 0) writeFileSync(SALIDA, JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), previas, sin: [...sin] }))
  await espera(PAUSA)
}
writeFileSync(SALIDA, JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), previas, sin: [...sin] }))
console.log(`Listo: ${Object.keys(previas).length} con previa, ${sin.size} sin previa.`)
