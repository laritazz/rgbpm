# RGBPM · Arquitectura

> **Copia congelada del 6 oct 2026.** La versión viva está en Notion (privado): [06 — Desarrollo y audio](https://app.notion.com/p/3f1c9362e7c6818bbdabd32362995402). No edites este archivo: los cambios van en Notion.

> v2 · 2 oct 2026. Cómo está hecho por dentro, front y back. Las decisiones y su porqué: `docs/DECISIONES.md`.

---

## 1 · Vista general

```
                     ┌──────────────── Navegador (GitHub Pages) ────────────────┐
                     │  React 19 + Vite · JavaScript · HashRouter                │
  tu Mac ──carpeta──▶│  lib/ (reglas puras, con pruebas)                         │
  (temas enteros)    │  hooks/ · features/ · components/ · app/                  │
                     │  IndexedDB + localStorage (todo lo tuyo se queda aquí)    │
                     └──────┬───────────────┬──────────────────┬────────────────┘
                            │ login         │ firma / audio    │ previas 30 s
                            ▼               ▼                  ▼
                       Supabase         IONOS (PHP)        Apple Music
                       · Auth           · firmar.php       (iTunes Search API,
                       · puntuaciones   · audio.php         pública, CORS)
                         (RLS)          · fragmentos 90 s
```

---

## 2 · Front

### Capas

| Carpeta | Qué va | Regla |
|---|---|---|
| `src/lib/` | Reglas puras: armonía, color, sets, radio, juegos, uso, composición, previas… | Sin React. Todo con pruebas en Vitest |
| `src/hooks/` | Lógica con estado reutilizable (mascota, uso, medida, isla…) | Sin JSX |
| `src/features/<sección>/` | Pantallas y su contexto | No calculan reglas: llaman a `lib/` |
| `src/components/` | Piezas compartidas (Cartel, Iconos, marca) | Sin datos de negocio |
| `src/app/` | Shell, rutas, secciones, transición en círculo, carga perezosa | — |

### Proveedores (de fuera a dentro)

`AjustesArmonía` › `Biblioteca` › `Música` › `Reproductor` › `Set` › `Router`

### Rutas

| Ruta | Pantalla | Carga |
|---|---|---|
| `/` | Inicio (cartel) | Inmediata |
| `/biblioteca`, `/set/:id` | Biblioteca | Inmediata |
| `/armonia` · `/sets` · `/radio` · `/tap` | Secciones | Perezosa (`React.lazy`), se precarga al pasar por su círculo |
| `/juego` + `/juego/{bpm,pega,cae,corre,cuadra}` | Juegos | Perezosa |
| `/sistema` | Guía de estilo viva | Perezosa |

### Estado: dónde vive cada cosa

| Qué | Dónde | Clave |
|---|---|---|
| Vista (filtros, clave elegida, pestaña) | URL | `?q=`, `?franja=`, `?audio=`, `?clave=`… |
| Colección importada | IndexedDB | `coleccion` |
| Set en curso y guardados | IndexedDB | `set` |
| Carpetas de música (permiso) | IndexedDB | `carpetas` |
| Récords de juegos | IndexedDB (+ Supabase si hay sesión) | `juego:<id>` |
| Cazados (Escuchar) | IndexedDB | `cazados` |
| Preferencias de armonía | localStorage | `rgbpm:armonia` |
| Uso de secciones | localStorage | `rgbpm:uso` |
| Previas encontradas | localStorage (1 mes) | `rgbpm:previas` |
| Sesión de Supabase | localStorage | `rgbpm-sesion` |

### Audio: de dónde sale cada tema

| Orden | Fuente | Duración | Quién la oye | Código |
|---|---|---|---|---|
| 1 | Tu carpeta del ordenador | Entero | Tú, en ese navegador | `MusicaContext` (File System Access) |
| 2 | Fragmentos privados en IONOS | 90 s | Tú, con login | `usePrivado` + `servidor/` |
| 3 | Previas de Apple Music | 30 s | Cualquiera | `usePrevias` + `lib/previas` |

- **`audibles`** son los temas con alguna fuente. Sugerencias, sets propuestos, Pegan, radio y juegos usan solo esos (si hay al menos 12).
- La demo trae sus previas ya buscadas (`public/previas.json`, `npm run previas`): suena al primer clic. En una colección importada, cada tema se busca al darle al play y se recuerda.

---

## 3 · Back

| Servicio | Para qué | Seguridad |
|---|---|---|
| **Supabase Auth** | Entrar (solo Lara: altas cerradas) | Clave publicable en el front; sin claves de servicio en ningún sitio |
| **Supabase · `puntuaciones`** | Récords de juegos en la nube | RLS: `user_id = auth.uid()` para leer e insertar. Sin update ni delete. `servidor/supabase/puntuaciones.sql` |
| **IONOS · `firmar.php`** | Valida el token con Supabase y firma enlaces HMAC (20 min) | Lista de emails permitidos en `config.php` (nunca en el repo) |
| **IONOS · `audio.php`** | Sirve el fragmento con Range | Comprueba firma y caducidad; `privado/` bloqueado por `.htaccess` |
| **Apple Music** | Previas de 30 s | API pública, sin claves. Se enlaza cada previa a su tema en Apple Music |
| **GitHub Pages** | Publica la web | CI: `npm ci` → pruebas → lint → build → publicar. Si una prueba falla, no se publica |

---

## 4 · Calidad

| Qué | Cómo |
|---|---|
| Pruebas | Vitest, ~110 pruebas en `src/lib/*.test.js` |
| Estilo | oxlint (reglas de React y hooks) |
| Antes de subir | `npm run comprobar` (pruebas + lint + build) |
| En cada push | GitHub Actions repite lo mismo y solo publica si pasa |
| Estado público | `estado.json` (sesiones, commits, paridad, pruebas) |
| Bitácora | `BITACORA.md`: una sesión por entrada, con decisiones y conceptos de React |

---

## 5 · Scripts

| Comando | Qué hace | Dónde se lanza |
|---|---|---|
| `npm run fragmentos -- …` | Crea los fragmentos de 90 s desde tu colección | Tu Mac |
| `npm run previas` | Busca las previas de la demo | Tu Mac (necesita red) |
| `npm run fuente` | Genera RGBPM Letras | Cualquier sitio con Python |
| `npm run capturas` | Capturas y vídeos para el portfolio | Con `vite preview` encendido |
| `npm run comprobar` | Pruebas, lint y build | Antes de cada push |
