<?php
declare(strict_types=1);

namespace HaidKu\Repositories;

use PDO;

class UserRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function getOrCreateUser(string $userId, ?string $email = null): array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id AND deleted_at IS NULL");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $stmtIns = $this->db->prepare(
                "INSERT INTO users (id, email, timezone, locale)
                 VALUES (:id, :email, 'Asia/Jakarta', 'id_ID')"
            );
            $stmtIns->execute([':id' => $userId, ':email' => $email]);

            // Buat settings default
            $stmtSet = $this->db->prepare(
                "INSERT INTO user_settings (user_id, goal, notification_enabled, notification_privacy_mode, sync_opt_in)
                 VALUES (:id, 'track', 0, 'private', 0)"
            );
            $stmtSet->execute([':id' => $userId]);

            return $this->getUserWithSettings($userId);
        }

        return $this->getUserWithSettings($userId);
    }

    public function getUserWithSettings(string $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT u.id, u.email, u.timezone, u.locale, u.created_at,
                    s.goal, s.sdm_consent_at, s.notification_enabled, s.notification_time_local,
                    s.notification_privacy_mode, s.sync_opt_in, s.app_lock_enabled
             FROM users u
             LEFT JOIN user_settings s ON u.id = s.user_id
             WHERE u.id = :id AND u.deleted_at IS NULL"
        );
        $stmt->execute([':id' => $userId]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return $res ?: [];
    }

    public function updateSettings(string $userId, array $data): array
    {
        $this->getOrCreateUser($userId);

        $allowedGoals = ['track', 'conceive', 'avoid'];
        $goal = in_array($data['goal'] ?? '', $allowedGoals, true) ? $data['goal'] : null;

        $notifEnabled = isset($data['notification_enabled']) ? (int)$data['notification_enabled'] : null;
        $privacyMode = in_array($data['notification_privacy_mode'] ?? '', ['private', 'detailed'], true)
            ? $data['notification_privacy_mode']
            : null;
        $syncOptIn = isset($data['sync_opt_in']) ? (int)$data['sync_opt_in'] : null;
        $appLock = isset($data['app_lock_enabled']) ? (int)$data['app_lock_enabled'] : null;
        $sdmConsent = !empty($data['sdm_consent']) ? date('Y-m-d H:i:s') : null;

        $fields = [];
        $params = [':user_id' => $userId];

        if ($goal !== null) {
            $fields[] = "goal = :goal";
            $params[':goal'] = $goal;
        }
        if ($notifEnabled !== null) {
            $fields[] = "notification_enabled = :notif";
            $params[':notif'] = $notifEnabled;
        }
        if ($privacyMode !== null) {
            $fields[] = "notification_privacy_mode = :privacy";
            $params[':privacy'] = $privacyMode;
        }
        if ($syncOptIn !== null) {
            $fields[] = "sync_opt_in = :sync";
            $params[':sync'] = $syncOptIn;
        }
        if ($appLock !== null) {
            $fields[] = "app_lock_enabled = :app_lock";
            $params[':app_lock'] = $appLock;
        }
        if ($sdmConsent !== null) {
            $fields[] = "sdm_consent_at = :sdm_consent";
            $params[':sdm_consent'] = $sdmConsent;
        }

        if (!empty($fields)) {
            $sql = "UPDATE user_settings SET " . implode(', ', $fields) . " WHERE user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }

        return $this->getUserWithSettings($userId);
    }

    public function exportData(string $userId): array
    {
        $user = $this->getUserWithSettings($userId);

        $stmtP = $this->db->prepare(
            "SELECT id, start_date, end_date, bleeding_type, flow_level, status, note, created_at, updated_at
             FROM menstrual_periods
             WHERE user_id = :user_id AND deleted_at IS NULL
             ORDER BY start_date DESC"
        );
        $stmtP->execute([':user_id' => $userId]);
        $periods = $stmtP->fetchAll(PDO::FETCH_ASSOC);

        $stmtS = $this->db->prepare(
            "SELECT observation_date, pain_scale, flow_level, mood, notes_encrypted, created_at
             FROM daily_symptoms
             WHERE user_id = :user_id
             ORDER BY observation_date DESC"
        );
        $stmtS->execute([':user_id' => $userId]);
        $symptoms = $stmtS->fetchAll(PDO::FETCH_ASSOC);

        return [
            'app'          => 'HaidKu',
            'exported_at'  => gmdate('Y-m-d\TH:i:s\Z'),
            'user_profile' => $user,
            'periods'      => $periods,
            'symptoms'     => $symptoms,
            'notice'       => 'Data diekspor sesuai hak akses dan privasi pengguna (UU No. 27/2022 PDP).',
        ];
    }

    public function deleteData(string $userId): bool
    {
        $this->db->beginTransaction();
        try {
            // Hapus periods
            $stmt1 = $this->db->prepare("DELETE FROM menstrual_periods WHERE user_id = :id");
            $stmt1->execute([':id' => $userId]);

            // Hapus symptoms
            $stmt2 = $this->db->prepare("DELETE FROM daily_symptoms WHERE user_id = :id");
            $stmt2->execute([':id' => $userId]);

            // Hapus snapshots
            $stmt3 = $this->db->prepare("DELETE FROM computed_cycle_snapshots WHERE user_id = :id");
            $stmt3->execute([':id' => $userId]);

            // Soft-delete user
            $stmt4 = $this->db->prepare("UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id");
            $stmt4->execute([':id' => $userId]);

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
