# RGBPM · Brief de producto

> **Copia congelada del 6 oct 2026.** La versión viva está en Notion (privado): [01 — Producto](https://app.notion.com/p/3f1c9362e7c681b1ae89e75597c7ffa3). No edites este archivo: los cambios van en Notion.

_v1 · 28 sep 2026_

## En una frase
RGBPM ordena tu biblioteca musical y te ayuda a montar sets que suenan bien juntos, por **tono y tempo**, sin abrir el software de DJ.

## Problema
| Dolor | Hoy |
|---|---|
| Biblioteca desordenada | Duplicados, el mismo tema con claves distintas, BPM o tono vacíos |
| Montar un set cuesta | Hay que saber teoría armónica o ir probando a oído |
| Probar una mezcla es pesado | Abrir Traktor, conectar la controladora, cargar platos |

## Para quién
1. **Yo (Lara · Laritazz):** DJ con Traktor que prepara sets y bolos.
2. **DJs que empiezan:** no saben qué pega con qué ni cómo ordenar un set.

## Las 3 tareas que tienen que ser perfectas
| # | Tarea | Qué significa «perfecto» |
|---|---|---|
| 1 | **Ordenar y limpiar** la biblioteca importada | Detecta duplicados y claves contradictorias; respeta el análisis del software de DJ |
| 2 | **Recomendar** siguiente tema y sets | Relaciones armónicas de mi hoja + BPM ±6 % + curva de energía |
| 3 | **Probar** una mezcla en directo | 2 platos, sync y crossfader en el navegador con mis archivos locales |

## Decisiones de criterio
- **No medimos tono ni BPM nosotros al principio:** usamos el análisis de Traktor (es el bueno). Detectarlo desde el audio es difícil; queda como fase futura.
- **La música nunca se sube:** en la nube solo metadatos. El audio se reproduce desde el propio equipo.
- **Color = BPM (sistema RGBPM de Laritazz):** cuanto más suben los BPM, más cálido el color. 100–120 violeta · 120–132 turquesa · 132–153 verde oliva · 153–168 amarillo · 168–213 carmesí. Sets y temas se leen como paletas.
- **El tono se ve en la rueda:** posición en la rueda Open Key, no color. Rosa de marca para el tono activo; blanco para los compatibles.
- **Portadas Pantone:** muestra de color arriba, etiqueta blanca abajo (título, BPM, LaritaZZ). Componente central de la interfaz.
- **Mascotas:** el Disco (el tono) y el Asterisco (el pulso) acompañan bienvenida, análisis, consejos, match, set guardado y estados vacíos.
- **Marca:** negro, blanco y rosa Laritazz; tipografía Codec Pro (Extra Bold + Light). El verde nunca en botones ni acciones principales.

## Alcance
| Ahora (MVP) | Después | Idea / negocio |
|---|---|---|
| Importar `collection.nml` (Traktor) | rekordbox XML, Serato | Controladoras por Web MIDI |
| Limpiar y recomendar | Loops en el mezclador | Planes de pago si hay mercado |
| Mezclador de 2 platos local | Compartir sets (Supabase) | Análisis propio del audio |
| | Exportar set a playlist de Spotify | |

## Spotify: dónde encaja (y dónde no)
- Spotify **Mix** ya ordena playlists por BPM y tono (*Smart Reorder*, feb 2026).
- Spotify Premium funciona dentro de rekordbox, Serato y djay desde sept 2025, **solo para uso personal, no en sesiones públicas**.
- La API pública de Spotify dejó de dar BPM y tono a apps nuevas (nov 2024).
- **Encaje realista:** RGBPM crea la playlist del set en tu Spotify → la practicas en casa con tu software → en el bolo pinchas tus archivos propios.

## Riesgos
| Riesgo | Respuesta |
|---|---|
| Derechos de la música | Solo metadatos; portadas generadas |
| Datos personales (RGPD) | Servidor en la UE + aviso de privacidad |
| Marcas de terceros | «Compatible con Traktor», sin logos ajenos |
| Depender de Spotify | Es un extra, no el núcleo |

## Métricas para saber si funciona
- Temas limpios / temas importados.
- % de transiciones recomendadas que acabo usando en un set real.
- Tiempo en montar un set (antes vs. después).
