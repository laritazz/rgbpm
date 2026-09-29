#!/usr/bin/env node
// RGBPM · crea servidor/rgbpm-audio/privado/config.php con un secreto nuevo.
// El secreto no se muestra en pantalla ni se sube a GitHub (config.php está en .gitignore).
//   npm run servidor:config
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'

const DESTINO = new URL('../servidor/rgbpm-audio/privado/config.php', import.meta.url)
const config = readFileSync(new URL('../src/lib/config.js', import.meta.url), 'utf8')
const leer = (nombre) => new RegExp(`${nombre} = .*?'([^']+)'`).exec(config)?.[1]

const pregunta = createInterface({ input: process.stdin, output: process.stdout })
if (existsSync(DESTINO)) {
  const r = await pregunta.question('Ya hay un config.php. ¿Crear uno nuevo? Los enlaces firmados viejos dejarán de valer (s/N) ')
  if (!/^s/i.test(r.trim())) process.exit(0)
}
const email = (await pregunta.question('Tu email de Supabase: ')).trim().toLowerCase()
pregunta.close()
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Ese email no parece válido.')
  process.exit(1)
}

const php = `<?php
// RGBPM · configuración del audio privado (generada con npm run servidor:config).
// NO se sube a GitHub. Súbela por SFTP a rgbpm-audio/privado/config.php
return [
    'supabase_url' => '${leer('SUPABASE_URL')}',
    'supabase_clave' => '${leer('SUPABASE_CLAVE')}',
    'emails' => ['${email}'],
    'secreto' => '${randomBytes(32).toString('hex')}',
    'origenes' => ['https://laritazz.github.io', 'http://localhost:5173', 'http://localhost:4173'],
    'caducidad' => 1200,
];
`
writeFileSync(DESTINO, php, { mode: 0o600 })
console.log('\nListo: servidor/rgbpm-audio/privado/config.php (con un secreto nuevo, que no hace falta que veas).')
