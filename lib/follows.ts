import { supabase } from "./supabase";
import type { UserRow } from "./database.types";

export type PublicUser = Pick<
  UserRow,
  "id" | "handle" | "display_name" | "bio" | "avatar_url" | "verified"
>;

export async function fetchUserByHandle(handle: string): Promise<PublicUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, handle, display_name, bio, avatar_url, verified")
    .eq("handle", handle)
    .maybeSingle();
  if (error) return null;
  return data as PublicUser | null;
}

// Counts of followers (people who follow `userId`) and following (people
// `userId` follows). One round-trip per side; the `follows` index makes both
// cheap.
export async function fetchFollowStats(
  userId: string,
): Promise<{ followers: number; following: number }> {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("followed_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

// Users `userId` follows, joined to the user row so the list can render
// avatar/name/handle without a second query.
export async function fetchFollowing(userId: string): Promise<PublicUser[]> {
  const { data, error } = await supabase
    .from("follows")
    .select(
      "created_at, followed:users!follows_followed_id_fkey(id, handle, display_name, bio, avatar_url, verified)",
    )
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Array<{ followed: PublicUser | null }>)
    .map((r) => r.followed)
    .filter((u): u is PublicUser => u !== null);
}

export async function fetchFollowers(userId: string): Promise<PublicUser[]> {
  const { data, error } = await supabase
    .from("follows")
    .select(
      "created_at, follower:users!follows_follower_id_fkey(id, handle, display_name, bio, avatar_url, verified)",
    )
    .eq("followed_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Array<{ follower: PublicUser | null }>)
    .map((r) => r.follower)
    .filter((u): u is PublicUser => u !== null);
}

export async function isFollowing(followerId: string, followedId: string): Promise<boolean> {
  if (followerId === followedId) return false;
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("followed_id", followedId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function followUser(followerId: string, followedId: string): Promise<void> {
  if (followerId === followedId) return;
  const { error } = await supabase
    .from("follows")
    .upsert(
      { follower_id: followerId, followed_id: followedId },
      { onConflict: "follower_id,followed_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function unfollowUser(followerId: string, followedId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("followed_id", followedId);
  if (error) throw error;
}
