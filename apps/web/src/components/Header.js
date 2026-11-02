/**
 * Header.js — Mobile sticky header for HaidKu
 */

export function renderHeader(onOpenAddModal) {
  const header = document.createElement('header');
  header.className = 'sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-rose-100 px-4 py-3 flex items-center justify-between shadow-xs';

  header.innerHTML = `
    <div class="flex items-center space-x-2">
      <div class="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200">
        <svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div>
        <h1 class="text-lg font-bold text-gray-900 tracking-tight leading-tight">HaidKu</h1>
        <p class="text-[10px] text-gray-500 leading-none">Kenali Siklusmu, Pahami Tubuhmu</p>
      </div>
    </div>

    <div class="flex items-center space-x-2">
      <button id="btn-quick-add" class="btn-tap px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full shadow-xs flex items-center space-x-1 transition-all active:scale-95" aria-label="Catat haid baru">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
        </svg>
        <span>Catat</span>
      </button>
    </div>
  `;

  header.querySelector('#btn-quick-add').addEventListener('click', onOpenAddModal);
  return header;
}
