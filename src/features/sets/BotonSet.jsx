import { IconoMasSimple } from '../../components/Iconos'
import { useSet } from './SetContext'

/** Añadir o quitar un tema del set, desde cualquier pantalla. */
export default function BotonSet({ tema, compacto = false }) {
  const { enSet, anadir, quitar } = useSet()
  const dentro = enSet.has(tema.id)
  return (
    <button
      className={`boton-set${dentro ? ' boton-set--dentro' : ''}${compacto ? ' boton-set--compacto' : ''}`}
      onClick={() => (dentro ? quitar(tema.id) : anadir(tema.id))}
      aria-pressed={dentro}
      aria-label={dentro ? `Quitar ${tema.titulo} del set` : `Añadir ${tema.titulo} al set`}
    >
      {dentro ? '✓' : <IconoMasSimple width={16} height={16} />}
      {!compacto && <span>{dentro ? 'En el set' : 'Al set'}</span>}
    </button>
  )
}
