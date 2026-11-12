-- Jalankan di SQL Editor Supabase sebelum memakai input English pada berita dan galeri.
alter table public.news
  add column if not exists title_en text check (char_length(title_en) <= 150),
  add column if not exists excerpt_en text check (char_length(excerpt_en) <= 300),
  add column if not exists body_en text,
  add column if not exists cover_alt_en text check (char_length(cover_alt_en) <= 200);

alter table public.albums
  add column if not exists title_en text check (char_length(title_en) <= 150),
  add column if not exists description_en text;

alter table public.album_photos
  add column if not exists alt_en text check (char_length(alt_en) <= 200),
  add column if not exists caption_en text;
