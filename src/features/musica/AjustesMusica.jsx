import { useEffect, useMemo, useRef, useState } from 'react'
import Mascota from '../../components/marca/Mascota'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import { descargarTexto, plantillaHtaccess } from '../../lib/servidor'
import { NOMBRE_INDICE, useMusica } from './MusicaContext'

/** Ventana «Tu música»: de dónde suena cada tema. Usa <dialog> nativo: foco, Esc y fondo ya resueltos. */
export default function AjustesMusica() {
  const m = useMusica()
  const { temas, origen } = useBiblioteca()
  const ventana = useRef(null)
  const entradaCarpeta = useRef(null)
  const [url, setUrl] = useState(m.servidor.base)
  const [urlVista, setUrlVista] = useState(m.servidor.base)

  // Si la dirección guardada llega después (al arrancar), se refleja en el campo
  if (urlVista !== m.servidor.base) {
    setUrlVista(m.servidor.base)
    setUrl(m.servidor.base)
  }

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
        <h3>En tu servidor</h3>
        <p>Para que suene en cualquier dispositivo. Subes por FTP y RGBPM lee por https.</p>
        <ol className="ajustes__pasos">
          <li>
            Sube por FTP tus carpetas de música{m.carpetas.length ? <> (<strong>{m.carpetas.join(', ')}</strong>)</> : ''} a una carpeta de tu hosting, por ejemplo <code>/musica</code>.
          </li>
          <li>
            Sube también estos dos archivos a esa misma carpeta:
            <div className="ajustes__botones">
              <button className="boton boton--fantasma" onClick={m.descargarIndice} disabled={!m.totalLocal} title={m.totalLocal ? '' : 'Primero elige tus carpetas arriba'}>
                {NOMBRE_INDICE}
              </button>
              <button className="boton boton--fantasma" onClick={() => descargarTexto('htaccess.txt', plantillaHtaccess(window.location.origin))}>
                .htaccess
              </button>
            </div>
            <small>El .htaccess se descarga como htaccess.txt: al subirlo, renómbralo a <code>.htaccess</code>.</small>
          </li>
          <li>
            Pega aquí la dirección https de esa carpeta:
            <form
              className="ajustes__servidor"
              onSubmit={(e) => {
                e.preventDefault()
                m.conectarServidor(url)
              }}
            >
              <label className="solo-lectores" htmlFor="url-servidor">
                Dirección del servidor
              </label>
              <input id="url-servidor" type="url" required placeholder="https://tudominio.com/musica/" value={url} onChange={(e) => setUrl(e.target.value)} />
              <button className="boton boton--rosa" disabled={m.servidor.estado === 'leyendo'}>
                {m.servidor.estado === 'leyendo' ? 'Conectando…' : 'Conectar'}
              </button>
            </form>
          </li>
        </ol>
        <p className="ajustes__estado" role="status">
          {m.servidor.estado === 'listo' && `Conectado: ${m.servidor.total.toLocaleString('es')} ${m.servidor.total === 1 ? 'archivo' : 'archivos'} en el servidor.`}
          {m.servidor.estado === 'error' && <span className="ajustes__error">{m.servidor.error}</span>}
        </p>
        {m.servidor.estado !== 'vacio' && (
          <button className="boton boton--fantasma" onClick={m.olvidarServidor}>
            Desconectar servidor
          </button>
        )}
      </section>
    </dialog>
  )
}
