/**
 * BottomNav.js — Mobile bottom navigation bar
 */

export function renderBottomNav(activeTab = 'dashboard', onTabChange) {
  const nav = document.createElement('nav');
  nav.className = 'fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 max-w-md mx-auto flex items-center justify-around py-2 px-1 shadow-lg';
  nav.setAttribute('aria-label', 'Navigasi Utama');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Beranda',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    },
    {
      id: 'history',
      label: 'Riwayat',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    },
    {
      id: 'stats',
      label: 'Statistik',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    },
    {
      id: 'education',
      label: 'Edukasi',
      icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
    },
  ];

  nav.innerHTML = tabs.map((tab) => {
    const isActive = tab.id === activeTab;
    const colorClass = isActive ? 'text-rose-500 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium';
    return `
      <button data-tab="${tab.id}" class="btn-tap flex flex-col items-center justify-center flex-1 py-1 transition-colors ${colorClass}" aria-selected="${isActive}">
        ${tab.icon}
        <span class="text-[11px] mt-0.5">${tab.label}</span>
      </button>
    `;
  }).join('');

  nav.querySelectorAll('button[data-tab]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      if (tabId && onTabChange) {
        onTabChange(tabId);
      }
    });
  });

  return nav;
}

