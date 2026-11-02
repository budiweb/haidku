/**
 * CalendarPage.js — Interactive monthly calendar with accessible legend & tap-to-log
 */

export function renderCalendarPage({ periods = [], stats, onOpenAddModal, onOpenSymptomModal, onEditPeriod }) {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4 fade-in';

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-indexed
  const todayStr = new Date().toISOString().slice(0, 10);

  function renderView() {
    container.innerHTML = '';

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Hitung tanggal pertama dan jumlah hari dalam bulan
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Map tanggal aktual
    const periodDays = new Map();
    for (const p of periods) {
      const type = p.bleeding_type || 'period';
      const pStart = p.start_date;
      const pEnd = p.end_date || pStart;

      let c = new Date(pStart);
      const endD = new Date(pEnd);
      while (c <= endD) {
        const dStr = c.toISOString().slice(0, 10);
        periodDays.set(dStr, { type, period: p });
        c.setDate(c.getDate() + 1);
      }
    }

    // Map prediksi haid berikutnya
    const predictedDays = new Set();
    if (stats.predictedNextPeriod) {
      const pStart = new Date(stats.predictedNextPeriod);
      const avgDuration = stats.averagePeriodDuration || 5;
      for (let i = 0; i < avgDuration; i++) {
        const d = new Date(pStart);
        d.setDate(d.getDate() + i);
        predictedDays.add(d.toISOString().slice(0, 10));
      }
    }

    // Map estimasi fertile window
    const fertileDays = new Set();
    if (stats.fertileWindowStart && stats.fertileWindowEnd) {
      let f = new Date(stats.fertileWindowStart);
      const fEnd = new Date(stats.fertileWindowEnd);
      while (f <= fEnd) {
        fertileDays.add(f.toISOString().slice(0, 10));
        f.setDate(f.getDate() + 1);
      }
    }

    // Header navigasi kalender
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-xs';
    headerDiv.innerHTML = `
      <button id="cal-prev" class="btn-tap w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors" aria-label="Bulan sebelumnya">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>

      <div class="text-center">
        <h2 class="text-base font-bold text-gray-900 leading-tight">${monthNames[currentMonth]} ${currentYear}</h2>
        <button id="cal-today" class="text-[11px] text-rose-600 font-semibold hover:underline">Ke Hari Ini</button>
      </div>

      <button id="cal-next" class="btn-tap w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors" aria-label="Bulan berikutnya">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    `;
    container.appendChild(headerDiv);

    // Grid kalender
    const gridCard = document.createElement('div');
    gridCard.className = 'bg-white p-3 rounded-2xl border border-gray-100 shadow-xs';

    // Day of week headers
    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let gridHTML = `
      <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
        ${dayLabels.map((lbl, idx) => `<div class="${idx === 0 ? 'text-red-400' : ''}">${lbl}</div>`).join('')}
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-xs" id="cal-days-grid">
    `;

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      gridHTML += `<div class="aspect-square"></div>`;
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const fullDate = `${currentYear}-${mStr}-${dStr}`;

      const isToday = fullDate === todayStr;
      const actual = periodDays.get(fullDate);
      const isPredicted = !actual && predictedDays.has(fullDate);
      const isFertile = fertileDays.has(fullDate);
      const isOvulation = fullDate === stats.estimatedOvulation;

      let cellStyle = 'bg-transparent text-gray-700 hover:bg-gray-50';
      let badgeHTML = '';

      if (actual) {
        if (actual.type === 'spotting') {
          cellStyle = 'bg-amber-100 text-amber-900 font-bold border border-amber-300';
          badgeHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 mx-auto mt-0.5 block"></span>`;
        } else {
          cellStyle = 'bg-rose-500 text-white font-bold shadow-xs';
          badgeHTML = `<span class="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-0.5 block"></span>`;
        }
      } else if (isPredicted) {
        cellStyle = 'border-2 border-dashed border-rose-400 text-rose-600 font-semibold bg-rose-50/40';
      } else if (isOvulation) {
        cellStyle = 'bg-teal-500 text-white font-bold shadow-xs';
        badgeHTML = `<span class="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-0.5 block"></span>`;
      } else if (isFertile) {
        cellStyle = 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/50';
      }

      if (isToday) {
        cellStyle += ' ring-2 ring-rose-400 ring-offset-1';
      }

      gridHTML += `
        <button data-date="${fullDate}" class="btn-tap aspect-square rounded-xl flex flex-col items-center justify-center transition-all active:scale-90 ${cellStyle}" aria-label="Tanggal ${day}">
          <span class="leading-none text-xs">${day}</span>
          ${badgeHTML}
        </button>
      `;
    }

    gridHTML += `</div>`;
    gridCard.innerHTML = gridHTML;
    container.appendChild(gridCard);

    // Quick Actions Bar
    const actionsBar = document.createElement('div');
    actionsBar.className = 'grid grid-cols-2 gap-2';
    actionsBar.innerHTML = `
      <button id="cal-quick-period" class="btn-tap bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs text-xs flex items-center justify-center space-x-1.5 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
        <span>+ Catat Haid</span>
      </button>
      <button id="cal-quick-symptom" class="btn-tap bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold py-2.5 px-3 rounded-xl shadow-xs text-xs flex items-center justify-center space-x-1.5 transition-all">
        <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Catat Gejala</span>
      </button>
    `;
    container.appendChild(actionsBar);

    // Explicit Text Legend
    const legendCard = document.createElement('div');
    legendCard.className = 'bg-white p-4 rounded-xl border border-gray-100 text-xs space-y-2 shadow-xs';
    legendCard.innerHTML = `
      <h3 class="font-bold text-gray-800 text-xs mb-2">Keterangan Kalender</h3>
      <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow-xs"></span>
          <span>Haid Terkonfirmasi</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block"></span>
          <span>Flek / Spotting</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded-md border-2 border-dashed border-rose-400 inline-block"></span>
          <span>Prediksi Haid (Estimasi)</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded-md bg-teal-100 border border-teal-300 inline-block"></span>
          <span>Masa Subur Edukatif</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded-full bg-teal-500 inline-block shadow-xs"></span>
          <span>Perkiraan Ovulasi</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="w-3.5 h-3.5 rounded-full ring-2 ring-rose-400 inline-block"></span>
          <span>Hari Ini</span>
        </div>
      </div>
      <p class="text-[10px] text-gray-400 pt-2 border-t border-gray-100 italic">
        * Ketuk tanggal mana saja untuk mencatat atau melihat rincian riwayat.
      </p>
    `;
    container.appendChild(legendCard);

    // Event listeners
    actionsBar.querySelector('#cal-quick-period').addEventListener('click', () => onOpenAddModal());
    actionsBar.querySelector('#cal-quick-symptom').addEventListener('click', () => {
      if (typeof onOpenSymptomModal === 'function') onOpenSymptomModal();
    });

    headerDiv.querySelector('#cal-prev').addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderView();
    });

    headerDiv.querySelector('#cal-next').addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderView();
    });

    headerDiv.querySelector('#cal-today').addEventListener('click', () => {
      currentYear = new Date().getFullYear();
      currentMonth = new Date().getMonth();
      renderView();
    });

    gridCard.querySelectorAll('button[data-date]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const clickedDate = btn.getAttribute('data-date');
        const existing = periodDays.get(clickedDate);
        if (existing) {
          onEditPeriod(existing.period);
        } else {
          onOpenAddModal(clickedDate);
        }
      });
    });
  }

  renderView();
  return container;
}

