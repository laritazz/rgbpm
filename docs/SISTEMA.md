# RGBPM · Sistema de diseño

> **Copia congelada del 6 oct 2026.** La versión viva está en Notion (privado): [04 — Sistema visual](https://app.notion.com/p/3f1c9362e7c681f7bf58d77b64a9badd). No edites este archivo: los cambios van en Notion.

> v2 · 2 oct 2026. La versión viva está en la app: **/#/sistema** (se pinta con el mismo código que la interfaz, así nunca se desfasa).
> Fuente de verdad en el código: `src/lib/color.js`, `src/lib/mascota.js`, `src/components/Iconos.jsx`, `scripts/fuente.py`, `src/styles/base.css`.

---

## 1 · Principios

| # | Principio | En la práctica |
|---|---|---|
| 1 | **El color es información** | Cada color dice tempo o tono. Nada es decorativo |
| 2 | **Solo sale lo que suena** | Un tema sin audio no se sugiere, no entra en juegos ni en sets propuestos |
| 3 | **La mascota es la interfaz** | Reacciona al BPM, al resultado y al uso; no es un adorno |
| 4 | **Cartel, no panel** | Composición de cartel suizo: pocos elementos, tamaños muy distintos, cortes en el borde |
| 5 | **Rosa = acción** | El rosa de marca es para pulsar. El verde existe en la escala, nunca en un botón. Desactivado = gris |
| 6 | **Proponer, no corregir** | La armonía es una guía: un choque de tono es un «Contraste» en gris, no un error en rojo |

---

## 2 · Color

### 2.1 Franjas de BPM (color plano)

Cinco franjas, una por letra del logo. **v2:** cortadas con la colección real de Lara (10.554 temas). Antes el violeta llegaba a 120 (32 % de la música) y el rojo empezaba en 168 (13 %).

| Franja | Color | BPM | % de la colección | Qué suena |
|---|---|---|---|---|
| Violeta | `#7D4EA2` | < 110 | ~22 % | Downtempo, hip hop, reggaetón |
| Turquesa | `#4ABDC4` | 110–124 | ~23 % | House, nu disco, afro |
| Oliva | `#A0B03D` | 124–132 | ~24 % | Tech house, techno: el centro de la pista |
| Amarillo | `#E4BB2A` | 132–150 | ~13 % | Trance, techno duro, hard dance |
| Carmesí | `#A42640` | ≥ 150 | ~18 % | Hardstyle, jungle, drum & bass |

**Uso:** filtros, leyendas, el logo, el fondo de la mascota. Siempre plano.

### 2.2 Escala fina (color de un tema)

Doce puntos que se funden: el color de un tema cae siempre dentro de su franja.

| BPM | 92 | 106 | 114 | 119 | 124 | 128 | 133 | 140 | 146 | 152 | 162 | 180 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Color | `#7D4EA2` | `#5B6FC0` | `#4B9FC6` | `#48C3B5` | `#3FAF4A` | `#A6BC4E` | `#C2B545` | `#E4CD2D` | `#E5922F` | `#C9452F` | `#A42640` | `#7A1A33` |

### 2.3 Color de la clave (nuevo en v2)

- El número Open Key recorre el círculo cromático igual que recorre las quintas: **claves vecinas, colores vecinos**.
- Empieza en magenta (330°) con 1m / 1d (La menor, Do mayor): la casa.
- **Menores:** más oscuras (S 62 %, L 46 %). **Mayores:** más claras (S 72 %, L 66 %).
- Así la relativa (1m ↔ 1d) tiene el mismo tono, solo más luz: se ve que «son de la misma familia».

### 2.4 Degradado de tema = tempo + tono

```
┌──────────────┐
│ BPM          │   0–38 %: color del BPM (aquí va el texto: la tinta se calcula sobre él)
│      ╲       │
│        ╲     │   38–100 %: se funde hacia el color de la clave
│        clave │
└──────────────┘   135°, de arriba-izquierda a abajo-derecha
```

| Dónde | Plano o degradado |
|---|---|
| Tarjeta Pantone, muestras de tema, listas | **Degradado** BPM → clave |
| Portada de un set | Franjas verticales, cada una de su BPM (arriba) a su clave (abajo) |
| Filtros, leyendas, franjas, mascota | **Plano** (franja de BPM) |
| Sin clave | Plano |

### 2.5 Marca y superficies

| Token | Valor | Uso |
|---|---|---|
| `--rosa` | `#FF66C4` | Acciones, foco, fondo del inicio |
| `--negro` | `#000000` | Fondo de las secciones, tinta del inicio |
| `--superficie` / `-2` | `#0C0C0C` / `#161616` | Paneles |
| `--gris-2` / `-3` | `#BDBDBD` / `#8C8C8C` | Texto secundario (contraste ≥ 4,5:1 sobre negro) |

---

## 3 · Tipografía

| Familia | Uso | Notas |
|---|---|---|
| **RGBPM Letras** (propia) | Menús, títulos, nombres del cartel, veredictos de juego, cifras grandes | Sacada del logo: R G B P M tal cual; el resto con su construcción. Solo mayúsculas. 2 KB. `scripts/fuente.py` |
| **Urbanist** | Todo lo que se lee | 300 / 400 / 600 / 800 |
| Codec Pro | Solo piezas fuera de la web | Licencia sin distribución: nunca en el repo |

Reglas: cifras con `tabular-nums`; títulos con `text-wrap: balance`; RGBPM Letras nunca por debajo de 13 px.

---

## 4 · Iconos: gotas

- Rejilla de 24, relleno `currentColor`.
- Solo dos piezas: **puntos** y **cuellos** (dos puntos que se tocan se unen con un cuello que se estrecha, como dos gotas).
- Cada icono es una lista de puntos y uniones (`<Gotas puntos uniones />`): se dibujan igual en el cartel, el menú y las pestañas.

| Sección | Idea |
|---|---|
| Biblioteca | Tres discos juntos y uno suelto |
| Armonía | Cuatro tonos que cierran una rueda |
| Sets | Temas encadenados |
| Detectar | Un punto y el anillo que capta |
| Juego | El cinco del dado |
| Radio | Un punto que emite |
| Mezclador | Dos faders y el crossfader |

---

## 5 · Mascota

| Franja | Forma (energía) | Ánimo |
|---|---|---|
| Violeta < 110 | Disco | Calma |
| Turquesa 110–124 | Disco que se ondula | Feliz |
| Oliva 124–132 | Medio asterisco | Guiño |
| Amarillo 132–150 | Casi asterisco | Sorpresa |
| Carmesí ≥ 150 | Asterisco | Euforia |

- **v2:** un ánimo por franja: la cara cambia donde cambia el color.
- Estados: dormida (en pausa), se despierta, parpadea, mira adonde señalas, se mece, late al tempo, gira una muesca por compás.
- **En el inicio, su cuerpo es la tinta** (`CuerpoTinta`): la lava del centro toma su forma, disco o asterisco, y se funde con los círculos de al lado.
- Variantes: `icono`, `etiqueta` (vinilo), `libre`, `negra` (sobre rosa), `rosa` (sobre negro), `soloCara`.

---

## 6 · Cartel (inicio y Juego)

- Composición a mano, en dos versiones: apaisada y vertical (`lib/composicion.js`).
- **Tamaño = uso:** cada visita vale ½ cada semana (`lib/uso.js`); escala 0,8–1,18.
- **Gotas:** filtro SVG (desenfoque + umbral + ruido) para que los círculos se fundan y tengan borde imperfecto.
- Inicio: rosa con tinta negra. Juego: negro con tinta rosa.
- Las etiquetas siempre caben en la parte visible del círculo (los nombres largos van en dos líneas).

---

## 7 · Movimiento

| Qué | Duración | Curva |
|---|---|---|
| Entrar en una sección (círculo que se abre) | 560 ms + fundido de 340 ms | `cubic-bezier(.7, 0, .2, 1)` |
| Cambio de pantalla | 320 ms | `--curva-salida` |
| Pulsar | 160–260 ms, `scale .94–.97` | `--curva-muelle` |
| Flotar del cartel | 6–10 s, alterno | ease-in-out |

Todo respeta `prefers-reduced-motion`: sin flotar, sin dibujar líneas y sin círculo de transición.

---

## 8 · Accesibilidad

- Foco visible (3 px rosa, o blanco/negro sobre rosa).
- Áreas táctiles ≥ 44 px.
- Cada círculo y cada tono es un botón con nombre (`aria-label`).
- El color nunca va solo: siempre va acompañado de la etiqueta (BPM, clave, nombre de franja).
