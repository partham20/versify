-- Seed data for local development. Run AFTER creating an auth user
-- (the trigger inserts into public.users automatically).
-- This file just inserts sample poems for an arbitrary author id.
-- Replace :author_id with a real users.id from your local instance.

-- Example:
--   psql "$DB_URL" -v author_id="'<uuid-from-public.users>'" -f seed.sql

\if :{?author_id}
\else
  \set author_id '''00000000-0000-0000-0000-000000000000'''
\endif

insert into public.poems (author_id, title, body, tags, cover_url, syllables, read_time_seconds, visibility, published_at) values
  (:author_id, 'Neon Whispers',
   array[
     E'The city breathes in pulses of emerald light,\nA rhythmic thrum beneath the concrete skin.\nWe are but echoes in the throat of the night,\nWaiting for the silence to begin.',
     E'Shadows stretch like ink on a velvet floor,\nMapping out the paths we failed to take.\nEvery open window, every locked door,\nIs a promise we were meant to break.'
   ],
   array['Nature','Solitude'],
   'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80',
   142, 180, 'public', now() - interval '20 days'),
  (:author_id, 'Silver Moon',
   array[E'Silver moon hangs high,\nWhispers in the velvet dark,\nShadows dance alone.'],
   array['Haiku','Night'],
   'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&q=80',
   17, 30, 'public', now() - interval '18 days');
