<?php
declare(strict_types=1);

require_once __DIR__ . '/src/Middleware/CorsMiddleware.php';
\HaidKu\Middleware\CorsMiddleware::handle();

try {
    /** @var \HaidKu\Router $router */
    $router = require __DIR__ . '/bootstrap/app.php';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $uri = $_SERVER['REQUEST_URI'] ?? '/';

    $router->dispatch($method, $uri);
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status'  => 'error',
        'message' => 'Terjadi kesalahan internal server: ' . $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}

