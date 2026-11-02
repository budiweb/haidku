/**
 * InboxModal.js — In-App Notification Center
 */

import { notificationAdapter } from '../adapters/notificationAdapter.js';

export function openInboxModal({ onClosed }) {
  const modalRoot = document.getElementById('modal-root');
  const modalContainer = document.createElement('div');
  modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 modal-overlay';

  const inbox = notificationAdapter.getInbox();
  notificationAdapter.markAllAsRead();

  modalContainer.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-2xl max-h-[85vh] flex flex-col shadow-2xl modal-content overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/40">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <h2 class="text-base font-bold text-gray-900">Kotak Masuk Pengingat</h2>
        </div>
        <button id="btn-close-inbox" class="btn-tap w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- List -->
      <div class="p-4 overflow-y-auto space-y-2.5 text-xs flex-1">
        ${inbox.length > 0 ? inbox.map((item) => {
          const timeStr = new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
          return `
            <div class="p-3 bg-white rounded-xl border border-gray-100 shadow-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-gray-900 text-xs">${item.title}</span>
                <span class="text-[10px] text-gray-400">${timeStr}</span>
              </div>
              <p class="text-gray-600 leading-relaxed">${item.body}</p>
            </div>
          `;
        }).join('') : `
          <div class="text-center py-10 text-gray-400 space-y-2">
            <svg class="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
            <p>Belum ada pengingat baru.</p>
          </div>
        `}
      </div>

      <div class="p-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 text-center">
        Semua pengingat disajikan secara privat di dalam aplikasi.
      </div>
    </div>
  `;

  modalRoot.appendChild(modalContainer);

  const close = () => {
    modalContainer.remove();
    if (onClosed) onClosed();
  };

  modalContainer.querySelector('#btn-close-inbox').addEventListener('click', close);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) close();
  });
}

