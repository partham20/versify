-- Versify — full-text search for poems (trigger-maintained)
--
-- Generated columns require IMMUTABLE expressions, but array_to_string is
-- STABLE in modern Postgres, so we maintain the search_vec via a trigger
-- instead. Functionally identical, just populated on write.
--
-- Apply via Supabase SQL Editor (new query, paste, Run). Idempotent.

-- 1. Add the search vector column.
alter table public.poems
  add column if not exists search_vec tsvector;

-- 2. Trigger function that recomputes search_vec on insert/update.
create or replace function public.poems_set_search_vec()
returns trigger
language plpgsql
as $$
begin
  new.search_vec :=
    setweight(to_tsvector('english'::regconfig, coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(array_to_string(new.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(array_to_string(new.body, ' '), '')), 'C');
  return new;
end;
$$;

drop trigger if exists poems_search_vec_trg on public.poems;
create trigger poems_search_vec_trg
  before insert or update of title, body, tags
  on public.poems
  for each row
  execute function public.poems_set_search_vec();

-- 3. Backfill existing rows (no-op self-update fires the trigger).
update public.poems set title = title where search_vec is null;

-- 4. GIN index for fast lookups.
create index if not exists poems_search_vec_idx on public.poems using gin (search_vec);

-- 5. RPC: ranked search via websearch_to_tsquery. Returns rows shaped like
--    poems_with_stats so the client can reuse types. Public only.
create or replace function public.search_poems(q text, max_results int default 30)
returns setof public.poems_with_stats
language sql
stable
security invoker
set search_path = public
as $$
  with parsed as (
    select websearch_to_tsquery('english'::regconfig, coalesce(q, '')) as tsq
  )
  select pws.*
  from public.poems_with_stats pws
  join public.poems p on p.id = pws.id
  cross join parsed
  where pws.visibility = 'public'
    and parsed.tsq is not null
    and p.search_vec @@ parsed.tsq
  order by ts_rank(p.search_vec, parsed.tsq) desc,
           pws.like_count desc,
           pws.published_at desc nulls last
  limit greatest(1, max_results);
$$;

grant execute on function public.search_poems(text, int) to anon, authenticated;
