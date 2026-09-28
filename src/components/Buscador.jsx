// Campo controlado: el valor vive en App y aquí solo se muestra y se notifica.
export default function Buscador({ valor, alCambiar }) {
  return (
    <label className="buscador">
      <span className="sr-only">Buscar tema o artista</span>
      <input
        type="search"
        placeholder="Buscar tema o artista…"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
      />
    </label>
  )
}
