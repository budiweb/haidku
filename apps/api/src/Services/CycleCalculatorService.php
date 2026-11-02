<?php
declare(strict_types=1);

namespace HaidKu\Services;

use DateTimeImmutable;
use InvalidArgumentException;

class CycleCalculatorService
{
    /**
     * T01: Menghitung panjang siklus dari hari pertama dua haid berurutan.
     * Contoh: 1 Jan -> 29 Jan = 28 hari.
     */
    public function calculateDaysBetween(string $startDate1, string $startDate2): int
    {
        $d1 = new DateTimeImmutable($startDate1);
        $d2 = new DateTimeImmutable($startDate2);

        $diff = $d1->diff($d2);
        $days = (int)$diff->days;

        return $d1 <= $d2 ? $days : -$days;
    }

    /**
     * T02: Menghitung durasi perdarahan menstruasi inklusif.
     * Contoh: 1 Jan sampai 5 Jan = 5 hari inklusif.
     */
    public function calculatePeriodLength(string $startDate, ?string $endDate): int
    {
        if ($endDate === null || trim($endDate) === '') {
            return 1;
        }

        $d1 = new DateTimeImmutable($startDate);
        $d2 = new DateTimeImmutable($endDate);

        if ($d2 < $d1) {
            throw new InvalidArgumentException("Tanggal selesai tidak boleh mendahului tanggal mulai.");
        }

        $diff = $d1->diff($d2);
        return (int)$diff->days + 1;
    }

    /**
     * Menghitung hari ke-N dari siklus berjalan.
     * Formula: date_diff(today, latest_confirmed_day_1) + 1
     */
    public function calculateCurrentCycleDay(string $latestConfirmedDay1, ?string $today = null): int
    {
        $todayStr = $today ?? (new DateTimeImmutable())->format('Y-m-d');
        $days = $this->calculateDaysBetween($latestConfirmedDay1, $todayStr);

        return $days >= 0 ? $days + 1 : 0;
    }

    /**
     * Menghitung statistik siklus lengkap dari kumpulan riwayat periode.
     * Aturan:
     * - Flek/spotting tidak dihitung sebagai Day 1 siklus.
     * - Siklus dihitung dari start_date dua haid berurutan.
     * - Periode yang masih berlangsung tidak dipakai sebagai akhir siklus tertutup.
     */
    public function computeCycleStats(array $periods, ?string $today = null): array
    {
        $todayStr = $today ?? (new DateTimeImmutable())->format('Y-m-d');

        // Filter periode menstruasi yang sah (bukan spotting murni)
        $validPeriods = array_values(array_filter($periods, function ($p) {
            $bleeding = $p['bleeding_type'] ?? 'period';
            return $bleeding === 'period' && ($p['status'] ?? 'confirmed') === 'confirmed';
        }));

        // Urutkan start_date DESC (terbaru ke terlama)
        usort($validPeriods, function ($a, $b) {
            return strcmp($b['start_date'], $a['start_date']);
        });

        $cycleLengths = [];
        $periodDurations = [];

        // Hitung durasi darah haid tiap catatan
        foreach ($validPeriods as $p) {
            if (!empty($p['end_date'])) {
                try {
                    $dur = $this->calculatePeriodLength($p['start_date'], $p['end_date']);
                    if ($dur > 0 && $dur <= 20) {
                        $periodDurations[] = $dur;
                    }
                } catch (\Exception $e) {
                    // abaikan data tidak konsisten
                }
            }
        }

        // Hitung panjang siklus antar start_date berurutan
        $count = count($validPeriods);
        for ($i = 0; $i < $count - 1; $i++) {
            $newerStart = $validPeriods[$i]['start_date'];
            $olderStart = $validPeriods[$i + 1]['start_date'];
            $diff = $this->calculateDaysBetween($olderStart, $newerStart);

            // Siklus fisiologis wajar antara 15 sampai 90 hari
            if ($diff >= 15 && $diff <= 90) {
                $cycleLengths[] = $diff;
            }
        }

        $medianCycle = null;
        $avgCycle = null;
        $minCycle = null;
        $maxCycle = null;
        $cycleVariation = 0;

        if (count($cycleLengths) > 0) {
            $sorted = $cycleLengths;
            sort($sorted);
            $n = count($sorted);
            $mid = (int)floor($n / 2);
            $medianCycle = ($n % 2 !== 0) ? $sorted[$mid] : (int)round(($sorted[$mid - 1] + $sorted[$mid]) / 2);
            $avgCycle = (int)round(array_sum($sorted) / $n);
            $minCycle = $sorted[0];
            $maxCycle = $sorted[$n - 1];
            $cycleVariation = $maxCycle - $minCycle;
        } else {
            // Default referensi edukasi 28 hari jika belum ada 2 riwayat
            $medianCycle = 28;
        }

        $avgPeriodDuration = count($periodDurations) > 0
            ? (int)round(array_sum($periodDurations) / count($periodDurations))
            : 5;

        $latestPeriod = $validPeriods[0] ?? null;
        $currentCycleDay = 0;
        $predictedNextPeriod = null;
        $estimatedOvulationDate = null;
        $fertileWindowStart = null;
        $fertileWindowEnd = null;
        $confidence = 'none';

        if ($latestPeriod !== null) {
            $latestStart = $latestPeriod['start_date'];
            $currentCycleDay = $this->calculateCurrentCycleDay($latestStart, $todayStr);

            // Prediksi haid berikutnya = start terakhir + median
            $latestDateObj = new DateTimeImmutable($latestStart);
            $predDateObj = $latestDateObj->modify("+{$medianCycle} days");
            $predictedNextPeriod = $predDateObj->format('Y-m-d');

            // Estimasi ovulasi edukatif = prediksi haid berikutnya - 14 hari
            $ovDateObj = $predDateObj->modify("-14 days");
            $estimatedOvulationDate = $ovDateObj->format('Y-m-d');

            // Jendela subur edukatif: -5 s.d. +1 hari dari perkiraan ovulasi
            $fertileWindowStart = $ovDateObj->modify("-5 days")->format('Y-m-d');
            $fertileWindowEnd = $ovDateObj->modify("+1 day")->format('Y-m-d');

            $confidence = count($cycleLengths) >= 3 ? 'high' : (count($cycleLengths) >= 1 ? 'medium' : 'low');
        }

        return [
            'valid_periods_count'     => count($validPeriods),
            'completed_cycles_count'  => count($cycleLengths),
            'cycle_lengths'           => $cycleLengths,
            'median_cycle_length'     => $medianCycle,
            'average_cycle_length'    => $avgCycle,
            'min_cycle_length'        => $minCycle,
            'max_cycle_length'        => $maxCycle,
            'cycle_variation_days'    => $cycleVariation,
            'average_period_duration' => $avgPeriodDuration,
            'latest_period'           => $latestPeriod,
            'current_cycle_day'       => $currentCycleDay,
            'predicted_next_period'   => $predictedNextPeriod,
            'estimated_ovulation'     => $estimatedOvulationDate,
            'fertile_window_start'    => $fertileWindowStart,
            'fertile_window_end'      => $fertileWindowEnd,
            'confidence'              => $confidence,
            'disclaimer'              => 'Perhitungan tanggal menstruasi dan masa subur adalah estimasi edukatif berbasis kalender, bukan diagnosis klinis atau konfirmasi ovulasi.',
        ];
    }
}
