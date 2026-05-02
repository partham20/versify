# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start       # Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Web preview (most things work)
npm run typecheck   # tsc --noEmit — primary correctness check (no test runner exists)
npm run lint        # eslint . — note: no eslint config is checked in, may no-op/fail
```

There is no test framework in this repo. Use `typecheck` as the source of truth for correctness; manually exercise screens for behavior.

### Supabase

```bash
supabase link --project-ref <ref>          # one-time
supabase db push                            # apply migrations in supabase/migrations/
supabase functions deploy publish_poem      # deploy the edge function
```

The two migration files (`20260502000000_initial_schema.sql`, `20260502000100_search.sql`) are written to be **idempotent and self-contained** — the initial migration drops everything in `public` and recreates it, and restates role grants because they get wiped by `DROP SCHEMA`. Re-running them on a fresh project is safe; running them on a populated project will destroy data.

### EAS builds (Android)

`eas.json` defines `development` (APK + dev client), `preview` (APK, internal), and `production` (AAB, autoincrement). Supabase URL + anon key are baked into the `preview`/`production` `env` blocks of `eas.json` — there is no `.env` file shipped, runtime reads `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `lib/supabase.ts`, which throws loudly if either is missing).

## Architecture

### Routing & auth gate
`expo-router` with file-based routes. `app/_layout.tsx` wraps everything in `AuthProvider` and renders `ProtectedNav`, which redirects unauthenticated users to `(auth)/sign-in` and authenticated users out of `(auth)`. Onboarding is allowed without a session. Modal-style routes (`poem/[id]`, `comments/[id]`, `compose`) use `slide_from_bottom` animations.

`(auth)` and `(tabs)` are route groups. The four bottom tabs are `index` (Home), `explore`, `notif`, `profile`.

### Data layer
- `lib/supabase.ts` creates a single typed client using `AsyncStorage` for session persistence. **Throws on missing env vars** — this is intentional, surfacing at startup instead of as a confusing 401 later.
- `lib/auth.tsx` exposes `useAuth()` with `session`, `user`, `profile`, and `signIn/signUp/signOut/refreshProfile`. The `profile` (a `public.users` row) is loaded on session change.
- `lib/poems.ts` is the entire data API: `fetchFeed`, `fetchPoem`, `searchPoems`, `fetchPoemsByAuthor`, `toggleLike`, `toggleBookmark`, `fetchUserLikes`, `fetchUserBookmarks`, `fetchComments`, `postComment`, `publishPoem`. UI screens call these directly — there is no global store wrapper around the data layer (Zustand is in `package.json` but not currently used for server state).

### Database design (read this before changing schema)
- **RLS-first.** Every table has policies enforcing ownership (`auth.uid() = author_id` etc.). Reads of `poems` honor `visibility` (`public` | `followers` | `draft`). The `publish_poem` edge function runs with the caller's JWT, so RLS still applies — no service-role footguns. Edge-function writes that need to bypass RLS (e.g. notifications insert) must use the service role explicitly.
- **`poems_with_stats` view** denormalizes `like_count` / `comment_count` and the author's handle/name/avatar/verified flag so the home feed is one query. Use this view, not raw `poems`, for any feed-shaped read.
- **Full-text search** lives on `poems.search_vec` (a `tsvector` populated by the `poems_set_search_vec` trigger from `title`/`tags`/`body` with A/B/C weighting). Generated columns can't be used because `array_to_string` is STABLE not IMMUTABLE — hence the trigger. Searches go through the `search_poems(q, max_results)` RPC, which returns rows shaped like `poems_with_stats`.
- **`handle_new_user` trigger** auto-creates a `public.users` row when `auth.users` gets an insert. It generates a handle from the email local-part (or `raw_user_meta_data->>'handle'`) and de-dupes by suffixing.
- Poem `body` is `text[]` — an array of stanzas, each stanza being newline-joined lines. Don't flatten to a single string at the schema layer.

### Publishing path
`publishPoem` in `lib/poems.ts` defaults to a **direct client-side insert** (RLS enforces `author_id = auth.uid()`). Pass `useEdgeFunction = true` to route through the `publish_poem` edge function instead — it does the same syllable/read-time computation server-side. Both paths exist; the recent commit `9465046` made the direct path the default. Syllable counting (`lib/syllables.ts`) and read-time formula (`Math.max(15, syllables / 3)` seconds) are duplicated in the edge function — keep them in sync.

### Optimistic writes
Likes, bookmarks, and comments flip local state immediately and revert only if the network call fails. When adding new mutations, follow the same pattern (see how `toggleLike` is wired in feed/reader screens).

### Theme & design source
- `theme/index.ts` is the single source of truth for tokens: `colors`, `fonts`, `radius`, `space`, `motion`, `shadows`, `tracking`. Do not hardcode colors or font names in components.
- Fonts: **Fraunces** (editorial serif, italicizable) for headlines, **Manrope** (sans) for body. Loaded in `app/_layout.tsx` via `@expo-google-fonts/*`. The app renders `null` until fonts load — don't add screens that assume fonts are ready outside this gate.
- Icons: design references **Material Symbols Outlined**; React Native uses **MaterialIcons** via `@expo/vector-icons`. The mapping lives in `components/Icon.tsx` — when a design references a symbol name, add it to `NAME_MAP` rather than importing icons directly.
- `design/` holds source HTML/JSX prototypes. **Reference only** — do not import from there.

### Animation
Reanimated drives `LineReveal` (700 ms cubic-bezier reveal of each poem line, see `motion.lineRevealMs` / `lineStaggerMs`) and `Particles` (10–14 drift particles). `react-native-gesture-handler` is wrapped at the root.

### Types
`lib/database.types.ts` is **hand-written**, matching the schema. There is no provisioned project ID committed, so `supabase gen types typescript` hasn't been run. If you change the schema, update this file by hand or regenerate it once the project is provisioned.

## Status (from README, partial completion)
Audio recording/playback (visual UI only, not wired to `expo-av` storage), push notifications (table exists, no Expo push token registration), and playlists UI are scaffolded but unfinished. Audio in compose currently simulates a duration. `RECORD_AUDIO` permission is duplicated in `app.json` android permissions — harmless but worth cleaning up if touched.
