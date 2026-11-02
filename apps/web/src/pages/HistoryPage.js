/**
 * HistoryPage.js — Complete period history management with edit/delete
 */

import { CycleEngine } from '../domain/CycleEngine.js';

export function renderHistoryPage({ periods = [], onOpenAddModal, onEditPeriod, onDeletePeriod }) {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4 fade-in';

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

  // Urutkan DESC
  const sortedPeriods = [...periods].sort((a, b) => b.start_date.localeCompare(a.start_date));

  container.innerHTML = `
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-base font-bold text-gray-900">Riwayat Menstruasi</h2>
        <p class="text-xs text-gray-500">${sortedPeriods.length} catatan tersimpan di perangkat ini</p>
      </div>
      <button id="btn-add-history" class="btn-tap px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        <span>Tambah</span>
      </button>
    </div>

    <!-- Period Cards List -->
    <div class="space-y-3" id="history-list">
      ${sortedPeriods.length > 0 ? sortedPeriods.map((p, idx) => {
        const isSpotting = p.bleeding_type === 'spotting';
        let durationText = '1 hari';
        if (p.end_date) {
          try {
            const dur = CycleEngine.calculatePeriodLength(p.start_date, p.end_date);
            durationText = `${dur} hari`;
          } catch (e) {}
        } else if (!isSpotting) {
          durationText = 'Masih berlangsung';
        }

        // Hitung siklus jika ada data sebelumnya
        let cycleText = '';
        if (!isSpotting) {
          // Cari period menstruasi sebelumnya
          const nextPeriod = sortedPeriods.slice(idx + 1).find((item) => (item.bleeding_type || 'period') === 'period');
          if (nextPeriod) {
            const cycleDays = CycleEngine.calculateDaysBetween(nextPeriod.start_date, p.start_date);
            if (cycleDays > 0) {
              cycleText = `Siklus ${cycleDays} hari`;
            }
          }
        }

        const flowMap = { light: 'Ringan', medium: 'Sedang', heavy: 'Deras' };
        const flowLabel = flowMap[p.flow_level] || 'Sedang';

        return `
          <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col space-y-2">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full ${isSpotting ? 'bg-amber-400' : 'bg-rose-500'}"></span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full ${isSpotting ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}">
                  ${isSpotting ? 'Flek / Spotting' : 'Menstruasi'}
                </span>
                ${cycleText ? `<span class="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">${cycleText}</span>` : ''}
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-1">
                <button data-edit-id="${p.id}" class="btn-tap p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Ubah catatan">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
                <button data-delete-id="${p.id}" class="btn-tap p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" aria-label="Hapus catatan">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            <!-- Tanggal -->
            <div>
              <div class="text-sm font-bold text-gray-900">
                ${formatDateIndo(p.start_date)} ${p.end_date ? `— ${formatDateIndo(p.end_date)}` : '<span class="text-rose-500 font-normal text-xs">(masih berlangsung)</span>'}
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                Durasi: <span class="font-semibold text-gray-700">${durationText}</span> • Aliran: <span class="font-semibold text-gray-700">${flowLabel}</span>
              </div>
            </div>

            ${p.note ? `
              <p class="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg italic">
                "${p.note}"
              </p>
            ` : ''}
          </div>
        `;
      }).join('') : `
        <div class="bg-white rounded-2xl p-8 border border-gray-100 text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="text-sm font-bold text-gray-800">Belum Ada Riwayat</h3>
          <p class="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Mulai dengan mencatat hari pertama menstruasi Anda untuk melihat statistik dan keteraturan siklus.
          </p>
          <button id="btn-empty-add" class="btn-tap px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs">
            + Catat Haid Sekarang
          </button>
        </div>
      `}
    </div>
  `;

  container.querySelector('#btn-add-history')?.addEventListener('click', () => onOpenAddModal());
  container.querySelector('#btn-empty-add')?.addEventListener('click', () => onOpenAddModal());

  // Edit listeners
  container.querySelectorAll('button[data-edit-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-id');
      const p = periods.find((item) => item.id === id);
      if (p) onEditPeriod(p);
    });
  });

  // Delete listeners
  container.querySelectorAll('button[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-id');
      if (confirm('Hapus catatan ini? Statistik siklus akan langsung dihitung ulang.')) {
        onDeletePeriod(id);
      }
    });
  });

  return container;
}

