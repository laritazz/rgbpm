"""Genera src/data/demo.json: los temas de mis sets «LN» y PRIDE, sin rutas de archivo.
Uso: python3 scripts/demo.py ruta/collection.nml ruta/PRIDE.nml"""
import json, sys, xml.etree.ElementTree as ET
from pathlib import Path

NOMBRES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']

def open_key(v):
    v = int(v); menor = v >= 12; pc = v % 12
    for n in range(1, 13):
        if ((9 if menor else 0) + 7 * (n - 1)) % 12 == pc:
            return f"{n}{'m' if menor else 'd'}"

def entradas(raiz):
    for e in raiz.find('COLLECTION'):
        loc = e.find('LOCATION')
        yield e, (loc.get('VOLUME', '') + loc.get('DIR', '') + loc.get('FILE', '')) if loc is not None else ''

col = ET.parse(sys.argv[1]).getroot()
temas, por_ruta, por_nombre = [], {}, {}
for e, ruta in entradas(col):
    mk, tempo, info = e.find('MUSICAL_KEY'), e.find('TEMPO'), e.find('INFO')
    t = {
        'titulo': e.get('TITLE', ''), 'artista': e.get('ARTIST', ''),
        'bpm': round(float(tempo.get('BPM')), 1) if tempo is not None and tempo.get('BPM') else None,
        'clave': open_key(mk.get('VALUE')) if mk is not None and mk.get('VALUE') else None,
        'genero': info.get('GENRE', '') if info is not None else '',
        'duracion': int(info.get('PLAYTIME')) if info is not None and info.get('PLAYTIME') else None,
    }
    por_ruta[ruta] = t
    por_nombre[(t['artista'].lower(), t['titulo'].lower())] = t

elegidos, playlists = {}, []
def anadir(t):
    k = (t['artista'].lower(), t['titulo'].lower())
    if k not in elegidos:
        elegidos[k] = dict(t, id=f"d{len(elegidos)}")
    return elegidos[k]['id']

for n in col.iter('NODE'):
    if n.get('TYPE') == 'PLAYLIST' and n.get('NAME', '').startswith('LN '):
        ids = [anadir(por_ruta[pk.get('KEY')]) for pk in n.iter('PRIMARYKEY') if pk.get('KEY') in por_ruta]
        playlists.append({'id': f"p{len(playlists)}", 'nombre': n.get('NAME'), 'temas': ids})

if len(sys.argv) > 2:  # PRIDE: sin claves en el export, se buscan en la colección
    ids = []
    for e, _ in entradas(ET.parse(sys.argv[2]).getroot()):
        t = por_nombre.get((e.get('ARTIST', '').lower(), e.get('TITLE', '').lower()))
        if t: ids.append(anadir(t))
    playlists.append({'id': f"p{len(playlists)}", 'nombre': 'PRIDE 128–132', 'temas': ids})

temas = [t for t in elegidos.values() if t['titulo']]
salida = Path(__file__).parent.parent / 'src' / 'data' / 'demo.json'
salida.write_text(json.dumps({'temas': temas, 'playlists': playlists}, ensure_ascii=False, separators=(',', ':')))
print(len(temas), 'temas ·', [(p['nombre'], len(p['temas'])) for p in playlists], '·', salida.stat().st_size // 1024, 'KB')
print('sin clave:', sum(1 for t in temas if not t['clave']), '· sin bpm:', sum(1 for t in temas if not t['bpm']))
