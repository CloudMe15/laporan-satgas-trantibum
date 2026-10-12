# SiLAHAPP & PESUT — Satpol PP Kab. Indragiri Hulu

Sistem informasi pelaporan harian piket/patroli Trantibum (**SiLAHAPP**) dan pelaporan surat tugas (**PESUT**) pada Satuan Polisi Pamong Praja Kabupaten Indragiri Hulu.

---

## Fitur Sistem

- **SiLAHAPP**: Formulir pelaporan patroli Trantibum terstruktur (tanggal, dasar pelaksanaan, multi-lokasi patroli, poin hasil kegiatan, uraian teknis, daftar/foto personil, dan dokumentasi foto lapangan).
- **PESUT (Pelaporan Surat Tugas)**: Modul pelaporan surat tugas dinas terintegrasi dengan emblem resmi PESUT.
- **Pratinjau Dokumen A4 Real-Time**: Standar tata naskah dinas A4 dengan kop resmi Pemerintah Kabupaten Indragiri Hulu dan Satpol PP.
- **Export Dokumen PDF**: Kompilasi dokumen PDF resolusi tinggi berbasis client-side rendering via `html2pdf.js`.
- **Integrasi Cloud Storage**: Sinkronisasi dokumen digital ke Google Drive resmi Satpol PP Indragiri Hulu melalui dual-mode upload (API Proxy & Direct Endpoint).
- **Manajemen Profil Aparatur**: Konfigurasi identitas aparatur pelapor (Nama, NIP 18-digit, Jabatan) berbasis penyimpanan lokal browser (`localStorage`) dengan logo kedinasan resmi terintegrasi permanen.
- **Pusat Layanan Bantuan**: Integrasi kanal komunikasi Customer Service dinas via WhatsApp.

---

## Struktur Direktori

```text
laporan-satgas-trantibum/
├── index.html          # Antarmuka utama aplikasi
├── app.js              # Logika aplikasi, pengendali alur, dan render dokumen
├── style.css           # Lembar gaya (Glassmorphism & tata letak cetak dokumen A4)
├── logo-inhu.png       # Lambang Pemerintah Kabupaten Indragiri Hulu
├── logo-satpol.png     # Lambang Satuan Polisi Pamong Praja
├── logo-pesut.png      # Lambang Emblem PESUT Satpol PP Indragiri Hulu
├── api/
│   └── upload.js       # Serverless function upload proxy
├── vercel.json         # Konfigurasi deployment & fungsi Vercel
├── package.json        # Konfigurasi dependensi proyek
└── README.md           # Dokumentasi teknis sistem
```

---

## Konfigurasi Deployment

Sistem dirancang dengan arsitektur web mandiri yang mendukung deployment multi-platform:

### 1. GitHub Pages
1. Navigasi ke menu **Settings** → **Pages** pada repositori GitHub.
2. Pada opsi **Build and deployment** > **Source**, tentukan **Deploy from a branch**.
3. Pilih branch `main` (atau `master`) dengan folder `/ (root)`.
4. Simpan perubahan. Sistem beroperasi secara statis dengan fallback direct endpoint otomatis ke Google Apps Script.

### 2. Vercel
1. Hubungkan repositori pada dashboard Vercel.
2. Pilih framework preset **Other**.
3. Jalankan proses **Deploy**. Endpoint proxy serverless `/api/upload` akan diaktifkan secara otomatis.

---

## Lisensi & Hak Cipta
Hak Cipta © 2026 Bagian Program Satuan Polisi Pamong Praja Kabupaten Indragiri Hulu. Seluruh hak cipta dilindungi undang-undang.
