# RGBPM · React

Proyecto de portfolio de Lara (Laritazz). Vite + React 19 en JavaScript. Ella aprende React: cada concepto nuevo se explica y se registra en Notion › Aprendizajes.

## Fuente de verdad: Notion
Desde el 6 oct 2026 la gestión y la documentación viven en Notion (privado). Los `.md` de `docs/` y `BITACORA.md` son copias congeladas: no se editan.

| Qué | Dónde |
|---|---|
| Raíz del proyecto | https://app.notion.com/p/3f1c9362e7c681af881accbc4690c8d9 |
| Reglas de trabajo, DoR, DoD, handoff | 00 — Cómo trabajamos · https://app.notion.com/p/3f1c9362e7c6810785cac4e98c83aa79 |
| Sistema visual | 03 — Diseño · https://app.notion.com/p/3f1c9362e7c681f7bf58d77b64a9badd |
| Especificaciones | 04 — Especificaciones · https://app.notion.com/p/3f1c9362e7c6812cafc3d711f773c3b9 |
| Desarrollo y audio | 05 — Desarrollo · https://app.notion.com/p/3f1c9362e7c6818bbdabd32362995402 |
| Tareas (Kanban) | https://app.notion.com/p/3d6c20965ccb4e9089dbda4ba6c7ad08 |
| Decision Log | https://app.notion.com/p/33cada51cf0f4563ad19ad68c807602e |
| Agentes y prompts | https://app.notion.com/p/444cd98f734b400586347c7aac13c4a3 |

Antes de trabajar: lee 00, tu tarjeta en Tareas y sus fuentes de verdad. Al cerrar: protocolo de cierre de 00 (Registro, Decision Log, Aprendizajes y handoff en la tarjeta).

## Reglas de código
- JavaScript, sin TypeScript. Nombres y comentarios en español.
- Lógica pura en `src/lib/` con pruebas en Vitest. Los componentes no calculan reglas de mezcla.
- Estado de la vista en la URL (`useSearchParams`); datos de la colección en `BibliotecaContext`.
- Color = BPM + clave (`lib/color.js`). Verde permitido en la escala, nunca en botones o acciones principales.
- Solo se sugiere lo que suena: sugerencias, sets propuestos y juegos usan `audibles` / `paraSugerir` de `MusicaContext`.
- Tipografía Urbanist para textos y RGBPM Letras (propia, `scripts/fuente.py` → `public/fuentes/`) para menús y títulos. Codec no entra nunca en el repo (licencia CC BY-NC, sin distribución).
- Nunca se suben colecciones `.nml`, audio ni `config.php`. La demo solo lleva metadatos (`scripts/demo.py`).
- Nunca se escriben credenciales en ningún sitio.
- Respetar `prefers-reduced-motion` en toda animación.
- No reescribir archivos de lógica de audio enteros: mostrar solo el bloque afectado.
- Trabajar en una rama. Antes de publicar: `npm run comprobar` (test, lint y build).

## Publicar
`git push` a `main` → GitHub Actions compila y publica en laritazz.github.io/rgbpm.
