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

## Sesión 12 · 30 sep 2026 · Inicio y mascota viva

### Qué hicimos
| Paso | Resultado |
|---|---|
| Inicio en rosa (`/`) | La mascota en el centro de un racimo de círculos. Los negros son las secciones; el resto, adornos |
| Entrar en negro | Al tocar un círculo, se abre en negro hasta cubrir la pantalla y entras en la sección |
| Volver en rosa | El logo (y la mascota de las pestañas en el móvil) abre un círculo rosa y vuelve al inicio |
| Biblioteca a `/biblioteca` | El inicio ocupa `/`; en el inicio no hay menú lateral ni pestañas: los círculos son el menú |
| Mascota viva | En pausa se duerme (ojos cerrados, respira); al sonar se despierta. Parpadea, mira alrededor y se mece. En el inicio mira el círculo que tocas |
| Mascota más ligera | Las pequeñas ya no provocan un render de React por fotograma: el motor escribe directo en el SVG |
| Carga por pantalla | Tap, Radio, Armonía y Sets se descargan al abrirlas; el inicio las precarga al pasar por su círculo |
| Transición entre pantallas | Cada pantalla entra con un fundido corto; si la descarga tarda, aparece la mascota |
| Textos | Fuera explicaciones largas y repeticiones (Armonía, Sets, Radio, ajustes de música) |
| Juego | Sección nueva en el menú («Pronto») |
| Probado | 63 pruebas; todas las rutas en escritorio y móvil, sin errores ni desbordes |

### Decisiones
- **El racimo se calcula, no se dibuja a mano:** cada círculo se apoya en dos que ya están y busca el hueco libre más cercano al centro (`lib/burbujas.js`). Se adapta a la forma de la pantalla.
- **La transición vive fuera de React:** el círculo se pinta en el `body` para sobrevivir al cambio de pantalla y fundirse cuando la nueva ya está debajo.
- **Mascota plana en el inicio:** negra, sin eco, como los círculos que la rodean.

### Qué aprendí
- **`React.lazy` + `Suspense`:** cada pantalla es un archivo aparte que se descarga al usarla; `Suspense` enseña algo mientras llega. El `import()` se puede lanzar antes (al pasar el ratón) y el navegador lo guarda.
- **Animar sin renders:** con refs y `setAttribute` el bucle cambia el SVG directamente. React solo vuelve a pintar cuando cambia algo de verdad (el ánimo, dormir o despertar).
- **`key` para reiniciar una animación:** el contenedor de la página lleva `key={pathname}`; al cambiar de ruta se monta de nuevo y su animación de entrada vuelve a sonar.
- **`clip-path: circle()` animado** con la Web Animations API: el círculo crece desde donde tocas.
- **Consultas de contenedor (`cqw`, `cqh`):** los círculos y sus textos se miden respecto al racimo, no a la ventana.
- **Propiedades de transformación sueltas (`scale`, `translate`):** dos animaciones a la vez en el mismo elemento sin pisarse.

## Sesión 13 · 30 sep 2026 · Iconos y rueda vinilo

### Qué hicimos
| Paso | Resultado |
|---|---|
| Iconos de sección | Disco en su funda (Biblioteca), rueda (Armonía), lista con nota (Sets), micro (Escuchar), mando (Juego), ondas (Radio), faders (Mezclador). En el inicio, el menú lateral y las pestañas |
| Inicio sin adornos | Solo la mascota y las secciones; lo que aún no está sale algo apagado |
| Inicio a pantalla completa | Los círculos se inflan hasta llenar la zona: apaisado en escritorio, alto en el móvil, sin scroll. Se recalcula al girar el móvil o estirar la ventana |
| Rueda vinilo | Mayores en el surco de fuera, menores en el de dentro. El set es la ruta de la aguja por los surcos (nunca cruza el disco) y una aguja la recorre en bucle. La galleta lleva la mascota y el color del BPM de salida; los reflejos giran al tempo |
| Una sola lista de secciones | `app/secciones.js`: nombre, ruta, icono y tamaño en el inicio, compartida por el inicio y el menú lateral |

### Decisiones
- **Estilo de la rueda: Vinilo** (dirección A del prototipo). Las otras dos (Secuenciador y Onda) quedan en el prototipo por si se quieren recuperar.
- **Inflar en vez de escalar:** un racimo escalado deja las esquinas vacías; inflado, cada círculo crece empujando a los demás hasta tocar los bordes.

### Qué aprendí
- **`ResizeObserver` en un hook (`useMedida`):** mido la zona libre y React vuelve a calcular el racimo solo cuando cambia de verdad.
- **Relajación:** repetir «empuja lo que se pisa, mete dentro lo que se sale» hasta que todo encaja. Es un bucle pequeño y se puede probar sin navegador.
- **`<animateMotion>`:** un elemento de SVG que mueve otro a lo largo de un camino, sin JavaScript.
- **Componentes como datos:** en la lista de secciones, `Icono` es el propio componente; se pinta con `<s.Icono />`.

## Sesión 14 · 30 sep 2026 · Cartel vivo y primer juego

### Qué hicimos
| Paso | Resultado |
|---|---|
| Inicio como cartel | Círculos negros de tamaños muy distintos, algunos cortados por el borde (referencias: *Particle Playground*, *Musica Viva*, *Size matters*) |
| Tinta líquida | Los círculos que se acercan se funden como gotas; unas gotas pequeñas van y vienen. El borde es irregular, como mi tipografía |
| Tamaño = tus datos | Cada círculo crece con lo que usas: temas, tonos, sets, cazados, récord del juego, temas con audio. Y lo dice dentro («153 temas», «Récord 295») |
| Resumen en vivo | Bajo el logo: temas, tonos y rango de BPM de tu colección |
| Iconos de puntos | Cuatro discos, rueda de puntos, gotas encadenadas, ondas, dado, emisión y faders: el mismo lenguaje que los círculos |
| Juego (`/juego`) | Cuatro juegos; el primero ya se juega |
| Adivina el BPM (`/juego/bpm`) | 5 rondas repartidas por todo tu rango de BPM. Suena tu tema (archivo o fragmento privado) o, si no hay audio, un ritmo sintetizado. Tocas la mascota, dices «Listo» y te puntúa; vale doble o medio tempo. La mascota reacciona (euforia si lo clavas). Récord guardado |
| Probado | 81 pruebas; partida completa en el navegador (295/500) y el récord aparece en el inicio |

### Decisiones
- **Composición a mano, tamaño por datos:** dos composiciones (apaisada y vertical) diseñadas como un cartel; los datos solo escalan cada círculo entre el 82 % y el 112 %, para que nunca se rompa.
- **El juego suena aparte del reproductor:** si usara la barra de abajo, chivaría el título.
- **El récord va en el navegador (IndexedDB).** Un ranking compartido necesitaría una tabla en Supabase.

### Qué aprendí
- **Metaballs con SVG:** `feGaussianBlur` (desenfoca) + `feColorMatrix` (umbral en la transparencia) = formas que se unen al acercarse. `feTurbulence` + `feDisplacementMap` = borde imperfecto.
- **Texto que cabe:** calculo el tamaño de letra con el ancho del círculo y el número de letras; si no cabe, el dato se esconde.
- **Web Audio con reloj propio:** los golpes se programan por adelantado con `ctx.currentTime`; un `setInterval` solo rellena la cola. Suena exacto aunque la pantalla vaya lenta.
- **Un hook que limpia al salir:** `useSonido` para el audio al desmontarse (`useEffect(() => parar, [parar])`).

## Sesión 15 · 2 oct 2026 · Letras propias y cinco juegos

### Qué hicimos
| Paso | Resultado |
|---|---|
| Tipografía RGBPM Letras | Sacada del logo: R, G, B, P y M tal cual; el resto con su misma construcción (bloques gruesos, contraformas rectas, vértices torcidos a mano). A–Z, Ñ, acentos, cifras y signos. 2 KB en woff2 |
| Dónde se usa | Nombres del inicio y de Juego, menú lateral, títulos y veredictos de los juegos |
| Iconos de gotas | Puntos que se unen con un cuello, como dos gotas al tocarse: 7 de sección y 5 de juegos, todos con el mismo dibujo |
| Tamaño por uso | Cada visita a una sección cuenta y vale la mitad cada semana. Lo que usas crece; lo que dejas, encoge solo |
| Menú de Juego como cartel | El mismo cartel del inicio al revés: fondo negro, círculos rosas, mascota rosa |
| Cuatro juegos nuevos | ¿Pega o choca? (qué salto armónico hay), ¿Dónde cae? (toca el tono en la rueda), ¿Cuál corre más? (cada ronda más fina), Cuadra el tempo (pitch hasta que palmas y bombo caen juntos) |
| Sin audio también se juega | El ritmo de prueba toca además el acorde y el bajo de la clave del tema |
| Récords en Supabase | Tabla `puntuaciones` con RLS (`servidor/supabase/puntuaciones.sql`). Si has entrado con tu cuenta, cada partida se apunta en la nube y gana el mejor récord de los dos sitios |
| Probado | 104 pruebas; las cinco partidas jugadas enteras en el navegador; inicio y Juego en escritorio y móvil |

### Decisiones
- **La tipografía es solo de mayúsculas,** como el logo: las minúsculas usan las mismas letras. Urbanist sigue para textos largos.
- **Los vértices se tuercen con la letra ya montada,** no pieza a pieza: así cada letra es una sola forma cortada a mano, sin escalones.
- **Tamaño por uso con caducidad,** no por contenido: el inicio refleja lo que usas ahora.
- **Una partida apuntada no se toca:** la tabla no tiene políticas de cambiar ni borrar.
- **En ¿Cuál corre más? las mascotas no bailan hasta responder:** si no, se vería el tempo.

### Qué aprendí
- **Una fuente es código:** con `fontTools` y `skia-pathops` dibujo cada letra con cajas, las uno, les resto los huecos y genero el woff2 con un script (`scripts/fuente.py`).
- **`@font-face` + `preload`:** la fuente se descarga antes que el CSS la pida, así el menú no parpadea.
- **Componentes como datos:** cada icono es una lista de puntos y uniones; el componente `Gotas` los dibuja.
- **Un componente para dos pantallas:** el cartel ya no es de la home; recibe composición, colores (variables CSS) y elementos.
- **Un hook para lo común:** `usePartida` lleva rondas, puntos y récord; cada juego solo dice cómo se crean sus rondas y cómo se puntúa.
- **Eventos propios del navegador:** al apuntar una visita disparo `rgbpm:uso` y el inicio se entera sin recargar.
- **RLS en Supabase:** la base de datos decide quién lee y escribe cada fila (`user_id = auth.uid()`), no la web.

## Sesión 16 · 2 oct 2026 · Color v2, música para todos y sistema documentado

### Qué hicimos
| Paso | Resultado |
|---|---|
| Franjas con datos reales | Medí los 10.554 temas de mi colección: mediana 125, la mitad entre 115 y 138. Nuevos cortes: violeta < 110 · turquesa 110–124 · oliva 124–132 · amarillo 132–150 · carmesí ≥ 150 |
| Color de la clave | Cada tono tiene color: el número Open Key recorre el círculo cromático. Menores oscuras, mayores claras; la relativa, mismo tono con más luz |
| Tempo + tono = un color | Tarjetas, muestras y portadas de set son un degradado del BPM a la clave. Filtros y leyendas, planos |
| Mascota alineada | Un ánimo y una forma por franja: el asterisco entero llega en el carmesí |
| La lava es la mascota | En el inicio y en Juego, el cuerpo de tinta toma su forma (disco o asterisco) y late con ella: ya no se pierde |
| Previas de Apple Music | Tercera fuente de audio, pública y legal: 30 s con enlace a Apple Music. 112 de los 153 temas de la demo suenan para cualquiera |
| Solo sale lo que suena | Biblioteca «Con audio / Todos»; set sugerido, Pegan, compatibles, radio y juegos usan solo temas con audio |
| Documentación | `docs/SISTEMA.md`, `docs/ARQUITECTURA.md`, `docs/DECISIONES.md`, `docs/PRODUCTO.md` |
| Guía de estilo viva | `/#/sistema`: franjas con el % de tu biblioteca, escala, colores de clave, degradados, tipografía, iconos, mascota |
| Probado | 114 pruebas; todas las rutas en escritorio y móvil sin errores ni desbordes |

### Decisiones
- **Los cortes salen de datos, no de la intuición:** cada franja guarda entre el 12 y el 25 % de la música.
- **Apple y no Deezer ni Spotify:** Apple tiene CORS y no pide claves; Deezer no deja llamarla desde el navegador y Spotify ya no da previas a apps nuevas.
- **Mejor sin previa que con otra canción:** si el parecido del título y el artista baja del 60 %, el tema no suena.
- **Con menos de 12 temas con audio se sugiere de toda la biblioteca:** si no, las sugerencias se quedarían vacías.

### Qué aprendí
- **Diseño con datos:** un histograma de mi colección decidió la escala de color.
- **HSL en código:** una fórmula reparte 12 tonos por el círculo; luz y saturación separan menores de mayores.
- **CORS:** el navegador solo deja leer otra web si esa web lo permite (`Access-Control-Allow-Origin`). Lo comprobé con `curl -I` antes de programar.
- **Una fuente más sin tocar las pantallas:** el reproductor pide «la dirección de este tema» y `MusicaContext` decide de dónde sale. Añadir Apple fue cambiar un sitio.
- **Datos derivados en el contexto:** `audibles` se calcula una vez (`useMemo`) y lo usan todas las pantallas.
- **Documentación viva:** la guía `/sistema` importa las mismas funciones que la interfaz; si cambio un color, la guía cambia.
