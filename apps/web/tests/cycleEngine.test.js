/**
 * cycleEngine.test.js — Frontend unit tests for domain cycle & SDM calculations
 */

import { CycleEngine } from '../src/domain/CycleEngine.js';
import { SDMEngine } from '../src/domain/SDMEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}`);
    failed++;
  }
}

console.log('Menjalankan CycleEngine & SDMEngine Unit Tests (Sprint 2 & 3 Parity)...\n');

// T01: 1 Jan -> 29 Jan = 28 hari siklus
const diff1 = CycleEngine.calculateDaysBetween('2026-01-01', '2026-01-29');
assert(diff1 === 28, 'T01: Selisih 1 Jan ke 29 Jan adalah 28 hari');

// T02: 1 Jan s/d 5 Jan = 5 hari inklusif
const dur1 = CycleEngine.calculatePeriodLength('2026-01-01', '2026-01-05');
assert(dur1 === 5, 'T02: Durasi 1 Jan s/d 5 Jan adalah 5 hari inklusif');

// T02b: Single day
const durSingle = CycleEngine.calculatePeriodLength('2026-01-01', '2026-01-01');
assert(durSingle === 1, 'T02b: Durasi 1 hari tunggal adalah 1 hari');

// T17: Tahun kabisat 2024
const leapDiff = CycleEngine.calculateDaysBetween('2024-02-28', '2024-03-01');
assert(leapDiff === 2, 'T17: Kabisat 28 Feb 2024 ke 1 Mar 2024 adalah 2 hari');

// T17b: Non-kabisat 2025
const nonLeapDiff = CycleEngine.calculateDaysBetween('2025-02-28', '2025-03-01');
assert(nonLeapDiff === 1, 'T17b: Non-kabisat 28 Feb 2025 ke 1 Mar 2025 adalah 1 hari');

// Current Cycle Day
const day1 = CycleEngine.calculateCurrentCycleDay('2026-01-01', '2026-01-01');
assert(day1 === 1, 'Hari pertama adalah hari ke-1');

const day8 = CycleEngine.calculateCurrentCycleDay('2026-01-01', '2026-01-08');
assert(day8 === 8, 'Hari ke-8 terhitung benar');

// T11: Spotting tidak dihitung sebagai Day 1
const periods = [
  { start_date: '2026-03-01', end_date: '2026-03-05', bleeding_type: 'period', status: 'confirmed' },
  { start_date: '2026-02-14', end_date: '2026-02-14', bleeding_type: 'spotting', status: 'confirmed' },
  { start_date: '2026-02-01', end_date: '2026-02-05', bleeding_type: 'period', status: 'confirmed' },
  { start_date: '2026-01-04', end_date: '2026-01-08', bleeding_type: 'period', status: 'confirmed' },
];

const stats = CycleEngine.computeCycleStats(periods, '2026-03-10');
assert(stats.validPeriodsCount === 3, 'T11: Spotting difilter sehingga tersisa 3 haid valid');
assert(stats.completedCyclesCount === 2, '2 siklus lengkap');
assert(JSON.stringify(stats.cycleLengths) === JSON.stringify([28, 28]), 'Panjang siklus adalah [28, 28]');
assert(stats.medianCycleLength === 28, 'Median adalah 28');
assert(stats.currentCycleDay === 10, 'Hari ke-10 siklus pada tanggal 2026-03-10');

// T14: Ubah tanggal riwayat haid masa lalu => hasil langsung berubah
const modifiedPeriods = [
  { start_date: '2026-03-01', end_date: '2026-03-05', bleeding_type: 'period', status: 'confirmed' },
  { start_date: '2026-01-30', end_date: '2026-02-03', bleeding_type: 'period', status: 'confirmed' }, // diubah 2 hari lebih awal
  { start_date: '2026-01-04', end_date: '2026-01-08', bleeding_type: 'period', status: 'confirmed' },
];
const recalcStats = CycleEngine.computeCycleStats(modifiedPeriods, '2026-03-10');
assert(recalcStats.cycleLengths[0] === 30, 'T14: Perubahan tanggal masa lalu langsung menghitung ulang panjang siklus menjadi 30 hari');

// ----------------------------------------
// SDM Engine Tests (T03 - T13, T18, T23)
// ----------------------------------------
console.log('\nMenjalankan SDMEngine Tests...');

const eligibleUser = {
  goal: 'avoid',
  sdm_consent_at: '2026-01-01',
  risk_overrides: {},
};
const eligibleCycles = [28, 29, 27];

const elig = SDMEngine.evaluateEligibility(eligibleUser, eligibleCycles);
assert(elig.eligible === true, 'SDM: User eligible dengan 3 siklus normal');

// T03: Hari 7
const sdm7 = SDMEngine.getStatusForCycleDay(7, elig);
assert(sdm7.state === SDMEngine.STATE_LOWER_CHANCE_NOT_ZERO, 'T03: Hari 7 LOWER_CHANCE_NOT_ZERO');

// T04: Hari 8
const sdm8 = SDMEngine.getStatusForCycleDay(8, elig);
assert(sdm8.state === SDMEngine.STATE_HIGHER_FERTILITY_PRECAUTION, 'T04: Hari 8 HIGHER_FERTILITY_PRECAUTION');

// T05: Hari 19
const sdm19 = SDMEngine.getStatusForCycleDay(19, elig);
assert(sdm19.state === SDMEngine.STATE_HIGHER_FERTILITY_PRECAUTION, 'T05: Hari 19 HIGHER_FERTILITY_PRECAUTION');

// T06: Hari 20
const sdm20 = SDMEngine.getStatusForCycleDay(20, elig);
assert(sdm20.state === SDMEngine.STATE_LOWER_CHANCE_NOT_ZERO, 'T06: Hari 20 LOWER_CHANCE_NOT_ZERO');

// T07: Hari 32
const sdm32 = SDMEngine.getStatusForCycleDay(32, elig);
assert(sdm32.state === SDMEngine.STATE_LOWER_CHANCE_NOT_ZERO, 'T07: Hari 32 LOWER_CHANCE_NOT_ZERO');

// T08: Hari 33
const sdm33 = SDMEngine.getStatusForCycleDay(33, elig);
assert(sdm33.state === SDMEngine.STATE_UNKNOWN, 'T08: Hari 33 UNKNOWN');

// T09: 2 di luar rentang dalam 365 hari
const eligT09 = SDMEngine.evaluateEligibility(eligibleUser, [28, 25, 27, 34]);
assert(eligT09.eligible === false, 'T09: 2 siklus di luar rentang = ineligibility');

// T10: Kurang dari 3 siklus
const eligT10 = SDMEngine.evaluateEligibility(eligibleUser, [28, 28]);
assert(eligT10.eligible === false, 'T10: Hanya 2 siklus = ineligibility');

// T12: Salah satu siklus 25 atau 33 pada 3 terakhir
const eligT12 = SDMEngine.evaluateEligibility(eligibleUser, [25, 28, 29]);
assert(eligT12.eligible === false, 'T12: Siklus 25 pada 3 terakhir = ineligibility');

// T13: Pascamelahirkan/menyusui belum stabil
const eligT13 = SDMEngine.evaluateEligibility({ ...eligibleUser, risk_overrides: { postpartum_breastfeeding: true } }, eligibleCycles);
assert(eligT13.eligible === false, 'T13: Pascamelahirkan/menyusui = ineligibility');

// T18: Sinyal fertilitas bertentangan
const eligT18 = SDMEngine.evaluateEligibility({ ...eligibleUser, risk_overrides: { contradictory_fertility_signs: true } }, eligibleCycles);
assert(eligT18.eligible === false, 'T18: Sinyal fertilitas bertentangan = ineligibility');

// T23: Audit copy medis
const allMsgs = [
  sdm7.headline + ' ' + sdm7.message + ' ' + sdm7.warning + ' ' + sdm7.disclaimer,
  sdm8.headline + ' ' + sdm8.message + ' ' + sdm8.warning + ' ' + sdm8.disclaimer,
  sdm33.headline + ' ' + sdm33.message + ' ' + sdm33.warning + ' ' + sdm33.disclaimer,
];
const forbiddenPhrases = ['100% aman', 'hari aman', 'bebas risiko', 'pasti tidak hamil', 'tidak mungkin hamil'];
let hasForbidden = false;
for (const msg of allMsgs) {
  for (const f of forbiddenPhrases) {
    if (msg.toLowerCase().includes(f)) {
      hasForbidden = true;
      console.error(`  [FAIL] Frasa terlarang '${f}' dalam pesan: ${msg}`);
    }
  }
}
assert(!hasForbidden, 'T23: Audit copy bebas frasa terlarang');

console.log(`\nHasil Pengujian JS: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('SEMUA TEST FRONTEND JS LULUS (100% SUKSES)!\n');
}
