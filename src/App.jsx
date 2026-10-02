import { lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { cargar } from './app/pantallas'
import Shell from './app/Shell'
import { AjustesArmoniaProvider } from './features/armonia/AjustesArmoniaContext'
import Biblioteca from './features/biblioteca/Biblioteca'
import { BibliotecaProvider } from './features/biblioteca/BibliotecaContext'
import { MusicaProvider } from './features/musica/MusicaContext'
import { ReproductorProvider } from './features/musica/ReproductorContext'
import Home from './features/home/Home'
import Proximamente from './features/proximamente/Proximamente'
import { SetProvider } from './features/sets/SetContext'

// Pantallas pesadas: se descargan al abrirlas (o antes, si pasas por su círculo en la home)
const Tap = lazy(cargar.tap)
const Radio = lazy(cargar.radio)
const Armonia = lazy(cargar.armonia)
const Sets = lazy(cargar.sets)
const Juego = lazy(cargar.juego)
const AdivinaBpm = lazy(cargar.juego_bpm)
const PegaChoca = lazy(cargar.juego_pega)
const CualCorre = lazy(cargar.juego_corre)
const DondeCae = lazy(cargar.juego_cae)
const CuadraTempo = lazy(cargar.juego_cuadra)

// Lo que llega en los próximos sprints. La mascota cambia de ánimo en cada sección.
const PRONTO = [
  { ruta: 'mezclador', titulo: 'Mezclador', sprint: 3, bpm: 146, texto: 'Dos platos y crossfader para probar la transición antes del bolo.' },
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
                    <Route index element={<Home />} />
                    <Route path="biblioteca" element={<Biblioteca />} />
                    <Route path="set/:setId" element={<Biblioteca />} />
                    <Route path="tap" element={<Tap />} />
                    <Route path="radio" element={<Radio />} />
                    <Route path="armonia" element={<Armonia />} />
                    <Route path="sets" element={<Sets />} />
                    <Route path="juego" element={<Juego />} />
                    <Route path="juego/bpm" element={<AdivinaBpm />} />
                    <Route path="juego/pega" element={<PegaChoca />} />
                    <Route path="juego/corre" element={<CualCorre />} />
                    <Route path="juego/cae" element={<DondeCae />} />
                    <Route path="juego/cuadra" element={<CuadraTempo />} />
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
