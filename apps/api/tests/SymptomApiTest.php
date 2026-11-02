<?php

declare(strict_types=1);

namespace HaidKu\Tests;

require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Repositories/SymptomRepository.php';

use HaidKu\Repositories\SymptomRepository;

class SymptomApiTest
{
    private SymptomRepository $repo;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->repo = new SymptomRepository();
    }

    private function assert(bool $condition, string $message): void
    {
        if ($condition) {
            $this->passed++;
            echo "  [PASS] $message\n";
        } else {
            $this->failed++;
            echo "  [FAIL] $message\n";
        }
    }

    public function run(): bool
    {
        echo "\nMenjalankan SymptomApiTest (ERD daily_symptoms & Ownership Isolation)...\n";

        $userA = 'test-symptom-user-a-' . bin2hex(random_bytes(4));
        $userB = 'test-symptom-user-b-' . bin2hex(random_bytes(4));
        $date = '2026-11-03';

        // 1. Simpan gejala hari ini oleh User A
        $symptomData = [
            'observation_date' => $date,
            'pain_scale'       => 3,
            'flow_level'       => 'medium',
            'mood'             => 'sensitive',
            'symptoms'         => ['cramps', 'headache', 'bloating'],
            'notes_encrypted'  => 'Kram ringan di pagi hari',
        ];

        $saved = $this->repo->upsert($userA, $symptomData);
        $this->assert($saved !== null, 'User A berhasil mencatat gejala harian');
        $this->assert((int)$saved['pain_scale'] === 3, 'Skala nyeri tercatat 3');
        $this->assert(in_array('cramps', $saved['symptoms'], true), 'Gejala kram perut tercatat');

        // 2. Isolasi data: User B tidak boleh membaca gejala User A
        $userBRecord = $this->repo->getByDate($userB, $date);
        $this->assert($userBRecord === null, 'T19: User B tidak dapat membaca gejala User A (Ownership Isolation)');

        // 3. User A update gejalanya (upsert di tanggal yang sama)
        $updateData = [
            'observation_date' => $date,
            'pain_scale'       => 1,
            'flow_level'       => 'light',
            'mood'             => 'calm',
            'symptoms'         => ['bloating'],
            'notes_encrypted'  => 'Mulai membaik di sore hari',
        ];
        $updated = $this->repo->upsert($userA, $updateData);
        $this->assert((int)$updated['pain_scale'] === 1, 'Skala nyeri terupdate menjadi 1');
        $this->assert($updated['mood'] === 'calm', 'Mood terupdate menjadi calm');

        // 4. List by range
        $list = $this->repo->listByRange($userA, '2026-11-01', '2026-11-30');
        $this->assert(count($list) === 1, 'List gejala dalam rentang tanggal berhasil');

        // 5. User B tidak dapat menghapus data User A
        $deletedByB = $this->repo->delete($userB, $date);
        $this->assert($deletedByB === false, 'User B gagal menghapus gejala User A');

        // 6. User A menghapus gejalanya sendiri
        $deletedByA = $this->repo->delete($userA, $date);
        $this->assert($deletedByA === true, 'User A berhasil menghapus gejalanya');

        $checkAfterDelete = $this->repo->getByDate($userA, $date);
        $this->assert($checkAfterDelete === null, 'Data gejala terhapus bersih dari database');

        echo "Hasil SymptomApiTest: {$this->passed} Passed, {$this->failed} Failed\n";
        return $this->failed === 0;
    }
}
