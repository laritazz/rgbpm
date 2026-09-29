import { memo } from 'react'
import { colorBpm, tintaSobre } from '../../lib/color'

/**
 * Portada Pantone: la muestra de color es el BPM, la etiqueta blanca dice qué es.
 * memo: con miles de tarjetas, solo se vuelve a pintar la que cambia de estado.
 */
function TarjetaPantone({ tema, elegida, alElegir }) {
  const fondo = colorBpm(tema.bpm)
  return (
    <button
      className={`pantone${elegida ? ' pantone--elegida' : ''}`}
      onClick={() => alElegir(tema.id)}
      aria-pressed={elegida}
      style={{ '--muestra': fondo, '--tinta': tintaSobre(fondo) }}
    >
      <span className="pantone__muestra">
        <span className="pantone__codigo">
          RGBPM {tema.bpm ? Math.round(tema.bpm) : '—'}-{tema.clave?.id ?? '?'}
        </span>
        {tema.clave && <span className="pantone__clave">{tema.clave.id}</span>}
      </span>
      <span className="pantone__etiqueta">
        <span className="pantone__titulo">{tema.titulo}</span>
        <span className="pantone__artista">{tema.artista || 'Artista desconocido'}</span>
        <span className="pantone__datos">
          {tema.bpm ? `${tema.bpm} BPM` : 'Sin BPM'} · {tema.clave ? `${tema.clave.nombre}` : 'Sin clave'}
        </span>
      </span>
    </button>
  )
}

export default memo(TarjetaPantone)
