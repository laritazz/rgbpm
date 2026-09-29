"""Genera el logo RGBPM y las mascotas (Disco y Asterisco) en SVG.

Ejecutar: python3 brand/generar.py  →  escribe los SVG en brand/svg/
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
BPM = {  # franja de BPM → color
    "R": "#7D4EA2",  # 100–120
    "G": "#4ABDC4",  # 120–132
    "B": "#A0B03D",  # 132–153
    "P": "#E4BB2A",  # 153–168
    "M": "#A42640",  # 168–213
}

# ─────────────────────────────── LOGO ───────────────────────────────
# Letras de bloque recortadas, en la línea de los ZZ de Laritazz:
# cuadriláteros torcidos, muescas en diagonal y esquinas apenas redondeadas.
LETRAS = {
    "R": "M10,24 L186,12 Q244,14 246,80 L248,122 Q246,160 212,176 L258,294 L164,300 L130,200 L110,200 L112,298 L16,302 Z "
         "M108,68 L168,66 L170,140 L108,142 Z",
    "G": "M300,30 L516,16 L522,98 L396,104 L398,212 L444,210 L442,196 L418,196 L416,150 L526,144 L530,294 L306,304 Z",
    "B": "M568,20 L760,14 L766,126 L738,150 L780,172 L786,294 L572,304 Z "
         "M650,68 L704,66 L706,124 L652,126 Z M652,182 L712,180 L714,246 L654,248 Z",
    "P": "M830,24 L1036,16 L1044,186 L920,192 L922,298 L836,302 Z M918,68 L976,66 L978,138 L918,140 Z",
    "M": "M1080,302 L1086,20 L1172,16 L1226,132 L1282,14 L1366,22 L1374,298 L1292,302 L1288,190 L1242,268 L1206,268 L1162,190 L1164,300 Z",
}
REDONDEO = 10  # trazo del mismo color con unión redonda = esquinas suaves


def letra(d, color):
    return (f'<path d="{d}" fill="{color}" fill-rule="evenodd" stroke="{color}" '
            f'stroke-width="{REDONDEO}" stroke-linejoin="round"/>')


def logo(colores, fondo=None, nombre="logo"):
    vb = "-20 -10 1420 330"
    capas = []
    if fondo:
        capas.append(f'<rect x="-20" y="-10" width="1420" height="330" fill="{fondo}"/>')
    for l, d in LETRAS.items():
        capas.append(letra(d, colores[l] if isinstance(colores, dict) else colores))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="RGBPM">'
           f'<title>RGBPM</title>{"".join(capas)}</svg>')
    (SALIDA / f"{nombre}.svg").write_text(svg)
    return svg


# ───────────────────────────── MASCOTAS ─────────────────────────────
# Estilo: cuerpo plano sin contorno, cara mínima, brazos de manguera con contorno negro.
TRAZO = 5  # grosor del contorno negro


def rot(x, y, ang):
    a = math.radians(ang)
    return x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)


def rect(x, y, w, h, r, ang=0, ox=0, oy=0):
    t = f' transform="rotate({ang} {ox} {oy})"' if ang else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"{t}/>'


# Manos en coordenadas locales: muñeca en (0,0), apuntando hacia -y.
MANOS = {
    "abierta": [
        rect(-16, -32, 32, 32, 13),
        rect(-16, -52, 7, 28, 3.5), rect(-7.5, -58, 7, 32, 3.5),
        rect(1, -56, 7, 30, 3.5), rect(9.5, -48, 7, 24, 3.5),
        rect(-34, -24, 24, 9, 4.5, -30, -16, -20),
    ],
    "senala": [
        rect(-17, -30, 34, 30, 13),
        rect(-4, -70, 8, 44, 4),
        rect(-30, -22, 20, 9, 4.5, -20, -16, -18),
    ],
    "pulgar": [
        rect(-18, -30, 36, 32, 14),
        rect(-20, -60, 10, 34, 5),
    ],
}


def mano(tipo, x, y, ang, color):
    formas = "".join(MANOS[tipo])
    g = f'transform="translate({x:.1f} {y:.1f}) rotate({ang:.1f}) scale(1.4)"'
    contorno = (f'<g {g} fill="{NEGRO}" stroke="{NEGRO}" stroke-width="{TRAZO * 2 / 1.4:.2f}" '
                f'stroke-linejoin="round">{formas}</g>')
    relleno = f'<g {g} fill="{color}">{formas}</g>'
    return contorno, relleno


def brazo(p0, c1, c2, p1, color):
    d = f"M{p0[0]},{p0[1]} C{c1[0]},{c1[1]} {c2[0]},{c2[1]} {p1[0]},{p1[1]}"
    return (f'<path d="{d}" fill="none" stroke="{NEGRO}" stroke-width="{10 + TRAZO * 2}" stroke-linecap="round"/>',
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="10" stroke-linecap="round"/>')


def movimiento(x, y, ang):
    """Dos arcos de «vibración» junto a una mano que se mueve."""
    arcos = "".join(
        f'<path d="M{r * math.cos(math.radians(a0)):.1f},{r * math.sin(math.radians(a0)):.1f} '
        f'A{r},{r} 0 0 1 {r * math.cos(math.radians(a1)):.1f},{r * math.sin(math.radians(a1)):.1f}"/>'
        for r, a0, a1 in ((16, -40, 40), (26, -35, 35)))
    return (f'<g transform="translate({x} {y}) rotate({ang})" fill="none" stroke="{NEGRO}" '
            f'stroke-width="3.5" stroke-linecap="round">{arcos}</g>')


def cara(cx, cy, esc=1.0, boca="media"):
    ojo = 6.5 * esc
    sep = 34 * esc
    my = cy + 14 * esc
    if boca == "grande":
        w = 20 * esc
        b = f'<path d="M{cx - w},{my - 4} L{cx + w},{my - 5} A{w},{w * 1.1} 0 0 1 {cx - w},{my - 4} Z"/>'
    else:
        w = 12 * esc
        b = f'<path d="M{cx - w},{my} L{cx + w},{my} A{w},{w} 0 0 1 {cx - w},{my} Z"/>'
    return (f'<g fill="{NEGRO}"><circle cx="{cx - sep}" cy="{cy}" r="{ojo}"/>'
            f'<circle cx="{cx + sep}" cy="{cy}" r="{ojo}"/>{b}</g>')


def cuerpo_disco(color):
    return f'<circle cx="200" cy="215" r="112" fill="{color}"/>'


def cuerpo_asterisco(color):
    barras = "".join(
        f'<rect x="170" y="85" width="60" height="260" transform="rotate({22.5 + 45 * k} 200 215)"/>'
        for k in range(4))
    return f'<g fill="{color}">{barras}</g>'


# Poses: (brazo izq, brazo der) → (hombro, control1, control2, muñeca, mano, ángulo) + arcos
POSES = {
    "saluda": {
        "brazos": [
            ((104, 250), (70, 262), (52, 292), (60, 318), "abierta", 200),
            ((300, 180), (338, 160), (350, 118), (340, 86), "abierta", 12),
        ],
        "mov": [(372, 92, 0)],
        "boca": "media",
    },
    "senala": {
        "brazos": [
            ((104, 215), (76, 206), (56, 198), (38, 196), "senala", -86),
            ((300, 250), (330, 270), (338, 300), (330, 322), "abierta", 168),
        ],
        "mov": [],
        "boca": "media",
    },
    "celebra": {
        "brazos": [
            ((110, 170), (76, 140), (70, 100), (84, 70), "pulgar", -12),
            ((290, 170), (324, 140), (330, 100), (316, 70), "pulgar", 12),
        ],
        "mov": [(46, 70, 200), (354, 70, -20)],
        "boca": "grande",
    },
    "abrazo": {
        "brazos": [
            ((100, 220), (62, 212), (40, 190), (30, 160), "abierta", -40),
            ((300, 220), (338, 212), (360, 190), (370, 160), "abierta", 40),
        ],
        "mov": [],
        "boca": "grande",
    },
}


def mascota(personaje, pose, cuerpo=ROSA_MASCOTA, fondo=None, extremidades=None, sufijo=""):
    ext = extremidades or cuerpo
    p = POSES[pose]
    contornos, rellenos = [], []
    for s, c1, c2, w, tipo, ang in p["brazos"]:
        bc, bf = brazo(s, c1, c2, w, ext)
        mc, mf = mano(tipo, w[0], w[1], ang, ext)
        contornos += [bc, mc]
        rellenos += [bf, mf]
    cuerpo_svg = cuerpo_disco(cuerpo) if personaje == "disco" else cuerpo_asterisco(cuerpo)
    cy = 190 if personaje == "disco" else 205
    capas = []
    if fondo:
        capas.append(f'<rect x="-40" y="-30" width="480" height="440" fill="{fondo}"/>')
    capas += contornos + rellenos + [cuerpo_svg, cara(200, cy, 1.0, p["boca"])]
    capas += [movimiento(*m) for m in p["mov"]]
    nombre = "El Disco" if personaje == "disco" else "El Asterisco"
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -30 480 440" role="img" '
           f'aria-label="{nombre}"><title>{nombre}</title>{"".join(capas)}</svg>')
    (SALIDA / f"{personaje}-{pose}{sufijo}.svg").write_text(svg)
    return svg


def icono():
    """Icono de app: la cara del Disco sobre magenta."""
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="RGBPM">'
           f'<rect width="512" height="512" rx="112" fill="{MAGENTA}"/>'
           f'<circle cx="256" cy="268" r="176" fill="{ROSA}"/>'
           f'<g transform="translate(56 42) scale(1)">{cara(200, 200, 1.9, "media")}</g></svg>')
    (SALIDA / "icono.svg").write_text(svg)
    return svg


if __name__ == "__main__":
    logo(BPM, nombre="logo-color")
    logo(ROSA, nombre="logo-rosa")
    logo(BLANCO, fondo=NEGRO, nombre="logo-blanco-negro")
    logo(NEGRO, fondo=ROSA, nombre="logo-negro-rosa")
    for personaje in ("disco", "asterisco"):
        for pose in POSES:
            mascota(personaje, pose)
    for letra_bpm, color in BPM.items():
        mascota("disco", "saluda", cuerpo=color, sufijo=f"-{letra_bpm.lower()}")
    icono()
    print("SVG en", SALIDA)
