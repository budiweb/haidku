/**
 * main.js — Main application bootstrap for HaidKu
 * PWA + Hybrid Android/iOS Single Codebase
 */

import { offlineStore } from './storage/offlineStore.js';
import { apiAdapter } from './adapters/apiAdapter.js';
import { CycleEngine } from './domain/CycleEngine.js';
import { renderHeader } from './components/Header.js';
import { renderBottomNav } from './components/BottomNav.js';
import { openPeriodModal } from './components/PeriodModal.js';
import { openOnboardingModal } from './components/OnboardingModal.js';
import { openSDMConsentModal } from './components/SDMConsentModal.js';
import { renderDashboardPage } from './pages/DashboardPage.js';
import { renderCalendarPage } from './pages/CalendarPage.js';
import { renderHistoryPage } from './pages/HistoryPage.js';
import { renderStatsPage } from './pages/StatsPage.js';
import { renderEducationPage } from './pages/EducationPage.js';

class HaidKuApp {
  constructor() {
    this.appRoot = document.getElementById('app');
    this.activeTab = 'dashboard';
    this.periods = [];
    this.stats = {};
    this.settings = {};
  }

  async init() {
    // 1. Inisialisasi offline store
    await offlineStore.initDB();
    this.settings = await offlineStore.getSettings();

    // 2. Muat data periode & hitung statistik
    await this.loadData();

    // 3. Register Service Worker untuk PWA
    this.registerServiceWorker();

    // 4. Render tampilan
    this.render();

    // 5. Cek onboarding untuk pengguna baru
    if (!this.settings.onboardingCompleted) {
      openOnboardingModal({
        onComplete: async (result) => {
          await offlineStore.saveSettings(result);
          this.settings = await offlineStore.getSettings();

          // Jika pengguna memasukkan tanggal haid terakhir pada onboarding
          if (result.lastPeriodDate) {
            await this.handleSavePeriod({
              start_date: result.lastPeriodDate,
              bleeding_type: 'period',
              flow_level: 'medium',
              status: 'confirmed',
            });
          }

          this.showToast('Selamat datang di HaidKu!');
          this.render();
        },
      });
    }
  }

  async loadData() {
    this.periods = await apiAdapter.getPeriods();
    this.stats = CycleEngine.computeCycleStats(this.periods);
  }

  showToast(message, type = 'success') {
    const toastRoot = document.getElementById('toast-root');
    const toast = document.createElement('div');
    const colorClass = type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white';

    toast.className = `px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center space-x-1.5 ${colorClass} mb-2 transition-all transform duration-300`;
    toast.innerHTML = `
      <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span>${message}</span>
    `;

    toastRoot.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  async handleSavePeriod(periodData) {
    await apiAdapter.savePeriod(periodData);
    await this.loadData();
    this.showToast('Catatan berhasil disimpan');
    this.render();
  }

  async handleDeletePeriod(id) {
    await apiAdapter.deletePeriod(id);
    await this.loadData();
    this.showToast('Catatan berhasil dihapus');
    this.render();
  }

  openAddModal(defaultDate = null) {
    openPeriodModal({
      defaultDate,
      onSave: (data) => this.handleSavePeriod(data),
      onDelete: (id) => this.handleDeletePeriod(id),
    });
  }

  openEditModal(period) {
    openPeriodModal({
      period,
      onSave: (data) => this.handleSavePeriod(data),
      onDelete: (id) => this.handleDeletePeriod(id),
    });
  }

  render() {
    this.appRoot.innerHTML = '';

    // 1. Header Sticky
    const header = renderHeader(() => this.openAddModal());
    this.appRoot.appendChild(header);

    // 2. Main Page Container
    const pageWrapper = document.createElement('main');
    pageWrapper.className = 'flex-1';

    switch (this.activeTab) {
      case 'dashboard':
        pageWrapper.appendChild(
          renderDashboardPage({
            stats: this.stats,
            periods: this.periods,
            settings: this.settings,
            onOpenAddModal: () => this.openAddModal(),
            onOpenSDMConsent: () => {
              openSDMConsentModal({
                onConsentGiven: async () => {
                  await offlineStore.saveSettings({
                    goal: 'avoid',
                    sdmConsent: true,
                    sdm_consent_at: new Date().toISOString(),
                  });
                  this.settings = await offlineStore.getSettings();

                  // Coba kirim acknowledgement ke API jika online
                  if (navigator.onLine) {
                    try {
                      await fetch('./api/v1/acknowledgements', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'X-Guest-Id': localStorage.getItem('haidku_guest_id') || 'guest_default',
                        },
                        body: JSON.stringify({
                          type: 'sdm_risk_acknowledgement',
                          version: '1.0',
                        }),
                      });
                    } catch (e) {}
                  }

                  this.showToast('Mode Standard Days Method aktif');
                  this.render();
                },
              });
            },
            onNavigate: (tab) => {
              this.activeTab = tab;
              this.render();
            },
          })
        );
        break;

      case 'calendar':
        pageWrapper.appendChild(
          renderCalendarPage({
            periods: this.periods,
            stats: this.stats,
            onOpenAddModal: (date) => this.openAddModal(date),
            onEditPeriod: (p) => this.openEditModal(p),
          })
        );
        break;

      case 'history':
        pageWrapper.appendChild(
          renderHistoryPage({
            periods: this.periods,
            onOpenAddModal: () => this.openAddModal(),
            onEditPeriod: (p) => this.openEditModal(p),
            onDeletePeriod: (id) => this.handleDeletePeriod(id),
          })
        );
        break;

      case 'stats':
        pageWrapper.appendChild(
          renderStatsPage({
            stats: this.stats,
            periods: this.periods,
          })
        );
        break;

      case 'education':
        pageWrapper.appendChild(
          renderEducationPage({
            onResetApp: async () => {
              await this.loadData();
              this.settings = await offlineStore.getSettings();
              this.activeTab = 'dashboard';
              this.render();
            },
          })
        );
        break;

      default:
        pageWrapper.textContent = 'Halaman tidak ditemukan';
    }

    this.appRoot.appendChild(pageWrapper);

    // 3. Bottom Navigation
    const bottomNav = renderBottomNav(this.activeTab, (newTab) => {
      this.activeTab = newTab;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    this.appRoot.appendChild(bottomNav);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          console.log('[HaidKu] ServiceWorker terdaftar:', reg.scope);
        }).catch((err) => {
          console.warn('[HaidKu] ServiceWorker gagal didaftarkan:', err);
        });
      });
    }
  }
}

// Bootstrap saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  const app = new HaidKuApp();
  app.init();
});

