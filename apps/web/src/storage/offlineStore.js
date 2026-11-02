/**
 * offlineStore.js — IndexedDB local-first storage for HaidKu
 * Supports full guest mode offline functionality
 */

const DB_NAME = 'haidku_offline_db';
const DB_VERSION = 1;

class OfflineStore {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async initDB() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('[HaidKu] IndexedDB tidak didukung, menggunakan fallback storage');
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store: periods
        if (!db.objectStoreNames.contains('periods')) {
          const periodStore = db.createObjectStore('periods', { keyPath: 'id' });
          periodStore.createIndex('start_date', 'start_date', { unique: false });
        }

        // Store: settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Store: sync outbox
        if (!db.objectStoreNames.contains('sync_outbox')) {
          db.createObjectStore('sync_outbox', { keyPath: 'client_mutation_id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[HaidKu] Gagal membuka IndexedDB:', event.target.error);
        resolve(null);
      };
    });

    return this.initPromise;
  }

  async getPeriods() {
    const db = await this.initDB();
    if (!db) {
      return this._getLocal('periods') || [];
    }

    return new Promise((resolve) => {
      const tx = db.transaction('periods', 'readonly');
      const store = tx.objectStore('periods');
      const req = store.getAll();

      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a, b) => b.start_date.localeCompare(a.start_date));
        resolve(list);
      };

      req.onerror = () => {
        resolve([]);
      };
    });
  }

  async getPeriod(id) {
    const periods = await this.getPeriods();
    return periods.find((p) => p.id === id) || null;
  }

  async savePeriod(periodData) {
    const db = await this.initDB();
    const id = periodData.id || ('local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
    const now = new Date().toISOString();

    const record = {
      id,
      start_date: periodData.start_date,
      end_date: periodData.end_date || null,
      bleeding_type: periodData.bleeding_type || 'period',
      flow_level: periodData.flow_level || 'medium',
      status: periodData.status || 'confirmed',
      note: periodData.note || '',
      record_version: (periodData.record_version || 0) + 1,
      client_mutation_id: periodData.client_mutation_id || ('mut_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
      updated_at: now,
      created_at: periodData.created_at || now,
    };

    if (!db) {
      const list = this._getLocal('periods') || [];
      const idx = list.findIndex((p) => p.id === id);
      if (idx >= 0) list[idx] = record;
      else list.push(record);
      this._setLocal('periods', list);
      return record;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction('periods', 'readwrite');
      const store = tx.objectStore('periods');
      const req = store.put(record);

      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  }

  async deletePeriod(id) {
    const db = await this.initDB();
    if (!db) {
      const list = (this._getLocal('periods') || []).filter((p) => p.id !== id);
      this._setLocal('periods', list);
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction('periods', 'readwrite');
      const store = tx.objectStore('periods');
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async getSettings() {
    const db = await this.initDB();
    const defaults = {
      goal: 'track', // 'track' | 'conceive' | 'avoid'
      onboardingCompleted: false,
      sdmConsent: false,
      notificationEnabled: false,
      notificationPrivacyMode: 'private',
    };

    if (!db) {
      return { ...defaults, ...(this._getLocal('settings') || {}) };
    }

    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('app_settings');

      req.onsuccess = () => {
        resolve(req.result ? { ...defaults, ...req.result.value } : defaults);
      };
      req.onerror = () => resolve(defaults);
    });
  }

  async saveSettings(settingsObj) {
    const db = await this.initDB();
    const current = await this.getSettings();
    const updated = { ...current, ...settingsObj };

    if (!db) {
      this._setLocal('settings', updated);
      return updated;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key: 'app_settings', value: updated });

      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  async exportAll() {
    const periods = await this.getPeriods();
    const settings = await this.getSettings();

    return {
      app: 'HaidKu',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      settings,
      periods,
    };
  }

  async clearAll() {
    const db = await this.initDB();
    if (!db) {
      localStorage.removeItem('haidku_periods');
      localStorage.removeItem('haidku_settings');
      return true;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['periods', 'settings'], 'readwrite');
      tx.objectStore('periods').clear();
      tx.objectStore('settings').clear();

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  _getLocal(key) {
    try {
      const val = localStorage.getItem('haidku_' + key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  }

  _setLocal(key, val) {
    try {
      localStorage.setItem('haidku_' + key, JSON.stringify(val));
    } catch (e) {
      // ignore
    }
  }
}

export const offlineStore = new OfflineStore();
