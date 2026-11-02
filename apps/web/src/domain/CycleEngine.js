/**
 * CycleEngine.js — Pure domain logic for menstrual cycle calculations
 * Matches PHP CycleCalculatorService for 100% parity
 */

export class CycleEngine {
  /**
   * T01: Menghitung selisih hari kalender murni YYYY-MM-DD.
   * Contoh: 2026-01-01 -> 2026-01-29 = 28 hari.
   */
  static calculateDaysBetween(startDate1, startDate2) {
    const [y1, m1, d1] = startDate1.split('-').map(Number);
    const [y2, m2, d2] = startDate2.split('-').map(Number);

    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);

    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((utc2 - utc1) / msPerDay);
  }

  /**
   * Alias untuk calculateDaysBetween
   */
  static diffDays(d1, d2) {
    return this.calculateDaysBetween(d1, d2);
  }

  /**
   * Menghitung nilai tengah (median) dari deret angka
   */
  static calculateMedian(numbers = []) {
    if (!numbers || numbers.length === 0) return 28;
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    const mid = Math.floor(n / 2);
    return n % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  /**
   * T02: Menghitung durasi perdarahan haid inklusif.
   * Contoh: 1 Jan s/d 5 Jan = 5 hari.
   */
  static calculatePeriodLength(startDate, endDate) {
    if (!endDate || endDate.trim() === '') {
      return 1;
    }
    const days = this.calculateDaysBetween(startDate, endDate);
    if (days < 0) {
      throw new Error('Tanggal selesai tidak boleh sebelum tanggal mulai.');
    }
    return days + 1;
  }

  /**
   * Menghitung hari ke-N dari siklus berjalan.
   */
  static calculateCurrentCycleDay(latestConfirmedDay1, todayStr = null) {
    const today = todayStr || this.formatDate(new Date());
    const diff = this.calculateDaysBetween(latestConfirmedDay1, today);
    return diff >= 0 ? diff + 1 : 0;
  }

  /**
   * Format helper YYYY-MM-DD
   */
  static formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Tambah N hari ke tanggal YYYY-MM-DD
   */
  static addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  /**
   * Menghitung statistik lengkap siklus
   */
  static computeCycleStats(periods = [], todayStr = null) {
    const today = todayStr || this.formatDate(new Date());

    // Filter catatan haid yang sah (bukan spotting murni)
    const validPeriods = periods.filter((p) => {
      const bleeding = p.bleeding_type || 'period';
      return bleeding === 'period' && (p.status || 'confirmed') === 'confirmed';
    });

    // Urutkan start_date DESC (terbaru ke terlama)
    validPeriods.sort((a, b) => b.start_date.localeCompare(a.start_date));

    const cycleLengths = [];
    const periodDurations = [];

    // Durasi pendarahan
    for (const p of validPeriods) {
      if (p.end_date) {
        try {
          const dur = this.calculatePeriodLength(p.start_date, p.end_date);
          if (dur > 0 && dur <= 20) {
            periodDurations.push(dur);
          }
        } catch (e) {
          // ignore invalid
        }
      }
    }

    // Panjang siklus antar haid berurutan
    for (let i = 0; i < validPeriods.length - 1; i++) {
      const newerStart = validPeriods[i].start_date;
      const olderStart = validPeriods[i + 1].start_date;
      const diff = this.calculateDaysBetween(olderStart, newerStart);
      if (diff >= 15 && diff <= 90) {
        cycleLengths.push(diff);
      }
    }

    let medianCycle = 28;
    let avgCycle = null;
    let minCycle = null;
    let maxCycle = null;
    let cycleVariation = 0;

    if (cycleLengths.length > 0) {
      const sorted = [...cycleLengths].sort((a, b) => a - b);
      const n = sorted.length;
      const mid = Math.floor(n / 2);
      medianCycle = n % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
      avgCycle = Math.round(sorted.reduce((acc, c) => acc + c, 0) / n);
      minCycle = sorted[0];
      maxCycle = sorted[n - 1];
      cycleVariation = maxCycle - minCycle;
    }

    const avgPeriodDuration = periodDurations.length > 0
      ? Math.round(periodDurations.reduce((acc, d) => acc + d, 0) / periodDurations.length)
      : 5;

    const latestPeriod = validPeriods[0] || null;
    let currentCycleDay = 0;
    let predictedNextPeriod = null;
    let estimatedOvulation = null;
    let fertileWindowStart = null;
    let fertileWindowEnd = null;
    let confidence = 'none';

    if (latestPeriod) {
      currentCycleDay = this.calculateCurrentCycleDay(latestPeriod.start_date, today);
      predictedNextPeriod = this.addDays(latestPeriod.start_date, medianCycle);
      estimatedOvulation = this.addDays(predictedNextPeriod, -14);
      fertileWindowStart = this.addDays(estimatedOvulation, -5);
      fertileWindowEnd = this.addDays(estimatedOvulation, 1);
      confidence = cycleLengths.length >= 3 ? 'high' : (cycleLengths.length >= 1 ? 'medium' : 'low');
    }

    return {
      validPeriodsCount: validPeriods.length,
      completedCyclesCount: cycleLengths.length,
      cycleLengths,
      medianCycleLength: medianCycle,
      averageCycleLength: avgCycle,
      minCycleLength: minCycle,
      maxCycleLength: maxCycle,
      cycleVariationDays: cycleVariation,
      averagePeriodDuration: avgPeriodDuration,
      latestPeriod,
      currentCycleDay,
      predictedNextPeriod,
      estimatedOvulation,
      fertileWindowStart,
      fertileWindowEnd,
      confidence,
      disclaimer: 'Perhitungan tanggal menstruasi dan masa subur adalah estimasi edukatif berbasis kalender, bukan diagnosis klinis atau konfirmasi ovulasi.',
    };
  }
}

