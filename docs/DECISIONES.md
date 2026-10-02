# RGBPM · Registro de decisiones

> Una línea por decisión: qué, por qué y qué descartamos. La más nueva, arriba.
> Formato corto de ADR (Architecture/Design Decision Record).

| # | Fecha | Decisión | Por qué | Descartado |
|---|---|---|---|---|
| 33 | 2 oct 2026 | Un choque de tono se llama **Contraste** y va en gris | Puede ser buscado; la app describe, no juzga | «Choca» en rojo |
| 32 | 2 oct 2026 | La notación se **pregunta la primera vez** («¿Con qué pinchas?») | Traktor usa Open Key; rekordbox y Serato, Camelot | Open Key fijo; Camelot fijo |
| 31 | 2 oct 2026 | Set sugerido de **hasta 40 pasos**; la subida total no pasa de ±24 BPM | Sets de 4–6 h; que un set largo no acabe a 180 | Elegir por duración |
| 30 | 2 oct 2026 | El set sugerido **puede quedarse en el tono** (Clavado); repetir resta 5 puntos cada vez | Hipnosis sin monotonía | Prohibir repetir; interruptor Viaje/Hipnosis |
| 29 | 2 oct 2026 | El **mezclador** empieza por **probar la transición** (final de uno + principio de otro) | Vera y Maddie quieren oír el cruce, no dos platos completos | Dos platos completos como primera versión |
| 28 | 2 oct 2026 | La sección «Escuchar» pasa a **Detectar** (modos Micro · Tap BPM) | «Escuchar» ya es la acción de reproducir | Cazar, Oído |
| 27 | 2 oct 2026 | El set sugerido tiene **forma de energía**: Mantiene · Sube · Baja (±1,5 BPM por paso) | Un set es un arco; plano solo sirve para un tramo | Dibujar la curva a mano (más adelante) |
| 26 | 2 oct 2026 | **Recorrido cognitivo con 5 proto-personas** mientras no hay DJs reales | Llegar al test real con lo obvio arreglado; sin inventar puntuaciones SUS | Esperar al test real; puntuar personas ficticias |
| 25 | 2 oct 2026 | **Test con 5 DJs** antes de tocar los pendientes de la heurística | Confirmar con personas antes de rediseñar: la jerga o el nombre «Escuchar» pueden no molestar | Arreglarlo todo por intuición |
| 24 | 2 oct 2026 | **Evaluación heurística** (Nielsen) en cada entrega grande | Detecta lo obvio barato y con método; 5 de 9 hallazgos resueltos en la misma sesión | Revisar «a ojo» |
| 23 | 2 oct 2026 | Método **Double Diamond en bucles cortos** | Cada sesión descubre usando y entrega publicando; el proyecto entero es el diamante grande | Fases largas con documento antes de prototipo |
| 22 | 2 oct 2026 | **Solo se sugiere lo que suena** (`audibles`) | Un set propuesto con temas mudos no sirve en cabina | Mostrar todo con un aviso |
| 21 | 2 oct 2026 | **Previas de Apple Music** como 3.ª fuente de audio | Legal y pública: la demo suena para cualquiera. Tiene CORS, sin claves | Deezer (sin CORS), Spotify (ya no da previas a apps nuevas), subir audio (derechos) |
| 20 | 2 oct 2026 | **El tono también tiene color** (rueda cromática por Open Key) y el tema es un degradado BPM → clave | El tempo y la armonía juntos son el producto; el color debe contarlo | Solo posición en la rueda (brief v1) |
| 19 | 2 oct 2026 | **Franjas recortadas con datos reales** (110 · 124 · 132 · 150) | Con 10.554 temas, el violeta se comía el 32 % y el rojo casi no salía | Cortes por género «de manual» |
| 18 | 2 oct 2026 | **Un ánimo de mascota por franja** | La cara cambia donde cambia el color: un solo sistema | Umbrales sueltos |
| 17 | 2 oct 2026 | **La lava del inicio toma la forma de la mascota** | Con temas rápidos el asterisco se perdía sobre el círculo | Círculo fijo |
| 16 | 2 oct 2026 | Guía de estilo **viva** en `/sistema` | Se pinta con el mismo código: no se desfasa | Solo un PDF o un Figma |
| 15 | 2 oct 2026 | Tipografía **propia** sacada del logo | Marca reconocible; pesa 2 KB; Codec no se puede distribuir | Otra fuente libre |
| 14 | 2 oct 2026 | Tamaño de los círculos **por uso** (½ por semana) | El inicio refleja lo que usas ahora | Por cantidad de contenido |
| 13 | 2 oct 2026 | Récords en **Supabase con RLS** y sin update/delete | Una partida apuntada no se toca; la base de datos decide quién lee | Guardar solo en el navegador |
| 12 | 30 sep 2026 | **Cartel** de composición fija, escalado por datos | Diseño de autor; los datos ajustan sin romperlo | Empaquetado automático (se veía genérico) |
| 11 | 30 sep 2026 | Carga **perezosa** por pantalla + precarga al señalar | Arranque más rápido sin esperas al entrar | Todo en un archivo |
| 10 | 30 sep 2026 | Mascota que anima **sin renders** (refs + setAttribute) | En el iPhone, 60 renders por segundo gastan batería | Estado de React por fotograma |
| 9 | 30 sep 2026 | Preferencias de armonía en un contexto + localStorage | Te acompañan por toda la app; la vista va en la URL | Todo en la URL |
| 8 | 29 sep 2026 | Fragmentos de 90 s anónimos (SHA-256) con enlaces HMAC de 20 min | Escuchar en el móvil sin publicar audio | Subir los temas a la web |
| 7 | 28 sep 2026 | **No medimos tono ni BPM** de la colección: usamos los de Traktor | Su análisis es el bueno | Análisis propio (queda para Escuchar) |
| 6 | 28 sep 2026 | JavaScript sin TypeScript | Primero aprender React | TypeScript desde el día 1 |
