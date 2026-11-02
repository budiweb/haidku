/**
 * syncEngine.js — Offline mutation queue & idempotent bidirectional sync
 */

import { offlineStore } from './offlineStore.js';

class SyncEngine {
  constructor() {
    this.apiBase = './api/v1';
    this.isSyncing = false;
    this.initNetworkListener();
  }

  initNetworkListener() {
    window.addEventListener('online', () => {
      console.log('[HaidKu] Koneksi pulih, memproses antrean sinkronisasi offline...');
      this.flushQueue();
    });
  }

  generateUuid() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'mut_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Menambahkan mutasi ke antrean offline IndexedDB
   */
  async enqueueMutation(entityType, action, payload) {
    const db = await offlineStore.initDB();
    const mutationId = payload.client_mutation_id || this.generateUuid();

    const mutation = {
      client_mutation_id: mutationId,
      entity_type: entityType,
      action: action,
      payload: { ...payload, client_mutation_id: mutationId },
      created_at: new Date().toISOString(),
      retry_count: 0,
    };

    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('sync_outbox', 'readwrite');
        const store = tx.objectStore('sync_outbox');
        const req = store.put(mutation);
        req.onsuccess = () => resolve(mutation);
        req.onerror = () => reject(req.error);
      });
    }

    // Jika online, coba kirim segera
    if (navigator.onLine) {
      this.flushQueue();
    }

    return mutation;
  }

  /**
   * Mengirim seluruh mutasi yang ada di outbox ke server
   */
  async flushQueue() {
    if (this.isSyncing || !navigator.onLine) return;

    const db = await offlineStore.initDB();
    if (!db) return;

    this.isSyncing = true;

    try {
      // 1. Ambil seluruh outbox
      const mutations = await new Promise((resolve) => {
        const tx = db.transaction('sync_outbox', 'readonly');
        const store = tx.objectStore('sync_outbox');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (mutations.length === 0) {
        this.isSyncing = false;
        return;
      }

      const guestId = localStorage.getItem('haidku_guest_id') || 'guest_default';

      // 2. Kirim batch ke POST /api/v1/sync/push
      const res = await fetch(`${this.apiBase}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Id': guestId,
          'X-User-Id': guestId,
        },
        body: JSON.stringify({ mutations }),
      });

      if (res.ok) {
        const result = await res.json();
        const data = result.data || {};
        const applied = data.applied || [];
        const duplicates = data.duplicates || [];

        // Hapus mutasi yang sudah diterapkan atau sudah ada di server
        const appliedIds = new Set([
          ...applied.map((a) => a.client_mutation_id),
          ...duplicates.map((d) => d.client_mutation_id),
        ]);

        const tx = db.transaction('sync_outbox', 'readwrite');
        const store = tx.objectStore('sync_outbox');
        for (const id of appliedIds) {
          store.delete(id);
        }

        console.log(`[HaidKu Sync] ${applied.length} mutasi berhasil diterapkan, ${duplicates.length} duplikat diabaikan.`);

        // Simpan cursor sinkronisasi
        if (data.new_cursor) {
          localStorage.setItem('haidku_sync_cursor', data.new_cursor);
        }
      }
    } catch (e) {
      console.warn('[HaidKu Sync] Gagal menyinkronkan outbox:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Menarik perubahan baru dari server
   */
  async pullChanges() {
    if (!navigator.onLine) return;

    const cursor = localStorage.getItem('haidku_sync_cursor');
    const guestId = localStorage.getItem('haidku_guest_id') || 'guest_default';

    try {
      const url = cursor
        ? `${this.apiBase}/sync/pull?since=${encodeURIComponent(cursor)}`
        : `${this.apiBase}/sync/pull`;

      const res = await fetch(url, {
        headers: {
          'X-Guest-Id': guestId,
          'X-User-Id': guestId,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const periods = json.data?.periods || [];
        for (const p of periods) {
          if (p.deleted_at) {
            await offlineStore.deletePeriod(p.id);
          } else {
            await offlineStore.savePeriod(p);
          }
        }
        if (json.data?.new_cursor) {
          localStorage.setItem('haidku_sync_cursor', json.data.new_cursor);
        }
      }
    } catch (e) {
      // offline fallback
    }
  }
}

export const syncEngine = new SyncEngine();

