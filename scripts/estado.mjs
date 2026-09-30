#!/usr/bin/env node
// RGBPM · publica dist/estado.json: cómo va el proyecto, para que Creativezz lo lea en directo.
// Se lanza solo después de `vite build`. Solo datos públicos: nada de música, rutas ni claves.
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const leer = (ruta) => readFileSync(ruta, 'utf8')
const git = (orden) => {
  try {
    return execSync(`git ${orden}`, { encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

function archivos(carpeta) {
  return readdirSync(carpeta).flatMap((n) => {
    const ruta = join(carpeta, n)
    return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta]
  })
}

// Sesiones de la bitácora: «## Sesión 10 · 30 sep 2026 · Suena en el móvil»
const sesiones = [...leer('BITACORA.md').matchAll(/^## Sesión (\d+) · ([^·]+) · (.+)$/gm)].map(([, n, fecha, titulo]) => ({
  n: Number(n),
  fecha: fecha.trim(),
  titulo: titulo.trim(),
}))

// Paridad con la web original: cuántas utilidades en cada estado
const paridad = leer('docs/PARIDAD.md')
const cuenta = (marca) => paridad.split('\n').filter((l) => l.startsWith('|') && l.includes(`| ${marca} |`)).length

// Últimos commits, con cuánto código tocó cada uno (para la sección «En directo desde GitHub»)
function commits(cuantos = 12) {
  const salida = git(`log -${cuantos} --format=%x1e%H%x1f%aI%x1f%s --shortstat`)
  if (!salida) return []
  return salida
    .split('\x1e')
    .filter(Boolean)
    .map((bloque) => {
      const [cabecera, ...resto] = bloque.trim().split('\n')
      const [sha, fecha, mensaje] = cabecera.split('\x1f')
      const stat = resto.join(' ')
      const numero = (re) => Number(stat.match(re)?.[1] ?? 0)
      const area = mensaje.match(/^(\p{L}+(?: \p{L}+)?):\s/u)?.[1] ?? null // «Sonando: …» → Sonando
      const texto = area ? mensaje.slice(area.length + 1).trim() : mensaje
      return {
        sha: sha.slice(0, 7),
        fecha,
        area,
        mensaje: texto.charAt(0).toUpperCase() + texto.slice(1),
        archivos: numero(/(\d+) files? changed/),
        mas: numero(/(\d+) insertions?/),
        menos: numero(/(\d+) deletions?/),
        url: `https://github.com/laritazz/rgbpm/commit/${sha}`,
      }
    })
}

const codigo = archivos('src').filter((f) => /\.(jsx?|css)$/.test(f))
const pruebas = codigo.filter((f) => f.endsWith('.test.js'))

const estado = {
  proyecto: 'RGBPM',
  web: 'https://laritazz.github.io/rgbpm/',
  repo: 'https://github.com/laritazz/rgbpm',
  version: process.env.GITHUB_SHA?.slice(0, 7) ?? git('rev-parse --short HEAD'),
  publicado: new Date().toISOString(),
  commits: commits(),
  totalCommits: Number(git('rev-list --count HEAD') ?? 0),
  sesiones,
  ultima: sesiones.at(-1) ?? null,
  paridad: { hecho: cuenta('✅'), aMedias: cuenta('🟡'), pendiente: cuenta('⏳'), nuevo: cuenta('✨') },
  codigo: {
    archivos: codigo.length,
    lineas: codigo.reduce((s, f) => s + leer(f).split('\n').length, 0),
    pruebas: pruebas.reduce((s, f) => s + (leer(f).match(/^\s*it\(/gm) ?? []).length, 0),
  },
  pila: ['React 19', 'Vite', 'React Router', 'Vitest', 'Web Audio', 'Web Workers', 'Supabase Auth', 'PHP (IONOS)', 'GitHub Actions'],
}

writeFileSync('dist/estado.json', JSON.stringify(estado, null, 2))
console.log(`estado.json · sesión ${estado.ultima?.n} · ${estado.paridad.hecho} hechas · ${estado.codigo.pruebas} pruebas`)
