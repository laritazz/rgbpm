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
| Montar un set con nombre | ⏳ | |
| Guardar, cargar y borrar sets | ⏳ | |
| Salud del set (saltos de clave y BPM) | ⏳ | |
| Reordenar automáticamente + deshacer | ⏳ | |
| Exportar `.nml`, `.m3u`, TXT y CSV | ⏳ | |
| Importar un set desde archivo | ⏳ | |
| Compatibles con el tema ancla | 🟡 | Panel «Mezcla con» de la biblioteca |

## Armonía
| Utilidad | Estado | Dónde / nota |
|---|---|---|
| 7 categorías (Clavado, Subidón, Sube, Baja, Tercera, Abre, Cierra) | ✅ | `lib/armonia.js`, con pruebas |
| «Corregir desfase» de la hoja original | 🟡 | Activado siempre; falta el interruptor |
| Rueda armónica grande e interactiva | 🟡 | Hay rueda mini en el panel |
| Tolerancia de BPM ajustable | ⏳ | Fija en ±8 % |
| Set sugerido desde una clave → «Usar este set» | ⏳ | |
| Notación Open Key / Camelot a elegir | ⏳ | Se muestran las dos |

## Radio
| Utilidad | Estado | Dónde / nota |
|---|---|---|
| Suena sola con fundido cruzado | ✅ | 10 s, curva de igual potencia |
| Generador por clave, BPM, subida y largo | ✅ | Portado tal cual |
| Siguiente con fundido, pausa | ✅ | |
| Añadir temas a mano a la cola | ⏳ | |
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
