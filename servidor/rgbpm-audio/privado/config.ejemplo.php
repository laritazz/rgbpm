<?php
// RGBPM · configuración del audio privado.
// Copia este archivo como config.php (en esta misma carpeta «privado») y rellénalo.
// config.php NUNCA va a GitHub: está en .gitignore.
return [
    // Supabase: Project URL y publishable key (las dos son públicas)
    'supabase_url' => 'https://qmsrldxqmtinuzzkjsgh.supabase.co',
    'supabase_clave' => 'sb_publishable_PEGA_AQUI_TU_CLAVE',

    // Quién puede escuchar: solo estos emails de Supabase
    'emails' => ['tu-email@ejemplo.com'],

    // Secreto para firmar enlaces. Genéralo en la Terminal del Mac con:
    //   openssl rand -hex 32
    // y pega aquí el resultado. No lo compartas con nadie.
    'secreto' => 'CAMBIA_ESTO_POR_64_CARACTERES_ALEATORIOS',

    // Webs que pueden pedir audio
    'origenes' => ['https://laritazz.github.io', 'http://localhost:5173', 'http://localhost:4173'],

    // Cuánto vive un enlace firmado (segundos)
    'caducidad' => 1200,
];
