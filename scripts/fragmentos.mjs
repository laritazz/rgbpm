#!/usr/bin/env node
// RGBPM · crea los fragmentos privados en tu Mac a partir de tu colección de Traktor.
//
// Uso (desde la carpeta del proyecto):
//   node scripts/fragmentos.mjs --nml "~/Documents/Native Instruments/Traktor 3.x/collection.nml"
//
// Opciones:
//   --salida    carpeta donde dejarlos             (por defecto: ./rgbpm-fragmentos)
//   --segundos  duración de cada fragmento          (90)
//   --kbps      calidad mp3                         (128)
//   --hilos     cuántos a la vez                    (4)
//   --limite    solo los N primeros, para probar
//   --playlist  solo los temas de una playlist («LN 14F»)
//
// Se puede parar (Ctrl+C) y volver a lanzar: los que ya existen no se repiten.
// Necesita ffmpeg: si no lo tienes, `npm i --no-save ffmpeg-static` una vez.

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync, appendFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { XMLParser } from 'fast-xml-parser'
import { idFragmento, inicioFragmento } from '../src/lib/fragmentos.js'
import { esSample } from '../src/lib/traktor.js'

// ——— Opciones ———
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(' ')
    .split(/\s--/)
    .map((p) => p.replace(/^--/, '').trim())
    .filter(Boolean)
    .map((p) => {
      const [clave, ...resto] = p.split(' ')
      return [clave, resto.join(' ').replace(/^["']|["']$/g, '')]
    })
)
const casa = (ruta) => ruta.replace(/^~(?=\/)/, homedir())
if (!args.nml) {
  console.error('Falta --nml: la ruta de tu collection.nml de Traktor')
  process.exit(1)
}
const NML = resolve(casa(args.nml))
const SALIDA = resolve(casa(args.salida || './rgbpm-fragmentos'))
const SEGUNDOS = Number(args.segundos || 90)
const KBPS = Number(args.kbps || 128)
const HILOS = Math.max(1, Number(args.hilos || 4))
const LIMITE = args.limite ? Number(args.limite) : Infinity

// ——— ffmpeg: el del proyecto (ffmpeg-static) o el del sistema ———
const FFMPEG = await import('ffmpeg-static').then((m) => m.default).catch(() => 'ffmpeg')
if (spawnSync(FFMPEG, ['-version']).status !== 0) {
  console.error('No encuentro ffmpeg. Instálalo con:  npm i --no-save ffmpeg-static')
  process.exit(1)
}

// ——— Leer la colección ———
const lector = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', isArray: (n) => ['ENTRY', 'CUE_V2', 'NODE', 'PRIMARYKEY'].includes(n) })
const nml = lector.parse(readFileSync(NML, 'utf8')).NML
const entradas = nml.COLLECTION.ENTRY ?? []

let permitidas = null
if (args.playlist) {
  const nodos = []
  const recorrer = (n) => (n?.NODE ?? []).forEach((x) => (nodos.push(x), recorrer(x.SUBNODES)))
  recorrer(nml.PLAYLISTS)
  const lista = nodos.find((n) => n.TYPE === 'PLAYLIST' && n.NAME === args.playlist)
  if (!lista) {
    console.error(`No encuentro la playlist «${args.playlist}»`)
    process.exit(1)
  }
  permitidas = new Set((lista.PLAYLIST?.ENTRY ?? []).map((e) => e.PRIMARYKEY?.[0]?.KEY))
}

const trabajos = []
for (const e of entradas) {
  const loc = e.LOCATION
  if (!loc?.FILE) continue
  if (permitidas && !permitidas.has(`${loc.VOLUME}${loc.DIR}${loc.FILE}`)) continue
  const carpeta = String(loc.DIR ?? '').replace(/\/:/g, '/')
  const ruta = carpeta + loc.FILE // igual que la guarda la web (lib/traktor.js)
  const duracion = e.INFO?.PLAYTIME ? Number(e.INFO.PLAYTIME) : null
  const tema = { titulo: e.TITLE ?? '', artista: e.ARTIST ?? '', ruta, archivo: loc.FILE, duracion }
  if (esSample(tema) || (duracion != null && duracion < 60)) continue
  // En el Mac: el disco principal es la raíz; los demás discos cuelgan de /Volumes
  const enDisco = loc.VOLUME && !['Macintosh HD', ''].includes(loc.VOLUME) ? join('/Volumes', loc.VOLUME, ruta) : ruta
  const cues = (e.CUE_V2 ?? []).filter((c) => Number(c.HOTCUE) >= 0 && c.TYPE !== '4').map((c) => Number(c.START) / 1000)
  trabajos.push({ ruta, enDisco, duracion, bpm: e.TEMPO?.BPM ? Number(e.TEMPO.BPM) : null, cues })
  if (trabajos.length >= LIMITE) break
}

mkdirSync(SALIDA, { recursive: true })
const ERRORES = `${SALIDA}-errores.txt` // fuera de la carpeta que se sube: lleva rutas de tu Mac
rmSync(ERRORES, { force: true })

// ——— Crear cada fragmento ———
const cuenta = { hechos: 0, estaban: 0, sinArchivo: 0, fallos: 0 }
const pintar = (i) => process.stdout.write(`\r[${i}/${trabajos.length}] nuevos ${cuenta.hechos} · ya estaban ${cuenta.estaban} · sin archivo ${cuenta.sinArchivo} · fallos ${cuenta.fallos}   `)

function ffmpeg(argumentos) {
  return new Promise((ok) => {
    const p = spawn(FFMPEG, argumentos, { stdio: ['ignore', 'ignore', 'pipe'] })
    let error = ''
    p.stderr.on('data', (d) => (error += d))
    p.on('close', (codigo) => ok(codigo === 0 ? null : error.trim().split('\n').pop()))
  })
}

async function crear(t) {
  const id = await idFragmento(t.ruta)
  const destino = join(SALIDA, `${id}.mp3`)
  if (existsSync(destino)) return cuenta.estaban++
  if (!existsSync(t.enDisco)) {
    cuenta.sinArchivo++
    appendFileSync(ERRORES, `sin archivo\t${t.enDisco}\n`)
    return
  }
  const inicio = inicioFragmento(t, SEGUNDOS)
  const dura = t.duracion ? Math.min(SEGUNDOS, t.duracion - inicio) : SEGUNDOS
  const temporal = `${destino}.parcial`
  const fallo = await ffmpeg([
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(inicio), '-t', String(dura), '-i', t.enDisco,
    '-vn', '-map', '0:a:0',
    '-map_metadata', '-1', '-id3v2_version', '0', // sin título, artista ni portada dentro del mp3
    '-ac', '2', '-ar', '44100', '-b:a', `${KBPS}k`,
    '-af', `afade=t=in:d=1,afade=t=out:st=${Math.max(0, dura - 1.5)}:d=1.5`,
    '-f', 'mp3', temporal,
  ])
  if (fallo) {
    cuenta.fallos++
    rmSync(temporal, { force: true })
    appendFileSync(ERRORES, `ffmpeg\t${t.enDisco}\t${fallo}\n`)
    return
  }
  renameSync(temporal, destino) // solo aparece cuando está entero: si paras a mitad, no queda uno roto
  cuenta.hechos++
}

console.log(`RGBPM · ${trabajos.length} temas → ${SALIDA} (${SEGUNDOS} s a ${KBPS} kbps)`)
let siguiente = 0
await Promise.all(
  Array.from({ length: HILOS }, async () => {
    while (siguiente < trabajos.length) {
      const t = trabajos[siguiente++]
      await crear(t)
      pintar(siguiente)
    }
  })
)

// ——— Índice para el servidor: solo nombres anónimos ———
const ids = readdirSync(SALIDA).filter((f) => /^[a-f0-9]{16}\.mp3$/.test(f)).map((f) => f.slice(0, 16)).sort()
writeFileSync(join(SALIDA, 'fragmentos.json'), JSON.stringify({ version: 1, creado: new Date().toISOString(), segundos: SEGUNDOS, ids }))
const bytes = ids.reduce((s, id) => s + statSync(join(SALIDA, `${id}.mp3`)).size, 0)

console.log(`\n\nListo: ${ids.length} fragmentos · ${(bytes / 1024 ** 3).toFixed(2)} GB`)
if (cuenta.sinArchivo || cuenta.fallos) console.log(`Revisa ${ERRORES} (${cuenta.sinArchivo} sin archivo, ${cuenta.fallos} fallos)`)
console.log(`Sube la carpeta entera por SFTP como  rgbpm-audio/privado/fragmentos/`)
