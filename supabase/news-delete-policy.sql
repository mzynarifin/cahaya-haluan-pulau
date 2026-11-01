-- Jalankan sekali di Supabase SQL Editor untuk proyek yang sudah memakai schema.sql.
drop policy if exists "Admins delete news" on public.news;
create policy "Admins delete news" on public.news
  for delete to authenticated using (public.is_admin());
