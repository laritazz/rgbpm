import { useMemo } from 'react'
import Mascota from '../../components/marca/Mascota'
import { TODAS_LAS_CLAVES } from '../../lib/claves'
import { FRANJAS, colorBpm, colorClave, degradadoTema, franjaDe } from '../../lib/color'
import { ANIMOS } from '../../lib/mascota'
import { SECCIONES } from '../../app/secciones'
import { JUEGOS } from '../juego/juegos'
import { useAjustesArmonia } from '../armonia/AjustesArmoniaContext'
import { useBiblioteca } from '../biblioteca/BibliotecaContext'
import './Sistema.css'

const DESDE = 80
const HASTA = 190
const pos = (bpm) => `${((bpm - DESDE) / (HASTA - DESDE)) * 100}%`
// Un BPM representativo de cada franja: para enseñar su mascota
const CENTRO = { violeta: 98, turquesa: 118, oliva: 128, amarillo: 141, carmesi: 168 }

/**
 * Sistema de diseño vivo: se pinta con el mismo código que la app (lib/color, lib/mascota, Iconos…).
 * Si cambia una regla, esta página cambia con ella. Los porcentajes salen de la biblioteca que tengas cargada.
 */
export default function Sistema() {
  const { temas, origen } = useBiblioteca()
  const { etiqueta } = useAjustesArmonia()
  const reparto = useMemo(() => {
    const conBpm = temas.filter((t) => t.bpm)
    return Object.fromEntries(FRANJAS.map((f) => [f.id, conBpm.length ? Math.round((conBpm.filter((t) => franjaDe(t.bpm).id === f.id).length / conBpm.length) * 100) : 0]))
  }, [temas])
  const muestras = useMemo(() => {
    const con = temas.filter((t) => t.bpm && t.clave)
    return FRANJAS.map((f) => con.find((t) => franjaDe(t.bpm).id === f.id)).filter(Boolean)
  }, [temas])
  const iconos = [...SECCIONES.map((s) => [s.nombre, s.Icono]), ...JUEGOS.map((j) => [j.nombre, j.Icono])]
  const mayores = TODAS_LAS_CLAVES.filter((k) => !k.menor)
  const menores = TODAS_LAS_CLAVES.filter((k) => k.menor)

  return (
    <main className="sistema">
      <header className="sistema__cabecera">
        <h1>Sistema</h1>
        <p>RGBPM v2 · se pinta con el código de la app. Porcentajes de {origen === 'demo' ? 'la demo' : 'tu biblioteca'} ({temas.length.toLocaleString('es')} temas).</p>
      </header>

      <section className="sistema__bloque">
        <h2>1 · Franjas de BPM</h2>
        <p className="sistema__nota">Color plano. Una por letra del logo. Cortadas con 10.554 temas reales.</p>
        <div className="franjas-sistema">
          {FRANJAS.map((f) => (
            <article key={f.id} className="franja-sistema" style={{ '--c': f.color }}>
              <span className="franja-sistema__muestra" aria-hidden="true" />
              <strong>{f.nombre}</strong>
              <span>{f.desde ? (f.hasta < 999 ? `${f.desde}–${f.hasta}` : `≥ ${f.desde}`) : `< ${f.hasta}`} BPM</span>
              <small>{f.texto}</small>
              <b>{reparto[f.id]} %</b>
            </article>
          ))}
        </div>
      </section>

      <section className="sistema__bloque">
        <h2>2 · Escala fina</h2>
        <p className="sistema__nota">El color de un tema. Cae siempre dentro de su franja.</p>
        <div className="escala" style={{ background: `linear-gradient(90deg, ${Array.from({ length: 23 }, (_, i) => colorBpm(DESDE + i * 5)).join(', ')})` }}>
          {FRANJAS.slice(1).map((f) => (
            <span key={f.id} className="escala__corte" style={{ left: pos(f.desde) }}>
              {f.desde}
            </span>
          ))}
        </div>
      </section>

      <section className="sistema__bloque">
        <h2>3 · Color de la clave</h2>
        <p className="sistema__nota">Claves vecinas, colores vecinos. Menores más oscuras; su relativa mayor, el mismo tono con más luz.</p>
        {[mayores, menores].map((fila, i) => (
          <div key={i} className="claves-sistema">
            {fila.map((k) => (
              <span key={k.id} style={{ background: colorClave(k), color: k.menor ? '#fff' : '#000' }}>
                {etiqueta(k)}
              </span>
            ))}
          </div>
        ))}
      </section>

      <section className="sistema__bloque">
        <h2>4 · Tempo + tono</h2>
        <p className="sistema__nota">Un tema es un degradado: su BPM arriba, su clave abajo.</p>
        <div className="degradados">
          {muestras.map((t) => (
            <figure key={t.id}>
              <span style={{ background: degradadoTema(t) }} aria-hidden="true" />
              <figcaption>
                <strong>{t.titulo}</strong>
                <small>
                  {Math.round(t.bpm)} BPM · {etiqueta(t.clave)}
                </small>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="sistema__bloque">
        <h2>5 · Tipografía</h2>
        <div className="tipos">
          <div>
            <small>RGBPM Letras · menús y títulos</small>
            <p className="tipos__letras">ABCDEFGHIJKLM NOPQRSTUVWXYZ</p>
            <p className="tipos__letras">ÁÉÍÓÚÑ 0123456789 ¿?¡!</p>
          </div>
          <div>
            <small>Urbanist · todo lo que se lee</small>
            <p className="tipos__urbanist">
              <span style={{ fontWeight: 300 }}>Light 300</span> · <span>Regular 400</span> · <span style={{ fontWeight: 600 }}>Semibold 600</span> · <span style={{ fontWeight: 800 }}>Extrabold 800</span>
            </p>
          </div>
        </div>
      </section>

      <section className="sistema__bloque">
        <h2>6 · Iconos: gotas</h2>
        <p className="sistema__nota">Puntos y cuellos en una rejilla de 24.</p>
        <ul className="iconos-sistema">
          {iconos.map(([nombre, Icono]) => (
            <li key={nombre}>
              <Icono width={44} height={44} />
              <span>{nombre}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sistema__bloque">
        <h2>7 · Mascota</h2>
        <p className="sistema__nota">Una forma y un ánimo por franja: de disco a asterisco.</p>
        <ul className="mascotas-sistema">
          {FRANJAS.map((f, i) => (
            <li key={f.id}>
              <Mascota bpm={CENTRO[f.id]} variante="icono" tamano={110} etiqueta={`Mascota a ${CENTRO[f.id]} BPM`} />
              <strong>{ANIMOS[i].nombre}</strong>
              <small>{CENTRO[f.id]} BPM</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="sistema__bloque">
        <h2>8 · Acciones</h2>
        <div className="acciones-sistema">
          <button className="boton boton--rosa">Rosa = pulsar</button>
          <button className="boton boton--fantasma">Secundaria</button>
          <span className="sistema__nota">El verde existe en la escala, nunca en un botón.</span>
        </div>
      </section>

      <p className="sistema__pie">
        Documentación: <code>docs/SISTEMA.md</code> · <code>docs/ARQUITECTURA.md</code> · <code>docs/DECISIONES.md</code> · <code>docs/PRODUCTO.md</code>
      </p>
    </main>
  )
}
