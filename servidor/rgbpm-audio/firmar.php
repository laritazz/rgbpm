<?php
// RGBPM · puerta 1: comprueba tu sesión de Supabase y devuelve enlaces firmados que caducan.
//
//   GET  firmar.php?salud=1                    → { ok, fragmentos }         (sin login: para comprobar que funciona)
//   POST firmar.php  { accion: "lista" }        → { ids: [...] }              (qué fragmentos hay)
//   POST firmar.php  { accion: "firmar", ids }  → { urls: { id: url }, caduca }
//   Cabecera: Authorization: Bearer <access_token de Supabase>
declare(strict_types=1);
require __DIR__ . '/privado/comun.php';

const MAX_IDS = 50;
const CACHE_SESION = 300; // s que se recuerda una sesión ya comprobada

cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['salud'])) {
    responder(200, ['ok' => true, 'fragmentos' => count(idsDisponibles())]);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(405, ['error' => 'metodo']);
}

$email = usuariaAutorizada(tokenDeLaPeticion());
$cuerpo = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($cuerpo)) {
    responder(400, ['error' => 'cuerpo']);
}

switch ($cuerpo['accion'] ?? '') {
    case 'lista':
        responder(200, ['ids' => idsDisponibles()]);

    case 'firmar':
        $ids = $cuerpo['ids'] ?? null;
        if (!is_array($ids) || count($ids) === 0 || count($ids) > MAX_IDS) {
            responder(400, ['error' => 'ids']);
        }
        $caduca = time() + (int) config()['caducidad'];
        $base = urlDeEstaCarpeta() . 'audio.php';
        $urls = [];
        foreach ($ids as $id) {
            if (idValido($id) && is_file(rutaFragmento($id))) {
                $urls[$id] = "$base?f=$id&e=$caduca&s=" . firma($id, $caduca);
            }
        }
        registrar('firmar', ['email' => $email, 'pedidos' => count($ids), 'firmados' => count($urls)]);
        responder(200, ['urls' => $urls, 'caduca' => $caduca]);

    default:
        responder(400, ['error' => 'accion']);
}

// ——— Piezas ———

function tokenDeLaPeticion(): string
{
    $cabecera = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+([A-Za-z0-9._-]{20,4096})$/', $cabecera, $m) !== 1) {
        registrar('sin_token');
        responder(401, ['error' => 'sin_sesion']);
    }
    return $m[1];
}

/**
 * Pregunta a Supabase quién es el dueño del token. Solo pasan los emails de config.php.
 * La respuesta se recuerda 5 minutos para no preguntar en cada tema.
 */
function usuariaAutorizada(string $token): string
{
    $cache = RAIZ . '/sesiones/' . hash('sha256', $token);
    if (is_file($cache) && filemtime($cache) > time() - CACHE_SESION) {
        return (string) file_get_contents($cache);
    }

    $c = config();
    $peticion = curl_init(rtrim($c['supabase_url'], '/') . '/auth/v1/user');
    curl_setopt_array($peticion, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_HTTPHEADER => ['apikey: ' . $c['supabase_clave'], 'Authorization: Bearer ' . $token],
    ]);
    $respuesta = curl_exec($peticion);
    $estado = curl_getinfo($peticion, CURLINFO_RESPONSE_CODE);
    $fallo = curl_error($peticion);
    curl_close($peticion);

    if ($respuesta === false || $estado >= 500 || $estado === 0) {
        registrar('supabase_caido', ['estado' => $estado, 'fallo' => $fallo]);
        responder(502, ['error' => 'supabase']);
    }
    if ($estado !== 200) {
        registrar('sesion_invalida', ['estado' => $estado]);
        responder(401, ['error' => 'sin_sesion']);
    }

    $email = strtolower((string) (json_decode($respuesta, true)['email'] ?? ''));
    $permitidos = array_map('strtolower', $c['emails']);
    if ($email === '' || !in_array($email, $permitidos, true)) {
        registrar('email_no_permitido', ['email' => $email]);
        responder(403, ['error' => 'no_permitido']);
    }

    @mkdir(RAIZ . '/sesiones', 0700);
    limpiarSesionesViejas();
    @file_put_contents($cache, $email, LOCK_EX);
    return $email;
}

function limpiarSesionesViejas(): void
{
    if (random_int(1, 20) !== 1) {
        return; // de vez en cuando basta
    }
    foreach (glob(RAIZ . '/sesiones/*') ?: [] as $f) {
        if (filemtime($f) < time() - CACHE_SESION) {
            @unlink($f);
        }
    }
}

/** Qué fragmentos hay: el índice que genera el script, o si no existe, la carpeta. */
function idsDisponibles(): array
{
    $indice = RAIZ . '/fragmentos/fragmentos.json';
    if (is_file($indice)) {
        $datos = json_decode((string) file_get_contents($indice), true);
        return array_values(array_filter($datos['ids'] ?? [], 'idValido'));
    }
    return array_map(fn ($f) => basename($f, '.mp3'), glob(RAIZ . '/fragmentos/*.mp3') ?: []);
}

function urlDeEstaCarpeta(): string
{
    $esquema = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https' ? 'https' : 'http';
    $carpeta = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/') . '/';
    return $esquema . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . $carpeta;
}
