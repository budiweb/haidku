<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Repositories/SyncRepository.php';
require_once __DIR__ . '/../src/Repositories/PeriodRepository.php';
require_once __DIR__ . '/../src/Repositories/UserRepository.php';

use HaidKu\Config\Database;
use HaidKu\Repositories\SyncRepository;
use HaidKu\Repositories\PeriodRepository;
use HaidKu\Repositories\UserRepository;

class SyncTest
{
    private SyncRepository $syncRepo;
    private PeriodRepository $periodRepo;
    private UserRepository $userRepo;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->syncRepo = new SyncRepository($db);
        $this->periodRepo = new PeriodRepository($db);
        $this->userRepo = new UserRepository($db);
    }

    private function assertEqual($actual, $expected, string $name): void
    {
        if ($actual === $expected) {
            echo "  [PASS] $name\n";
            $this->passed++;
        } else {
            echo "  [FAIL] $name: Ekspektasi " . var_export($expected, true) . ", tetapi didapat " . var_export($actual, true) . "\n";
            $this->failed++;
        }
    }

    public function run(): bool
    {
        echo "Menjalankan SyncTest (Idempotency, Concurrency & Conflict Detection T21, T26, T27)...\n";

        $testUser = 'sync-test-user-' . bin2hex(random_bytes(4));
        $this->userRepo->getOrCreateUser($testUser);

        $mutationId1 = 'mut-sync-01-' . bin2hex(random_bytes(4));
        $periodId1 = 'period-sync-01-' . bin2hex(random_bytes(4));

        // 1. T21 & T27: Push batch pertama kali
        $batch = [
            [
                'client_mutation_id' => $mutationId1,
                'entity_type'        => 'period',
                'action'             => 'create',
                'payload'            => [
                    'id'            => $periodId1,
                    'start_date'    => '2026-09-01',
                    'end_date'      => '2026-09-05',
                    'bleeding_type' => 'period',
                    'flow_level'    => 'medium',
                    'note'          => 'Catatan offline sync 1',
                ],
            ]
        ];

        $res1 = $this->syncRepo->applyPushBatch($testUser, $batch);
        $this->assertEqual(count($res1['applied']), 1, 'T21: Batch mutasi pertama berhasil diterapkan');
        $this->assertEqual(count($res1['duplicates']), 0, 'Tidak ada duplikat pada pengiriman pertama');

        // Verifikasi record ada di database
        $saved = $this->periodRepo->getById($testUser, $periodId1);
        $this->assertEqual($saved !== null, true, 'Record tersimpan di database MySQL');
        $this->assertEqual((int)$saved['record_version'], 1, 'Record version awal adalah 1');

        // 2. T27: Simulasi retry jaringan dengan client_mutation_id yang sama
        $resDuplicate = $this->syncRepo->applyPushBatch($testUser, $batch);
        $this->assertEqual(count($resDuplicate['duplicates']), 1, 'T27: Mutasi identik kedua terdeteksi sebagai duplikat (Idempotent)');
        $this->assertEqual(count($resDuplicate['applied']), 0, 'Tidak ada record ganda yang dibuat');

        // 3. Update mutasi versi baru
        $mutationId2 = 'mut-sync-02-' . bin2hex(random_bytes(4));
        $updateBatch = [
            [
                'client_mutation_id' => $mutationId2,
                'entity_type'        => 'period',
                'action'             => 'update',
                'payload'            => [
                    'id'             => $periodId1,
                    'start_date'     => '2026-09-01',
                    'end_date'       => '2026-09-06', // diubah jadi 6 hari
                    'record_version' => 1, // Cocok dengan server_version
                ],
            ]
        ];
        $resUpdate = $this->syncRepo->applyPushBatch($testUser, $updateBatch);
        $this->assertEqual(count($resUpdate['applied']), 1, 'Update berhasil diterapkan');

        $updatedPeriod = $this->periodRepo->getById($testUser, $periodId1);
        $this->assertEqual((int)$updatedPeriod['record_version'], 2, 'T26: record_version di server bertambah jadi 2');

        // 4. T26: Simulasi konflik versi (perangkat offline lain mengirim mutasi lama dengan record_version=1 saat server sudah version=2)
        $mutationIdConflict = 'mut-sync-conflict-' . bin2hex(random_bytes(4));
        $staleBatch = [
            [
                'client_mutation_id' => $mutationIdConflict,
                'entity_type'        => 'period',
                'action'             => 'update',
                'payload'            => [
                    'id'             => $periodId1,
                    'start_date'     => '2026-09-02',
                    'record_version' => 1, // Ketinggalan versi!
                ],
            ]
        ];
        $resConflict = $this->syncRepo->applyPushBatch($testUser, $staleBatch);
        $this->assertEqual(count($resConflict['conflicts']), 1, 'T26: Mutasi dengan versi lama berhasil mendeteksi VERSION_CONFLICT');
        $this->assertEqual($resConflict['conflicts'][0]['conflict_type'], 'VERSION_CONFLICT', 'Conflict type adalah VERSION_CONFLICT');

        // 5. Pull changes
        $pullRes = $this->syncRepo->pullChanges($testUser);
        $this->assertEqual(count($pullRes['periods']) >= 1, true, 'Pull changes berhasil mengambil daftar periode pengguna');

        // Cleanup
        $this->userRepo->deleteData($testUser);

        echo "\nHasil SyncTest: {$this->passed} Passed, {$this->failed} Failed\n";
        return $this->failed === 0;
    }
}
