-- Versify — public avatars bucket
--
-- Apply via Supabase SQL Editor (new query, paste, Run). Idempotent.
-- Each user can upload to <user_id>/<filename>; reads are public so the
-- avatar_url stored in public.users resolves directly.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5 * 1024 * 1024,                          -- 5 MB cap
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Object policies: scope writes to a folder named after the caller's uid.
drop policy if exists "avatars_read_all"     on storage.objects;
drop policy if exists "avatars_insert_self"  on storage.objects;
drop policy if exists "avatars_update_self"  on storage.objects;
drop policy if exists "avatars_delete_self"  on storage.objects;

create policy "avatars_read_all"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_self"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update_self"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete_self"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
