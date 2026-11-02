# PRODUCT REQUIREMENTS DOCUMENT (PRD) — HAIDKU

**Versi:** 1.1 (PWA + Hybrid; Antigravity IDE)  
**Tanggal:** 2 November 2026  
**Platform:** PWA mobile-first (MVP) + Android/iOS hybrid via Capacitor (tahap rilis berikutnya)  
**Stack rekomendasi:** PHP 8.3 Native REST API + MySQL 8 + Vite + JavaScript ES Modules + Tailwind CSS + PWA/Service Worker + Capacitor  
**Bahasa:** Indonesia  
**Status:** Spesifikasi pengembangan; **belum merupakan validasi alat kontrasepsi**.

> **PERINGATAN PRODUK WAJIB:** HaidKu tidak dapat memastikan hari “aman” untuk berhubungan seksual tanpa kontrasepsi. Peluang kehamilan dapat tetap ada pada setiap hari siklus. Prediksi kalender tidak boleh digunakan sebagai jaminan untuk menghindari kehamilan. Pengguna yang sangat perlu menghindari kehamilan harus memperoleh konseling tenaga kesehatan dan mempertimbangkan metode kontrasepsi yang lebih efektif. Metode pelacakan kesuburan tidak melindungi dari infeksi menular seksual (IMS).

---

## A. Ringkasan eksekutif
HaidKu membantu wanita menyimpan tanggal mulai dan selesai menstruasi, memperoleh ringkasan kesehatan siklus, dan memperkirakan haid berikutnya serta periode kesuburan. Pembeda utama produk adalah **fitur edukasi menghindari kehamilan alami yang jujur tentang ketidakpastian**: menyajikan kondisi saat peluang kehamilan relatif lebih rendah menurut aturan SDM dan menonaktifkannya ketika kriteria metode tidak terpenuhi, bukan menampilkan “hari aman” palsu.

**Masalah yang diselesaikan:** (1) catatan haid tercecer; (2) lupa tanggal haid sebelumnya; (3) sulit melihat keteraturan siklus; (4) salah kaprah “setelah haid pasti aman”, “masa tidak subur = mustahil hamil”; (5) kurangnya pengingat privat dan pengetahuan mengenai keterbatasan kalender.

**Tujuan MVP:** pencatatan sangat mudah, hasil mudah dipahami, privasi kuat, batasan medis transparan.

## B. Sasaran, non-goals, dan metrik
### B1. Sasaran
1. Mencatat haid baru maksimal 3 langkah.
2. Menghitung panjang siklus berdasarkan **selisih hari antara hari pertama dua haid berurutan**.
3. Memvisualisasikan haid, prediksi siklus, dan rentang kesuburan yang bersifat perkiraan.
4. Menyediakan mode **"Memahami peluang kehamilan"** dengan metode SDM terbatas pada pengguna yang memenuhi syarat.
5. Tidak menerbitkan label “rendah” saat prediksi tidak layak.
6. Menghadirkan notifikasi yang menghormati privasi.

### B2. Bukan sasaran MVP
- Menjamin pencegahan kehamilan; menjadi pengganti layanan medis.
- Mendiagnosis PCOS, infertilitas, kehamilan, atau gangguan menstruasi.
- Memastikan ovulasi hanya dari perhitungan tanggal.
- Menghitung probabilitas hamil per hari dalam persen tanpa bukti validasi.
- Menggabungkan sinyal suhu basal/LH/lendir serviks menjadi keputusan “boleh tanpa perlindungan” tanpa protokol tervalidasi dan tinjauan ahli.

### B3. Metrik produk
- Aktivasi: persentase pengguna yang menyelesaikan pencatatan haid pertama.
- Retensi D30/D90, persentase siklus lengkap dengan tanggal awal, koreksi data.
- Delivery dan opt-in notifikasi.
- Kesalahan kalkulasi tanggal: target nol pada unit test yang ditentukan.
- Insiden klaim “aman/0%” dalam UI: nol.
- Presentase status “tidak dapat diperkirakan” pada kasus pengecualian yang harus benar: 100% dalam pengujian.

## C. Persona & use cases
**Persona 1, pencatat rutin:** hanya ingin mengingat kapan menstruasi dimulai dan selesai.  
**Persona 2, ingin hamil:** melihat jendela subur perkiraan untuk membantu waktu berhubungan, bukan kepastian ovulasi.  
**Persona 3, ingin menghindari kehamilan:** membutuhkan informasi **metode kesadaran kesuburan** dan batasan nyata untuk menghindari hubungan tanpa perlindungan pada periode berisiko.  
**Persona 4, siklus berubah-ubah:** melihat riwayat dan diarahkan agar tidak mengandalkan kalender untuk mencegah kehamilan.

## D. Prinsip keselamatan klinis dan bahasa produk
1. Setiap kategori hasil harus menampilkan **nama metode, asumsi, tanggal perhitungan, dan peringatan jika perlu**.
2. Pemisahan **prediksi kalender biasa** dan **panduan SDM** merupakan persyaratan arsitektur, bukan pilihan desain.
3. "Peluang kehamilan lebih rendah" ≠ aman, bebas risiko, atau konfirmasi infertilitas.
4. Tidak tampilkan angka persentase peluang kehamilan untuk tanggal tunggal. Efektivitas metode dalam satu tahun bukan probabilitas pada hari tertentu.
5. Mode pencegahan kehamilan hanya setelah informed acknowledgment; tidak aktif otomatis.
6. Pesan penting tetap terbaca untuk color-blind users; warna bukan satu-satunya sinyal.
7. Jangan menyebut hasil sebagai diagnosis atau rekomendasi medis personal.
8. Tidak ada monetisasi untuk membuka “hari aman”; premium tidak mengubah standar keselamatan.

### D1. Informasi angka efektivitas yang boleh ditampilkan
- **Standard Days Method:** pada penggunaan biasa, sekitar **13 dari 100 pengguna mengalami kehamilan pada tahun pertama**, menurut CDC 2024. Ini angka tahunan populasi untuk metode tertentu, bukan tingkat risiko harian atau tingkat kegagalan algoritma HaidKu.
- Metode kesadaran kesuburan lain berbeda dalam protokol dan efektivitas; jangan menyatukan angka dari semua metode untuk mengklaim efektivitas produk.

## E. Ruang lingkup fungsional dan prioritas
| ID | Fitur | Prioritas | Detail |
|---|---|---|---|
| FR-001 | Mode tamu lokal | P0 | Pencatatan tanpa akun, data tersimpan lokal secara aman sesuai keterbatasan platform; jelaskan risiko hilang jika browser dihapus |
| FR-002 | Akun opsional | P1 | Email OTP, sinkron antar-perangkat setelah persetujuan |
| FR-003 | Onboarding | P0 | Tujuan penggunaan, informasi usia/kondisi yang relevan secara minimal, pemahaman risiko |
| FR-004 | Pencatatan awal haid | P0 | Tanggal lokal, pertama hari darah haid (bukan spotting) |
| FR-005 | Pencatatan akhir haid | P0 | Opsional pada saat awal, dapat ditambahkan kemudian; validasi tanggal |
| FR-006 | Edit, hapus dan konfirmasi | P0 | Histori perubahan, recalculation, konfirmasi spotting vs haid |
| FR-007 | Hitung statistik | P0 | Durasi siklus, durasi perdarahan, median, variasi/rentang, jumlah data valid |
| FR-008 | Prediksi haid | P0 | Berbasis data yang memadai, rentang dan label 'perkiraan' |
| FR-009 | Prediksi ovulasi | P1 | Perkiraan ±14 hari sebelum menstruasi berikutnya, bukan observasi ovulasi aktual |
| FR-010 | Perkiraan jendela subur | P1 | Sekitar 5 hari sebelum hingga 1 hari sesudah estimasi ovulasi; tidak digunakan sebagai dasar menyatakan hari aman |
| FR-011 | Mode SDM | P0 | Hari 8–19 bila memenuhi syarat; kategori risiko **relatif**; override dan disable jika tidak layak |
| FR-012 | Pengingat | P0 | Hasil berdasarkan data terbaru, pesan privasi, preferensi pengguna |
| FR-013 | Gejala & volume darah | P1 | Form harian sederhana |
| FR-014 | Riwayat / kalender | P0 | Periode aktual vs hasil prediksi dibedakan jelas |
| FR-015 | Edukasi | P0 | Mengapa hari rendah ≠ aman, efektivitas, kapan tes hamil/berkonsultasi |
| FR-016 | Ekspor dan hapus data | P0 | JSON/CSV, hapus data lokal dan server sesuai identitas & konfirmasi |
| FR-017 | Kunci aplikasi | P1 | Biometrik/PIN jika lingkungan teknis memungkinkan, autolock, logout |
| FR-018 | Panel admin | P1 | Administrasi pengguna dan audit teknis tanpa menampilkan catatan reproduksi individual secara default |
| FR-019 | PWA offline | P0 | Pencatatan offline, antre sinkron, tampilan riwayat lokal; jelaskan batasan push |
| FR-020 | BBT/mukus/LH | P2 | Pencatatan data pengamatan, **tanpa inferensi 'aman' di MVP** |

## F. Alur utama pengguna
### F1. Onboarding
1. Landing dengan nilai produk dan peringatan ringkas.
2. Pilih tujuan: `pantau_haid` / `merencanakan_kehamilan` / `menghindari_kehamilan`.
3. Input tanggal mulai haid terakhir; tanggal akhir jika ada; riwayat tanggal mulai 2–3 haid sebelumnya jika diketahui (boleh lewatkan).
4. Pilih izin notifikasi (opsional), tampilkan ringkasan data.
5. Jika tujuan `menghindari_kehamilan`, minta pengguna membaca penjelasan efektivitas, syarat siklus, dan batasan metode lalu konfirmasi pemahaman.
6. Jika syarat SDM tidak pasti, tampilkan **"belum bisa menilai kesesuaian metode"**, bukan indikator rendah.

### F2. Pencatatan haid
1. Tekan `+ Catat haid`.
2. Pilih tanggal mulai; boleh pilih tanggal akhir atau tandai `masih berlangsung`.
3. Tandai perdarahan sebagai `menstruasi` atau `flek/spotting`; spotting tidak boleh otomatis menjadi day 1.
4. Simpan, hitung ulang seluruh indikator dan notifikasi.
5. Jika periode tumpang-tindih atau data janggal, minta koreksi sebelum memasukkan ke algoritma.

### F3. Beranda
- Status: "Hari ke-N dari siklus" jika awal haid valid.
- Tanggal mulai terakhir dan prediksi haid berikutnya (rentang bila tidak pasti).
- Status masa subur perkiraan (jika cukup data), termasuk badge **perkiraan**.
- Kartu Mode SDM bila dipilih: `hindari tanpa perlindungan` / `peluang lebih rendah namun tidak nol` / `tidak dapat ditentukan`.
- Tombol `Catat haid`, `Lihat Kalender`, `Mengapa status ini?`.

### F4. Pengingat
- Opt-in per jenis: haid diperkirakan mendekat, pengingat isi data, awal hari 8 (jika SDM layak), dan perubahan status dari perubahan data.
- Notifikasi dikirim pada jam yang disepakati; **default di lock screen hanya "Pengingat HaidKu"**.
- Jika tidak ada izin push atau PWA tidak mendukung, tampilkan inbox pengingat in-app tanpa menjanjikan delivery otomatis.
- Hindari notifikasi "sekarang aman berhubungan".

## G. Spesifikasi algoritma
### G1. Data dan definisi
- `day_1`: tanggal mulai **perdarahan menstruasi yang sebenarnya**, bukan flek biasa.
- `cycle_length`: selisih hari kalender antara `day_1` yang valid dan `day_1` berikutnya (dalam zona waktu pengguna).
- `period_length`: jumlah hari kalender inklusif dari start hingga end (jika keduanya ada).
- `current_cycle_day`: `date_diff(today_local, latest_confirmed_day_1) + 1`.
- `historical_cycle_lengths`: rangkaian siklus lengkap yang tervalidasi, bukan durasi darah haid.
- Pengguna dapat memiliki `confidence` rendah/menengah menurut kecukupan data, tanpa menyatakan probabilitas klinis.

### G2. Prediksi haid
Algoritma MVP: ambil sampai 6 siklus lengkap paling baru yang valid; gunakan **median** untuk estimasi panjang siklus dasar (keputusan produk, bukan pedoman diagnosis). Prediksi = latest_day_1 + median_cycle_length hari. Tampilkan rentang berdasarkan variasi historis; jika data tidak cukup, pilih input panjang siklus yang dilaporkan sendiri dan beri label kepercayaan rendah atau tidak tampilkan tanggal spesifik. Jika variasi besar, prediksi tunggal diganti estimasi rentang lebih lebar dengan peringatan. Pastikan siklus yang masih berlangsung tidak dipakai menghitung median.

### G3. Prediksi ovulasi & masa subur (informasi edukasi)
- Ovulasi perkiraan ≈ prediksi awal haid berikutnya **dikurangi 14 hari**. Ini heuristik umum, **bukan** bukti ovulasi dan dapat meleset.
- Rentang subur edukatif: kira-kira hari -5 sampai +1 relatif terhadap prediksi ovulasi.
- Jangan gunakan rentang perkiraan ini untuk memutuskan periode seks tanpa perlindungan. Untuk tujuan menghindari kehamilan, jalankan logika SDM terpisah.
- Ovulasi dan jendela subur disembunyikan atau diberi penanda ketidakpastian tinggi jika data minim/tidak teratur.

### G4. Eligibility untuk SDM
**Syarat medis metode:** SDM ditujukan bagi siklus yang umumnya 26–32 hari. CDC menyebutkan jika **2 atau lebih siklus <26 atau >32 hari dalam 1 tahun**, metode mungkin tidak sesuai.  
**Syarat keamanan produk tambahan yang lebih konservatif (bukan aturan klinis CDC):** minimal 3 panjang siklus lengkap terbaru yang valid untuk menampilkan kategori "peluang lebih rendah". Bila kurang, hanya tampilkan penjelasan SDM; pengguna bisa tetap mencatat siklus. Jangan menyebut syarat produk ini sebagai ketentuan CDC.

- `eligible = selected_avoid_mode && consented && >=3 valid recent completed cycles && all 3 recent cycles within [26,32] && fewer than 2 cycles outside [26,32] in past 365 days && !risk_override`.
- Variabel `risk_override` mencakup: hamil/dugaan hamil, baru melahirkan atau menyusui dengan siklus belum stabil, pascakeguguran/aborsi dengan siklus belum stabil, baru mulai haid, perimenopause dengan siklus berubah, perubahan/berhenti kontrasepsi hormonal baru-baru ini, penggunaan obat yang memengaruhi siklus, perdarahan tidak jelas, adanya tanda-tanda siklus tidak andal, dan informasi kesuburan saat ini yang bertentangan. Daftar dan masa tunggu yang lebih spesifik harus direview klinisi.
- Jika pengguna memilih `kehamilan harus benar-benar dihindari karena alasan medis`, jangan tampilkan mode sebagai pengganti konseling kontrasepsi; beri saran konsultasi.

### G5. State machine SDM
Untuk pengguna eligible pada hari siklus saat ini:
- `cycle_day` 8–19 (inklusif): **HIGHER_FERTILITY_PRECAUTION** = "Periode berpotensi subur — hindari hubungan tanpa perlindungan jika tidak ingin hamil".
- `cycle_day` 1–7 atau 20–32: **LOWER_CHANCE_NOT_ZERO** = "Peluang kehamilan relatif lebih rendah menurut SDM, tetapi tidak nol".
- `cycle_day > 32` tanpa haid baru, atau data tidak lengkap/janggal: **UNKNOWN** = "Perkiraan tidak andal; jangan menganggap hari ini aman".
- `risk_override` terpicu pada hari apa pun: **UNKNOWN**, atau **PRECAUTION** jika ada bukti tanda subur, dan tampilkan alasan.
- Pada siklus baru, reset `cycle_day = 1` hanya untuk awal haid yang dikonfirmasi; flek tidak me-reset.
- Kategori ini **bukan** hasil deteksi ovulasi. Jangan memberi izin implisit "seks tanpa kondom boleh" pada `LOWER_CHANCE_NOT_ZERO`.

### G6. Pesan layar berdasarkan hasil
- `HIGHER_FERTILITY_PRECAUTION`: "Menurut Standard Days Method, ini periode untuk menghindari hubungan tanpa perlindungan bila Anda tidak ingin hamil."
- `LOWER_CHANCE_NOT_ZERO`: "Peluang kehamilan relatif lebih rendah menurut Standard Days Method, namun masih ada risiko. Tidak ada hari yang dijamin aman."
- `UNKNOWN`: "Siklus saat ini belum memenuhi syarat perhitungan Standard Days Method yang andal. Gunakan perlindungan lain atau konsultasikan pilihan kontrasepsi."

### G7. Pseudocode (ilustrasi, harus ditest dan direview klinis)
```text
function getSDMStatus(user, todayLocal):
    if user.goal != "avoid_pregnancy" or !user.sdmConsent:
        return DISABLED
    if !hasThreeRecentCompletedValidCycles(user):
        return UNKNOWN("Riwayat siklus belum cukup")
    if !allLastThreeCyclesBetween(user, 26, 32):
        return UNKNOWN("Siklus belum memenuhi kriteria")
    if countOutOfRangeCycles(user, last365Days) >= 2:
        return UNKNOWN("Metode kalender mungkin tidak sesuai")
    if hasClinicalOrDataRiskOverride(user):
        return UNKNOWN("Ada kondisi yang membuat prediksi tidak andal")
    day = calendarDaysBetween(user.lastConfirmedPeriodStart, todayLocal) + 1
    if day < 1 or day > 32:
        return UNKNOWN("Tanggal atau panjang siklus tidak sesuai")
    if day >= 8 and day <= 19:
        return HIGHER_FERTILITY_PRECAUTION
    return LOWER_CHANCE_NOT_ZERO
```
**Catatan:** eligibility dan fallback merupakan aturan konservatif produk. Belum cukup untuk menyatakan aplikasi ini tervalidasi sebagai metode kontrasepsi.

## H. Tabel dan skema basis data awal
Semua tabel menggunakan `id` UUID/ULID atau BIGINT konsisten, `created_at`, `updated_at`, `deleted_at` jika sesuai; tanggal siklus disimpan sebagai **DATE lokal tanpa konversi UTC**, timestamp event sebagai UTC. Foreign key dan index diimplementasikan.

### H1. users
`id`, `email_nullable`, `email_verified_at`, `password_hash_nullable` (jika password digunakan), `timezone` (default Asia/Jakarta namun dapat diubah), `locale`, `created_at`, `deleted_at`.

### H2. user_settings
`user_id`, `goal` enum (`track`, `conceive`, `avoid`), `sdm_consent_at`, `notification_enabled`, `notification_time_local`, `notification_privacy_mode`, `cycle_history_window`, `data_sync_opt_in`, `app_lock_enabled`.

### H3. menstrual_periods
`id`, `user_id`/`local_profile_id`, `start_date`, `end_date_nullable`, `bleeding_type` (`period`, `spotting`), `status` (`confirmed`, `draft`), `note_encrypted_nullable`, `source`, `created_at`, `updated_at`.
Constraints: `end_date >= start_date`; invalid overlaps forbidden or flagged; sorted per user.

### H4. daily_symptoms
`id`, `user_id`, `observation_date`, `pain_scale_nullable`, `flow_level_nullable`, `mood_nullable`, `symptom_codes_json`, `notes_encrypted_nullable`.

### H5. fertility_observations (P2; do not influence low-risk logic in MVP)
`id`, `user_id`, `observation_date`, `basal_temp_c_nullable`, `temperature_context_json`, `cervical_mucus_nullable`, `lh_result_nullable`, `free_note_encrypted_nullable`.

### H6. computed_cycle_snapshots
`id`, `user_id`, `cycle_start_date`, `cycle_day`, `median_cycle_length_nullable`, `cycle_range_json`, `predicted_next_period_nullable`, `estimated_ovulation_date_nullable`, `sdm_state`, `reason_codes_json`, `method_version`, `computed_at`. Snapshots as derived data only; recomputable, not source of truth.

### H7. notifications
`id`, `user_id`, `type`, `scheduled_at_utc`, `delivered_at_utc_nullable`, `status`, `privacy_safe_text`, `dedupe_key`, `method_version`.

### H8. acknowledgements
`id`, `user_id`, `type`, `version`, `accepted_at_utc`, `user_agent_summary_optional`. Store only needed audit data.

### H9. security_audit_events
`id`, `user_id_nullable`, `event_type`, `created_at_utc`, `context_redacted_json`. **Never** store period dates or fertile-day status in plain application logs.

### H10. educational_articles
`id`, `slug`, `title`, `body`, `reference_urls_json`, `clinician_reviewed_at_nullable`, `version`, `status`.

**ERD hubungan:** users 1:N menstrual_periods; users 1:1 user_settings; users 1:N daily_symptoms/fertility_observations/computed_cycle_snapshots/notifications/acknowledgements; educational_articles independen.

## I. Layar dan UX detail
1. **Welcome/onboarding:** tujuan, 2–3 catatan historis opsional, pengaturan privasi.
2. **Dashboard:** status siklus, prediksi haid, CTA catat, status edukasi SDM.
3. **Calendar:** hari haid aktual, prediksi haid (garis putus-putus), ovulasi perkiraan (ikon), periode SDM (label), filter.
4. **Period editor:** start/end, masih berlangsung, spotting, volume, notes, save.
5. **Cycle insights:** panjang siklus per bulan, median, variasi, keteraturan; satuan hari.
6. **Kesuburan:** jelaskan dua lapisan estimasi: jendela subur perkiraan vs hari pencegahan menurut SDM.
7. **Mode pencegahan:** syarat, status kelayakan, bukti tertulis bahwa risiko tidak nol, alternatif metode.
8. **Notifications:** izin, waktu, pilihan detail vs privat; privat default.
9. **Health & Education:** materi dan sumber medis; saran konsultasi jika perubahan signifikan.
10. **Settings:** tujuan, pengingat, ekspor/hapus, keamanan, legal, hapus akun.
11. **Admin:** CMS edukasi, statistik agregat non-identifying, status sistem, error log yang disensor.

### I1. Visual tokens
- Latar `#FAFAF9`, teks `#1F2937`, aksen coral `#D96B8C`, teal `#238B78`.
- Hindari hijau terang sebagai sinyal "aman"; status SDM menggunakan teks eksplisit.
- Radius 12–16 px, top nav lengket, bottom nav pada layar mobile, target sentuh minimal 44px.
- Format tanggal Indonesia `dd MMM yyyy` dan support timezone; gunakan ikon + label.

## J. Aturan keamanan, data, dan etika
### J1. Kerahasiaan
- Data menstruasi termasuk **data kesehatan**, kategori data pribadi spesifik pada Pasal 4 UU No. 27/2022 tentang PDP.
- Terapkan data minimization, encryption at rest untuk catatan sensitif, TLS, key separation, least privilege, backup terenkripsi, rotasi secret, audit, retention dan deletion policy, dan proses respons insiden.
- Jangan gunakan data siklus untuk iklan tertarget atau mengirim data ke SDK analitik/iklan pihak ketiga.
- Data pribadi tidak boleh terlihat oleh admin operasional secara default. Tidak ada endpoint daftar semua riwayat menstruasi pengguna.
- Hindari informasi reproduksi dalam URL, referrer, log, subject email, lock screen, dan web push payload detail.
- Penyimpanan offline browser berisiko terbaca bila perangkat dipakai bersama. Sediakan kunci aplikasi bila mungkin dan panduan privasi.
- Consent eksplisit untuk sinkronisasi, notifikasi, dan berbagi data; ekspor/hapus tanpa dark pattern.

### J2. Validasi keselamatan pengguna
- Bagi pengguna yang menjalani obat tertentu, baru melahirkan, menyusui, baru berhenti kontrasepsi hormonal, perimenopause, siklus tidak teratur, atau mencurigai kehamilan, gunakan `UNKNOWN` hingga sesuai protokol yang telah direview.
- Jika haid terlambat, tampilkan informasi tes kehamilan dan konsultasi sesuai keadaan; jangan menjamin haid akan datang.
- Jika pengguna melaporkan hubungan tanpa perlindungan pada hari potensi subur dan tidak menginginkan kehamilan, beri edukasi netral untuk segera berkonsultasi dengan tenaga kesehatan mengenai pilihan yang sensitif waktu, termasuk kontrasepsi darurat jika sesuai dan tersedia. Jangan otomatis memberikan instruksi yang mengabaikan kondisi kesehatan dan regulasi lokal.
- Ingatkan risiko IMS dan fungsi kondom.

### J3. Klaim regulatori
- Sebelum memasarkan aplikasi sebagai kontrasepsi atau mengklaim efektivitas menghindari kehamilan, lakukan peninjauan kebutuhan izin/klasifikasi regulasi perangkat lunak kesehatan yang berlaku di Indonesia dan konsultasi pakar/regulator terkait.
- Sampai validasi dan evaluasi regulasi selesai, labeli fungsi ini sebagai **edukasi dan pencatatan kesuburan**, bukan pengganti kontrasepsi.

## K. Arsitektur aplikasi PWA + Hybrid (satu codebase)
### K1. Prinsip arsitektur
1. **Frontend independen dari PHP**: `apps/web` ialah web app responsif berbasis JavaScript ES Modules, Vite, Tailwind CSS. `vite build` menghasilkan aset statis untuk **PWA dan bundle Capacitor**. Jangan merender layar aplikasi menggunakan PHP template agar layar yang sama berjalan pada Android/iOS offline.
2. **API server**: PHP 8.3 Native di `apps/api`, JSON REST `/api/v1`, MySQL 8. Gunakan PDO prepared statements, service-layer, controller terpisah, migrasi, error handler dan test tanpa Laravel.
3. **Engine siklus**: kontrak dan test fixture tunggal; hitungan client offline dan backend harus menghasilkan output yang konsisten; status SDM di server divalidasi ulang untuk data tersinkron. Jangan berikan status "lebih rendah" jika client/server tidak cocok.
4. **Offline-first**: aset app shell di-cache service worker; tanggal haid/simptom disimpan IndexedDB dengan kebijakan proteksi data; mutation queue dengan `client_mutation_id`, `record_version`, `updated_at`, retry idempotent, penyelesaian konflik tanpa menimpa data diam-diam.
5. **Guest-first**: tidak wajib mendaftar untuk mencatat offline; sinkronisasi hanya opt-in dengan akun. Tidak ada tracker iklan atau analytics yang mengandung data kesehatan.
6. **Capacitor**: `apps/web/dist` sebagai `webDir` untuk paket Android/iOS. `apiBaseUrl` menunjuk HTTPS backend. Jangan memaketkan PHP/MySQL dalam APK. Tampilkan pengalaman offline walaupun server mati.
7. **PWA Push + native reminder**: abstractions `NotificationAdapter` untuk browser/PWA, Android/iOS; izin diminta saat konteks tepat, bukan saat splash. Pesan di lock screen netral secara default. Fallback inbox in-app.
8. **Keamanan deployment**: path web URL `/` tanpa `/public` di URL. File rahasia, database migrations, keys, server-side code ditempatkan di luar document root jika memungkinkan; jika shared hosting membatasi, wajib deny rules + test public access. `/api` diekspos hanya melalui entrypoint yang aman.
9. **Kode native opsional**: plugin Capacitor untuk local notifications, biometric app lock (jika memenuhi keamanan), serta secure native storage; siapkan adapter fallback web dan hindari plugin yang belum diverifikasi dukungannya.

### K2. Komponen aplikasi
- `CycleCalculator`: validasi hari pertama dan akhir perdarahan, panjang siklus, variabilitas.
- `PeriodForecast`: prediksi menstruasi dan rentang ketidakpastian.
- `FertilityEducationEstimator`: perkiraan ovulasi dan jendela subur untuk edukasi, **bukan** keputusan seks tanpa kontrasepsi.
- `SDMEligibilityService`: syarat metode dan alasan tidak layak, mengikuti kebijakan konservatif yang ditinjau klinisi.
- `SDMStatusService`: state `HIGHER_FERTILITY_PRECAUTION`, `LOWER_CHANCE_NOT_ZERO`, `UNKNOWN`, atau `DISABLED`; status ke depan hanya ilustrasi, bukan sertifikasi aman.
- `OfflineStore`, `SyncEngine`, `NotificationAdapter`, `PrivacyService`, `AuthService`.

### K3. Platform & keputusan rilis
| Kemampuan | PWA | Android hybrid | iOS hybrid |
|---|---|---|---|
| Input dan kalender offline | Ya | Ya | Ya |
| Instal di home screen | Pada browser/perangkat mendukung | APK/AAB | Aplikasi via Xcode/distribusi |
| Push | Bergantung dukungan browser/izin/instalasi | Integrasi native bila diimplementasikan | Integrasi native bila diimplementasikan |
| Local notification saat app tertutup | Tidak dijamin oleh web murni | Plugin native bila tersedia | Plugin native bila tersedia |
| Build tools | Node 22+ untuk toolchain baru, Vite | Android Studio + SDK | macOS + Xcode |
| Backend | PHP/MySQL HTTPS terpusat | Sama | Sama |

### K4. Struktur proyek
```text
haidku/
  AGENTS.md                 # instruksi Antigravity selalu aktif
  docs/
    KONSEP_HAIDKU.md
    PRD_HAIDKU.md
    ARSITEKTUR_HAIDKU.md
    ERD_HAIDKU.md
    TEST_CASES_HAIDKU.md
    PROMPT_ANTIGRAVITY_HAIDKU.md
  apps/
    web/
      src/                  # ui, pages, components, domain, storage, adapters
      public/               # manifest, icons, offline fallback
      tests/
      capacitor.config.ts   # disiapkan saat integrasi hybrid
      package.json
    api/
      src/                  # PHP controllers/services/repositories/middleware
      bootstrap/
      tests/
  database/
    migrations/
    seeds/
  deployment/
    webroot/                # document root publik; URL tetap /, bukan /public
    config/                 # contoh konfigurasi server (tanpa secret)
  .env.example
  README.md
```
Konsep path dapat disesuaikan Antigravity setelah mengaudit repo. **Bila pengguna telah membuat kode**, jangan memigrasi/menimpa struktur tanpa rencana perubahan aman.

### K5. Browser/device safety
- Gunakan zona waktu pengguna untuk `DATE` klinis; timestamp UTC untuk audit/sync.
- Pertimbangkan ukuran cache dan pembaruan service worker supaya hasil kalkulasi tidak berasal dari aturan lama.
- Penyimpanan sensitif offline: gunakan enkripsi yang benar dengan pengelolaan kunci; hindari kunci hard-coded dalam JavaScript. Pada mode tamu, jelaskan trade-off PIN/passphrase dan hilangnya data bila browser dihapus.
- Tidak mengandalkan background sync atau service worker sebagai pengingat pasti ketika aplikasi ditutup.

## L. Endpoint API contoh
```
GET    /api/v1/me
PUT    /api/v1/me/settings
GET    /api/v1/periods?from=YYYY-MM-DD&to=YYYY-MM-DD
POST   /api/v1/periods
PATCH  /api/v1/periods/{id}
DELETE /api/v1/periods/{id}
GET    /api/v1/cycles/summary
GET    /api/v1/cycles/calendar?month=YYYY-MM
GET    /api/v1/fertility/estimate
GET    /api/v1/fertility/sdm-status?date=YYYY-MM-DD
POST   /api/v1/acknowledgements
GET    /api/v1/educational-articles
GET    /api/v1/export
DELETE /api/v1/me/data
```
Setiap respons kesuburan menyertakan `method_name`, `method_version`, `as_of_date`, `eligible`, `eligibility_reasons`, `status`, `message`, `disclaimer`, `source_urls`. `sdm-status` tidak menerima tanggal arbitrer jauh ke masa depan lalu menampilkan "aman" tanpa batas; tanggal prediksi mendatang harus jelas diberi label indikatif saja.

## M. User stories dan acceptance criteria
**US-01:** Sebagai pengguna, saya dapat mengisi tanggal mulai haid; setelah menyimpan, hari ke-1 dan kalender langsung benar.  
**US-02:** Saya dapat menyimpan haid yang belum selesai; statistik panjang siklus tetap memakai tanggal mulai, bukan tanggal akhir.  
**US-03:** Saya dapat menandai flek; aplikasi tidak menganggapnya awal siklus baru.  
**US-04:** Saya dapat mengedit data historis; prediksi dan notifikasi lama diregenerasi tanpa duplikasi.  
**US-05:** Saya bisa melihat prediksi haid berikutnya dan sumber keterbatasannya.  
**US-06:** Dalam tujuan hindari kehamilan, saya melihat informasi risiko dan harus menyetujuinya sebelum menggunakan SDM.  
**US-07:** Saat SDM eligible, hari 8–19 harus menghasilkan HIGHER_FERTILITY_PRECAUTION; hari 1–7/20–32 menghasilkan LOWER_CHANCE_NOT_ZERO.  
**US-08:** Jika tidak eligible, hasil wajib UNKNOWN; tidak boleh ada label rendah.  
**US-09:** Saya dapat menonaktifkan notifikasi dan menghapus data dengan benar.  
**US-10:** Pengguna lain atau admin biasa tidak dapat mengakses data haid saya tanpa otorisasi.

## N. Test matrix — WAJIB sebelum produksi
| Case | Data | Ekspektasi |
|---|---|---|
| T01 | Mulai haid 1 Jan; berikutnya 29 Jan | Panjang siklus 28 hari |
| T02 | Haid 1–5 Jan | Durasi haid 5 hari inklusif |
| T03 | Hari siklus 7; SDM eligible | LOWER_CHANCE_NOT_ZERO + warning |
| T04 | Hari siklus 8; SDM eligible | HIGHER_FERTILITY_PRECAUTION |
| T05 | Hari siklus 19; SDM eligible | HIGHER_FERTILITY_PRECAUTION |
| T06 | Hari siklus 20; SDM eligible | LOWER_CHANCE_NOT_ZERO + warning |
| T07 | Hari siklus 32; SDM eligible | LOWER_CHANCE_NOT_ZERO + warning; cek data mutakhir |
| T08 | Hari siklus 33 tanpa haid baru | UNKNOWN, bukan lower |
| T09 | Dua siklus di luar 26–32 dalam 365 hari | UNKNOWN, belum layak SDM |
| T10 | Hanya satu tanggal haid | UNKNOWN SDM; ringkasan terbatas |
| T11 | Spotting hari 12 | Tidak reset cycle day |
| T12 | Siklus 25/33 hari pada 3 terakhir | UNKNOWN untuk SDM |
| T13 | Baru melahirkan/menyusui & siklus belum stabil | UNKNOWN |
| T14 | Ubah tanggal haid masa lalu | Semua turunan berubah, notifikasi terjadwal lama dibatalkan |
| T15 | Dua tab menulis serentak | Tidak membuat data tumpang-tindih silent |
| T16 | Zona waktu berubah, pergantian hari | Perhitungan konsisten tanggal lokal |
| T17 | 29 Feb tahun kabisat | Selisih kalender benar |
| T18 | Ada tanda fertilitas/LH yang bertentangan (future) | Tidak pernah memberi hasil lebih aman; UNKNOWN/precaution |
| T19 | Mencoba request riwayat user B | 403/404, tidak ada data bocor |
| T20 | Notifikasi layar terkunci default | Tidak mengekspos jadwal haid/masa subur |
| T21 | Saat offline catat haid, online lagi | Data sinkron sekali tanpa duplikasi |
| T22 | User menghapus akun | Data primer/salinan ditangani sesuai kebijakan penghapusan; tidak tersisa akses publik |
| T23 | Copy UI status | Tidak mengandung "100% aman" / "risiko nol" |

## O. Roadmap Antigravity — bertahap, verifikasi tiap fase
**Sprint 0 — Audit & Foundation:** audit direktori/repo; `AGENTS.md`; rencana implementasi; batas API/web; setup Vite+Tailwind dan PHP 8.3 API; migrations, tests, `.env.example`, secure deployment, Git initial commit. Jika repo sudah ada jangan hapus fitur.

**Sprint 1 — UI dan Period Tracker:** onboarding guest, input awal/akhir haid, flek, edit/hapus, kalender interaktif, statistik dasar, date/timezone tests, mobile responsive.

**Sprint 2 — Engine Prediksi:** estimasi haid, variabilitas, ovulasi edukatif, masa subur perkiraan, copy risiko. Sediakan fixture yang sama untuk UI dan server.

**Sprint 3 — Mode SDM:** eligibility, informed acknowledgment, status `UNKNOWN` saat riwayat minim/tidak teratur, 8–19 precaution, di luar itu `LOWER_CHANCE_NOT_ZERO`, audit bahasa medis dan regression tests.

**Sprint 4 — Offline PWA & Privasi:** manifest, service worker, IndexedDB protection, antre sinkron bila akun, pengingat in-app dan web push bila platform mendukung, ekspor/hapus data, audit auth/API.

**Sprint 5 — Hybrid Android:** Capacitor dengan static assets `apps/web/dist`, pengaturan API HTTPS, permission flow, local notifications opsional, Android emulator/real-device tests, hasil APK/AAB jika lingkungan build tersedia. Jangan mengemas situs remote PHP sebagai UI utama.

**Sprint 6 — Hybrid iOS & Release Gate:** iOS melalui macOS/Xcode ketika tersedia; test offline/online, safe-area, status bar, privacy, update; audit keamanan, peninjauan ahli kesehatan reproduksi, telaah regulasi sebelum klaim kontrasepsi.

**Phase 2:** catatan BBT, lendir serviks, LH untuk journaling tanpa klaim "aman", kecuali ada protokol tervalidasi dan pemeriksaan klinis.

**Catatan eksekusi Antigravity:** lakukan fase satu per satu secara otonom untuk perubahan yang reversible dan sudah jelas; lakukan verifikasi dan tulis ringkasan perubahan per fase. Jangan menghapus/mereset database, push produksi atau menerbitkan app store tanpa instruksi dan persetujuan eksplisit.

## P. Definition of done
- Kode dapat dideploy, migrations dan rollback tersedia.
- Tidak ada error fatal atau data corruption pada test matrix.
- Unit test service tanggal & SDM lulus 100% untuk skenario tertulis.
- API authorization/CSRF/XSS/injection/rate-limit diuji.
- Semua pengaturan privasi, ekspor, dan hapus berfungsi.
- Sumber edukasi medis tersedia langsung dari halaman status.
- Review medis & kepatuhan privasi disetujui sebelum aplikasi dipasarkan sebagai alat perencanaan keluarga untuk menghindari kehamilan.

## Q. Instruksi Antigravity IDE
Gunakan `AGENTS.md` di root sebagai aturan workspace, dan `PROMPT_ANTIGRAVITY_HAIDKU.md` sebagai prompt eksekusi. Buka folder project HaidKu di Antigravity IDE, lalu tempelkan prompt fase pertama di agent.

**Awal tugas:** baca seluruh dokumen `docs/`, audit repo, tulis `IMPLEMENTATION_PLAN.md` dengan status milestone, lalu bangun Foundation + Sprint 1 secara aman. Setelah tiap sprint: test, lint/build, audit keamanan dan copy medis, screenshot UI bila browser agent tersedia, dan laporkan file yang berubah.

**Aturan mutlak:** tidak boleh menyebut "hari aman 100%", "bebas risiko", "tidak mungkin hamil", memberikan probabilitas harian tanpa validasi, atau menjadikan perkiraan ovulasi dasar menentukan hari berhubungan tanpa perlindungan. Mode SDM harus terpisah dan fallback selalu `UNKNOWN` bila tidak memenuhi syarat.

## R. Referensi dan catatan validasi
1. Centers for Disease Control and Prevention (CDC), *Standard Days Method* (2024): https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html
2. CDC, *Appendix F: Classifications for Fertility Awareness-Based Methods* (2024): https://www.cdc.gov/contraception/hcp/usmec/fertility-awareness-based-methods.html
3. American College of Obstetricians and Gynecologists (ACOG), *Fertility Awareness-Based Methods of Family Planning*: https://www.acog.org/womens-health/faqs/fertility-awareness-based-methods-of-family-planning
4. National Health Service (NHS), *Natural family planning*: https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/
5. World Health Organization (WHO), *Selected Practice Recommendations for Contraceptive Use*: https://www.ncbi.nlm.nih.gov/books/NBK619444/
6. UU Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, Pasal 4: https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/crc32/

**Catatan:** Perhitungan dalam PRD ini adalah spesifikasi produk berbasis referensi publik, bukan hasil uji klinis terhadap HaidKu. Semua klaim efek kontrasepsi, kepatuhan terhadap regulasi Indonesia, dan aturan untuk kondisi khusus harus ditinjau lebih lanjut oleh profesional terkait sebelum peluncuran.


## S. Acceptance criteria lintas platform tambahan
- **T24** PWA dibuka offline setelah pertama kali di-cache: calendar dan catat periode berfungsi tanpa mengirim data ke server.
- **T25** User guest dapat tetap memakai aplikasi offline; seluruh tombol pemicu sinkronisasi menampilkan pilihan akun/consent, bukan login wajib.
- **T26** Perubahan tanggal haid di dua perangkat saat sync tidak dapat menimpa diam-diam; tampilkan konflik aman dan resolusi eksplisit.
- **T27** Simulasi retry jaringan mengirim mutation id sama: server idempotent, tidak ada catatan ganda.
- **T28** Browser menolak izin notification: inbox pengingat tetap bisa diakses; tidak ada klaim notifikasi dijamin.
- **T29** Lock screen notification secara default tidak menyebut haid, kesuburan, seks, atau riwayat reproduksi.
- **T30** Web/PWA dan Android hybrid memakai komponen visual dan aturan klinis yang sama serta hasil fixtures sama.
- **T31** Android airplane mode: catat, edit, dan statistik dasar jalan; saat online data sinkron sesuai opsi pengguna.
- **T32** Fresh account login pada shared device tidak membocorkan cache/database pengguna sebelumnya.
- **T33** Tanggal saat zona waktu bergeser (misal WIB ke WITA): tanggal haid tidak bergeser hari akibat konversi UTC.
- **T34** API mengembalikan 401/403 untuk data orang lain; CORS allowlist dan cookie auth aman; tidak ada token statis di JS bundle.
- **T35** `method_version` usang pada state offline tidak boleh menampilkan status berpeluang rendah setelah aturan klinis berubah tanpa re-evaluasi.
- **T36** App native mengemas aset frontend lokal (tidak bergantung me-load seluruh UI remote) dan server PHP tidak ada di bundle.
- **T37** Rilis publik tidak menyatakan keefektifan alat kontrasepsi sebelum klaim, klinisi dan regulasi dievaluasi.
