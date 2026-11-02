/**
 * EducationPage.js — Clinical education, medical disclaimers & privacy controls
 */

import { offlineStore } from '../storage/offlineStore.js';
import { apiAdapter } from '../adapters/apiAdapter.js';

export function renderEducationPage({ onResetApp }) {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4 fade-in';

  container.innerHTML = `
    <!-- Header -->
    <div>
      <h2 class="text-base font-bold text-gray-900">Edukasi & Privasi</h2>
      <p class="text-xs text-gray-500">Pemahaman berbasis bukti klinis & perlindungan data pribadi</p>
    </div>

    <!-- Mandatory Medical Guardrail Banner -->
    <div class="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 space-y-2">
      <div class="flex items-center space-x-2 font-bold text-amber-950">
        <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <span>Peringatan Keselamatan Reproduksi Wajib</span>
      </div>
      <p class="leading-relaxed">
        HaidKu tidak pernah menyatakan adanya "hari aman" atau "100% bebas risiko". Sel sperma dapat bertahan 3–5 hari di dalam saluran reproduksi wanita, dan ovulasi dapat bergeser secara alami. Prediksi kalender dan masa subur adalah estimasi edukatif, bukan konfirmasi ovulasi ataupun alat kontrasepsi yang disetujui tanpa konseling tenaga medis.
      </p>
    </div>

    <!-- Educational Articles List -->
    <div class="space-y-3" id="edu-articles-container">
      <div class="p-4 bg-white rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
        Memuat materi edukasi klinis...
      </div>
    </div>

    <!-- Privacy & Data Controls Card (UU No. 27/2022 PDP) -->
    <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        <h3 class="text-sm font-bold text-gray-900">Kendali Data Pribadi & Privasi</h3>
      </div>
      <p class="text-xs text-gray-600 leading-relaxed">
        Data kesehatan menstruasi Anda disimpan secara lokal di perangkat Anda (IndexedDB) dan tidak dibagikan ke pihak ketiga atau pengiklan. Anda memiliki kendali penuh atas data Anda sesuai prinsip UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
      </p>

      <div class="pt-2 space-y-2">
        <button id="btn-export-data" class="btn-tap w-full bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold py-2.5 px-4 rounded-xl border border-teal-200 transition-colors flex items-center justify-center space-x-2 text-xs">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span>Ekspor Seluruh Data Saya (JSON)</span>
        </button>

        <button id="btn-wipe-data" class="btn-tap w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 px-4 rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-2 text-xs">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          <span>Hapus Permanen Seluruh Data Saya</span>
        </button>
      </div>
    </div>

    <!-- App Info Footer -->
    <div class="text-center text-[11px] text-gray-400 pt-2 pb-6 space-y-1">
      <p class="font-bold text-gray-500">HaidKu v1.0.0</p>
      <p>PWA & Hybrid Android/iOS • PHP 8.3 Native API</p>
      <p>© 2026 HaidKu. Hak Cipta Dilindungi.</p>
    </div>
  `;

  // Load articles
  apiAdapter.getEducationalArticles().then((articles) => {
    const listContainer = container.querySelector('#edu-articles-container');
    if (!listContainer) return;

    listContainer.innerHTML = articles.map((art) => `
      <details class="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden group">
        <summary class="p-4 cursor-pointer font-bold text-xs text-gray-900 flex items-center justify-between select-none hover:bg-gray-50 transition-colors">
          <span>${art.title}</span>
          <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </summary>
        <div class="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50 space-y-2">
          <p class="whitespace-pre-line">${art.body}</p>
          ${art.reference_urls && art.reference_urls.length > 0 ? `
            <div class="pt-2 border-t border-gray-100 text-[10px] text-gray-400">
              <strong>Sumber Medis:</strong>
              <ul class="list-disc list-inside mt-0.5 space-y-0.5">
                ${art.reference_urls.map((u) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer" class="text-teal-600 hover:underline break-all">${u}</a></li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </details>
    `).join('');
  });

  // Export Data Handler
  container.querySelector('#btn-export-data').addEventListener('click', async () => {
    const data = await offlineStore.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haidku_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Wipe Data Handler
  container.querySelector('#btn-wipe-data').addEventListener('click', async () => {
    const confirmation = confirm('PERINGATAN: Seluruh data riwayat menstruasi dan pengaturan di perangkat ini akan dihapus secara permanen dan tidak dapat dipulihkan. Lanjutkan?');
    if (confirmation) {
      await offlineStore.clearAll();
      alert('Seluruh data berhasil dihapus.');
      if (onResetApp) onResetApp();
    }
  });

  return container;
}
