import Portada from './Portada'
import TarjetaTema from './TarjetaTema'
import { compatibles } from '../logic/armonia'

function formatoBpm(dif) {
  if (Math.abs(dif) < 0.05) return '= BPM'
  return `${dif > 0 ? '+' : '−'}${Math.abs(dif).toFixed(1)} %`
}

export default function PanelArmonia({ tema, biblioteca, alElegir }) {
  if (!tema) {
    return (
      <aside className="panel panel--vacio">
        <p>Elige un tema para ver con qué mezcla.</p>
      </aside>
    )
  }

  // Estado derivado: no se guarda, se calcula en cada render a partir del tema elegido
  const lista = compatibles(tema, biblioteca)

  return (
    <aside className="panel">
      <header className="panel__cabecera">
        <Portada clave={tema.clave} tamano={96} />
        <div>
          <p className="sobretitulo">Sonando</p>
          <h2>{tema.titulo}</h2>
          <p>{tema.artista} · {tema.bpm} BPM · <span className="clave">{tema.clave}</span></p>
        </div>
      </header>

      <h3>Mezcla con ({lista.length})</h3>
      {lista.length === 0 ? (
        <p className="vacio">Nada compatible a ±6 % de tempo.</p>
      ) : (
        <ul className="lista">
          {lista.map((otro) => (
            <TarjetaTema
              key={otro.id}
              tema={otro}
              alElegir={alElegir}
              detalle={`${otro.relacion} · ${formatoBpm(otro.difBpm)}`}
            />
          ))}
        </ul>
      )}
    </aside>
  )
}
