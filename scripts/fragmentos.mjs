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
//   --buscar    carpetas donde buscar por nombre si el tema se movió
//               («/Volumes/LaritaZZ,~/Music»)
//
// Se puede parar (Ctrl+C) y volver a lanzar: los que ya existen no se repiten.
// Necesita ffmpeg: si no lo tienes, `npm i --no-save ffmpeg-static` una vez.

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync, appendFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { XMLParser } from 'fast-xml-parser'
import { idFragmento, idTitulo, inicioFragmento } from '../src/lib/fragmentos.js'
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
const funciona = (ruta) => ruta && spawnSync(ruta, ['-version']).status === 0
const estatico = await import('ffmpeg-static').then((m) => m.default).catch(() => null)
const FFMPEG = funciona(estatico) ? estatico : 'ffmpeg' // el estático puede ser de otro sistema
if (!funciona(FFMPEG)) {
  console.error('No encuentro ffmpeg. Instálalo con:  npm i --no-save ffmpeg-static')
  process.exit(1)
}

// ——— Leer la colección ———
const lector = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', isArray: (n) => ['ENTRY', 'CUE_V2', 'NODE', 'PRIMARYKEY'].includes(n) })
const nml = lector.parse(readFileSync(NML, 'utf8')).NML
const entradas = nml.COLLECTION.ENTRY ?? []

// --playlist «LN 14F» → solo esa · --playlist todas → todas menos las de sistema («_RECORDINGS», «_LOOPS»)
let permitidas = null
if (args.playlist) {
  const nodos = []
  const recorrer = (n) => (n?.NODE ?? []).forEach((x) => (nodos.push(x), recorrer(x.SUBNODES)))
  recorrer(nml.PLAYLISTS)
  const listas = nodos.filter((n) => n.TYPE === 'PLAYLIST' && (args.playlist === 'todas' ? !String(n.NAME).startsWith('_') : n.NAME === args.playlist))
  if (!listas.length) {
    console.error(`No encuentro la playlist «${args.playlist}»`)
    process.exit(1)
  }
  permitidas = new Set(listas.flatMap((l) => (l.PLAYLIST?.ENTRY ?? []).map((e) => e.PRIMARYKEY?.[0]?.KEY)))
  console.log(`Playlists: ${listas.map((l) => l.NAME).join(' · ')}`)
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
  trabajos.push({ ruta, enDisco, titulo: String(tema.titulo), artista: String(tema.artista), duracion, bpm: e.TEMPO?.BPM ? Number(e.TEMPO.BPM) : null, cues })
  if (trabajos.length >= LIMITE) break
}

mkdirSync(SALIDA, { recursive: true })
const ERRORES = join(dirname(NML), 'fragmentos-errores.txt') // junto al .nml: nunca en la carpeta que se sube
rmSync(ERRORES, { force: true })
rmSync(`${SALIDA}-errores.txt`, { force: true }) // el de versiones anteriores

// ——— ¿Existe, falta o macOS no deja leerlo? ———
function estado(ruta) {
  try {
    return statSync(ruta).isFile() ? 'ok' : 'falta'
  } catch (e) {
    return ['EPERM', 'EACCES'].includes(e.code) ? 'permiso' : 'falta'
  }
}

// Si la primera carpeta no se deja leer, macOS está bloqueando a la Terminal: avisar y parar
const bloqueada = (carpeta) => {
  try {
    readdirSync(carpeta)
    return false
  } catch (e) {
    return ['EPERM', 'EACCES'].includes(e.code)
  }
}
const primera = trabajos.find((t) => estado(t.enDisco) === 'permiso' || bloqueada(dirname(t.enDisco)))
if (primera) {
  console.error(`
macOS no deja a la Terminal leer:
  ${dirname(primera.enDisco)}

Arréglalo una vez:
  1. Ajustes del Sistema → Privacidad y seguridad → Acceso total al disco
  2. Activa «Terminal» (si no está, pulsa + y añádela desde Aplicaciones → Utilidades)
  3. Cierra la Terminal del todo (Cmd+Q), ábrela y lanza el comando otra vez
`)
  process.exit(1)
}

// Índice por nombre de archivo de las carpetas de --buscar (para temas movidos de sitio)
const porNombre = new Map()
function indexar(carpeta, nivel = 0) {
  if (nivel > 8) return
  let hijos = []
  try {
    hijos = readdirSync(carpeta, { withFileTypes: true })
  } catch {
    return
  }
  for (const h of hijos) {
    if (h.name.startsWith('.')) continue
    const ruta = join(carpeta, h.name)
    if (h.isDirectory()) indexar(ruta, nivel + 1)
    else if (h.isFile()) porNombre.set(h.name.normalize('NFC'), [...(porNombre.get(h.name.normalize('NFC')) ?? []), ruta])
  }
}
const raices = (args.buscar ?? '').split(',').map((r) => r.trim()).filter(Boolean).map((r) => resolve(casa(r)))
if (raices.length) {
  process.stdout.write(`Buscando tu música en ${raices.join(', ')}… `)
  raices.forEach((r) => indexar(r))
  console.log(`${porNombre.size.toLocaleString('es')} archivos`)
}

// Cuántas carpetas del final coinciden: desempata entre archivos con el mismo nombre
const cola = (a, b) => {
  const x = a.split('/').reverse()
  const y = b.split('/').reverse()
  let n = 0
  while (n < x.length && x[n] === y[n]) n++
  return n
}
// En el Mac, si no está en --buscar, se lo pregunto a Spotlight (encuentra también discos externos)
function spotlight(nombre) {
  if (process.platform !== 'darwin') return []
  const consulta = `kMDItemFSName == "${nombre.replace(/["\\]/g, '\\$&')}"`
  const r = spawnSync('mdfind', [consulta], { encoding: 'utf8' })
  return r.status === 0 ? r.stdout.split('\n').filter((l) => l && estado(l) === 'ok') : []
}
const movidos = new Map() // carpeta nueva → cuántos
function localizar(t) {
  if (estado(t.enDisco) === 'ok') return t.enDisco
  const nombre = basename(t.enDisco)
  let candidatos = porNombre.get(nombre.normalize('NFC')) ?? []
  if (!candidatos.length) candidatos = spotlight(nombre)
  const elegido = candidatos.sort((a, b) => cola(b, t.enDisco) - cola(a, t.enDisco))[0] ?? null
  if (elegido) movidos.set(dirname(elegido), (movidos.get(dirname(elegido)) ?? 0) + 1)
  return elegido
}

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
  const archivo = localizar(t)
  if (!archivo) {
    cuenta.sinArchivo++
    appendFileSync(ERRORES, `sin archivo\t${t.enDisco}\n`)
    return
  }
  const inicio = inicioFragmento(t, SEGUNDOS)
  const dura = t.duracion ? Math.min(SEGUNDOS, t.duracion - inicio) : SEGUNDOS
  const temporal = `${destino}.parcial`
  const fallo = await ffmpeg([
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(inicio), '-t', String(dura), '-i', archivo,
    '-vn', '-map', '0:a:0',
    '-map_metadata', '-1', '-id3v2_version', '0', // sin título, artista ni portada dentro del mp3
    '-ac', '2', '-ar', '44100', '-b:a', `${KBPS}k`,
    '-af', `afade=t=in:d=1,afade=t=out:st=${Math.max(0, dura - 1.5)}:d=1.5`,
    '-f', 'mp3', temporal,
  ])
  if (fallo) {
    cuenta.fallos++
    rmSync(temporal, { force: true })
    appendFileSync(ERRORES, `ffmpeg\t${archivo}\t${fallo}\n`)
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
// Llave por artista y título → fragmento: así suenan también los temas sin ruta (la demo del móvil)
const anterior = existsSync(join(SALIDA, 'fragmentos.json')) ? JSON.parse(readFileSync(join(SALIDA, 'fragmentos.json'), 'utf8')) : {}
const titulos = { ...(anterior.titulos ?? {}) }
for (const t of trabajos) {
  const id = await idFragmento(t.ruta)
  if (ids.includes(id) && t.titulo) titulos[await idTitulo(t)] ??= id
}
for (const [llave, id] of Object.entries(titulos)) if (!ids.includes(id)) delete titulos[llave]
writeFileSync(join(SALIDA, 'fragmentos.json'), JSON.stringify({ version: 2, creado: new Date().toISOString(), segundos: SEGUNDOS, ids, titulos }))
const bytes = ids.reduce((s, id) => s + statSync(join(SALIDA, `${id}.mp3`)).size, 0)

console.log(`\n\nListo: ${ids.length} fragmentos · ${(bytes / 1024 ** 3).toFixed(2)} GB`)
if (cuenta.sinArchivo || cuenta.fallos) console.log(`Revisa ${ERRORES} (${cuenta.sinArchivo} sin archivo, ${cuenta.fallos} fallos)`)
if (movidos.size) {
  console.log('Encontrados en otra carpeta:')
  for (const [carpeta, n] of movidos) console.log(`  ${n} · ${carpeta}`)
}
if (cuenta.sinArchivo && !raices.length) console.log(`¿Los moviste de sitio? Añade  --buscar "/Volumes/TuDisco"  y los busco por nombre`)
console.log(`Sube la carpeta entera por SFTP como  rgbpm-audio/privado/fragmentos/`)
