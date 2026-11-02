<?php
declare(strict_types=1);

namespace HaidKu\Controllers;

use HaidKu\Repositories\UserRepository;
use HaidKu\Middleware\AuthMiddleware;
use Exception;

class UserController
{
    private UserRepository $userRepo;

    public function __construct(UserRepository $userRepo)
    {
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

    public function me(): void
    {
        $userId = AuthMiddleware::getUserId();
        $user = $this->userRepo->getOrCreateUser($userId);

        $this->jsonResponse([
            'status' => 'success',
            'data'   => $user,
        ]);
    }

    public function updateSettings(): void
    {
        $userId = AuthMiddleware::getUserId();
        $payload = $this->getPayload();

        $updated = $this->userRepo->updateSettings($userId, $payload);
        $this->jsonResponse([
            'status'  => 'success',
            'message' => 'Pengaturan berhasil diperbarui.',
            'data'    => $updated,
        ]);
    }

    public function export(): void
    {
        $userId = AuthMiddleware::getUserId();
        $exportData = $this->userRepo->exportData($userId);

        $this->jsonResponse([
            'status' => 'success',
            'data'   => $exportData,
        ]);
    }

    public function deleteData(): void
    {
        $userId = AuthMiddleware::getUserId();
        try {
            $this->userRepo->deleteData($userId);
            $this->jsonResponse([
                'status'  => 'success',
                'message' => 'Seluruh data pengguna berhasil dihapus secara permanen.',
            ]);
        } catch (Exception $e) {
            $this->jsonResponse([
                'status'  => 'error',
                'message' => 'Gagal menghapus data: ' . $e->getMessage(),
            ], 500);
        }
    }
}

