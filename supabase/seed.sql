-- Versify — full demo seed.
--
-- Creates 6 stock poets (auth + profile) and 32 poems distributed across
-- them, then backfills the default playlists for every existing user.
--
-- Run AFTER applying all migrations. Two ways:
--   - Supabase SQL Editor: paste this whole file and click Run
--   - psql: psql "$DB_URL" -f seed.sql
--
-- Idempotent: re-runs upsert avatars/bios and skip duplicate poems by title.
-- The whole thing is wrapped in a transaction.
--
-- Poem bodies use dollar-quoting ($p$...$p$) so newlines and apostrophes
-- need no escaping. Comments avoid apostrophes for SQL-Editor robustness.

begin;

-- ─────────────────────────────────────────────────────────────
-- 1. Stock authors
-- ─────────────────────────────────────────────────────────────
select public.seed_demo_user(
  'julian.vanes@versify.demo', 'demo-vanes-1234', 'julian.v', 'Julian Vanes',
  'Architect by day, neon-lit poet by night. Brooklyn.',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80', true);

select public.seed_demo_user(
  'elias.thorne@versify.demo', 'demo-thorne-1234', 'elias.t', 'Elias Thorne',
  'Concrete and cadence. Berlin to Lisbon.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', false);

select public.seed_demo_user(
  'sarah.vance@versify.demo', 'demo-vance-1234', 'sarah.v', 'Sarah Vance',
  'Tide letters and small reckonings. Cornwall, mostly.',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', true);

select public.seed_demo_user(
  'luna.poetica@versify.demo', 'demo-luna-1234', 'luna_poetica', 'Luna Poetica',
  '17 syllables at a time. Kyoto.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', false);

select public.seed_demo_user(
  'aria.chen@versify.demo', 'demo-chen-1234', 'aria.chen', 'Aria Chen',
  'Memory cartographer. Toronto.',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80', true);

select public.seed_demo_user(
  'marcus.thorne@versify.demo', 'demo-marcus-1234', 'm.thorne', 'Marcus Thorne',
  'Late-night radio voice. Glasgow.',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80', false);

-- ─────────────────────────────────────────────────────────────
-- 2. Poems. Skipped if a poem with the same title already exists
--    for that author (so this whole seed is re-runnable).
-- ─────────────────────────────────────────────────────────────
insert into public.poems
  (author_id, title, body, tags, cover_url, syllables, read_time_seconds, visibility, published_at)
select au.id, p.title, p.body, p.tags, p.cover, p.syl, p.rt, 'public', now() - (p.days || ' days')::interval
from (values
  -- Julian Vanes (urban / neon / night)
  ('julian.v', 'Neon Whispers',
    array[
$p$The city breathes in pulses of emerald light,
A rhythmic thrum beneath the concrete skin.
We are but echoes in the throat of the night,
Waiting for the silence to begin.$p$,
$p$Shadows stretch like ink on a velvet floor,
Mapping out the paths we failed to take.
Every open window, every locked door,
Is a promise we were meant to break.$p$,
$p$Listen to the hum of the electric wire,
Tracing patterns in the smog-thick air.
The heart is just a flickering, low-burning fire,
Searching for a ghost that isn't there.$p$
    ],
    array['Urban','Night'],
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80',
    142, 180, 22),

  ('julian.v', 'Geometric Solace',
    array[
$p$The concrete does not ask for forgiveness,
it simply stands, a brutalist anchor
in a fluid world of soft excuses.$p$,
$p$We find our edges where the light breaks
against the stone. There is a kind of peace
in straight lines the wind cannot bend.$p$
    ],
    array['Urban','Abstract'],
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80',
    66, 75, 19),

  ('julian.v', 'Subway Saint',
    array[
$p$On the platform at 2 AM
she holds a paper cup of nothing
and the whole tunnel waits with her.$p$,
$p$A train arrives like a blessing
she did not ask for and will not refuse.
We ride it back into our small ordinary lives.$p$
    ],
    array['Urban','Solitude'],
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80',
    72, 75, 16),

  ('julian.v', '4 AM Highway',
    array[
$p$No exit for ninety miles
and the radio hums to itself.
I am the only listener
left in the country.$p$
    ],
    array['Urban','Solitude','Night'],
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80',
    32, 45, 13),

  ('julian.v', 'Brutalist Lullaby',
    array[
$p$Sleep, small heart, against the gray.
The building is older than your fear.
It has held a thousand mothers, a thousand prayers.
It will hold you, too.$p$
    ],
    array['Urban','Memory','Solitude'],
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=80',
    44, 60, 8),

  ('julian.v', 'Last Train Home',
    array[
$p$The window is a film I cannot stop:
fields, then dark, then a town I will never know,
then dark, then someone's kitchen light, on, off.$p$,
$p$I think of you, three stops behind me,
folding your coat the patient way you do —
as if the world were not, in this moment,
pulling us slowly apart.$p$
    ],
    array['Urban','Love','Memory','Night'],
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80',
    88, 90, 4),

  -- Elias Thorne (architecture / abstract)
  ('elias.t', 'Cathedral of Ferns',
    array[
$p$A green nave under green vaulting,
light made of leaf and patience.$p$,
$p$The forest does not need a god.
It is one — kneeling slowly,
breathing in centuries.$p$
    ],
    array['Nature','Abstract'],
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80',
    54, 60, 21),

  ('elias.t', 'The Color of Waiting',
    array[
$p$It is not gray. It is the long hush
between two notes of a piano,
the color the room becomes
when you have just hung up the phone.$p$
    ],
    array['Abstract','Solitude','Memory'],
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    38, 45, 17),

  ('elias.t', 'Symmetry Lesson',
    array[
$p$A leaf is not the mirror of another leaf.
It is the mirror of the wind that made it.$p$,
$p$So with us. So with everything.
The likeness is never the thing.
It is the long hand of cause
still warm against the page.$p$
    ],
    array['Abstract','Nature'],
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80',
    62, 75, 12),

  ('elias.t', 'Vespers in a Power Station',
    array[
$p$The turbines hum a low Latin
that the engineers know by heart.
We are all liturgists
of what keeps the lights on.$p$
    ],
    array['Urban','Abstract'],
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80',
    40, 45, 9),

  ('elias.t', 'Hinterland',
    array[
$p$There is a country at the edge of every word
where the syllable runs out
and the meaning has to walk the rest of the way alone.$p$
    ],
    array['Abstract','Solitude'],
    'https://images.unsplash.com/photo-1502209524164-acea936639a2?w=900&q=80',
    34, 45, 5),

  -- Sarah Vance (ocean / memory / love)
  ('sarah.v', 'Tide Letter',
    array[
$p$Salt finds every wound
the summer left open.
I write your name in the wet sand
and the sea reads it once,
then forgets, the way you did.$p$
    ],
    array['Ocean','Love','Memory'],
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=900&q=80',
    38, 45, 24),

  ('sarah.v', 'Tide and Memory',
    array[
$p$The ocean pulls the secrets from the sand,
every wave a persistent erasure of who we were.$p$,
$p$No sound quite like the receding water,
taking back the small shells
and the memories we left by the shoreline.$p$
    ],
    array['Ocean','Memory'],
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
    52, 60, 20),

  ('sarah.v', 'Cove',
    array[
$p$The boats slept on their sides
like old dogs.
The town held its breath the way it always did
before anything good happened.$p$
    ],
    array['Ocean','Memory'],
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=900&q=80',
    36, 45, 14),

  ('sarah.v', 'Letter to a Younger Self',
    array[
$p$Be kinder to your knees.
You will need them later, and your spine,
and the small worried muscles around your eyes.$p$,
$p$When the door closes, do not stand at it.
Go to the window.
There is always a window.$p$,
$p$And love the boring ones — the slow Sundays,
the long-cooked stews,
the friend who calls only to say nothing.
They are the cathedral. The rest is weather.$p$
    ],
    array['Memory','Love'],
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=80',
    135, 165, 6),

  ('sarah.v', 'Returning',
    array[
$p$The harbour has not noticed I was gone.
It arranges its boats the way I arrange these years —
too neatly, with one always crooked.$p$
    ],
    array['Ocean','Memory','Solitude'],
    'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=900&q=80',
    36, 45, 3),

  -- Luna Poetica (haiku)
  ('luna_poetica', 'Silver Moon',
    array[
$p$Silver moon hangs high,
Whispers in the velvet dark,
Shadows dance alone.$p$
    ],
    array['Haiku','Night'],
    'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&q=80',
    17, 30, 23),

  ('luna_poetica', 'First Snow',
    array[
$p$First snow on the porch —
a cat prints small calligraphy
no one will read.$p$
    ],
    array['Haiku','Nature'],
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=900&q=80',
    17, 30, 18),

  ('luna_poetica', 'Storm at Three',
    array[
$p$Lightning splits the sky —
a quick page from a long book
the night is reading.$p$
    ],
    array['Haiku','Night','Nature'],
    'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?w=900&q=80',
    17, 30, 15),

  ('luna_poetica', 'Crossing',
    array[
$p$A heron on the river —
she does not hurry. The bridge
will still be there.$p$
    ],
    array['Haiku','Nature'],
    'https://images.unsplash.com/photo-1502209524164-acea936639a2?w=900&q=80',
    17, 30, 11),

  ('luna_poetica', 'Plum Branch',
    array[
$p$A plum branch in bloom —
for a moment the whole tree
forgives the winter.$p$
    ],
    array['Haiku','Nature'],
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80',
    17, 30, 10),

  ('luna_poetica', 'Lantern',
    array[
$p$Paper lantern bobs —
a little firefly of a god
minding the dark road.$p$
    ],
    array['Haiku','Night'],
    'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&q=80',
    17, 30, 7),

  ('luna_poetica', 'Empty Cup',
    array[
$p$Last sip of green tea —
the garden brightens, settles.
A bell in the next street.$p$
    ],
    array['Haiku','Memory'],
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=80',
    17, 30, 2),

  -- Aria Chen (memory / love)
  ('aria.chen', 'A Quiet Argument',
    array[
$p$You stir the coffee three times to the left.
I used to find it endearing.$p$,
$p$Now it sounds like a ticking clock,
a slow leak in a tire,
the last few seconds of a song
neither of us will admit we love.$p$
    ],
    array['Love','Solitude'],
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80',
    58, 60, 19),

  ('aria.chen', 'Fig and Honey',
    array[
$p$Split a fig with me at noon —
pink and seed and slow gold,
the sticky algebra of summer.$p$,
$p$I will tell you nothing important.
We will laugh anyway.
This is what the body is for.$p$
    ],
    array['Love','Nature','Memory'],
    'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=900&q=80',
    55, 60, 16),

  ('aria.chen', 'Inventory of a Small Apartment',
    array[
$p$One spider in the bathroom
who pays no rent.
One cracked mug from a country I left.
One window the sun forgets each morning
and remembers by four.$p$,
$p$I make tea. I sit in the loud chair.
I count my luck like coins
and it is enough — barely,
but that is the kind of enough
that keeps you honest.$p$
    ],
    array['Solitude','Urban','Memory'],
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=80',
    95, 105, 13),

  ('aria.chen', 'Old House, New Tenant',
    array[
$p$The radiator clangs at 2 AM
like someone setting down a heavy suitcase.
I lie still and listen.
This is how a house tells you
it has had other lives.$p$
    ],
    array['Memory','Solitude','Night'],
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=80',
    44, 60, 8),

  ('aria.chen', 'Postcards I Did Not Send',
    array[
$p$Lisbon: the trams sound like maracas.
Kyoto: a small rain at the bus stop.
Delhi: a man laughing into his phone.$p$,
$p$I keep the cards in a drawer.
They are the only honest letters
I have ever written you.$p$
    ],
    array['Memory','Love','Urban'],
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=80',
    62, 75, 5),

  -- Marcus Thorne (rain / late-night)
  ('m.thorne', 'Rain on Tin',
    array[
$p$The tin roof hums an old hymn,
drumming to a metronome
only the storm can keep.$p$,
$p$I am thirteen again — barefoot,
mug of cocoa cooling on the sill,
listening for the world to soften.$p$
    ],
    array['Memory','Nature','Rain'],
    'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=900&q=80',
    62, 60, 17),

  ('m.thorne', 'Glasgow, Tuesday',
    array[
$p$The rain has its own opinions today,
and we are not invited to the conversation.$p$,
$p$Still — there is the bakery.
Still — the friend who waves from across the street
and pretends not to be late.$p$
    ],
    array['Urban','Rain','Memory'],
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80',
    52, 60, 11),

  ('m.thorne', 'Weather Report',
    array[
$p$The forecast is plain:
a long evening, then another.
Wear the soft sweater. Boil the water.
We are made for this.$p$
    ],
    array['Solitude','Memory','Rain'],
    'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?w=900&q=80',
    34, 45, 9),

  ('m.thorne', 'Late-Night Radio',
    array[
$p$Somebody in Manchester is listening.
Somebody in Naples is listening.
This song is a small bridge
built out of nothing
between two people
who will never meet.$p$
    ],
    array['Night','Urban','Solitude'],
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80',
    50, 60, 6),

  ('m.thorne', 'Two Coats',
    array[
$p$You take the heavy one.
I will take the lighter.
The rain will not be impressed
by either of our preparations,
but the walk will be ours.$p$
    ],
    array['Love','Rain','Memory'],
    'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=900&q=80',
    40, 45, 1)
) as p(handle, title, body, tags, cover, syl, rt, days)
join public.users au on au.handle = p.handle
where not exists (
  select 1 from public.poems x where x.author_id = au.id and x.title = p.title
);

-- ─────────────────────────────────────────────────────────────
-- 3. Cross-author engagement: each stock author likes a few of
--    the other authors poems so the like counts are not all zero.
-- ─────────────────────────────────────────────────────────────
insert into public.likes (user_id, poem_id)
select u.id, p.id
from public.users u
cross join lateral (
  select id from public.poems
   where author_id <> u.id and visibility = 'public'
   order by random() limit 8
) p
where u.handle in ('julian.v','elias.t','sarah.v','luna_poetica','aria.chen','m.thorne')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- 4. Backfill default playlists for every existing user (real
--    users plus the stock authors above).
-- ─────────────────────────────────────────────────────────────
select public.backfill_default_playlists();

commit;
