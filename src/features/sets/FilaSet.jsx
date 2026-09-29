import { memo } from 'react'
import { IconoAncla, IconoArrastrar, IconoBajar, IconoCambiar, IconoPausa, IconoPlay, IconoQuitar, IconoSubir } from '../../components/Iconos'
import { colorBpm } from '../../lib/color'
import { reloj } from '../../lib/formato'

/** Una fila del set. memo: al arrastrar o reproducir solo se repintan las filas que cambian. */
function FilaSet({ tema, indice, total, esAncla, sonando, arrastre, alArrastrar, alSoltar, alMover, alAnclar, alCambiar, alQuitar, alReproducir }) {
  return (
    <div
      data-fila={tema.id}
      className={`fila-set${esAncla ? ' fila-set--ancla' : ''}${arrastre ? ` fila-set--${arrastre}` : ''}${sonando ? ' fila-set--sonando' : ''}`}
      style={{ '--color': colorBpm(tema.bpm) }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(indice))
        alArrastrar(indice)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        const caja = e.currentTarget.getBoundingClientRect()
        alSoltar(indice, e.clientY - caja.top < caja.height / 2 ? 'arriba' : 'abajo', false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        const caja = e.currentTarget.getBoundingClientRect()
        alSoltar(indice, e.clientY - caja.top < caja.height / 2 ? 'arriba' : 'abajo', true)
      }}
    >
      <span className="fila-set__asa" aria-hidden="true">
        <IconoArrastrar width={18} height={18} />
      </span>
      <span className="fila-set__numero">{indice + 1}</span>
      <button className="fila-set__play" onClick={() => alReproducir(tema)} aria-label={`${sonando ? 'Pausar' : 'Escuchar'} ${tema.titulo}`}>
        {sonando ? <IconoPausa width={16} height={16} /> : <IconoPlay width={16} height={16} />}
      </button>
      <span className="fila-set__texto">
        <strong>{tema.titulo}</strong>
        <small>
          {tema.artista}
          {tema.duracion ? ` · ${reloj(tema.duracion)}` : ''}
        </small>
      </span>
      <span className="fila-set__bpm">{tema.bpm ?? '—'}</span>
      <span className="fila-set__clave">{tema.clave?.id ?? '—'}</span>
      <span className="fila-set__acciones">
        <button onClick={() => alMover(indice, indice - 1)} disabled={indice === 0} aria-label="Subir">
          <IconoSubir width={18} height={18} />
        </button>
        <button onClick={() => alMover(indice, indice + 1)} disabled={indice === total - 1} aria-label="Bajar">
          <IconoBajar width={18} height={18} />
        </button>
        <button className={esAncla ? 'activo' : ''} onClick={() => alAnclar(tema.id)} aria-pressed={esAncla} title="Buscar qué meter justo después de este tema">
          <IconoAncla width={18} height={18} />
        </button>
        <button onClick={() => alCambiar(tema.id)} title="Cambiar por otro tema de la misma clave y BPM parecido">
          <IconoCambiar width={18} height={18} />
        </button>
        <button onClick={() => alQuitar(tema.id)} aria-label={`Quitar ${tema.titulo} del set`}>
          <IconoQuitar width={18} height={18} />
        </button>
      </span>
    </div>
  )
}

export default memo(FilaSet)
