# Woodri — Gifts from Nature

Situs Woodri multi halaman dengan HTML, CSS, dan JavaScript vanilla, dipublikasikan sebagai situs statis GitHub Pages. Data konten dan prospek memakai Supabase.

## Menyiapkan backend Supabase

1. Buka **SQL Editor** pada proyek `uhxcvecdkrcgdvbztuxi` dan jalankan `supabase/schema.sql` satu kali.
2. Di **Authentication → Providers**, aktifkan Email. Buat akun staf di **Authentication → Users**.
3. Jadikan akun tersebut admin dengan SQL (ganti alamat email):

   ```sql
   insert into public.admin_users(user_id)
   select id from auth.users where email = 'admin@woodri.id'
   on conflict do nothing;
   ```

4. Pastikan URL yang dipakai admin terdaftar pada Authentication → URL Configuration → Redirect URLs. Karena login email/kata sandi tidak memakai magic link, tidak perlu URL redirect tambahan.
5. URL proyek dan publishable key browser sudah ditaruh di `supabase-config.js`. Publishable key memang ditujukan untuk browser; jangan pernah memasukkan `service_role` key ke repository. RLS pada schema membatasi perubahan konten dan akses prospek kepada admin yang terdaftar.

## Menjalankan lokal

Jalankan `python3 -m http.server 8000`, lalu buka `http://localhost:8000`. Pastikan schema sudah dijalankan agar halaman dapat membaca dan menulis data.

## Publikasi GitHub Pages

Workflow `.github/workflows/pages.yml` membangun deployment dari branch `main` setiap ada push. Di repository GitHub, buka **Settings → Pages** dan pilih **GitHub Actions** sebagai source. Setelah itu halaman hasil deployment tersedia di `https://campusinnovate.github.io/Woodri/`.

## Admin

Buka `/admin.html`, lalu masuk menggunakan akun yang dibuat di Supabase dan yang `user_id`-nya terdaftar pada `admin_users`. Panel dapat melihat prospek, mengelola produk, testimoni, logo kolaborasi, artikel, banner, voucher, dan copy halaman. Produk tidak menampilkan harga; detail bahan dan spesifikasi dapat dimasukkan pada form katalog.

Pastikan teks persetujuan pemrosesan data pelanggan, kebijakan privasi, materi blog, spesifikasi produk, dan promo sudah ditinjau Woodri sebelum operasional publik.

## Login Google SSO untuk admin

Panel admin menyediakan tombol Google SSO lewat Supabase Auth, dengan login email/kata sandi sebagai cadangan. Untuk mengaktifkan SSO, aktifkan provider Google pada **Authentication → Sign In / Providers** di Supabase, masukkan OAuth Client ID/Secret dari Google Cloud, dan tambahkan URL callback Supabase yang ditampilkan pada pengaturan provider. Tambahkan juga URL admin Pages (`https://campusinnovate.github.io/Woodri/admin.html`) pada **Authentication → URL Configuration → Redirect URLs**. Pengguna Google tetap perlu ditambahkan ke tabel `admin_users` agar panel terbuka.
