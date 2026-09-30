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

## Sesión 5 · 29 sep 2026 · La biblioteca suena

### Qué hicimos
| Paso | Resultado |
|---|---|
| Reproductor único | Barra abajo en toda la app; el vinilo y las tarjetas saben qué suena |
| Fuente 1 · carpetas | Eliges tus carpetas una vez (Chrome/Edge recuerdan el permiso). Cada tema de Traktor encuentra su archivo |
| Fuente 2 · servidor | Subes por FTP; RGBPM lee por https con `rgbpm-indice.json` y un `.htaccess` que genera la app |
| Ventana «Tu música» | Cuántos temas tienen archivo, carpetas, servidor y descargas, en un `<dialog>` nativo |
| Probado | Colección real importada + servidor de pruebas: suena, avanza y lo recuerda al recargar |

### Decisiones
- **Fuera la API de SoundCloud:** para lo que quiero (mi música en mi app) no compensa.
- **Buscar por nombre de archivo, no por ruta:** mi música está repartida entre el disco del Mac, el externo e iTunes. Si hay nombres repetidos, gana el que comparte más carpetas.
- **Índice en vez de listar el servidor:** la carpeta queda oculta (`Options -Indexes`) y la app sabe qué hay gracias al índice.
- **`.htaccess`:** solo RGBPM puede leer la música y se cortan los enlaces directos desde otras webs.
- **Aviso legal:** música comercial en una dirección pública es distribución. Carpeta oculta ahora; almacenamiento privado con login más adelante.

### Qué aprendí
- **File System Access API:** `showDirectoryPicker` da acceso a una carpeta; el «handle» se guarda en IndexedDB y el permiso se recupera con un clic.
- **`URL.createObjectURL`:** convierte un archivo local en una dirección que el `<audio>` entiende. Hay que soltarla al cambiar de tema.
- **CORS:** el navegador solo deja leer archivos de otro dominio si ese servidor lo autoriza con una cabecera.
- **Contextos separados por ritmo de cambio:** el tiempo de reproducción cambia 4 veces por segundo y va en su propio contexto, así no se repintan las 10.000 tarjetas.
- **`useRef` para evitar funciones que cambian:** `reproducir` lee el tema actual de una ref y se mantiene estable.
- **Carreras asíncronas:** si pulso dos temas seguidos, un contador de peticiones hace que gane el último.
- **`<dialog>` nativo:** foco, tecla Esc y fondo oscuro sin librerías.

## Sesión 6 · 29 sep 2026 · Radio con mi música

### Qué hicimos
| Paso | Resultado |
|---|---|
| Radio de la biblioteca | Sustituye a SoundCloud. Elijo clave, BPM, cuánto sube y cuántos temas; suena sola |
| Generador portado | La misma lógica de RGBPM original: encadena por mis 7 categorías y reparte la subida de BPM |
| Fundido de 10 s | Dos platos que se cruzan con curva de igual potencia |
| Sin repetidos | La radio no pone dos veces el mismo artista y título |
| Probado | 8 temas de prueba: arranca, funde, avanza y «Siguiente» salta con fundido |

### Decisiones
- **Fuera SoundCloud del todo:** la radio es mi biblioteca.
- **Servidor privado, en pausa hasta decidir:** fragmentos de ~60 s desde el primer cue, nombres anónimos, carpeta fuera de la web, login y enlaces que caducan.

### Qué aprendí
- **Dos `<audio>` y una ref que dice cuál manda:** los eventos del plato que sale se ignoran.
- **`setInterval` en vez de `requestAnimationFrame`** para el fundido: el segundo se para con la pestaña en segundo plano.
- **Curva de igual potencia** (seno y coseno): a mitad del fundido no hay bajón de volumen.
- **Pruebas con azar controlado:** paso una función aleatoria fija para que el test dé siempre lo mismo.

## Sesión 7 · 29 sep 2026 · Móvil y escucha

### Qué hicimos
| Paso | Resultado |
|---|---|
| Pestañas en el móvil | Biblioteca · Radio · **mascota = Escuchar** · Sets · Más |
| Mini reproductor → pantalla completa | Mascota bailando, tiempo, play, siguiente, drop y «Mezcla con». Se cierra deslizando hacia abajo |
| Escucha continua | Primera lectura a los 6 s, afina cada 2 s y para sola cuando 3 lecturas coinciden; drop de la mascota al fijarla |
| Web Worker | La FFT va en otro hilo: la animación no se traba |
| «¿Es uno de tus temas?» | Busca en mi biblioteca por clave y BPM (±2 %) con play directo |
| Cazados | Historial de escuchas y taps, guardado en el dispositivo |
| Paridad | `docs/PARIDAD.md`: cada utilidad de mi web original y su estado |

### Decisiones
- **Fragmentos de 90 s** para el servidor: la colección entera ocupa ~102 GB y el plan de IONOS tiene 50 GB. Con fragmentos son ~14 GB.
- **Al escuchar se pausa lo que suena en RGBPM**, para que el micro no se oiga a sí mismo.

### Qué aprendí
- **Web Workers con Vite:** `new Worker(new URL('./x.worker.js', import.meta.url), { type: 'module' })` y pasar el audio como *transferable* (sin copiarlo).
- **Ventana deslizante:** analizo siempre los últimos 14 s, no todo lo grabado.
- **Callbacks en refs:** el aviso de «terminado» cambia sin reiniciar la escucha.
- **`<dialog>` + gestos:** `setPointerCapture` para arrastrar y cerrar.
- **`env(safe-area-inset-*)`:** respeta la muesca y la barra de inicio del iPhone.

## Sesión 8 · 29 sep 2026 · Audio privado con login

### Qué hicimos
| Paso | Resultado |
|---|---|
| Diseño antes de programar | Contexto, datos, fallos, permisos, repeticiones y registro, por escrito |
| Script de fragmentos | En mi Mac: 90 s desde 8 compases antes del primer hotcue, sin etiquetas, nombre anónimo; se puede parar y seguir |
| Puertas PHP en IONOS | `firmar.php` (pregunta a Supabase quién soy y firma) y `audio.php` (sirve con Range si la firma vale) |
| Login en la app | Supabase Auth, cargado solo cuando hace falta; la sesión se recuerda |
| Fuera el «servidor público» | Solo quedan dos fuentes: carpeta (temas enteros) y privada (fragmentos) |
| Probado | Supabase falso + PHP local + la app: clave mala, sesión falsa, email ajeno, firma tocada, enlace caducado, `../` y Range |

### Decisiones
- **Sin Edge Functions:** IONOS pregunta directamente a Supabase (`/auth/v1/user`). Menos piezas.
- **El nombre del fragmento sale de la ruta de Traktor** (SHA-256): el script y la web lo calculan igual, sin lista de títulos en ningún sitio.
- **Firmas HMAC con caducidad:** un enlace copiado deja de valer a los 20 minutos.

### Qué aprendí
- **Autenticación ≠ autorización:** Supabase dice *quién* soy; `config.php` dice *si puedo*.
- **HMAC y `hash_equals`:** firmar sin guardar nada y comparar sin dar pistas por el tiempo de respuesta.
- **Range (206):** así el navegador salta dentro de un audio.
- **`import()` dinámico:** la librería de Supabase solo se descarga al usar el login.
- **Mismo código en navegador y Node:** `crypto.subtle` existe en los dos.

## Sesión 9 · 29 sep 2026 · Sets

### Qué hicimos
| Paso | Resultado |
|---|---|
| Todo el Set original | Nombre, guardar/cargar/borrar, salud, reordenar, exportar e importar |
| Curva de energía | El BPM tema a tema, cada tramo en el color de su categoría; los choques en discontinua |
| Portada Pantone del set | Franjas con los colores del set, de principio a fin |
| Arrastrar con animación | FLIP: cada fila viaja desde donde estaba |
| Deshacer universal | Cualquier cambio (añadir, mover, cambiar, cargar…) se deshace |
| Desde toda la app | «Al set» en la biblioteca, en «Sonando» y en «Mezcla con»; la radio se guarda como set |
| Probado | Playlist real → reordenado 77 % → 100 % sin choques → deshacer → exportar .nml → reimportar: 69/69 |

### Qué aprendí
- **`useReducer`:** cuando el estado tiene muchas formas de cambiar, cada una es una acción con nombre y el reducer es una función pura que se prueba sin navegador.
- **Historial en el reducer:** guardar el estado anterior en cada acción da un «Deshacer» para todo, casi gratis.
- **FLIP** (First, Last, Invert, Play): mido dónde estaba cada fila, dónde está ahora, y animo la diferencia con la Web Animations API.
- **Arrastrar y soltar nativo:** `draggable`, `dragover` y `drop`; en el móvil no existe, así que hay botones.
- **Exportar sin servidor:** `Blob` + enlace de descarga.

## Sesión 10 · 30 sep 2026 · Suena en el móvil

### Qué hicimos
| Paso | Resultado |
|---|---|
| Fragmentos de LN 27J | 79 de 79, subidos a IONOS; el script encuentra solo los temas movidos (Spotlight) |
| Demo con audio | Los temas sin ruta encuentran su fragmento por artista y título |
| «Sonando» en el móvil | La mascota es el play; todo cabe en pantalla, también con las barras del navegador |
| Instalable | «Añadir a pantalla de inicio» la abre como app, sin barras del navegador |
| Isla flotante | Mini reproductor y pestañas en una sola pieza; al bajar se encoge a la pestaña actual + lo que suena |
| Portfolio vivo | `estado.json` con sesiones y últimos commits; capturas y vídeos que se regeneran con `npm run capturas` |

### Qué aprendí
- **Diagnosticar antes de arreglar:** «sin archivo» podía ser un permiso de macOS o un tema movido. El script ahora distingue `EPERM` de `ENOENT`.
- **Una segunda llave anónima:** el servidor guarda `resumen(artista + título) → fragmento`, nunca el texto.
- **Flexbox que se adapta a la altura:** la mascota tiene `flex: 1 1 0` y el SVG va en `position: absolute` al 100 %: crece o encoge con el hueco libre.
- **Escuchar el scroll de toda la app:** el evento `scroll` no sube, pero se puede capturar (`capture: true`) en el contenedor de las páginas.
- **`ResizeObserver`:** mido la isla y publico su alto en una variable CSS; así ninguna página queda tapada.
- **`:has()` en CSS:** la isla cambia si dentro hay reproductor, sin una línea de JavaScript.
- **Web App Manifest:** `display: standalone`, iconos y `theme-color` convierten la web en app instalable (PWA).

## Sesión 11 · 30 sep 2026 · Armonía

### Qué hicimos
| Paso | Resultado |
|---|---|
| Rueda grande interactiva | 24 tonos como nodos: mayores fuera, menores dentro. Tocas uno y se encienden los que pegan, cada uno en el color de su categoría |
| Set sugerido desde una clave | Un tema mío por paso, enlazado por BPM; la línea rosa de la rueda dibuja ese mismo camino, con el número de cada paso |
| «Usar este» y «Otras canciones» | Cambio un tema en un paso y el resto se recalcula; «Otras canciones» da otra tirada |
| «Usar este set» | Lo que veo pasa tal cual a Sets, con nombre «Camino desde 1m» y un aviso; se puede deshacer |
| «Qué pega con…» | Las siete categorías con mis temas, ordenados por cercanía al BPM de salida |
| Notación Open Key / Camelot / Tono | Se elige en Armonía y cambia en **toda** la app: tarjetas, set, radio, «Sonando», Tap |
| Interruptor «corregir desfase» | Con él, Clavado es la relativa real (Am con C); sin él, las reglas tal cual mi hoja. Afecta a salud, reordenar, «Pegan» y radio |
| Margen de BPM ajustable | De ±2 a ±16 % (antes fijo en ±8 %); cuenta doble y mitad de tempo |
| Probado | 52 pruebas; en el navegador: tocar la rueda, fijar un tema, Camelot sin corregir, «Usar este set» → Sets con 8 de 8 y 100 % sin choques |

### Decisiones
- **El camino mira mi biblioteca.** En la original, el camino de claves era teórico y luego se buscaban temas: salían saltos de +35 BPM cuando una clave no tenía nada a mi tempo. Ahora clave y tema se eligen juntos; pesa más no romper el tempo (65 %) que la categoría (35 %).
- **Azar con semilla.** La misma tirada siempre da el mismo set: «Usar este set» guarda justo lo que veo.
- **Preferencias fuera de la URL.** Clave, BPM, pasos y pestaña van en la URL (se comparten). Notación, desfase y margen son míos y me acompañan por toda la app: van en un contexto y se guardan en el navegador.

### Qué aprendí
- **Contexto de preferencias:** `AjustesArmoniaContext` da a cualquier pantalla la notación y las reglas, y una función `etiqueta(clave)` que ya escribe «1m», «8A» o «Am».
- **Inicializar el estado con una función:** `useState(leerGuardados)` lee `localStorage` una sola vez, al montar, no en cada render.
- **Derivar en vez de sincronizar:** los temas fijados guardan para qué clave eran; si cambio de clave, se ignoran solos. Sin `useEffect` que los borre.
- **Subir el estado:** el set sugerido lo necesitan la rueda (la línea) y el panel (la lista), así que se calcula en el padre, `Armonia`, y baja a los dos.
- **`key` para reiniciar:** `<SetSugerido key={contexto}>` vuelve a empezar (filas cerradas, sin avisos) al cambiar de clave.
- **SVG accesible:** cada nodo es un `<g role="button" tabIndex={0}>` con `aria-label` y Enter/Espacio.
- **Dibujar una línea con CSS:** `pathLength="1"` + `stroke-dasharray: 1` y animar `stroke-dashoffset` de 1 a 0. Con `prefers-reduced-motion`, aparece sin animación.
- **Pasar datos al navegar:** `navigate('/sets', { state: { aviso } })` y en Sets `useLocation().state`.
