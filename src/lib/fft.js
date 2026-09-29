// FFT radix-2 in situ (Cooley–Tukey). Suficiente para analizar audio en el navegador sin librerías.

/** Transforma `re`/`im` (longitud potencia de 2) en su espectro. Modifica los arrays. */
export function fft(re, im) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let largo = 2; largo <= n; largo <<= 1) {
    const ang = (-2 * Math.PI) / largo
    const wr = Math.cos(ang)
    const wi = Math.sin(ang)
    for (let i = 0; i < n; i += largo) {
      let cr = 1
      let ci = 0
      for (let j = 0; j < largo / 2; j++) {
        const a = i + j
        const b = a + largo / 2
        const tr = re[b] * cr - im[b] * ci
        const ti = re[b] * ci + im[b] * cr
        re[b] = re[a] - tr
        im[b] = im[a] - ti
        re[a] += tr
        im[a] += ti
        const siguiente = cr * wr - ci * wi
        ci = cr * wi + ci * wr
        cr = siguiente
      }
    }
  }
}

const ventanas = new Map()
function hann(n) {
  if (!ventanas.has(n)) ventanas.set(n, Float32Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1))))
  return ventanas.get(n)
}

/** Magnitudes (mitad positiva) de un trozo de señal con ventana de Hann. */
export function magnitudes(senal, inicio, n) {
  const w = hann(n)
  const re = new Float32Array(n)
  const im = new Float32Array(n)
  for (let i = 0; i < n; i++) re[i] = (senal[inicio + i] ?? 0) * w[i]
  fft(re, im)
  const mag = new Float32Array(n / 2)
  for (let i = 0; i < n / 2; i++) mag[i] = Math.hypot(re[i], im[i])
  return mag
}
