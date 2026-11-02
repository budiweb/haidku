<?php
declare(strict_types=1);

namespace HaidKu\Services;

use DateTimeImmutable;
use DateTimeZone;
use InvalidArgumentException;

class CycleCalculatorService
{
    /**
     * T01: Menghitung selisih hari kalender murni YYYY-MM-DD.
     * Tidak terpengaruh offset jam/UTC.
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
     * T16: Menghitung hari ke-N dari siklus berjalan dengan zona waktu pengguna.
     * Formula: date_diff(today_local, latest_confirmed_day_1) + 1
     */
    public function calculateCurrentCycleDay(string $latestConfirmedDay1, ?string $today = null, string $timezone = 'Asia/Jakarta'): int
    {
        if ($today !== null) {
            $todayStr = $today;
        } else {
            $tz = new DateTimeZone($timezone);
            $todayStr = (new DateTimeImmutable('now', $tz))->format('Y-m-d');
        }

        $days = $this->calculateDaysBetween($latestConfirmedDay1, $todayStr);
        return $days >= 0 ? $days + 1 : 0;
    }

    /**
     * Menghitung statistik siklus lengkap dari kumpulan riwayat periode (hingga 6 siklus terbaru).
     */
    public function computeCycleStats(array $periods, ?string $today = null, string $timezone = 'Asia/Jakarta'): array
    {
        if ($today !== null) {
            $todayStr = $today;
        } else {
            $tz = new DateTimeZone($timezone);
            $todayStr = (new DateTimeImmutable('now', $tz))->format('Y-m-d');
        }

        // T11: Filter periode menstruasi sah (flek/spotting tidak dihitung sebagai Day 1)
        $validPeriods = array_values(array_filter($periods, function ($p) {
            $bleeding = $p['bleeding_type'] ?? 'period';
            return $bleeding === 'period' && ($p['status'] ?? 'confirmed') === 'confirmed';
        }));

        // Urutkan start_date DESC (terbaru ke terlama)
        usort($validPeriods, function ($a, $b) {
            return strcmp($b['start_date'], $a['start_date']);
        });

        $cycleLengths = [];
        $cycleStartDates = [];
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

        // Hitung panjang siklus antar start_date berurutan (ambil maksimal 6 siklus)
        $count = count($validPeriods);
        $maxCyclesToAnalyze = min($count - 1, 6);
        for ($i = 0; $i < $maxCyclesToAnalyze; $i++) {
            $newerStart = $validPeriods[$i]['start_date'];
            $olderStart = $validPeriods[$i + 1]['start_date'];
            $diff = $this->calculateDaysBetween($olderStart, $newerStart);

            // Rentang fisiologis wajar
            if ($diff >= 15 && $diff <= 90) {
                $cycleLengths[] = $diff;
                $cycleStartDates[] = $newerStart;
            }
        }

        $medianCycle = 28;
        $avgCycle = null;
        $minCycle = null;
        $maxCycle = null;
        $cycleVariation = 0;
        $isIrregular = false;

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

            // Jika variasi siklus > 8 hari, tandai sebagai bervariasi/irregular
            if ($cycleVariation > 8) {
                $isIrregular = true;
            }
        }

        $avgPeriodDuration = count($periodDurations) > 0
            ? (int)round(array_sum($periodDurations) / count($periodDurations))
            : 5;

        $latestPeriod = $validPeriods[0] ?? null;
        $currentCycleDay = 0;
        $predictedNextPeriod = null;
        $predictedRangeStart = null;
        $predictedRangeEnd = null;
        $estimatedOvulationDate = null;
        $fertileWindowStart = null;
        $fertileWindowEnd = null;
        $confidence = 'none';

        if ($latestPeriod !== null) {
            $latestStart = $latestPeriod['start_date'];
            $currentCycleDay = $this->calculateCurrentCycleDay($latestStart, $todayStr, $timezone);

            $latestDateObj = new DateTimeImmutable($latestStart);

            // Prediksi dasar
            $predDateObj = $latestDateObj->modify("+{$medianCycle} days");
            $predictedNextPeriod = $predDateObj->format('Y-m-d');

            // Rentang ketidakpastian bila variasi ada
            if ($cycleVariation > 0) {
                $halfVar = (int)ceil($cycleVariation / 2);
                $predictedRangeStart = $predDateObj->modify("-{$halfVar} days")->format('Y-m-d');
                $predictedRangeEnd = $predDateObj->modify("+{$halfVar} days")->format('Y-m-d');
            } else {
                $predictedRangeStart = $predictedNextPeriod;
                $predictedRangeEnd = $predictedNextPeriod;
            }

            // Estimasi ovulasi edukatif = prediksi haid berikutnya - 14 hari
            $ovDateObj = $predDateObj->modify("-14 days");
            $estimatedOvulationDate = $ovDateObj->format('Y-m-d');

            // Jendela subur edukatif: -5 s.d. +1 hari dari estimasi ovulasi
            $fertileWindowStart = $ovDateObj->modify("-5 days")->format('Y-m-d');
            $fertileWindowEnd = $ovDateObj->modify("+1 day")->format('Y-m-d');

            $confidence = count($cycleLengths) >= 3 ? 'high' : (count($cycleLengths) >= 1 ? 'medium' : 'low');
        }

        return [
            'valid_periods_count'     => count($validPeriods),
            'completed_cycles_count'  => count($cycleLengths),
            'cycle_lengths'           => $cycleLengths,
            'cycle_start_dates'       => $cycleStartDates,
            'median_cycle_length'     => $medianCycle,
            'average_cycle_length'    => $avgCycle,
            'min_cycle_length'        => $minCycle,
            'max_cycle_length'        => $maxCycle,
            'cycle_variation_days'    => $cycleVariation,
            'is_irregular'            => $isIrregular,
            'average_period_duration' => $avgPeriodDuration,
            'latest_period'           => $latestPeriod,
            'current_cycle_day'       => $currentCycleDay,
            'predicted_next_period'   => $predictedNextPeriod,
            'predicted_range_start'   => $predictedRangeStart,
            'predicted_range_end'     => $predictedRangeEnd,
            'estimated_ovulation'     => $estimatedOvulationDate,
            'fertile_window_start'    => $fertileWindowStart,
            'fertile_window_end'      => $fertileWindowEnd,
            'confidence'              => $confidence,
            'disclaimer'              => 'Perhitungan tanggal menstruasi dan masa subur adalah estimasi edukatif berbasis kalender, bukan diagnosis klinis atau konfirmasi ovulasi.',
        ];
    }
}
