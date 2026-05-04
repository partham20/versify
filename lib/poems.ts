import { supabase } from "./supabase";
import type { PoemWithStats, CommentRow } from "./database.types";
import { countSyllables, readTimeSeconds } from "./syllables";

export async function fetchFeed(limit = 20): Promise<PoemWithStats[]> {
  const { data, error } = await supabase
    .from("poems_with_stats")
    .select("*")
    .eq("visibility", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PoemWithStats[];
}

export async function fetchPoem(id: string): Promise<PoemWithStats | null> {
  const { data, error } = await supabase
    .from("poems_with_stats")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as PoemWithStats;
}

export async function searchPoems(query: string, limit = 30): Promise<PoemWithStats[]> {
  const q = query.trim();
  if (!q) return [];

  // Preferred: ranked full-text search via the search_poems RPC.
  try {
    const { data, error } = await supabase.rpc("search_poems", { q, max_results: limit });
    if (!error) {
      const rows = (data ?? []) as PoemWithStats[];
      if (rows.length > 0) return rows;
    }
  } catch {
    // RPC missing (migration not applied) or threw — fall through to client-side.
  }

  // Fallback: pull a chunk of public poems and filter locally. Works even when
  // the search migration hasn't been applied to this Supabase project.
  const { data: rows, error } = await supabase
    .from("poems_with_stats")
    .select("*")
    .eq("visibility", "public")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200);
  if (error) return [];
  const ql = q.toLowerCase();
  return ((rows ?? []) as PoemWithStats[])
    .filter((p) => {
      const hay = [
        p.title,
        p.author_name,
        p.author_handle,
        (p.tags ?? []).join(" "),
        (p.body ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(ql);
    })
    .slice(0, limit);
}

export async function fetchPoemsByAuthor(authorId: string): Promise<PoemWithStats[]> {
  const { data, error } = await supabase
    .from("poems_with_stats")
    .select("*")
    .eq("author_id", authorId)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as PoemWithStats[];
}

export async function toggleLike(userId: string, poemId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("poem_id", poemId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("likes").insert({ user_id: userId, poem_id: poemId });
    if (error) throw error;
  }
}

export async function toggleBookmark(userId: string, poemId: string, currentlyBookmarked: boolean) {
  if (currentlyBookmarked) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("poem_id", poemId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("bookmarks").insert({ user_id: userId, poem_id: poemId });
    if (error) throw error;
  }
}

export async function fetchUserLikes(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from("likes").select("poem_id").eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.poem_id));
}

export async function fetchUserBookmarks(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("poem_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.poem_id));
}

export async function fetchComments(poemId: string): Promise<(CommentRow & { author_name: string; author_handle: string; author_avatar: string | null })[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*, author:users!comments_author_id_fkey(handle, display_name, avatar_url)")
    .eq("poem_id", poemId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    id: c.id,
    poem_id: c.poem_id,
    author_id: c.author_id,
    parent_id: c.parent_id,
    body: c.body,
    created_at: c.created_at,
    author_name: c.author?.display_name ?? "",
    author_handle: c.author?.handle ?? "",
    author_avatar: c.author?.avatar_url ?? null,
  }));
}

export async function postComment(poemId: string, authorId: string, body: string, parentId?: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ poem_id: poemId, author_id: authorId, body, parent_id: parentId ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export type PublishInput = {
  title: string;
  body: string[];
  tags: string[];
  cover_url?: string | null;
  audio_url?: string | null;
  visibility: "public" | "followers" | "draft";
};

// Publishes a poem. By default does a direct client-side insert (RLS enforces
// that author_id == auth.uid()). If you've deployed the publish_poem edge
// function and prefer server-side validation, set useEdgeFunction = true.
export async function publishPoem(input: PublishInput, useEdgeFunction = false) {
  if (useEdgeFunction) {
    const { data, error } = await supabase.functions.invoke("publish_poem", { body: input });
    if (error) throw error;
    return data as { poem: { id: string } };
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not signed in");

  const fullText = input.body.join(" ");
  const syllables = countSyllables(fullText);
  const read_time_seconds = readTimeSeconds(syllables);

  const { data, error } = await supabase
    .from("poems")
    .insert({
      author_id: userData.user.id,
      title: input.title,
      body: input.body,
      tags: input.tags,
      cover_url: input.cover_url ?? null,
      audio_url: input.audio_url ?? null,
      syllables,
      read_time_seconds,
      visibility: input.visibility,
      published_at: input.visibility === "draft" ? null : new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return { poem: { id: data.id } };
}

export type UpdatePoemInput = Partial<{
  title: string;
  body: string[];
  tags: string[];
  cover_url: string | null;
  audio_url: string | null;
  visibility: "public" | "followers" | "draft";
}>;

// Updates a poem the caller owns. RLS enforces author_id = auth.uid().
// Recomputes syllables + read_time when the body changes; flips published_at
// based on the visibility transition (draft <-> public/followers).
export async function updatePoem(id: string, patch: UpdatePoemInput): Promise<void> {
  const next: Record<string, unknown> = { ...patch };

  if (patch.body) {
    const fullText = patch.body.join(" ");
    next.syllables = countSyllables(fullText);
    next.read_time_seconds = readTimeSeconds(next.syllables as number);
  }

  if (patch.visibility) {
    // Going to draft clears the published_at; coming out of draft stamps now.
    // For non-draft -> non-draft transitions, leave published_at alone.
    if (patch.visibility === "draft") {
      next.published_at = null;
    } else {
      const { data: existing } = await supabase
        .from("poems")
        .select("published_at, visibility")
        .eq("id", id)
        .single();
      const wasDraft = (existing as { visibility?: string } | null)?.visibility === "draft";
      const hadDate = !!(existing as { published_at?: string | null } | null)?.published_at;
      if (wasDraft || !hadDate) {
        next.published_at = new Date().toISOString();
      }
    }
  }

  const { error } = await supabase
    .from("poems")
    .update(next as never)
    .eq("id", id);
  if (error) throw error;
}

export async function deletePoem(id: string): Promise<void> {
  const { error } = await supabase.from("poems").delete().eq("id", id);
  if (error) throw error;
}
