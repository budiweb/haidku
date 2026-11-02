# PROMPT_ANTIGRAVITY_HAIDKU.md

## Prompt utama — tempel ke panel Agent Antigravity IDE

```text
Anda adalah principal fullstack engineer, UX designer, privacy/security engineer dan QA yang memahami batasan prediksi kesehatan reproduksi.

PROYEK: HaidKu (tagline: "Kenali Siklusmu, Pahami Tubuhmu")
TARGET: aplikasi menstruasi PWA + hybrid Android/iOS, satu codebase frontend.
STACK WAJIB: PHP 8.3 Native REST API, MySQL 8, JavaScript ES Modules + Vite + Tailwind CSS, IndexedDB offline store, Service Worker PWA, Capacitor hybrid. Tidak pakai Laravel. Jangan wajibkan URL /public.

BACA SEBELUM CODING:
- AGENTS.md (aturan wajib)
- docs/KONSEP_HAIDKU.md
- docs/PRD_HAIDKU.md
- docs/ARSITEKTUR_HAIDKU.md
- docs/ERD_HAIDKU.md
- docs/TEST_CASES_HAIDKU.md

PERINTAH EKSEKUSI:
1) Audit repo terlebih dahulu. Bila repo kosong, scaffold proyek sesuai arsitektur. Bila sudah ada fitur, pelajari, lakukan checkpoint/commit aman, jangan hapus fitur.
2) Buat IMPLEMENTATION_PLAN.md lengkap dengan sprint, checklist, dependensi, file target, test dan risiko. Lanjut kerjakan Sprint 0 dan Sprint 1 SEKARANG, tidak berhenti hanya dengan rencana.
3) Kembangkan dashboard mobile premium, kalender, onboarding guest, form catat HAID (tanggal mulai, selesai opsional, spotting), CRUD, statistik dan API aman. UI harus benar-benar berfungsi (tanpa CTA palsu). Brand HaidKu di semua tempat.
4) Siapkan jalur PWA offline sejak awal dan arsitektur adapter agar frontend yang sama dapat digunakan oleh Capacitor. Jangan implementasi PHP dalam app native.
5) Buat database migrations, .env.example, README, API docs, seed demo yang dipisahkan dari produksi, tests tanggal/validasi/ownership. Gunakan stack seminimal mungkin.
6) Verifikasi browser mobile, offline path, API auth, tanggal/zona waktu dan kualitas responsive. Perlihatkan hasil verifikasi, file berubah, serta perintah menjalankan di lokal.
7) Sesudah Sprint 1, lanjut tahap berikut menurut PRD untuk tugas yang sudah terdefinisi dan reversible, sambil tetap melakukan tes setelah tiap tahap. Jangan melakukan deploy, reset DB, mendaftarkan domain, build publikasi/store submission, perubahan kredensial, atau aksi destruktif tanpa mandat eksplisit.

ATURAN KESEHATAN WAJIB:
- Kalender haid dan prediksi ovulasi adalah perkiraan, BUKAN konfirmasi ovulasi.
- Pisahkan prediksi subur edukatif dan Standard Days Method (SDM).
- SDM: jika eligible siklus 26-32 hari, hari 8-19 = hindari hubungan tanpa perlindungan jika tidak ingin hamil. Hari 1-7 & 20-32 = peluang relatif lebih rendah, TETAP ADA RISIKO. Jika tidak eligible, data minim, hari >32, konflik data atau kondisi medis terkait => UNKNOWN.
- Jangan pernah menampilkan "aman tanpa kontrasepsi", "100% tidak subur", "risiko nol" atau probabilitas hamil per hari tanpa validasi medis.
- Sebelum promosi sebagai kontrasepsi wajib clinical/regulatory review.

UI/UX: Bahasa Indonesia, mobile-first, clean/minimal, aksen rose/teal, bottom nav, header sticky, tombol Catat Haid jelas, kalender elegan dengan legenda teks, dark mode hanya bila tidak mengganggu. Aksesibilitas dan privasi sejak awal. Pengingat default privat.

Jangan bengong atau berhenti dengan jawaban teori. Lakukan implementasi nyata pada workspace. Untuk langkah aman/rutin, jangan meminta klik Proceed/konfirmasi hanya untuk menulis file dan menjalankan pengujian; patuhi kebijakan izin tool Antigravity yang berlaku. Jika ada blocker, dokumentasikan lalu lanjut pekerjaan aman berikutnya.
```

## Pembagian sprint yang dapat dikirim bertahap

### Sprint 0–1 — fondasi + pencatatan
```text
Laksanakan Sprint 0 dan 1 HaidKu berdasarkan PRD. Pastikan PWA mobile first, frontend JS Vite/Tailwind, backend PHP native, MySQL migrations, guest offline IndexedDB. Implementasikan input awal/akhir haid, spotting, edit/hapus, kalender, statistik dan tests. Jalankan, uji di browser dan laporkan hasil riil.
```

### Sprint 2 — perhitungan menstruasi dan subur edukatif
```text
Laksanakan Sprint 2. Bangun pure domain functions untuk panjang siklus, median, variasi, prediksi haid/ovulasi/jendela subur edukatif. Jangan gunakan hasil ini untuk klaim hari tanpa risiko. Buat fixtures, test zona waktu, leap year, data minim dan perubahan histori. Jadikan UI mudah dipahami.
```

### Sprint 3 — mode menghindari kehamilan (SDM)
```text
Laksanakan Sprint 3 HaidKu. Bangun mode Standard Days Method terpisah dari estimasi ovulasi, dengan consent, eligibility, contraindication flag, state machine UNKNOWN/PRECAUTION/LOWER_CHANCE_NOT_ZERO, disclaimer permanen, dan minimal skenario T01-T23. Jangan keluarkan status rendah bila histori kurang atau melenceng. Audit copy medis.
```

### Sprint 4 — offline/sinkron/notifikasi/privacy
```text
Laksanakan Sprint 4. Sempurnakan PWA installable, service worker yang tidak membocorkan respon API, IndexedDB encrypted local design dengan mitigasi yang nyata, offline queue idempotent, consent-first optional sync, push/in-app fallback, privacy-safe notifications, export/delete. Uji offline/online, conflict, dedupe dan auth.
```

### Sprint 5–6 — Android lalu iOS hybrid
```text
Implementasikan Capacitor memakai dist Vite sebagai webDir, jangan hanya memuat remote server PHP sebagai UI. Bangun Android project dan periksa build dengan tool yang ada; uji alur offline, permission, API HTTPS, status bar, safe-area dan notifikasi. Siapkan iOS project/documentation; jelaskan macOS/Xcode jika lingkungan Windows tidak bisa build IPA. Tidak mengupload ke app store tanpa izin eksplisit.
```

## Hasil tiap sprint
- List file yang ditambahkan/diubah; arsitektur; migrations; hasil test yang benar-benar dieksekusi; bug/blocker; langkah verifikasi manual; rollback aman.
- Milestone ditandai selesai **hanya** bila kode + tes berfungsi, bukan hanya halaman mockup.
