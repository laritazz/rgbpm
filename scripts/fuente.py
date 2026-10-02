"""
RGBPM Letras: la tipografía de la casa, sacada de las letras del logo.

R, G, B, P y M son las del logo tal cual. El resto sigue su construcción:
bloques de trazo grueso (~88), contraformas rectas y vértices un poco torcidos,
como cortados a mano. Solo mayúsculas: las minúsculas usan las mismas letras.

Uso:  python3 scripts/fuente.py   →  public/fuentes/rgbpm-letras.woff2
Necesita: pip install fonttools skia-pathops brotli
"""
import math
import os
import re

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.svgLib.path import parse_path

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'public', 'fuentes')

# Diseño en unidades del logo: altura de mayúscula 300, y hacia abajo (como SVG)
ALTO = 300
UPM = 1000
ESCALA = 2.4  # 300 → 720 de altura de mayúscula
LADO = 23  # margen a cada lado: el aire entre letras del logo
TORCIDO = 6.5  # cuánto se mueve cada vértice: el «cortado a mano»


# ——— Letras del logo (src/components/marca/Logo.jsx) ———
def letras_del_logo():
    texto = open(os.path.join(RAIZ, 'src', 'components', 'marca', 'Logo.jsx'), encoding='utf-8').read()
    caminos = re.findall(r"d: '([^']+)'", texto)
    return dict(zip('RGBPM', caminos))


# ——— Primitivas ———
def azar(*claves):
    """Ruido fijo: la misma letra sale siempre igual."""
    x = math.sin(sum((i + 1) * 97.13 * hash_estable(c) for i, c in enumerate(claves))) * 43758.5453
    return (x - math.floor(x)) * 2 - 1


def hash_estable(c):
    return sum(ord(ch) * (i + 7) for i, ch in enumerate(str(c)))


def caja(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def poli(*puntos):
    return list(puntos)


def espejo(formas, ancho):
    return [[(ancho - x, y) for x, y in reversed(f)] for f in formas]


def a_camino(formas):
    camino = pathops.Path()
    lapiz = camino.getPen()
    for f in formas:
        area = sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(f, f[1:] + f[:1]))
        if area < 0:
            f = list(reversed(f))  # todas en el mismo sentido: así se suman al simplificar
        lapiz.moveTo(f[0])
        for p in f[1:]:
            lapiz.lineTo(p)
        lapiz.closePath()
    camino.simplify(fix_winding=True)
    return camino


def torcer(camino, letra):
    """Mueve cada vértice un poco, ya con la letra entera: así sale una sola pieza cortada a mano, sin escalones."""
    grabado = RecordingPen()
    camino.draw(grabado)
    torcido = pathops.Path()
    lapiz = torcido.getPen()
    for orden, puntos in grabado.value:
        mover = [(x + azar(letra, round(x), round(y), 'x') * TORCIDO, y + azar(letra, round(x), round(y), 'y') * TORCIDO) for x, y in puntos]
        getattr(lapiz, orden)(*mover)
    return torcido


# ——— Dibujo de cada letra: (ancho, bloques, huecos) ———
S = 88  # grosor del trazo


def acento(ancho):
    c = ancho / 2
    return [poli((c - 30, -26), (c + 22, -98), (c + 92, -98), (c + 26, -26))]


def dieresis(ancho):
    c = ancho / 2
    return [caja(c - 82, -84, c - 22, -28), caja(c + 22, -84, c + 82, -28)]


def tilde(ancho):
    return [poli((10, -44), (70, -96), (150, -66), (ancho - 10, -100), (ancho - 10, -50), (150, -20), (70, -50), (10, -6))]


DISENO = {
    'A': (240, [caja(0, 0, 240, 300)], [caja(S, 72, 152, 128), caja(S, 196, 152, 301), poli((-1, -1), (40, -1), (-1, 40)), poli((241, -1), (241, 40), (200, -1))]),
    'C': (230, [caja(0, 0, 230, 300)], [caja(S, 86, 231, 214)]),
    'D': (240, [caja(0, 0, 240, 300)], [caja(S, 82, 152, 218), poli((241, -1), (241, 60), (180, -1)), poli((241, 301), (180, 301), (241, 240))]),
    'E': (220, [caja(0, 0, 220, 300)], [caja(S, 72, 221, 122), caja(S, 180, 221, 230)]),
    'F': (215, [caja(0, 0, S, 300), caja(0, 0, 215, 72), caja(0, 124, 190, 182)], []),
    'H': (250, [caja(0, 0, S, 300), caja(162, 0, 250, 300), caja(0, 116, 250, 184)], []),
    'I': (S, [caja(0, 0, S, 300)], []),
    'J': (220, [caja(132, 0, 220, 300), caja(0, 222, 220, 300), caja(0, 160, 80, 300)], []),
    'K': (250, [caja(0, 0, S, 300), poli((80, 110), (160, 0), (250, 0), (140, 150), (250, 300), (160, 300), (80, 190))], []),
    'L': (205, [caja(0, 0, S, 300), caja(0, 228, 205, 300)], []),
    'N': (250, [caja(0, 0, S, 300), caja(162, 0, 250, 300), poli((0, 0), (95, 0), (250, 240), (250, 300), (155, 300), (0, 60))], []),
    'O': (250, [caja(0, 0, 250, 300)], [caja(S, 80, 162, 220)]),
    'Q': (250, [caja(0, 0, 250, 300), poli((150, 230), (215, 230), (268, 338), (200, 338))], [caja(S, 80, 162, 210)]),
    'S': (225, [caja(0, 0, 225, 70), caja(0, 0, S, 182), caja(0, 118, 225, 182), caja(137, 118, 225, 300), caja(0, 230, 225, 300)], [poli((226, -1), (226, 36), (190, -1)), poli((-1, 301), (-1, 264), (35, 301))]),
    'T': (240, [caja(0, 0, 240, 74), caja(76, 0, 164, 300)], []),
    'U': (245, [caja(0, 0, 245, 300)], [caja(S, -1, 157, 222)]),
    'V': (260, [poli((0, 0), (90, 0), (130, 190), (170, 0), (260, 0), (180, 300), (80, 300))], []),
    'W': (300, [caja(0, 0, S, 300), caja(212, 0, 300, 300), caja(0, 222, 300, 300), caja(116, 110, 184, 300)], []),
    'X': (255, [poli((0, 0), (92, 0), (255, 300), (163, 300)), poli((163, 0), (255, 0), (92, 300), (0, 300))], []),
    'Y': (250, [caja(0, 0, 250, 176), caja(81, 150, 169, 300)], [caja(S, -1, 162, 106)]),
    'Z': (230, [caja(0, 0, 230, 72), caja(0, 228, 230, 300), poli((140, 72), (230, 72), (90, 228), (0, 228))], []),
    # Cifras
    'zero': (230, [caja(0, 0, 230, 300)], [caja(S, 80, 142, 220)]),
    'one': (170, [caja(70, 0, 158, 300), caja(10, 0, 158, 70), caja(0, 230, 170, 300)], []),
    'two': (225, [caja(0, 0, 225, 70), caja(137, 0, 225, 182), caja(0, 118, 225, 182), caja(0, 118, S, 300), caja(0, 230, 225, 300)], []),
    'three': (220, [caja(0, 0, 220, 70), caja(132, 0, 220, 300), caja(40, 118, 220, 182), caja(0, 230, 220, 300)], []),
    'four': (235, [caja(0, 0, S, 182), caja(0, 118, 235, 182), caja(147, 0, 235, 300)], []),
    'five': (225, [caja(0, 0, 225, 70), caja(0, 0, S, 182), caja(0, 118, 225, 182), caja(137, 118, 225, 300), caja(0, 230, 225, 300)], []),
    'six': (225, [caja(0, 0, 225, 70), caja(0, 0, S, 300), caja(0, 118, 225, 182), caja(137, 118, 225, 300), caja(0, 230, 225, 300)], []),
    'seven': (220, [caja(0, 0, 220, 72), poli((132, 72), (220, 72), (120, 300), (30, 300))], []),
    'eight': (225, [caja(0, 0, 225, 300)], [caja(S, 70, 137, 120), caja(S, 180, 137, 230)]),
    'nine': (225, [caja(0, 0, 225, 70), caja(0, 0, S, 182), caja(0, 118, 225, 182), caja(137, 0, 225, 300), caja(0, 230, 225, 300)], []),
    # Signos
    'period': (70, [caja(0, 230, 70, 300)], []),
    'comma': (70, [poli((0, 230), (70, 230), (70, 300), (28, 348), (0, 348))], []),
    'hyphen': (140, [caja(0, 120, 140, 180)], []),
    'colon': (70, [caja(0, 60, 70, 130), caja(0, 230, 70, 300)], []),
    'periodcentered': (70, [caja(0, 118, 70, 186)], []),
    'exclam': (S, [caja(0, 0, S, 200), caja(0, 232, S, 300)], []),
    'exclamdown': (S, [caja(0, 0, S, 68), caja(0, 100, S, 300)], []),
    'question': (210, [caja(0, 0, 210, 70), caja(122, 0, 210, 170), caja(60, 118, 210, 170), caja(60, 118, 130, 200), caja(60, 232, 130, 300)], []),
    'questiondown': (210, [caja(80, 0, 150, 68), caja(80, 100, 150, 182), caja(0, 130, 150, 182), caja(0, 130, S, 300), caja(0, 230, 210, 300)], []),
    'slash': (170, [poli((110, 0), (170, 0), (60, 300), (0, 300))], []),
    'percent': (250, [caja(0, 0, 80, 80), caja(170, 220, 250, 300), poli((190, 0), (250, 0), (60, 300), (0, 300))], []),
    'quotesingle': (60, [caja(0, 0, 60, 92)], []),
    'plus': (200, [caja(70, 60, 130, 240), caja(0, 120, 200, 180)], []),
    'parenleft': (110, [caja(0, -20, 60, 320), caja(0, -20, 110, 30), caja(0, 270, 110, 320)], []),
    'guillemotleft': (200, [poli((0, 150), (70, 70), (112, 70), (50, 150), (112, 230), (70, 230)), poli((88, 150), (158, 70), (200, 70), (138, 150), (200, 230), (158, 230))], []),
}
DISENO['parenright'] = (110, espejo(DISENO['parenleft'][1], 110), [])
DISENO['guillemotright'] = (200, espejo(DISENO['guillemotleft'][1], 200), [])

ACENTUADAS = {'Aacute': ('A', acento), 'Eacute': ('E', acento), 'Iacute': ('I', acento), 'Oacute': ('O', acento), 'Uacute': ('U', acento), 'Udieresis': ('U', dieresis), 'Ntilde': ('N', tilde)}

CARACTERES = {
    **{c: c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},
    **{c.lower(): c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},
    **dict(zip('0123456789', ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'])),
    'Á': 'Aacute', 'á': 'Aacute', 'É': 'Eacute', 'é': 'Eacute', 'Í': 'Iacute', 'í': 'Iacute', 'Ó': 'Oacute', 'ó': 'Oacute',
    'Ú': 'Uacute', 'ú': 'Uacute', 'Ü': 'Udieresis', 'ü': 'Udieresis', 'Ñ': 'Ntilde', 'ñ': 'Ntilde',
    ' ': 'space', '.': 'period', ',': 'comma', '-': 'hyphen', '–': 'hyphen', ':': 'colon', '·': 'periodcentered',
    '!': 'exclam', '¡': 'exclamdown', '?': 'question', '¿': 'questiondown', '/': 'slash', '%': 'percent',
    "'": 'quotesingle', '’': 'quotesingle', '+': 'plus', '(': 'parenleft', ')': 'parenright', '«': 'guillemotleft', '»': 'guillemotright',
}


def camino_de(nombre):
    """Devuelve (ancho, Path) de una letra en unidades de diseño."""
    logo = letras_del_logo()
    if nombre in logo:
        camino = pathops.Path()
        parse_path(logo[nombre], camino.getPen())
        izquierda = camino.bounds[0]
        movido = pathops.Path()
        camino.draw(TransformPen(movido.getPen(), (1, 0, 0, 1, -izquierda, -4)))
        movido.simplify(fix_winding=True)
        return movido.bounds[2] - movido.bounds[0], movido
    if nombre in ACENTUADAS:
        base, marca = ACENTUADAS[nombre]
        ancho, camino = camino_de(base)
        extra = torcer(a_camino(marca(ancho)), nombre)
        return ancho, pathops.op(camino, extra, pathops.PathOp.UNION, fix_winding=True)
    ancho, bloques, huecos = DISENO[nombre]
    camino = a_camino(bloques)
    if huecos:
        camino = pathops.op(camino, a_camino(huecos), pathops.PathOp.DIFFERENCE, fix_winding=True)
    return ancho, torcer(camino, nombre)


def construir():
    nombres = ['.notdef', 'space'] + sorted({n for n in CARACTERES.values() if n != 'space'})
    glifos = {}
    anchos = {}
    for nombre in nombres:
        lapiz = TTGlyphPen(None)
        if nombre in ('.notdef', 'space'):
            anchos[nombre] = int(110 * ESCALA)
            glifos[nombre] = lapiz.glyph()
            continue
        ancho, camino = camino_de(nombre)
        # y hacia arriba, línea base en 300, con el margen de cada lado
        camino.draw(TransformPen(Cu2QuPen(lapiz, 1, reverse_direction=True), (ESCALA, 0, 0, -ESCALA, LADO * ESCALA, ALTO * ESCALA)))
        glifos[nombre] = lapiz.glyph()
        anchos[nombre] = int(round((ancho + 2 * LADO) * ESCALA))

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(nombres)
    fb.setupCharacterMap({ord(c): n for c, n in CARACTERES.items()})
    fb.setupGlyf(glifos)
    metricas = {}
    for n in nombres:
        g = glifos[n]
        g.recalcBounds(None)
        metricas[n] = (anchos[n], getattr(g, 'xMin', 0) or 0)
    fb.setupHorizontalMetrics(metricas)
    fb.setupHorizontalHeader(ascent=980, descent=-240)
    fb.setupNameTable({'familyName': 'RGBPM Letras', 'styleName': 'Regular', 'uniqueFontIdentifier': 'RGBPM Letras 1.0', 'fullName': 'RGBPM Letras', 'version': 'Version 1.0', 'psName': 'RGBPMLetras-Regular', 'copyright': '© Lara Cáceres (LaritaZZ)'})
    fb.setupOS2(sTypoAscender=980, sTypoDescender=-240, sTypoLineGap=0, usWinAscent=1000, usWinDescent=260, sCapHeight=720, sxHeight=720, achVendID='LRTZ')
    fb.setupPost()
    os.makedirs(SALIDA, exist_ok=True)
    fb.font.flavor = 'woff2'
    fb.font.save(os.path.join(SALIDA, 'rgbpm-letras.woff2'))
    print(f'RGBPM Letras · {len(nombres)} glifos · {os.path.getsize(os.path.join(SALIDA, "rgbpm-letras.woff2"))} bytes')


if __name__ == '__main__':
    construir()
