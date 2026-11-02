/**
 * PeriodModal.js — Interactive period entry and editor modal
 */

export function openPeriodModal({ period = null, defaultDate = null, onSave, onDelete }) {
  const modalRoot = document.getElementById('modal-root');
  const isEdit = !!period;
  const todayStr = new Date().toISOString().slice(0, 10);

  const initialStart = period?.start_date || defaultDate || todayStr;
  const initialEnd = period?.end_date || '';
  const initialBleeding = period?.bleeding_type || 'period';
  const initialFlow = period?.flow_level || 'medium';
  const initialNote = period?.note || '';
  const isOngoing = isEdit && !period.end_date;

  const modalContainer = document.createElement('div');
  modalContainer.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 modal-overlay';

  modalContainer.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl modal-content overflow-hidden">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
        <div>
          <h2 class="text-base font-bold text-gray-900">${isEdit ? 'Ubah Catatan Haid' : 'Catat Menstruasi / Flek'}</h2>
          <p class="text-xs text-gray-500">Pencatatan akurat membantu mengenali siklus alami Anda</p>
        </div>
        <button id="modal-close" class="btn-tap w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Tutup modal">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Modal Body -->
      <form id="period-form" class="p-5 overflow-y-auto space-y-4 text-sm flex-1">
        <!-- Error Message container -->
        <div id="form-error" class="hidden p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium"></div>

        <!-- Tipe Perdarahan -->
        <div>
          <label class="block font-semibold text-gray-700 mb-1.5">Jenis Perdarahan</label>
          <div class="grid grid-cols-2 gap-2">
            <label class="btn-tap flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all ${initialBleeding === 'period' ? 'border-rose-500 bg-rose-50/70 text-rose-700 font-bold' : 'border-gray-200 text-gray-600'}">
              <input type="radio" name="bleeding_type" value="period" class="sr-only" ${initialBleeding === 'period' ? 'checked' : ''}>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span>Darah Menstruasi</span>
              </span>
            </label>
            <label class="btn-tap flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all ${initialBleeding === 'spotting' ? 'border-amber-500 bg-amber-50/70 text-amber-700 font-bold' : 'border-gray-200 text-gray-600'}">
              <input type="radio" name="bleeding_type" value="spotting" class="sr-only" ${initialBleeding === 'spotting' ? 'checked' : ''}>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span>Flek / Spotting</span>
              </span>
            </label>
          </div>
          <p id="spotting-notice" class="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg mt-1.5 border border-amber-200/60 ${initialBleeding === 'spotting' ? '' : 'hidden'}">
            <strong>Penting:</strong> Flek/spotting tidak dihitung sebagai awal siklus baru (Day 1) demi keakuratan prediksi siklus menstruasi Anda.
          </p>
        </div>

        <!-- Tanggal Mulai -->
        <div>
          <label for="start_date" class="block font-semibold text-gray-700 mb-1">Tanggal Mulai <span class="text-rose-500">*</span></label>
          <input type="date" id="start_date" name="start_date" value="${initialStart}" max="${todayStr}" required class="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-gray-800 bg-white" />
        </div>

        <!-- Tanggal Selesai & Checkbox Masih Berlangsung -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="end_date" class="font-semibold text-gray-700">Tanggal Selesai</label>
            <label class="flex items-center space-x-1.5 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" id="is_ongoing" name="is_ongoing" class="rounded text-rose-500 focus:ring-rose-400" ${isOngoing ? 'checked' : ''}>
              <span>Masih berlangsung</span>
            </label>
          </div>
          <input type="date" id="end_date" name="end_date" value="${initialEnd}" max="${todayStr}" ${isOngoing ? 'disabled' : ''} class="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-gray-800 bg-white disabled:bg-gray-100 disabled:text-gray-400" />
          <p class="text-[11px] text-gray-400 mt-1">Boleh dikosongkan jika haid belum selesai.</p>
        </div>

        <!-- Volume / Intensitas Aliran Darah -->
        <div>
          <label class="block font-semibold text-gray-700 mb-1.5">Intensitas Aliran</label>
          <div class="grid grid-cols-3 gap-2">
            ${['light', 'medium', 'heavy'].map((flow) => {
              const labelMap = { light: 'Ringan', medium: 'Sedang', heavy: 'Deras' };
              const isSelected = initialFlow === flow;
              return `
                <label class="btn-tap flex items-center justify-center p-2 rounded-xl border text-xs cursor-pointer transition-all ${isSelected ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold' : 'border-gray-200 text-gray-600'}">
                  <input type="radio" name="flow_level" value="${flow}" class="sr-only" ${isSelected ? 'checked' : ''}>
                  <span>${labelMap[flow]}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Catatan Tambahan (Opsional) -->
        <div>
          <label for="note" class="block font-semibold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
          <textarea id="note" name="note" rows="2" placeholder="Gejala atau catatan pribadi (misal kram perut, pusing)..." class="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-gray-800 text-xs">${initialNote}</textarea>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 space-y-2">
          <button type="submit" class="btn-tap w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <span>${isEdit ? 'Simpan Perubahan' : 'Simpan Catatan'}</span>
          </button>

          ${isEdit ? `
            <button type="button" id="btn-delete" class="btn-tap w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-2.5 rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-1.5 text-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Hapus Catatan Ini</span>
            </button>
          ` : ''}
        </div>
      </form>
    </div>
  `;

  modalRoot.appendChild(modalContainer);

  const form = modalContainer.querySelector('#period-form');
  const errorBox = modalContainer.querySelector('#form-error');
  const closeBtn = modalContainer.querySelector('#modal-close');
  const ongoingCheckbox = modalContainer.querySelector('#is_ongoing');
  const endDateInput = modalContainer.querySelector('#end_date');
  const bleedingRadios = modalContainer.querySelectorAll('input[name="bleeding_type"]');
  const spottingNotice = modalContainer.querySelector('#spotting-notice');
  const flowRadios = modalContainer.querySelectorAll('input[name="flow_level"]');

  // Toggle Ongoing checkbox
  ongoingCheckbox.addEventListener('change', () => {
    if (ongoingCheckbox.checked) {
      endDateInput.value = '';
      endDateInput.disabled = true;
    } else {
      endDateInput.disabled = false;
    }
  });

  // Toggle Spotting notice & radio button style
  bleedingRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      bleedingRadios.forEach((r) => {
        const parent = r.closest('label');
        if (r.checked) {
          if (r.value === 'period') {
            parent.className = 'btn-tap flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all border-rose-500 bg-rose-50/70 text-rose-700 font-bold';
            spottingNotice.classList.add('hidden');
          } else {
            parent.className = 'btn-tap flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all border-amber-500 bg-amber-50/70 text-amber-700 font-bold';
            spottingNotice.classList.remove('hidden');
          }
        } else {
          parent.className = 'btn-tap flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all border-gray-200 text-gray-600';
        }
      });
    });
  });

  // Flow radio buttons styles
  flowRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      flowRadios.forEach((r) => {
        const parent = r.closest('label');
        if (r.checked) {
          parent.className = 'btn-tap flex items-center justify-center p-2 rounded-xl border text-xs cursor-pointer transition-all border-rose-500 bg-rose-50 text-rose-700 font-bold';
        } else {
          parent.className = 'btn-tap flex items-center justify-center p-2 rounded-xl border text-xs cursor-pointer transition-all border-gray-200 text-gray-600';
        }
      });
    });
  });

  const closeModal = () => {
    modalContainer.remove();
  };

  closeBtn.addEventListener('click', closeModal);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
  });

  // Delete handler
  if (isEdit) {
    const deleteBtn = modalContainer.querySelector('#btn-delete');
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Yakin ingin menghapus catatan tanggal ini? Riwayat siklus akan dihitung ulang secara otomatis.')) {
        await onDelete(period.id);
        closeModal();
      }
    });
  }

  // Submit handler with strict validation
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    errorBox.textContent = '';

    const formData = new FormData(form);
    const startDate = formData.get('start_date');
    const isOngoingChecked = ongoingCheckbox.checked;
    const endDate = isOngoingChecked ? null : (formData.get('end_date') || null);
    const bleedingType = formData.get('bleeding_type') || 'period';
    const flowLevel = formData.get('flow_level') || 'medium';
    const note = (formData.get('note') || '').trim();

    // Validation
    if (!startDate) {
      errorBox.textContent = 'Tanggal mulai wajib diisi.';
      errorBox.classList.remove('hidden');
      return;
    }

    if (endDate && endDate < startDate) {
      errorBox.textContent = 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
      errorBox.classList.remove('hidden');
      return;
    }

    try {
      await onSave({
        id: period?.id,
        start_date: startDate,
        end_date: endDate,
        bleeding_type: bleedingType,
        flow_level: flowLevel,
        note,
        status: 'confirmed',
      });
      closeModal();
    } catch (err) {
      errorBox.textContent = err.message || 'Gagal menyimpan catatan.';
      errorBox.classList.remove('hidden');
    }
  });
}
