// Hand-written DB types matching supabase/migrations/20260502000000_initial_schema.sql.
// You can regenerate these with `supabase gen types typescript --project-id <id>`
// once your project is provisioned and replace this file.

export type Visibility = "public" | "followers" | "draft";
export type NotificationType = "like" | "comment" | "follow" | "feature" | "mention";

export type UserRow = {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  verified: boolean;
  created_at: string;
};

export type PoemRow = {
  id: string;
  author_id: string;
  title: string;
  body: string[];
  tags: string[];
  cover_url: string | null;
  audio_url: string | null;
  syllables: number;
  read_time_seconds: number;
  visibility: Visibility;
  published_at: string | null;
  created_at: string;
};

export type PoemWithStats = PoemRow & {
  like_count: number;
  comment_count: number;
  author_handle: string;
  author_name: string;
  author_avatar: string | null;
  author_verified: boolean;
};

export type CommentRow = {
  id: string;
  poem_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string | null;
  target_poem_id: string | null;
  target_comment_id: string | null;
  read: boolean;
  created_at: string;
};

export type PlaylistRow = {
  id: string;
  owner_id: string;
  name: string;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
};

type Insertable<T, Optional extends keyof T = never> =
  Omit<T, "id" | "created_at" | Optional> & Partial<Pick<T, "id" | "created_at" | Optional>>;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Insertable<UserRow, "bio" | "avatar_url" | "verified">;
        Update: Partial<Omit<UserRow, "id" | "created_at">>;
      };
      poems: {
        Row: PoemRow;
        Insert: Insertable<PoemRow, "tags" | "cover_url" | "audio_url" | "syllables" | "read_time_seconds" | "visibility" | "published_at">;
        Update: Partial<Omit<PoemRow, "id" | "author_id" | "created_at">>;
      };
      likes: {
        Row: { user_id: string; poem_id: string; created_at: string };
        Insert: { user_id: string; poem_id: string; created_at?: string };
        Update: never;
      };
      bookmarks: {
        Row: { user_id: string; poem_id: string; created_at: string };
        Insert: { user_id: string; poem_id: string; created_at?: string };
        Update: never;
      };
      follows: {
        Row: { follower_id: string; followed_id: string; created_at: string };
        Insert: { follower_id: string; followed_id: string; created_at?: string };
        Update: never;
      };
      comments: {
        Row: CommentRow;
        Insert: Insertable<CommentRow, "parent_id">;
        Update: Partial<Pick<CommentRow, "body">>;
      };
      comment_likes: {
        Row: { user_id: string; comment_id: string; created_at: string };
        Insert: { user_id: string; comment_id: string; created_at?: string };
        Update: never;
      };
      playlists: {
        Row: PlaylistRow;
        Insert: Insertable<PlaylistRow, "cover_url" | "is_public">;
        Update: Partial<Omit<PlaylistRow, "id" | "owner_id" | "created_at">>;
      };
      playlist_items: {
        Row: { playlist_id: string; poem_id: string; position: number };
        Insert: { playlist_id: string; poem_id: string; position: number };
        Update: { position?: number };
      };
      notifications: {
        Row: NotificationRow;
        Insert: Insertable<NotificationRow, "actor_id" | "target_poem_id" | "target_comment_id" | "read">;
        Update: Partial<Pick<NotificationRow, "read">>;
      };
    };
    Views: {
      poems_with_stats: { Row: PoemWithStats };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
