# Woodri — Gifts from Nature

Situs statis multi-halaman untuk Woodri, dibuat dengan HTML, CSS, dan JavaScript vanilla.

## Jalankan lokal

Buka `index.html` di browser, atau jalankan static server seperti `python3 -m http.server 8000` lalu kunjungi `http://localhost:8000`.

## Terbitkan dengan GitHub Pages

1. Push isi repository ke branch `main`.
2. Di GitHub, buka **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu proses deployment selesai. URL akan ditampilkan di halaman Pages.

Semua halaman berada di root repository agar dapat dilayani langsung oleh GitHub Pages. Custom domain dan DNS belum diatur.

## Catatan prototipe

Halaman Admin menyimpan katalog, banner, voucher, artikel, testimoni, logo, dan prospek di `localStorage` browser, sehingga data hanya tersedia pada browser yang sama. Untuk penggunaan produksi, sambungkan ke backend dan autentikasi. Detail katalog di situs saat ini perlu dikonfirmasi Woodri sebelum dianggap spesifikasi final.
