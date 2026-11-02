/**
 * DashboardPage.js — Premium mobile-first dashboard
 */

export function renderDashboardPage({ stats, periods = [], onOpenAddModal, onNavigate }) {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4 fade-in';

  const hasData = periods.length > 0 && stats.latestPeriod;
  const currentDay = stats.currentCycleDay || 0;
  const medianCycle = stats.medianCycleLength || 28;
  const predictedNext = stats.predictedNextPeriod;
  const isPeriodOngoing = stats.latestPeriod && !stats.latestPeriod.end_date;

  // Tentukan fase edukatif berdasarkan hari siklus
  let phaseTitle = 'Mulai Pencatatan';
  let phaseDesc = 'Catat tanggal mulai haid untuk memantau siklus Anda.';
  let phaseBadgeColor = 'bg-gray-100 text-gray-700';

  if (hasData) {
    if (isPeriodOngoing || currentDay <= (stats.averagePeriodDuration || 5)) {
      phaseTitle = 'Fase Menstruasi';
      phaseDesc = 'Tubuh sedang meluruhkan dinding rahim. Pastikan istirahat & hidrasi cukup.';
      phaseBadgeColor = 'bg-rose-100 text-rose-800';
    } else if (currentDay >= 8 && currentDay <= 19) {
      phaseTitle = 'Perkiraan Masa Subur Edukatif';
      phaseDesc = 'Berdasarkan kalender, peluang pembuahan berada pada fase relatif lebih tinggi.';
      phaseBadgeColor = 'bg-teal-100 text-teal-800';
    } else if (currentDay > 19 && currentDay <= medianCycle) {
      phaseTitle = 'Fase Luteal';
      phaseDesc = 'Hormon progesteron mendominasi. Tubuh bersiap menuju siklus berikutnya.';
      phaseBadgeColor = 'bg-purple-100 text-purple-800';
    } else if (currentDay > medianCycle) {
      phaseTitle = 'Menjelang / Lewat Perkiraan Haid';
      phaseDesc = 'Panjang siklus bervariasi secara alami. Catat segera bila haid baru dimulai.';
      phaseBadgeColor = 'bg-amber-100 text-amber-800';
    } else {
      phaseTitle = 'Fase Folikular';
      phaseDesc = 'Folikel indung telur sedang berkembang untuk mempersiapkan ovulasi.';
      phaseBadgeColor = 'bg-blue-100 text-blue-800';
    }
  }

  // Format tanggal Indonesia
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
    } catch (e) {
      return dateStr;
    }
  };

  container.innerHTML = `
    <!-- Hero Cycle Day Card -->
    <div class="relative overflow-hidden bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 rounded-2xl p-6 text-white shadow-md">
      <!-- Decorative circle -->
      <div class="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>

      <div class="flex items-center justify-between mb-4">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${phaseBadgeColor} shadow-xs">
          ${phaseTitle}
        </span>
        <span class="text-xs text-rose-100">
          ${hasData ? `Haid terakhir: ${formatDateIndo(stats.latestPeriod.start_date)}` : 'Mode Tamu Offline'}
        </span>
      </div>

      <div class="flex items-center space-x-5 my-2">
        <!-- Big Day Circle -->
        <div class="w-20 h-20 rounded-full border-4 border-white/30 bg-white/10 flex flex-col items-center justify-center shadow-inner">
          <span class="text-[11px] uppercase tracking-wider text-rose-100 leading-none">Hari</span>
          <span class="text-3xl font-black text-white leading-none mt-1">${hasData ? currentDay : '-'}</span>
        </div>

        <div class="flex-1">
          <h2 class="text-base font-bold text-white leading-snug">
            ${hasData ? `Hari ke-${currentDay} dari Siklus` : 'Belum Ada Catatan Haid'}
          </h2>
          <p class="text-xs text-rose-100 mt-1 leading-relaxed">
            ${phaseDesc}
          </p>
        </div>
      </div>

      <!-- Forecast bar -->
      ${hasData && predictedNext ? `
        <div class="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
          <div>
            <span class="text-rose-200">Perkiraan haid berikutnya:</span>
            <div class="font-bold text-white">${formatDateIndo(predictedNext)} <span class="text-[10px] font-normal text-rose-200">(Estimasi)</span></div>
          </div>
          <button id="btn-why-status" class="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-medium transition-colors">
            Kenapa estimasi?
          </button>
        </div>
      ` : `
        <div class="mt-4 pt-4 border-t border-white/20 text-xs text-rose-100">
          Tekan tombol di bawah untuk mencatat hari pertama haid Anda.
        </div>
      `}
    </div>

    <!-- Quick CTA Button -->
    <div>
      <button id="btn-hero-add" class="btn-tap w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
        </svg>
        <span>+ Catat Haid Sekarang</span>
      </button>
    </div>

    <!-- Quick Insight Cards Grid -->
    <div class="grid grid-cols-2 gap-3">
      <!-- Rata-rata Siklus -->
      <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-gray-500 mb-2">
          <span class="text-xs font-semibold">Median Siklus</span>
          <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <div>
          <div class="text-2xl font-black text-gray-900">${medianCycle} <span class="text-xs font-normal text-gray-500">hari</span></div>
          <p class="text-[10px] text-gray-400 mt-0.5">
            ${stats.completedCyclesCount > 0 ? `Dari ${stats.completedCyclesCount} siklus terdata` : 'Nilai acuan awal'}
          </p>
        </div>
      </div>

      <!-- Durasi Haid -->
      <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
        <div class="flex items-center justify-between text-gray-500 mb-2">
          <span class="text-xs font-semibold">Durasi Haid</span>
          <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <div class="text-2xl font-black text-gray-900">${stats.averagePeriodDuration || 5} <span class="text-xs font-normal text-gray-500">hari</span></div>
          <p class="text-[10px] text-gray-400 mt-0.5">Rata-rata perdarahan</p>
        </div>
      </div>
    </div>

    <!-- Mode Standard Days Method / Edukasi Keselamatan -->
    <div class="bg-white rounded-xl border border-teal-100 p-4 shadow-xs">
      <div class="flex items-center space-x-2 mb-2">
        <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
        <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wide">Edukasi Masa Subur & SDM</h3>
      </div>
      <p class="text-xs text-gray-600 leading-relaxed">
        ${hasData && currentDay >= 8 && currentDay <= 19
          ? '<strong>Hari 8–19 siklus:</strong> Menurut Standard Days Method (SDM), ini periode dengan peluang kehamilan lebih tinggi. Hindari hubungan tanpa perlindungan bila tidak ingin hamil.'
          : 'Standard Days Method hanya berlaku bagi siklus teratur 26–32 hari dengan minimal 3 riwayat siklus terdata. Tidak ada hari yang dijamin 100% bebas risiko.'
        }
      </p>
      <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <span class="text-[11px] text-gray-400">CDC 2024 Protocol</span>
        <button id="btn-read-sdm" class="text-teal-600 hover:text-teal-700 font-semibold text-xs flex items-center space-x-1">
          <span>Pelajari batasan metode</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <!-- Riwayat Singkat -->
    <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-gray-900">Catatan Terakhir</h3>
        <button id="btn-view-all-history" class="text-xs text-rose-600 font-semibold hover:underline">
          Lihat Semua
        </button>
      </div>

      ${periods.length > 0 ? `
        <div class="divide-y divide-gray-100">
          ${periods.slice(0, 3).map((p) => {
            const isSpotting = p.bleeding_type === 'spotting';
            return `
              <div class="py-2.5 flex items-center justify-between text-xs">
                <div class="flex items-center space-x-2.5">
                  <span class="w-2.5 h-2.5 rounded-full ${isSpotting ? 'bg-amber-400' : 'bg-rose-500'}"></span>
                  <div>
                    <div class="font-bold text-gray-800">${formatDateIndo(p.start_date)} ${p.end_date ? `— ${formatDateIndo(p.end_date)}` : '<span class="text-rose-500 font-normal">(masih haid)</span>'}</div>
                    <div class="text-[10px] text-gray-400 capitalize">${isSpotting ? 'Flek / Spotting' : `Menstruasi • Aliran ${p.flow_level || 'sedang'}`}</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <p class="text-xs text-gray-400 py-3 text-center">Belum ada catatan menstruasi.</p>
      `}
    </div>
  `;

  // Event Listeners
  container.querySelector('#btn-hero-add').addEventListener('click', onOpenAddModal);
  container.querySelector('#btn-why-status')?.addEventListener('click', () => onNavigate('education'));
  container.querySelector('#btn-read-sdm').addEventListener('click', () => onNavigate('education'));
  container.querySelector('#btn-view-all-history').addEventListener('click', () => onNavigate('history'));

  return container;
}
