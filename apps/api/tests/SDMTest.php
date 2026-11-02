<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/Services/CycleCalculatorService.php';
require_once __DIR__ . '/../src/Services/SDMService.php';

use HaidKu\Services\CycleCalculatorService;
use HaidKu\Services\SDMService;

class SDMTest
{
    private SDMService $sdmService;
    private CycleCalculatorService $calculator;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->sdmService = new SDMService();
        $this->calculator = new CycleCalculatorService();
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
        echo "Menjalankan SDMTest (Skenario Medis & Guardrail T03-T13, T18, T23)...\n";

        // Setup base eligible user: goal=avoid, consent=true, 3 cycles between 26-32 days
        $eligibleProfile = [
            'goal'           => 'avoid',
            'sdm_consent_at' => '2026-01-01 10:00:00',
            'risk_overrides' => [],
        ];
        $eligibleCycles = [28, 29, 27]; // 3 recent cycles in [26, 32]
        $eligibility = $this->sdmService->evaluateEligibility($eligibleProfile, $eligibleCycles);
        $this->assertEqual($eligibility['eligible'], true, 'User dengan 3 siklus 28, 29, 27 hari dinyatakan ELIGIBLE');

        // T03: Hari ke-7; SDM eligible => LOWER_CHANCE_NOT_ZERO
        $resDay7 = $this->sdmService->getStatusForCycleDay(7, $eligibility);
        $this->assertEqual($resDay7['state'], SDMService::STATE_LOWER_CHANCE_NOT_ZERO, 'T03: Hari ke-7 menghasilkan LOWER_CHANCE_NOT_ZERO');

        // T04: Hari ke-8; SDM eligible => HIGHER_FERTILITY_PRECAUTION
        $resDay8 = $this->sdmService->getStatusForCycleDay(8, $eligibility);
        $this->assertEqual($resDay8['state'], SDMService::STATE_HIGHER_FERTILITY_PRECAUTION, 'T04: Hari ke-8 menghasilkan HIGHER_FERTILITY_PRECAUTION');

        // T05: Hari ke-19; SDM eligible => HIGHER_FERTILITY_PRECAUTION
        $resDay19 = $this->sdmService->getStatusForCycleDay(19, $eligibility);
        $this->assertEqual($resDay19['state'], SDMService::STATE_HIGHER_FERTILITY_PRECAUTION, 'T05: Hari ke-19 menghasilkan HIGHER_FERTILITY_PRECAUTION');

        // T06: Hari ke-20; SDM eligible => LOWER_CHANCE_NOT_ZERO
        $resDay20 = $this->sdmService->getStatusForCycleDay(20, $eligibility);
        $this->assertEqual($resDay20['state'], SDMService::STATE_LOWER_CHANCE_NOT_ZERO, 'T06: Hari ke-20 menghasilkan LOWER_CHANCE_NOT_ZERO');

        // T07: Hari ke-32; SDM eligible => LOWER_CHANCE_NOT_ZERO
        $resDay32 = $this->sdmService->getStatusForCycleDay(32, $eligibility);
        $this->assertEqual($resDay32['state'], SDMService::STATE_LOWER_CHANCE_NOT_ZERO, 'T07: Hari ke-32 menghasilkan LOWER_CHANCE_NOT_ZERO');

        // T08: Hari ke-33 tanpa haid baru => UNKNOWN (bukan lower!)
        $resDay33 = $this->sdmService->getStatusForCycleDay(33, $eligibility);
        $this->assertEqual($resDay33['state'], SDMService::STATE_UNKNOWN, 'T08: Hari ke-33 tanpa haid baru wajib UNKNOWN');

        // T09: 2 siklus di luar 26–32 dalam 365 hari => UNKNOWN
        $cyclesWith2Out = [28, 25, 27, 34]; // 25 dan 34 berada di luar rentang
        $eligT09 = $this->sdmService->evaluateEligibility($eligibleProfile, $cyclesWith2Out);
        $this->assertEqual($eligT09['eligible'], false, 'T09: 2 siklus di luar rentang dalam 365 hari tidak eligible');
        $this->assertEqual($eligT09['primary_code'], 'LAST_3_OUT_OF_RANGE', 'T09: Primary code sesuai');

        // T10: Hanya 1 tanggal haid (0 atau 1 siklus lengkap) => UNKNOWN
        $singleCycle = [28];
        $eligT10 = $this->sdmService->evaluateEligibility($eligibleProfile, $singleCycle);
        $this->assertEqual($eligT10['eligible'], false, 'T10: Riwayat kurang dari 3 siklus tidak eligible');
        $this->assertEqual($eligT10['primary_code'], 'INSUFFICIENT_HISTORY', 'T10: Primary code INSUFFICIENT_HISTORY');

        // T12: Salah satu siklus 25 atau 33 pada 3 terakhir => UNKNOWN
        $cyclesT12 = [25, 28, 29]; // siklus 25
        $eligT12 = $this->sdmService->evaluateEligibility($eligibleProfile, $cyclesT12);
        $this->assertEqual($eligT12['eligible'], false, 'T12: Siklus 25 hari pada 3 terakhir menyebabkan ineligibility');

        // T13: Pascamelahirkan / menyusui belum stabil => UNKNOWN
        $profileT13 = $eligibleProfile;
        $profileT13['risk_overrides'] = ['postpartum_breastfeeding' => true];
        $eligT13 = $this->sdmService->evaluateEligibility($profileT13, $eligibleCycles);
        $this->assertEqual($eligT13['eligible'], false, 'T13: Pascamelahirkan/menyusui belum stabil wajib UNKNOWN');
        $this->assertEqual($eligT13['primary_code'], 'CLINICAL_RISK_OVERRIDE', 'T13: Clinical risk override aktif');

        // T18: Sinyal fertilitas bertentangan => tidak boleh menaikkan keamanan
        $profileT18 = $eligibleProfile;
        $profileT18['risk_overrides'] = ['contradictory_fertility_signs' => true];
        $eligT18 = $this->sdmService->evaluateEligibility($profileT18, $eligibleCycles);
        $this->assertEqual($eligT18['eligible'], false, 'T18: Tanda kesuburan bertentangan tidak menaikkan keamanan');

        // T23: Audit Copy Medis — scan seluruh pesan status SDM
        $messagesToAudit = [
            $resDay7['headline'] . ' ' . $resDay7['message'] . ' ' . $resDay7['warning'] . ' ' . $resDay7['disclaimer'],
            $resDay8['headline'] . ' ' . $resDay8['message'] . ' ' . $resDay8['warning'] . ' ' . $resDay8['disclaimer'],
            $resDay33['headline'] . ' ' . $resDay33['message'] . ' ' . $resDay33['warning'] . ' ' . $resDay33['disclaimer'],
        ];

        $forbiddenPhrases = ['100% aman', 'hari aman', 'risiko nol', 'tidak mungkin hamil', 'pasti aman'];
        $hasForbidden = false;
        foreach ($messagesToAudit as $msg) {
            foreach ($forbiddenPhrases as $forbidden) {
                if (stripos($msg, $forbidden) !== false) {
                    $hasForbidden = true;
                    echo "  [FAIL] Ditemukan frasa terlarang '$forbidden' dalam: $msg\n";
                }
            }
        }
        $this->assertEqual($hasForbidden, false, 'T23: Audit copy medis bebas dari "100% aman", "hari aman", "risiko nol"');

        // T35: method_version usang pada state offline wajib fallback ke UNKNOWN
        $staleCache = [
            'state'          => SDMService::STATE_LOWER_CHANCE_NOT_ZERO,
            'cycle_day'      => 6,
            'method_version' => 'SDM-LEGACY-2018',
        ];
        $validatedStale = SDMService::validateCachedStatus($staleCache, 'SDM-CDC-2024.1');
        $this->assertEqual($validatedStale['state'], SDMService::STATE_UNKNOWN, 'T35: Cache dengan versi metode usang difallback ke UNKNOWN');
        $this->assertEqual($validatedStale['primary_code'], 'STALE_METHOD_VERSION', 'T35: primary_code adalah STALE_METHOD_VERSION');

        // T35b: method_version valid tetap dipertahankan
        $currentCache = [
            'state'          => SDMService::STATE_LOWER_CHANCE_NOT_ZERO,
            'cycle_day'      => 6,
            'method_version' => 'SDM-CDC-2024.1',
        ];
        $validatedCurrent = SDMService::validateCachedStatus($currentCache, 'SDM-CDC-2024.1');
        $this->assertEqual($validatedCurrent['state'], SDMService::STATE_LOWER_CHANCE_NOT_ZERO, 'T35b: Cache dengan versi metode mutakhir dipertahankan');

        echo "\nHasil SDMTest: {$this->passed} Passed, {$this->failed} Failed\n";
        return $this->failed === 0;
    }
}

