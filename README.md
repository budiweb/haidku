# HaidKu — Kenali Siklusmu, Pahami Tubuhmu

> **Aplikasi Menstruasi PWA + Hybrid (Android/iOS)**  
> Dibangun dengan standar keselamatan klinis, privasi tinggi (UU No. 27/2022 PDP), dan arsitektur satu codebase frontend (Vite + Tailwind CSS + IndexedDB) dengan backend PHP 8.3 Native REST API + MySQL 8.

---

## ⚠️ Batasan & Peringatan Medis Wajib
- **HaidKu tidak pernah menyatakan adanya "hari aman", "100% bebas risiko", atau "mustahil hamil".**
- Prediksi kalender dan estimasi masa subur adalah perkiraan edukatif, **bukan** konfirmasi ovulasi.
- Mode Standard Days Method (SDM) dipisahkan dari estimasi ovulasi dan memiliki syarat kelayakan konservatif (siklus 26–32 hari, minimal 3 siklus lengkap tercatat).
- Aplikasi ini belum divalidasi sebagai alat kontrasepsi resmi dan tidak menggantikan konseling tenaga medis.

---

## 🛠️ Stack Teknologi
- **Frontend:** Single Page Application (SPA), JavaScript ES Modules, Vite 6, Tailwind CSS 3, PWA (Service Worker + Manifest), IndexedDB local store.
- **Backend API:** PHP 8.3 Native (tanpa framework, tanpa Laravel), PDO Prepared Statements, MySQL 8, URL `/` tanpa kewajiban `/public`.
- **Hybrid Native:** Siap diintegrasikan ke Capacitor (`webDir: apps/web/dist`).
- **Keamanan & Privasi:** Guest-first (bekerja 100% offline tanpa login), enkripsi data sensitif lokal, kepemilikan data terisolasi, ekspor data (JSON) & penghapusan permanen.

---

## 🚀 Panduan Menjalankan di Lokal

### 1. Prasyarat
- PHP 8.3+ (aktif di CLI atau via XAMPP)
- MySQL 8+ (aktif di port 3306)
- Node.js 20+ & npm

### 2. Konfigurasi Database & Environment
Salin file konfigurasi lingkungan:
```bash
cp .env.example .env
```
Sesuaikan kredensial basis data pada `.env` bila diperlukan:
```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=haidku
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan migrasi basis data dan seeder artikel edukasi:
```bash
php database/migrate.php --seed
```

### 3. Build & Jalankan Frontend
Masuk ke folder `apps/web`:
```bash
cd apps/web
npm install
npm run build
```
Hasil build akan berada di `apps/web/dist`.

### 4. Menjalankan Aplikasi
Aplikasi dapat dijalankan melalui dua cara:

#### Opsi A: Menggunakan XAMPP Apache Langsung
Letakkan folder ini di `c:/xampp/htdocs/haidku`.  
Buka browser pada:
- **Aplikasi Web / PWA:** `http://localhost/haidku/`
- **Health Check API:** `http://localhost/haidku/api/v1/health`

#### Opsi B: Menggunakan PHP Built-in Server
Dari root folder proyek (`c:/xampp/htdocs/haidku`):
```bash
php -S 127.0.0.1:8000 index.php
```
Buka browser pada `http://127.0.0.1:8000/`.

---

## 🧪 Menjalankan Pengujian Otomatis

### 1. Test Suite Backend PHP (Unit, Date Math, Repository, Ownership, SDM, Sync, Symptoms)
Menguji selisih kalender (T01), durasi menstruasi inklusif (T02), tahun kabisat (T17), isolasi data pengguna (T19), idempotency (T27), filtering flek/spotting (T11), aturan klinis Standard Days Method T03-T13, T18, audit copy medis (T23), sinkronisasi mutasi T21, T26, serta CRUD dan isolasi gejala harian:
```bash
php apps/api/tests/run_tests.php
```
*Hasil: 62 tests passed, 0 failed (100% success).*

### 2. Test Suite Frontend JavaScript (Domain Parity, SDM, Privacy Lock Screen, Platform)
Menguji CycleEngine, SDMEngine, audit teks medis, privasi notifikasi pada lock screen (T20, T28, T29), zona waktu (T33), stale method fallback (T35), dan audit aset statis native (T36):
```bash
node apps/web/tests/cycleEngine.test.js
```
*Hasil: 34 tests passed, 0 failed (100% success).*

*(Total: 96 automated tests passed, 100% lulus).*

---

## 📱 Hybrid Android & iOS (Capacitor)
HaidKu menggunakan satu codebase frontend di `apps/web` yang dibundel langsung ke target native Android dan iOS:

### Android:
- Proyek native terletak di `apps/web/android/`.
- Izin yang dikonfigurasi: `INTERNET`, `ACCESS_NETWORK_STATE`, dan `POST_NOTIFICATIONS`.
- Konfigurasi `network_security_config.xml` untuk keamanan HTTPS di produksi serta akses emulator dev lokal.
- Sinkronisasi aset web:
  ```bash
  cd apps/web
  npm run build
  npx cap sync android
  ```

### iOS (Xcode):
- Proyek Xcode terletak di `apps/web/ios/App/App.xcworkspace`.
- Sesuai spesifikasi `TEST_CASES_HAIDKU.md`, kompilasi native iOS berstatus *NOT TESTED (Windows environment)* dan memerlukan macOS + Xcode 15+.
- Panduan lengkap kompilasi di macOS tersedia di [`docs/HYBRID_IOS_SETUP.md`](docs/HYBRID_IOS_SETUP.md).

---

## 📂 Struktur Direktori
```text
haidku/
├── AGENTS.md                  # Aturan wajib Antigravity IDE
├── IMPLEMENTATION_PLAN.md     # Rencana implementasi & status sprint
├── PROJECT.md                 # Deskripsi produk & batasan
├── README.md                  # Dokumentasi teknis & panduan lokal
├── index.php                  # Entrypoint root (tanpa /public di URL)
├── .htaccess                  # Apache URL rewrite rules
├── .env.example               # Contoh konfigurasi environment
├── apps/
│   ├── api/                   # PHP 8.3 Native REST API
│   │   ├── bootstrap/         # Dependency wiring & router mapping
│   │   ├── src/
│   │   │   ├── Config/        # Database PDO connection
│   │   │   ├── Controllers/   # Period, User, Article controllers
│   │   │   ├── Middleware/    # CORS & Guest/Auth middleware
│   │   │   ├── Repositories/  # Period & User data access
│   │   │   ├── Services/      # CycleCalculatorService (domain logic)
│   │   │   └── Router.php     # REST API router
│   │   └── tests/             # Automated test suite (PHP)
│   └── web/                   # Frontend Vite + Tailwind + PWA
│       ├── public/            # Manifest, service worker, favicon
│       ├── src/
│       │   ├── adapters/      # API & offline adapter
│       │   ├── components/    # Header, BottomNav, PeriodModal, OnboardingModal
│       │   ├── domain/        # CycleEngine.js (pure functions)
│       │   ├── pages/         # Dashboard, Calendar, History, Stats, Education
│       │   ├── storage/       # IndexedDB offlineStore.js
│       │   ├── main.js        # App bootstrap
│       │   └── style.css      # Tailwind directives & transitions
│       ├── tests/             # Domain tests (JS)
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       └── tailwind.config.js
└── database/
    ├── migrations/            # SQL migrations
    ├── seeds/                 # Educational articles & demo data
    └── migrate.php            # Migration runner
```

---

## 📑 Dokumentasi Endpoint REST API (`/api/v1`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/v1/health` | Status API, versi & timestamp |
| `GET` | `/api/v1/periods` | Daftar catatan haid pengguna aktif (filter `from` & `to`) |
| `POST` | `/api/v1/periods` | Tambah catatan haid baru (idempotent via `client_mutation_id`) |
| `GET` | `/api/v1/periods/{id}` | Rincian catatan haid berdasarkan ID |
| `PATCH` | `/api/v1/periods/{id}` | Perbarui catatan haid |
| `DELETE` | `/api/v1/periods/{id}` | Hapus catatan haid (soft-delete) |
| `GET` | `/api/v1/symptoms` | Riwayat gejala harian pengguna (filter `from` & `to`) |
| `POST` | `/api/v1/symptoms` | Simpan / perbarui catatan gejala harian & mood |
| `GET` | `/api/v1/symptoms/{date}` | Rincian catatan gejala harian pada tanggal spesifik |
| `DELETE` | `/api/v1/symptoms/{date}` | Hapus catatan gejala harian |
| `GET` | `/api/v1/cycles/summary` | Statistik siklus (median, prediksi haid, ovulasi edukatif) |
| `GET` | `/api/v1/cycles/calendar` | Pemetaan hari per bulan (aktual, prediksi, masa subur) |
| `GET` | `/api/v1/fertility/estimate` | Estimasi jendela subur edukatif & probabilitas kualitatif |
| `GET` | `/api/v1/fertility/sdm-status` | Evaluasi kelayakan & status harian Standard Days Method (SDM) |
| `POST` | `/api/v1/acknowledgements` | Simpan informed consent kepatuhan metode SDM |
| `POST` | `/api/v1/sync/push` | Pengiriman mutasi batch offline dengan deteksi konflik |
| `GET` | `/api/v1/sync/pull` | Pengambilan perubahan data terbaru dari server |
| `GET` | `/api/v1/educational-articles` | Artikel edukasi klinis tervalidasi |
| `GET` | `/api/v1/me` | Profil & preferensi pengguna aktif |
| `PUT` | `/api/v1/me/settings` | Perbarui tujuan, preferensi privasi & notifikasi |
| `GET` | `/api/v1/export` | Ekspor seluruh data pengguna (UU PDP JSON format) |
| `DELETE` | `/api/v1/me/data` | Hapus permanen seluruh data pengguna |
