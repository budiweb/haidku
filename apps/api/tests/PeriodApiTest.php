<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Repositories/PeriodRepository.php';
require_once __DIR__ . '/../src/Repositories/UserRepository.php';

use HaidKu\Config\Database;
use HaidKu\Repositories\PeriodRepository;
use HaidKu\Repositories\UserRepository;

class PeriodApiTest
{
    private PeriodRepository $periodRepo;
    private UserRepository $userRepo;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $db = Database::getConnection();
        $this->periodRepo = new PeriodRepository($db);
        $this->userRepo = new UserRepository($db);
    }

    private function assert(bool $condition, string $name, string $detail = ''): void
    {
        if ($condition) {
            echo "  [PASS] $name\n";
            $this->passed++;
        } else {
            echo "  [FAIL] $name $detail\n";
            $this->failed++;
        }
    }

    public function run(): bool
    {
        echo "Menjalankan PeriodApiTest (Database & Ownership Isolation)...\n";

        $testUserA = 'test-user-alpha-' . bin2hex(random_bytes(4));
        $testUserB = 'test-user-beta-' . bin2hex(random_bytes(4));

        $this->userRepo->getOrCreateUser($testUserA);
        $this->userRepo->getOrCreateUser($testUserB);

        // 1. Simpan periode untuk User A
        $periodA = $this->periodRepo->create($testUserA, [
            'start_date'          => '2026-05-01',
            'end_date'            => '2026-05-05',
            'bleeding_type'       => 'period',
            'flow_level'          => 'medium',
            'note'                => 'Catatan haid User A',
            'client_mutation_id'  => 'mut-001-' . $testUserA,
        ]);

        $this->assert(!empty($periodA['id']), 'User A berhasil mencatat haid baru');
        $this->assert($periodA['start_date'] === '2026-05-01', 'Tanggal mulai tercatat dengan benar');

        // 2. T19: Isolasi kepemilikan data (User B tidak boleh dapat melihat catatan User A)
        $isolatedGet = $this->periodRepo->getById($testUserB, $periodA['id']);
        $this->assert($isolatedGet === null, 'T19: User B tidak dapat mengakses data User A (Ownership Isolation)');

        // 3. User B mencoba menghapus data User A
        $deleteUnauthorized = false;
        try {
            $this->periodRepo->delete($testUserB, $periodA['id']);
        } catch (\RuntimeException $e) {
            $deleteUnauthorized = true;
        }
        $this->assert($deleteUnauthorized, 'T19b: User B gagal menghapus data User A');

        // 4. Validasi tanggal: end_date < start_date harus ditolak
        $invalidDateRejected = false;
        try {
            $this->periodRepo->create($testUserA, [
                'start_date' => '2026-06-10',
                'end_date'   => '2026-06-05', // tidak sah!
            ]);
        } catch (\InvalidArgumentException $e) {
            $invalidDateRejected = true;
        }
        $this->assert($invalidDateRejected, 'Validasi: end_date < start_date ditolak oleh repository');

        // 5. T27: Idempotency dengan client_mutation_id yang sama
        $idempotentPeriod = $this->periodRepo->create($testUserA, [
            'start_date'          => '2026-05-01',
            'end_date'            => '2026-05-05',
            'client_mutation_id'  => 'mut-001-' . $testUserA,
        ]);
        $this->assert($idempotentPeriod['id'] === $periodA['id'], 'T27: Idempotent create mengembalikan record yang ada tanpa duplikasi');

        // 6. Update periode
        $updated = $this->periodRepo->update($testUserA, $periodA['id'], [
            'end_date'   => '2026-05-06',
            'flow_level' => 'heavy',
        ]);
        $this->assert($updated['end_date'] === '2026-05-06', 'Update berhasil memperbarui end_date');
        $this->assert((int)$updated['record_version'] === 2, 'record_version bertambah jadi 2');

        // 7. Delete data User A (cleanup)
        $deleted = $this->periodRepo->delete($testUserA, $periodA['id']);
        $this->assert($deleted, 'User A berhasil menghapus catatannya sendiri');

        // Verifikasi sudah tidak ada di getAll
        $all = $this->periodRepo->getAllByUser($testUserA);
        $this->assert(count($all) === 0, 'Catatan yang dihapus tidak muncul lagi');

        // Cleanup test users
        $this->userRepo->deleteData($testUserA);
        $this->userRepo->deleteData($testUserB);

        echo "\nHasil: {$this->passed} Passed, {$this->failed} Failed\n";
        return $this->failed === 0;
    }
}

