# Kebun Refugia Magetan - Agrowisata Taman Bunga & Panel Admin

Website Resmi Agrowisata **Kebun Refugia Magetan**, dikelola oleh **Dinas TPHP Kabupaten Magetan**. Menampilkan keindahan hamparan taman bunga di kaki Gunung Lawu, informasi fasilitas, pemesanan tiket, lokasi, FAQ, serta **Panel Admin** terpadu.

---

## 🚀 Fitur Utama Website

### Halaman Pengunjung (Public Site)
- **Beranda (`index.html`)**: Banner hero interaktif, statistik kebun, narasi pesona alam, & galeri modal video Instagram.
- **Fasilitas & Kuliner (`fasilitas.html`)**: Slider foto spot wisata (Taman Kelinci, Playground, Masjid Ki Mageti) & modal detail lapak kuliner/souvenir.
- **Pemesanan Tiket (`pemesanan.html`)**: Rincian tarif tiket masuk anak/dewasa, tarif parkir, dan unduh kode e-pembayaran **QRIS**.
- **Lokasi & Rute (`lokasi.html`)**: Peta Google Maps interaktif & petunjuk rute perjalanan.
- **Kontak & Lapak (`kontak.html`)**: Direktori lapak petani & tombol hubungi Admin via WhatsApp.
- **FAQ & Saran (`faq.html`)**: Accordion interaktif pertanyaan umum & form kirim pesan.

### Panel Admin Pengelola (`admin/`)
- **Login Admin (`admin/login.html`)**: Sistem otentikasi admin aman bertema Kebun Refugia.
- **Dashboard Summary (`admin/index.html`)**: Ringkasan statistik pengunjung, estimasi omzet tiket, fasilitas aktif, & pesan masuk.
- **Manajemen Tarif Tiket & Parkir**: Editor harga tiket & parkir real-time (tersinkronisasi dengan LocalStorage).
- **Manajemen Fasilitas & Lapak**: Tambah, ubah, dan hapus data fasilitas kebun.
- **Manajemen FAQ**: Pengaturan daftar pertanyaan & jawaban publik.
- **Kotak Masuk**: Daftar kritik/saran pengunjung & opsi balasan WhatsApp langsung.
- **Pengaturan Jam Operasional**: Pengontrol informasi kontak & jam buka.

---

## 📂 Struktur Folder Proyek

```text
refugia/
├── admin/
│   ├── index.html        # Dashboard Admin Utama
│   ├── login.html        # Halaman Login Admin (Default: admin / admin123)
│   ├── admin.css         # Styling khusus Panel Admin
│   └── admin.js          # Logika interaktif & state management Admin
├── assets/
│   ├── css/
│   │   ├── index.css     # Stylesheet utama & modal gallery
│   │   ├── fasilitas.css # Stylesheet slider & lapak
│   │   ├── pemesanan.css # Stylesheet tarif & QRIS
│   │   ├── faq.css       # Stylesheet accordion FAQ
│   │   ├── kontak.css    # Stylesheet kontak
│   │   └── lokasi.css    # Stylesheet peta
│   ├── js/
│   │   ├── main.js       # Navbar responsif & modal video global
│   │   ├── fasilitas.js  # Slider interaktif fasilitas
│   │   ├── faq.js        # Toggle FAQ accordion
│   │   └── kontak.js     # Modal kontak lapak
│   └── img/              # Aset gambar & video MP4 teroptimasi
├── index.html            # Halaman Utama (Beranda)
├── fasilitas.html        # Halaman Fasilitas
├── pemesanan.html        # Halaman Tiket & QRIS
├── lokasi.html           # Halaman Peta Lokasi
├── kontak.html           # Halaman Kontak & Lapak
├── faq.html              # Halaman FAQ
├── vercel.json           # Konfigurasi Deployment Vercel (Clean URLs & Security Headers)
└── README.md             # Dokumentasi Resmi Proyek
```

---

## 🛠️ Teknologi yang Digunakan

- **HTML5 & CSS3 (Vanilla)**: Menggunakan variabel warna tailored (`--g1: #1B4D1A`, `--gold: #E8A020`).
- **JavaScript (ES6+)**: Tanpa ketergantungan library luar (Zero Dependencies).
- **Vercel Hosting**: Deployment otomatis dengan *Clean URLs*, *Security Headers*, dan *Edge CDN*.
- **Google Fonts**: *Playfair Display*, *Nunito*, dan *Dancing Script*.

---

## 💻 Cara Menjalankan Lokal

Menggunakan PHP Server bawaan:
```bash
php -S 0.0.0.0:8000
```
Buka di browser: `http://localhost:8000`  
Akses Panel Admin: `http://localhost:8000/admin/login.html` (Akun: `admin` / `admin123`).

---

## 🌐 Production Deployment

- **Website Utama:** [https://kebunrefugiamagetan.vercel.app](https://kebunrefugiamagetan.vercel.app)
- **Panel Admin Online:** [https://kebunrefugiamagetan.vercel.app/admin/login.html](https://kebunrefugiamagetan.vercel.app/admin/login.html)
