-- Versify — public audio bucket for poem narrations.
--
-- Apply via Supabase SQL Editor (new query, paste, Run). Idempotent.
-- Each user can upload to <user_id>/<filename>; reads are public so the
-- audio_url stored on the poem resolves directly without signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audio',
  'audio',
  true,
  25 * 1024 * 1024,                          -- 25 MB cap
  array[
    'audio/webm', 'audio/mp4', 'audio/mpeg',
    'audio/ogg',  'audio/wav', 'audio/aac', 'audio/x-m4a'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Object policies: scope writes to a folder named after the caller uid.
drop policy if exists "audio_read_all"     on storage.objects;
drop policy if exists "audio_insert_self"  on storage.objects;
drop policy if exists "audio_update_self"  on storage.objects;
drop policy if exists "audio_delete_self"  on storage.objects;

create policy "audio_read_all"
  on storage.objects for select
  using (bucket_id = 'audio');

create policy "audio_insert_self"
  on storage.objects for insert
  with check (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "audio_update_self"
  on storage.objects for update
  using (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "audio_delete_self"
  on storage.objects for delete
  using (
    bucket_id = 'audio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
