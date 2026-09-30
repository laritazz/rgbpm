// Cada pantalla se descarga solo cuando hace falta. La home las precarga al pasar por su círculo:
// cuando tocas, ya está en el navegador y no hay espera.
export const cargar = {
  tap: () => import('../features/tap/Tap'),
  radio: () => import('../features/radio/Radio'),
  armonia: () => import('../features/armonia/Armonia'),
  sets: () => import('../features/sets/Sets'),
  juego: () => import('../features/juego/Juego'),
  juegoBpm: () => import('../features/juego/AdivinaBpm'),
}

export const precargar = (id) => cargar[id]?.().catch(() => {})
