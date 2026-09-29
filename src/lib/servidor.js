// Plantilla del .htaccess para la carpeta de música en tu hosting (Apache).
// Deja leer a RGBPM, esconde la lista de archivos y corta el enlace directo desde otras webs.

export function plantillaHtaccess(origen = 'https://laritazz.github.io') {
  const dominio = origen.replace(/^https?:\/\//, '').replace(/\./g, '\\.')
  return `# RGBPM · carpeta de música
# 1. Nadie ve la lista de archivos
Options -Indexes

# 2. Solo la web de RGBPM (y tu ordenador en pruebas) puede leer esta carpeta
<IfModule mod_headers.c>
  SetEnvIf Origin "^(${origen.replace(/\./g, '\\.')}|http://localhost(:[0-9]+)?)$" RGBPM_ORIGEN=$0
  Header set Access-Control-Allow-Origin "%{RGBPM_ORIGEN}e" env=RGBPM_ORIGEN
  Header set Access-Control-Allow-Headers "Range"
  Header set Access-Control-Expose-Headers "Content-Length, Content-Range, Accept-Ranges"
  Header append Vary Origin
</IfModule>

# 3. Enlaces directos desde otras webs: bloqueados
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_REFERER} !^https?://${dominio}/ [NC]
  RewriteCond %{HTTP_REFERER} !^http://localhost [NC]
  RewriteRule \\.(mp3|m4a|aac|wav|aiff?|flac|ogg|opus|json)$ - [F,NC]
</IfModule>

# 4. Formatos que algunos servidores no conocen
<IfModule mod_mime.c>
  AddType audio/mp4 .m4a
  AddType audio/flac .flac
  AddType audio/aiff .aif .aiff
</IfModule>
`
}

export function descargarTexto(nombre, texto, tipo = 'text/plain') {
  const url = URL.createObjectURL(new Blob([texto], { type: tipo }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
