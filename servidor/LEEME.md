# Audio privado de RGBPM en IONOS

Fragmentos de 90 s de tu colección, en tu hosting, que solo suenan con tu sesión.

## Cómo funciona

```
RGBPM (web)  ──login──▶  Supabase (quién eres)
     │
     ├─ «firma este fragmento» + tu sesión ─▶  firmar.php (IONOS) ── pregunta a Supabase ──▶ ok
     │                                            └─ devuelve un enlace que caduca en 20 min
     └─ reproduce el enlace ───────────────▶  audio.php (IONOS) ── lee privado/fragmentos/…
```

| Carpeta en IONOS | Qué hay | ¿Se ve desde el navegador? |
|---|---|---|
| `rgbpm-audio/` | `firmar.php`, `audio.php`, `.htaccess` | Solo las dos puertas |
| `rgbpm-audio/privado/` | `config.php`, `comun.php`, registro | **No** (bloqueada) |
| `rgbpm-audio/privado/fragmentos/` | `a7f3c9e1….mp3` + `fragmentos.json` | **No** |

## Pasos (una vez)

Supabase ya está listo: registros cerrados y tu usuaria creada.

1. **Traer lo último** (Terminal, en la carpeta del proyecto):
   ```bash
   cd ~/RGBPM/rgbpm
   git pull
   npm install
   npm i --no-save ffmpeg-static
   ```
2. **Crear `config.php`** (te pide tu email y genera el secreto solo; no hace falta que lo veas):
   ```bash
   npm run servidor:config
   ```
3. **Fragmentos de prueba** (50 temas, un par de minutos):
   ```bash
   npm run fragmentos -- --nml ../data/traktor/collection.nml --limite 50
   ```
   Si tu colección buena está en Traktor, usa esa ruta:
   `--nml "~/Documents/Native Instruments/Traktor 3.6.0/collection.nml"`
4. **IONOS · PHP**: en el panel, tarjeta *PHP*, elige **8.2 o superior** para creativezz.com.
5. **Subir por SFTP** con [Cyberduck](https://cyberduck.io) (gratis):
   - Servidor `home391793325.1and1-data.host`, puerto 22, tu usuario SFTP de IONOS y su contraseña.
   - Arrastra la carpeta `servidor/rgbpm-audio` a la **raíz de creativezz.com** (donde está tu `index.html`).
   - Arrastra la carpeta `rgbpm-fragmentos` **dentro de** `rgbpm-audio/privado/` y renómbrala a `fragmentos`.
   - Los `.htaccess` son ocultos: en Cyberduck, *Visualización → Mostrar archivos ocultos*, y comprueba que están arriba.
6. **Comprobar**:
   - `https://creativezz.com/rgbpm-audio/firmar.php?salud=1` → `{"ok":true,"fragmentos":50}`
   - `https://creativezz.com/rgbpm-audio/privado/config.php` → **403**
7. **En RGBPM**: *Tu música → Tu música privada* → tu email y contraseña. Los 50 temas suenan en el móvil.
8. Si todo va bien: `npm run fragmentos -- --nml …` **sin `--limite`** (tarda horas, se puede parar y seguir) y sube lo nuevo.

## Seguridad

- Los fragmentos no llevan título, artista ni portada dentro (`-map_metadata -1`).
- `config.php` no está en GitHub (`.gitignore`). Si el secreto se filtra: genera otro y cámbialo; los enlaces viejos dejan de valer al momento.
- El registro (`privado/registro.log`) apunta intentos raros: sesiones falsas, firmas tocadas, emails no permitidos. Nunca guarda tokens.
