-- Versify — demo data primitives
--
-- 1. seed_demo_user(...) — wraps auth.users insert + handle/avatar/bio set on
--    public.users. Idempotent on email. The handle_new_user trigger already
--    creates the public.users row; we then patch in avatar_url and bio.
-- 2. ensure_default_playlists(user_id) — creates the canonical 5 playlists
--    for a user if they do not exist yet, populated with up to N public poems.
-- 3. trigger that runs ensure_default_playlists() after a user is created.
--
-- Apply via Supabase SQL Editor. Idempotent — safe to re-run.

-- pgcrypto lives in the `extensions` schema on Supabase. We don't try to
-- recreate it; we just call its functions with the fully qualified path.
create extension if not exists pgcrypto with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- Stock-author bootstrap helper
-- ─────────────────────────────────────────────────────────────
create or replace function public.seed_demo_user(
  p_email        text,
  p_password     text,
  p_handle       text,
  p_display_name text,
  p_bio          text,
  p_avatar_url   text,
  p_verified     boolean default false
) returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  existing_id uuid;
  new_id      uuid;
begin
  select id into existing_id from auth.users where email = p_email;

  if existing_id is null then
    new_id := extensions.gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_id,
      'authenticated', 'authenticated',
      p_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name', p_display_name, 'handle', p_handle),
      now(), now(),
      '', '', '', ''
    );
    -- handle_new_user trigger has already inserted public.users with the
    -- handle and display_name from raw_user_meta_data. Patch the rest.
    update public.users
       set bio = p_bio,
           avatar_url = p_avatar_url,
           verified = p_verified
     where id = new_id;
    return new_id;
  end if;

  -- Already exists — keep avatar/bio in sync.
  update public.users
     set display_name = p_display_name,
         bio          = p_bio,
         avatar_url   = p_avatar_url,
         verified     = p_verified
   where id = existing_id;
  return existing_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Default playlists per user
-- ─────────────────────────────────────────────────────────────
create or replace function public.ensure_default_playlists(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pl_id          uuid;
  pl_name        text;
  pl_cover       text;
  pl_tag_filter  text[];
  pl_haiku_only  boolean;
  defaults       jsonb := '[
    {"name":"Rainy Day Sonnets",   "cover":"https://images.unsplash.com/photo-1438449805896-28a666819a20?w=400&q=80",  "tags":["Memory","Solitude","Nature","Rain"], "haiku":false},
    {"name":"Midnight Monologues", "cover":"https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=400&q=80",  "tags":["Night","Solitude","Urban"],          "haiku":false},
    {"name":"Classical Reimagined","cover":"https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80", "tags":["Abstract","Memory","Love"],          "haiku":false},
    {"name":"Urban Solitude",      "cover":"https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80",  "tags":["Urban","Solitude"],                  "haiku":false},
    {"name":"Haiku Pocket",        "cover":"https://images.unsplash.com/photo-1502209524164-acea936639a2?w=400&q=80",  "tags":["Haiku"],                             "haiku":true}
  ]'::jsonb;
  pl_def jsonb;
begin
  for pl_def in select * from jsonb_array_elements(defaults)
  loop
    pl_name       := pl_def->>'name';
    pl_cover      := pl_def->>'cover';
    pl_tag_filter := array(select jsonb_array_elements_text(pl_def->'tags'));
    pl_haiku_only := (pl_def->>'haiku')::boolean;

    -- Only create if the user does not already have a playlist with this name.
    select id into pl_id
      from public.playlists
     where owner_id = p_user_id and name = pl_name
     limit 1;

    if pl_id is null then
      insert into public.playlists (owner_id, name, cover_url, is_public)
      values (p_user_id, pl_name, pl_cover, true)
      returning id into pl_id;
    end if;

    -- Backfill items if empty. Pull poems whose tags overlap the playlist
    -- tag filter (haiku playlist gets only haiku-tagged poems).
    if not exists (select 1 from public.playlist_items where playlist_id = pl_id) then
      insert into public.playlist_items (playlist_id, poem_id, position)
      select pl_id, p.id,
             row_number() over (order by p.published_at desc nulls last)::int
        from public.poems p
       where p.visibility = 'public'
         and (
           pl_haiku_only and 'Haiku' = any(p.tags)
           or (not pl_haiku_only) and p.tags && pl_tag_filter
         )
       order by p.published_at desc nulls last
       limit 32
       on conflict do nothing;
    end if;
  end loop;
end;
$$;

-- Trigger so every new user gets the default playlists. Runs AFTER the
-- handle_new_user trigger has populated public.users.
create or replace function public.users_on_insert_default_playlists()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_default_playlists(new.id);
  return new;
end;
$$;

drop trigger if exists users_default_playlists_trg on public.users;
create trigger users_default_playlists_trg
  after insert on public.users
  for each row execute function public.users_on_insert_default_playlists();

-- ─────────────────────────────────────────────────────────────
-- Backfill: ensure all existing users have the default playlists.
-- Run this AFTER seeding poems so the playlist items pick something up.
-- ─────────────────────────────────────────────────────────────
create or replace function public.backfill_default_playlists()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
begin
  for uid in select id from public.users
  loop
    perform public.ensure_default_playlists(uid);
  end loop;
end;
$$;

grant execute on function public.seed_demo_user(text,text,text,text,text,text,boolean) to service_role;
grant execute on function public.ensure_default_playlists(uuid) to service_role, authenticated;
grant execute on function public.backfill_default_playlists() to service_role;
