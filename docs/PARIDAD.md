# Paridad con RGBPM original

Todo lo que ya tenía mi web original (`RGBPM.html`) y su estado en la versión React.
Regla: nada se pierde; cada utilidad vuelve igual o mejor.

| Leyenda | |
|---|---|
| ✅ | Hecho en React |
| 🟡 | A medias |
| ⏳ | Pendiente |
| ✨ | Nuevo (no existía) |

## Biblioteca
| Utilidad | Estado | Dónde / nota |
|---|---|---|
| Importar `collection.nml` de Traktor (BPM, clave, playlists) | ✅ | Barra lateral · se guarda en IndexedDB |
| Descartar samples, loops, logos y vídeos | ✅ | `lib/traktor.js` al importar |
| Conectar carpeta de música y que suene | ✅ | «Tu música» · recuerda el permiso en Chrome |
| Buscar por título, artista y clave | ✅ | Acepta Open Key y Camelot |
| Filtro por franja de BPM (color) | ✅ | |
| Filtro por varias claves a la vez | ⏳ | |
| Filtro por rango de BPM y de duración | ⏳ | |
| Vista lista y vista tarjetas | 🟡 | Solo tarjetas Pantone |
| Ordenar por BPM, clave, título, set | ✅ | |
| Marcar en bloque → añadir al set, a la radio, borrar | ⏳ | |
| Importar carpeta de audio y analizar BPM y clave | ⏳ | El motor ya existe (`lib/tempo`, `lib/tonalidad`) |
| Duplicados: escanear carpeta y biblioteca, juntar | ⏳ | |
| Limpiar títulos (número de pista, artista en el título) | ⏳ | |
| Quitar temas sin archivo | ⏳ | |
| Copia de seguridad JSON (exportar e importar) y CSV | ⏳ | |
| Vaciar biblioteca | 🟡 | «Volver a la demo» |

## Set
| Utilidad | Estado | Dónde / nota |
|---|---|---|
| Montar un set con nombre | ✅ | Nombre editable en la cabecera |
| Guardar, cargar y borrar sets | ✅ | Pestaña «Guardados», con portada Pantone generada |
| Salud del set (transiciones, nota, choques, saltos) | ✅ | Y además la **curva de energía** coloreada por categoría |
| Reordenar automáticamente + deshacer | ✅ | Deshacer vale para **cualquier** cambio, no solo el reordenado |
| Exportar `.nml`, `.m3u`, TXT y CSV | ✅ | Probado ida y vuelta: exportar → importar |
| Importar un set desde archivo | ✅ | `.nml` de Traktor, `.m3u` y `.txt` |
| Cargar una playlist de Traktor como set | ✅ | Pestaña «Playlists» |
| Arrastrar para reordenar | ✅ | Con animación; en móvil, botones subir/bajar |
| Ancla: qué meter justo después de un tema | ✅ | ◎ en cada fila o en la curva |
| Cambiazo: otro tema del mismo tono y BPM | ✅ | ⇄ en cada fila |
| Compatibles con el tema ancla | ✅ | Pestaña «Pegan» |

## Armonía
| Utilidad | Estado | Dónde / nota |
|---|---|---|
| 7 categorías (Clavado, Subidón, Sube, Baja, Tercera, Abre, Cierra) | ✅ | `lib/armonia.js`, con pruebas |
| «Corregir desfase» de la hoja original | ✅ | Interruptor en Armonía; vale para toda la app (salud, reordenar, «Pegan», radio) |
| Rueda armónica grande e interactiva | ✅ | `/armonia` · tocas un tono y se encienden los que pegan; la línea es el set sugerido |
| Tolerancia de BPM ajustable | ✅ | ±2 a ±16 %, cuenta doble y mitad; vale para toda la app |
| Set sugerido desde una clave → «Usar este set» | ✅ | Con «Usar este» por paso y «Otras canciones»; **mejor que el original:** el camino esquiva claves sin temas a tu tempo |
| Notación Open Key / Camelot a elegir | ✅ | Y además «Tono» (Am, F…); cambia en toda la app |
| «Qué pega con…» por categoría, con tus temas | ✅ | Pestaña en Armonía, ordenados por cercanía al BPM |

## Radio
| Utilidad | Estado | Dónde / nota |
|---|---|---|
| Suena sola con fundido cruzado | ✅ | 10 s, curva de igual potencia |
| Generador por clave, BPM, subida y largo | ✅ | Portado tal cual |
| Siguiente con fundido, pausa | ✅ | |
| Añadir temas a mano a la cola | 🟡 | «Escuchar el set» lo pone como radio; «Guardar como set» al revés |
| Vista lista y mosaico por tono | 🟡 | Solo lista |

## Mezclador (dos canales)
| Utilidad | Estado | Dónde / nota |
|---|---|---|
| Dos platos con ondas, play, posición | ⏳ | |
| SYNC de tempo y keylock | ⏳ | |
| Hotcues (y borrar), bucles ½ / ×2, saltos | ⏳ | |
| EQ, filtro y volumen por canal | ⏳ | |
| Crossfader (doble clic al centro) | ⏳ | |
| Mezcla automática (cuadra tempo y compás) | ⏳ | |
| Versión lite | ⏳ | |

## Nuevo en React
| Utilidad | Estado |
|---|---|
| Mascota viva (forma, cara y color según BPM) | ✨ |
| Portadas Pantone (color = BPM) | ✨ |
| Tap BPM (con ×2 / ÷2 y guardar) | ✨ |
| Escucha continua tipo Shazam: para sola cuando está segura | ✨ |
| «¿Es uno de tus temas?» por clave y BPM | ✨ |
| Cazados: historial de escuchas | ✨ |
| Móvil: pestañas con la mascota, mini reproductor y pantalla completa | ✨ |
| Audio privado: login, fragmentos anónimos de 90 s y enlaces que caducan | ✨ |
| Todo el estado de la vista en la URL (compartible) | ✨ |
| La mascota es el play en «Sonando» | ✨ |
| Instalable en el móvil (PWA), sin barras del navegador | ✨ |
| Isla flotante en el móvil: se encoge al bajar | ✨ |
