# RGBPM · traspaso para seguir en un chat nuevo

> Léelo entero antes de tocar nada. Estado a 2 oct 2026, tras la sesión 17 (método de diseño y fragmentos de todas las playlists). Últimos commits en `estado.json`.
> Fuentes de verdad en el repo: `CLAUDE.md` (reglas), `BITACORA.md` (sesiones 1–17), `docs/PROCESO.md` (método, heurística), `docs/PRUEBA_USUARIOS.md` (test con DJs), `docs/SISTEMA.md` (diseño), `docs/ARQUITECTURA.md` (front y back), `docs/DECISIONES.md`, `docs/PRODUCTO.md` (mercado), `docs/PARIDAD.md` (qué falta), `servidor/LEEME.md` (audio privado).

---

## 1 · Dónde está todo

| Qué | Dónde |
|---|---|
| Web | https://laritazz.github.io/rgbpm/ (se instala en el móvil como app) |
| Repo | https://github.com/laritazz/rgbpm · rama `main` · publica sola con GitHub Actions |
| Estado en directo | https://laritazz.github.io/rgbpm/estado.json (sesiones, commits, paridad, pruebas) |
| Proyecto en el Mac de Lara | `~/RGBPM/rgbpm` (carpeta conectada: `~/RGBPM`) |
| Colección de Traktor (copia) | `~/RGBPM/data/traktor/collection.nml` (copia del 5 sep; la de Traktor puede ser más nueva) |
| Música | `~/Downloads` (2.140 temas de las playlists), `~/Music` y disco `/Volumes/LaritaZZ/_Cosas/_DJ` (Traktor aún guarda rutas antiguas de `~/Downloads/_Cosas/_DJ`) |
| Lo que se sube a IONOS | `~/RGBPM/SUBIR-A-IONOS/rgbpm-audio/` |
| Previas públicas | Apple Music (iTunes Search API). Demo: `public/previas.json` (`npm run previas` en el Mac) |
| Audio privado | https://creativezz.com/rgbpm-audio/ · `firmar.php?salud=1` → hoy `79`; tras subir los nuevos, `2413` |
| Supabase | Proyecto `qmsrldxqmtinuzzkjsgh` · clave publicable en `src/lib/config.js` · altas cerradas |

---

## 2 · Arquitectura en 30 segundos

- **Vite + React 19 en JavaScript** (sin TypeScript) · HashRouter · Vitest (114 pruebas) · oxlint.
- **Lógica pura en `src/lib/`** con pruebas; los componentes no calculan reglas de mezcla.
- **Proveedores:** AjustesArmonía › Biblioteca › Música › Reproductor › Set › Router. El tiempo de reproducción va en un contexto aparte.
- **Rutas:** `/` inicio (rosa, racimo de círculos), `/biblioteca`, `/armonia`, `/sets`, `/radio`, `/tap`, `/juego` (con `/juego/bpm`) y `/mezclador` («Pronto»). Tap, Radio, Armonía y Sets se cargan con `React.lazy` (`app/pantallas.js`).
- **Transiciones:** `app/circulo.js` abre un círculo negro al entrar y rosa al volver al inicio.
- **Estado de la vista en la URL** (`useSearchParams`). Las preferencias de armonía (notación, «corregir desfase», margen de BPM) van en `AjustesArmoniaContext` + `localStorage` y valen para toda la app: usar `etiqueta(clave)` para pintar claves y pasar `opciones` a las funciones de `lib/`.
- **Audio:** dos `<audio>` con fundido de igual potencia (10 s). Fuentes: carpetas locales (File System Access) o fragmentos privados.
- **Audio privado:** Supabase Auth → `firmar.php` en IONOS valida el token y el email → enlaces HMAC que caducan (20 min) → `audio.php` sirve con Range.
- **Fragmentos:** 90 s, 128 kbps, sin metadatos. Nombre = 16 hex del SHA-256 de la ruta de Traktor. Segunda llave: resumen de artista + título (para la demo sin rutas).
- **Análisis en el navegador:** FFT, cromagrama y Krumhansl para la clave; autocorrelación para el BPM; Web Worker y AudioWorklet.
- **Móvil:** isla flotante (mini reproductor + pestañas) que se encoge al bajar; «Sonando» con la mascota como play; PWA.

| Carpeta | Contenido |
|---|---|
| `src/lib/` | armonia, rueda, claves, color, traktor, set, setEstado, radio, fragmentos, audioPrivado, isla, tempo, tonalidad, escucha… |
| `src/features/` | biblioteca, musica, tap, radio, armonia, sets, proximamente |
| `src/app/` | Shell, BarraLateral, BarraPestanas |
| `src/hooks/` | useMascota, useEscucha, useIsla, useProgresivo… |
| `scripts/` | fragmentos.mjs, capturas.mjs, estado.mjs, configurar-servidor.mjs, demo.py |
| `servidor/rgbpm-audio/` | firmar.php, audio.php, .htaccess, privado/comun.php |

---

## 3 · Reglas que no se rompen

- Español en nombres, comentarios y textos. Explicar cada concepto nuevo de React en `BITACORA.md`.
- Color = BPM + clave (`lib/color.js`, `docs/SISTEMA.md`). Franjas planas; un tema es un degradado BPM → clave. **Verde** solo en la escala, nunca en botones ni acciones principales.
- **Solo sale lo que suena:** sugerencias, sets propuestos y juegos usan `audibles` de `MusicaContext`.
- Urbanist para textos; **RGBPM Letras** (propia, `scripts/fuente.py`) para menús y títulos. **Codec nunca entra en el repo** (licencia).
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
| Comando de fragmentos | `cd ~/RGBPM/rgbpm && npm run fragmentos -- --nml ../data/traktor/collection.nml --playlist todas --salida ../SUBIR-A-IONOS/rgbpm-audio/privado/fragmentos` (`todas` = todas menos `_RECORDINGS` y `_LOOPS`) |
| Temas «sin archivo» | El script ya distingue permiso de macOS o tema movido, y busca con Spotlight. Extra: `--buscar "/Volumes/LaritaZZ"` |
| Después de crear fragmentos | Ella sube la carpeta `fragmentos` (o solo lo nuevo y `fragmentos.json`) a `rgbpm-audio/privado/`; comprobar `salud` |
| Si cambia `firmar.php` | Copiarlo a `SUBIR-A-IONOS/rgbpm-audio/` y pedirle que lo reemplace |
| Fragmentos desde Claude | device_bash es una VM Linux: pedir acceso a `~/Downloads`, `/Volumes/LaritaZZ/_Cosas/_DJ` y pasar sus montajes en `--buscar "$HOME/mnt/_DJ,$HOME/mnt/Downloads,$HOME/mnt/Music"`. Un proceso en segundo plano muere al acabar la llamada: tandas de `timeout 172` (≈ 390 temas cada una) |
| Shell de su Mac (device_bash) | No borra por defecto; pedir permiso de borrado solo si hace falta. Ojo: un `git status` puede dejar `.git/index.lock` |
| En el contenedor | `pkill` mata la propia shell: no usarlo |
| Capturas para el portfolio | `npm run build`, `npx vite preview --port 4173 &`, `npm run capturas` (necesita `npm i --no-save playwright`) |

---

## 6 · Qué falta (por orden)

### Ahora
| # | Tarea | Nota |
|---|---|---|
| 1 | Revisar la rueda vinilo | Hecha con la dirección A. Si no convence, B (Secuenciador) y C (Onda) están en el prototipo «RGBPM Home y Armonía» |
| 2 | **Subir los fragmentos a IONOS** | Hechos 2.413 de 2.416 temas de todas las playlists (3,2 GB) en `~/RGBPM/SUBIR-A-IONOS/rgbpm-audio/privado/fragmentos`. Lara los sube por SFTP y comprueba `salud` |
| 2 | **Test con 5 DJs** | Kit en `docs/PRUEBA_USUARIOS.md`. Resultados → `PROCESO.md` y pendientes de la heurística |
| 3 | **Supabase: crear la tabla** | Lara pega `servidor/supabase/puntuaciones.sql` en el SQL Editor. Sin ella, los récords siguen en el navegador |
| 3 | Más juegos | Hechos 5. Ideas: Agita el móvil (tempo con el sensor), ¿Qué categoría es? solo de oído, ranking compartido si se abren altas |
| 3 | Probar en su iPhone | Inicio, transiciones, mascota dormida en pausa, rueda con el dedo |
| 4 | **Mezclador** (`/mezclador`, hoy «Pronto») | Ver «Después» · 3 |

✅ **Armonía** hecha en la sesión 11: rueda grande, set sugerido → «Usar este set», notación, desfase y margen de BPM.

### Después
| # | Tarea | Nota |
|---|---|---|
| 3 | **Mezclador** (`/mezclador`, hoy «Pronto») | Dos platos con onda, SYNC y keylock, hotcues, bucles ½/×2, saltos, EQ, filtro, volumen, crossfader (doble clic al centro), mezcla automática, versión lite |
| 4 | **Biblioteca: utilidades** | Filtro por varias claves; rango de BPM y duración; vista lista; marcar en bloque (al set, a la radio, borrar); importar carpeta y analizar BPM y clave (el motor ya existe); duplicados; limpiar títulos; quitar sin archivo; copia JSON y CSV; vaciar |
| 5 | **Radio** | Añadir temas a mano a la cola; vista mosaico por tono |
| 6 | Fragmentos del resto de la colección (fuera de playlists) | ~8.000 temas más, unos 11 GB |
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
> Seguimos con lo que haya en «Ahora» de `CONTINUAR_RGBPM.md`. Quiero verlo funcionando y publicado, con la bitácora al día.
