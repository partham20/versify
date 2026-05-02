// Edge function: publish_poem
// Validates input, computes syllable count + read_time, inserts a poem row
// using the caller's auth context (RLS still applies).
//
// Deploy: supabase functions deploy publish_poem --no-verify-jwt=false
// Invoke: POST /functions/v1/publish_poem
//   { title, body: string[], tags?: string[], cover_url?, audio_url?, visibility? }

import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PublishInput = {
  title: string;
  body: string[];
  tags?: string[];
  cover_url?: string | null;
  audio_url?: string | null;
  visibility?: "public" | "followers" | "draft";
};

function countSyllables(text: string): number {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((acc, word) => {
      const cleaned = word.replace(/[^a-z']/g, "");
      if (!cleaned) return acc;
      const groups = cleaned.match(/[aeiouy]+/g);
      return acc + Math.max(1, groups?.length ?? 1);
    }, 0);
}

function estimateReadTime(syllables: number): number {
  // ~3 syllables/second is a comfortable poetry reading pace; floor at 15s
  return Math.max(15, Math.round(syllables / 3));
}

function validate(input: unknown): PublishInput {
  if (!input || typeof input !== "object") throw new Error("invalid_body");
  const i = input as Record<string, unknown>;
  if (typeof i.title !== "string" || i.title.trim().length === 0 || i.title.length > 120) {
    throw new Error("invalid_title");
  }
  if (!Array.isArray(i.body) || i.body.length === 0 || i.body.length > 32) {
    throw new Error("invalid_body");
  }
  for (const stanza of i.body) {
    if (typeof stanza !== "string" || stanza.length === 0 || stanza.length > 4000) {
      throw new Error("invalid_stanza");
    }
  }
  const tags = Array.isArray(i.tags) ? (i.tags as unknown[]) : [];
  if (tags.length > 10) throw new Error("too_many_tags");
  for (const t of tags) {
    if (typeof t !== "string" || t.length > 32) throw new Error("invalid_tag");
  }
  const visibility = (i.visibility as string | undefined) ?? "public";
  if (!["public", "followers", "draft"].includes(visibility)) throw new Error("invalid_visibility");

  return {
    title: i.title.trim(),
    body: i.body as string[],
    tags: tags as string[],
    cover_url: typeof i.cover_url === "string" ? i.cover_url : null,
    audio_url: typeof i.audio_url === "string" ? i.audio_url : null,
    visibility: visibility as PublishInput["visibility"],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const auth = req.headers.get("Authorization");
  if (!auth) {
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let payload: PublishInput;
  try {
    payload = validate(await req.json());
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } }
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const fullText = payload.body.join(" ");
  const syllables = countSyllables(fullText);
  const read_time_seconds = estimateReadTime(syllables);

  const { data, error } = await supabase
    .from("poems")
    .insert({
      author_id: userData.user.id,
      title: payload.title,
      body: payload.body,
      tags: payload.tags ?? [],
      cover_url: payload.cover_url,
      audio_url: payload.audio_url,
      syllables,
      read_time_seconds,
      visibility: payload.visibility,
      published_at: payload.visibility === "draft" ? null : new Date().toISOString(),
    })
    .select("id, title, syllables, read_time_seconds, visibility, published_at")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ poem: data }), {
    status: 201,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
