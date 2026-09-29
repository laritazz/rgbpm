import { describe, expect, it } from 'vitest'
import { buscarArchivo, crearIndice, urlEnServidor } from './indice'

const indice = crearIndice([
  '_DJ/Music/Amelie Lens/A-Sides, Vol. 6/01 In Silence.mp3',
  '_DJ/Music/Lau/Intro/01 Intro.mp3',
  '_DJ/Music/Otra/Otro disco/01 Intro.mp3',
  '_DJ/Music/Lau/Intro/._01 Intro.mp3', // basura de macOS: fuera
  'iTunes/Canción.m4a'.normalize('NFD'),
  '_DJ/portada.jpg',
])

describe('índice de archivos', () => {
  it('encuentra el archivo aunque la carpeta raíz sea otra', () => {
    const tema = { archivo: '01 In Silence.mp3', ruta: '/Users/laracp/Downloads/_Cosas/_DJ/Music/Amelie Lens/A-Sides, Vol. 6/01 In Silence.mp3' }
    expect(buscarArchivo(indice, tema)).toBe('_DJ/Music/Amelie Lens/A-Sides, Vol. 6/01 In Silence.mp3')
  })
  it('con nombres repetidos, gana el que comparte carpetas', () => {
    const tema = { archivo: '01 Intro.mp3', ruta: '/Volumes/LaritaZZ/_Cosas/_DJ/Music/Otra/Otro disco/01 Intro.mp3' }
    expect(buscarArchivo(indice, tema)).toBe('_DJ/Music/Otra/Otro disco/01 Intro.mp3')
  })
  it('iguala acentos compuestos y descompuestos, y mayúsculas', () => {
    expect(buscarArchivo(indice, { archivo: 'CANCIÓN.m4a', ruta: '' })).toBeTruthy()
  })
  it('ignora lo que no es audio', () => {
    expect(indice.has('portada.jpg')).toBe(false)
    expect(indice.get('01 intro.mp3')).toHaveLength(2)
  })
  it('codifica cada tramo de la dirección', () => {
    expect(urlEnServidor('https://creativezz.com/musica', 'Music/A-Sides, Vol. 6/01 #1.mp3')).toBe('https://creativezz.com/musica/Music/A-Sides%2C%20Vol.%206/01%20%231.mp3')
  })
})
