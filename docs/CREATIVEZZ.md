# RGBPM · proyecto vivo para Creativezz

> Material para el chat de Creativezz. Todo en primera persona, con datos reales del repo (30 sep 2026).

---

## 1 · En una línea

**RGBPM** es mi app para DJs: ordena mi biblioteca de Traktor, recomienda qué tema pinchar después por tono y BPM, y suena. **Color = BPM.**

| | |
|---|---|
| Web | https://laritazz.github.io/rgbpm/ |
| Código | https://github.com/laritazz/rgbpm |
| Estado en directo | https://laritazz.github.io/rgbpm/estado.json |
| Estado | En construcción, se publica con cada cambio |

---

## 2 · Por qué es un proyecto «vivo»

- Empezó como un HTML propio (`RGBPM.html`) y lo estoy rehaciendo en **React** mientras aprendo.
- Cada sesión queda en una **bitácora**: qué hice, qué decidí y qué aprendí.
- Cada publicación genera un `estado.json` público con:

| Campo | Qué dice |
|---|---|
| `ultima` | Última sesión (número, fecha, título) |
| `sesiones` | Todas las sesiones |
| `paridad` | Utilidades de la web original: hechas, a medias, pendientes y nuevas |
| `codigo` | Archivos, líneas y pruebas |
| `version`, `publicado` | Commit y fecha de la última publicación |

La ficha de Creativezz puede leerlo con `fetch` y pintarse sola: GitHub Pages permite leerlo desde otra web (CORS abierto).

---

## 3 · Datos (30 sep 2026)

| | |
|---|---|
| Sesiones | 10 en 3 días (28–30 sep) |
| Código | 74 archivos · ~8.300 líneas · 38 pruebas automáticas |
| Utilidades de la web original | 22 hechas · 7 a medias · 19 pendientes |
| Nuevas | 12 que la original no tenía |
| Publicación | Automática: pruebas + lint + build en GitHub Actions |

---

## 4 · El papel de la IA (el foco del caso)

**Cómo trabajo:** yo dirijo el producto y el diseño; Claude escribe la mayor parte del código y me explica cada concepto nuevo. Yo lo pruebo con mi música real, decido y corrijo.

| Yo | Claude (IA) |
|---|---|
| Visión de producto y para quién es | Propone arquitectura y alternativas |
| Marca, color = BPM, mascota, dirección visual | Escribe la mayor parte del código React, CSS y PHP |
| Decisiones: qué entra, qué se descarta (SoundCloud, Shazam) | Escribe pruebas y documenta cada sesión |
| Pruebas reales: mi biblioteca, mi móvil, mi servidor | Diagnostica errores con lo que le paso |
| Seguridad: claves y contraseñas nunca pasan por la IA | Diseña el sistema para que no hagan falta |

**Reglas del método** (viven en el repo, en `CLAUDE.md`):
- Lógica pura separada y probada; los componentes no calculan reglas de mezcla.
- Nombres y comentarios en español.
- Toda animación respeta `prefers-reduced-motion`.
- Nunca se sube música ni la colección al repo.
- Antes de publicar: pruebas, lint y build.

**IA dentro del producto** (sin servicios externos, todo en el navegador):
- Detecta el **BPM** escuchando por el micro (autocorrelación).
- Detecta la **tonalidad** (FFT + perfiles de Krumhansl).
- Escucha continua tipo Shazam: para sola cuando está segura y dice «¿es uno de tus temas?».
- Recomienda el siguiente tema y reordena un set por armonía.

---

## 5 · Qué he aprendido de React

| Nivel | Conceptos |
|---|---|
| Base | Componentes, props, `useState`, estado derivado, listas con `key`, subir el estado |
| Datos | `useContext` + proveedores, `useReducer` con deshacer, estado en la URL |
| Rendimiento | `memo`, `useDeferredValue`, carga progresiva con `IntersectionObserver` |
| Mundo exterior | `useEffect`, `useRef`, `useSyncExternalStore`, hooks propios |
| Navegador | Web Audio, Web Workers, AudioWorklet, `<dialog>`, arrastrar y soltar, FLIP, PWA |
| Oficio | Vite, Git y GitHub, Actions, Vitest, depurar en la terminal |

---

## 6 · Hitos técnicos

1. **La biblioteca suena:** conecto mi carpeta de música; el navegador recuerda el permiso.
2. **Audio privado:** login con Supabase → mi servidor (IONOS, PHP) firma enlaces que caducan → fragmentos de 90 s con nombres anónimos. Suena, pero no se descarga.
3. **Radio:** encadena mis temas por armonía con fundido cruzado de 10 s.
4. **Sets:** curva de energía, reordenar automático, deshacer para todo, exportar a Traktor.
5. **Móvil:** pestañas con la mascota, pantalla «Sonando» y app instalable.

---

## 7 · Diseño

- **Color = BPM:** cada franja de tempo tiene su color; las portadas son fichas Pantone generadas.
- **Mascota viva:** cambia de forma, cara y color con el tema; es el botón de play.
- **Marca Laritazz:** wordmark RGBPM con cada letra en su color; icono de app con el asterisco.
- **Tipografía:** Urbanist.

---

## 8 · Propuesta de ficha en Creativezz

| Bloque | Contenido |
|---|---|
| Portada | Mascota animada + «En construcción · sesión N» (de `estado.json`) |
| Resumen | La línea del punto 1 y los enlaces |
| Contador vivo | Sesiones · utilidades hechas · pruebas · última publicación |
| Cómo trabajo con IA | La tabla del punto 4 |
| Aprendiendo React | La tabla del punto 5, que crece con cada sesión |
| Bitácora | Las sesiones de `estado.json`, de la más nueva a la más antigua |
| Capturas | Escritorio y móvil |

---

## 9 · Mensaje para arrancar el chat en Creativezz

> Quiero añadir **RGBPM** a mi web como proyecto **vivo**. Te adjunto `CREATIVEZZ.md` con todo: qué es, datos, cómo trabajo con IA y qué estoy aprendiendo de React.
>
> 1. Propón cómo encaja en `contenido.js` y en el diseño actual de la web.
> 2. La ficha debe leer `https://laritazz.github.io/rgbpm/estado.json` para mostrar la sesión actual, el contador y la bitácora sin tocar la web a mano.
> 3. Dale peso especial a la IA: cómo la uso para diseñar y programar, y la IA que hay dentro del producto.
> 4. Sé honesta: yo dirijo producto, diseño y decisiones; el código lo escribe sobre todo la IA y yo aprendo React con cada sesión.
