"""Genera el logo RGBPM, sus pruebas y las mascotas (el Disco y el Asterisco) en SVG.

Ejecutar: python3 brand/generar.py  →  escribe los SVG en brand/svg/

Mascotas: solo forma y cara. La animación (latido, giro, color y morfing O ↔ *)
vive en el código de la app; aquí se generan los fotogramas estáticos.
"""
import math
from pathlib import Path

SALIDA = Path(__file__).parent / "svg"
SALIDA.mkdir(exist_ok=True)

# Paleta Laritazz (muestreada del PDF de marca)
ROSA = "#FF66C4"
MAGENTA = "#FF009D"
ROSA_MASCOTA = "#F780C0"
NEGRO = "#000000"
BLANCO = "#FFFFFF"
BPM = {  # letra → color de su franja de BPM
    "R": "#7D4EA2",  # 100–120
    "G": "#4ABDC4",  # 120–132
    "B": "#A0B03D",  # 132–153
    "P": "#E4BB2A",  # 153–168
    "M": "#A42640",  # 168–213
}

# ─────────────────────────────── LETRAS ───────────────────────────────
# Bloques recortados en la línea de los ZZ: cuadriláteros torcidos, muescas en diagonal.
LETRAS = {
    "R": ("M10,24 L186,12 Q244,14 246,80 L248,122 Q246,160 212,176 L258,294 L164,300 L130,200 L110,200 L112,298 L16,302 Z "
          "M108,68 L168,66 L170,140 L108,142 Z", 10),
    "G": ("M300,30 L516,16 L522,98 L396,104 L398,212 L444,210 L442,196 L418,196 L416,150 L526,144 L530,294 L306,304 Z", 300),
    "B": ("M568,20 L760,14 L766,126 L738,150 L780,172 L786,294 L572,304 Z "
          "M650,68 L704,66 L706,124 L652,126 Z M652,182 L712,180 L714,246 L654,248 Z", 568),
    "P": ("M830,24 L1036,16 L1044,186 L920,192 L922,298 L836,302 Z M918,68 L976,66 L978,138 L918,140 Z", 830),
    "M": ("M1080,302 L1086,20 L1172,16 L1226,132 L1282,14 L1366,22 L1374,298 L1292,302 L1288,190 L1242,268 "
          "L1206,268 L1162,190 L1164,300 Z", 1080),
}
ANCHO = {"R": 250, "G": 232, "B": 220, "P": 216, "M": 296}
REDONDEO = 10


def letras(texto, x, y, alto, colores, hueco=40):
    """Compone letras sueltas en (x, y) con altura `alto` (el diseño base mide 300)."""
    esc = alto / 300
    partes, cursor = [], 0
    for l in texto:
        d, origen = LETRAS[l]
        color = colores[l] if isinstance(colores, dict) else colores
        partes.append(
            f'<g transform="translate({x + cursor * esc:.1f} {y:.1f}) scale({esc:.4f}) translate({-origen} -10)">'
            f'<path d="{d}" fill="{color}" fill-rule="evenodd" stroke="{color}" '
            f'stroke-width="{REDONDEO}" stroke-linejoin="round"/></g>')
        cursor += ANCHO[l] + hueco
    return "".join(partes), (cursor - hueco) * esc


def svg(vb, cuerpo, etiqueta="RGBPM"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{etiqueta}">'
            f'<title>{etiqueta}</title>{cuerpo}</svg>')


def guardar(nombre, contenido):
    (SALIDA / f"{nombre}.svg").write_text(contenido)


# ─────────────────────────────── MASCOTAS ───────────────────────────────
# Una sola forma que va del círculo (k=0, el Disco) al asterisco (k=1, el Asterisco).
R_DISCO = 112
BARRA_ANCHO, BARRA_LARGO = 30, 132  # semiancho y semilargo de cada brazo del asterisco


def radio_asterisco(theta, giro=22.5):
    r = 0
    for i in range(4):
        a = theta - math.radians(giro + 45 * i)
        c, s = abs(math.cos(a)), abs(math.sin(a))
        r = max(r, min(BARRA_LARGO / c if c > 1e-6 else 1e9, BARRA_ANCHO / s if s > 1e-6 else 1e9))
    return r


def forma(k, cx=0, cy=0, esc=1, n=360, giro=22.5):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        r = (1 - k) * R_DISCO + k * radio_asterisco(t, giro)
        pts.append(f"{cx + math.cos(t) * r * esc:.1f},{cy + math.sin(t) * r * esc:.1f}")
    return "M" + " L".join(pts) + " Z"


def cara(cx, cy, esc=1.0, boca="media", color=NEGRO):
    ojo, sep, my = 7 * esc, 34 * esc, cy + 15 * esc
    w = (19 if boca == "grande" else 12) * esc
    return (f'<g fill="{color}"><circle cx="{cx - sep:.1f}" cy="{cy:.1f}" r="{ojo:.1f}"/>'
            f'<circle cx="{cx + sep:.1f}" cy="{cy:.1f}" r="{ojo:.1f}"/>'
            f'<path d="M{cx - w:.1f},{my:.1f} L{cx + w:.1f},{my:.1f} A{w:.1f},{w:.1f} 0 0 1 {cx - w:.1f},{my:.1f} Z"/></g>')


def mascota(k, color=ROSA_MASCOTA, cx=0, cy=0, esc=1, boca="media", giro=22.5):
    return (f'<path d="{forma(k, cx, cy, esc, giro=giro)}" fill="{color}"/>'
            f'{cara(cx, cy - 14 * esc, esc, boca)}')


# ─────────────────────────────── PIEZAS ───────────────────────────────
def generar():
    # Logo base en 4 tintas
    base, ancho = letras("RGBPM", 0, 0, 300, BPM)
    vb = f"-10 -10 {ancho + 20:.0f} 320"
    guardar("logo-color", svg(vb, base))
    guardar("logo-rosa", svg(vb, letras("RGBPM", 0, 0, 300, ROSA)[0]))
    guardar("logo-blanco-negro", svg(vb, f'<rect x="-10" y="-10" width="{ancho + 20:.0f}" height="320" fill="{NEGRO}"/>'
                                         + letras("RGBPM", 0, 0, 300, BLANCO)[0]))
    guardar("logo-negro-rosa", svg(vb, f'<rect x="-10" y="-10" width="{ancho + 20:.0f}" height="320" fill="{ROSA}"/>'
                                       + letras("RGBPM", 0, 0, 300, NEGRO)[0]))

    # Prueba 1 · Apilado, como @LARITA / ZZ: RGB pequeño arriba, PM enorme abajo
    arriba, a1 = letras("RGB", 30, 0, 120, BLANCO, hueco=46)
    abajo, a2 = letras("PM", 0, 150, 330, ROSA, hueco=34)
    guardar("prueba-apilado", svg(f"-30 -30 {max(a1, a2) + 60:.0f} 540",
                                  f'<rect x="-30" y="-30" width="{max(a1, a2) + 60:.0f}" height="540" fill="{NEGRO}"/>'
                                  + arriba + abajo))

    # Prueba 2 · RGB ✱ PM: el Asterisco hace de «por» (color × tempo)
    rgb, a = letras("RGB", 0, 0, 300, BPM)
    ast = mascota(1, ROSA, cx=a + 150, cy=150, esc=1.12, boca="grande")
    pm, b = letras("PM", a + 300, 0, 300, BPM)
    guardar("prueba-asterisco", svg(f"-10 -10 {a + 300 + b + 20:.0f} 320", rgb + ast + pm))

    # Prueba 3 · El Disco sostiene la marca (pegatina)
    fondo = f'<rect x="0" y="0" width="900" height="900" rx="160" fill="{MAGENTA}"/>'
    disco = mascota(0, ROSA, cx=450, cy=380, esc=2.6, boca="grande")
    _, am = letras("RGBPM", 0, 0, 150, NEGRO, hueco=30)
    placa = (f'<g transform="rotate(-6 450 700)"><rect x="{450 - am / 2 - 40:.0f}" y="600" width="{am + 80:.0f}" '
             f'height="210" rx="18" fill="{BLANCO}"/>' + letras("RGBPM", 450 - am / 2, 630, 150, NEGRO, hueco=30)[0] + '</g>')
    guardar("prueba-pegatina", svg("0 0 900 900", fondo + disco + placa))

    # Prueba 4 · Recorrido: del Disco (tono, frío) al Asterisco (pulso, caliente)
    d0 = mascota(0, BPM["R"], cx=130, cy=160, esc=1.05)
    txt, at = letras("RGBPM", 290, 10, 300, BLANCO)
    a1_ = mascota(1, BPM["M"], cx=290 + at + 170, cy=160, esc=1.05, boca="grande")
    ancho4 = 290 + at + 330
    guardar("prueba-recorrido", svg(f"0 0 {ancho4:.0f} 330",
                                    f'<rect width="{ancho4:.0f}" height="330" fill="{NEGRO}"/>' + d0 + txt + a1_))

    # Iconos de app
    guardar("icono-disco", svg("0 0 512 512", f'<rect width="512" height="512" rx="112" fill="{MAGENTA}"/>'
                               + mascota(0, ROSA, 256, 268, 1.6)))
    guardar("icono-asterisco", svg("0 0 512 512", f'<rect width="512" height="512" rx="112" fill="{NEGRO}"/>'
                                   + mascota(1, ROSA, 256, 262, 1.5)))
    guardar("icono-r", svg("0 0 512 512", f'<rect width="512" height="512" rx="112" fill="{ROSA}"/>'
                           + letras("R", 120, 100, 300, NEGRO)[0]))

    # Mascotas sueltas: forma pura y un intermedio del morfing
    for nombre, k in (("disco", 0), ("medio", 0.5), ("asterisco", 1)):
        guardar(f"mascota-{nombre}", svg("-160 -160 320 320", mascota(k), etiqueta=f"Mascota {nombre}"))
    for l, c in BPM.items():
        guardar(f"mascota-asterisco-{l.lower()}", svg("-160 -160 320 320", mascota(1, c), etiqueta="El Asterisco"))

    iconos_asterisco()


# ─────────────────────────── VARIANTES DE ICONO ───────────────────────────
ESCALA_GIRO = ["#7D4EA2", "#4B8EC6", "#4ABDC4", "#48C3A5", "#A0B03D", "#E4BB2A", "#E5922F", "#A42640", "#7D4EA2"]


def _hex(h):
    return [int(h[i:i + 2], 16) for i in (1, 3, 5)]


def _color_en(t, paleta):
    """Color en la posición t (0–1) de una paleta repartida a partes iguales."""
    t = t % 1 * (len(paleta) - 1)
    i = int(t)
    a, b = _hex(paleta[i]), _hex(paleta[min(i + 1, len(paleta) - 1)])
    f = t - i
    return "#" + "".join(f"{round(a[j] + (b[j] - a[j]) * f):02X}" for j in range(3))


def degradado_giro(cx, cy, r, paleta, pasos=72, giro=-90):
    """Degradado cónico hecho a cuñas (SVG no lo trae de serie): tu «degradado girando»."""
    cunas = []
    for i in range(pasos):
        a0 = math.radians(giro + 360 * i / pasos)
        a1 = math.radians(giro + 360 * (i + 1) / pasos + 2.5)
        cunas.append(f'<path d="M{cx},{cy} L{cx + r * math.cos(a0):.1f},{cy + r * math.sin(a0):.1f} '
                     f'A{r},{r} 0 0 1 {cx + r * math.cos(a1):.1f},{cy + r * math.sin(a1):.1f} Z" '
                     f'fill="{_color_en(i / pasos, paleta)}"/>')
    return "".join(cunas)


def vibracion(cx, cy, ang, color, esc=1.0):
    arcos = "".join(
        f'<path d="M{r * math.cos(math.radians(-38)):.1f},{r * math.sin(math.radians(-38)):.1f} '
        f'A{r},{r} 0 0 1 {r * math.cos(math.radians(38)):.1f},{r * math.sin(math.radians(38)):.1f}"/>'
        for r in (18 * esc, 32 * esc))
    return (f'<g transform="translate({cx} {cy}) rotate({ang})" fill="none" stroke="{color}" '
            f'stroke-width="{7 * esc:.1f}" stroke-linecap="round">{arcos}</g>')


def iconos_asterisco():
    fondo = lambda c: f'<rect width="512" height="512" rx="112" fill="{c}"/>'
    cx, cy, esc = 256, 262, 1.5
    clip = f'<clipPath id="ast"><path d="{forma(1, cx, cy, esc)}"/></clipPath>'

    # 1 · Base: rosa sobre negro
    guardar("icono-a1-base", svg("0 0 512 512", fondo(NEGRO) + mascota(1, ROSA, cx, cy, esc)))

    # 2 · Degradado girando con tu escala de BPM
    guardar("icono-a2-giro", svg("0 0 512 512", f"<defs>{clip}</defs>" + fondo(NEGRO)
                                 + f'<g clip-path="url(#ast)">{degradado_giro(cx, cy, 240, ESCALA_GIRO)}</g>'
                                 + cara(cx, cy - 14 * esc, esc)))

    # 3 · Vinilo: surcos detrás y galleta magenta
    surcos = "".join(f'<circle cx="256" cy="256" r="{r}" fill="none" stroke="#1C1C1C" stroke-width="3"/>'
                     for r in range(70, 250, 14))
    guardar("icono-a3-vinilo", svg("0 0 512 512", fondo(NEGRO) + surcos
                                   + f'<circle cx="256" cy="256" r="236" fill="none" stroke="{MAGENTA}" stroke-width="6"/>'
                                   + mascota(1, ROSA, cx, cy, 1.38)))

    # 4 · Escala: cada brazo con el color de una franja
    barras = "".join(
        f'<rect x="{cx - 30 * esc}" y="{cy - 132 * esc}" width="{60 * esc}" height="{264 * esc}" '
        f'fill="{c}" transform="rotate({22.5 + 45 * i} {cx} {cy})"/>'
        for i, c in enumerate(["#4ABDC4", "#A0B03D", "#E4BB2A", "#7D4EA2"]))
    guardar("icono-a4-escala", svg("0 0 512 512", fondo(NEGRO) + barras
                                   + f'<circle cx="{cx}" cy="{cy - 4}" r="{50 * esc:.0f}" fill="{ROSA}"/>'
                                   + cara(cx, cy - 14 * esc, esc)))

    # 5 · Con vibración, como las marcas de tus dibujos
    guardar("icono-a5-vibra", svg("0 0 512 512", fondo(MAGENTA) + mascota(1, ROSA, 240, 268, 1.32, boca="grande")
                                  + vibracion(404, 146, -40, NEGRO, 1.9) + vibracion(94, 404, 140, NEGRO, 1.9)))

    # 6 · Invertido: asterisco negro, cara rosa, sobre rosa
    guardar("icono-a6-invertido", svg("0 0 512 512", fondo(ROSA) + f'<path d="{forma(1, cx, cy, esc)}" fill="{NEGRO}"/>'
                                      + cara(cx, cy - 14 * esc, esc, color=ROSA)))


if __name__ == "__main__":
    for viejo in SALIDA.glob("*.svg"):
        viejo.unlink()
    generar()
    print("SVG en", SALIDA, "→", len(list(SALIDA.glob('*.svg'))), "archivos")
