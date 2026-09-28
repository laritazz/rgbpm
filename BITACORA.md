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

### Ejercicio para la próxima sesión (lo escribo yo)
Crear el componente `Filtros` con dos botones, «Solo mayores» y «Solo menores», que filtren la biblioteca.
Pistas: un `useState` nuevo en `App` y un `filter` más.

---
