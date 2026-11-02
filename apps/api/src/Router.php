<?php
declare(strict_types=1);

namespace HaidKu;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, $handler): void
    {
        $this->routes[] = [
            'method'  => strtoupper($method),
            'pattern' => $this->convertPathToRegex($path),
            'handler' => $handler,
        ];
    }

    private function convertPathToRegex(string $path): string
    {
        // Ganti {param} menjadi named subpattern (?P<param>[^/]+)
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(string $method, string $uri): void
    {
        $method = strtoupper($method);
        $path = parse_url($uri, PHP_URL_PATH);

        // Bersihkan prefix jika ada subfolder seperti /haidku
        $scriptName = dirname($_SERVER['SCRIPT_NAME'] ?? '');
        if ($scriptName !== '/' && $scriptName !== '\\' && str_starts_with($path, $scriptName)) {
            $path = substr($path, strlen($scriptName));
        }

        // Normalisasi path
        $path = '/' . trim($path, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $handler = $route['handler'];

                if (is_callable($handler)) {
                    call_user_func_array($handler, array_values($params));
                    return;
                }

                if (is_array($handler) && count($handler) === 2) {
                    [$controller, $action] = $handler;
                    call_user_func_array([$controller, $action], array_values($params));
                    return;
                }
            }
        }

        // Jika tidak cocok
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'status'  => 'error',
            'message' => "Endpoint tidak ditemukan: [$method] $path",
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
