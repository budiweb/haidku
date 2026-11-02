<?php
declare(strict_types=1);

namespace HaidKu\Controllers;

use HaidKu\Repositories\SyncRepository;
use HaidKu\Repositories\UserRepository;
use HaidKu\Middleware\AuthMiddleware;
use Exception;

class SyncController
{
    private SyncRepository $syncRepo;
    private UserRepository $userRepo;

    public function __construct(SyncRepository $syncRepo, UserRepository $userRepo)
    {
        $this->syncRepo = $syncRepo;
        $this->userRepo = $userRepo;
    }

    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    private function getPayload(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return $_POST;
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /**
     * POST /api/v1/sync/push
     * Mengirim antrean mutasi offline secara idempoten
     */
    public function push(): void
    {
        $userId = AuthMiddleware::getUserId();
        $this->userRepo->getOrCreateUser($userId);

        $payload = $this->getPayload();
        $mutations = $payload['mutations'] ?? [];

        if (!is_array($mutations) || count($mutations) === 0) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => 'Daftar mutasi (mutations) kosong atau tidak valid.',
            ], 422);
        }

        try {
            $result = $this->syncRepo->applyPushBatch($userId, $mutations);
            $this->jsonResponse([
                'status'  => 'success',
                'message' => 'Mutasi berhasil disinkronkan.',
                'data'    => $result,
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => 'Gagal menerapkan sinkronisasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/v1/sync/pull
     * Menarik perubahan terbaru dari server sejak cursor
     */
    public function pull(): void
    {
        $userId = AuthMiddleware::getUserId();
        $this->userRepo->getOrCreateUser($userId);

        $since = $_GET['since'] ?? null;

        try {
            $data = $this->syncRepo->pullChanges($userId, $since);
            $this->jsonResponse([
                'status' => 'success',
                'data'   => $data,
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => 'Gagal menarik perubahan data: ' . $e->getMessage(),
            ], 500);
        }
    }
}
