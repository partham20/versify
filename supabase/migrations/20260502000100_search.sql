-- Versify — full-text search for poems
--
-- Adds a stored tsvector column populated from title + body + tags,
-- a GIN index on it, and an RPC that returns ranked results.
--
-- Apply via Supabase SQL Editor (new query, paste, Run).

-- 1. Add the search vector as a generated stored column.
--    Using to_tsvector(regconfig, text) keeps the expression IMMUTABLE.
alter table public.poems
  add column if not exists search_vec tsvector
  generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(array_to_string(tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(array_to_string(body, ' '), '')), 'C')
  ) stored;

create index if not exists poems_search_vec_idx on public.poems using gin (search_vec);

-- 2. RPC that does the search. Uses websearch_to_tsquery so users can type
--    natural queries ("midnight garden", "neon -urban", "\"silver moon\"").
--    Returns rows shaped like poems_with_stats so the client can reuse types.
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
    and (parsed.tsq is not null and p.search_vec @@ parsed.tsq)
  order by ts_rank(p.search_vec, parsed.tsq) desc,
           pws.like_count desc,
           pws.published_at desc nulls last
  limit greatest(1, max_results);
$$;

grant execute on function public.search_poems(text, int) to anon, authenticated;
