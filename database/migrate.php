<?php
declare(strict_types=1);

/**
 * Migration runner for HaidKu
 * Usage:
 *   php database/migrate.php
 *   php database/migrate.php --seed
 *   php database/migrate.php --fresh
 */

$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$key, $val] = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val, " \t\n\r\0\x0B\"'");
            $_ENV[$key] = $val;
            putenv("$key=$val");
        }
    }
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$database = getenv('DB_DATABASE') ?: 'haidku';
$username = getenv('DB_USERNAME') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

echo "[HaidKu] Menghubungkan ke MySQL di $host:$port...\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    if (in_array('--fresh', $argv, true)) {
        echo "[HaidKu] Menghapus database lama ($database)...\n";
        $pdo->exec("DROP DATABASE IF EXISTS `$database`");
    }

    echo "[HaidKu] Memastikan database '$database' tersedia...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$database`");

    // Table migrations tracking
    $pdo->exec("CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $files = glob(__DIR__ . '/migrations/*.sql');
    sort($files);

    foreach ($files as $file) {
        $migrationName = basename($file);
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM _migrations WHERE migration = :m");
        $stmt->execute([':m' => $migrationName]);
        if ($stmt->fetchColumn() > 0) {
            echo " - Sudah diterapkan: $migrationName\n";
            continue;
        }

        echo " - Menerapkan migration: $migrationName... ";
        $sql = file_get_contents($file);
        $pdo->exec($sql);

        $ins = $pdo->prepare("INSERT INTO _migrations (migration) VALUES (:m)");
        $ins->execute([':m' => $migrationName]);
        echo "OK\n";
    }

    if (in_array('--seed', $argv, true)) {
        $seedFiles = glob(__DIR__ . '/seeds/*.sql');
        sort($seedFiles);
        foreach ($seedFiles as $seedFile) {
            $seedName = basename($seedFile);
            echo " - Menerapkan seeder: $seedName... ";
            $seedSql = file_get_contents($seedFile);
            $pdo->exec($seedSql);
            echo "OK\n";
        }
    }

    echo "[HaidKu] Migrasi selesai dengan sukses!\n";
} catch (Exception $e) {
    echo "\n[ERROR] Migrasi gagal: " . $e->getMessage() . "\n";
    exit(1);
}

