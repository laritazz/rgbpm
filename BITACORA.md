# Bitácora RGBPM · React

Registro de cada sesión: qué hicimos, qué decidimos y qué aprendí.
Es la fuente del caso de estudio final.

---

## Sesión 1 · 28 sep 2026 · Esqueleto y primera pantalla

**Objetivo:** pasar RGBPM de un HTML único a un proyecto React con repositorio.

### Qué hicimos
| Paso | Resultado |
|---|---|
| Crear proyecto con Vite (plantilla React, JavaScript) | Servidor local con recarga instantánea |
| Limpiar la plantilla | Fuera logos y estilos de ejemplo |
| Tokens de marca en CSS | Negro, magenta, rosa, violeta y blanco (sin verde) |
| Lógica de armonías aparte (`src/logic/armonia.js`) | Funciones puras, probadas sin interfaz |
| Cinco componentes | `Buscador`, `ListaTemas`, `TarjetaTema`, `Portada`, `PanelArmonia` |
| Portada en degradado cónico | El ángulo sale de la clave; mayor y menor cambian la paleta |
| Sello de versión junto al logo | `vAAAAMMDD.HHMM`, generado al arrancar |
| Ajuste móvil | El panel sube arriba; la etiqueta de relación baja bajo el artista |

### Decisiones
- **JavaScript antes que TypeScript.** Primero React; los tipos, más adelante.
- **Datos de ejemplo.** La importación de `collection.nml` de Traktor llega en otra sesión.
- **Relaciones armónicas estándar de Open Key** (misma clave, ±1, mayor↔menor). Las seis de mi hoja se incorporan al leer `RGBPM.html`.
- **Estado mínimo.** Solo se guardan la búsqueda y el tema elegido; lo demás se calcula.

### Qué aprendí
- **Componente:** una función que devuelve JSX. Una pieza de interfaz, un archivo.
- **Props:** datos que el padre pasa al hijo (`<TarjetaTema tema={…} />`).
- **`useState`:** memoria del componente; al cambiarla, React vuelve a pintar.
- **Estado derivado:** si algo se puede calcular (la lista filtrada), no se guarda.
- **`map` + `key`:** pintar listas; la `key` le dice a React qué fila es cuál.
- **Subir el estado:** `App` guarda el tema elegido y lo comparte con lista y panel.
- **Campo controlado:** el `input` muestra el estado y avisa de cada cambio.
- **Terminal:** `npm` busca `package.json` en la carpeta actual. Primer error real: ejecutar `npm install` fuera del proyecto (`ENOENT`).
- **Depurar paso a paso:** si un comando falla, los siguientes fallan en cadena. Localicé el zip con `find` y lo descomprimí con `unzip`.
- **Puertos:** Vite arrancó en el 5174 porque el 5173 ya estaba ocupado por otro servidor.
- **Pestañas de Terminal:** la que ejecuta `npm run dev` queda ocupada; los comandos van en otra (`Cmd + T`).
- **GitHub:** en Terminal no vale la contraseña de la cuenta, hace falta un token *classic* con permisos `repo` y `workflow`. Primer `git push` a `laritazz/rgbpm`.
- **GitHub Pages + Actions:** la primera ejecución falló porque Pages aún no estaba activado; con *Source: GitHub Actions* y *Re-run* quedó publicada en `laritazz.github.io/rgbpm`.

### Ejercicio para la próxima sesión (lo escribo yo)
Crear el componente `Filtros` con dos botones, «Solo mayores» y «Solo menores», que filtren la biblioteca.
---

## Decisiones de rumbo · 28 sep 2026

| Tema | Decisión |
|---|---|
| Back | **Supabase** (base de datos + login) para guardar y compartir sets |
| Datos en la nube | Solo metadatos (título, artista, BPM, clave). Nunca audio ni portadas con derechos |
| Región de datos | UE, por RGPD |
| Diseño | Se replantea la dirección visual: Lara aporta referencias y se proponen 2-3 direcciones como prototipos |
| Producto | Antes de programar más: definir problema, usuaria y tareas clave para poder justificar cada decisión |

---

## Sesión 2 · 28–29 sep 2026 · Producto, dirección visual y marca

### Qué hicimos
| Paso | Resultado |
|---|---|
| Brief de producto | Problema, usuaria, 3 tareas clave, alcance y riesgos (`BRIEF.md`) |
| Investigación | Spotify Mix ya ordena por BPM y tono; en software de DJ solo uso personal |
| 3 direcciones visuales navegables | Vinilo, Cartel y Deck móvil con mezclador |
| Sistema Laritazz aplicado | Color = BPM, portadas Pantone, rueda armónica para el tono |
| Mascotas en vector | El Disco y el Asterisco, 4 poses cada uno, generados por código |
| Logo RGBPM | Letras de bloque recortadas al estilo de los ZZ; 4 versiones + icono |

### Decisiones
- **Color = BPM** (mi sistema de RRSS), no color = tono. El tono se ve en la rueda.
- **Verde** permitido en la escala; nunca en botones ni acciones principales.
- **Codec** es trial CC BY-NC y prohíbe distribuir los archivos → fuera del repo público. Outfit en la web hasta tener licencia.
- **Marca generada por código** (`brand/generar.py`): un cambio de color o pose se regenera en segundos.
- **Mascotas sin manos:** solo la O y el ✱. Una sola forma que se transforma de una en otra (O = calma, ✱ = energía).
- **Animación ligada a la música:** late al BPM, gira una muesca por compás, se tiñe con la escala y se transforma según la energía.
- **Tipografía web: Urbanist.** La versión trial de Codec sustituye los números por un sello: inútil para una app de BPM.
- **6 pruebas de logo:** escala, apilado, RGB ✱ PM, recorrido, pegatina e iconos.
- **Elección de marca:** logo 1 (escala) como principal · 4 (recorrido) si se anima con un sonido que viaja del Disco al Asterisco · 6 (iconos) sí · 5 (pegatina) mejorable · 2 y 3 descartados (no cortar la palabra).
- **Dirección visual elegida:** estructura Vinilo + Biblioteca Laritazz + mascota animada.

### Qué aprendí
- Una licencia de fuente decide dónde puedo usarla: diseño no es lo mismo que web pública.
- `.gitignore` protege lo que no debe subirse.
- SVG a mano: rutas, `fill-rule`, trazos con unión redonda para suavizar esquinas.

---

## Sesión 3 · 29 sep 2026 · Sprint 1: base y biblioteca

### Qué hicimos
| Paso | Resultado |
|---|---|
| Lógica portada del HTML original | `lib/claves`, `lib/armonia`, `lib/color`, `lib/traktor`, con 8 pruebas en Vitest |
| Marca en componentes | `Logo`, `Mascota` (forma, cara y fondo vivos) y `Vinilo` |
| Estructura Vinilo | Barra lateral con secciones y mis sets, rejilla central, panel «Sonando» |
| Importar Traktor | `collection.nml` leído en el navegador: 9.714 temas en menos de 1 s, guardado en IndexedDB |
| Demo pública | 153 temas de mis sets LN y PRIDE, solo metadatos (`scripts/demo.py`) |
| Icono definitivo | Eco + Guiño (`icono-c1-eco-guino.svg`), ya es el favicon |
| Publicación | Las Actions pasan pruebas y lint antes de compilar |

### Decisiones
- **Privacidad:** mi colección completa no va al repo. Se importa en el navegador y se queda allí.
- **La URL guarda la vista** (`?q`, `?franja`, `?orden`, `?tema`): se comparte un enlace y se ve lo mismo; el botón Atrás funciona.
- **HashRouter:** GitHub Pages no sabe de rutas; con `#/set/p1` todo funciona sin configurar el servidor.
- **La mascota cambia de cara con el ánimo** (Calma, Feliz, Guiño, Sorpresa, Euforia) y el fondo toma el color del BPM.
- **Organización por funcionalidad** (`features/biblioteca`) en vez de por tipo de archivo: todo lo de la biblioteca vive junto.

### Qué aprendí
- **`useContext` + proveedor:** una fuente única de datos para toda la app, sin pasar props de mano en mano.
- **`useReducer` no hizo falta:** con dos `useState` bastaba. Elegir la herramienta mínima.
- **`useEffect` para sincronizar con el exterior:** leer IndexedDB al arrancar y limpiar al desmontar.
- **`useRef` para lo que no se pinta:** el motor de la mascota vive en una ref; solo se publica una foto por fotograma.
- **`requestAnimationFrame`:** animación al ritmo de la pantalla, pausada si el sistema pide menos movimiento.
- **`useSyncExternalStore`:** escuchar `prefers-reduced-motion` como un dato más de React.
- **`useDeferredValue`:** el buscador responde al instante y la rejilla se pone al día después.
- **`memo`:** con miles de tarjetas, solo se repinta la que cambia.
- **Carga progresiva con `IntersectionObserver`:** 60 tarjetas y más cuando te acercas al final.
- **Ajustar estado durante el render** en vez de un efecto (cerrar el menú al navegar).
- **Hooks propios** (`useMascota`, `useProgresivo`): lógica reutilizable con nombre propio.
- **Pruebas:** una prueba falló y descubrí que la regla de Abre/Cierra estaba bien y la prueba no. Probar también enseña las reglas.

## Sesión 4 · 29 sep 2026 · Tap, escucha y Radio

### Qué hicimos
| Paso | Resultado |
|---|---|
| Mascota del lienzo en React | `MascotaEscena`: cuerpo del color del BPM, cara negra, halo, anillo de ecualizador y drop |
| Tap BPM | Toca la pantalla al ritmo; cada toque es un latido. Descarta toques perdidos y mide la estabilidad |
| Escucha por micro | 12 s de audio → BPM y clave calculados en el móvil. El audio no se guarda |
| Radio | Mis 15 sesiones de SoundCloud suenan dentro de RGBPM, con sus portadas reales |
| BPM de cada sesión | Se lee de la descripción («136–145 BPM») y sube a medida que avanza el set |
| Atajo móvil | Botón «Tap BPM» siempre a mano en la cabecera |

### Decisiones
- **SoundCloud:** el reproductor oficial (Widget) no necesita claves. Para buscar cualquier tema hace falta la API con Artist Pro, y su secreto vive en un servidor (Supabase), nunca en la web.
- **Shazam no tiene API web.** Para cazar temas: AudD o ACRCloud, también a través de Supabase.
- **Análisis de audio propio** en vez de una librería de 2 MB: FFT, cromagrama y perfiles de Krumhansl. Más ligero y lo entiendo entero.
- **Dos mascotas:** la negra sobre color para el icono y el vinilo; la del lienzo, a color, para las pantallas de escucha.

### Qué aprendí
- **Web Audio:** `getUserMedia` abre el micro, un `AnalyserNode` da el volumen en directo y un **AudioWorklet** recoge el audio en su propio hilo sin bloquear la interfaz.
- **FFT:** convierte el sonido en frecuencias. Con las frecuencias saco las 12 notas (cromagrama) y comparo con el «perfil» de cada tonalidad.
- **Autocorrelación:** para el BPM busco cada cuánto se repiten los golpes.
- **Integrar un reproductor de terceros:** cargar su script una sola vez, escuchar sus eventos (`PLAY`, `PAUSE`, `PLAY_PROGRESS`) y soltarlos al salir.
- **`e.timeStamp`** de un evento comparte reloj con `requestAnimationFrame`: así el latido cae justo en el toque.
- **Pruebas con audio sintético:** genero un bombo a 128 y unos acordes en La menor para comprobar que el análisis acierta.
