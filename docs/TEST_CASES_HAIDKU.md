# TEST_CASES_HAIDKU — Wajib untuk Antigravity

**Aturan:** tests merupakan gate; tidak boleh mengklaim lulus tanpa menjalankan. Refer ke `PRD_HAIDKU.md` bagian N dan S untuk T01–T37.

## Prioritas P0 — Date & SDM
- T01: 1 Jan -> 29 Jan = 28 hari siklus, bukan 29.
- T02: 1 Jan sampai 5 Jan = 5 hari menstruasi inklusif.
- T03–T08: SDM eligible hari 7 lower-risk-not-zero, 8–19 caution, 20–32 lower-risk-not-zero, >=33 UNKNOWN.
- T09–T13: 2 siklus di luar 26–32 selama 365 hari, 3 siklus terbaru tidak layak, riwayat 1 siklus, flek tidak reset, pascamelahirkan/menyusui belum stabil => UNKNOWN.
- T14–T18: ubah histori -> recalc; concurrency; timezone; leap day; contradictory fertility signs => tidak naikkan safety.

## Prioritas P0 — Data & Privacy
- T19: request riwayat pengguna lain ditolak API.
- T20: notifikasi lock screen default tanpa konten reproduksi.
- T21: offline pencatatan + sync ulang => tepat satu record.
- T22: hapus akun/data sesuai kebijakan.
- T23: scan semua user-facing copy: tidak ada janji 100%/0%/pasti aman.

## Prioritas P0 — PWA/Hybrid
- T24–T25: offline after install/first cache, guest mode tanpa login.
- T26–T27: concurrency sync conflict dan idempotency.
- T28–T29: denial notification dan lockscreen privacy.
- T30–T33: parity UI Android/Web; airplane mode; shared device; timezone WIB-WITA.
- T34–T35: Auth/CORS, method_version stale => UNKNOWN.
- T36: native bundle berisi static frontend, bukan server PHP.
- T37: dokumen clinical review / regulatory gate sebelum klaim sebagai kontrasepsi.

## Uji manual UI tiap sprint
1. Mobile portrait 320px / 390px / 430px, desktop; kalender tidak horizontal-scroll tak perlu, target tap mudah.
2. Bahasa Indonesia, kontras aksesibel, screen reader labels, navigasi keyboard, loading/error/empty states.
3. Input haid 2–3 langkah, edit/hapus, undo jika didukung, spotting, bentrok tanggal, belum selesai.
4. Ketika tidak cukup data, app memberi informasi "prediksi belum andal" tanpa memanipulasi tampilan menjadi hari aman.
5. Browser refresh/offline/restore. Error console 0 pada alur utama. Tidak ada konten kesehatan di log.
6. PWA instalasi dan update versi service worker; notifikasi non-sensitif.
7. Android emulator (jika tersedia): cold start, airplane mode, perubahan zona waktu, permission reject, restart, app upgrade.
8. iOS Simulator/real device hanya jika macOS+Xcode tersedia; jika tidak tersedia catat sebagai NOT TESTED, bukan PASSED.

## Acceptance gates
- Sprint 1: period CRUD + kalender + migrations + tests valid.
- Sprint 2: forecast + edukasi, unit tests date lulus.
- Sprint 3: semua eligibility dan SDM states lulus; copy risiko benar.
- Sprint 4: data privacy+offline+idempotent sync lulus.
- Sprint 5–6: build/test hybrid hanya ditandai lulus bila benar-benar dijalankan pada lingkungan SDK yang tersedia.
