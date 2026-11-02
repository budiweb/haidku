<?php
declare(strict_types=1);

namespace HaidKu\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        $allowedOrigins = explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://localhost,http://127.0.0.1');
        $allowedOrigins = array_map('trim', $allowedOrigins);

        if (in_array($origin, $allowedOrigins, true) || in_array('*', $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        } else {
            header("Access-Control-Allow-Origin: *");
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-User-Id, X-Guest-Id, X-Mutation-Id");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}

