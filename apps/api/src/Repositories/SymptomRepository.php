<?php

declare(strict_types=1);

namespace HaidKu\Repositories;

use PDO;
use HaidKu\Config\Database;

/**
 * SymptomRepository — Data access for daily_symptoms
 * Isolated by user_id for strict privacy (UU No. 27/2022 PDP)
 */
class SymptomRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getByDate(string $userId, string $date): ?array
    {
        $stmt = $this->db->prepare('
            SELECT id, user_id, observation_date, pain_scale, flow_level, mood,
                   symptom_codes_json, notes_encrypted, created_at, updated_at
            FROM daily_symptoms
            WHERE user_id = :user_id AND observation_date = :date
            LIMIT 1
        ');
        $stmt->execute(['user_id' => $userId, 'date' => $date]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        if ($row['symptom_codes_json']) {
            $row['symptoms'] = json_decode($row['symptom_codes_json'], true) ?: [];
        } else {
            $row['symptoms'] = [];
        }
        unset($row['symptom_codes_json']);

        return $row;
    }

    public function listByRange(string $userId, ?string $from = null, ?string $to = null): array
    {
        $sql = '
            SELECT id, user_id, observation_date, pain_scale, flow_level, mood,
                   symptom_codes_json, notes_encrypted, created_at, updated_at
            FROM daily_symptoms
            WHERE user_id = :user_id
        ';
        $params = ['user_id' => $userId];

        if ($from) {
            $sql .= ' AND observation_date >= :from';
            $params['from'] = $from;
        }
        if ($to) {
            $sql .= ' AND observation_date <= :to';
            $params['to'] = $to;
        }

        $sql .= ' ORDER BY observation_date DESC LIMIT 100';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($row) {
            if ($row['symptom_codes_json']) {
                $row['symptoms'] = json_decode($row['symptom_codes_json'], true) ?: [];
            } else {
                $row['symptoms'] = [];
            }
            unset($row['symptom_codes_json']);
            return $row;
        }, $rows);
    }

    public function upsert(string $userId, array $data): array
    {
        // Pastikan user ada
        $userStmt = $this->db->prepare('
            INSERT IGNORE INTO users (id, timezone, locale)
            VALUES (:id, :tz, :locale)
        ');
        $userStmt->execute([
            'id'     => $userId,
            'tz'     => 'Asia/Jakarta',
            'locale' => 'id_ID',
        ]);

        $id = $data['id'] ?? self::generateUuid();
        $date = $data['observation_date'];
        $pain = isset($data['pain_scale']) && $data['pain_scale'] !== '' ? (int)$data['pain_scale'] : null;
        $flow = $data['flow_level'] ?? null;
        $mood = $data['mood'] ?? null;
        $symptomsJson = isset($data['symptoms']) ? json_encode((array)$data['symptoms']) : null;
        $notes = $data['notes_encrypted'] ?? null;

        $stmt = $this->db->prepare('
            INSERT INTO daily_symptoms (id, user_id, observation_date, pain_scale, flow_level, mood, symptom_codes_json, notes_encrypted)
            VALUES (:id, :user_id, :date, :pain, :flow, :mood, :symptoms, :notes)
            ON DUPLICATE KEY UPDATE
                pain_scale = VALUES(pain_scale),
                flow_level = VALUES(flow_level),
                mood = VALUES(mood),
                symptom_codes_json = VALUES(symptom_codes_json),
                notes_encrypted = VALUES(notes_encrypted),
                updated_at = CURRENT_TIMESTAMP
        ');

        $stmt->execute([
            'id'       => $id,
            'user_id'  => $userId,
            'date'     => $date,
            'pain'     => $pain,
            'flow'     => $flow,
            'mood'     => $mood,
            'symptoms' => $symptomsJson,
            'notes'    => $notes,
        ]);

        return $this->getByDate($userId, $date);
    }

    public function delete(string $userId, string $date): bool
    {
        $stmt = $this->db->prepare('
            DELETE FROM daily_symptoms
            WHERE user_id = :user_id AND observation_date = :date
        ');
        $stmt->execute(['user_id' => $userId, 'date' => $date]);
        return $stmt->rowCount() > 0;
    }

    private static function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
