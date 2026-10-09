// @vitest-environment jsdom
// DOMParser solo existe en el navegador: jsdom lo imita en esta prueba.
import { describe, expect, it } from 'vitest'
import { esSample, leerNml } from './traktor'

// Colección inventada, con la forma de un collection.nml de Traktor. Nunca una real.
const NML = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<NML VERSION="19">
  <COLLECTION ENTRIES="6">
    <ENTRY TITLE="Tema Uno" ARTIST="Artista Inventado">
      <LOCATION DIR="/:Musica/:House/:" FILE="tema-uno.mp3" VOLUME="Macintosh HD"></LOCATION>
      <INFO GENRE="House" PLAYTIME="362" KEY="Cm"></INFO>
      <TEMPO BPM="123.9812"></TEMPO>
      <MUSICAL_KEY VALUE="21"></MUSICAL_KEY>
    </ENTRY>
    <ENTRY TITLE="Tema Dos" ARTIST="Otra Artista">
      <LOCATION DIR="/:Musica/:Disco/:" FILE="tema-dos.mp3" VOLUME="Macintosh HD"></LOCATION>
      <INFO GENRE="Disco" PLAYTIME="301" KEY="5A"></INFO>
    </ENTRY>
    <ENTRY TITLE="Kick 01" ARTIST="">
      <LOCATION DIR="/:Samples/:Drums/:" FILE="kick-01.wav" VOLUME="Macintosh HD"></LOCATION>
      <INFO PLAYTIME="1"></INFO>
    </ENTRY>
    <ENTRY TITLE="Intro corta" ARTIST="Artista Inventado">
      <LOCATION DIR="/:Musica/:" FILE="intro.mp3" VOLUME="Macintosh HD"></LOCATION>
      <INFO PLAYTIME="12"></INFO>
    </ENTRY>
    <ENTRY TITLE="" ARTIST="">
      <LOCATION DIR="/:Musica/:" FILE="sin-nombre.mp3" VOLUME="Macintosh HD"></LOCATION>
    </ENTRY>
    <ENTRY TITLE="Tema Tres" ARTIST="Artista Inventado">
      <LOCATION DIR="/:Musica/:Techno/:" FILE="tema-tres.mp3" VOLUME="Macintosh HD"></LOCATION>
      <INFO PLAYTIME="420"></INFO>
      <TEMPO BPM="127.96"></TEMPO>
      <MUSICAL_KEY VALUE="0"></MUSICAL_KEY>
    </ENTRY>
  </COLLECTION>
  <PLAYLISTS>
    <NODE TYPE="FOLDER" NAME="$ROOT">
      <SUBNODES COUNT="4">
        <NODE TYPE="PLAYLIST" NAME="Warm-up">
          <PLAYLIST ENTRIES="4" TYPE="LIST">
            <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Musica/:Techno/:tema-tres.mp3"></PRIMARYKEY></ENTRY>
            <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Samples/:Drums/:kick-01.wav"></PRIMARYKEY></ENTRY>
            <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Musica/:House/:tema-uno.mp3"></PRIMARYKEY></ENTRY>
            <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Disco externo/:no/:existe.mp3"></PRIMARYKEY></ENTRY>
          </PLAYLIST>
        </NODE>
        <NODE TYPE="PLAYLIST" NAME="_RECORDINGS">
          <PLAYLIST ENTRIES="1" TYPE="LIST">
            <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Musica/:House/:tema-uno.mp3"></PRIMARYKEY></ENTRY>
          </PLAYLIST>
        </NODE>
        <NODE TYPE="PLAYLIST" NAME="Solo samples">
          <PLAYLIST ENTRIES="1" TYPE="LIST">
            <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Samples/:Drums/:kick-01.wav"></PRIMARYKEY></ENTRY>
          </PLAYLIST>
        </NODE>
        <NODE TYPE="PLAYLIST" NAME="Disco">
          <PLAYLIST ENTRIES="1" TYPE="LIST">
            <ENTRY><PRIMARYKEY TYPE="TRACK" KEY="Macintosh HD/:Musica/:Disco/:tema-dos.mp3"></PRIMARYKEY></ENTRY>
          </PLAYLIST>
        </NODE>
      </SUBNODES>
    </NODE>
  </PLAYLISTS>
</NML>`

describe('esSample: lo que no es una canción', () => {
  const cancion = { titulo: 'Tema', artista: 'Artista', duracion: 300, ruta: '/Musica/House/tema.mp3', archivo: 'tema.mp3' }

  it('una canción normal pasa', () => {
    expect(esSample(cancion)).toBe(false)
  })
  it('menos de 30 s es un sample', () => {
    expect(esSample({ ...cancion, duracion: 29 })).toBe(true)
    expect(esSample({ ...cancion, duracion: 30 })).toBe(false)
  })
  it('carpetas de kits, packs y loops', () => {
    expect(esSample({ ...cancion, ruta: '/Native Instruments/Battery/kit.wav' })).toBe(true)
    expect(esSample({ ...cancion, ruta: '/Descargas/Sound Pack Vol 2/tema.wav' })).toBe(true)
  })
  it('vídeos y material de archivo', () => {
    expect(esSample({ ...cancion, archivo: 'videoclip.mp4' })).toBe(true)
    expect(esSample({ ...cancion, titulo: 'Sonic logo' })).toBe(true)
  })
  it('título de golpe suelto: sample si es corto o no sabemos cuánto dura', () => {
    expect(esSample({ ...cancion, titulo: 'Kick 01', duracion: null })).toBe(true)
    expect(esSample({ ...cancion, titulo: 'Kick 01', duracion: 60 })).toBe(true)
    expect(esSample({ ...cancion, titulo: 'Kick', duracion: 300 })).toBe(false)
  })
})

describe('leerNml', () => {
  const { temas, playlists, descartados } = leerNml(NML)

  it('se queda con las canciones y cuenta los samples descartados', () => {
    expect(temas.map((t) => t.titulo)).toEqual(['Tema Uno', 'Tema Dos', 'Tema Tres'])
    // El kick y la intro de 12 s; la entrada sin nombre ni se cuenta
    expect(descartados).toBe(2)
  })

  it('manda la clave del análisis de Traktor; la etiqueta del archivo es el recambio', () => {
    expect(temas[0].clave.id).toBe('1m') // MUSICAL_KEY 21 = La menor, aunque la etiqueta diga Cm
    expect(temas[1].clave.id).toBe('10m') // sin análisis: 5A de la etiqueta = Do menor
    expect(temas[1].clave.nombre).toBe('Cm')
    expect(temas[2].clave.id).toBe('1d') // MUSICAL_KEY 0 = Do mayor
  })

  it('BPM con un decimal; sin TEMPO, null', () => {
    expect(temas[0].bpm).toBe(124)
    expect(temas[2].bpm).toBe(128)
    expect(temas[1].bpm).toBeNull()
  })

  it('guarda ruta legible y los datos crudos que Traktor necesita al exportar', () => {
    expect(temas[0]).toMatchObject({
      artista: 'Artista Inventado',
      genero: 'House',
      duracion: 362,
      ruta: '/Musica/House/tema-uno.mp3',
      archivo: 'tema-uno.mp3',
      volumen: 'Macintosh HD',
      carpeta: '/:Musica/:House/:',
    })
  })

  it('playlists: en su orden, sin samples, sin las de sistema (_) y sin las vacías', () => {
    expect(playlists.map((p) => p.nombre)).toEqual(['Warm-up', 'Disco'])
    const [warmUp, disco] = playlists
    expect(warmUp.temas).toEqual([temas[2].id, temas[0].id])
    expect(disco.temas).toEqual([temas[1].id])
    expect(new Set(playlists.map((p) => p.id)).size).toBe(2)
  })

  it('un archivo que no es XML avisa con un error claro', () => {
    expect(() => leerNml('esto no es un nml <')).toThrow('El archivo no es un .nml válido de Traktor')
  })

  it('una colección vacía no rompe nada', () => {
    expect(leerNml('<NML VERSION="19"><COLLECTION ENTRIES="0"></COLLECTION></NML>')).toEqual({ temas: [], playlists: [], descartados: 0 })
  })
})
