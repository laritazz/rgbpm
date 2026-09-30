import { memo } from 'react'
import { colorBpm, tintaSobre } from '../../lib/color'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'

/**
 * Portada Pantone: la muestra de color es el BPM, la etiqueta blanca dice qué es.
 * memo: con miles de tarjetas, solo se vuelve a pintar la que cambia de estado.
 */
function TarjetaPantone({ tema, elegida, alElegir, sonando = false, alReproducir }) {
  const { etiqueta } = useAjustesArmonia()
  const fondo = colorBpm(tema.bpm)
  return (
    <div className={`pantone-caja${sonando ? ' pantone-caja--sonando' : ''}`} style={{ '--muestra': fondo, '--tinta': tintaSobre(fondo) }}>
      <button className={`pantone${elegida ? ' pantone--elegida' : ''}`} onClick={() => alElegir(tema.id)} aria-pressed={elegida}>
        <span className="pantone__muestra">
          <span className="pantone__codigo">
            RGBPM {tema.bpm ? Math.round(tema.bpm) : '—'}-{tema.clave ? etiqueta(tema.clave) : '?'}
          </span>
          {tema.clave && <span className="pantone__clave">{etiqueta(tema.clave)}</span>}
        </span>
        <span className="pantone__etiqueta">
          <span className="pantone__titulo">{tema.titulo}</span>
          <span className="pantone__artista">{tema.artista || 'Artista desconocido'}</span>
          <span className="pantone__datos">
            {tema.bpm ? `${tema.bpm} BPM` : 'Sin BPM'} · {tema.clave ? `${tema.clave.nombre}` : 'Sin clave'}
          </span>
        </span>
      </button>
      {alReproducir && (
        <button className="pantone__play" onClick={() => alReproducir(tema)} aria-label={`${sonando ? 'Pausar' : 'Reproducir'} ${tema.titulo}`}>
          {sonando ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}

export default memo(TarjetaPantone)
