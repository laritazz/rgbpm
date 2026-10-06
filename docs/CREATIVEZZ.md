# RGBPM · caso vivo para Creativezz

> **Copia congelada del 6 oct 2026.** La versión viva está en Notion (privado): [07 — Contenido](https://app.notion.com/p/3f1c9362e7c68107b19ecacf3e89cde6). No edites este archivo: los cambios van en Notion.

> Todo lo necesario para contar RGBPM en mi web: historia, proceso, IA, React, diseño, imágenes y la sección en directo desde GitHub.
> Escrito en primera persona. Datos reales del repo a 30 sep 2026; los números vivos salen de `estado.json`.

**Índice**
1. La idea · 2. Ficha rápida · 3. Por qué existe · 4. El proceso, sesión a sesión · 5. Giros y decisiones · 6. IA: cómo trabajo · 7. Aprendiendo React · 8. Diseño · 9. Cómo funciona por dentro · 10. Imágenes y vídeos · 11. En directo desde GitHub · 12. Guion de la ficha · 13. Ideas para sorprender · 14. Mensaje para el chat de Creativezz

---

## 1 · La idea

**Una app para DJs donde el color es el tempo.**
Ordena mi biblioteca de Traktor, me dice qué tema pinchar después por tono y BPM, y suena.

**Titular propuesto:** *RGBPM · pincho por colores*
**Subtítulo:** *Diseño, código e IA en una app que crece cada semana. La estoy construyendo en público mientras aprendo React.*

---

## 2 · Ficha rápida

| | |
|---|---|
| Rol | Producto, UX/UI, marca, dirección de arte y desarrollo con IA |
| Estado | 🟢 En construcción · se publica con cada cambio |
| Inicio en React | 28 sep 2026 |
| Pila | React 19 · Vite · Web Audio · Web Workers · Supabase · PHP · GitHub Actions |
| Web | https://laritazz.github.io/rgbpm/ |
| Código | https://github.com/laritazz/rgbpm |
| Datos en directo | https://laritazz.github.io/rgbpm/estado.json |

---

## 3 · Por qué existe

- **Soy DJ y diseñadora.** Preparar un set es buscar temas que peguen en **tono** y **tempo**. Traktor me da los datos, pero no me ayuda a decidir.
- **Mi sistema de color:** en mis redes, cada franja de BPM tiene su color. Quise llevarlo a una herramienta: **color = BPM**.
- **Primera versión:** un único archivo HTML que ya usaba para preparar sesiones.
- **Segunda versión (esta):** rehacerla en **React** para aprender de verdad, con repositorio, pruebas y publicación automática. Sin perder nada de lo que tenía la original.

**Para quién:** para mí primero. Después, para DJs que empiezan y no saben de armonía.

---

## 4 · El proceso, sesión a sesión

### Método: Double Diamond en bucles cortos
El proyecto es un diamante doble y cada sesión repite uno pequeño: **uso la app → defino el problema → pruebo soluciones → publico**. Detalle y pruebas: `docs/PROCESO.md`.

| Fase | Qué hice | Prueba |
|---|---|---|
| Descubrir | Autoetnografía como DJ, análisis de mis 10.554 temas, benchmark de 5 productos, límites de APIs y derechos | Histograma de BPM; tabla de competencia |
| Definir | Brief, perfiles, trabajo por hacer, «¿cómo podríamos…?», 5 principios, métricas | `PRODUCTO.md`, `SISTEMA.md` §1 |
| Desarrollar | Varias opciones por pieza (inicio, color, iconos, conexiones de Armonía), siempre como prototipo publicado | `DECISIONES.md`: qué gané y qué descarté |
| Entregar | Sistema de diseño vivo, 115 pruebas automáticas, evaluación heurística de Nielsen, recorrido cognitivo con 5 proto-personas, test con DJs reales | `/#/sistema`, `PROCESO.md` §6 y §8, `PERSONAS.md`, `PRUEBA_USUARIOS.md` |

**Frase para la web:** *No diseño en Figma y luego programo: cada idea se publica como prototipo, la pruebo con mi música y decido con datos.*

> Cada sesión queda en la bitácora del repo: qué hice, qué decidí y qué aprendí.

| # | Fecha | Sesión | Qué pasó | Imagen |
|---|---|---|---|---|
| 1 | 28 sep | Esqueleto | Del HTML único a un proyecto React con Vite, GitHub y publicación automática | — |
| 2 | 28–29 sep | Producto y marca | Brief, 3 direcciones visuales, mascotas y logo generados por código | Pruebas de logo *(las aporto yo)* |
| 3 | 29 sep | Biblioteca | Importo mi Traktor; portadas Pantone; filtros por color | `escritorio-biblioteca` · `biblioteca-color` |
| 4 | 29 sep | Tap y escucha | Cuenta BPM a toques o escuchando por el micro; detecta la clave | `tap-bpm` · `mascota` |
| 5 | 29 sep | Suena | Conecto mi carpeta de música y la biblioteca suena | — |
| 6 | 29 sep | Radio | Encadena mis temas por armonía con fundido de 10 s | — |
| 7 | 29 sep | Móvil | Pestañas con la mascota, pantalla completa, escucha continua | `movil-biblioteca` · `movil-escuchar` |
| 8 | 29 sep | Audio privado | Login y fragmentos de 90 s en mi hosting: suena, no se descarga | Diagrama (punto 9) |
| 9 | 29 sep | Sets | Curva de energía, reordenado automático, deshacer, exportar a Traktor | `escritorio-set` · `set-reordenar` |
| 10 | 30 sep | Suena en el móvil | 79 temas reales sonando en el iPhone; la mascota es el play; app instalable | Captura del iPhone *(la aporto yo)* |
| 11 | 30 sep | Armonía | Rueda grande, set sugerido desde una clave, Open Key / Camelot | — |
| 12 | 30 sep | Inicio y mascota | Inicio rosa de círculos; transiciones en círculo; mascota que reacciona | — |
| 13 | 30 sep | Iconos y vinilo | Rueda de Armonía como vinilo con arcos musicales | — |
| 14 | 30 sep | Cartel y juego | Cartel suizo con gotas que se funden; primer juego | — |
| 15 | 2 oct | Letras y juegos | Tipografía propia sacada del logo; cinco juegos; récords en Supabase | — |
| 16 | 2 oct | Color v2 | Franjas cortadas con datos; color = tempo + tono; previas de Apple Music; solo sale lo que suena | `/#/sistema` |
| 17 | 2 oct | Método | Double Diamond documentado, evaluación heurística, kit de test; 2.413 fragmentos de todas mis playlists | `PROCESO.md` |
| 18 | 2 oct | Personas | 5 DJs ficticias inspiradas en estilos reales recorren la app: 11 problemas, 11 resueltos; el set sugerido gana forma de energía y puede quedarse en el tono; «Contraste» en vez de «Choca»; el mezclador cambia de enfoque | `PERSONAS.md` |

---

## 5 · Giros y decisiones

Lo que cuenta un proceso de verdad: lo que probé, lo que descarté y por qué.

| Momento | Decisión | Por qué |
|---|---|---|
| Colores de la app | Primero **color = BPM**; en la v2, **tempo + tono = un degradado** | El tempo es mi sistema de marca; usando la app vi que el tono también tenía que verse |
| Cortes de color | De franjas «de manual» a franjas **con datos** de mi colección | El violeta se comía el 32 % de la música y el rojo empezaba en 168 |
| Lo que no suena | **No se sugiere** | Un set propuesto con temas mudos no sirve en cabina |
| Sin DJs a mano | **Recorrido cognitivo con proto-personas**, sin puntuaciones inventadas | Llego al test real con lo obvio arreglado; soy honesta con lo que es una hipótesis |
| Mezclador | Empieza por **probar la transición** | Las personas querían oír el cruce, no dos platos completos |
| Verde | Solo en la escala de color, nunca en botones | Se asocia a Spotify |
| Tipografía | Urbanist para leer y **RGBPM Letras**, propia, sacada del logo, para menús y títulos; Codec fuera del repo | La licencia de Codec no permite distribuirla; una letra propia es de la marca y pesa 2 KB |
| Iconos | Propios, de gotas: puntos que se unen al tocarse | El mismo lenguaje que los círculos del inicio |
| Inicio | Cartel vivo cuyo tamaño cambia con el uso | Lo que usas ahora manda; lo que dejas, encoge |
| Mascota | Sin manos: el Disco y el Asterisco se transforman uno en otro | Más limpia; la forma dice la energía del tema |
| SoundCloud | **Descartado** | Su API no deja hacer lo que necesito |
| Shazam | **Mi propio análisis** en el navegador | No tiene API web; el audio no sale del móvil |
| Mi música en internet | **Fragmentos privados de 90 s** con login | Quiero reconocer temas y montar sets, no que se descarguen |
| 79 temas «sin archivo» | El script los busca solo con Spotlight | Había movido la música a un disco externo |
| Móvil con demo | Emparejo por artista y título cifrados | La demo no lleva rutas de archivo |
| Play tapado en el iPhone | **La mascota es el play** | Lo vi probando en mi móvil: el botón quedaba bajo la barra del navegador |

---

## 6 · IA: cómo trabajo

**En una frase:** yo dirijo el producto, el diseño y cada decisión; la IA (Claude) escribe la mayor parte del código y me explica cada concepto nuevo. Yo lo pruebo con mi música real, en mi Mac y en mi móvil.

### Reparto

| Yo | La IA |
|---|---|
| Visión de producto y para quién es | Propone arquitectura y alternativas |
| Marca, color = BPM, mascota, dirección visual | Escribe la mayor parte del código React, CSS, Node y PHP |
| Qué entra, qué se descarta (SoundCloud, Shazam, verde) | Escribe pruebas automáticas y documenta cada sesión |
| Pruebo con mi biblioteca, mi móvil y mi servidor | Diagnostica errores con lo que le paso (terminal, capturas) |
| Claves y contraseñas: **nunca** pasan por la IA | Diseña el sistema para que no hagan falta |

### El método
- **Un contrato en el repo** (`CLAUDE.md`): lógica separada y probada, nombres en español, animaciones que respetan `prefers-reduced-motion`, nada de música en el repo, pruebas antes de publicar.
- **Bitácora obligatoria:** cada concepto nuevo se explica. Así la IA no me hace el trabajo: me enseña mientras lo hacemos.
- **Publicar sin miedo:** cada cambio pasa pruebas, revisión de código y build en GitHub Actions antes de salir.
- **Probar en real:** los fallos importantes los encontré yo usando la app (el play tapado, los 79 temas sin archivo).

### Donde la IA se equivocó (y cómo se corrigió)
| Qué pasó | Cómo se arregló |
|---|---|
| El script de fragmentos no encontraba mi música | Distingue «sin permiso» de «movido» y busca con Spotlight |
| En el móvil, la demo no emparejaba con el audio privado | Segunda llave anónima por artista y título |
| Layout con el play fuera de pantalla en el iPhone | La mascota pasa a ser el botón; todo cabe en la pantalla |

### IA dentro del producto
Sin servicios externos: todo se calcula en el navegador.
- **BPM por el micro:** autocorrelación de la energía del audio.
- **Tonalidad:** FFT, cromagrama y perfiles de Krumhansl.
- **Escucha tipo Shazam:** para sola cuando está segura y pregunta «¿es uno de tus temas?».
- **Recomendación:** siguiente tema con nota 0–100 y reordenado de sets por armonía (prueba 25 arranques y se queda con el mejor).

---

## 7 · Aprendiendo React

Cómo aprendo: la IA escribe, yo pregunto y la bitácora lo explica con mis palabras.

| Nivel | Conceptos |
|---|---|
| Base | Componentes, props, `useState`, estado derivado, listas con `key`, subir el estado |
| Datos | `useContext` + proveedores, `useReducer` con deshacer, estado de la vista en la URL |
| Rendimiento | `memo`, `useDeferredValue`, carga progresiva con `IntersectionObserver` |
| Mundo exterior | `useEffect`, `useRef`, `useSyncExternalStore`, hooks propios |
| Navegador | Web Audio, Web Workers, AudioWorklet, `<dialog>`, arrastrar y soltar, animaciones FLIP, PWA |
| Oficio | Vite, Git y GitHub, Actions, Vitest, depurar en la terminal |

**Frase para la web:** *Aprendo React construyendo algo que uso de verdad. Cada pieza de la app está explicada en la bitácora, con mis palabras.*

---

## 8 · Diseño

| Pieza | Qué es |
|---|---|
| **Color = tempo + tono** | Franja de BPM con datos reales: violeta < 110 · turquesa 110–124 · oliva 124–132 · amarillo 132–150 · carmesí ≥ 150. Cada clave tiene su color; un tema es un degradado del BPM a su clave |
| **Portadas Pantone** | Cada tema es una ficha de color con su BPM y su clave |
| **Mascota viva** | Late al tempo, cambia de forma (Disco ↔ Asterisco), de cara y de color con el tema |
| **Curva de energía** | El set dibujado tema a tema, cada tramo en el color de su relación armónica |
| **Marca** | Wordmark RGBPM con cada letra en su color; icono de app con el Asterisco |
| **Móvil** | Pestañas con la mascota en el centro, pantalla «Sonando», instalable como app |

---

## 9 · Cómo funciona por dentro

```
Mi Mac                          Navegador (React)                     Mi hosting (IONOS)
──────                          ─────────────────                     ──────────────────
Traktor collection.nml  ──►  Biblioteca, sets, radio
Script de fragmentos    ──────────────────────────────────────────►  fragmentos de 90 s
                                    │  login                             (nombres anónimos)
                                    ▼
                               Supabase ── ¿quién eres? ──►  firmar.php ── ¿puedes? ──► enlace que caduca
                                                                                          │
                               <audio> ◄──────────────────────────────────────────────────┘
```

- **Privacidad:** la colección no sale de mi equipo; en el servidor solo hay fragmentos con nombres anónimos.
- **Seguridad:** autenticación (Supabase) separada de autorización (mi lista de emails); enlaces firmados que caducan a los 20 minutos.

---

## 10 · Imágenes y vídeos

Se generan solas con la demo pública (`npm run capturas`) y se publican con la web. **Siempre actualizadas.**
Base: `https://laritazz.github.io/rgbpm/media/`

### Ya hechas

| Archivo | Qué muestra | Dónde usarlo |
|---|---|---|
| `mascota.mp4` / `.gif` | La mascota latiendo a 128 BPM | **Portada** de la ficha |
| `biblioteca-color.mp4` / `.gif` | Filtro por colores: la biblioteca cambia de franja | Sección Diseño |
| `tap-bpm.mp4` / `.gif` | Tap BPM en el móvil: 20 toques → 128 BPM | Sección IA en el producto |
| `set-reordenar.mp4` / `.gif` | Reordenar un set real: 77 % → 100 % sin choques, deshacer | Sección Proceso |
| `escritorio-biblioteca.webp` | Biblioteca en escritorio | Galería |
| `escritorio-set.webp` | Set con curva de energía | Galería |
| `escritorio-escuchar.webp` | Escuchar / Tap en escritorio | Galería |
| `movil-biblioteca.webp` · `movil-set.webp` · `movil-escuchar.webp` | Las tres pantallas en móvil | Mosaico de móviles |

**Formato:** en la web, `.mp4` (pesa 10 veces menos que el `.gif`):
```html
<video src="https://laritazz.github.io/rgbpm/media/mascota.mp4" autoplay muted loop playsinline></video>
```
Los `.gif` quedan para GitHub y redes.

### Las aporto yo

| Qué | Por qué |
|---|---|
| Captura del iPhone con «Sonando» y mi música | Prueba de que suena de verdad (la demo no tiene audio) |
| Captura de la web original (`RGBPM.html`) | Antes / después |
| Pruebas de logo y mascotas de la sesión 2 | Proceso de marca |
| Foto o vídeo pinchando | La persona detrás del proyecto |
| Captura de Claude trabajando conmigo (una conversación, la terminal) | Hace visible el método con IA |

---

## 11 · En directo desde GitHub

**Idea:** una sección que se actualiza sola con cada cambio que publico, con estética de **tracklist de DJ**. Cada commit es un tema.

### De dónde salen los datos
`https://laritazz.github.io/rgbpm/estado.json` (se regenera en cada publicación; se puede leer desde otra web)

| Campo | Contenido |
|---|---|
| `commits` | Los 12 últimos: `sha`, `fecha`, `area` (Sonando, Sets…), `mensaje`, `archivos`, `mas`, `menos`, `url` |
| `totalCommits` | Cuántos cambios lleva el proyecto |
| `ultima` · `sesiones` | Sesión actual y todas las de la bitácora |
| `paridad` | Utilidades de la original: hechas, a medias, pendientes; y nuevas |
| `codigo` | Archivos, líneas y pruebas |
| `version` · `publicado` | Última publicación |

Ejemplo de un commit:
```json
{ "sha": "c6d9597", "fecha": "2026-09-30T10:17:05+02:00", "area": "Sonando",
  "mensaje": "La mascota es el play y todo cabe en pantalla; RGBPM instalable (PWA)",
  "archivos": 9, "mas": 165, "menos": 58, "url": "https://github.com/laritazz/rgbpm/commit/…" }
```

### Cómo se ve (propuesta)
```
EN DIRECTO DESDE GITHUB                              ● publicado hace 2 h
───────────────────────────────────────────────────────────────────────
23  Sonando       La mascota es el play y todo cabe en pantalla   +165 −58
22  Audio privado Los temas sin ruta encuentran su fragmento       +75 −22
21  Fragmentos    Si el tema se movió, lo busca con Spotlight      +18  −2
…
                                              Ver todo en GitHub →
```
- Número de pista = posición en el historial (`totalCommits`, `totalCommits − 1`…).
- Barra de color por commit: su tamaño (`mas + menos`) pasado a la escala de BPM → cambios grandes, colores cálidos.
- Si `estado.json` no carga: se oculta la sección, nunca queda vacía.

### Código mínimo (JavaScript sin librerías)
```js
const r = await fetch('https://laritazz.github.io/rgbpm/estado.json', { cache: 'no-cache' })
const estado = await r.json()
estado.commits.forEach((c, i) => {
  const pista = estado.totalCommits - i
  // pintar: pista, c.area, c.mensaje, +c.mas −c.menos, enlace a c.url
})
```

---

## 12 · Guion de la ficha

| Orden | Bloque | Contenido |
|---|---|---|
| 1 | **Portada** | `mascota.mp4` a pantalla completa + titular + «🟢 En construcción · sesión N» (de `estado.json`) |
| 2 | **Botones** | Probar la app · Ver el código · Leer la bitácora |
| 3 | **Contador vivo** | Sesiones · cambios publicados · utilidades hechas · pruebas |
| 4 | **Por qué existe** | Punto 3, en 3 líneas |
| 5 | **Cómo trabajo con IA** | Tabla del punto 6 + «donde la IA se equivocó» |
| 6 | **IA dentro del producto** | `tap-bpm.mp4` + los 4 puntos |
| 7 | **Diseño** | `biblioteca-color.mp4` + mosaico de móviles |
| 8 | **Proceso** | Línea de tiempo del punto 4 + `set-reordenar.mp4` + tabla de giros |
| 9 | **Aprendiendo React** | Tabla del punto 7, que crece con cada sesión |
| 10 | **En directo desde GitHub** | La tracklist del punto 11 |
| 11 | **Pruébala** | La app embebida (punto 13) |

---

## 13 · Ideas para sorprender

| Idea | Cómo |
|---|---|
| **La app dentro de la ficha** | `<iframe src="https://laritazz.github.io/rgbpm/#/tap" allow="microphone">`: quien lee puede contar BPM a toques sin salir de mi web |
| **La mascota late con el proyecto** | Su color sale del número de cambios de la última semana: más actividad, más cálido |
| **«Publicado hace X»** | Tiempo desde `publicado`: se nota que está vivo |
| **Barra de progreso de la paridad** | 22 de 48 utilidades de la original, en los colores de BPM |
| **Antes / después** | Deslizador entre la web original y la nueva |
| **Tracklist de commits** | Punto 11 |

**Para que crezca a ojos de la gente:**
- Un post corto por sesión (LinkedIn o Instagram) con el GIF de lo nuevo y el enlace a la ficha.
- El README del repo con los GIFs: GitHub también es escaparate.
- En la ficha, siempre una llamada a probarla.

---

## 14 · Mensaje para el chat de Creativezz

> Quiero añadir **RGBPM** a mi web como proyecto **vivo**. Te adjunto `CREATIVEZZ.md` con todo el caso: historia, proceso, IA, React, diseño, imágenes y datos en directo.
>
> 1. Propón cómo encaja en `contenido.js` y en el diseño actual de la web, siguiendo el guion del punto 12.
> 2. La ficha lee `https://laritazz.github.io/rgbpm/estado.json` para la sesión actual, el contador y la sección **«En directo desde GitHub»** (punto 11), sin que yo toque la web a mano.
> 3. Usa los vídeos de `https://laritazz.github.io/rgbpm/media/` (punto 10) en `.mp4`.
> 4. Dale peso especial a la IA: cómo la uso para diseñar y programar, dónde se equivocó y la IA que hay dentro del producto.
> 5. Sé honesta: yo dirijo producto, diseño y decisiones; el código lo escribe sobre todo la IA y yo aprendo React con cada sesión.
> 6. Añade al menos una de las ideas del punto 13 para sorprender.
