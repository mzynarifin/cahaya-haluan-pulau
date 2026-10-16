-- Jalankan sekali di Supabase SQL Editor untuk proyek yang sudah memakai schema.sql.
drop policy if exists "Admins delete albums" on public.albums;
create policy "Admins delete albums" on public.albums
  for delete to authenticated using (public.is_admin());
