/**
 * notificationAdapter.js — Privacy-safe notification manager with in-app inbox fallback
 * Conforms to T20, T28, T29: zero health data in lock screen, graceful denial handling.
 */

class NotificationAdapter {
  constructor() {
    this.storageKey = 'haidku_inbox_notifications';
  }

  isSupported() {
    return 'Notification' in window;
  }

  getPermission() {
    return this.isSupported() ? Notification.permission : 'denied';
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (e) {
      return 'denied';
    }
  }

  /**
   * T20 & T29: Mengirim notifikasi privasi aman
   * Default teks lock screen sama sekali TIDAK memuat tanggal haid, masa subur, atau istilah reproduksi.
   */
  async notify({ title = 'Pengingat HaidKu', body = 'Buka aplikasi untuk melihat catatan harian Anda.', internalDetail = '', type = 'reminder' }) {
    // 1. Simpan selalu ke In-App Inbox (T28: fallback yang selalu dapat diakses)
    this.saveToInbox({
      id: 'notif_' + Date.now(),
      title,
      body: internalDetail || body, // detail hanya bisa dibaca setelah aplikasi dibuka
      type,
      created_at: new Date().toISOString(),
      read: false,
    });

    // 2. Jika izin native/browser diberikan, tampilkan notifikasi publik yang netral
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const safeTitle = 'Pengingat HaidKu';
        const safeBody = 'Buka aplikasi untuk melihat catatan harian Anda.';

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: safeTitle,
            body: safeBody,
          });
        } else {
          new Notification(safeTitle, {
            body: safeBody,
            icon: './favicon.svg',
            badge: './favicon.svg',
            tag: 'haidku-reminder',
          });
        }
      } catch (e) {
        console.warn('[HaidKu] Gagal menampilkan notifikasi sistem:', e);
      }
    }
  }

  /**
   * In-App Inbox Storage (T28)
   */
  getInbox() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveToInbox(notifItem) {
    const list = this.getInbox();
    list.unshift(notifItem);
    // Batasi 20 notifikasi terakhir
    const trimmed = list.slice(0, 20);
    localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
    return trimmed;
  }

  markAllAsRead() {
    const list = this.getInbox().map((n) => ({ ...n, read: true }));
    localStorage.setItem(this.storageKey, JSON.stringify(list));
    return list;
  }

  getUnreadCount() {
    return this.getInbox().filter((n) => !n.read).length;
  }

  /**
   * Mengevaluasi pengingat siklus otomatis
   */
  evaluateReminders(stats, settings = {}) {
    if (!stats || !stats.latestPeriod) return;

    const currentDay = stats.currentCycleDay;
    const median = stats.medianCycleLength || 28;

    // 1. Pengingat haid mendekat (2 hari sebelum perkiraan)
    if (currentDay === median - 2) {
      this.notify({
        title: 'Pengingat HaidKu',
        body: 'Buka aplikasi untuk melihat catatan harian Anda.',
        internalDetail: 'Perkiraan menstruasi Anda diprediksi sekitar 2 hari lagi.',
        type: 'period_approaching',
      });
    }

    // 2. Pengingat SDM hari ke-8 (jika mode avoid aktif)
    if (settings.goal === 'avoid' && currentDay === 8) {
      this.notify({
        title: 'Pengingat HaidKu',
        body: 'Buka aplikasi untuk melihat catatan harian Anda.',
        internalDetail: 'Hari ke-8 siklus: Menurut Standard Days Method, ini awal periode potensi subur.',
        type: 'sdm_precaution',
      });
    }
  }
}

export const notificationAdapter = new NotificationAdapter();
