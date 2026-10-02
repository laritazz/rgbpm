import { IconoCae, IconoCorre, IconoCuadra, IconoPega, IconoPulso } from '../../components/Iconos'

// Los juegos, en un solo sitio: el menú (cartel), las rutas y los récords
export const JUEGOS = [
  { id: 'bpm', a: '/juego/bpm', nombre: 'Adivina el BPM', Icono: IconoPulso },
  { id: 'pega', a: '/juego/pega', nombre: '¿Pega o choca?', Icono: IconoPega },
  { id: 'corre', a: '/juego/corre', nombre: '¿Cuál corre más?', Icono: IconoCorre },
  { id: 'cae', a: '/juego/cae', nombre: '¿Dónde cae?', Icono: IconoCae },
  { id: 'cuadra', a: '/juego/cuadra', nombre: 'Cuadra el tempo', Icono: IconoCuadra },
]
