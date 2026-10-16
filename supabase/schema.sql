-- Jalankan di SQL Editor proyek Supabase setelah meninjau kebijakan akses.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
drop policy if exists "Admins can read own role" on public.admin_users;
create policy "Admins can read own role" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.bump_version() returns trigger language plpgsql as $$
begin new.version := old.version + 1; new.updated_at := now(); return new; end;
$$;

create table if not exists public.site_sections (
  key text primary key check (key in ('profile','accommodation','team','contact')),
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
insert into public.site_sections(key) values ('profile'),('accommodation'),('team'),('contact') on conflict do nothing;
create trigger site_sections_version before update on public.site_sections for each row execute function public.bump_version();
create or replace function public.validate_site_section() returns trigger language plpgsql as $$
begin
  if new.key = 'contact' then
    if coalesce(new.content->>'whatsapp','') <> '' and (new.content->>'whatsapp') !~ '^62[1-9][0-9]{7,12}$' then
      raise exception 'invalid_whatsapp' using errcode = '22023';
    end if;
    if coalesce(new.content->>'mapUrl','') <> '' and (new.content->>'mapUrl') !~ '^https://(www\.)?google\.com/maps/embed\?' then
      raise exception 'invalid_map_url' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;
create trigger site_section_validation before update on public.site_sections for each row execute function public.validate_site_section();
alter table public.site_sections enable row level security;
create policy "Public sections readable" on public.site_sections for select to anon, authenticated using (true);
create policy "Admins edit sections" on public.site_sections for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 5 and 150),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 160),
  excerpt text check (char_length(excerpt) <= 300),
  body text not null check (char_length(trim(body)) > 0),
  cover_path text,
  cover_url text,
  cover_alt text check (char_length(cover_alt) <= 200),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint news_publish_complete check (status <> 'published' or (excerpt is not null and char_length(trim(excerpt)) > 0 and cover_url is not null and cover_alt is not null and char_length(trim(cover_alt)) > 0))
);
create trigger news_version before update on public.news for each row execute function public.bump_version();
alter table public.news enable row level security;
create policy "Published news readable" on public.news for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins insert news" on public.news for insert to authenticated with check (public.is_admin());
create policy "Admins update news" on public.news for update to authenticated using (public.is_admin()) with check (public.is_admin());
create index if not exists news_published_at on public.news(published_at desc) where status = 'published';

create or replace function public.set_news_audit() returns trigger language plpgsql as $$
begin
  new.updated_by := auth.uid();
  if tg_op = 'INSERT' then
    new.published_at := case when new.status = 'published' then now() else null end;
  else
    if old.status = 'published' and new.slug is distinct from old.slug then
      raise exception 'published_slug_locked' using errcode = '22023';
    end if;
    if old.status = 'archived' and new.status = 'published' then
      raise exception 'restore_to_draft_first' using errcode = '22023';
    end if;
    new.published_at := case when new.status = 'published' and old.published_at is null then now() else old.published_at end;
  end if;
  return new;
end;
$$;
create trigger news_audit before insert or update on public.news for each row execute function public.set_news_audit();

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 150),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  event_date date,
  cover_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint album_publish_cover check (status <> 'published' or cover_url is not null)
);
create trigger albums_version before update on public.albums for each row execute function public.bump_version();
create or replace function public.check_album_publish() returns trigger language plpgsql as $$
begin
  if new.status = 'published' and (new.cover_url is null or not exists(select 1 from public.album_photos where album_id = new.id and image_url is not null)) then
    raise exception 'album_requires_photo_and_cover' using errcode = '22023';
  end if;
  return new;
end;
$$;
create trigger album_publish_check before update on public.albums for each row execute function public.check_album_publish();
alter table public.albums enable row level security;
create policy "Published albums readable" on public.albums for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins insert albums" on public.albums for insert to authenticated with check (public.is_admin());
create policy "Admins update albums" on public.albums for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  image_url text,
  storage_path text,
  alt text not null check (char_length(alt) between 1 and 200),
  caption text,
  display_order integer not null default 0
);
alter table public.album_photos enable row level security;
create policy "Published album photos readable" on public.album_photos for select to anon, authenticated using (public.is_admin() or (image_url is not null and exists(select 1 from public.albums where id = album_id and status = 'published')));
create policy "Admins insert photos" on public.album_photos for insert to authenticated with check (public.is_admin());
create policy "Admins update photos" on public.album_photos for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete photos" on public.album_photos for delete to authenticated using (public.is_admin());

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  whatsapp text not null check (whatsapp ~ '^62[1-9][0-9]{7,12}$'),
  origin text not null check (char_length(origin) between 1 and 120),
  target_campus text check (char_length(target_campus) <= 150),
  entry_year integer not null check (entry_year between 2020 and 2100),
  status text not null default 'Baru' check (status in ('Baru','Dihubungi','Diproses','Diterima','Ditolak','Mengundurkan diri')),
  internal_notes text check (char_length(internal_notes) <= 2000),
  consent_recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);
create trigger applicants_version before update on public.applicants for each row execute function public.bump_version();
create or replace function public.protect_applicant_audit() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.id := gen_random_uuid();
    new.status := 'Baru';
    new.version := 1;
    new.consent_recorded_at := now();
    new.created_at := now();
    new.updated_at := now();
  else
    new.consent_recorded_at := old.consent_recorded_at;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;
create trigger applicant_audit before insert or update on public.applicants for each row execute function public.protect_applicant_audit();
create or replace function public.protect_applicant_status() returns trigger language plpgsql as $$
begin
  if old.status is distinct from new.status and current_setting('app.status_change_allowed', true) is distinct from 'yes' then
    raise exception 'use_change_applicant_status' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger applicant_status_guard before update on public.applicants for each row execute function public.protect_applicant_status();
alter table public.applicants enable row level security;
create policy "Admins read applicants" on public.applicants for select to authenticated using (public.is_admin());
create policy "Admins insert applicants" on public.applicants for insert to authenticated with check (public.is_admin() and status = 'Baru');
create policy "Admins update applicants" on public.applicants for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.applicant_status_history (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  from_status text not null,
  to_status text not null,
  reason text,
  changed_at timestamptz not null default now(),
  changed_by uuid not null references auth.users(id)
);
alter table public.applicant_status_history enable row level security;
create policy "Admins read status history" on public.applicant_status_history for select to authenticated using (public.is_admin());

create or replace function public.change_applicant_status(p_id uuid,p_expected_version integer,p_to text,p_reason text default null)
returns public.applicants language plpgsql security definer set search_path = public as $$
declare current_row public.applicants; next_row public.applicants; permitted boolean;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into current_row from public.applicants where id = p_id for update;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  if current_row.version <> p_expected_version then raise exception 'version_conflict' using errcode = '40001'; end if;
  if current_row.status = p_to then return current_row; end if;
  permitted := case current_row.status
    when 'Baru' then p_to in ('Dihubungi','Mengundurkan diri')
    when 'Dihubungi' then p_to in ('Diproses','Mengundurkan diri')
    when 'Diproses' then p_to in ('Diterima','Ditolak','Mengundurkan diri')
    when 'Diterima' then p_to in ('Diproses','Mengundurkan diri')
    when 'Ditolak' then p_to = 'Diproses'
    when 'Mengundurkan diri' then p_to = 'Diproses'
    else false end;
  if not permitted then raise exception 'invalid_transition' using errcode = '22023'; end if;
  if (p_to = 'Ditolak' or (p_to = 'Diproses' and current_row.status in ('Diterima','Ditolak','Mengundurkan diri'))) and nullif(trim(p_reason),'') is null then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  perform set_config('app.status_change_allowed','yes',true);
  update public.applicants set status = p_to where id = p_id returning * into next_row;
  perform set_config('app.status_change_allowed','',true);
  insert into public.applicant_status_history(applicant_id,from_status,to_status,reason,changed_by)
    values (p_id,current_row.status,p_to,nullif(trim(p_reason),''),auth.uid());
  return next_row;
end;
$$;
revoke all on function public.change_applicant_status(uuid,integer,text,text) from public;
grant execute on function public.change_applicant_status(uuid,integer,text,text) to authenticated;

create or replace function public.delete_applicant(p_id uuid,p_expected_name text) returns void
language plpgsql security definer set search_path = public as $$
declare person public.applicants;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into person from public.applicants where id = p_id for update;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  if person.full_name <> p_expected_name then raise exception 'name_mismatch' using errcode = '22023'; end if;
  delete from public.applicants where id = p_id;
end;
$$;
revoke all on function public.delete_applicant(uuid,text) from public;
grant execute on function public.delete_applicant(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('draft-media','draft-media',false,5242880,array['image/jpeg','image/png','image/webp']),
       ('public-media','public-media',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "Admins read draft media" on storage.objects for select to authenticated using (bucket_id = 'draft-media' and public.is_admin());
create policy "Admins upload draft media" on storage.objects for insert to authenticated with check (bucket_id = 'draft-media' and public.is_admin());
create policy "Admins remove draft media" on storage.objects for delete to authenticated using (bucket_id = 'draft-media' and public.is_admin());
create policy "Public reads published media" on storage.objects for select to anon, authenticated using (bucket_id = 'public-media');
create policy "Admins upload public media" on storage.objects for insert to authenticated with check (bucket_id = 'public-media' and public.is_admin());
create policy "Admins remove public media" on storage.objects for delete to authenticated using (bucket_id = 'public-media' and public.is_admin());

-- Buat akun lewat Supabase Authentication, lalu jalankan sebagai pemilik proyek:
-- insert into public.admin_users(user_id) values ('UUID-AKUN-DARI-AUTH-USERS');
