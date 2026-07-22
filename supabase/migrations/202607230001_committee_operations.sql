-- Committee operations MVP. Development/staging only until the operational gate is approved.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{4,32}$'),
  name text not null check (char_length(name) between 2 and 160),
  committee_type text not null check (committee_type in ('운영위원회','심의위원회','평가위원회','선정위원회','기타')),
  owner_org_id uuid,
  description text,
  meeting_at timestamptz,
  status text not null default 'draft' check (status in ('draft','open','closed','reported')),
  security_notice text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete restrict,
  member_code text not null check (member_code ~ '^[A-Z0-9_-]{2,32}$'),
  name text not null check (char_length(name) between 1 and 80),
  email text,
  role text not null check (role in ('chair','member','secretary')),
  access_code_hash text not null,
  status text not null default 'active' check (status in ('active','locked','inactive')),
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  unique (committee_id, member_code)
);

create table if not exists public.committee_agendas (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete restrict,
  agenda_no integer not null check (agenda_no > 0),
  title text not null check (char_length(title) between 2 and 200),
  description text,
  decision_type text not null default 'vote' check (decision_type in ('vote','review','report')),
  status text not null default 'draft' check (status in ('draft','open','closed')),
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  unique (committee_id, agenda_no)
);

create table if not exists public.committee_documents (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete restrict,
  agenda_id uuid references public.committee_agendas(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 200),
  original_name text not null,
  document_kind text not null default 'agenda' check (document_kind in ('agenda','reference','report')),
  bucket_id text not null default 'meeting_docs' check (bucket_id = 'meeting_docs'),
  storage_path text not null unique,
  mime_type text not null check (mime_type = 'application/pdf'),
  size_bytes bigint not null check (size_bytes between 5 and 20971520),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  version integer not null default 1 check (version > 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.committee_member_sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.committee_members(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.committee_document_reads (
  document_id uuid not null references public.committee_documents(id) on delete restrict,
  member_id uuid not null references public.committee_members(id) on delete restrict,
  first_opened_at timestamptz not null default now(),
  last_opened_at timestamptz not null default now(),
  open_count integer not null default 1 check (open_count > 0),
  primary key (document_id, member_id)
);

create table if not exists public.committee_reviews (
  id uuid primary key default gen_random_uuid(),
  agenda_id uuid not null references public.committee_agendas(id) on delete restrict,
  member_id uuid not null references public.committee_members(id) on delete restrict,
  decision text not null check (decision in ('approve','reject','abstain')),
  comment text check (char_length(comment) <= 4000),
  status text not null default 'draft' check (status in ('draft','submitted')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agenda_id, member_id)
);

create table if not exists public.committee_signatures (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete restrict,
  member_id uuid not null references public.committee_members(id) on delete restrict,
  signer_name text not null,
  consent_version text not null default 'committee-sign-v1',
  review_snapshot jsonb not null,
  ip_hash text,
  user_agent_hash text,
  signed_at timestamptz not null default now(),
  unique (committee_id, member_id)
);

create table if not exists public.committee_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete restrict,
  provider text not null,
  model text not null,
  prompt_version text not null,
  input_digest text not null,
  summary jsonb not null,
  evidence jsonb not null,
  status text not null default 'generated' check (status in ('generated','reviewed','approved','rejected')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.committee_reports (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete restrict,
  document_id uuid not null references public.committee_documents(id) on delete restrict,
  version integer not null check (version > 0),
  snapshot jsonb not null,
  generated_by uuid references auth.users(id),
  generated_at timestamptz not null default now(),
  unique (committee_id, version)
);

create table if not exists public.committee_audit_logs (
  id bigint generated always as identity primary key,
  committee_id uuid references public.committees(id) on delete restrict,
  actor_type text not null check (actor_type in ('admin','member','system')),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists committee_members_committee_idx on public.committee_members(committee_id);
create index if not exists committee_agendas_committee_idx on public.committee_agendas(committee_id, agenda_no);
create index if not exists committee_documents_committee_idx on public.committee_documents(committee_id, agenda_id);
create index if not exists committee_sessions_member_idx on public.committee_member_sessions(member_id, expires_at);
create index if not exists committee_reviews_member_idx on public.committee_reviews(member_id, status);
create index if not exists committee_audit_committee_idx on public.committee_audit_logs(committee_id, occurred_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meeting_docs', 'meeting_docs', false, 20971520, array['application/pdf'])
on conflict (id) do update
set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_committee_owner(target_committee_id uuid)
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.committees c
    where c.id = target_committee_id and c.created_by = auth.uid()
  );
$$;

create or replace function public.authenticate_committee_member(
  p_committee_code text,
  p_member_code text,
  p_access_code text,
  p_token_hash text,
  p_expires_at timestamptz
)
returns table(session_id uuid, member_id uuid, committee_id uuid, member_name text, committee_name text)
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_member public.committee_members%rowtype;
  v_committee public.committees%rowtype;
  v_session_id uuid;
begin
  select c.* into v_committee from public.committees c
  where c.code = upper(trim(p_committee_code)) and c.status = 'open';
  if not found then return; end if;

  select m.* into v_member from public.committee_members m
  where m.committee_id = v_committee.id
    and m.member_code = upper(trim(p_member_code))
    and m.status = 'active'
    and (m.locked_until is null or m.locked_until < now());
  if not found then return; end if;

  if extensions.crypt(p_access_code, v_member.access_code_hash) <> v_member.access_code_hash then
    update public.committee_members
      set failed_attempts = failed_attempts + 1,
          locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
      where id = v_member.id;
    return;
  end if;

  update public.committee_members set failed_attempts = 0, locked_until = null, last_login_at = now()
  where id = v_member.id;
  insert into public.committee_member_sessions(member_id, token_hash, expires_at)
  values (v_member.id, p_token_hash, least(p_expires_at, now() + interval '12 hours'))
  returning id into v_session_id;
  insert into public.committee_audit_logs(committee_id, actor_type, actor_id, action, entity_type, entity_id)
  values (v_committee.id, 'member', v_member.id, 'member.login', 'committee_member', v_member.id);
  return query select v_session_id, v_member.id, v_committee.id, v_member.name, v_committee.name;
end;
$$;

create or replace function public.set_committee_member_access_code(
  p_committee_id uuid, p_member_code text, p_name text, p_email text, p_role text, p_access_code text
)
returns uuid language plpgsql security definer
set search_path = public, extensions
as $$
declare v_id uuid;
begin
  if char_length(p_access_code) < 8 then raise exception 'access_code_too_short'; end if;
  insert into public.committee_members(committee_id, member_code, name, email, role, access_code_hash)
  values (p_committee_id, upper(trim(p_member_code)), trim(p_name), nullif(trim(p_email), ''), p_role,
    extensions.crypt(p_access_code, extensions.gen_salt('bf', 10)))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.authenticate_committee_member(text,text,text,text,timestamptz) from public;
grant execute on function public.authenticate_committee_member(text,text,text,text,timestamptz) to anon, authenticated, service_role;
revoke all on function public.set_committee_member_access_code(uuid,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.set_committee_member_access_code(uuid,text,text,text,text,text) to service_role;

alter table public.committees enable row level security;
alter table public.committee_members enable row level security;
alter table public.committee_agendas enable row level security;
alter table public.committee_documents enable row level security;
alter table public.committee_member_sessions enable row level security;
alter table public.committee_document_reads enable row level security;
alter table public.committee_reviews enable row level security;
alter table public.committee_signatures enable row level security;
alter table public.committee_analysis_runs enable row level security;
alter table public.committee_reports enable row level security;
alter table public.committee_audit_logs enable row level security;

drop policy if exists committees_owner_all on public.committees;
drop policy if exists committee_members_owner_read on public.committee_members;
drop policy if exists committee_agendas_owner_all on public.committee_agendas;
drop policy if exists committee_documents_owner_read on public.committee_documents;
drop policy if exists committee_reviews_owner_read on public.committee_reviews;
drop policy if exists committee_signatures_owner_read on public.committee_signatures;
drop policy if exists committee_analysis_owner_read on public.committee_analysis_runs;
drop policy if exists committee_reports_owner_read on public.committee_reports;
drop policy if exists committee_audit_owner_read on public.committee_audit_logs;
create policy committees_owner_all on public.committees for all to authenticated
using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy committee_members_owner_read on public.committee_members for select to authenticated
using (public.is_committee_owner(committee_id));
create policy committee_agendas_owner_all on public.committee_agendas for all to authenticated
using (public.is_committee_owner(committee_id)) with check (public.is_committee_owner(committee_id));
create policy committee_documents_owner_read on public.committee_documents for select to authenticated
using (public.is_committee_owner(committee_id));
create policy committee_reviews_owner_read on public.committee_reviews for select to authenticated
using (exists(select 1 from public.committee_agendas a where a.id = agenda_id and public.is_committee_owner(a.committee_id)));
create policy committee_signatures_owner_read on public.committee_signatures for select to authenticated
using (public.is_committee_owner(committee_id));
create policy committee_analysis_owner_read on public.committee_analysis_runs for select to authenticated
using (public.is_committee_owner(committee_id));
create policy committee_reports_owner_read on public.committee_reports for select to authenticated
using (public.is_committee_owner(committee_id));
create policy committee_audit_owner_read on public.committee_audit_logs for select to authenticated
using (public.is_committee_owner(committee_id));

drop policy if exists meeting_docs_owner_insert on storage.objects;
drop policy if exists meeting_docs_owner_select on storage.objects;
create policy meeting_docs_owner_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'meeting_docs' and exists (
    select 1 from public.committees c
    where c.id::text = split_part(name, '/', 1) and c.created_by = auth.uid()
  )
);
create policy meeting_docs_owner_select on storage.objects for select to authenticated
using (
  bucket_id = 'meeting_docs' and exists (
    select 1 from public.committees c
    where c.id::text = split_part(name, '/', 1) and c.created_by = auth.uid()
  )
);

revoke insert, update, delete on public.committee_audit_logs from anon, authenticated;
