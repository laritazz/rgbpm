import { useState } from 'react'
import Buscador from './components/Buscador'
import ListaTemas from './components/ListaTemas'
import PanelArmonia from './components/PanelArmonia'
import { biblioteca } from './data/biblioteca'

export default function App() {
  // Estado: lo único que cambia con la interacción
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  // Estado derivado: la lista filtrada se calcula, no se guarda
  const texto = busqueda.trim().toLowerCase()
  const filtrados = biblioteca.filter(
    (t) => t.titulo.toLowerCase().includes(texto) || t.artista.toLowerCase().includes(texto)
  )

  return (
    <div className="app">
      <header className="cabecera">
        <h1 className="logo">
          RGB<span>PM</span>
        </h1>
        <span className="version">{__VERSION__}</span>
      </header>

      <main className="rejilla">
        <section>
          <Buscador valor={busqueda} alCambiar={setBusqueda} />
          <ListaTemas temas={filtrados} seleccionado={seleccionado} alElegir={setSeleccionado} />
        </section>
        <PanelArmonia tema={seleccionado} biblioteca={biblioteca} alElegir={setSeleccionado} />
      </main>
    </div>
  )
}
