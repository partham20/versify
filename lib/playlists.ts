import { supabase } from "./supabase";
import type { PlaylistRow, PoemWithStats } from "./database.types";

export type PlaylistWithCount = PlaylistRow & { poem_count: number };

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
