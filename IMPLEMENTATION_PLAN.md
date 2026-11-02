# IMPLEMENTATION PLAN — HAIDKU
**Aplikasi Pelacak Menstruasi PWA + Hybrid (Android/iOS)**  
**Tagline:** *Kenali Siklusmu, Pahami Tubuhmu*  
**Versi:** 1.0.0 | **Tanggal:** 3 November 2026  
**Status:** In Progress (Eksekusi Aktif Sprint 0 & 1)

---

## 1. Ringkasan Proyek & Arsitektur
- **Frontend:** Single-page application menggunakan JavaScript ES Modules, Vite, Tailwind CSS, didukung Service Worker (PWA installable & offline-first), IndexedDB lokal store, dan Capacitor hybrid adapter.
- **Backend API:** PHP 8.3 Native REST API (`/api/v1`) dengan PDO MySQL 8, prepared statements, domain validation, idempotency via ULID/UUID mutation ID, dan perlindungan privasi data kesehatan (UU No. 27/2022 PDP).
- **Deployment URL:** `/` tanpa kewajiban `/public` pada URL. File statis hasil build frontend (`apps/web/dist`) dapat diakses langsung pada root dan siap disinkronkan ke `webDir` Capacitor.
- **Guardrail Medis & Etika:**
  - Tidak ada klaim "hari aman", "bebas risiko", "100% tidak subur", atau angka peluang hamil harian tanpa validasi klinis.
  - Pemisahan ketat antara `FertilityEducationEstimator` (perkiraan ovulasi edukatif) dan `SDMStatusService` (Standard Days Method berdasar protokol WHO/CDC dengan status konservatif `UNKNOWN`, `HIGHER_FERTILITY_PRECAUTION`, `LOWER_CHANCE_NOT_ZERO`).
  - Guest-first: pencatatan lokal berfungsi penuh tanpa mewajibkan akun atau login server.

---

## 2. Roadmap Sprint & Rincian Tugas

### Sprint 0 — Foundation & Setup Arsitektur (SELESAI / AKTIF)
- [x] Audit workspace, inisialisasi Git checkpoint aman.
- [x] Susun `IMPLEMENTATION_PLAN.md`.
- [x] Scaffold direktori monorepo clean: `apps/web`, `apps/api`, `database/migrations`, `database/seeds`.
- [x] Skema basis data MySQL 8 (`database/migrations/001_create_haidku_tables.sql` & runner migration PHP).
- [x] Setup PHP 8.3 Native REST API router, environment handler (`.env`, `.env.example`), DB connection pool PDO, middleware (CORS, ErrorHandler, Auth/Session).
- [x] Setup Vite + Tailwind CSS + PWA Manifest + Service Worker di `apps/web`.
- [x] Konfigurasi webroot routing tanpa `/public` di URL.
- [x] Automated unit test suite untuk backend PHP (Date Diff, Period Duration, Constraints, Idempotency).

### Sprint 1 — Period Tracker, Kalender & UI Mobile-First (SELESAI / AKTIF)
- [x] Onboarding modal/flow untuk guest (pilihan tujuan: pantau_haid, merencanakan_kehamilan, menghindari_kehamilan).
- [x] Komponen Mobile Dashboard Premium:
  - Header sticky bermerek "HaidKu".
  - Status hari ke-N siklus saat ini.
  - Ringkasan prediksi haid berikutnya (dengan disclaimer perkiraan).
  - Quick action CTA "Catat Haid".
  - Bottom navigation bar (Beranda, Kalender, Riwayat, Statistik, Edukasi).
- [x] Kalender Bulanan Interaktif:
  - Navigasi bulan & tombol "Hari Ini".
  - Grid tanggal lokal (WIB/WITA/WIT aman tanpa offset UTC).
  - Penanda visual: Hari Haid terkonfirmasi, Flek/Spotting, Prediksi Haid, Estimasi Masa Subur Edukatif.
  - Legenda status eksplisit berbasis teks (aksesibilitas ramah buta warna).
  - Klik tanggal untuk melihat rincian atau mencatat langsung.
- [x] Form Catat & Edit Haid:
  - Tanggal mulai haid.
  - Tanggal selesai haid (opsional / checkbox "Masih berlangsung").
  - Kategori perdarahan: Menstruasi vs Flek/Spotting (dengan edukasi flek tidak me-reset hari ke-1).
  - Skala aliran darah (Ringan, Sedang, Deras) & catatan gejala opsional.
  - Validasi ketat (tanggal akhir >= tanggal mulai, deteksi bentrok).
  - CRUD lengkap: Tambah, Ubah, Hapus dengan konfirmasi modal.
- [x] Modul Statistik Siklus:
  - Panjang siklus terakhir, median panjang siklus, variasi durasi, durasi haid (inklusif).
  - Penjelasan kecukupan data (minimal 3 siklus lengkap untuk keteraturan).
- [x] Penyimpanan Lokal IndexedDB (`storage/offlineStore.js`) dengan adapter fallback.
- [x] REST API Period CRUD di `apps/api/src/Controllers/PeriodController.php`.
- [x] Verifikasi build frontend, tes API, uji tanggal kabisat & selisih kalender.

### Sprint 2 — Perhitungan Siklus & Subur Edukatif (SELESAI)
- [x] Domain engine `CycleCalculator.js` dan `CycleCalculatorService.php` (pure functions + fixture test).
- [x] Perkiraan ovulasi (14 hari sebelum prediksi haid) & jendela subur edukatif (-5 s.d. +1).
- [x] Tampilan rentang ketidakpastian dan peringatan bahwa prediksi bukan diagnosis ovulasi.
- [x] Sinkronisasi fixture tests antara backend PHP dan frontend JS (100% parity).
- [x] Endpoint `GET /api/v1/fertility/estimate`.
- [x] Pengujian tahun kabisat (T17), zona waktu WIB/WITA (T16), dan perubahan riwayat masa lalu (T14).

### Sprint 3 — Standard Days Method (SDM) (SELESAI)
- [x] Consent flow & informed acknowledgment untuk pengguna dengan tujuan menghindari kehamilan (`SDMConsentModal.js` & `POST /api/v1/acknowledgements`).
- [x] Validasi kelayakan konservatif (`SDMService.php` & `SDMEngine.js`): siklus 26–32 hari, minimal 3 riwayat valid (T10), <2 anomali dalam 365 hari (T09), tanpa kontraindikasi/risk override (T13, T18).
- [x] State machine: `HIGHER_FERTILITY_PRECAUTION` (hari 8–19), `LOWER_CHANCE_NOT_ZERO` (hari 1–7 & 20–32), `UNKNOWN` (tidak eligible/data kurang/hari >32).
- [x] Endpoint `GET /api/v1/fertility/sdm-status`.
- [x] Audit teks medis: eliminasi semua janji 100%/0%/pasti aman. Skenario test T01–T23 lulus 100%.

### Sprint 4 — PWA Offline, Sync Idempotent & Privasi
- [ ] Service worker caching offline app shell (tanpa membocorkan respon API sensitif).
- [ ] Offline mutation queue dengan `client_mutation_id` dan `record_version`.
- [ ] Opt-in sync antar perangkat via Email OTP.
- [ ] Ekspor data (JSON/CSV) dan penghapusan data permanen (right to erasure).
- [ ] In-app notification fallback dan Web Push aman (tanpa label sensitif di lock screen).

### Sprint 5 & 6 — Hybrid Android & iOS (Capacitor)
- [ ] Konfigurasi Capacitor dengan `webDir: apps/web/dist`.
- [ ] Pengujian mobile responsiveness, safe area, status bar, offline airplane mode.
- [ ] Penyiapan struktur Android & dokumentasi iOS Xcode.

---

## 3. Matriks Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Salah kaprah "hari aman" oleh pengguna | Kehamilan yang tidak direncanakan | Peringatan produk permanen; tidak ada istilah "hari aman"; penolakan status bila data kurang. |
| Timezone shifting menyebabkan tanggal haid bergeser 1 hari | Inkonsistensi data siklus | Simpan tanggal siklus murni `YYYY-MM-DD` (tanpa konversi UTC); hitung perbedaan hari secara lokal. |
| Pengguna offline kehilangan data saat clear browser cache | Kehilangan histori medis | Edukasi transparan di onboarding mode tamu; fitur ekspor cadangan lokal JSON. |
| API data leak / IDOR | Pelanggaran UU PDP | Ownership validation ketat pada setiap query `WHERE user_id = :user_id`. |

---

## 4. Definisi Selesai (DoD) Tiap Tahap
1. Kode dapat dijalankan secara nyata di lingkungan lokal tanpa error fatal.
2. Migrasi basis data teruji eksekusinya (dapat di-migrate dan di-rollback).
3. Unit test & integration test dieksekusi dengan hasil 100% lulus.
4. UI responsif pada viewport mobile (320px–430px) dan desktop, dengan target sentuh >= 44px.
5. Catatan riwayat dan laporan diverifikasi secara jujur.

