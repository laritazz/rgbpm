# RGBPM · React

Proyecto de portfolio de Lara (Laritazz). Ella aprende React: explica cada concepto nuevo en BITACORA.md.

## Reglas
- JavaScript, sin TypeScript. Nombres y comentarios en español.
- Lógica pura en `src/lib/` con pruebas en Vitest. Los componentes no calculan reglas de mezcla.
- Estado de la vista en la URL (`useSearchParams`); datos de la colección en `BibliotecaContext`.
- Color = BPM + clave (`lib/color.js`, ver `docs/SISTEMA.md`). Verde permitido en la escala, nunca en botones o acciones principales.
- Solo se sugiere lo que suena: sugerencias, sets propuestos y juegos usan `audibles` / `paraSugerir` de `MusicaContext`.
- Cada decisión de diseño o arquitectura se apunta en `docs/DECISIONES.md`.
- Tipografía Urbanist para textos y RGBPM Letras (propia, `scripts/fuente.py` → `public/fuentes/`) para menús y títulos. Codec no entra nunca en el repo (licencia CC BY-NC, sin distribución).
- Nunca se suben colecciones `.nml` ni audio. La demo solo lleva metadatos (`scripts/demo.py`).
- Respetar `prefers-reduced-motion` en toda animación.
- Antes de publicar: `npm test`, `npm run lint`, `npm run build`.

## Publicar
`git push` a `main` → GitHub Actions compila y publica en laritazz.github.io/rgbpm.
