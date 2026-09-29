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

### Qué aprendí
- Una licencia de fuente decide dónde puedo usarla: diseño no es lo mismo que web pública.
- `.gitignore` protege lo que no debe subirse.
- SVG a mano: rutas, `fill-rule`, trazos con unión redonda para suavizar esquinas.

---
