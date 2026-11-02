# HaidKu — Konsep Produk

**Versi:** 1.1 — PWA + Hybrid, khusus Antigravity IDE  
**Tanggal:** 2 November 2026  
**Status:** Draft produk; aturan pencegahan kehamilan memerlukan peninjauan klinis sebelum peluncuran publik.

## 1. Visi
HaidKu adalah aplikasi mobile-first dengan **satu frontend PWA** yang dapat dikemas sebagai **aplikasi hybrid Android/iOS** berbahasa Indonesia untuk mencatat menstruasi, mempelajari keteraturan siklus, memperkirakan menstruasi berikutnya dan ovulasi, serta membantu pengguna memahami hari-hari ketika peluang kehamilan relatif lebih rendah atau lebih tinggi. Aplikasi mengedepankan privasi, transparansi tingkat kepastian, dan edukasi berbasis rujukan medis.

**Janji produk:** "Kenali siklusmu, pahami masa suburmu."  
**Bukan janji produk:** "Menentukan hari aman 100% untuk seks tanpa kontrasepsi" atau "mencegah kehamilan hanya dengan aplikasi".

## 2. Sasaran pengguna
- Wanita yang ingin membuat catatan haid dan gejala secara rutin.
- Wanita yang ingin memahami perubahan pola siklus dan perkiraan masa subur.
- Pasangan yang sedang merencanakan kehamilan.
- Wanita yang berupaya menghindari kehamilan menggunakan pemahaman kesuburan alami, dengan pemahaman keterbatasan dan risiko metode.
- Pengguna dengan siklus tidak teratur tetap dapat mencatat haid, tetapi **tidak** diberikan status "peluang lebih rendah" berbasis Standard Days Method (SDM) jika syarat tidak terpenuhi.

## 3. Positioning produk
**Nama:** HaidKu  
**Tagline:** "Kenali Siklusmu, Pahami Tubuhmu."  
**Platform awal:** PWA mobile-first; tahap lanjutan: aplikasi hybrid Android/iOS dengan Capacitor menggunakan frontend yang sama.  
**Bahasa awal:** Indonesia.  
**Model bisnis:** gratis untuk fitur inti; premium opsional untuk analisis tren lebih dalam, ekspor lanjutan, dan laporan visual, *bukan* menjual label hari aman atau kepastian medis.

## 4. Dua lapisan perhitungan (wajib terpisah)
### A. Prediksi siklus (informasi kesehatan)
- Durasi menstruasi historis dan rata-rata panjang siklus.
- Prediksi tanggal haid berikutnya, dengan rentang ketidakpastian.
- Estimasi ovulasi dan jendela subur **sebagai perkiraan**, tidak diklaim terkonfirmasi.

### B. Panduan kesuburan untuk menghindari kehamilan
- **Mode Edukasi SDM**, hanya berlaku jika kriteria siklus terpenuhi dan pengguna secara eksplisit memilihnya.
- Untuk siklus 26–32 hari, hari ke-8 sampai 19 ditampilkan sebagai **"hindari hubungan tanpa perlindungan jika tidak ingin hamil"**.
- Hari ke-1 sampai 7 dan hari ke-20 sampai akhir siklus yang memenuhi kriteria ditampilkan sebagai **"peluang lebih rendah, tetap ada risiko kehamilan"**, bukan "aman".
- Bila kriteria tidak terpenuhi/riwayat tidak cukup/menstruasi terlambat/kondisi medis terkait, tampilkan **"prediksi tidak andal"** dan sarankan pilihan perlindungan yang lebih andal.
- FABM adalah metode kontrasepsi nonhormonal. "Tanpa alat/hormon" tidak berarti "tanpa metode kontrasepsi".

**Acuan CDC 2024:** sekitar 13 kehamilan dari 100 pengguna Standard Days Method dalam 1 tahun penggunaan biasa. Angka ini **risiko tahunan**, bukan peluang hubungan seksual pada satu hari tertentu.

## 5. Fitur MVP
| Kode | Fitur | Manfaat |
|---|---|---|
| F01 | Onboarding & tujuan | Pilih pantau haid / program hamil / menghindari kehamilan |
| F02 | Catat tanggal mulai-akhir haid | Data utama pengguna |
| F03 | Edit/hapus/konfirmasi pencatatan | Memperbaiki kesalahan catatan |
| F04 | Kalender siklus | Riwayat dan estimasi masa mendatang |
| F05 | Rata-rata siklus dan tren | Memahami pola serta variasi |
| F06 | Prediksi haid dan ovulasi | Perencanaan pribadi dengan tanda ketidakpastian |
| F07 | Mode Edukasi SDM | Memberi kategori peluang kehamilan berdasarkan kriteria valid |
| F08 | Pengingat privat | Menstruasi dan periode yang perlu perhatian |
| F09 | Gejala menstruasi | Nyeri, volume perdarahan, mood (opsional) |
| F10 | Kontrol data dan privasi | Ekspor, hapus akun/data, kunci aplikasi |
| F11 | Edukasi kesehatan | Penjelasan metode, kegagalan, dan kapan mencari bantuan |
| F12 | Ringkasan harian | Satu pesan yang jelas dengan status dan keterbatasan |

## 6. Terminologi UI yang harus dijaga
**Boleh:** "Perkiraan masa subur", "Ovulasi diperkirakan", "Peluang kehamilan lebih rendah, tidak nol", "Tidak dapat diperkirakan", "Hindari hubungan tanpa perlindungan jika ingin mencegah kehamilan".

**Dilarang:** "Hari aman", "Pasti tidak hamil", "Bebas kontrasepsi", "Risiko 0%", "Ovulasi telah terjadi" jika hanya mengandalkan kalender, atau probabilitas kehamilan per hari tanpa model tervalidasi.

## 7. Gambaran desain
- Visual: bersih, feminin tetapi tidak stereotip, latar netral, aksen coral/rose dan teal.
- Kalender: jangan hanya mengandalkan warna; gunakan ikon, teks, dan legenda aksesibel.
- Beranda: status siklus saat ini, tombol **Catat Haid**, prediksi berikutnya, dan satu kartu penting tentang keterbatasan estimasi.
- Privasi: teks notifikasi default netral: "Ada pengingat HaidKu"; rincian hanya setelah membuka aplikasi.

### Contoh pesan status
- **Mode pantau:** "Perkiraan masa subur 10–16 November. Ini bukan konfirmasi ovulasi."
- **Mode hindari hamil, hari 10:** "Periode kesuburan menurut Standard Days Method. Bila tidak ingin hamil, hindari hubungan tanpa perlindungan."
- **Mode hindari hamil, hari 23:** "Peluang kehamilan relatif lebih rendah menurut Standard Days Method, tetapi tidak nol."
- **Siklus tidak teratur:** "Siklus tidak memenuhi kriteria metode kalender. Aplikasi tidak dapat menyatakan hari berpeluang rendah secara andal."

## 8. Peta jalan
1. **MVP:** pencatatan haid, kalkulasi siklus, kalender, pemberitahuan, mode edukasi SDM dan privasi.
2. **V1.1:** data lendir serviks, suhu basal, hasil tes LH; **pencatatan saja**, tidak mengotomatiskan klaim infertilitas.
3. **V2:** protokol kesuburan berbasis tanda tubuh yang ditinjau klinisi/pakar metode, pelatihan pengguna, integrasi penilaian pengecualian, laporan konsultasi.
4. **V3:** integrasi platform kesehatan bila relevan, opsi akun keluarga hanya dengan persetujuan eksplisit dan akses revocable.

## 9. Kriteria peluncuran
- Semua logika hari ke-1, perubahan siklus, zona waktu, spotting, haid terlambat, siklus tidak teratur, dan override kondisi pengecualian lulus tes.
- Tidak ada halaman, push notification, atau materi pemasaran yang mengklaim hari aman 100%.
- Konsultan kesehatan reproduksi meninjau copy dan algoritma.
- Kebijakan perlindungan data pribadi diterapkan dan diuji.

## 10. Sumber medis dan hukum
1. CDC, *Standard Days Method* (2024): https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html
2. ACOG, *Fertility Awareness-Based Methods of Family Planning*: https://www.acog.org/womens-health/faqs/fertility-awareness-based-methods-of-family-planning
3. CDC, *Medical Eligibility Criteria: Fertility Awareness-Based Methods* (2024): https://www.cdc.gov/contraception/hcp/usmec/fertility-awareness-based-methods.html
4. NHS, *Natural family planning*: https://www.nhs.uk/contraception/methods-of-contraception/natural-family-planning/
5. UU RI No. 27 Tahun 2022 (PDP), Pasal 4: https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/crc32/


## 11. Strategi platform PWA + Hybrid (pembaruan 1.1)
- **Satu basis frontend** HTML/CSS/JavaScript modular + Vite + Tailwind yang dibangun menjadi aset statis. PWA dipasang lewat browser dan tidak memerlukan Play Store.
- **Hybrid Android/iOS** memakai Capacitor untuk membungkus aset frontend yang sama, bukan memuat seluruh halaman PHP dari web dengan WebView jarak jauh. Akses fitur native melalui adapter terpisah dan plugin resmi yang cocok.
- **Backend** PHP 8.3 Native + MySQL sebagai REST API di HTTPS. PHP dijalankan di server, **tidak di dalam APK/IPA**.
- **Offline-first**: pengguna tamu dapat mencatat dan meninjau kalender tanpa koneksi; sinkronisasi lintas perangkat hanya jika pengguna memilih akun dan mengizinkannya.
- **Notifikasi**: reminder in-app tersedia di semua platform. Push PWA dan notifikasi native hanya bila izin dan kemampuan platform tersedia; jangan mengklaim jaminan notifikasi tepat waktu pada PWA ketika aplikasi tertutup.
- **Privasi**: catatan reproduksi tidak boleh dikirim ke analytics/SDK iklan; default notifikasi netral; minimalkan data; sediakan ekspor, penghapusan, kunci aplikasi bila feasible dan proteksi data lokal.
- **Sasaran UX**: ringan, tampilan kalender elegan, bottom navigation mobile, input haid dalam 2–3 interaksi, aksesibilitas dan tanpa dark pattern.

## 12. Identitas dan paket aplikasi
- Nama tampilan: **HaidKu**; tagline: **Kenali Siklusmu, Pahami Tubuhmu**.
- Nama paket kerja sementara (perlu diganti sebelum publikasi dan harus dimiliki): `id.haidku.app`.
- Warna utama: rose `#D96B8C`; sekunder teal `#238B78`; latar `#FAFAF9`.
- Gunakan identitas visual berupa kalender/bunga abstrak yang lembut, bukan janji "hari aman".
- Ketersediaan domain, merek, dan package identifier **belum diperiksa**.
