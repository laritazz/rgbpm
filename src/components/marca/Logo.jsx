import { FRANJAS } from '../../lib/color'
import './Logo.css'

// Letras dibujadas a mano (brand/generar.py): altura base 300, cada una con su origen
const LETRAS = [
  { d: 'M10,24 L186,12 Q244,14 246,80 L248,122 Q246,160 212,176 L258,294 L164,300 L130,200 L110,200 L112,298 L16,302 Z M108,68 L168,66 L170,140 L108,142 Z', x: -10 },
  { d: 'M300,30 L516,16 L522,98 L396,104 L398,212 L444,210 L442,196 L418,196 L416,150 L526,144 L530,294 L306,304 Z', x: -10 },
  { d: 'M568,20 L760,14 L766,126 L738,150 L780,172 L786,294 L572,304 Z M650,68 L704,66 L706,124 L652,126 Z M652,182 L712,180 L714,246 L654,248 Z', x: -6 },
  { d: 'M830,24 L1036,16 L1044,186 L920,192 L922,298 L836,302 Z M918,68 L976,66 L978,138 L918,140 Z', x: -8 },
  { d: 'M1080,302 L1086,20 L1172,16 L1226,132 L1282,14 L1366,22 L1374,298 L1292,302 L1288,190 L1242,268 L1206,268 L1162,190 L1164,300 Z', x: -2 },
]

const TINTAS = {
  color: FRANJAS.map((f) => f.color),
  rosa: Array(5).fill('#FF66C4'),
  blanco: Array(5).fill('#FFFFFF'),
  negro: Array(5).fill('#000000'),
}

/** Logotipo RGBPM: cada letra lleva el color de una franja de BPM. `ola` las hace saltar en cadena. */
export default function Logo({ variante = 'color', ancho = 172, ola = false }) {
  return (
    <svg className={`logo${ola ? ' logo--ola' : ''}`} viewBox="-10 -10 1394 320" width={ancho} role="img" aria-label="RGBPM">
      {LETRAS.map((l, i) => (
        <path
          key={i}
          d={l.d}
          transform={`translate(${l.x} -10)`}
          fill={TINTAS[variante][i]}
          stroke={TINTAS[variante][i]}
          strokeWidth="10"
          strokeLinejoin="round"
          fillRule="evenodd"
          style={{ '--i': i }}
        />
      ))}
    </svg>
  )
}
