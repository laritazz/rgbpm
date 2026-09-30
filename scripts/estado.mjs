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

const codigo = archivos('src').filter((f) => /\.(jsx?|css)$/.test(f))
const pruebas = codigo.filter((f) => f.endsWith('.test.js'))

const estado = {
  proyecto: 'RGBPM',
  web: 'https://laritazz.github.io/rgbpm/',
  repo: 'https://github.com/laritazz/rgbpm',
  version: process.env.GITHUB_SHA?.slice(0, 7) ?? git('rev-parse --short HEAD'),
  publicado: new Date().toISOString(),
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
