/**
 * cycleEngine.test.js — Frontend unit tests for domain cycle calculations
 */

import { CycleEngine } from '../src/domain/CycleEngine.js';

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

console.log('Menjalankan CycleEngine Unit Tests (Frontend parity)...\n');

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

console.log(`\nHasil: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('SEMUA TEST FRONTEND LULUS!\n');
}
