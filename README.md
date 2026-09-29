# RGBPM

App web para DJs: importa tu colección de Traktor, ve tu biblioteca como portadas Pantone (**color = BPM**) y descubre con qué mezclar cada tema según tus reglas de armonía.

Proyecto de aprendizaje de React de **Lara Cáceres · Laritazz**. Producto, diseño UX/UI y marca: yo. El proceso completo está en [BITACORA.md](./BITACORA.md).

**En vivo:** [laritazz.github.io/rgbpm](https://laritazz.github.io/rgbpm/)

## Qué hace (Sprint 1)
- **Biblioteca** con portadas Pantone: la muestra de color es el BPM, la etiqueta dice clave y tono.
- **Importar `collection.nml`** de Traktor: se lee en el navegador, descarta samples y loops, y se guarda en IndexedDB. No sale de tu equipo.
- **Filtros** por franja de BPM, búsqueda por título, artista o clave (Open Key o Camelot) y orden por BPM, clave, título o set.
- **Panel «Sonando»**: vinilo que gira al tempo con la mascota de galleta, rueda armónica y los 6 mejores temas para mezclar con nota 0–100.
- **Mascota viva**: Disco a poco BPM, Asterisco a tope. Late al tempo, cambia de cara con el ánimo y el fondo toma el color del BPM.
- Sin colección propia, arranca con una demo: los temas de mis sets.

## Arrancar en local
```bash
npm install
npm run dev     # servidor de desarrollo
npm test        # pruebas de la lógica
npm run lint    # revisión de código
```

## Estructura
```
src/
├── app/                 esqueleto: Shell (rejilla) y barra lateral
├── features/
│   ├── biblioteca/      página, contexto de datos, tarjeta Pantone, panel Sonando, rueda
│   └── proximamente/    estados vacíos con la mascota
├── components/marca/    Logo, Mascota y Vinilo
├── hooks/               useMascota (rAF), useProgresivo (IntersectionObserver), useMovimientoReducido
├── lib/                 lógica pura y probada: claves, armonía, color, lector de Traktor, IndexedDB
└── data/demo.json       demo generada con scripts/demo.py
brand/generar.py         la marca en SVG, generada por código
```

## Stack
React 19 · React Router 7 · Vite 8 · Vitest · IndexedDB · CSS con variables · GitHub Pages con Actions
