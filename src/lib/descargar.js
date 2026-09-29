/** Descarga un texto como archivo, sin servidor. */
export function descargar(nombre, texto, tipo = 'text/plain') {
  const url = URL.createObjectURL(new Blob([texto], { type: `${tipo};charset=utf-8` }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
