# Woodri — Gifts from Nature

Situs Woodri multi halaman dengan HTML, CSS, dan JavaScript vanilla, dipublikasikan sebagai situs statis GitHub Pages. Data konten dan prospek memakai Supabase.

## Menyiapkan backend Supabase

1. Buka **SQL Editor** pada proyek `uhxcvecdkrcgdvbztuxi` dan jalankan ulang `supabase/schema.sql`. Skema ini membuat bucket foto, aturan akses admin, dan fungsi pengelolaan admin.
2. Di **Authentication → Providers**, aktifkan Email. Di **Authentication → Users → Add user → Create new user**, buat `adminwoodri@gmail.com` dengan kata sandi awal `Admin123` (centang konfirmasi email jika tersedia). Kredensial ini tidak disimpan di source code.
3. Jadikan akun tersebut admin dengan SQL berikut:

   ```sql
   insert into public.admin_users(user_id)
   select id from auth.users where email = 'adminwoodri@gmail.com'
   on conflict do nothing;
   ```

4. Pastikan URL yang dipakai admin terdaftar pada Authentication → URL Configuration → Redirect URLs. Karena login email/kata sandi tidak memakai magic link, tidak perlu URL redirect tambahan.
5. URL proyek dan publishable key browser sudah ditaruh di `supabase-config.js`. Publishable key memang ditujukan untuk browser; jangan pernah memasukkan `service_role` key ke repository. RLS pada schema membatasi perubahan konten dan akses prospek kepada admin yang terdaftar.

### Mengaktifkan unggah gambar dan tambah admin dari panel

1. Pasang Supabase CLI dan autentikasi dengan akun pemilik proyek.
2. Deploy Edge Function pembuat admin: `supabase functions deploy create-admin-user --project-ref uhxcvecdkrcgdvbztuxi`.
3. Atur secret `SUPABASE_SERVICE_ROLE_KEY` pada Edge Function melalui Supabase Dashboard → Edge Functions → Secrets. Ambil nilainya dari Project Settings → API Keys. Jangan masukkan service-role key ke file website atau Git.
4. Masuk ke `/Woodri/admin/tim/` untuk membuat akun admin tambahan. Gunakan kata sandi awal minimal 12 karakter; admin baru dapat menggantinya setelah masuk.

Bucket `woodri-media` membatasi foto sampai 10 MB dan hanya admin terverifikasi yang dapat mengunggah. Foto publik ditampilkan melalui URL dari Supabase Storage.

## Menjalankan lokal

Jalankan `python3 -m http.server 8000`, lalu buka `http://localhost:8000`. Pastikan schema sudah dijalankan agar halaman dapat membaca dan menulis data.

## Publikasi GitHub Pages

Workflow `.github/workflows/pages.yml` membangun deployment dari branch `main` setiap ada push. Di repository GitHub, buka **Settings → Pages** dan pilih **GitHub Actions** sebagai source. Setelah itu halaman hasil deployment tersedia di `https://campusinnovate.github.io/Woodri/`. Halaman juga tersedia melalui URL bersih seperti `/Woodri/home/`, `/Woodri/katalog/`, dan `/Woodri/admin/`.

## Admin

Buka `/Woodri/admin/` (atau `/admin/` pada domain utama), lalu masuk menggunakan akun yang dibuat di Supabase dan yang `user_id`-nya terdaftar pada `admin_users`. Panel admin dipisah ke halaman fitur seperti `/Woodri/admin/kontak/`, `/Woodri/admin/katalog/`, `/Woodri/admin/banner/`, dan `/Woodri/admin/tim/`. Panel dapat mengelola deskripsi produk, foto, banner lebar beranda, slider hero, voucher, prospek, dan konten lainnya. Admin dapat mengganti kata sandi dari bagian **Keamanan akun** setelah login. Produk tidak menampilkan harga; detail bahan dan spesifikasi dapat dimasukkan pada form katalog.

Pastikan teks persetujuan pemrosesan data pelanggan, kebijakan privasi, materi blog, spesifikasi produk, dan promo sudah ditinjau Woodri sebelum operasional publik.

## Login Google SSO untuk admin

Panel admin menyediakan tombol Google SSO lewat Supabase Auth, dengan login email/kata sandi sebagai cadangan. Untuk mengaktifkan SSO, aktifkan provider Google pada **Authentication → Sign In / Providers** di Supabase, masukkan OAuth Client ID/Secret dari Google Cloud, dan tambahkan URL callback Supabase yang ditampilkan pada pengaturan provider. Tambahkan juga URL admin Pages (`https://campusinnovate.github.io/Woodri/admin/`) pada **Authentication → URL Configuration → Redirect URLs**. Pengguna Google tetap perlu ditambahkan ke tabel `admin_users` agar panel terbuka.
