/**
 * apiAdapter.js — Unified data adapter
 * Offline-first: Reads/writes to local store immediately, then synchronizes with backend if online.
 */

import { offlineStore } from '../storage/offlineStore.js';
import { CycleEngine } from '../domain/CycleEngine.js';

class ApiAdapter {
  constructor() {
    this.apiBase = './api/v1';
    this.guestId = this._initGuestId();
  }

  _initGuestId() {
    let gid = localStorage.getItem('haidku_guest_id');
    if (!gid) {
      gid = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
      localStorage.setItem('haidku_guest_id', gid);
    }
    return gid;
  }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Guest-Id': this.guestId,
      'X-User-Id': this.guestId,
    };
  }

  async getPeriods() {
    // 1. Ambil data lokal terlebih dahulu untuk instant mobile speed
    const localData = await offlineStore.getPeriods();

    // 2. Jika online, coba perbarui dari server
    if (navigator.onLine) {
      try {
        const res = await fetch(`${this.apiBase}/periods`, {
          headers: this._getHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data)) {
            // Jika server punya data, perbarui local store
            for (const item of json.data) {
              await offlineStore.savePeriod(item);
            }
            return await offlineStore.getPeriods();
          }
        }
      } catch (e) {
        // Mode offline fallback normal
      }
    }

    return localData;
  }

  async savePeriod(data) {
    // 1. Simpan di local store (IndexedDB)
    const savedLocal = await offlineStore.savePeriod(data);

    // 2. Sinkronkan ke server bila online
    if (navigator.onLine) {
      try {
        const res = await fetch(`${this.apiBase}/periods`, {
          method: 'POST',
          headers: this._getHeaders(),
          body: JSON.stringify(savedLocal),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success') {
            return json.data;
          }
        }
      } catch (e) {
        // Tetap sukses secara lokal, antre sinkronisasi
      }
    }

    return savedLocal;
  }

  async deletePeriod(id) {
    // 1. Hapus lokal
    await offlineStore.deletePeriod(id);

    // 2. Hapus di server bila online
    if (navigator.onLine) {
      try {
        await fetch(`${this.apiBase}/periods/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: this._getHeaders(),
        });
      } catch (e) {
        // offline
      }
    }

    return true;
  }

  async getCycleSummary() {
    const periods = await this.getPeriods();
    return CycleEngine.computeCycleStats(periods);
  }

  async getEducationalArticles() {
    // Fallback lokal jika offline
    const fallbackArticles = [
      {
        id: 'art-01',
        title: 'Mengenal Standard Days Method (SDM): Syarat & Batasannya',
        excerpt: 'Standard Days Method adalah metode kesadaran kesuburan berbasis kalender dengan aturan baku untuk siklus 26-32 hari.',
        body: 'Standard Days Method (SDM) dikembangkan oleh Georgetown University. Hanya cocok jika panjang siklus 26-32 hari konsisten. Pada hari 8 sampai 19, pengguna wajib menghindari hubungan tanpa perlindungan bila tidak ingin hamil. Angka kehamilan penggunaan biasa sekitar 13 per 100 wanita dalam setahun (CDC 2024).',
        reference_urls: ['https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html'],
      },
      {
        id: 'art-02',
        title: 'Mitos Flek dan Hari Pertama Menstruasi',
        excerpt: 'Flek sebelum menstruasi bukan Day 1. Hari ke-1 dihitung sejak darah merah mengalir nyata.',
        body: 'Hari ke-1 (Day 1) adalah saat darah menstruasi keluar secara nyata. Flek/spotting di tengah siklus tidak mereset hari siklus.',
        reference_urls: ['https://www.acog.org/womens-health/faqs/abnormal-uterine-bleeding'],
      },
      {
        id: 'art-03',
        title: 'Mengapa Tidak Ada Istilah "Hari Aman Mutlak" dalam Medis?',
        excerpt: 'Sperma dapat bertahan hingga 5 hari dan waktu ovulasi dapat bergeser sewaktu-waktu.',
        body: 'Tubuh wanita bukan mesin jam. Waktu ovulasi dapat maju atau mundur karena stres atau kesehatan. HaidKu menggunakan istilah peluang relatif lebih rendah namun tidak nol untuk melindungi keselamatan Anda.',
        reference_urls: ['https://www.cdc.gov/contraception/hcp/usmec/fertility-awareness-based-methods.html'],
      },
    ];

    if (navigator.onLine) {
      try {
        const res = await fetch(`${this.apiBase}/educational-articles`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      } catch (e) {
        // offline
      }
    }

    return fallbackArticles;
  }
}

export const apiAdapter = new ApiAdapter();
