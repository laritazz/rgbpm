# RGBPM · Proceso de diseño

> v1 · 2 oct 2026. Cómo diseño RGBPM, con pruebas de cada fase. Sirve para el portfolio (`CREATIVEZZ.md`).
> Relacionados: `PRODUCTO.md` (mercado) · `DECISIONES.md` (cada giro) · `SISTEMA.md` (lenguaje visual) · `PERSONAS.md` (recorrido con proto-personas) · `PRUEBA_USUARIOS.md` (test con DJs).

---

## 1 · El método en una frase

**Double Diamond en bucles cortos.** El proyecto entero es un diamante doble y cada sesión repite uno pequeño: uso la app, defino el problema, pruebo soluciones y publico. Luego vuelvo a usarla.

```
     DESCUBRIR        DEFINIR          DESARROLLAR       ENTREGAR
        ╱╲              ╱╲                ╱╲               ╱╲
       ╱  ╲            ╱  ╲              ╱  ╲             ╱  ╲
  ────<    >──────────<    >────────────<    >───────────<    >────
       ╲  ╱   brief    ╲  ╱   principios  ╲  ╱  prototipos ╲  ╱  web publicada
        ╲╱              ╲╱                ╲╱               ╲╱
   abrir: investigar  cerrar: elegir   abrir: probar     cerrar: publicar
                                                             │
                     ◄──────────── uso real + evaluación ────┘
```

| Fase | Pregunta | Qué uso |
|---|---|---|
| Descubrir | ¿Qué pasa de verdad? | Autoetnografía, análisis de datos de mi colección, benchmark, límites técnicos y legales |
| Definir | ¿Qué problema resuelvo y para quién? | Brief, perfiles, JTBD, «¿cómo podríamos…?», principios, métricas |
| Desarrollar | ¿Cuántas formas hay de resolverlo? | Direcciones visuales, prototipos funcionales publicados, comparativas A/B |
| Entregar | ¿Funciona y se sostiene? | Sistema de diseño vivo, pruebas automáticas, evaluación heurística, recorrido con proto-personas, test con usuarios |

---

## 2 · Descubrir

| Técnica | Qué hice | Qué aprendí |
|---|---|---|
| **Autoetnografía** | Preparo mis bolos con la primera versión (`RGBPM.html`) y apunto qué me frena | Traktor da los datos pero no ayuda a decidir; probar una transición obliga a abrir platos |
| **Análisis cuantitativo** | Leo mis 10.554 temas: percentil 25 = 115 BPM, mediana 125, percentil 75 = 138, percentil 90 = 175 | Las franjas «de manual» no sirven: el violeta se comía el 32 % y el rojo casi no salía |
| **Benchmark** | Mixed In Key, rekordbox/Traktor/Serato, DJ.Studio, Spotify Mix, apps de rueda Camelot | Nadie enseña armonía con tu propia música ni la hace visual (`PRODUCTO.md` §4) |
| **Límites** | APIs de Spotify, SoundCloud, Shazam, Apple, Deezer; derechos de la música | Spotify ya no da BPM ni previas a apps nuevas; Apple sí da previas legales con CORS |

---

## 3 · Definir

**Trabajo por hacer (JTBD)**
> *Cuando preparo un bolo, quiero saber qué tema va después y oírlo al momento, para que la pista no se caiga.*

| Perfil | Necesidad |
|---|---|
| DJ amateur o semiprofesional | Preparar rápido, sin teoría |
| DJ que empieza | Entender qué pega con qué |
| Oyente curioso | Descubrir por qué dos temas encajan |

**¿Cómo podríamos…?**
| # | Pregunta | Respuesta en el producto |
|---|---|---|
| 1 | …ver la armonía sin saber teoría? | Color = tempo + tono; rueda que conecta como un acorde |
| 2 | …fiarnos de una sugerencia? | Solo se sugiere lo que suena |
| 3 | …entrenar el oído con tu música? | Cinco juegos |
| 4 | …que el inicio refleje lo que usas? | Cartel cuyo tamaño cambia con el uso |

**Principios** (`SISTEMA.md` §1): el color es información · solo sale lo que suena · la mascota es la interfaz · cartel, no panel · rosa = acción.

---

## 4 · Desarrollar

Divergir antes de converger. Cada prototipo se publica y se prueba con música real.

| Momento | Opciones que probé | Me quedo con | Prueba que decidió |
|---|---|---|---|
| Dirección visual (s2) | 3 direcciones, varias mascotas | Negro + rosa, Disco ↔ Asterisco | Encaje con mi marca de DJ |
| Conexiones de Armonía (s11–13) | Líneas rectas («tela de araña»), arcos, rueda vinilo | Arcos musicales sobre vinilo | Lectura de un vistazo |
| Inicio (s12–14) | Empaquetado automático, rejilla, cartel suizo | Cartel de autor escalado por uso | Se veía genérico |
| Iconos (s13–15) | Librería genérica, trazo, gotas | Gotas propias | Mismo lenguaje que los círculos |
| Color (s3 → s16) | Franjas de manual, franjas por datos, color por tono | Franjas por datos + degradado tempo → tono | Datos de mi colección |
| Lava del inicio (s16) | Círculo fijo, forma de la mascota | Forma de la mascota | Con temas rápidos, el asterisco se perdía |
| Play en el móvil (s10) | Botón en la barra, mascota como play | Mascota como play | Probado en mi iPhone: el botón quedaba tapado |

---

## 5 · Entregar

| Qué | Dónde |
|---|---|
| Web publicada con cada cambio | laritazz.github.io/rgbpm |
| Sistema de diseño vivo | `/#/sistema` + `SISTEMA.md` |
| Calidad automática | 114 pruebas, lint y build en cada push (`ARQUITECTURA.md` §4) |
| Registro de decisiones | `DECISIONES.md` |
| Evaluación heurística | §6 |
| Recorrido cognitivo con 5 proto-personas | §8 y `PERSONAS.md` |
| Test con usuarios | `PRUEBA_USUARIOS.md` (pendiente, con DJs reales) |

---

## 6 · Evaluación heurística · 2 oct 2026

Las 10 heurísticas de Nielsen, en escritorio (1440 × 900) y móvil (390 × 844).
Gravedad: 0 nada · 1 estética · 2 menor · 3 mayor · 4 catástrofe.

| # | Heurística | Hallazgo | Grav. | Estado |
|---|---|---|---|---|
| 1 | H3 Control · H7 Eficiencia | **Set vacío sin salida:** solo un texto | 3 | ✅ «Cargar playlist» y «Set sugerido» |
| 2 | H8 Estética | Escuchar: el selector de modo se estiraba en una mancha gris | 2 | ✅ |
| 3 | H2 Mundo real | «Se analiza en tu móvil», también en el ordenador | 1 | ✅ «Se analiza aquí» |
| 4 | H8 Estética | Inicio: «BPM» se quedaba solo en otra línea | 1 | ✅ |
| 5 | H6 Reconocer | Las franjas de color se cortan sin avisar de que hay más | 1 | ✅ Fundido en el borde |
| 6 | H2 Mundo real | Jerga (Clavado, Subidón, Tercera) explicada solo al pasar el ratón: en el móvil no se ve | 2 | ✅ Leyenda que se toca y explica |
| 7 | H4 Consistencia | «Escuchar» es una sección (detectar BPM) y también una acción («Escuchar el set») | 2 | ✅ La sección pasa a «Detectar» |
| 8 | H1 Estado | «Escuchar el set» desactivado parece medio activo | 1 | ✅ Gris |
| 9 | H10 Ayuda | Armonía y Sets no tienen primera vez guiada | 2 | Pendiente: lo dirá el test |
| 10 | H1 Estado | Lo que no suena se oculta y se cuenta («Con audio 112 · Todos 153») | 0 | ✅ Sesión 16 |
| 11 | H3 Control | Vaciar o reordenar un set se puede deshacer | 0 | ✅ |

**Resultado:** 8 de 9 problemas resueltos (5 el primer día, 3 tras el recorrido con personas, que los confirmó). Queda la ayuda de la primera vez, para el test real.

---

## 7 · Cómo lo mido

| Métrica | Herramienta | Objetivo |
|---|---|---|
| Facilidad de uso global | SUS (10 preguntas) | ≥ 75 |
| Dificultad por tarea | SEQ (1–7) | ≥ 5,5 |
| Éxito por tarea | Test moderado | ≥ 80 % |
| Tiempo en montar un set de 8 | Cronómetro | < 3 min |
| Sugerencias que suenan | `audibles` / sugeridos | 100 % |

---

## 8 · Recorrido cognitivo con proto-personas · 2 oct 2026

Sin DJs disponibles, recorro las 5 tareas como lo harían 5 DJs ficticias, inspiradas en estilos reales: groove feliz (house), hipnosis (acid techno), sorpresa (ecléctica), comunión (disco, sets largos) y velocidad (hard techno). Detalle en `PERSONAS.md`.

| Resultado | |
|---|---|
| Problemas encontrados | 11 (más 3 oportunidades) |
| Resueltos | 11: 7 en el primer pase y 4 tras decidir yo las reglas (repetir clave, sets largos, notación, «contraste») |
| Lo más grave | No se podía oír una sugerencia sin perder la referencia; el set sugerido no tenía forma de energía |
| Giro de producto | El mezclador empieza por **probar la transición** entre dos temas |

**Por qué este método y no otro:** el recorrido cognitivo no necesita usuarios y encuentra los fallos de aprendizaje (¿sabría qué hacer aquí?). No sustituye al test real: lo prepara, porque llego con los errores obvios ya arreglados y con hipótesis concretas.
