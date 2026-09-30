# RGBPM · traspaso para seguir en un chat nuevo

> Léelo entero antes de tocar nada. Estado a 30 sep 2026, commit `6e5b878`.
> Fuentes de verdad en el repo: `CLAUDE.md` (reglas), `BITACORA.md` (sesiones 1–10), `docs/PARIDAD.md` (qué falta), `servidor/LEEME.md` (audio privado).

---

## 1 · Dónde está todo

| Qué | Dónde |
|---|---|
| Web | https://laritazz.github.io/rgbpm/ (se instala en el móvil como app) |
| Repo | https://github.com/laritazz/rgbpm · rama `main` · publica sola con GitHub Actions |
| Estado en directo | https://laritazz.github.io/rgbpm/estado.json (sesiones, commits, paridad, pruebas) |
| Proyecto en el Mac de Lara | `~/RGBPM/rgbpm` (carpeta conectada: `~/RGBPM`) |
| Colección de Traktor (copia) | `~/RGBPM/data/traktor/collection.nml` (copia del 5 sep; la de Traktor puede ser más nueva) |
| Música | Disco externo `/Volumes/LaritaZZ/_Cosas/_DJ` (Traktor aún guarda rutas antiguas de `~/Downloads/_Cosas/_DJ`) |
| Lo que se sube a IONOS | `~/RGBPM/SUBIR-A-IONOS/rgbpm-audio/` |
| Audio privado | https://creativezz.com/rgbpm-audio/ · `firmar.php?salud=1` → `{"ok":true,"fragmentos":79}` |
| Supabase | Proyecto `qmsrldxqmtinuzzkjsgh` · clave publicable en `src/lib/config.js` · altas cerradas |

---

## 2 · Arquitectura en 30 segundos

- **Vite + React 19 en JavaScript** (sin TypeScript) · HashRouter · Vitest (42 pruebas) · oxlint.
- **Lógica pura en `src/lib/`** con pruebas; los componentes no calculan reglas de mezcla.
- **Proveedores:** Biblioteca › Música › Reproductor › Set › Router. El tiempo de reproducción va en un contexto aparte.
- **Estado de la vista en la URL** (`useSearchParams`).
- **Audio:** dos `<audio>` con fundido de igual potencia (10 s). Fuentes: carpetas locales (File System Access) o fragmentos privados.
- **Audio privado:** Supabase Auth → `firmar.php` en IONOS valida el token y el email → enlaces HMAC que caducan (20 min) → `audio.php` sirve con Range.
- **Fragmentos:** 90 s, 128 kbps, sin metadatos. Nombre = 16 hex del SHA-256 de la ruta de Traktor. Segunda llave: resumen de artista + título (para la demo sin rutas).
- **Análisis en el navegador:** FFT, cromagrama y Krumhansl para la clave; autocorrelación para el BPM; Web Worker y AudioWorklet.
- **Móvil:** isla flotante (mini reproductor + pestañas) que se encoge al bajar; «Sonando» con la mascota como play; PWA.

| Carpeta | Contenido |
|---|---|
| `src/lib/` | armonia, claves, color, traktor, set, setEstado, radio, fragmentos, audioPrivado, isla, tempo, tonalidad, escucha… |
| `src/features/` | biblioteca, musica, tap, radio, sets, proximamente |
| `src/app/` | Shell, BarraLateral, BarraPestanas |
| `src/hooks/` | useMascota, useEscucha, useIsla, useProgresivo… |
| `scripts/` | fragmentos.mjs, capturas.mjs, estado.mjs, configurar-servidor.mjs, demo.py |
| `servidor/rgbpm-audio/` | firmar.php, audio.php, .htaccess, privado/comun.php |

---

## 3 · Reglas que no se rompen

- Español en nombres, comentarios y textos. Explicar cada concepto nuevo de React en `BITACORA.md`.
- Color = BPM (`lib/color.js`). **Verde** solo en la escala, nunca en botones ni acciones principales.
- Urbanist. **Codec nunca entra en el repo** (licencia).
- **Nunca** se suben al repo colecciones `.nml`, audio ni `config.php`.
- Toda animación respeta `prefers-reduced-motion`.
- Antes de publicar: `npm test`, `npm run lint`, `npm run build`.
- **Seguridad:** Lara nunca comparte contraseñas (SFTP, Supabase), el token de GitHub ni `config.php`. Claude no escribe credenciales en ningún sitio. Ella sube los archivos a IONOS con su programa de SFTP.

---

## 4 · Cómo trabajar con Lara

- **Español, muy conciso, visual:** tablas, listas, frases cortas. Nada de bloques largos.
- **Prototipo antes que plan:** hacer, publicar y enseñar.
- Textos en primera persona (yo). Prohibido: «innovador», «revolucionario», «optimizar», «robusto».
- Cuando algo lo tenga que hacer ella: pasos numerados, qué archivo, de dónde a dónde.
- Al cerrar cada sesión: bitácora, `docs/PARIDAD.md`, y si cambia el caso, `docs/CREATIVEZZ.md`.
- Aprende React: cada concepto nuevo, explicado con sus palabras.

---

## 5 · Trucos que ya costaron un disgusto

| Situación | Qué hacer |
|---|---|
| En su Terminal, `npm run dev` ocupa la pestaña | Abrir otra con **Cmd+T** para los demás comandos |
| Comando de fragmentos | `cd ~/RGBPM/rgbpm && npm run fragmentos -- --nml ../data/traktor/collection.nml --playlist "NOMBRE" --salida ../SUBIR-A-IONOS/rgbpm-audio/privado/fragmentos` |
| Temas «sin archivo» | El script ya distingue permiso de macOS o tema movido, y busca con Spotlight. Extra: `--buscar "/Volumes/LaritaZZ"` |
| Después de crear fragmentos | Ella sube la carpeta `fragmentos` (o solo lo nuevo y `fragmentos.json`) a `rgbpm-audio/privado/`; comprobar `salud` |
| Si cambia `firmar.php` | Copiarlo a `SUBIR-A-IONOS/rgbpm-audio/` y pedirle que lo reemplace |
| Shell de su Mac (device_bash) | No borra por defecto; pedir permiso de borrado solo si hace falta. Ojo: un `git status` puede dejar `.git/index.lock` |
| En el contenedor | `pkill` mata la propia shell: no usarlo |
| Capturas para el portfolio | `npm run build`, `npx vite preview --port 4173 &`, `npm run capturas` (necesita `npm i --no-save playwright`) |

---

## 6 · Qué falta (por orden)

### Ahora
| # | Tarea | Nota |
|---|---|---|
| 1 | **Armonía** (`/armonia`, hoy «Pronto») | Rueda grande interactiva, interruptor «corregir desfase», tolerancia de BPM ajustable (hoy ±8 %), notación Open Key / Camelot a elegir, **set sugerido desde una clave → «Usar este set»** |
| 2 | Probar en su iPhone | Isla flotante, mascota como play, app instalada |

### Después
| # | Tarea | Nota |
|---|---|---|
| 3 | **Mezclador** (`/mezclador`, hoy «Pronto») | Dos platos con onda, SYNC y keylock, hotcues, bucles ½/×2, saltos, EQ, filtro, volumen, crossfader (doble clic al centro), mezcla automática, versión lite |
| 4 | **Biblioteca: utilidades** | Filtro por varias claves; rango de BPM y duración; vista lista; marcar en bloque (al set, a la radio, borrar); importar carpeta y analizar BPM y clave (el motor ya existe); duplicados; limpiar títulos; quitar sin archivo; copia JSON y CSV; vaciar |
| 5 | **Radio** | Añadir temas a mano a la cola; vista mosaico por tono |
| 6 | Fragmentos de **toda** la biblioteca | ~14 GB en IONOS (hay 50 GB). Ahora solo LN 27J (79) |
| 7 | Biblioteca en el móvil | Hoy el móvil tiene la demo; llevar su colección (p. ej. a Supabase) |

---

## 7 · Otros chats

- **Creativezz** (proyecto aparte): la ficha «viva» de RGBPM en su web, con `docs/CREATIVEZZ.md` y `estado.json`. Si algo de aquí cambia el caso, actualizar ese documento.

---

## 8 · Mensaje para arrancar el chat nuevo

> Seguimos con **RGBPM en React**. Lee primero `claude/CONTINUAR_RGBPM.md` de este proyecto: ahí está el estado, las reglas, cómo trabajo y lo que falta.
>
> El repo es `laritazz/rgbpm` (clónalo) y mi carpeta del Mac es `~/RGBPM`.
>
> Empezamos por **Armonía**: rueda grande interactiva, tolerancia de BPM, Open Key / Camelot, «corregir desfase» y **set sugerido desde una clave → «Usar este set»**. Quiero verlo funcionando y publicado, con la bitácora al día.
