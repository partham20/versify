# Versify

> A sanctuary for poets. Editorial typography meets a bioluminescent palette.
> Mobile poetry app — read, write, listen.

Built with **Expo (React Native)** + **Supabase** (Postgres, Auth, Storage,
Edge Functions, Realtime). Source of design truth lives in `design/`.

## What's in here

```
app/                 expo-router routes (auth, tabs, poem, comments, compose)
components/          Icon, Particles, LineReveal, Glass, Chip, BottomNav, …
lib/                 supabase client, auth provider, poems API, syllable utils
theme/               design tokens (colors, fonts, radius, motion)
supabase/
  migrations/        schema + RLS
  functions/         publish_poem edge function
  seed.sql           sample poems
design/              source UI prototypes (HTML + JSX) — reference only
```

## Build order (matches the engineering brief)

1. ✅ Auth + user profile
2. ✅ Poems table + Home feed (read-only)
3. ✅ Reader view with line-by-line reveal
4. ✅ Likes + bookmarks (optimistic write path)
5. ✅ Compose + publish (3-step, live syllable counter, haiku glow)
6. ✅ Comments
7. ⏳ Audio recording + playback (UI in place, expo-av wiring next)
8. ⏳ Push notifications (schema ready, expo-notifications next)
9. ⏳ Playlists (schema ready, UI next)
10. ✅ Search (basic title/author ilike)

## Setup

### 1. Provision a Supabase project

Sign up at https://supabase.com and create a new project. From **Settings →
API**, copy the project URL and the `anon` public key.

### 2. Apply the schema

```bash
# install the CLI once
npm i -g supabase

# link your local repo to the cloud project
supabase link --project-ref <your-project-ref>

# push the migration
supabase db push
```

This creates the `users`, `poems`, `likes`, `bookmarks`, `follows`,
`comments`, `comment_likes`, `playlists`, `playlist_items`, `notifications`
tables, the `poems_with_stats` view, full-text search indexes, and the
RLS policies described in `supabase/migrations/20260502000000_initial_schema.sql`.

A `handle_new_user` trigger automatically creates a `public.users` row
when a new account signs up via `auth.users`.

### 3. Deploy the publish_poem edge function

```bash
supabase functions deploy publish_poem
```

This validates input, computes syllable count + read time, and inserts a
poem row using the caller's auth context (RLS still applies).

### 4. Configure the app

```bash
cp .env.example .env
# edit .env:
# EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### 5. Run

```bash
npm install
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # web preview (most things work)
```

## Architecture decisions worth knowing

- **expo-router** with file-based routing. `(auth)` and `(tabs)` are route
  groups; `_layout.tsx` in the root gates unauthenticated access.
- **RLS-first**: every table has policies that enforce ownership. The
  `publish_poem` edge function runs with the caller's JWT, so RLS still
  applies — no service-role footguns.
- **Optimistic writes** for likes/bookmarks/comments. Local state flips
  immediately and reverts only if the network call fails.
- **`poems_with_stats` view** denormalizes like/comment counts and author
  fields so the home feed is one query.
- **Reanimated** powers `LineReveal` (700 ms cubic-bezier) and `Particles`
  (10–14 drift particles, mostly green with a few cyan accents).
- **Material Symbols → MaterialIcons**: the design uses Material Symbols
  Outlined; React Native ships MaterialIcons via `@expo/vector-icons`.
  See `components/Icon.tsx` for the name map.
- **Fonts**: Fraunces (editorial serif, italicizable) for headlines,
  Manrope (clean sans) for body. Loaded via `@expo-google-fonts`.

## Known limitations / next steps

- Audio: the Reader's glass player is wired up visually but isn't yet
  connected to `expo-av`. Recording in Compose just simulates a duration.
  Storing into Supabase Storage and playing back is the next ticket.
- Push: `notifications` table + `notify` edge function are scaffolded in
  the brief but only the table exists today. Expo push tokens not yet
  registered.
- Playlists UI: schema is ready; profile shows a placeholder.
- Type generation: `lib/database.types.ts` is hand-written. Replace with
  `supabase gen types typescript --project-id <id>` once your project is
  provisioned.

## Useful files

- `supabase/migrations/20260502000000_initial_schema.sql` — schema, RLS,
  triggers, view.
- `supabase/functions/publish_poem/index.ts` — edge function.
- `lib/poems.ts` — data layer (feed, reader, likes/bookmarks, publish).
- `app/poem/[id].tsx` — Reader screen with line reveal + glass player.
- `app/compose.tsx` — three-step compose with live haiku detector.
