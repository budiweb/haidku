/**
 * SDMConsentModal.js — Informed consent & risk acknowledgment modal for SDM
 */

export function openSDMConsentModal({ onConsentGiven, onCancel }) {
  const modalRoot = document.getElementById('modal-root');
  const modalContainer = document.createElement('div');
  modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 modal-overlay';

  modalContainer.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-2xl max-h-[92vh] flex flex-col shadow-2xl modal-content overflow-hidden">
      <!-- Header -->
      <div class="p-5 bg-gradient-to-b from-amber-50 to-white border-b border-amber-100 flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div class="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-300 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900 leading-tight">Persetujuan Standard Days Method</h2>
            <p class="text-[11px] text-gray-500">Pahami aturan, efektivitas & batasan medis</p>
          </div>
        </div>
        <button id="btn-consent-close" class="btn-tap w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-5 overflow-y-auto space-y-4 text-xs text-gray-600 leading-relaxed flex-1">
        <div class="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-amber-950 font-medium">
          <p class="font-bold text-xs flex items-center space-x-1.5 text-amber-900">
            <span>⚠️ Informasi Efektivitas Metode (CDC 2024):</span>
          </p>
          <p>
            Pada penggunaan tipikal (sehari-hari), sekitar <strong>13 dari 100 wanita mengalami kehamilan dalam satu tahun pertama</strong> penggunaan Standard Days Method. Angka ini adalah kegagalan tahunan metode, bukan tingkat risiko per hari.
          </p>
        </div>

        <div class="space-y-2">
          <h3 class="font-bold text-gray-900 text-xs uppercase tracking-wider">Syarat Ketat Penggunaan:</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Hanya cocok bagi wanita yang siklus menstruasinya teratur antara <strong>26 sampai 32 hari</strong>.</li>
            <li>Jika terdapat <strong>2 siklus atau lebih</strong> di luar rentang 26–32 hari dalam 1 tahun, metode ini <strong>tidak boleh lagi digunakan</strong>.</li>
            <li>HaidKu mewajibkan minimal <strong>3 siklus lengkap tercatat</strong> sebelum menampilkan status hari relatif lebih rendah.</li>
          </ul>
        </div>

        <div class="space-y-2">
          <h3 class="font-bold text-gray-900 text-xs uppercase tracking-wider">Batasan & Perlindungan:</h3>
          <ul class="list-disc list-inside space-y-1 text-gray-700">
            <li>Hari ke-8 s.d. 19: <strong>Wajib menghindari hubungan seksual tanpa perlindungan</strong> bila tidak ingin hamil.</li>
            <li>Hari 1–7 & 20–32: Peluang kehamilan relatif lebih rendah, namun <strong>risiko tidak pernah nol</strong>.</li>
            <li>Metode kalender <strong>tidak melindungi dari Infeksi Menular Seksual (IMS)</strong>.</li>
            <li>Bukan pengganti konsultasi keluarga berencana dengan bidan atau dokter kandungan.</li>
          </ul>
        </div>

        <div class="pt-2 border-t border-gray-100">
          <label class="flex items-start space-x-2.5 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200">
            <input type="checkbox" id="check-sdm-agree" class="mt-0.5 rounded text-rose-500 focus:ring-rose-400">
            <span class="text-xs text-gray-800 leading-snug">
              Saya telah membaca, memahami, dan menyetujui batasan medis serta efektivitas Standard Days Method. Saya mengerti bahwa HaidKu tidak menjamin pencegahan kehamilan.
            </span>
          </label>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="p-4 bg-gray-50 border-t border-gray-100 flex items-center space-x-2">
        <button id="btn-cancel-consent" class="btn-tap flex-1 bg-white hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-xl border border-gray-300 text-xs transition-colors">
          Batal
        </button>
        <button id="btn-confirm-consent" disabled class="btn-tap flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs">
          Setuju & Aktifkan
        </button>
      </div>
    </div>
  `;

  modalRoot.appendChild(modalContainer);

  const closeBtn = modalContainer.querySelector('#btn-consent-close');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-consent');
  const confirmBtn = modalContainer.querySelector('#btn-confirm-consent');
  const agreeCheck = modalContainer.querySelector('#check-sdm-agree');

  agreeCheck.addEventListener('change', () => {
    confirmBtn.disabled = !agreeCheck.checked;
  });

  const close = () => {
    modalContainer.remove();
  };

  closeBtn.addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  cancelBtn.addEventListener('click', () => {
    close();
    if (onCancel) onCancel();
  });

  confirmBtn.addEventListener('click', () => {
    close();
    if (onConsentGiven) onConsentGiven();
  });
}

