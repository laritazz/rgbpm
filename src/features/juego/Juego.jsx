import { Link } from 'react-router-dom'
import { IconoDado, IconoEscuchar, IconoRueda, IconoCadena } from '../../components/Iconos'
import { useRecord } from './useRecord'
import './Juego.css'

const JUEGOS = [
  { id: 'bpm', a: '/juego/bpm', nombre: 'Adivina el BPM', texto: 'Suena un tema: marca el ritmo sobre la mascota.', Icono: IconoEscuchar, listo: true },
  { id: 'pega', nombre: '¿Pega o choca?', texto: 'Dos temas seguidos: ¿qué salto armónico es?', Icono: IconoCadena },
  { id: 'cae', nombre: '¿Dónde cae?', texto: 'Toca en la rueda el tono de lo que suena.', Icono: IconoRueda },
  { id: 'cuadra', nombre: 'Cuadra el tempo', texto: 'Mueve el pitch hasta que las dos mascotas bailen a la vez.', Icono: IconoDado },
]

/** Juegos para aprender a mezclar con tus propios temas. */
export default function Juego() {
  const { mejor, partidas } = useRecord()
  return (
    <main className="juego">
      <header className="juego__cabecera">
        <h1>Juego</h1>
        <p>Aprende a mezclar jugando con tus temas.</p>
      </header>
      <ul className="juegos">
        {JUEGOS.map(({ id, a, nombre, texto, Icono, listo }) => {
          const contenido = (
            <>
              <span className="juegos__icono" aria-hidden="true">
                <Icono width={40} height={40} />
              </span>
              <span className="juegos__texto">
                <strong>{nombre}</strong>
                <small>{texto}</small>
              </span>
              <span className="juegos__estado">{listo ? (mejor ? `Récord ${mejor}` : 'Jugar') : 'Pronto'}</span>
            </>
          )
          return (
            <li key={id}>
              {listo ? (
                <Link to={a} className="juegos__tarjeta">
                  {contenido}
                </Link>
              ) : (
                <div className="juegos__tarjeta juegos__tarjeta--pronto" aria-disabled="true">
                  {contenido}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {partidas > 0 && <p className="juego__nota">{partidas} {partidas === 1 ? 'partida' : 'partidas'} jugadas</p>}
    </main>
  )
}
