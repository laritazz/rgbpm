import { useEffect, useMemo, useRef, useState } from 'react'
import MascotaEscena from '../../components/marca/MascotaEscena'
import { IconoBajar, IconoPausa, IconoPlay, IconoSiguiente } from '../../components/Iconos'
import { compatibles } from '../../lib/armonia'
import { degradadoTema, franjaDe } from '../../lib/color'
import { reloj } from '../../lib/formato'
import BotonSet from '../sets/BotonSet'
import { useReproductor, useTiempo } from './ReproductorContext'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'
import { useMusica } from './MusicaContext'
import { colorSonando } from '../../lib/vibra'
import { useVibras } from '../vibra/VibrasContext'

/**
 * Lo que suena, a pantalla completa: la mascota baila el tema y te propone con qué seguir.
 * <dialog> nativo (foco y Esc resueltos) y, en el móvil, se cierra deslizando hacia abajo.
 */
export default function PantallaSonando({ abierta, alCerrar }) {
  const ventana = useRef(null)
  const { tema, sonando, esperando, cola, indice, fundiendo, alternar, buscar, siguiente, reproducir } = useReproductor()
  const { tiempo, duracion } = useTiempo()
  const { paraSugerir: temas } = useMusica()
  const { vibraDe } = useVibras()
  const [drop, setDrop] = useState(null)
  const [arrastre, setArrastre] = useState(0)
  const inicio = useRef(null)

  useEffect(() => {
    const d = ventana.current
    if (abierta && tema && !d.open) d.showModal()
    if ((!abierta || !tema) && d.open) d.close()
  }, [abierta, tema])

  const { etiqueta, completa, opciones: ajustes } = useAjustesArmonia()
  const opciones = useMemo(() => (abierta && tema?.clave ? compatibles(tema, temas, 5, ajustes) : []), [abierta, tema, temas, ajustes])
  const proximo = cola.length && indice < cola.length - 1 ? cola[indice + 1] : null

  // Deslizar hacia abajo para cerrar (como las apps nativas)
  const empezarArrastre = (e) => {
    inicio.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const moverArrastre = (e) => inicio.current != null && setArrastre(Math.max(0, e.clientY - inicio.current))
  const soltarArrastre = () => {
    if (arrastre > 110) alCerrar()
    inicio.current = null
    setArrastre(0)
  }

  if (!tema) return <dialog ref={ventana} className="escena" onClose={alCerrar} />

  const bpm = tema.bpm
  const vibra = vibraDe(tema)
  const ambiente = colorSonando(tema, vibra) // tu vibra manda cuando suena
  return (
    <dialog
      ref={ventana}
      className="escena"
      onClose={alCerrar}
      aria-label={`Sonando: ${tema.titulo}`}
      style={{ '--color': ambiente, translate: arrastre ? `0 ${arrastre}px` : undefined, transition: arrastre ? 'none' : undefined }}
    >
      <div className="escena__asa" onPointerDown={empezarArrastre} onPointerMove={moverArrastre} onPointerUp={soltarArrastre} onPointerCancel={soltarArrastre}>
        <button className="escena__cerrar" onClick={alCerrar} aria-label="Cerrar">
          <IconoBajar />
        </button>
        <span className="etiqueta-seccion">{fundiendo ? 'Mezclando…' : cola.length ? `Radio · ${indice + 1} de ${cola.length}` : 'Sonando'}</span>
      </div>

      <div className="escena__principal">
        {/* La mascota es el play: un toque pausa o reanuda */}
        <button className={`escena__mascota${sonando ? '' : ' escena__mascota--pausa'}`} onClick={alternar} aria-label={sonando ? 'Pausa' : 'Reproducir'}>
          <MascotaEscena bpm={bpm} tocando={sonando || esperando} drop={drop} tinte={vibra ? ambiente : null} tamano={420} />
          <span className="escena__estado" aria-hidden="true">
            {sonando ? <IconoPausa width={28} height={28} /> : <IconoPlay width={34} height={34} />}
          </span>
        </button>

        <header className="escena__ficha">
          <h2>{tema.titulo}</h2>
          <p>{tema.artista}</p>
          <ul className="escena__datos">
            <li>{bpm ? `${bpm} BPM` : 'Sin BPM'}</li>
            {tema.clave && (
              <li>
                {completa(tema.clave)}
              </li>
            )}
            {bpm && <li className="escena__franja">{franjaDe(bpm).nombre}</li>}
          </ul>
        </header>

        <div className="escena__tiempo">
          <input type="range" min="0" max={duracion || 0} step="0.1" value={tiempo} onChange={(e) => buscar(Number(e.target.value))} aria-label="Posición" />
          <div>
            <span>{reloj(tiempo)}</span>
            <span>-{reloj(Math.max(0, duracion - tiempo))}</span>
          </div>
        </div>

        <div className="escena__mandos">
          <button className="escena__drop" onClick={() => setDrop(performance.now())} disabled={!sonando}>
            Drop
          </button>
          <BotonSet tema={tema} />
          <button className="escena__siguiente" onClick={siguiente} disabled={!proximo || fundiendo} aria-label="Siguiente con fundido">
            <IconoSiguiente width={28} height={28} />
          </button>
        </div>
      </div>

      {proximo && (
        <p className="escena__proximo">
          Después: <strong>{proximo.titulo}</strong> · {proximo.bpm} BPM · {etiqueta(proximo.clave)}
        </p>
      )}

      {opciones.length > 0 && (
        <section className="escena__mezcla" aria-labelledby="titulo-escena-mezcla">
          <h3 id="titulo-escena-mezcla" className="etiqueta-seccion">
            Mezcla con
          </h3>
          <ul>
            {opciones.map((o) => (
              <li key={o.tema.id}>
                <button onClick={() => reproducir(o.tema)}>
                  <span className="escena__muestra" style={{ background: degradadoTema(o.tema) }} aria-hidden="true" />
                  <span className="escena__opcion">
                    <strong>{o.tema.titulo}</strong>
                    <small>
                      <span className="escena__categoria" style={{ '--cat': o.categoria.color }}>
                        {o.categoria.nombre}
                      </span>
                      {o.tema.bpm} BPM · {etiqueta(o.tema.clave)}
                    </small>
                  </span>
                  <span className="escena__nota">{o.nota}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </dialog>
  )
}
