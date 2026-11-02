/**
 * StatsPage.js — Menstrual cycle statistics and insights
 */

export function renderStatsPage({ stats, periods = [] }) {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4 fade-in';

  const count = stats.completedCyclesCount || 0;
  const median = stats.medianCycleLength || 28;
  const variation = stats.cycleVariationDays || 0;
  const minC = stats.minCycleLength || median;
  const maxC = stats.maxCycleLength || median;
  const avgPeriod = stats.averagePeriodDuration || 5;

  // Evaluasi keteraturan siklus
  let regularityText = 'Belum Cukup Data';
  let regularityBadge = 'bg-gray-100 text-gray-700';
  let regularityDesc = 'Dibutuhkan minimal 3 siklus lengkap untuk mengevaluasi pola keteraturan siklus Anda secara andal.';

  if (count >= 3) {
    if (variation <= 4) {
      regularityText = 'Sangat Teratur';
      regularityBadge = 'bg-teal-100 text-teal-800 border border-teal-300';
      regularityDesc = `Variasi siklus Anda hanya ${variation} hari. Siklus tergolong sangat teratur dan konsisten.`;
    } else if (variation <= 8) {
      regularityText = 'Cukup Teratur';
      regularityBadge = 'bg-blue-100 text-blue-800 border border-blue-300';
      regularityDesc = `Variasi siklus ${variation} hari masih dalam rentang fluktuasi alami yang umum terjadi.`;
    } else {
      regularityText = 'Bervariasi';
      regularityBadge = 'bg-amber-100 text-amber-800 border border-amber-300';
      regularityDesc = `Variasi siklus Anda ${variation} hari. Pergeseran ovulasi sering terjadi; metode kalender tidak disarankan untuk pencegahan kehamilan.`;
    }
  }

  container.innerHTML = `
    <!-- Header -->
    <div>
      <h2 class="text-base font-bold text-gray-900">Statistik Siklus Menstruasi</h2>
      <p class="text-xs text-gray-500">Ringkasan kesehatan siklus berdasarkan data nyata Anda</p>
    </div>

    <!-- Regularity Card -->
    <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Keteraturan Siklus</span>
        <span class="text-xs font-bold px-2.5 py-1 rounded-full ${regularityBadge}">${regularityText}</span>
      </div>
      <p class="text-xs text-gray-600 leading-relaxed">${regularityDesc}</p>

      <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Siklus Lengkap Terdata:</span>
        <span class="font-bold text-gray-900">${count} siklus</span>
      </div>
    </div>

    <!-- Core Metrics Grid -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <span class="text-xs font-bold text-gray-400 block mb-1">Median Panjang Siklus</span>
        <div class="text-3xl font-black text-rose-500">${median} <span class="text-xs font-normal text-gray-500">hari</span></div>
        <p class="text-[10px] text-gray-400 mt-1">Normalnya berkisar 21–35 hari</p>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <span class="text-xs font-bold text-gray-400 block mb-1">Durasi Darah Haid</span>
        <div class="text-3xl font-black text-teal-600">${avgPeriod} <span class="text-xs font-normal text-gray-500">hari</span></div>
        <p class="text-[10px] text-gray-400 mt-1">Rata-rata lama perdarahan</p>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <span class="text-xs font-bold text-gray-400 block mb-1">Siklus Terpendek</span>
        <div class="text-2xl font-black text-gray-800">${count > 0 ? minC : '-'} <span class="text-xs font-normal text-gray-500">hari</span></div>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
        <span class="text-xs font-bold text-gray-400 block mb-1">Siklus Terpanjang</span>
        <div class="text-2xl font-black text-gray-800">${count > 0 ? maxC : '-'} <span class="text-xs font-normal text-gray-500">hari</span></div>
      </div>
    </div>

    <!-- Cycle Bar Comparison -->
    ${stats.cycleLengths && stats.cycleLengths.length > 0 ? `
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
        <h3 class="text-xs font-bold text-gray-800 uppercase tracking-wider">Perbandingan Panjang Siklus</h3>
        <div class="space-y-2.5 pt-1">
          ${stats.cycleLengths.map((len, i) => {
            const percentage = Math.min(100, Math.max(20, Math.round((len / 40) * 100)));
            return `
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-500 font-medium">Siklus #${stats.cycleLengths.length - i}</span>
                  <span class="font-bold text-gray-900">${len} hari</span>
                </div>
                <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div class="bg-rose-400 h-full rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Medical Notice Box -->
    <div class="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs text-gray-600 space-y-1.5 leading-relaxed">
      <div class="font-bold text-gray-800 flex items-center space-x-1.5">
        <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Catatan Medis & Keterbatasan Statistik</span>
      </div>
      <p>
        Panjang siklus menstruasi dihitung dari hari pertama suatu haid sampai sebelum hari pertama haid berikutnya. Nilai median digunakan sebagai acuan dasar yang lebih kebal terhadap siklus anomali dibanding nilai rata-rata biasa.
      </p>
    </div>
  `;

  return container;
}
