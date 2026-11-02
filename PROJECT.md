# PROJECT.md — HaidKu
**Versi:** 1.1 | **Status:** Siap dimulai di Google Antigravity IDE | **Bahasa produk:** Indonesia

## Identitas
- **Nama produk:** HaidKu
- **Tagline:** Kenali Siklusmu, Pahami Tubuhmu
- **Tujuan:** pencatat haid, prediksi siklus dan masa subur edukatif, serta edukasi masa peluang kehamilan relatif lebih rendah menurut protokol SDM dan syaratnya.
- **Target:** seluruh pengguna yang membutuhkan pelacakan menstruasi; mode untuk menghindari kehamilan tersedia secara terpisah dengan penjelasan risiko dan consent.

## Produk dan batasan
MVP: onboarding tanpa akun, catat mulai/selesai haid, spotting, riwayat, kalender, insight siklus, prediksi menstruasi, estimasi ovulasi/jendela subur edukatif, mode Standard Days Method, pengingat privat, ekspor/hapus data, PWA offline. Mode SDM tidak pernah mengklaim ada hari yang pasti aman untuk seks tanpa kontrasepsi. Klaim dan kesiapan regulasi memerlukan review klinisi sebelum pemasaran sebagai kontrasepsi.

## Platform
- **Tahap 1:** PWA installable mobile-first, offline-first; digunakan melalui browser Android/iPhone dan desktop.
- **Tahap 2:** Android APK/AAB via Capacitor dengan frontend yang sama.
- **Tahap 3:** iOS via Capacitor dengan Mac/Xcode ketika tersedia.
- **Backend:** PHP 8.3 Native REST API + MySQL 8 pada HTTPS; bukan bagian dari APK/IPA.
- **Frontend:** Vite + JS ES Modules + Tailwind CSS; IndexedDB dengan proteksi informasi sensitif.

## Milestone
- M0: repo audit/struktur, plan, desain UI, migrations, tests, deployment local.
- M1: tracker menstruasi, kalender, statistik; end-to-end work.
- M2: perkiraan siklus, ovulasi dan fertile window edukatif; fixture tests.
- M3: eligible SDM, consent, state/copy aman; review test.
- M4: PWA offline + sync opt-in + notifikasi/privasi.
- M5: Capacitor Android build & test; iOS preparation & review.
- M6: security/clinical/regulatory review dan publikasi hanya setelah terpenuhi.

## Konvensi agent
Lihat `AGENTS.md` dan seluruh file `docs/`. Kerjakan tahap dengan kode dan tes nyata, bukan hanya mockup. Buat `IMPLEMENTATION_PLAN.md` dan pertahankan berkas itu mutakhir. Semua tindakan destruktif/deploy publik perlu mandat eksplisit.
