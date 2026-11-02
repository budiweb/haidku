<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/Services/CycleCalculatorService.php';
require_once __DIR__ . '/../src/Services/SDMService.php';
require_once __DIR__ . '/../src/Repositories/PeriodRepository.php';
require_once __DIR__ . '/../src/Repositories/UserRepository.php';
require_once __DIR__ . '/../src/Repositories/SyncRepository.php';
require_once __DIR__ . '/../src/Repositories/SymptomRepository.php';
require_once __DIR__ . '/../src/Controllers/PeriodController.php';
require_once __DIR__ . '/../src/Controllers/UserController.php';
require_once __DIR__ . '/../src/Controllers/ArticleController.php';
require_once __DIR__ . '/../src/Controllers/FertilityController.php';
require_once __DIR__ . '/../src/Controllers/SyncController.php';
require_once __DIR__ . '/../src/Controllers/SymptomController.php';
require_once __DIR__ . '/../src/Router.php';

// Muat .env jika ada
$envFile = __DIR__ . '/../../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v, " \t\n\r\0\x0B\"'");
            $_ENV[$k] = $v;
            putenv("$k=$v");
        }
    }
}

// Inisialisasi Database & Services
$db = \HaidKu\Config\Database::getConnection();
$periodRepo = new \HaidKu\Repositories\PeriodRepository($db);
$userRepo = new \HaidKu\Repositories\UserRepository($db);
$syncRepo = new \HaidKu\Repositories\SyncRepository($db);
$cycleCalculator = new \HaidKu\Services\CycleCalculatorService();
$sdmService = new \HaidKu\Services\SDMService();

$periodController = new \HaidKu\Controllers\PeriodController($periodRepo, $cycleCalculator);
$userController = new \HaidKu\Controllers\UserController($userRepo);
$articleController = new \HaidKu\Controllers\ArticleController($db);
$fertilityController = new \HaidKu\Controllers\FertilityController($periodRepo, $userRepo, $cycleCalculator, $sdmService, $db);
$syncController = new \HaidKu\Controllers\SyncController($syncRepo, $userRepo);
$symptomController = new \HaidKu\Controllers\SymptomController();

$router = new \HaidKu\Router();

// Routes definition
$router->add('GET', '/api/v1/health', function () {
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status'    => 'ok',
        'service'   => 'HaidKu REST API',
        'version'   => '1.0.0',
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
    ]);
});

// Period endpoints
$router->add('GET', '/api/v1/periods', [$periodController, 'index']);
$router->add('POST', '/api/v1/periods', [$periodController, 'store']);
$router->add('GET', '/api/v1/periods/{id}', [$periodController, 'show']);
$router->add('PATCH', '/api/v1/periods/{id}', [$periodController, 'update']);
$router->add('PUT', '/api/v1/periods/{id}', [$periodController, 'update']);
$router->add('DELETE', '/api/v1/periods/{id}', [$periodController, 'destroy']);

// Daily symptoms & body observations (ERD daily_symptoms)
$router->add('GET', '/api/v1/symptoms', [$symptomController, 'list']);
$router->add('POST', '/api/v1/symptoms', [$symptomController, 'upsert']);
$router->add('GET', '/api/v1/symptoms/{date}', [$symptomController, 'getByDate']);
$router->add('DELETE', '/api/v1/symptoms/{date}', [$symptomController, 'delete']);

// Cycle stats & calendar
$router->add('GET', '/api/v1/cycles/summary', [$periodController, 'summary']);
$router->add('GET', '/api/v1/cycles/calendar', [$periodController, 'calendar']);

// Fertility & Standard Days Method (SDM)
$router->add('GET', '/api/v1/fertility/estimate', [$fertilityController, 'estimate']);
$router->add('GET', '/api/v1/fertility/sdm-status', [$fertilityController, 'sdmStatus']);
$router->add('POST', '/api/v1/acknowledgements', [$fertilityController, 'acknowledge']);

// Offline Sync Endpoints (Idempotent & Conflict-aware)
$router->add('POST', '/api/v1/sync/push', [$syncController, 'push']);
$router->add('GET', '/api/v1/sync/pull', [$syncController, 'pull']);

// Educational Articles
$router->add('GET', '/api/v1/educational-articles', [$articleController, 'index']);

// User & Settings
$router->add('GET', '/api/v1/me', [$userController, 'me']);
$router->add('PUT', '/api/v1/me/settings', [$userController, 'updateSettings']);
$router->add('GET', '/api/v1/export', [$userController, 'export']);
$router->add('DELETE', '/api/v1/me/data', [$userController, 'deleteData']);

return $router;

