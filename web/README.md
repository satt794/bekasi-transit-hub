# Bekasi Transit — Web Frontend

Antarmuka web dashboard real-time untuk pemantauan jadwal KRL Commuter Line koridor Bekasi (Commuter Line Cikarang). Dibangun dengan **Next.js 16 (App Router)**, **TypeScript**, dan **Vanilla CSS Modules** dengan bahasa visual papan informasi stasiun (*transit signage*).

---

## 🚀 Fitur Frontend

1. **Papan Keberangkatan Dual-Arah**:
   - Memisahkan jadwal arah **Jakarta** (Manggarai, Kampung Bandan, Angke) dan arah **Cikarang** (Bekasi Timur, Tambun, Cibitung, Telagamurni).
   - Indikator hitung mundur (*countdown*) dengan warna urgensi interaktif (kedip saat `< 2 menit`).
2. **Hub Integrasi Antarmoda (Transjakarta & Trans Patriot)**:
   - Menampilkan halte transit terdekat dari peron stasiun aktif lengkap dengan estimasi jarak (meter) dan waktu jalan kaki (menit).
   - Tab **Di Stasiun Ini**: Daftar rute bus penghubung langsung di stasiun yang sedang dipilih.
   - Tab **Semua Rute Bekasi — Jakarta**: Rute BRT layang & jalan tol (B11 Summarecon-Tosari, B12 Summarecon-Tj. Priok, B21 Bekasi Timur-Grogol, B22 Bekasi Timur-Juanda, Koridor 11 Pulo Gebang-Kp. Melayu, dan Royaltrans).
   - Tab **Panduan Transfer**: Panduan fisik navigasi pindah moda seperti Skybridge Cakung lantai 2 (tanpa keluar jalan raya), Pintu Selatan Stasiun Bekasi, JPO Jatinegara, dan Terminal Terpadu Bekasi Timur.
   - **Modal Detail Rute Bus**: Timeline urutan seluruh halte/pemberhentian, tarif resmi, jam operasi, interval kedatangan bus (headway), dan stasiun KRL terhubung.
3. **Peta Jalur Koridor Interaktif**:
   - Peta strip visual stasiun: Kranji (KRI) → Bekasi (BKS) → Bekasi Timur (BKST) → Tambun (TB) → Cibitung (CIT) → Metland Telagamurni (TLM) → Cikarang (CKR).
   - Berfungsi sebagai navigasi ganti stasiun dengan sekali klik.
4. **Statistik Operasional & Grafik Kepadatan Jam**:
   - Total jadwal harian, frekuensi 60 menit ke depan, rata-rata *headway* (selang antar-kereta), dan jam operasional pertama/terakhir.
   - Grafik histogram distribusi jadwal per jam (WIB) dengan sorotan otomatis jam aktif saat ini dan jam sibuk.
5. **Perencana Perjalanan Kereta Langsung**:
   - Pencarian KA langsung dari stasiun asal ke tujuan (misal Bekasi ke Manggarai / Sudirman / Pasar Senen).
   - Menghitung waktu tempuh nyata dan hitung mundur keberangkatan.
6. **Modal Detail Rute Perjalanan KRL**:
   - Timeline pemberhentian stasiun (status: *passed*, *next*, *upcoming*) dengan penanda khusus stasiun Bekasi.
7. **Preferensi Tema Terang / Gelap**:
   - Mendukung mode Terang, Gelap, dan Mengikuti Sistem.
   - Dilengkapi skrip inline di `<head>` untuk **mencegah efek kedipan tema (*zero theme flash*)** sebelum hidrasi React.

---

## 🛠️ Instalasi & Menjalankan Lokal

Pastikan backend FastAPI sudah berjalan di `http://localhost:8000` (lihat dokumentasi di `../backend/` atau `../README.md`).

```bash
# Masuk ke folder web
cd web

# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Variabel Lingkungan

Buat file `.env.local` jika ingin mengarahkan Next.js ke URL backend lain (default: `http://localhost:8000`):

```bash
BACKEND_URL=http://localhost:8000
```

Request browser ke `/api/*` akan di-proxy secara transparan oleh Next.js via `rewrites` di `next.config.ts`, sehingga browser tidak terbentur masalah CORS.

---

## 📦 Build untuk Produksi

```bash
# Periksa tipe TypeScript
npx tsc --noEmit

# Jalankan ESLint
npm run lint

# Buat bundle produksi Next.js
npm run build

# Jalankan server produksi
npm run start
```
