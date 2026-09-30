import { IconoDiscos, IconoEscuchar, IconoJuego, IconoMezclador, IconoRadio, IconoRueda, IconoSets } from '../components/Iconos'

// Las secciones de la app, en un solo sitio: el inicio (círculos), el menú lateral y sus iconos.
// `peso` es el tamaño del círculo en el inicio: lo que más se usa, más grande.
export const SECCIONES = [
  { id: 'biblioteca', a: '/biblioteca', nombre: 'Biblioteca', Icono: IconoDiscos, peso: 21, lista: true },
  { id: 'armonia', a: '/armonia', nombre: 'Armonía', Icono: IconoRueda, peso: 19, lista: true },
  { id: 'sets', a: '/sets', nombre: 'Sets', Icono: IconoSets, peso: 18, lista: true },
  { id: 'tap', a: '/tap', nombre: 'Escuchar', Icono: IconoEscuchar, peso: 15, lista: true },
  { id: 'juego', a: '/juego', nombre: 'Juego', Icono: IconoJuego, peso: 14.5 },
  { id: 'radio', a: '/radio', nombre: 'Radio', Icono: IconoRadio, peso: 14, lista: true },
  { id: 'mezclador', a: '/mezclador', nombre: 'Mezclador', Icono: IconoMezclador, peso: 13 },
]
