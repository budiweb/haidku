<?php

declare(strict_types=1);

namespace HaidKu\Controllers;

use HaidKu\Repositories\SymptomRepository;
use HaidKu\Middleware\AuthMiddleware;

class SymptomController
{
    private SymptomRepository $repo;

    public function __construct()
    {
        $this->repo = new SymptomRepository();
    }

    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public function list(): void
    {
        $userId = AuthMiddleware::getUserId();
        $from = $_GET['from'] ?? null;
        $to = $_GET['to'] ?? null;

        $items = $this->repo->listByRange($userId, $from, $to);
        $this->jsonResponse(['status' => 'success', 'data' => $items, 'count' => count($items)]);
    }

    public function getByDate(string $date): void
    {
        $userId = AuthMiddleware::getUserId();
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Format tanggal harus YYYY-MM-DD'], 400);
        }

        $item = $this->repo->getByDate($userId, $date);
        if (!$item) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Gejala pada tanggal tersebut belum dicatat'], 404);
        }

        $this->jsonResponse(['status' => 'success', 'data' => $item]);
    }

    public function upsert(): void
    {
        $userId = AuthMiddleware::getUserId();
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true) ?: $_POST;

        if (empty($body['observation_date'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'observation_date (YYYY-MM-DD) wajib diisi'], 400);
        }

        $date = $body['observation_date'];
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Format tanggal harus YYYY-MM-DD'], 400);
        }

        $record = $this->repo->upsert($userId, $body);

        $this->jsonResponse([
            'status'  => 'success',
            'message' => 'Gejala harian berhasil disimpan',
            'data'    => $record,
        ]);
    }

    public function delete(string $date): void
    {
        $userId = AuthMiddleware::getUserId();
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Format tanggal harus YYYY-MM-DD'], 400);
        }

        $deleted = $this->repo->delete($userId, $date);
        if (!$deleted) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Catatan gejala tidak ditemukan'], 404);
        }

        $this->jsonResponse(['status' => 'success', 'message' => 'Catatan gejala berhasil dihapus']);
    }
}
