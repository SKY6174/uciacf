begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select has_table('public', 'committees', 'committees table exists');
select has_table('public', 'committee_compositions', 'committee compositions table exists');
select has_table('public', 'committee_composition_members', 'composition member history table exists');
select has_table('public', 'committee_members', 'committee_members table exists');
select has_table('public', 'committee_documents', 'committee_documents table exists');
select has_table('public', 'committee_reviews', 'committee_reviews table exists');
select has_table('public', 'committee_signatures', 'committee_signatures table exists');
select has_function('public', 'authenticate_committee_member', array['text','text','text','text','timestamp with time zone'], 'member authentication RPC exists');
select ok((select not public from storage.buckets where id = 'meeting_docs'), 'meeting_docs bucket is private');
select is((select file_size_limit from storage.buckets where id = 'meeting_docs'), 20971520::bigint, 'meeting_docs enforces 20MB limit');
select ok((select 'application/pdf' = any(allowed_mime_types) from storage.buckets where id = 'meeting_docs'), 'meeting_docs allows PDF');
insert into public.committees(id, code, name, committee_type)
values ('00000000-0000-0000-0000-000000000001', 'TEST-COM', '테스트 위원회', '기타');
select throws_ok(
$$insert into public.committee_documents(committee_id,title,original_name,storage_path,mime_type,size_bytes,sha256)
    values ('00000000-0000-0000-0000-000000000001','bad','bad.exe','bad','application/octet-stream',10,repeat('a',64))$$,
  '23514', null, 'non-PDF document metadata is rejected'
);

select * from finish();
rollback;
