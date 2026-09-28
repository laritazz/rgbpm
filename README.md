# RGBPM

Web para DJ: busca un tema y descubre con cuáles mezcla por **armonía** (Open Key de Traktor) y **tempo** (±6 %).

Proyecto de aprendizaje de React de **Lara Cáceres · Laritazz**. Diseño UX/UI y dirección: yo. El proceso completo está en [BITACORA.md](./BITACORA.md).

## Qué hace
- Busca en la biblioteca por título o artista.
- Al elegir un tema, lista los compatibles con su relación armónica y la diferencia de BPM.
- Portadas generadas en degradado cónico a partir de la clave.

## Arrancar en local
```bash
npm install
npm run dev
```
Abre la dirección que aparece en la terminal (termina en `/rgbpm/`).

## Estructura
```
src/
├── App.jsx              estado principal y maquetación
├── components/          piezas de interfaz
├── logic/armonia.js     reglas de mezcla (funciones puras)
└── data/biblioteca.js   temas de ejemplo
```

## Stack
React 19 · Vite · CSS con variables · GitHub Pages
