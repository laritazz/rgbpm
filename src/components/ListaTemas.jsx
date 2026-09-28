import TarjetaTema from './TarjetaTema'

export default function ListaTemas({ temas, seleccionado, alElegir }) {
  if (temas.length === 0) {
    return <p className="vacio">Sin resultados. Prueba con otro nombre.</p>
  }

  return (
    <ul className="lista">
      {temas.map((tema) => (
        <TarjetaTema
          key={tema.id}
          tema={tema}
          activo={seleccionado?.id === tema.id}
          alElegir={alElegir}
        />
      ))}
    </ul>
  )
}
