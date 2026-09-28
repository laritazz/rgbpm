import { leerClave } from '../logic/armonia'

// Portada en degradado cónico girado. El número de la clave fija el ángulo;
// el modo (mayor/menor) cambia la mezcla de rosa y violeta.
export default function Portada({ clave, tamano = 48 }) {
  const { numero, modo } = leerClave(clave)
  const angulo = numero * 30
  const colores =
    modo === 'd'
      ? 'var(--magenta), var(--rosa), var(--blanco), var(--magenta)'
      : 'var(--violeta), var(--magenta), var(--negro), var(--violeta)'

  return (
    <div
      className="portada"
      style={{
        width: tamano,
        height: tamano,
        background: `conic-gradient(from ${angulo}deg, ${colores})`,
      }}
      aria-hidden="true"
    />
  )
}
