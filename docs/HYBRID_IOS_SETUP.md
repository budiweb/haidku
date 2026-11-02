# PANDUAN INTEGRASI HYBRID IOS & XCODE — HAIDKU
**Tagline:** *Kenali Siklusmu, Pahami Tubuhmu*  
**Bundle ID:** `id.haidku.app`  
**Framework:** Capacitor Hybrid (iOS Target `ios/App`)

---

## 1. Arsitektur Frontend Tunggal
Aplikasi HaidKu dibangun menggunakan satu codebase frontend di `apps/web`:
- **Web App / PWA:** Disajikan langsung oleh web server atau Service Worker lokal.
- **Android:** Memuat `dist/` lokal melalui WebView Capacitor (`android/app/src/main/assets/public/`).
- **iOS:** Memuat `dist/` lokal melalui WKWebView Capacitor (`ios/App/App/public/`).

> [!IMPORTANT]
> Backend REST API PHP 8.3 berada di server HTTPS terpisah dan **TIDAK** dibundel ke dalam package aplikasi native iOS atau Android. Ketika offline, aplikasi berjalan mandiri menggunakan IndexedDB lokal dan antrean mutasi sinkronisasi yang tersimpan di perangkat.

---

## 2. Status Lingkungan Pengembangan
Sesuai panduan `TEST_CASES_HAIDKU.md`:
- **Status di Lingkungan Windows:** `NOT TESTED (Windows environment)`.
- **Alasan Teknis:** Kompilasi native iOS (Xcodebuild, CocoaPods, Clang/Swift compiler, dan iOS Simulator) membutuhkan sistem operasi **macOS** dengan **Xcode 15+**.
- Proyek Xcode `ios/App/App.xcworkspace` telah di-scaffold lengkap dan disinkronkan dengan build web (`npx cap sync ios`), siap dibuka di macOS kapan saja.

---

## 3. Langkah-Langkah Build di macOS / Xcode

### Prasyarat
1. macOS Sonoma 14 atau lebih baru.
2. Xcode 15.0+ terpasang dari Mac App Store.
3. Node.js LTS (v20+) dan npm.
4. CocoaPods (`sudo gem install cocoapods`) bila diperlukan plugin native tambahan.

### Langkah Eksekusi Step-by-Step
```bash
# 1. Masuk ke direktori web
cd apps/web

# 2. Build aset frontend produksi
npm run build

# 3. Sinkronkan aset web ke target iOS Capacitor
npx cap sync ios

# 4. Buka proyek di Xcode
npx cap open ios
# Atau buka manual: open ios/App/App.xcworkspace
```

### Konfigurasi di Xcode
1. **Signing & Capabilities:**
   - Pilih target `App`.
   - Pada tab *Signing & Capabilities*, centang *Automatically manage signing*.
   - Pilih *Development Team* Apple Developer akun Anda.
   - Pastikan *Bundle Identifier* sesuai: `id.haidku.app`.
2. **Deployment Target:**
   - Minimum iOS version: **iOS 14.0** atau lebih baru.
3. **Pemeriksaan Safe Area & Status Bar:**
   - HaidKu telah menyertakan CSS rule `viewport-fit=cover` dan utility padding safe-area (`env(safe-area-inset-top)` dan `env(safe-area-inset-bottom)`) untuk menghindari benturan dengan *Dynamic Island* atau *Notch*.

### Menjalankan Pengujian di Simulator / Perangkat
1. Pilih simulator (contoh: *iPhone 15 Pro* atau *iPhone 16*).
2. Tekan tombol **Play / Run** (`Cmd + R`).
3. **Uji Skenario Kunci:**
   - **Offline Mode:** Aktifkan Airplane Mode pada simulator/perangkat. Pastikan pencatatan haid, kalender, dan statistik tetap dapat digunakan 100% tanpa jaringan.
   - **Notifikasi Layar Kunci (Privasi T20 & T29):** Izinkan notifikasi. Pastikan notifikasi default hanya menampilkan `"Pengingat HaidKu"` tanpa membocorkan istilah reproduksi atau tanggal haid ke layar kunci.
   - **Bottom Navigation:** Pastikan tap target berukuran minimal 44x44 pt dan mudah dijangkau dengan satu tangan.

---

## 4. Kebijakan Distribusi & App Store
- Dilarang mempublikasikan atau submit ke Apple App Store tanpa mandat dan persetujuan eksplisit dari pemilik produk.
- Semua klaim terkait Standard Days Method (SDM) dan pencegahan kehamilan harus melalui peninjauan klinis dan regulasi medis sebelum promosi publik.

