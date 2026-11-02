<?php
declare(strict_types=1);

namespace HaidKu\Services;

use DateTimeImmutable;
use InvalidArgumentException;

class SDMService
{
    public const STATE_HIGHER_FERTILITY_PRECAUTION = 'HIGHER_FERTILITY_PRECAUTION';
    public const STATE_LOWER_CHANCE_NOT_ZERO = 'LOWER_CHANCE_NOT_ZERO';
    public const STATE_UNKNOWN = 'UNKNOWN';
    public const STATE_DISABLED = 'DISABLED';

    /**
     * Mengecek kelayakan pengguna untuk Standard Days Method (SDM)
     * Aturan medis & keselamatan konservatif HaidKu:
     * 1. Tujuan pengguna harus 'avoid' dan sudah memberikan consent.
     * 2. Minimal 3 siklus lengkap terbaru yang sah (kebijakan produk konservatif).
     * 3. Seluruh 3 siklus terbaru wajib dalam rentang 26–32 hari.
     * 4. Kurang dari 2 siklus di luar rentang 26–32 hari dalam 365 hari terakhir (CDC 2024).
     * 5. Tidak ada faktor kontraindikasi klinis (risk_override).
     *
     * @param array $userProfile Termasuk goal, sdm_consent_at, dan risk_overrides
     * @param array $cycleLengths Array panjang siklus (dari yang terbaru ke terlama)
     * @param array $cycleDates Array tanggal mulai siklus bersangkutan
     * @param string|null $todayStr
     * @return array [bool $eligible, array $reasons, string $primaryCode]
     */
    public function evaluateEligibility(
        array $userProfile,
        array $cycleLengths,
        array $cycleDates = [],
        ?string $todayStr = null
    ): array {
        $today = $todayStr ? new DateTimeImmutable($todayStr) : new DateTimeImmutable();
        $reasons = [];

        // 1. Cek Goal & Consent
        $goal = $userProfile['goal'] ?? 'track';
        $hasConsent = !empty($userProfile['sdm_consent_at']) || !empty($userProfile['sdm_consent']);
        if ($goal !== 'avoid' || !$hasConsent) {
            return [
                'eligible'     => false,
                'status'       => self::STATE_DISABLED,
                'primary_code' => 'NOT_OPTED_IN',
                'reasons'      => ['Mode pemahaman peluang kehamilan (SDM) belum diaktifkan atau belum disetujui.'],
            ];
        }

        // 2. Cek Kontraindikasi Klinis / Risk Overrides (T13, T18)
        $overrides = $userProfile['risk_overrides'] ?? [];
        if (!empty($overrides)) {
            if (!empty($overrides['postpartum_breastfeeding'])) {
                $reasons[] = 'Pascamelahirkan atau menyusui dengan siklus menstruasi yang belum stabil.';
            }
            if (!empty($overrides['recent_hormonal_contraception'])) {
                $reasons[] = 'Baru berhenti atau mengganti kontrasepsi hormonal dalam beberapa bulan terakhir.';
            }
            if (!empty($overrides['perimenopause'])) {
                $reasons[] = 'Fase perimenopause dengan siklus yang fluktuatif.';
            }
            if (!empty($overrides['medical_avoidance_required'])) {
                $reasons[] = 'Kehamilan harus benar-benar dicegah karena indikasi medis tertentu; disarankan menggunakan kontrasepsi berdaya guna tinggi.';
            }
            if (!empty($overrides['contradictory_fertility_signs'])) {
                $reasons[] = 'Terdapat tanda fisik kesuburan yang bertentangan dengan perhitungan kalender.';
            }
            if (!empty($overrides['irregular_bleeding'])) {
                $reasons[] = 'Mengalami perdarahan abnormal di luar siklus haid teratur.';
            }
        }

        if (count($reasons) > 0) {
            return [
                'eligible'     => false,
                'status'       => self::STATE_UNKNOWN,
                'primary_code' => 'CLINICAL_RISK_OVERRIDE',
                'reasons'      => $reasons,
            ];
        }

        // 3. T10: Cek Kecukupan Data Historis (minimal 3 siklus lengkap valid)
        if (count($cycleLengths) < 3) {
            return [
                'eligible'     => false,
                'status'       => self::STATE_UNKNOWN,
                'primary_code' => 'INSUFFICIENT_HISTORY',
                'reasons'      => [
                    'Dibutuhkan minimal 3 riwayat siklus menstruasi lengkap untuk mengevaluasi kelayakan Standard Days Method secara aman.'
                ],
            ];
        }

        // 4. T12: Tiga siklus terakhir harus seluruhnya dalam rentang 26–32 hari
        $lastThree = array_slice($cycleLengths, 0, 3);
        $invalidInLastThree = [];
        foreach ($lastThree as $idx => $len) {
            if ($len < 26 || $len > 32) {
                $invalidInLastThree[] = "Siklus #{$idx}: {$len} hari";
            }
        }
        if (count($invalidInLastThree) > 0) {
            return [
                'eligible'     => false,
                'status'       => self::STATE_UNKNOWN,
                'primary_code' => 'LAST_3_OUT_OF_RANGE',
                'reasons'      => [
                    'Salah satu dari 3 siklus terakhir berada di luar rentang 26–32 hari (' . implode(', ', $invalidInLastThree) . ').'
                ],
            ];
        }

        // 5. T09: Maksimal 1 siklus di luar rentang 26–32 hari dalam 365 hari terakhir (CDC rule)
        $outOfRangeInYear = 0;
        $oneYearAgo = $today->modify('-365 days');

        foreach ($cycleLengths as $idx => $len) {
            $cycleDate = isset($cycleDates[$idx]) ? new DateTimeImmutable($cycleDates[$idx]) : null;
            if ($cycleDate === null || $cycleDate >= $oneYearAgo) {
                if ($len < 26 || $len > 32) {
                    $outOfRangeInYear++;
                }
            }
        }

        if ($outOfRangeInYear >= 2) {
            return [
                'eligible'     => false,
                'status'       => self::STATE_UNKNOWN,
                'primary_code' => 'TWO_OR_MORE_OUT_OF_RANGE_IN_YEAR',
                'reasons'      => [
                    "Terdapat {$outOfRangeInYear} siklus di luar rentang 26–32 hari dalam satu tahun terakhir. Menurut CDC, metode kalender SDM tidak lagi sesuai."
                ],
            ];
        }

        return [
            'eligible'     => true,
            'status'       => 'ELIGIBLE',
            'primary_code' => 'ELIGIBLE',
            'reasons'      => ['Siklus memenuhi seluruh kriteria kelayakan Standard Days Method.'],
        ];
    }

    /**
     * Menghitung status Standard Days Method untuk hari siklus saat ini
     * Aturan:
     * - cycle_day 1-7: LOWER_CHANCE_NOT_ZERO
     * - cycle_day 8-19: HIGHER_FERTILITY_PRECAUTION
     * - cycle_day 20-32: LOWER_CHANCE_NOT_ZERO
     * - cycle_day > 32 atau < 1: UNKNOWN
     * - tidak eligible: UNKNOWN
     */
    public function getStatusForCycleDay(int $cycleDay, array $eligibilityResult): array
    {
        if (!$eligibilityResult['eligible']) {
            $state = $eligibilityResult['status'] === self::STATE_DISABLED
                ? self::STATE_DISABLED
                : self::STATE_UNKNOWN;

            return [
                'state'           => $state,
                'cycle_day'       => $cycleDay,
                'headline'        => $state === self::STATE_DISABLED ? 'Mode SDM Nonaktif' : 'Tidak Dapat Ditentukan (UNKNOWN)',
                'message'         => $state === self::STATE_DISABLED
                    ? 'Aktifkan mode pemahaman peluang kehamilan pada pengaturan untuk melihat panduan SDM.'
                    : 'Siklus saat ini belum memenuhi syarat perhitungan Standard Days Method yang andal. Gunakan perlindungan kontrasepsi lain.',
                'warning'         => 'Selalu gunakan kontrasepsi yang terbukti efektif jika Anda ingin mencegah kehamilan.',
                'reasons'         => $eligibilityResult['reasons'],
                'primary_code'    => $eligibilityResult['primary_code'],
                'method_version'  => 'SDM-CDC-2024.1',
                'disclaimer'      => 'Standard Days Method memiliki tingkat kehamilan tahunan sekitar 13 dari 100 wanita pada penggunaan biasa (CDC 2024). Tidak ada hari yang sepenuhnya bebas dari risiko kehamilan.',
            ];
        }

        // T08: Hari siklus melebihi 32 hari tanpa menstruasi baru
        if ($cycleDay > 32) {
            return [
                'state'          => self::STATE_UNKNOWN,
                'cycle_day'      => $cycleDay,
                'headline'       => 'Siklus Melebihi 32 Hari (UNKNOWN)',
                'message'        => "Hari ke-{$cycleDay} siklus berada di luar batas 32 hari Standard Days Method. Waktu ovulasi mungkin bergeser.",
                'warning'        => 'Perkiraan kalender tidak lagi andal. Gunakan kontrasepsi lain jika Anda sedang mencegah kehamilan.',
                'reasons'        => ['Hari siklus > 32 hari tanpa menstruasi baru.'],
                'primary_code'   => 'CYCLE_EXCEEDED_32_DAYS',
                'method_version' => 'SDM-CDC-2024.1',
                'disclaimer'     => 'Standard Days Method hanya berlaku untuk hari ke-1 sampai ke-32.',
            ];
        }

        if ($cycleDay < 1) {
            return [
                'state'          => self::STATE_UNKNOWN,
                'cycle_day'      => $cycleDay,
                'headline'       => 'Hari Siklus Tidak Sah (UNKNOWN)',
                'message'        => 'Tanggal haid tidak konsisten dengan tanggal evaluasi saat ini.',
                'warning'        => 'Periksa kembali catatan tanggal mulai menstruasi Anda.',
                'reasons'        => ['Hari siklus kurang dari 1.'],
                'primary_code'   => 'INVALID_CYCLE_DAY',
                'method_version' => 'SDM-CDC-2024.1',
                'disclaimer'     => 'Data tanggal tidak konsisten.',
            ];
        }

        // T04 & T05: Hari ke-8 s.d. 19
        if ($cycleDay >= 8 && $cycleDay <= 19) {
            return [
                'state'          => self::STATE_HIGHER_FERTILITY_PRECAUTION,
                'cycle_day'      => $cycleDay,
                'headline'       => 'Periode Berpotensi Subur (Hindari Hubungan Tanpa Perlindungan)',
                'message'        => 'Menurut Standard Days Method, hari ke-8 hingga ke-19 adalah periode dengan peluang kehamilan paling tinggi.',
                'warning'        => 'Hindari hubungan seksual tanpa perlindungan pada hari ini bila Anda sedang mencegah kehamilan.',
                'reasons'        => ['Hari ke-8 s.d. 19 siklus.'],
                'primary_code'   => 'SDM_PRECAUTION_WINDOW',
                'method_version' => 'SDM-CDC-2024.1',
                'disclaimer'     => 'Metode ini tidak melindungi dari infeksi menular seksual (IMS). Gunakan kondom untuk perlindungan ganda.',
            ];
        }

        // T03, T06, T07: Hari ke-1 s.d. 7 dan 20 s.d. 32
        return [
            'state'          => self::STATE_LOWER_CHANCE_NOT_ZERO,
            'cycle_day'      => $cycleDay,
            'headline'       => 'Peluang Kehamilan Relatif Lebih Rendah (Tetap Ada Risiko)',
            'message'        => "Hari ke-{$cycleDay} berada di luar jendela subur utama Standard Days Method. Peluang kehamilan relatif lebih rendah dibanding hari 8–19.",
            'warning'        => 'Peluang lebih rendah BUKAN berarti tanpa risiko. Risiko kehamilan tetap ada. Sperma dapat bertahan 3–5 hari dan ovulasi dapat bergeser sewaktu-waktu.',
            'reasons'        => ["Hari ke-{$cycleDay} siklus (rentang 1-7 atau 20-32)."],
            'primary_code'   => 'SDM_LOWER_CHANCE_NOT_ZERO',
            'method_version' => 'SDM-CDC-2024.1',
            'disclaimer'     => 'Standard Days Method memiliki angka kegagalan 13 kehamilan per 100 wanita per tahun pada penggunaan tipikal (CDC 2024).',
        ];
    }

    /**
     * T35: Memvalidasi cache SDM status.
     * Bila versi metode usang, jangan tampilkan status berpeluang rendah; wajib fallback ke UNKNOWN.
     */
    public static function validateCachedStatus(?array $cachedStatus, string $currentMethodVersion = 'SDM-CDC-2024.1'): ?array
    {
        if ($cachedStatus === null) {
            return null;
        }

        if (($cachedStatus['method_version'] ?? '') !== $currentMethodVersion) {
            return [
                'state'          => self::STATE_UNKNOWN,
                'cycle_day'      => $cachedStatus['cycle_day'] ?? 0,
                'headline'       => 'Aturan Klinis Diperbarui (UNKNOWN)',
                'message'        => 'Versi aturan evaluasi klinis telah diperbarui. Status tidak dapat ditampilkan dari cache lama dan perlu dievaluasi ulang.',
                'warning'        => 'Gunakan perlindungan kontrasepsi lain sampai evaluasi ulang selesai.',
                'reasons'        => ['Versi metode klinis pada cache lokal telah usang.'],
                'primary_code'   => 'STALE_METHOD_VERSION',
                'method_version' => $currentMethodVersion,
                'disclaimer'     => 'Keamanan pengguna diutamakan ketika terjadi perubahan panduan klinis.',
            ];
        }

        return $cachedStatus;
    }
}
