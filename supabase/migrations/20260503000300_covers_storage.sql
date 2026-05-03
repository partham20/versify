-- Versify — public covers bucket for poem backdrop images.
--
-- Apply via Supabase SQL Editor (new query, paste, Run). Idempotent.
-- Each user can upload to <user_id>/<filename>; reads are public so the
-- cover_url stored on the poem resolves directly without signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers',
  'covers',
  true,
  10 * 1024 * 1024,                          -- 10 MB cap
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Object policies: scope writes to a folder named after the caller uid.
drop policy if exists "covers_read_all"     on storage.objects;
drop policy if exists "covers_insert_self"  on storage.objects;
drop policy if exists "covers_update_self"  on storage.objects;
drop policy if exists "covers_delete_self"  on storage.objects;

create policy "covers_read_all"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "covers_insert_self"
  on storage.objects for insert
  with check (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "covers_update_self"
  on storage.objects for update
  using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "covers_delete_self"
  on storage.objects for delete
  using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
