<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/Services/CycleCalculatorService.php';

use HaidKu\Services\CycleCalculatorService;

class CycleCalculatorTest
{
    private CycleCalculatorService $service;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->service = new CycleCalculatorService();
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
        echo "Menjalankan CycleCalculatorTest...\n";

        // T01: 1 Jan -> 29 Jan = 28 hari siklus
        $daysBetween = $this->service->calculateDaysBetween('2026-01-01', '2026-01-29');
        $this->assertEqual($daysBetween, 28, 'T01: Selisih hari 1 Jan ke 29 Jan adalah 28 hari');

        // T02: 1 Jan sampai 5 Jan = 5 hari menstruasi inklusif
        $duration = $this->service->calculatePeriodLength('2026-01-01', '2026-01-05');
        $this->assertEqual($duration, 5, 'T02: Durasi menstruasi 1 Jan s/d 5 Jan adalah 5 hari inklusif');

        // T02b: 1 hari tunggal (start == end)
        $durationSingle = $this->service->calculatePeriodLength('2026-01-01', '2026-01-01');
        $this->assertEqual($durationSingle, 1, 'T02b: Durasi 1 hari tunggal adalah 1 hari');

        // T17: Tahun kabisat (2024-02-28 ke 2024-03-01 = 2 hari)
        $leapDays = $this->service->calculateDaysBetween('2024-02-28', '2024-03-01');
        $this->assertEqual($leapDays, 2, 'T17: Tahun kabisat 28 Feb 2024 ke 1 Mar 2024 adalah 2 hari');

        // T17b: Bukan tahun kabisat (2025-02-28 ke 2025-03-01 = 1 hari)
        $nonLeapDays = $this->service->calculateDaysBetween('2025-02-28', '2025-03-01');
        $this->assertEqual($nonLeapDays, 1, 'T17b: Non-kabisat 28 Feb 2025 ke 1 Mar 2025 adalah 1 hari');

        // Current Cycle Day
        $cDay = $this->service->calculateCurrentCycleDay('2026-01-01', '2026-01-01');
        $this->assertEqual($cDay, 1, 'Current cycle day pada hari pertama haid adalah 1');

        $cDay8 = $this->service->calculateCurrentCycleDay('2026-01-01', '2026-01-08');
        $this->assertEqual($cDay8, 8, 'Current cycle day setelah 7 hari adalah hari ke-8');

        // T11: Flek/spotting tidak boleh dihitung sebagai Day 1 siklus baru
        $samplePeriods = [
            ['start_date' => '2026-03-01', 'end_date' => '2026-03-05', 'bleeding_type' => 'period', 'status' => 'confirmed'],
            ['start_date' => '2026-02-12', 'end_date' => '2026-02-13', 'bleeding_type' => 'spotting', 'status' => 'confirmed'], // spotting
            ['start_date' => '2026-02-01', 'end_date' => '2026-02-05', 'bleeding_type' => 'period', 'status' => 'confirmed'],
            ['start_date' => '2026-01-04', 'end_date' => '2026-01-08', 'bleeding_type' => 'period', 'status' => 'confirmed'],
        ];

        $stats = $this->service->computeCycleStats($samplePeriods, '2026-03-10');
        $this->assertEqual($stats['valid_periods_count'], 3, 'T11: Spotting difilter sehingga hanya 3 siklus menstruasi sah');
        $this->assertEqual($stats['completed_cycles_count'], 2, '2 siklus lengkap berhasil dihitung');
        $this->assertEqual($stats['cycle_lengths'], [28, 28], 'Panjang siklus adalah [28, 28]');
        $this->assertEqual($stats['median_cycle_length'], 28, 'Median siklus adalah 28');
        $this->assertEqual($stats['current_cycle_day'], 10, 'Hari ke-10 siklus pada tanggal 2026-03-10');

        echo "\nHasil: {$this->passed} Passed, {$this->failed} Failed\n";
        return $this->failed === 0;
    }
}

