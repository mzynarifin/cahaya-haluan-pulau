# Cahaya Haluan Pulau

Website publik dan dashboard admin berbasis **Next.js 16.4.1**, App Router, TypeScript, Tailwind CSS 4, primitive shadcn/ui, dan Supabase. Versi Next.js dipilih dari rilis stabil saat implementasi dan dikunci di `package-lock.json`.

## Menjalankan lokal

1. Jalankan `npm ci`.
2. Salin `.env.example` ke `.env.local` lalu isi URL dan publishable key Supabase. File `.env.local` tidak masuk Git.
3. Jalankan `npm run dev`, lalu buka `http://localhost:3000`.
4. Jalankan `npm run typecheck` dan `npm run build` sebelum deploy.

Proyek ini memakai runtime Node.js untuk SSR, autentikasi, dan route handler media. Jangan mengekspor sebagai situs statis.

## Menyiapkan Supabase

Publishable key saja tidak dapat membuat tabel atau akun admin. Pemilik proyek perlu:

1. Pada proyek baru, jalankan [schema.sql](./supabase/schema.sql) **sekali** melalui Supabase SQL Editor. Tinjau kebijakan RLS sebelum menjalankannya pada proyek yang sudah berisi data. Jika tabel sudah tersedia tetapi bucket foto belum ada, jalankan [storage-buckets.sql](./supabase/storage-buckets.sql) saja.
2. Buat akun admin individual di Supabase Authentication. Jangan mengaktifkan pendaftaran admin publik.
3. Ambil UUID akun dari `auth.users`, lalu jalankan `insert into public.admin_users(user_id) values ('UUID-AKUN');` di SQL Editor. Ulangi untuk setiap admin yang disetujui.
4. Tambahkan `http://localhost:3000/admin/auth/callback` ke daftar URL redirect Auth untuk pengembangan. Tambahkan URL produksi yang benar sebelum peluncuran.
5. Atur `NEXT_PUBLIC_SITE_URL` ke domain produksi yang benar agar metadata dan sitemap tidak memakai localhost.

Untuk proyek Supabase yang sudah berjalan, jalankan [album-delete-policy.sql](./supabase/album-delete-policy.sql) sekali di SQL Editor agar tombol **Hapus** pada galeri admin dapat digunakan.

RLS melindungi tabel privat dan media draft. Mutasi status calon penghuni melalui fungsi `change_applicant_status` agar transisi dan riwayat tercatat bersama. Route `/api/admin/promote-media` memeriksa sesi dan peran admin sebelum menyalin foto draft ke bucket publik. Aplikasi tidak memakai service role key di browser.

## Konten yang harus dilengkapi pengurus

- Nomor WhatsApp resmi di **Admin → Kontak**. Sampai valid, tombol publik tidak membuka nomor contoh.
- Logo JPEG resmi beserta izin penggunaannya. Saat ini header memakai teks nama lembaga; tidak ada logo rekaan.
- Foto asli asrama, ruang, kegiatan, dan pengurus beserta izin publikasi.
- Alamat, biaya, fasilitas, persyaratan, sejarah, nama pengurus, dan informasi operasional lain yang sudah diverifikasi.
- Kebijakan privasi final, aturan retensi data calon penghuni, backup/restore, dan rencana hosting.

## Cakupan dan batas verifikasi

Halaman publik, berita, galeri, kontak, sitemap, login/pemulihan, CMS, unggahan, serta pencatatan calon penghuni sudah tersedia dalam kode. Konten draft tidak diambil oleh halaman publik. Editor berita menggunakan format terbatas yang dirender sebagai elemen React; HTML bebas tidak dijalankan.

Proyek Supabase yang diberikan belum mempunyai tabel `site_sections` ketika dicek, sehingga alur simpan, login admin, unggahan, dan UAT end-to-end belum dapat dibuktikan. Uji aksesibilitas manual, browser lintas perangkat, optimasi foto/EXIF, backup, serta penerimaan konten oleh pengurus tetap diperlukan sebelum rilis. Jangan mengelola data calon penghuni nyata sebelum kebijakan retensi dan pemulihan disetujui.
