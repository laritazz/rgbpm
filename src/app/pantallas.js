// Cada pantalla se descarga solo cuando hace falta. La home las precarga al pasar por su círculo:
// cuando tocas, ya está en el navegador y no hay espera.
export const cargar = {
  tap: () => import('../features/tap/Tap'),
  radio: () => import('../features/radio/Radio'),
  armonia: () => import('../features/armonia/Armonia'),
  sets: () => import('../features/sets/Sets'),
  juego: () => import('../features/juego/Juego'),
  sistema: () => import('../features/sistema/Sistema'),
  juego_bpm: () => import('../features/juego/AdivinaBpm'),
  juego_pega: () => import('../features/juego/PegaChoca'),
  juego_corre: () => import('../features/juego/CualCorre'),
  juego_cae: () => import('../features/juego/DondeCae'),
  juego_cuadra: () => import('../features/juego/CuadraTempo'),
}

export const precargar = (id) => cargar[id]?.().catch(() => {})
