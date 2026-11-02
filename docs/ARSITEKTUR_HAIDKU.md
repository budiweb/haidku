# ARSITEKTUR_HAIDKU — PWA + Hybrid
**Versi:** 1.1 | **Target:** Antigravity IDE | **Prinsip:** satu frontend statis, backend PHP 8.3 Native.

## Keputusan teknis
| Lapisan | Pilihan | Alasan |
|---|---|---|
| UI/PWA/Hybrid | Vite + vanilla JavaScript ES Modules + Tailwind CSS | Cepat, ringan, reusable di Capacitor, tanpa ketergantungan React |
| Routing UI | Router JS ringan yang teruji atau History API wrapper | Navigasi single-page, work offline, URL sederhana |
| Native wrapper | Capacitor versi kompatibel Node/toolchain terkini | Android/iOS memakai build `dist` yang sama |
| API | PHP 8.3 native REST + PDO | Sesuai stack, aman, mudah deploy |
| DB server | MySQL 8 | Constraints, indexes, migrations |
| DB client | IndexedDB | Offline-first; enkripsi data sensitif sebelum penyimpanan jika fitur kunci aktif |
| Auth | guest + email OTP untuk sync (P1) | Bisa tanpa akun; email dari server melalui SMTP rahasia |
| Testing | PHPUnit/API tests; Vitest/Playwright jika tersedia | Fixture kalkulasi dan E2E |

## Desain deployment
- Production URL `https://<domain>/` untuk frontend; `https://<domain>/api/v1` untuk API. Nama domain placeholder, belum ditentukan.
- PHP berjalan di server, tidak disertakan di Android/iOS bundle.
- Website root publik dibatasi ke aset frontend dan entrypoint API saja. File privat berada di luar document root. Hindari URL `/public`; ini tidak menuntut sumber PHP berada di root publik.
- Build frontend: `npm run build` dalam `apps/web` => `dist/`, disalin ke webroot untuk deploy dan dipakai `webDir` Capacitor.
- Dev CORS ketat untuk originnya; produksi auth mempertimbangkan cookie secure untuk web dan token terlindungi untuk native sesuai threat model. Tidak pernah menaruh static secret API di frontend.

## Alur utama
```text
PWA Browser / Android Capacitor / iOS Capacitor
       ├─ UI: calendar, haid, statistik, education
       ├─ OfflineStore (IndexedDB) & SessionLock
       ├─ Cycle Engine (deterministic + fixture)
       ├─ SDM Guardrails (UNKNOWN / PRECAUTION / LOWER_NOT_ZERO)
       └─ Sync Adapter (online + opt-in)
                    ↓ HTTPS JSON API
          PHP 8.3 Native /api/v1
              ├─ Auth + ownership validation
              ├─ Cycle/SDM validation
              ├─ Sync idempotency & conflict detection
              ├─ Notification registry
              └─ Privacy/export/delete
                    ↓
                 MySQL 8
```

## Aturan data/konflik
- Gunakan data tanggal `YYYY-MM-DD` tanpa timezone untuk tanggal haid, dan timestamp server UTC untuk audit/sync; hitung hari siklus berdasarkan zona waktu pengguna.
- `client_mutation_id` ULID/UUID untuk dedupe; `record_version` untuk optimistic locking. Jangan otomatis memilih data bertentangan yang dapat mengubah hari risiko.
- Mode guest disimpan lokal dan bisa dipakai offline. Opt-in sync dan migrasi lokal-ke-akun harus preview + consent; offline wipe harus jelas.
- Jika key enkripsi hilang, jangan pernah menyatakan data bisa dipulihkan. Jika data belum dienkripsi, berikan penjelasan jujur tentang keterbatasan privasi dan jangan memasarkan sebagai terenkripsi.
- Cache hanya app shell, static assets, edukasi tidak sensitif. Jangan cache API respons sensitif secara publik dalam service worker Cache Storage.

## Keselamatan klinis (kontrak domain)
1. Cycle history hanya dari tanggal mulai haid yang benar-benar terkonfirmasi; spotting bukan day 1.
2. Ovulasi dan fertile window merupakan edukasi; tidak pernah menjadi dasar label aman.
3. SDM eligible hanya bila tujuan tepat, consent sudah diberikan, riwayat memadai (min 3 siklus lengkap terbaru valid sebagai kebijakan produk konservatif), siklus umumnya 26–32 hari, dan tidak ada override klinis. Dua siklus di luar rentang dalam setahun mengakhiri kelayakan sampai dievaluasi.
4. Hari ke-8 s.d. 19 => `HIGHER_FERTILITY_PRECAUTION`; hari 1–7 atau 20–32 => `LOWER_CHANCE_NOT_ZERO`; hari >32 atau tidak eligible => `UNKNOWN`. Status selalu disertai penjelasan risiko dan sumber metode.
5. Evaluasi tidak valid karena konflik sync/metode usang/tanggal tidak sah => `UNKNOWN`.
6. Angka 13/100 adalah tingkat kehamilan dalam satu tahun penggunaan biasa SDM (CDC 2024), bukan risiko hubungan di hari tertentu.

## Notifikasi
- `NotificationAdapter` expose `requestPermission`, `schedule`, `cancel`, `listInbox`; implementation web/native sesuai kemampuan aktual.
- Service worker tidak menjamin jadwal pesan ketika PWA ditutup. Web Push butuh izin+dukungan browser+server; pada iPhone persyaratannya mengikuti browser/OS, umumnya aplikasi web yang sudah dipasang pada Home Screen.
- Native Local Notifications bersifat best effort sesuai setting OS dan permission; uji reliability perangkat sesungguhnya.
- Tidak boleh menyebut isi sensitif pada lock screen default. Perubahan hari siklus membatalkan reminder lama dan reschedule.

## Build & release
- Urutan: web dev -> lint/tests -> Vite build -> PWA Lighthouse/install test -> Capacitor Android -> emulator/perangkat -> AAB -> iOS Mac/Xcode.
- Jangan generate binary `.apk` atau `.ipa` palsu bila SDK lokal belum tersedia; cantumkan blocker.
- Nama package **placeholder**: `id.haidku.app`, wajib cek kepemilikan/registrasi sebelum rilis.

## Keamanan & compliance
- Tidak ada analytics iklan untuk data kesehatan; Sentry/log tanpa payload sensitif; RBAC minimal.
- Rate limit OTP, brute-force prevention, API IDOR test, HTTPS, HSTS, CSP, CSRF bila cookie, input sanitation, content-security-policy untuk PWA; privacy notice dan penghapusan data.
- Sebelum klaim aplikasi sebagai kontrasepsi: review ahli kebidanan/kesehatan reproduksi dan evaluasi ketentuan perangkat medis/perlindungan data yang berlaku.

## Referensi teknis
- https://capacitorjs.com/docs
- https://capacitorjs.com/docs/getting-started/environment-setup
- https://antigravity.google/docs/ide/overview/
- https://antigravity.google/docs/rules/
- https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html
