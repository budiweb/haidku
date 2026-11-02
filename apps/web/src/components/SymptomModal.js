/**
 * SymptomModal.js — Interactive Daily Symptom & Mood Tracker
 * Based on ERD daily_symptoms entity
 */

export function openSymptomModal({ symptom = null, defaultDate = null, onSave, onDelete }) {
  const modalRoot = document.getElementById('modal-root');
  const isEdit = !!symptom;
  const todayStr = new Date().toISOString().slice(0, 10);
  const targetDate = symptom?.observation_date || defaultDate || todayStr;

  const currentPain = symptom?.pain_scale !== undefined ? Number(symptom.pain_scale) : 0;
  const currentMood = symptom?.mood || 'calm';
  const currentSymptoms = Array.isArray(symptom?.symptoms) ? symptom.symptoms : [];
  const currentNote = symptom?.notes || symptom?.notes_encrypted || '';

  const modalContainer = document.createElement('div');
  modalContainer.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 modal-overlay';

  const moods = [
    { key: 'happy', label: 'Senang', emoji: '😊' },
    { key: 'calm', label: 'Tenang', emoji: '😌' },
    { key: 'sensitive', label: 'Sensitif', emoji: '😠' },
    { key: 'anxious', label: 'Cemas', emoji: '😰' },
    { key: 'tired', label: 'Lelah', emoji: '😴' },
    { key: 'sad', label: 'Sedih', emoji: '😢' },
  ];

  const symptomList = [
    { key: 'cramps', label: 'Kram Perut', icon: '⚡' },
    { key: 'headache', label: 'Sakit Kepala', icon: '🤕' },
    { key: 'breast_tenderness', label: 'Payudara Kencang', icon: '🌸' },
    { key: 'bloating', label: 'Perut Kembung', icon: '🎈' },
    { key: 'backache', label: 'Nyeri Punggung', icon: '🦴' },
    { key: 'acne', label: 'Jerawat', icon: '✨' },
    { key: 'nausea', label: 'Mual', icon: '🤢' },
    { key: 'insomnia', label: 'Sulit Tidur', icon: '🌙' },
  ];

  modalContainer.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl modal-content overflow-hidden">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-teal-50/50">
        <div>
          <h2 class="text-base font-bold text-gray-900">${isEdit ? 'Ubah Gejala Harian' : 'Catat Gejala & Kondisi Tubuh'}</h2>
          <p class="text-xs text-gray-500">Membantu mengenali pola fisik dan emosional Anda</p>
        </div>
        <button id="modal-close" class="btn-tap w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Tutup modal">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Modal Body -->
      <form id="symptom-form" class="p-5 overflow-y-auto space-y-4 text-sm flex-1">
        <!-- Error Message -->
        <div id="form-error" class="hidden p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium"></div>

        <!-- Tanggal Observasi -->
        <div>
          <label for="observation_date" class="block font-semibold text-gray-700 mb-1">Tanggal Observasi</label>
          <input type="date" id="observation_date" name="observation_date" value="${targetDate}" max="${todayStr}" required class="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-gray-800 bg-white" />
        </div>

        <!-- Mood Harian -->
        <div>
          <label class="block font-semibold text-gray-700 mb-1.5">Mood & Suasana Hati</label>
          <div class="grid grid-cols-3 gap-2">
            ${moods.map((m) => {
              const isSelected = currentMood === m.key;
              return `
                <label class="mood-option btn-tap flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-gray-200 text-gray-600'}">
                  <input type="radio" name="mood" value="${m.key}" class="sr-only" ${isSelected ? 'checked' : ''}>
                  <span class="text-xl mb-0.5">${m.emoji}</span>
                  <span class="text-[11px]">${m.label}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Skala Nyeri (0 - 5) -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="font-semibold text-gray-700">Tingkat Nyeri / Kram</label>
            <span id="pain-label" class="text-xs font-bold text-teal-600">${currentPain === 0 ? 'Tidak Ada' : `Skala ${currentPain} / 5`}</span>
          </div>
          <div class="grid grid-cols-6 gap-1.5">
            ${[0, 1, 2, 3, 4, 5].map((lvl) => {
              const isSelected = currentPain === lvl;
              return `
                <button type="button" data-pain="${lvl}" class="pain-btn btn-tap py-2 rounded-lg border text-xs font-bold transition-all ${isSelected ? 'bg-teal-500 text-white border-teal-500 shadow-sm' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}">
                  ${lvl}
                </button>
              `;
            }).join('')}
          </div>
          <input type="hidden" id="pain_scale" name="pain_scale" value="${currentPain}" />
        </div>

        <!-- Gejala Fisik (Multi-select) -->
        <div>
          <label class="block font-semibold text-gray-700 mb-1.5">Gejala Fisik yang Dirasakan</label>
          <div class="grid grid-cols-2 gap-2">
            ${symptomList.map((s) => {
              const isChecked = currentSymptoms.includes(s.key);
              return `
                <label class="symptom-chip btn-tap flex items-center space-x-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${isChecked ? 'border-teal-500 bg-teal-50 text-teal-800 font-semibold' : 'border-gray-200 text-gray-600'}">
                  <input type="checkbox" name="symptoms" value="${s.key}" class="sr-only" ${isChecked ? 'checked' : ''}>
                  <span>${s.icon}</span>
                  <span>${s.label}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Catatan Pribadi -->
        <div>
          <label for="symptom_notes" class="block font-semibold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
          <textarea id="symptom_notes" name="notes" rows="2" placeholder="Makanan yang dikonsumsi, durasi tidur, atau hal khusus..." class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-gray-800 text-xs">${currentNote}</textarea>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 space-y-2">
          <button type="submit" class="btn-tap w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span>${isEdit ? 'Perbarui Gejala' : 'Simpan Gejala Harian'}</span>
          </button>

          ${isEdit ? `
            <button type="button" id="btn-delete-symptom" class="btn-tap w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-2 rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-1.5 text-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Hapus Gejala Tanggal Ini</span>
            </button>
          ` : ''}
        </div>
      </form>
    </div>
  `;

  modalRoot.appendChild(modalContainer);

  const form = modalContainer.querySelector('#symptom-form');
  const errorBox = modalContainer.querySelector('#form-error');
  const closeBtn = modalContainer.querySelector('#modal-close');
  const painInput = modalContainer.querySelector('#pain_scale');
  const painLabel = modalContainer.querySelector('#pain-label');
  const painButtons = modalContainer.querySelectorAll('.pain-btn');
  const moodLabels = modalContainer.querySelectorAll('.mood-option');
  const symptomChips = modalContainer.querySelectorAll('.symptom-chip');

  // Pain scale button click
  painButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-pain');
      painInput.value = val;
      painLabel.textContent = val === '0' ? 'Tidak Ada' : `Skala ${val} / 5`;

      painButtons.forEach((b) => {
        if (b.getAttribute('data-pain') === val) {
          b.className = 'pain-btn btn-tap py-2 rounded-lg border text-xs font-bold transition-all bg-teal-500 text-white border-teal-500 shadow-sm';
        } else {
          b.className = 'pain-btn btn-tap py-2 rounded-lg border text-xs font-bold transition-all border-gray-200 text-gray-700 hover:bg-gray-50';
        }
      });
    });
  });

  // Mood selection radio styling
  moodLabels.forEach((lbl) => {
    const radio = lbl.querySelector('input[type="radio"]');
    radio.addEventListener('change', () => {
      moodLabels.forEach((l) => {
        const r = l.querySelector('input[type="radio"]');
        if (r.checked) {
          l.className = 'mood-option btn-tap flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all border-teal-500 bg-teal-50 text-teal-800 font-bold';
        } else {
          l.className = 'mood-option btn-tap flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all border-gray-200 text-gray-600';
        }
      });
    });
  });

  // Symptom chip multi-select styling
  symptomChips.forEach((chip) => {
    const cb = chip.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', () => {
      if (cb.checked) {
        chip.className = 'symptom-chip btn-tap flex items-center space-x-2 p-2 rounded-xl border text-xs cursor-pointer transition-all border-teal-500 bg-teal-50 text-teal-800 font-semibold';
      } else {
        chip.className = 'symptom-chip btn-tap flex items-center space-x-2 p-2 rounded-xl border text-xs cursor-pointer transition-all border-gray-200 text-gray-600';
      }
    });
  });

  const closeModal = () => {
    modalContainer.remove();
  };

  closeBtn.addEventListener('click', closeModal);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
  });

  // Delete symptom
  if (isEdit) {
    const deleteBtn = modalContainer.querySelector('#btn-delete-symptom');
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Yakin ingin menghapus catatan gejala pada tanggal ini?')) {
        await onDelete(targetDate);
        closeModal();
      }
    });
  }

  // Submit symptom
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    errorBox.textContent = '';

    const formData = new FormData(form);
    const observationDate = formData.get('observation_date');
    const mood = formData.get('mood') || 'calm';
    const painScale = Number(painInput.value || 0);
    const selectedSymptoms = Array.from(formData.getAll('symptoms'));
    const notes = (formData.get('notes') || '').trim();

    if (!observationDate) {
      errorBox.textContent = 'Tanggal observasi wajib diisi.';
      errorBox.classList.remove('hidden');
      return;
    }

    try {
      await onSave({
        observation_date: observationDate,
        pain_scale: painScale,
        mood,
        symptoms: selectedSymptoms,
        notes,
      });
      closeModal();
    } catch (err) {
      errorBox.textContent = err.message || 'Gagal menyimpan catatan gejala.';
      errorBox.classList.remove('hidden');
    }
  });
}
