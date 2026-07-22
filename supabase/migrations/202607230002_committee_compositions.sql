-- Separate long-lived committee compositions from individual operating sessions.
create table if not exists public.committee_compositions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{2,32}$'),
  name text not null check (char_length(name) between 2 and 160),
  committee_type text not null check (committee_type in ('운영위원회','심의위원회','평가위원회','선정위원회','기타')),
  owner_org_id uuid,
  term_start date not null,
  term_end date not null,
  status text not null default 'active' check (status in ('draft','active','closed')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (term_end >= term_start)
);

create table if not exists public.committee_composition_members (
  id uuid primary key default gen_random_uuid(),
  composition_id uuid not null references public.committee_compositions(id) on delete restrict,
  member_code text not null check (member_code ~ '^[A-Z0-9_-]{2,32}$'),
  name text not null check (char_length(name) between 1 and 80),
  email text,
  role text not null check (role in ('chair','member','secretary')),
  valid_from date not null,
  valid_to date,
  status text not null default 'active' check (status in ('active','replaced','inactive')),
  predecessor_id uuid references public.committee_composition_members(id) on delete restrict,
  appointment_reference text check (char_length(appointment_reference) <= 200),
  change_reason text check (char_length(change_reason) <= 500),
  created_at timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from),
  unique (composition_id, member_code, valid_from)
);

alter table public.committees
  add column if not exists composition_id uuid references public.committee_compositions(id) on delete restrict;
alter table public.committee_members
  add column if not exists composition_member_id uuid references public.committee_composition_members(id) on delete restrict;
alter table public.committee_audit_logs
  add column if not exists composition_id uuid references public.committee_compositions(id) on delete restrict;

create index if not exists committee_compositions_owner_idx
  on public.committee_compositions(created_by, status, term_end desc);
create index if not exists committee_composition_members_validity_idx
  on public.committee_composition_members(composition_id, valid_from, valid_to);
create index if not exists committees_composition_idx on public.committees(composition_id, meeting_at);
create index if not exists committee_members_composition_member_idx
  on public.committee_members(composition_member_id);
create index if not exists committee_audit_composition_idx
  on public.committee_audit_logs(composition_id, occurred_at desc);

create or replace function public.is_committee_composition_owner(target_composition_id uuid)
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.committee_compositions c
    where c.id = target_composition_id and c.created_by = auth.uid()
  );
$$;

create or replace function public.replace_committee_composition_member(
  p_composition_id uuid,
  p_previous_member_id uuid,
  p_member_code text,
  p_name text,
  p_email text,
  p_role text,
  p_effective_from date,
  p_appointment_reference text,
  p_change_reason text,
  p_actor_id uuid
)
returns uuid language plpgsql security definer
set search_path = public
as $$
declare
  v_previous public.committee_composition_members%rowtype;
  v_composition public.committee_compositions%rowtype;
  v_new_id uuid;
begin
  select * into v_composition from public.committee_compositions where id = p_composition_id;
  if not found then raise exception 'composition_not_found'; end if;

  select * into v_previous from public.committee_composition_members
  where id = p_previous_member_id and composition_id = p_composition_id and status = 'active'
  for update;
  if not found then raise exception 'active_member_not_found'; end if;
  if p_effective_from <= v_previous.valid_from or p_effective_from > v_composition.term_end then
    raise exception 'invalid_effective_date';
  end if;

  update public.committee_composition_members
  set valid_to = p_effective_from - 1, status = 'replaced', change_reason = nullif(trim(p_change_reason), '')
  where id = v_previous.id;

  insert into public.committee_composition_members(
    composition_id, member_code, name, email, role, valid_from, predecessor_id,
    appointment_reference, change_reason
  ) values (
    p_composition_id, upper(trim(p_member_code)), trim(p_name), nullif(trim(p_email), ''), p_role,
    p_effective_from, v_previous.id, nullif(trim(p_appointment_reference), ''), nullif(trim(p_change_reason), '')
  ) returning id into v_new_id;

  insert into public.committee_audit_logs(
    composition_id, actor_type, actor_id, action, entity_type, entity_id, details
  ) values (
    p_composition_id, 'admin', p_actor_id, 'composition.member.replace', 'committee_composition_member', v_new_id,
    jsonb_build_object('previousMemberId', v_previous.id, 'effectiveFrom', p_effective_from,
      'appointmentReference', nullif(trim(p_appointment_reference), ''))
  );
  return v_new_id;
end;
$$;

revoke all on function public.replace_committee_composition_member(uuid,uuid,text,text,text,text,date,text,text,uuid)
  from public, anon, authenticated;
grant execute on function public.replace_committee_composition_member(uuid,uuid,text,text,text,text,date,text,text,uuid)
  to service_role;

alter table public.committee_compositions enable row level security;
alter table public.committee_composition_members enable row level security;

create policy committee_compositions_owner_all on public.committee_compositions for all to authenticated
using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy committee_composition_members_owner_read on public.committee_composition_members for select to authenticated
using (public.is_committee_composition_owner(composition_id));

drop policy if exists committee_audit_owner_read on public.committee_audit_logs;
create policy committee_audit_owner_read on public.committee_audit_logs for select to authenticated
using (
  (committee_id is not null and public.is_committee_owner(committee_id)) or
  (composition_id is not null and public.is_committee_composition_owner(composition_id))
);

revoke insert, update, delete on public.committee_composition_members from anon, authenticated;
revoke insert, update, delete on public.committee_audit_logs from anon, authenticated;
