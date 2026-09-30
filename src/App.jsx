import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Shell from './app/Shell'
import Armonia from './features/armonia/Armonia'
import { AjustesArmoniaProvider } from './features/armonia/AjustesArmoniaContext'
import Biblioteca from './features/biblioteca/Biblioteca'
import { BibliotecaProvider } from './features/biblioteca/BibliotecaContext'
import { MusicaProvider } from './features/musica/MusicaContext'
import { ReproductorProvider } from './features/musica/ReproductorContext'
import Proximamente from './features/proximamente/Proximamente'
import Radio from './features/radio/Radio'
import { SetProvider } from './features/sets/SetContext'
import Sets from './features/sets/Sets'
import Tap from './features/tap/Tap'

// Lo que llega en los próximos sprints. La mascota cambia de ánimo en cada sección.
const PRONTO = [
  { ruta: 'mezclador', titulo: 'Mezclador', sprint: 3, bpm: 146, texto: 'Dos platos, crossfader y la mascota escuchando de verdad: pruebas la transición antes del bolo.' },
]

// HashRouter: GitHub Pages no sabe de rutas, así que van detrás de la almohadilla (#/sets)
export default function App() {
  return (
    <AjustesArmoniaProvider>
      <BibliotecaProvider>
        <MusicaProvider>
          <ReproductorProvider>
            <SetProvider>
              <HashRouter>
                <Routes>
                  <Route element={<Shell />}>
                    <Route index element={<Biblioteca />} />
                    <Route path="set/:setId" element={<Biblioteca />} />
                    <Route path="tap" element={<Tap />} />
                    <Route path="radio" element={<Radio />} />
                    <Route path="armonia" element={<Armonia />} />
                    <Route path="sets" element={<Sets />} />
                    {PRONTO.map(({ ruta, ...p }) => (
                      <Route key={ruta} path={ruta} element={<Proximamente {...p} />} />
                    ))}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </HashRouter>
            </SetProvider>
          </ReproductorProvider>
        </MusicaProvider>
      </BibliotecaProvider>
    </AjustesArmoniaProvider>
  )
}
