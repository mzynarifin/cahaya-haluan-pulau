-- Apply this migration to existing Supabase projects so the detail page can
-- move applicants to any status shown in the admin status filter.
create or replace function public.change_applicant_status(p_id uuid,p_expected_version integer,p_to text,p_reason text default null)
returns public.applicants language plpgsql security definer set search_path = public as $$
declare current_row public.applicants; next_row public.applicants; permitted boolean;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into current_row from public.applicants where id = p_id for update;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  if current_row.version <> p_expected_version then raise exception 'version_conflict' using errcode = '40001'; end if;
  if current_row.status = p_to then return current_row; end if;
  permitted := coalesce(p_to in ('Baru','Dihubungi','Diproses','Diterima','Ditolak','Mengundurkan diri'), false);
  if not permitted then raise exception 'invalid_transition' using errcode = '22023'; end if;
  if (p_to = 'Ditolak' or (current_row.status in ('Diterima','Ditolak','Mengundurkan diri') and p_to in ('Baru','Dihubungi','Diproses'))) and nullif(trim(p_reason),'') is null then
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
