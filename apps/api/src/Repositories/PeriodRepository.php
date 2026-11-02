<?php
declare(strict_types=1);

namespace HaidKu\Repositories;

use PDO;
use Exception;
use InvalidArgumentException;
use RuntimeException;

class PeriodRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    private function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40); // v4
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80); // variant
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    public function getAllByUser(string $userId, ?string $from = null, ?string $to = null): array
    {
        $sql = "SELECT id, user_id, start_date, end_date, bleeding_type, flow_level, status, note, record_version, client_mutation_id, created_at, updated_at
                FROM menstrual_periods
                WHERE user_id = :user_id AND deleted_at IS NULL";
        $params = [':user_id' => $userId];

        if ($from !== null) {
            $sql .= " AND start_date >= :from_date";
            $params[':from_date'] = $from;
        }

        if ($to !== null) {
            $sql .= " AND start_date <= :to_date";
            $params[':to_date'] = $to;
        }

        $sql .= " ORDER BY start_date DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(string $userId, string $periodId): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT id, user_id, start_date, end_date, bleeding_type, flow_level, status, note, record_version, client_mutation_id, created_at, updated_at
             FROM menstrual_periods
             WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL"
        );
        $stmt->execute([':id' => $periodId, ':user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function create(string $userId, array $data): array
    {
        // Pastikan user record tersedia untuk relasi FK
        $stmtUser = $this->db->prepare("INSERT IGNORE INTO users (id, timezone, locale) VALUES (:id, 'Asia/Jakarta', 'id_ID')");
        $stmtUser->execute([':id' => $userId]);

        // Validasi tanggal
        $startDate = $data['start_date'] ?? null;
        if (!$startDate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
            throw new InvalidArgumentException("Format tanggal mulai tidak valid (YYYY-MM-DD diperlukan).");
        }

        $endDate = !empty($data['end_date']) ? $data['end_date'] : null;
        if ($endDate !== null) {
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
                throw new InvalidArgumentException("Format tanggal selesai tidak valid (YYYY-MM-DD diperlukan).");
            }
            if ($endDate < $startDate) {
                throw new InvalidArgumentException("Tanggal selesai tidak boleh sebelum tanggal mulai.");
            }
        }

        $bleedingType = in_array($data['bleeding_type'] ?? '', ['period', 'spotting'], true)
            ? $data['bleeding_type']
            : 'period';

        $flowLevel = in_array($data['flow_level'] ?? '', ['light', 'medium', 'heavy'], true)
            ? $data['flow_level']
            : 'medium';

        $status = in_array($data['status'] ?? '', ['confirmed', 'draft'], true)
            ? $data['status']
            : 'confirmed';

        $note = $data['note'] ?? null;
        $mutationId = $data['client_mutation_id'] ?? null;

        // Idempotency check jika client_mutation_id ada
        if (!empty($mutationId)) {
            $stmtMut = $this->db->prepare(
                "SELECT id, user_id, start_date, end_date, bleeding_type, flow_level, status, note, record_version, client_mutation_id
                 FROM menstrual_periods
                 WHERE user_id = :user_id AND client_mutation_id = :mutation_id AND deleted_at IS NULL"
            );
            $stmtMut->execute([':user_id' => $userId, ':mutation_id' => $mutationId]);
            $existing = $stmtMut->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                return $existing;
            }
        }

        // Cek overlap tumpang-tindih untuk jenis perdarahan menstruasi yang sama pada tanggal mulai yang sama
        $stmtDup = $this->db->prepare(
            "SELECT id FROM menstrual_periods
             WHERE user_id = :user_id AND start_date = :start_date AND deleted_at IS NULL"
        );
        $stmtDup->execute([':user_id' => $userId, ':start_date' => $startDate]);
        $duplicate = $stmtDup->fetch();
        if ($duplicate) {
            throw new InvalidArgumentException("Catatan menstruasi pada tanggal mulai {$startDate} sudah ada. Silakan edit catatan yang ada.");
        }

        $id = $data['id'] ?? $this->generateUuid();

        $stmt = $this->db->prepare(
            "INSERT INTO menstrual_periods (id, user_id, start_date, end_date, bleeding_type, flow_level, status, note, client_mutation_id, record_version)
             VALUES (:id, :user_id, :start_date, :end_date, :bleeding_type, :flow_level, :status, :note, :client_mutation_id, 1)"
        );

        $stmt->execute([
            ':id'                 => $id,
            ':user_id'            => $userId,
            ':start_date'         => $startDate,
            ':end_date'           => $endDate,
            ':bleeding_type'      => $bleedingType,
            ':flow_level'         => $flowLevel,
            ':status'             => $status,
            ':note'               => $note,
            ':client_mutation_id' => $mutationId,
        ]);

        return $this->getById($userId, $id) ?? [];
    }

    public function update(string $userId, string $periodId, array $data): array
    {
        $existing = $this->getById($userId, $periodId);
        if (!$existing) {
            throw new RuntimeException("Catatan tidak ditemukan atau Anda tidak memiliki akses.");
        }

        $startDate = $data['start_date'] ?? $existing['start_date'];
        $endDate = array_key_exists('end_date', $data) ? $data['end_date'] : $existing['end_date'];
        if ($endDate === '') {
            $endDate = null;
        }

        if ($endDate !== null && $endDate < $startDate) {
            throw new InvalidArgumentException("Tanggal selesai tidak boleh sebelum tanggal mulai.");
        }

        $bleedingType = $data['bleeding_type'] ?? $existing['bleeding_type'];
        $flowLevel = $data['flow_level'] ?? $existing['flow_level'];
        $status = $data['status'] ?? $existing['status'];
        $note = array_key_exists('note', $data) ? $data['note'] : $existing['note'];
        $newVersion = ((int)$existing['record_version']) + 1;

        $stmt = $this->db->prepare(
            "UPDATE menstrual_periods
             SET start_date = :start_date,
                 end_date = :end_date,
                 bleeding_type = :bleeding_type,
                 flow_level = :flow_level,
                 status = :status,
                 note = :note,
                 record_version = :record_version,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL"
        );

        $stmt->execute([
            ':start_date'     => $startDate,
            ':end_date'       => $endDate,
            ':bleeding_type'  => $bleedingType,
            ':flow_level'     => $flowLevel,
            ':status'         => $status,
            ':note'           => $note,
            ':record_version' => $newVersion,
            ':id'             => $periodId,
            ':user_id'        => $userId,
        ]);

        return $this->getById($userId, $periodId) ?? [];
    }

    public function delete(string $userId, string $periodId): bool
    {
        $existing = $this->getById($userId, $periodId);
        if (!$existing) {
            throw new RuntimeException("Catatan tidak ditemukan atau Anda tidak memiliki akses.");
        }

        // Soft delete untuk integritas audit sync
        $stmt = $this->db->prepare(
            "UPDATE menstrual_periods
             SET deleted_at = CURRENT_TIMESTAMP
             WHERE id = :id AND user_id = :user_id"
        );
        return $stmt->execute([':id' => $periodId, ':user_id' => $userId]);
    }
}
