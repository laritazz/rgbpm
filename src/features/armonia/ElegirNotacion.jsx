import { useAjustesArmonia } from './AjustesArmoniaContext'
import './ElegirNotacion.css'

// Cada software escribe las claves a su manera: se pregunta una vez y se recuerda
const OPCIONES = [
  { id: 'open', software: 'Traktor', ejemplo: '1m' },
  { id: 'camelot', software: 'rekordbox · Serato', ejemplo: '8A' },
  { id: 'nombre', software: 'Por tono', ejemplo: 'Am' },
]

/** «¿Con qué pinchas?»: aparece hasta que eliges una notación (aquí o en Armonía). */
export default function ElegirNotacion() {
  const { elegida, notacion, cambiar } = useAjustesArmonia()
  if (elegida) return null
  return (
    <section className="elegir-notacion" aria-labelledby="titulo-notacion">
      <h2 id="titulo-notacion">¿Con qué pinchas?</h2>
      <div className="elegir-notacion__opciones" role="radiogroup" aria-labelledby="titulo-notacion">
        {OPCIONES.map((o) => (
          <button key={o.id} role="radio" aria-checked={notacion === o.id} onClick={() => cambiar('notacion', o.id)}>
            <strong>{o.ejemplo}</strong>
            <small>{o.software}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
