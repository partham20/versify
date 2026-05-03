import { supabase } from "./supabase";
import type { UserRow } from "./database.types";

export type ProfileUpdate = Partial<Pick<UserRow, "display_name" | "handle" | "bio" | "avatar_url">>;

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<UserRow> {
  // Cast to bypass the strict update() generic — same workaround used
  // throughout lib/poems.ts until lib/database.types.ts is regenerated.
  const { data, error } = await supabase
    .from("users")
    .update(patch as never)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserRow;
}

// Returns true if the handle is free OR already belongs to ownerUserId.
export async function isHandleAvailable(handle: string, ownerUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  if (error) throw error;
  if (!data) return true;
  return (data as { id: string }).id === ownerUserId;
}

// Uploads an avatar to the `avatars` bucket under <userId>/<timestamp>.<ext>.
// Returns the public URL. Caller is responsible for persisting it via
// updateProfile({ avatar_url }).
//
// `file` may be a Blob (web) or a { uri, mime } object (native); on native
// you'll typically read the picker output via fetch + .blob() to get a Blob.
export async function uploadAvatar(
  userId: string,
  file: Blob,
  mime?: string
): Promise<string> {
  const detectedMime = mime ?? (file as Blob).type ?? "image/jpeg";
  const ext = detectedMime.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      contentType: detectedMime,
      upsert: true,
      cacheControl: "3600",
    });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
