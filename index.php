<?php
declare(strict_types=1);

/**
 * HaidKu Root Entrypoint
 * Handles routing without mandatory /public in URL.
 * Routes /api/v1 requests to apps/api/index.php
 * Routes static assets & SPA routes to apps/web/dist
 */

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);

// Hilangkan subfolder project jika dijalankan dalam Apache subpath (misal /haidku)
$baseFolder = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
if ($baseFolder !== '' && str_starts_with($path, $baseFolder)) {
    $path = substr($path, strlen($baseFolder));
    if ($path === '' || $path === false) {
        $path = '/';
    }
}

// 1. Rute API: /api/v1/...
if (str_starts_with($path, '/api/v1') || str_starts_with($path, '/api/')) {
    // Normalisasi REQUEST_URI untuk API router
    $_SERVER['REQUEST_URI'] = $path . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : '');
    require __DIR__ . '/apps/api/index.php';
    exit;
}

// 2. Layani aset statis dari apps/web/dist jika file fisik ada
$distDir = __DIR__ . '/apps/web/dist';
$requestedFile = realpath($distDir . $path);

if ($requestedFile && str_starts_with($requestedFile, realpath($distDir)) && is_file($requestedFile)) {
    $ext = pathinfo($requestedFile, PATHINFO_EXTENSION);
    $mimeMap = [
        'html' => 'text/html',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
    ];
    $contentType = $mimeMap[$ext] ?? mime_content_type($requestedFile);
    header("Content-Type: $contentType");
    readfile($requestedFile);
    exit;
}

// 3. SPA Fallback ke apps/web/dist/index.html jika sudah di-build
$spaIndex = $distDir . '/index.html';
if (file_exists($spaIndex)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($spaIndex);
    exit;
}

// 4. Jika frontend belum di-build, tampilkan instruksi awal ramah
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HaidKu — Kenali Siklusmu, Pahami Tubuhmu</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAFAF9; color: #1F2937; padding: 2rem; text-align: center; }
        .card { max-width: 480px; margin: 4rem auto; background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        h1 { color: #D96B8C; margin-bottom: 0.5rem; }
        p { color: #4B5563; line-height: 1.6; }
        .btn { display: inline-block; background: #D96B8C; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>HaidKu</h1>
        <p><em>Kenali Siklusmu, Pahami Tubuhmu</em></p>
        <p>Backend REST API aktif di <code>/api/v1</code>. Frontend sedang disiapkan atau dalam proses build Vite.</p>
        <a class="btn" href="api/v1/health">Periksa Status API</a>
    </div>
</body>
</html>
