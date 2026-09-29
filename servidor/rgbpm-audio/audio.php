<?php
// RGBPM · puerta 2: entrega un fragmento si el enlace está bien firmado y no ha caducado.
//   GET audio.php?f=<id>&e=<caduca>&s=<firma>   (admite Range para poder saltar dentro del tema)
declare(strict_types=1);
require __DIR__ . '/privado/comun.php';

cors();

$id = $_GET['f'] ?? '';
$caduca = filter_var($_GET['e'] ?? '', FILTER_VALIDATE_INT);
$firma = $_GET['s'] ?? '';

if (!idValido($id) || $caduca === false || !is_string($firma)) {
    registrar('audio_mal_formado');
    responder(400, ['error' => 'enlace']);
}
if ($caduca < time()) {
    responder(403, ['error' => 'caducado']);
}
if (!hash_equals(firma($id, $caduca), $firma)) {
    registrar('audio_firma_falsa', ['id' => $id]);
    responder(403, ['error' => 'firma']);
}

$ruta = rutaFragmento($id);
if (!is_file($ruta)) {
    responder(404, ['error' => 'no_existe']);
}

$tamano = filesize($ruta);
$desde = 0;
$hasta = $tamano - 1;

// Range: bytes=inicio-fin (el navegador lo usa para saltar dentro del tema)
if (isset($_SERVER['HTTP_RANGE'])) {
    if (preg_match('/^bytes=(\d*)-(\d*)$/', $_SERVER['HTTP_RANGE'], $m) !== 1 || ($m[1] === '' && $m[2] === '')) {
        header("Content-Range: bytes */$tamano");
        responder(416, ['error' => 'rango']);
    }
    if ($m[1] === '') {
        $desde = max(0, $tamano - (int) $m[2]); // «los últimos N bytes»
    } else {
        $desde = (int) $m[1];
        $hasta = $m[2] === '' ? $hasta : min((int) $m[2], $hasta);
    }
    if ($desde > $hasta) {
        header("Content-Range: bytes */$tamano");
        responder(416, ['error' => 'rango']);
    }
    http_response_code(206);
    header("Content-Range: bytes $desde-$hasta/$tamano");
}

header('Content-Type: audio/mpeg');
header('Accept-Ranges: bytes');
header('Content-Length: ' . ($hasta - $desde + 1));
header('Content-Disposition: inline; filename="rgbpm.mp3"');
header('Cache-Control: private, max-age=600');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');

$archivo = fopen($ruta, 'rb');
fseek($archivo, $desde);
$quedan = $hasta - $desde + 1;
while ($quedan > 0 && !feof($archivo) && !connection_aborted()) {
    $trozo = fread($archivo, min(65536, $quedan));
    echo $trozo;
    flush();
    $quedan -= strlen($trozo);
}
fclose($archivo);
