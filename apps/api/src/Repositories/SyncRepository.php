<?php
declare(strict_types=1);

namespace HaidKu\Repositories;

use PDO;
use Exception;
use RuntimeException;

class SyncRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * T21 & T27: Menerapkan batch mutasi secara idempoten dan dalam satu transaksi basis data
     *
     * @param string $userId
     * @param array $mutations Array of [client_mutation_id, entity_type, action, payload, record_version]
     * @return array [applied => [...], duplicates => [...], conflicts => [...]]
     */
    public function applyPushBatch(string $userId, array $mutations): array
    {
        $this->db->beginTransaction();

        $applied = [];
        $duplicates = [];
        $conflicts = [];

        try {
            foreach ($mutations as $m) {
                $mutationId = $m['client_mutation_id'] ?? null;
                $entityType = $m['entity_type'] ?? 'period';
                $action = $m['action'] ?? 'create'; // create, update, delete
                $payload = $m['payload'] ?? [];
                $entityId = $payload['id'] ?? ($m['entity_id'] ?? null);

                if (!$mutationId || !$entityId) {
                    continue;
                }

                // 1. Cek Deduplikasi mutasi (Idempotency check T27)
                $stmtCheck = $this->db->prepare(
                    "SELECT client_mutation_id, applied_at_utc FROM sync_mutations
                     WHERE user_id = :user_id AND client_mutation_id = :mutation_id"
                );
                $stmtCheck->execute([
                    ':user_id'     => $userId,
                    ':mutation_id' => $mutationId,
                ]);
                $alreadyApplied = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                if ($alreadyApplied) {
                    $duplicates[] = [
                        'client_mutation_id' => $mutationId,
                        'entity_id'          => $entityId,
                        'status'             => 'already_applied',
                    ];
                    continue;
                }

                // 2. Terapkan berdasarkan entitas
                if ($entityType === 'period') {
                    $result = $this->applyPeriodMutation($userId, $action, $entityId, $payload, $mutationId);
                    if (isset($result['conflict'])) {
                        $conflicts[] = $result['conflict'];
                        continue;
                    }
                } elseif ($entityType === 'settings') {
                    $this->applySettingsMutation($userId, $payload);
                }

                // 3. Catat mutasi sukses ke tabel sync_mutations
                $stmtRecord = $this->db->prepare(
                    "INSERT INTO sync_mutations (id, user_id, client_mutation_id, entity_type, entity_id, action)
                     VALUES (:id, :user_id, :mutation_id, :entity_type, :entity_id, :action)"
                );
                $syncId = 'sync_' . bin2hex(random_bytes(16));
                $stmtRecord->execute([
                    ':id'          => $syncId,
                    ':user_id'     => $userId,
                    ':mutation_id' => $mutationId,
                    ':entity_type' => $entityType,
                    ':entity_id'   => $entityId,
                    ':action'      => $action,
                ]);

                $applied[] = [
                    'client_mutation_id' => $mutationId,
                    'entity_id'          => $entityId,
                    'status'             => 'applied',
                ];
            }

            $this->db->commit();

            return [
                'applied'    => $applied,
                'duplicates' => $duplicates,
                'conflicts'  => $conflicts,
                'new_cursor' => gmdate('Y-m-d\TH:i:s\Z'),
            ];
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    private function applyPeriodMutation(string $userId, string $action, string $entityId, array $payload, string $mutationId): array
    {
        if ($action === 'create' || $action === 'update' || $action === 'upsert') {
            $startDate = $payload['start_date'] ?? null;
            $endDate = $payload['end_date'] ?? null;
            $bleeding = $payload['bleeding_type'] ?? 'period';
            $flow = $payload['flow_level'] ?? 'medium';
            $note = $payload['note'] ?? null;

            // Cek apakah ada bentrok record_version atau tanggal
            $stmtEx = $this->db->prepare(
                "SELECT id, record_version, start_date, end_date FROM menstrual_periods
                 WHERE id = :id AND user_id = :user_id"
            );
            $stmtEx->execute([':id' => $entityId, ':user_id' => $userId]);
            $existing = $stmtEx->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Optimistic concurrency check (T26)
                $clientVersion = (int)($payload['record_version'] ?? 1);
                $serverVersion = (int)$existing['record_version'];

                if ($clientVersion < $serverVersion) {
                    return [
                        'conflict' => [
                            'entity_id'          => $entityId,
                            'client_mutation_id' => $mutationId,
                            'conflict_type'      => 'VERSION_CONFLICT',
                            'server_version'     => $serverVersion,
                            'client_version'     => $clientVersion,
                            'message'            => 'Data di server telah diperbarui oleh perangkat lain.',
                        ]
                    ];
                }

                $newVersion = $serverVersion + 1;
                $stmtUp = $this->db->prepare(
                    "UPDATE menstrual_periods
                     SET start_date = :start_date, end_date = :end_date, bleeding_type = :bleeding,
                         flow_level = :flow, note = :note, record_version = :version, updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id AND user_id = :user_id"
                );
                $stmtUp->execute([
                    ':start_date' => $startDate,
                    ':end_date'   => $endDate,
                    ':bleeding'   => $bleeding,
                    ':flow'       => $flow,
                    ':note'       => $note,
                    ':version'    => $newVersion,
                    ':id'         => $entityId,
                    ':user_id'    => $userId,
                ]);
            } else {
                $stmtIns = $this->db->prepare(
                    "INSERT INTO menstrual_periods (id, user_id, start_date, end_date, bleeding_type, flow_level, note, record_version, client_mutation_id)
                     VALUES (:id, :user_id, :start_date, :end_date, :bleeding, :flow, :note, 1, :mutation_id)"
                );
                $stmtIns->execute([
                    ':id'          => $entityId,
                    ':user_id'     => $userId,
                    ':start_date'  => $startDate,
                    ':end_date'    => $endDate,
                    ':bleeding'    => $bleeding,
                    ':flow'        => $flow,
                    ':note'        => $note,
                    ':mutation_id' => $mutationId,
                ]);
            }
        } elseif ($action === 'delete') {
            $stmtDel = $this->db->prepare(
                "UPDATE menstrual_periods SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id AND user_id = :user_id"
            );
            $stmtDel->execute([':id' => $entityId, ':user_id' => $userId]);
        }

        return ['success' => true];
    }

    private function applySettingsMutation(string $userId, array $payload): void
    {
        $goal = in_array($payload['goal'] ?? '', ['track', 'conceive', 'avoid'], true) ? $payload['goal'] : null;
        $notif = isset($payload['notification_enabled']) ? (int)$payload['notification_enabled'] : null;
        $privacy = in_array($payload['notification_privacy_mode'] ?? '', ['private', 'detailed'], true) ? $payload['notification_privacy_mode'] : null;

        $fields = [];
        $params = [':user_id' => $userId];

        if ($goal !== null) {
            $fields[] = "goal = :goal";
            $params[':goal'] = $goal;
        }
        if ($notif !== null) {
            $fields[] = "notification_enabled = :notif";
            $params[':notif'] = $notif;
        }
        if ($privacy !== null) {
            $fields[] = "notification_privacy_mode = :privacy";
            $params[':privacy'] = $privacy;
        }

        if (!empty($fields)) {
            $sql = "UPDATE user_settings SET " . implode(', ', $fields) . " WHERE user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }
    }

    /**
     * Mengambil perubahan data dari server sejak waktu cursor tertentu (Pull sync)
     */
    public function pullChanges(string $userId, ?string $since = null): array
    {
        $sql = "SELECT id, user_id, start_date, end_date, bleeding_type, flow_level, status, note, record_version, updated_at, deleted_at
                FROM menstrual_periods
                WHERE user_id = :user_id";
        $params = [':user_id' => $userId];

        if ($since !== null && $since !== '') {
            $sql .= " AND updated_at >= :since";
            $params[':since'] = $since;
        }

        $sql .= " ORDER BY updated_at ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $periods = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'periods'    => $periods,
            'new_cursor' => gmdate('Y-m-d\TH:i:s\Z'),
        ];
    }
}
