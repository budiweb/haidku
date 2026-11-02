/**
 * OnboardingModal.js — First-time user greeting & goal selection modal
 */

export function openOnboardingModal({ onComplete }) {
  const modalRoot = document.getElementById('modal-root');
  const modalContainer = document.createElement('div');
  modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 modal-overlay';

  modalContainer.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-2xl max-h-[92vh] flex flex-col shadow-2xl modal-content overflow-hidden">
      <!-- Header -->
      <div class="p-6 bg-gradient-to-b from-rose-50 to-white text-center border-b border-rose-100">
        <div class="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border-2 border-rose-400 flex items-center justify-center mb-3">
          <svg class="w-7 h-7 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h2 class="text-xl font-black text-gray-900 tracking-tight">Selamat Datang di HaidKu</h2>
        <p class="text-xs text-rose-600 font-semibold mt-1">Kenali Siklusmu, Pahami Tubuhmu</p>
      </div>

      <!-- Content -->
      <form id="onboarding-form" class="p-6 overflow-y-auto space-y-4 text-sm flex-1">
        <div>
          <label class="block font-bold text-gray-800 mb-2">Apa tujuan utama Anda?</label>
          <div class="space-y-2">
            <label class="btn-tap flex items-start p-3 rounded-xl border border-rose-300 bg-rose-50/50 cursor-pointer">
              <input type="radio" name="goal" value="track" checked class="mt-1 text-rose-500 focus:ring-rose-400">
              <div class="ml-3">
                <span class="block font-semibold text-gray-900">Memantau Siklus Haid</span>
                <span class="text-xs text-gray-500">Mencatat tanggal menstruasi & melihat keteraturan siklus bulanan.</span>
              </div>
            </label>

            <label class="btn-tap flex items-start p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer">
              <input type="radio" name="goal" value="conceive" class="mt-1 text-rose-500 focus:ring-rose-400">
              <div class="ml-3">
                <span class="block font-semibold text-gray-900">Merencanakan Kehamilan</span>
                <span class="text-xs text-gray-500">Melihat perkiraan masa subur edukatif untuk membantu waktu promil.</span>
              </div>
            </label>

            <label class="btn-tap flex items-start p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer">
              <input type="radio" name="goal" value="avoid" class="mt-1 text-rose-500 focus:ring-rose-400">
              <div class="ml-3">
                <span class="block font-semibold text-gray-900">Memahami Peluang Kehamilan</span>
                <span class="text-xs text-gray-500">Edukasi Standard Days Method (SDM) bagi siklus yang teratur 26-32 hari.</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Tanggal Haid Terakhir (Opsional) -->
        <div>
          <label for="ob-last-period" class="block font-bold text-gray-800 mb-1">Kapan hari pertama haid terakhir Anda?</label>
          <p class="text-xs text-gray-500 mb-1.5">Opsional, Anda bisa mengisinya sekarang atau nanti.</p>
          <input type="date" id="ob-last-period" name="last_period_date" class="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-gray-800 bg-white" />
        </div>

        <!-- Informed Consent & Medical Guardrail Checkbox -->
        <div class="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <label class="flex items-start space-x-2.5 cursor-pointer">
            <input type="checkbox" id="consent-check" required class="mt-1 rounded text-rose-500 focus:ring-rose-400">
            <span class="text-xs text-gray-600 leading-relaxed">
              <strong>Pemberitahuan Medis Wajib:</strong> Saya memahami bahwa prediksi kalender dan perkiraan masa subur di HaidKu bersifat edukatif, bukan konfirmasi ovulasi atau jaminan 100% bebas risiko untuk berhubungan tanpa kontrasepsi.
            </span>
          </label>
        </div>

        <button type="submit" class="btn-tap w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center space-x-2">
          <span>Mulai Menggunakan HaidKu</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </form>
    </div>
  `;

  modalRoot.appendChild(modalContainer);

  const form = modalContainer.querySelector('#onboarding-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const goal = formData.get('goal');
    const lastPeriodDate = formData.get('last_period_date') || null;

    modalContainer.remove();
    onComplete({
      goal,
      lastPeriodDate,
      sdmConsent: true,
      onboardingCompleted: true,
    });
  });
}
