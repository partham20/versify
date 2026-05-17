import { supabase } from "./supabase";
import type { PlaylistRow, PoemWithStats } from "./database.types";

export type PlaylistWithCount = PlaylistRow & { poem_count: number };

export async function createPlaylist(
  ownerId: string,
  name: string,
  opts: { isPublic?: boolean; coverUrl?: string | null } = {},
): Promise<PlaylistRow> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Playlist name is required");
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      owner_id: ownerId,
      name: trimmed.slice(0, 80),
      is_public: opts.isPublic ?? true,
      cover_url: opts.coverUrl ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as PlaylistRow;
}

export async function fetchUserPlaylists(userId: string): Promise<PlaylistWithCount[]> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*, items:playlist_items(count)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const items = (row.items as Array<{ count: number }> | null) ?? [];
    const count = items[0]?.count ?? 0;
    const { items: _omit, ...rest } = row;
    return { ...(rest as unknown as PlaylistRow), poem_count: count };
  });
}

export async function fetchPlaylist(id: string): Promise<PlaylistRow | null> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as PlaylistRow;
}

// Returns the poems in a playlist, in `position` order, joined to the
// poems_with_stats view so the cards have author + counts ready to render.
export async function fetchPlaylistPoems(playlistId: string): Promise<PoemWithStats[]> {
  const { data, error } = await supabase
    .from("playlist_items")
    .select("position, poem:poems_with_stats(*)")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Array<{ poem: PoemWithStats | null }>)
    .map((r) => r.poem)
    .filter((p): p is PoemWithStats => p !== null);
}

export async function addPoemToPlaylist(playlistId: string, poemId: string): Promise<void> {
  // Compute next position; PK on (playlist_id, poem_id) makes re-adds a no-op
  // (the upsert below ignores the conflict).
  const { data: maxRow } = await supabase
    .from("playlist_items")
    .select("position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPos = ((maxRow as { position: number } | null)?.position ?? -1) + 1;
  const { error } = await supabase
    .from("playlist_items")
    .upsert(
      { playlist_id: playlistId, poem_id: poemId, position: nextPos },
      { onConflict: "playlist_id,poem_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function removePoemFromPlaylist(playlistId: string, poemId: string): Promise<void> {
  const { error } = await supabase
    .from("playlist_items")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("poem_id", poemId);
  if (error) throw error;
}

export async function fetchPlaylistPoemIds(playlistIds: string[]): Promise<Map<string, Set<string>>> {
  // For each playlist, the set of poem_ids inside it. Powers the "already added"
  // check next to the playlist rows in the picker.
  const out = new Map<string, Set<string>>();
  if (playlistIds.length === 0) return out;
  const { data, error } = await supabase
    .from("playlist_items")
    .select("playlist_id, poem_id")
    .in("playlist_id", playlistIds);
  if (error) throw error;
  for (const row of (data ?? []) as Array<{ playlist_id: string; poem_id: string }>) {
    if (!out.has(row.playlist_id)) out.set(row.playlist_id, new Set());
    out.get(row.playlist_id)!.add(row.poem_id);
  }
  return out;
}

export async function renamePlaylist(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Playlist name is required");
  const { error } = await supabase
    .from("playlists")
    .update({ name: trimmed.slice(0, 80) })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePlaylist(id: string): Promise<void> {
  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) throw error;
}
