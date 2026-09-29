import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Shell from './app/Shell'
import Biblioteca from './features/biblioteca/Biblioteca'
import { BibliotecaProvider } from './features/biblioteca/BibliotecaContext'
import Proximamente from './features/proximamente/Proximamente'
import Radio from './features/radio/Radio'
import Tap from './features/tap/Tap'

// Lo que llega en los próximos sprints. La mascota cambia de ánimo en cada sección.
const PRONTO = [
  { ruta: 'armonia', titulo: 'Rueda armónica', sprint: 4, bpm: 118, texto: 'Gira la rueda y verás tus siete categorías de mezcla sobre tus propios temas.' },
  { ruta: 'sets', titulo: 'Sets', sprint: 4, bpm: 132, texto: 'Arrastra temas, ordena por energía y genera la portada Pantone del set.' },
  { ruta: 'mezclador', titulo: 'Mezclador', sprint: 3, bpm: 146, texto: 'Dos platos, crossfader y la mascota escuchando de verdad: pruebas la transición antes del bolo.' },
]

// HashRouter: GitHub Pages no sabe de rutas, así que van detrás de la almohadilla (#/sets)
export default function App() {
  return (
    <BibliotecaProvider>
      <HashRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Biblioteca />} />
            <Route path="set/:setId" element={<Biblioteca />} />
            <Route path="tap" element={<Tap />} />
            <Route path="radio" element={<Radio />} />
            {PRONTO.map(({ ruta, ...p }) => (
              <Route key={ruta} path={ruta} element={<Proximamente {...p} />} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </BibliotecaProvider>
  )
}
