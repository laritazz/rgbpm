import { useEffect, useMemo, useRef, useState } from 'react'
import Mascota from '../../components/marca/Mascota'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { useMusica } from './MusicaContext'

/** Ventana «Tu música»: de dónde suena cada tema. Usa <dialog> nativo: foco, Esc y fondo ya resueltos. */
export default function AjustesMusica() {
  const m = useMusica()
  const { temas, origen } = useBiblioteca()
  const ventana = useRef(null)
  const entradaCarpeta = useRef(null)
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const p = m.privado

  useEffect(() => {
    const d = ventana.current
    if (m.ajustesAbiertos && !d.open) d.showModal()
    if (!m.ajustesAbiertos && d.open) d.close()
  }, [m.ajustesAbiertos])

  const conArchivo = useMemo(() => (m.hayFuente ? temas.filter(m.tieneArchivo).length : 0), [temas, m.hayFuente, m.tieneArchivo])

  return (
    <dialog ref={ventana} className="ajustes" onClose={m.cerrarAjustes} aria-labelledby="titulo-ajustes">
      <header className="ajustes__cabecera">
        <Mascota bpm={conArchivo ? 128 : 100} variante="icono" tamano={56} tocando={m.hayFuente} />
        <div>
          <h2 id="titulo-ajustes">Tu música</h2>
          <p>
            {origen === 'demo'
              ? 'La demo no trae archivos: importa tu collection.nml para que suene.'
              : `${conArchivo.toLocaleString('es')} de ${temas.length.toLocaleString('es')} temas tienen archivo.`}
          </p>
        </div>
        <button className="ajustes__cerrar" onClick={m.cerrarAjustes} aria-label="Cerrar">
          ✕
        </button>
      </header>

      <section className="ajustes__bloque">
        <h3>En este ordenador</h3>
        <p>Eliges tus carpetas de música una vez. Nada se sube a ningún sitio.</p>
        {m.carpetas.length > 0 && (
          <ul className="ajustes__carpetas">
            {m.carpetas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        <p className="ajustes__estado">
          {m.estadoLocal === 'leyendo' && 'Leyendo carpetas…'}
          {m.estadoLocal === 'listo' && `${m.totalLocal.toLocaleString('es')} archivos de audio`}
          {m.estadoLocal === 'reconectar' && 'El navegador pide permiso otra vez para leer tus carpetas.'}
        </p>
        <div className="ajustes__botones">
          {m.estadoLocal === 'reconectar' && (
            <button className="boton boton--rosa" onClick={m.reconectar}>
              Dar permiso
            </button>
          )}
          {m.puedeElegirCarpeta ? (
            <button className={`boton ${m.estadoLocal === 'reconectar' ? 'boton--fantasma' : 'boton--rosa'}`} onClick={m.anadirCarpeta}>
              {m.carpetas.length ? 'Añadir otra carpeta' : 'Elegir carpeta'}
            </button>
          ) : (
            <>
              {/* Safari y Firefox: la carpeta se elige en cada visita */}
              <input ref={entradaCarpeta} type="file" webkitdirectory="" multiple hidden onChange={(e) => m.anadirArchivos(e.target.files)} />
              <button className="boton boton--rosa" onClick={() => entradaCarpeta.current.click()}>
                Elegir carpeta
              </button>
            </>
          )}
          {m.totalLocal > 0 && (
            <button className="boton boton--fantasma" onClick={m.olvidarCarpetas}>
              Olvidar
            </button>
          )}
        </div>
      </section>

      <section className="ajustes__bloque">
        <h3>Tu música privada</h3>
        <p>Fragmentos de 90 s para el móvil. Solo entras tú.</p>

        {p.estado === 'sin-configurar' && <p className="ajustes__estado">Falta terminar de conectar el servidor. Muy pronto.</p>}

        {(p.estado === 'fuera' || (p.estado === 'entrando' && !p.email)) && (
          <form
            className="ajustes__login"
            onSubmit={async (e) => {
              e.preventDefault()
              if (await p.entrar(correo.trim(), clave)) setClave('')
            }}
          >
            <label>
              Email
              <input type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </label>
            <label>
              Contraseña
              <input type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
            </label>
            <button className="boton boton--rosa" disabled={p.estado === 'entrando'}>
              {p.estado === 'entrando' ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}

        {p.estado === 'dentro' && (
          <p className="ajustes__estado" role="status">
            Dentro como <strong>{p.email}</strong> · {p.total.toLocaleString('es')} fragmentos · {p.conTema.toLocaleString('es')} de tus temas suenan desde el servidor.
          </p>
        )}
        {p.error && (
          <p className="ajustes__estado" role="alert">
            <span className="ajustes__error">{p.error}</span>
          </p>
        )}
        {(p.estado === 'dentro' || p.estado === 'error') && (
          <button className="boton boton--fantasma" onClick={p.salir}>
            Salir
          </button>
        )}
      </section>
    </dialog>
  )
}
