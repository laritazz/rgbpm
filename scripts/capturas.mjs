#!/usr/bin/env node
// RGBPM · capturas y vídeos para el portfolio (Creativezz, README).
// Se hacen con la demo pública: nada de música ni datos privados.
//
// Uso:
//   npm i --no-save playwright     (una vez; usa el Chromium del sistema si lo hay)
//   npm run build && npx vite preview --port 4173 &
//   npm run capturas
//
// Deja en public/media/: imágenes .webp, vídeos .mp4 (para la web) y .gif (para GitHub).
// Se publican con la web: https://laritazz.github.io/rgbpm/media/…
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

const URL = process.env.RGBPM_URL ?? 'http://localhost:4173/rgbpm/#'
const SALIDA = 'public/media'
const TEMPORAL = join(SALIDA, '.video')
const CHROMIUM = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync)
const esperar = (p, ms) => p.waitForTimeout(ms)

mkdirSync(TEMPORAL, { recursive: true })
const navegador = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {})

const ESCRITORIO = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
const MOVIL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }

async function cargarPlaylist(p, nombre = 'LN 27J') {
  await p.goto(`${URL}/sets`)
  await esperar(p, 700)
  await p.getByRole('tab', { name: 'Playlists' }).click()
  await p.locator('.anadir__listas button', { hasText: nombre }).first().click()
  await esperar(p, 1500)
}

// ——— Imágenes ———
async function captura(p, nombre) {
  const png = join(TEMPORAL, `${nombre}.png`)
  await p.screenshot({ path: png })
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', '85', join(SALIDA, `${nombre}.webp`)])
}

{
  const p = await navegador.newPage(ESCRITORIO)
  await p.goto(`${URL}/`)
  await esperar(p, 1800)
  await captura(p, 'escritorio-biblioteca')
  await cargarPlaylist(p)
  await p.getByRole('button', { name: 'Reordenar' }).click()
  await esperar(p, 1200)
  await captura(p, 'escritorio-set')
  await p.goto(`${URL}/tap`)
  await esperar(p, 1200)
  await captura(p, 'escritorio-escuchar')
  await p.close()
}
{
  const p = await navegador.newPage(MOVIL)
  await p.goto(`${URL}/`)
  await esperar(p, 1800)
  await captura(p, 'movil-biblioteca')
  await cargarPlaylist(p)
  await captura(p, 'movil-set')
  await p.goto(`${URL}/tap`)
  await esperar(p, 1000)
  await captura(p, 'movil-escuchar')
  await p.close()
}

// ——— Vídeos: se graban en .webm y se pasan a .mp4 y .gif ———
async function grabar(nombre, opciones, guion) {
  const dir = join(TEMPORAL, nombre)
  const tamano = opciones.viewport
  const contexto = await navegador.newContext({ ...opciones, deviceScaleFactor: 1, recordVideo: { dir, size: tamano } })
  const p = await contexto.newPage()
  await guion(p)
  await contexto.close()
  const webm = join(dir, readdirSync(dir).find((f) => f.endsWith('.webm')))
  renameSync(webm, join(TEMPORAL, `${nombre}.webm`))
}

function convertir(nombre, { desde = 0, ancho, recorte }) {
  const origen = join(TEMPORAL, `${nombre}.webm`)
  const filtros = [recorte && `crop=${recorte}`, `scale=${ancho}:-2:flags=lanczos`].filter(Boolean).join(',')
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(desde), '-i', origen, '-vf', `fps=30,${filtros}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', '-an', join(SALIDA, `${nombre}.mp4`)])
  const paleta = `fps=12,${filtros.replace(/scale=\d+/, `scale=${Math.round(ancho * 0.7)}`)},split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(desde), '-i', origen, '-vf', paleta, join(SALIDA, `${nombre}.gif`)])
}

const TAP = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
await grabar('tap-bpm', TAP, async (p) => {
  await p.goto(`${URL}/tap`)
  await esperar(p, 700)
  await p.getByRole('tab', { name: 'Tap BPM' }).click()
  await esperar(p, 600)
  // Toques a 128 BPM exactos: se programan dentro de la página para que no los retrase Playwright
  await p.evaluate(
    () =>
      new Promise((listo) => {
        const zona = document.querySelector('.tap__escenario')
        const inicio = performance.now()
        let n = 0
        const tocar = () => {
          zona.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
          if (++n < 20) setTimeout(tocar, inicio + n * (60000 / 128) - performance.now())
          else listo()
        }
        tocar()
      })
  )
  await esperar(p, 2500)
})
convertir('tap-bpm', { desde: 1, ancho: 390 })

// La mascota sola, bailando: recorte cuadrado del mismo vídeo
execFileSync('cp', [join(TEMPORAL, 'tap-bpm.webm'), join(TEMPORAL, 'mascota.webm')])
convertir('mascota', { desde: 8, ancho: 480, recorte: '330:330:30:124' })

await grabar('set-reordenar', { viewport: { width: 1280, height: 800 } }, async (p) => {
  await cargarPlaylist(p)
  await esperar(p, 800)
  await p.getByRole('button', { name: 'Reordenar' }).click()
  await esperar(p, 2500)
  await p.getByRole('button', { name: 'Deshacer' }).click()
  await esperar(p, 1500)
  await p.getByRole('button', { name: 'Reordenar' }).click()
  await esperar(p, 2000)
})
convertir('set-reordenar', { desde: 2, ancho: 1280 })

await grabar('biblioteca-color', { viewport: { width: 1280, height: 800 } }, async (p) => {
  await p.goto(`${URL}/`)
  await esperar(p, 1500)
  for (const franja of ['Turquesa', 'Oliva', 'Amarillo', 'Todas']) {
    await p.locator('button', { hasText: franja }).first().click()
    await esperar(p, 1300)
  }
})
convertir('biblioteca-color', { desde: 1.2, ancho: 1280 })

await navegador.close()
rmSync(TEMPORAL, { recursive: true, force: true })
console.log(`Listo: ${readdirSync(SALIDA).join(', ')}`)
