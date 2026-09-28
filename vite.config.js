import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Sello de versión vAAAAMMDD.HHMM, calculado al arrancar o compilar
function sello() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `v${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.${p(d.getHours())}${p(d.getMinutes())}`
}

export default defineConfig({
  plugins: [react()],
  // GitHub Pages publica en laritazz.github.io/rgbpm/
  base: '/rgbpm/',
  define: {
    __VERSION__: JSON.stringify(sello()),
  },
})
