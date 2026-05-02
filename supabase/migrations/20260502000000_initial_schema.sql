-- Versify — initial schema
-- Tables, RLS, indexes, and triggers for the core read/write loop.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- users (mirrors auth.users with profile fields)
-- ─────────────────────────────────────────────────────────────
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        text unique not null check (handle ~ '^[a-z0-9_.]{2,32}$'),
  display_name  text not null,
  bio           text default '',
  avatar_url    text,
  verified      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- poems
-- ─────────────────────────────────────────────────────────────
create table public.poems (
  id                uuid primary key default gen_random_uuid(),
  author_id         uuid not null references public.users(id) on delete cascade,
  title             text not null,
  body              text[] not null,                 -- array of stanzas (each stanza joined by \n)
  tags              text[] not null default '{}',
  cover_url         text,
  audio_url         text,
  syllables         integer not null default 0,
  read_time_seconds integer not null default 0,
  visibility        text not null default 'public' check (visibility in ('public','followers','draft')),
  published_at      timestamptz,
  created_at        timestamptz not null default now()
);

create index poems_author_idx        on public.poems (author_id);
create index poems_published_idx     on public.poems (published_at desc nulls last);
create index poems_tags_idx          on public.poems using gin (tags);

-- array_to_string is STABLE (not IMMUTABLE) in modern Postgres, so we can't
-- use it directly inside an index expression. Wrap it in our own IMMUTABLE
-- helper that operates on text[] specifically.
create or replace function public.poem_search_text(p_title text, p_body text[])
returns text
language sql
immutable
as $$
  select coalesce(p_title, '') || ' ' || coalesce(array_to_string(p_body, ' '), '');
$$;

create index poems_search_idx on public.poems
  using gin (to_tsvector('english'::regconfig, public.poem_search_text(title, body)));

-- ─────────────────────────────────────────────────────────────
-- engagement
-- ─────────────────────────────────────────────────────────────
create table public.likes (
  user_id    uuid not null references public.users(id) on delete cascade,
  poem_id    uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);
create index likes_poem_idx on public.likes (poem_id);

create table public.bookmarks (
  user_id    uuid not null references public.users(id) on delete cascade,
  poem_id    uuid not null references public.poems(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, poem_id)
);

create table public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  followed_id uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index follows_followed_idx on public.follows (followed_id);

-- ─────────────────────────────────────────────────────────────
-- comments
-- ─────────────────────────────────────────────────────────────
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  poem_id    uuid not null references public.poems(id) on delete cascade,
  author_id  uuid not null references public.users(id) on delete cascade,
  parent_id  uuid references public.comments(id) on delete cascade,
  body       text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index comments_poem_idx   on public.comments (poem_id, created_at desc);
create index comments_parent_idx on public.comments (parent_id);

create table public.comment_likes (
  user_id    uuid not null references public.users(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

-- ─────────────────────────────────────────────────────────────
-- playlists
-- ─────────────────────────────────────────────────────────────
create table public.playlists (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.users(id) on delete cascade,
  name       text not null check (length(name) between 1 and 80),
  cover_url  text,
  is_public  boolean not null default true,
  created_at timestamptz not null default now()
);
create index playlists_owner_idx on public.playlists (owner_id);

create table public.playlist_items (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  poem_id     uuid not null references public.poems(id) on delete cascade,
  position    integer not null,
  primary key (playlist_id, poem_id)
);
create index playlist_items_pos_idx on public.playlist_items (playlist_id, position);

-- ─────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────
create table public.notifications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  type                text not null check (type in ('like','comment','follow','feature','mention')),
  actor_id            uuid references public.users(id) on delete set null,
  target_poem_id      uuid references public.poems(id) on delete cascade,
  target_comment_id   uuid references public.comments(id) on delete cascade,
  read                boolean not null default false,
  created_at          timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- auto-create public.users row on auth signup
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_handle text;
begin
  -- generate a handle from email local-part if not supplied
  new_handle := lower(regexp_replace(coalesce(
    new.raw_user_meta_data->>'handle',
    split_part(new.email, '@', 1)
  ), '[^a-z0-9_.]', '', 'g'));

  if length(new_handle) < 2 then
    new_handle := 'poet_' || substr(new.id::text, 1, 8);
  end if;

  -- ensure uniqueness by suffixing if necessary
  while exists (select 1 from public.users where handle = new_handle) loop
    new_handle := new_handle || substr(md5(random()::text), 1, 3);
  end loop;

  insert into public.users (id, handle, display_name)
  values (
    new.id,
    new_handle,
    coalesce(new.raw_user_meta_data->>'display_name', initcap(replace(new_handle, '_', ' ')))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- aggregated views (cheap reads for feed cards)
-- ─────────────────────────────────────────────────────────────
create or replace view public.poems_with_stats as
select
  p.*,
  coalesce(l.like_count, 0)    as like_count,
  coalesce(c.comment_count, 0) as comment_count,
  u.handle      as author_handle,
  u.display_name as author_name,
  u.avatar_url   as author_avatar,
  u.verified     as author_verified
from public.poems p
join public.users u on u.id = p.author_id
left join (select poem_id, count(*)::int as like_count from public.likes group by poem_id) l on l.poem_id = p.id
left join (select poem_id, count(*)::int as comment_count from public.comments group by poem_id) c on c.poem_id = p.id;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.users          enable row level security;
alter table public.poems          enable row level security;
alter table public.likes          enable row level security;
alter table public.bookmarks      enable row level security;
alter table public.follows        enable row level security;
alter table public.comments       enable row level security;
alter table public.comment_likes  enable row level security;
alter table public.playlists      enable row level security;
alter table public.playlist_items enable row level security;
alter table public.notifications  enable row level security;

-- users: profiles are readable to everyone, only the owner can update.
create policy users_read_all on public.users for select using (true);
create policy users_self_update on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- poems
create policy poems_read_public
  on public.poems for select
  using (
    visibility = 'public'
    or author_id = auth.uid()
    or (visibility = 'followers' and exists (
      select 1 from public.follows
      where follower_id = auth.uid() and followed_id = author_id
    ))
  );
create policy poems_insert_self on public.poems for insert with check (auth.uid() = author_id);
create policy poems_update_self on public.poems for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy poems_delete_self on public.poems for delete using (auth.uid() = author_id);

-- likes / bookmarks: per-user write, public read
create policy likes_read_all   on public.likes   for select using (true);
create policy likes_insert_self on public.likes  for insert with check (auth.uid() = user_id);
create policy likes_delete_self on public.likes  for delete using (auth.uid() = user_id);

create policy bookmarks_read_self    on public.bookmarks for select using (auth.uid() = user_id);
create policy bookmarks_insert_self  on public.bookmarks for insert with check (auth.uid() = user_id);
create policy bookmarks_delete_self  on public.bookmarks for delete using (auth.uid() = user_id);

-- follows
create policy follows_read_all    on public.follows for select using (true);
create policy follows_insert_self on public.follows for insert with check (auth.uid() = follower_id);
create policy follows_delete_self on public.follows for delete using (auth.uid() = follower_id);

-- comments
create policy comments_read_all    on public.comments for select using (true);
create policy comments_insert_self on public.comments for insert with check (auth.uid() = author_id);
create policy comments_update_self on public.comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy comments_delete_self on public.comments for delete using (auth.uid() = author_id);

-- comment_likes
create policy comment_likes_read_all    on public.comment_likes for select using (true);
create policy comment_likes_insert_self on public.comment_likes for insert with check (auth.uid() = user_id);
create policy comment_likes_delete_self on public.comment_likes for delete using (auth.uid() = user_id);

-- playlists
create policy playlists_read on public.playlists for select using (is_public or owner_id = auth.uid());
create policy playlists_write_self on public.playlists for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy playlist_items_read on public.playlist_items for select
  using (exists (select 1 from public.playlists p where p.id = playlist_id and (p.is_public or p.owner_id = auth.uid())));
create policy playlist_items_write on public.playlist_items for all
  using (exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid()));

-- notifications: user can only see their own
create policy notifications_read_self   on public.notifications for select using (auth.uid() = user_id);
create policy notifications_update_self on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy notifications_delete_self on public.notifications for delete using (auth.uid() = user_id);
-- inserts come from edge functions using the service role (bypasses RLS).

-- ─────────────────────────────────────────────────────────────
-- Realtime: enable for the tables that benefit from live updates
-- ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.poems;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.notifications;
