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

1. **Supabase**
   - *Authentication → Sign In / Providers*: desactiva «Allow new users to sign up».
   - *Authentication → Users → Add user*: tu email y una contraseña.
2. **IONOS · PHP**: en el panel, tarjeta *PHP*, pon **PHP 8.2 o superior** para creativezz.com.
3. **Secreto**: en la Terminal del Mac → `openssl rand -hex 32` y copia el resultado.
4. **config.php**: copia `privado/config.ejemplo.php` como `privado/config.php` y rellena:
   la publishable key, tu email y el secreto del paso 3.
5. **Subir por SFTP** (Cyberduck o FileZilla, servidor `home391793325.1and1-data.host`, usuario de IONOS):
   la carpeta `servidor/rgbpm-audio` entera a la raíz de creativezz.com, **incluidos los `.htaccess`**
   (son archivos ocultos: en el Finder, `Cmd + Mayús + .` para verlos).
6. **Comprobar**: abre `https://creativezz.com/rgbpm-audio/firmar.php?salud=1` → debe decir `{"ok":true,…}`.
   Y `https://creativezz.com/rgbpm-audio/privado/config.php` → debe dar **error 403**.

## Crear y subir los fragmentos

```bash
cd ~/RGBPM/rgbpm
npm i --no-save ffmpeg-static        # una vez: trae ffmpeg
npm run fragmentos -- --nml "~/Documents/Native Instruments/Traktor 3.6.0/collection.nml" --limite 50
```

- Primero **con `--limite 50`** para probar. Después sin límite (~10.000 temas, ~14 GB; tarda horas).
- Se puede parar y relanzar: no repite los que ya están.
- Sube la carpeta `rgbpm-fragmentos` entera como `rgbpm-audio/privado/fragmentos/`.
- `rgbpm-fragmentos-errores.txt` (queda en tu Mac) dice qué temas no encontró.

## Seguridad

- Los fragmentos no llevan título, artista ni portada dentro (`-map_metadata -1`).
- `config.php` no está en GitHub (`.gitignore`). Si el secreto se filtra: genera otro y cámbialo; los enlaces viejos dejan de valer al momento.
- El registro (`privado/registro.log`) apunta intentos raros: sesiones falsas, firmas tocadas, emails no permitidos. Nunca guarda tokens.
