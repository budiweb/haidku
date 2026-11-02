/**
 * SDMEngine.js — Pure domain logic for Standard Days Method (SDM)
 * Matches PHP SDMService for 100% parity & offline execution
 */

export class SDMEngine {
  static STATE_HIGHER_FERTILITY_PRECAUTION = 'HIGHER_FERTILITY_PRECAUTION';
  static STATE_LOWER_CHANCE_NOT_ZERO = 'LOWER_CHANCE_NOT_ZERO';
  static STATE_UNKNOWN = 'UNKNOWN';
  static STATE_DISABLED = 'DISABLED';

  /**
   * Evaluasi kelayakan SDM pengguna (aturan medis CDC 2024 & keselamatan konservatif HaidKu)
   */
  static evaluateEligibility(userProfile = {}, cycleLengths = [], cycleDates = [], todayStr = null) {
    const today = todayStr ? new Date(todayStr) : new Date();
    const reasons = [];

    // 1. Cek Goal & Consent
    const goal = userProfile.goal || 'track';
    const hasConsent = !!(userProfile.sdm_consent_at || userProfile.sdmConsent);
    if (goal !== 'avoid' || !hasConsent) {
      return {
        eligible: false,
        status: this.STATE_DISABLED,
        primary_code: 'NOT_OPTED_IN',
        reasons: ['Mode pemahaman peluang kehamilan (SDM) belum diaktifkan atau belum disetujui.'],
      };
    }

    // 2. Cek Kontraindikasi Klinis / Overrides (T13, T18)
    const overrides = userProfile.risk_overrides || {};
    if (overrides.postpartum_breastfeeding) {
      reasons.push('Pascamelahirkan atau menyusui dengan siklus menstruasi yang belum stabil.');
    }
    if (overrides.recent_hormonal_contraception) {
      reasons.push('Baru berhenti atau mengganti kontrasepsi hormonal dalam beberapa bulan terakhir.');
    }
    if (overrides.perimenopause) {
      reasons.push('Fase perimenopause dengan siklus yang fluktuatif.');
    }
    if (overrides.medical_avoidance_required) {
      reasons.push('Kehamilan harus benar-benar dicegah karena indikasi medis tertentu; disarankan menggunakan kontrasepsi berdaya guna tinggi.');
    }
    if (overrides.contradictory_fertility_signs) {
      reasons.push('Terdapat tanda fisik kesuburan yang bertentangan dengan perhitungan kalender.');
    }
    if (overrides.irregular_bleeding) {
      reasons.push('Mengalami perdarahan abnormal di luar siklus haid teratur.');
    }

    if (reasons.length > 0) {
      return {
        eligible: false,
        status: this.STATE_UNKNOWN,
        primary_code: 'CLINICAL_RISK_OVERRIDE',
        reasons,
      };
    }

    // 3. T10: Cek Kecukupan Data Historis (minimal 3 siklus lengkap valid)
    if (cycleLengths.length < 3) {
      return {
        eligible: false,
        status: this.STATE_UNKNOWN,
        primary_code: 'INSUFFICIENT_HISTORY',
        reasons: ['Dibutuhkan minimal 3 riwayat siklus menstruasi lengkap untuk mengevaluasi kelayakan Standard Days Method secara aman.'],
      };
    }

    // 4. T12: Seluruh 3 siklus terakhir wajib dalam rentang 26–32 hari
    const lastThree = cycleLengths.slice(0, 3);
    const invalidInLastThree = [];
    lastThree.forEach((len, idx) => {
      if (len < 26 || len > 32) {
        invalidInLastThree.push(`Siklus #${idx + 1}: ${len} hari`);
      }
    });

    if (invalidInLastThree.length > 0) {
      return {
        eligible: false,
        status: this.STATE_UNKNOWN,
        primary_code: 'LAST_3_OUT_OF_RANGE',
        reasons: [`Salah satu dari 3 siklus terakhir berada di luar rentang 26–32 hari (${invalidInLastThree.join(', ')}).`],
      };
    }

    // 5. T09: Kurang dari 2 siklus di luar rentang 26–32 hari dalam 365 hari terakhir
    let outOfRangeInYear = 0;
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    cycleLengths.forEach((len, idx) => {
      const cycleDate = cycleDates[idx] ? new Date(cycleDates[idx]) : null;
      if (!cycleDate || cycleDate >= oneYearAgo) {
        if (len < 26 || len > 32) {
          outOfRangeInYear++;
        }
      }
    });

    if (outOfRangeInYear >= 2) {
      return {
        eligible: false,
        status: this.STATE_UNKNOWN,
        primary_code: 'TWO_OR_MORE_OUT_OF_RANGE_IN_YEAR',
        reasons: [`Terdapat ${outOfRangeInYear} siklus di luar rentang 26–32 hari dalam satu tahun terakhir. Menurut CDC, metode kalender SDM tidak lagi sesuai.`],
      };
    }

    return {
      eligible: true,
      status: 'ELIGIBLE',
      primary_code: 'ELIGIBLE',
      reasons: ['Siklus memenuhi seluruh kriteria kelayakan Standard Days Method.'],
    };
  }

  /**
   * Menghitung status SDM untuk hari siklus saat ini
   */
  static getStatusForCycleDay(cycleDay, eligibilityResult) {
    if (!eligibilityResult.eligible) {
      const state = eligibilityResult.status === this.STATE_DISABLED
        ? this.STATE_DISABLED
        : this.STATE_UNKNOWN;

      return {
        state,
        cycle_day: cycleDay,
        headline: state === this.STATE_DISABLED ? 'Mode SDM Nonaktif' : 'Tidak Dapat Ditentukan (UNKNOWN)',
        message: state === this.STATE_DISABLED
          ? 'Aktifkan mode pemahaman peluang kehamilan pada pengaturan untuk melihat panduan SDM.'
          : 'Siklus saat ini belum memenuhi syarat perhitungan Standard Days Method yang andal. Gunakan perlindungan kontrasepsi lain.',
        warning: 'Selalu gunakan kontrasepsi yang terbukti efektif jika Anda ingin mencegah kehamilan.',
        reasons: eligibilityResult.reasons,
        primary_code: eligibilityResult.primary_code,
        method_version: 'SDM-CDC-2024.1',
        disclaimer: 'Standard Days Method memiliki tingkat kehamilan tahunan sekitar 13 dari 100 wanita pada penggunaan biasa (CDC 2024). Tidak ada hari yang sepenuhnya bebas dari risiko kehamilan.',
      };
    }

    // T08: Hari siklus melebihi 32 hari
    if (cycleDay > 32) {
      return {
        state: this.STATE_UNKNOWN,
        cycle_day: cycleDay,
        headline: 'Siklus Melebihi 32 Hari (UNKNOWN)',
        message: `Hari ke-${cycleDay} siklus berada di luar batas 32 hari Standard Days Method. Waktu ovulasi mungkin bergeser.`,
        warning: 'Perkiraan kalender tidak lagi andal. Gunakan kontrasepsi lain jika Anda sedang mencegah kehamilan.',
        reasons: ['Hari siklus > 32 hari tanpa menstruasi baru.'],
        primary_code: 'CYCLE_EXCEEDED_32_DAYS',
        method_version: 'SDM-CDC-2024.1',
        disclaimer: 'Standard Days Method hanya berlaku untuk hari ke-1 sampai ke-32.',
      };
    }

    if (cycleDay < 1) {
      return {
        state: this.STATE_UNKNOWN,
        cycle_day: cycleDay,
        headline: 'Hari Siklus Tidak Sah (UNKNOWN)',
        message: 'Tanggal haid tidak konsisten dengan tanggal evaluasi saat ini.',
        warning: 'Periksa kembali catatan tanggal mulai menstruasi Anda.',
        reasons: ['Hari siklus kurang dari 1.'],
        primary_code: 'INVALID_CYCLE_DAY',
        method_version: 'SDM-CDC-2024.1',
        disclaimer: 'Data tanggal tidak konsisten.',
      };
    }

    // T04 & T05: Hari ke-8 s.d. 19
    if (cycleDay >= 8 && cycleDay <= 19) {
      return {
        state: this.STATE_HIGHER_FERTILITY_PRECAUTION,
        cycle_day: cycleDay,
        headline: 'Periode Berpotensi Subur (Hindari Hubungan Tanpa Perlindungan)',
        message: 'Menurut Standard Days Method, hari ke-8 hingga ke-19 adalah periode dengan peluang kehamilan paling tinggi.',
        warning: 'Hindari hubungan seksual tanpa perlindungan pada hari ini bila Anda sedang mencegah kehamilan.',
        reasons: ['Hari ke-8 s.d. 19 siklus.'],
        primary_code: 'SDM_PRECAUTION_WINDOW',
        method_version: 'SDM-CDC-2024.1',
        disclaimer: 'Metode ini tidak melindungi dari infeksi menular seksual (IMS). Gunakan kondom untuk perlindungan ganda.',
      };
    }

    // T03, T06, T07: Hari ke-1 s.d. 7 dan 20 s.d. 32
    return {
      state: this.STATE_LOWER_CHANCE_NOT_ZERO,
      cycle_day: cycleDay,
      headline: 'Peluang Kehamilan Relatif Lebih Rendah (Tetap Ada Risiko)',
      message: `Hari ke-${cycleDay} berada di luar jendela subur utama Standard Days Method. Peluang kehamilan relatif lebih rendah dibanding hari 8–19.`,
      warning: 'Peluang lebih rendah BUKAN berarti tanpa risiko. Risiko kehamilan tetap ada. Sperma dapat bertahan 3–5 hari dan ovulasi dapat bergeser sewaktu-waktu.',
      reasons: [`Hari ke-${cycleDay} siklus (rentang 1-7 atau 20-32).`],
      primary_code: 'SDM_LOWER_CHANCE_NOT_ZERO',
      method_version: 'SDM-CDC-2024.1',
      disclaimer: 'Standard Days Method memiliki angka kegagalan 13 kehamilan per 100 wanita per tahun pada penggunaan tipikal (CDC 2024).',
    };
  }
}
