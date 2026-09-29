<?php
// RGBPM · piezas comunes de las dos puertas (firmar.php y audio.php)
declare(strict_types=1);

const RAIZ = __DIR__;
const MAX_REGISTRO = 1_000_000; // bytes; al pasarse, el registro se rota

function config(): array
{
    static $config = null;
    if ($config === null) {
        if (!is_file(RAIZ . '/config.php')) {
            responder(500, ['error' => 'sin_config']);
        }
        $config = require RAIZ . '/config.php';
    }
    return $config;
}

/** Una línea JSON por evento: qué pasó, cuándo y desde dónde. Nunca guarda tokens. */
function registrar(string $evento, array $datos = []): void
{
    $archivo = RAIZ . '/registro.log';
    if (is_file($archivo) && filesize($archivo) > MAX_REGISTRO) {
        @rename($archivo, $archivo . '.1');
    }
    $linea = ['t' => gmdate('c'), 'evento' => $evento, 'ip' => $_SERVER['REMOTE_ADDR'] ?? ''] + $datos;
    @file_put_contents($archivo, json_encode($linea, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
}

/** Solo las webs de la lista pueden llamar desde el navegador. */
function cors(): void
{
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origen, config()['origenes'], true)) {
        header("Access-Control-Allow-Origin: $origen");
        header('Access-Control-Allow-Headers: Authorization, Content-Type, Range');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges');
        header('Access-Control-Max-Age: 600');
    }
    header('Vary: Origin');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function responder(int $estado, array $cuerpo): never
{
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Los fragmentos se llaman con 16 caracteres hexadecimales. Cualquier otra cosa se rechaza (ni «../», ni nombres). */
function idValido(mixed $id): bool
{
    return is_string($id) && preg_match('/^[a-f0-9]{16}$/', $id) === 1;
}

function firma(string $id, int $caduca): string
{
    return hash_hmac('sha256', "$id.$caduca", config()['secreto']);
}

function rutaFragmento(string $id): string
{
    return RAIZ . "/fragmentos/$id.mp3";
}
