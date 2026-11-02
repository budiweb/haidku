<?php
declare(strict_types=1);

namespace HaidKu\Controllers;

use PDO;

class ArticleController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public function index(): void
    {
        $stmt = $this->db->query(
            "SELECT id, slug, title, category, excerpt, body, reference_urls_json, version, status, created_at
             FROM educational_articles
             WHERE status = 'published'
             ORDER BY id ASC"
        );
        $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($articles as &$art) {
            if (!empty($art['reference_urls_json'])) {
                $art['reference_urls'] = json_decode($art['reference_urls_json'], true);
            } else {
                $art['reference_urls'] = [];
            }
            unset($art['reference_urls_json']);
        }

        $this->jsonResponse([
            'status' => 'success',
            'data'   => $articles,
        ]);
    }
}
