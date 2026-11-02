# Paket Pengembangan HaidKu untuk Antigravity IDE

**Nama produk:** HaidKu  
**Tagline:** Kenali Siklusmu, Pahami Tubuhmu  
**Bentuk:** PWA terlebih dahulu, kemudian Hybrid Android/iOS via Capacitor.  
**Teknologi:** PHP 8.3 Native + MySQL 8 + Vite/JS + Tailwind + IndexedDB + PWA + Capacitor.

## Isi paket
- `PROJECT.md`: ringkasan proyek dan milestone.
- `AGENTS.md`: aturan agent workspace (dibaca Antigravity saat berada di root project).
- `KONSEP_HAIDKU.md`: positioning, fitur, batasan medis, UX.
- `PRD_HAIDKU.md`: kebutuhan lengkap, algoritma, user stories, endpoint, test, roadmap.
- `ARSITEKTUR_HAIDKU.md`: pola integrasi frontend PWA/Capacitor dan API PHP.
- `ERD_HAIDKU.md`: entitas DB server dan storage offline.
- `TEST_CASES_HAIDKU.md`: test checklist T01–T37.
- `PROMPT_ANTIGRAVITY_HAIDKU.md`: prompt utama dan prompt sprint.

## Pakai di Antigravity
1. Buat folder kosong untuk repo `haidku/` atau buka repo HaidKu yang sudah ada.
2. Taruh `AGENTS.md` dan `PROJECT.md` di **root repo**. Buat subfolder `docs/`, lalu salin seluruh file `.md` lainnya ke dalam `docs/` kecuali README yang berada di root.
3. Buka folder repo sebagai workspace di Antigravity IDE. Buat percakapan Agent baru; tempel isi bagian **Prompt utama** dari `docs/PROMPT_ANTIGRAVITY_HAIDKU.md`.
4. Agent harus audit repo, menulis `IMPLEMENTATION_PLAN.md`, lalu mengerjakan Sprint 0–1 secara nyata.
5. Lanjutkan prompt per sprint jika dibutuhkan. Audit hasil tes/browser sebelum produksi.

**Catatan ZIP:** paket ZIP ini menyimpan file langsung pada struktur yang disarankan (`AGENTS.md`, `PROJECT.md`, dan `README.md` di root, dokumen lain di `docs/`) sehingga bisa diekstrak ke folder proyek.

## Peringatan medis
Metode kalender tidak dapat menentukan "hari aman" berhubungan tanpa kontrasepsi. Mode SDM hanya memberi kategori peluang kehamilan relatif; hari 8–19 merupakan periode yang harus dihindari untuk seks tanpa perlindungan jika ingin mencegah hamil bagi pengguna dengan siklus yang memenuhi kriteria. Efektivitas tahunan SDM bukan probabilitas tanggal tertentu. Aplikasi belum divalidasi sebagai metode kontrasepsi.

## Rujukan
- CDC: https://www.cdc.gov/contraception/hcp/usspr/standard-days-method.html
- Capacitor: https://capacitorjs.com/docs
- Antigravity rules: https://antigravity.google/docs/rules/
