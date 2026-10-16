-- Perbaikan bila tabel aplikasi sudah ada tetapi bucket media belum tersedia.
-- Jalankan melalui Supabase SQL Editor dengan pemilik proyek.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('draft-media', 'draft-media', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('public-media', 'public-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Admins read draft media" on storage.objects;
create policy "Admins read draft media" on storage.objects for select to authenticated
  using (bucket_id = 'draft-media' and public.is_admin());

drop policy if exists "Admins upload draft media" on storage.objects;
create policy "Admins upload draft media" on storage.objects for insert to authenticated
  with check (bucket_id = 'draft-media' and public.is_admin());

drop policy if exists "Admins remove draft media" on storage.objects;
create policy "Admins remove draft media" on storage.objects for delete to authenticated
  using (bucket_id = 'draft-media' and public.is_admin());

drop policy if exists "Public reads published media" on storage.objects;
create policy "Public reads published media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-media');

drop policy if exists "Admins upload public media" on storage.objects;
create policy "Admins upload public media" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and public.is_admin());

drop policy if exists "Admins remove public media" on storage.objects;
create policy "Admins remove public media" on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and public.is_admin());
