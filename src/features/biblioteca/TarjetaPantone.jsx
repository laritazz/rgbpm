import { memo } from 'react'
import { usePulsacionLarga } from '../../hooks/usePulsacionLarga'
import { colorBpm, degradadoTema, tintaSobre } from '../../lib/color'
import { franjaPorId } from '../../lib/vibra'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'

/**
 * Portada Pantone: la muestra es el tema en color (BPM arriba, clave abajo); la etiqueta blanca dice qué es.
 * memo: con miles de tarjetas, solo se vuelve a pintar la que cambia de estado.
 * Pulsación larga o clic derecho: abre el dial de vibra. La muestra sigue siendo el BPM;
 * tu vibra se ve en la marca de la esquina y en el brillo cuando suena.
 */
function TarjetaPantone({ tema, elegida, alElegir, sonando = false, alReproducir, vibra = null, alPedirVibra }) {
  const { etiqueta } = useAjustesArmonia()
  const pulsacion = usePulsacionLarga(() => alPedirVibra?.(tema))
  const fondo = colorBpm(tema.bpm) // la tinta se calcula sobre el BPM: es donde va el texto
  const tuya = franjaPorId(vibra)
  return (
    <div className={`pantone-caja${sonando ? ' pantone-caja--sonando' : ''}`} style={{ '--muestra': degradadoTema(tema), '--brillo': tuya?.color ?? fondo, '--tinta': tintaSobre(fondo) }} {...(alPedirVibra ? pulsacion : {})}>
      <button className={`pantone${elegida ? ' pantone--elegida' : ''}`} onClick={() => alElegir(tema.id)} aria-pressed={elegida}>
        <span className="pantone__muestra">
          <span className="pantone__codigo">
            RGBPM {tema.bpm ? Math.round(tema.bpm) : '—'}-{tema.clave ? etiqueta(tema.clave) : '?'}
          </span>
          {tema.clave && <span className="pantone__clave">{etiqueta(tema.clave)}</span>}
          {tuya && <span className="pantone__vibra" style={{ '--vibra': tuya.color }} title={`Tu vibra: ${tuya.nombre}`} aria-label={`Tu vibra: ${tuya.nombre}`} />}
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
