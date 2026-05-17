import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "../../lib/auth";
import type { CommentRow, PoemWithStats } from "../../lib/database.types";
import { useNowPlaying } from "../../lib/nowPlaying";
import {
  deletePoem,
  fetchComments,
  fetchFeed,
  fetchUserBookmarks,
  fetchUserLikes,
  postComment,
  toggleBookmark as toggleBookmarkRemote,
  toggleLike as toggleLikeRemote,
} from "../../lib/poems";
import { formatReadTime } from "../../lib/syllables";
import { followUser, isFollowing as checkIsFollowing, unfollowUser } from "../../lib/follows";
import { colors, fonts } from "../../theme";
import { AddToPlaylistModal } from "../AddToPlaylistModal";
import { Icon } from "../Icon";
import { LineReveal } from "../LineReveal";
import { Particles } from "../Particles";

type CommentWithAuthor = CommentRow & {
  author_name: string;
  author_handle: string;
  author_avatar: string | null;
};

export function DesktopReader({ poem }: { poem: PoemWithStats }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const setNowPlaying = useNowPlaying((s) => s.setPoem);

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [draft, setDraft] = useState("");
  const [similar, setSimilar] = useState<PoemWithStats[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [followingAuthor, setFollowingAuthor] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const isAuthor = user?.id === poem.author_id;

  function goBack() {
    // Direct landing on a poem URL has no history. Fall back to the feed
    // so "Back to feed" is never a no-op.
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as never);
  }

  async function onDelete() {
    if (!isAuthor) return;
    const ok =
      typeof window !== "undefined" && typeof window.confirm === "function"
        ? window.confirm(
            `Delete "${poem.title}"? This is permanent and removes likes, bookmarks, and comments too.`
          )
        : true;
    if (!ok) return;
    setDeleting(true);
    try {
      await deletePoem(poem.id);
      router.replace("/(tabs)" as never);
    } catch (e) {
      setDeleting(false);
      if (typeof window !== "undefined") {
        window.alert(`Couldn't delete: ${(e as Error).message}`);
      }
    }
  }

  useEffect(() => {
    setNowPlaying(poem);
  }, [poem.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [likes, bookmarks] = await Promise.all([
        fetchUserLikes(user.id),
        fetchUserBookmarks(user.id),
      ]);
      setLiked(likes.has(poem.id));
      setBookmarked(bookmarks.has(poem.id));
    })();
  }, [user, poem.id]);

  useEffect(() => {
    fetchComments(poem.id).then(setComments).catch(() => {});
    fetchFeed(6)
      .then((r) => setSimilar(r.filter((x) => x.id !== poem.id).slice(0, 5)))
      .catch(() => {});
  }, [poem.id]);

  useEffect(() => {
    if (!user || user.id === poem.author_id) {
      setFollowingAuthor(false);
      return;
    }
    checkIsFollowing(user.id, poem.author_id)
      .then(setFollowingAuthor)
      .catch(() => setFollowingAuthor(false));
  }, [user, poem.author_id]);

  async function onToggleFollow() {
    if (!user || user.id === poem.author_id || followBusy) return;
    const was = followingAuthor;
    setFollowingAuthor(!was);
    setFollowBusy(true);
    try {
      if (was) await unfollowUser(user.id, poem.author_id);
      else await followUser(user.id, poem.author_id);
    } catch {
      setFollowingAuthor(was);
    } finally {
      setFollowBusy(false);
    }
  }

  function goToAuthor() {
    if (poem.author_handle) router.push(`/u/${poem.author_handle}` as never);
  }

  async function onLike() {
    if (!user) return;
    const was = liked;
    setLiked(!was);
    try {
      await toggleLikeRemote(user.id, poem.id, was);
    } catch {
      setLiked(was);
    }
  }

  async function onBookmark() {
    if (!user) return;
    const was = bookmarked;
    setBookmarked(!was);
    try {
      await toggleBookmarkRemote(user.id, poem.id, was);
    } catch {
      setBookmarked(was);
    }
  }

  async function onComment() {
    if (!user || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    try {
      await postComment(poem.id, user.id, body);
      const fresh = await fetchComments(poem.id);
      setComments(fresh);
    } catch {}
  }

  const titleWords = poem.title.split(" ");
  const firstWord = titleWords[0];
  const restWords = titleWords.slice(1).join(" ");

  return (
    <>
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.hero}>
        {poem.cover_url && (
          <Image source={{ uri: poem.cover_url }} style={styles.heroImg} contentFit="cover" />
        )}
        <LinearGradient
          colors={["rgba(12,12,12,0.4)", "rgba(12,12,12,0.85)", "#0c0c0c"]}
          locations={[0, 0.7, 1]}
          style={styles.heroOverlay}
        />
        <Particles count={8} />

        <View style={styles.heroHeader}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Icon name="arrow_back_ios_new" size={14} color={colors.white} />
            <Text style={styles.backBtnText}>Back to feed</Text>
          </Pressable>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {isAuthor && (
              <>
                <Pressable
                  onPress={() => router.push(`/poem/${poem.id}/edit` as never)}
                  style={styles.glassBtn}
                >
                  <Icon name="edit" size={14} color={colors.white} />
                  <Text style={styles.glassBtnText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={onDelete}
                  disabled={deleting}
                  style={[styles.glassBtn, { opacity: deleting ? 0.5 : 1 }]}
                >
                  <Icon name="close" size={14} color={colors.error} />
                  <Text style={[styles.glassBtnText, { color: colors.error }]}>
                    {deleting ? "Deleting…" : "Delete"}
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable style={styles.glassBtn}>
              <Icon name="ios_share" size={14} color={colors.white} />
              <Text style={styles.glassBtnText}>Share</Text>
            </Pressable>
            <Pressable onPress={onBookmark} style={styles.glassBtn}>
              <Icon
                name="bookmark"
                size={14}
                color={bookmarked ? colors.primary : colors.white}
              />
              <Text style={styles.glassBtnText}>{bookmarked ? "Saved" : "Save"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.heroFooter}>
          <View style={styles.tagRow}>
            <View style={styles.tagDash} />
            <Text style={styles.tagText}>{poem.tags.join(" · ").toUpperCase()}</Text>
          </View>
          <Text style={styles.heroTitle}>
            {firstWord} <Text style={styles.heroTitleItalic}>{restWords}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.bodyGrid}>
        <View style={styles.leftRail}>
          <View style={styles.authorRow}>
            <Pressable onPress={goToAuthor}>
              {poem.author_avatar && (
                <Image
                  source={{ uri: poem.author_avatar }}
                  style={styles.authorAvatar}
                  contentFit="cover"
                />
              )}
            </Pressable>
            <View>
              <Pressable onPress={goToAuthor}>
                <Text style={styles.authorName}>{poem.author_name}</Text>
                <Text style={styles.authorHandle}>@{poem.author_handle}</Text>
              </Pressable>
              {!!user && user.id !== poem.author_id && (
                <Pressable
                  onPress={onToggleFollow}
                  disabled={followBusy}
                  style={[
                    styles.followBtn,
                    followingAuthor && styles.followBtnFollowing,
                    followBusy && { opacity: 0.6 },
                  ]}
                >
                  <Text
                    style={[
                      styles.followBtnText,
                      followingAuthor && styles.followBtnTextFollowing,
                    ]}
                  >
                    {followingAuthor ? "Following" : "Follow"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutLabel}>ABOUT THIS POEM</Text>
            <View style={styles.aboutGrid}>
              {[
                [formatReadTime(poem.read_time_seconds), "READ"],
                [`${poem.syllables}`, "SYLLABLES"],
                [poem.like_count.toLocaleString(), "LIKES"],
                [`${poem.comment_count}`, "ECHOES"],
              ].map(([v, l]) => (
                <View key={l} style={{ width: "48%" as never }}>
                  <Text style={styles.aboutValue}>{v}</Text>
                  <Text style={styles.aboutSub}>{l}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable onPress={onLike} style={styles.ghostBtn}>
              <Icon
                name="favorite"
                size={16}
                color={liked ? colors.primary : colors.white}
              />
              <Text style={styles.ghostBtnText}>{liked ? "Liked" : "Like"}</Text>
            </Pressable>
            <Pressable
              onPress={() => setAddToPlaylistOpen(true)}
              disabled={!user}
              style={[styles.ghostBtn, !user && { opacity: 0.5 }]}
            >
              <Icon name="add_circle" size={16} color={colors.white} />
              <Text style={styles.ghostBtnText}>Add to</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.center}>
          {poem.body.map((stanza, i) => {
            const lines = stanza.split("\n");
            const accent = i === 1;
            return (
              <View
                key={i}
                style={[
                  styles.stanza,
                  accent && {
                    paddingLeft: 24,
                    borderLeftWidth: 1,
                    borderLeftColor: "rgba(87,244,127,0.25)",
                  },
                ]}
              >
                {lines.map((line, j) => (
                  <LineReveal key={j} delayMs={i * 400 + j * 80}>
                    <Text
                      style={[
                        styles.line,
                        { color: accent ? colors.white : colors.onSurfaceVariant },
                      ]}
                    >
                      {line}
                    </Text>
                  </LineReveal>
                ))}
              </View>
            );
          })}

          <Text style={styles.endNote}>— The end of the beginning.</Text>

          <View style={styles.commentsBlock}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>
                {poem.comment_count} <Text style={styles.italicGreen}>echoes</Text>
              </Text>
              <Text style={styles.sectionLink}>MOST LOVED →</Text>
            </View>

            <View style={styles.composeRow}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.composeAvatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.composeAvatar, { backgroundColor: colors.surfaceHigh }]} />
              )}
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Add a stanza of thought…"
                placeholderTextColor={colors.onSurfaceVariant}
                style={styles.composeInput}
                onSubmitEditing={onComment}
              />
              <Pressable
                onPress={onComment}
                disabled={!draft.trim()}
                style={[
                  styles.sendBtn,
                  { opacity: draft.trim() ? 1 : 0.4 },
                ]}
              >
                <Icon name="arrow_upward" size={16} color={colors.onPrimary} />
              </Pressable>
            </View>

            {comments.slice(0, 6).map((c) => (
              <View key={c.id} style={styles.commentRow}>
                {c.author_avatar ? (
                  <Image
                    source={{ uri: c.author_avatar }}
                    style={styles.commentAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.commentAvatar, { backgroundColor: colors.surfaceHigh }]} />
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                    <Text style={styles.commentAuthor}>{c.author_name}</Text>
                    <Text style={styles.commentTime}>
                      {new Date(c.created_at).toLocaleDateString().toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.commentBody}>{c.body}</Text>
                  <View style={styles.commentMeta}>
                    <Icon name="favorite" size={13} color={colors.onSurfaceVariant} />
                    <Text style={styles.commentMetaText}>0</Text>
                    <Text style={[styles.commentMetaText, { marginLeft: 16 }]}>Reply</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rightRail}>
          <Text style={styles.aboutLabel}>IF YOU LIKED THIS</Text>
          <View style={{ gap: 14, marginTop: 16 }}>
            {similar.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/poem/${p.id}`)}
                style={styles.similarRow}
              >
                {p.cover_url ? (
                  <Image
                    source={{ uri: p.cover_url }}
                    style={styles.similarCover}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.similarCover, { backgroundColor: colors.surfaceHigh }]} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.similarTitle} numberOfLines={1}>
                    {p.title}
                  </Text>
                  <Text style={styles.similarAuthor} numberOfLines={1}>
                    {p.author_name}
                  </Text>
                  <Text style={styles.similarRead}>
                    {formatReadTime(p.read_time_seconds).toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
    <AddToPlaylistModal
      visible={addToPlaylistOpen}
      poemId={poem.id}
      onClose={() => setAddToPlaylistOpen(false)}
    />
    </>
  );
}

const styles = {
  flex: { flex: 1, backgroundColor: "#0c0c0c" },
  hero: { position: "relative" as const, height: 420 },
  heroImg: {
    position: "absolute" as const,
    inset: 0,
    width: "100%" as const,
    height: "100%" as const,
    opacity: 0.55,
  } as never,
  heroOverlay: { position: "absolute" as const, inset: 0 } as never,
  heroHeader: {
    position: "relative" as const,
    paddingTop: 24,
    paddingHorizontal: 40,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    zIndex: 2,
  },
  backBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  backBtnText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  glassBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  glassBtnText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodySemiBold },
  heroFooter: {
    position: "absolute" as const,
    bottom: 40,
    left: 40,
    right: 40,
    zIndex: 2,
  },
  tagRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginBottom: 14 },
  tagDash: { width: 28, height: 1, backgroundColor: colors.primary },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.8,
    color: colors.primary,
  },
  heroTitle: {
    fontFamily: fonts.headline,
    fontSize: 96,
    lineHeight: 88,
    letterSpacing: -3,
    color: colors.white,
  },
  heroTitleItalic: { fontFamily: fonts.headlineItalic, color: colors.primary },

  bodyGrid: {
    flexDirection: "row" as const,
    gap: 48,
    paddingHorizontal: 40,
    paddingTop: 48,
    paddingBottom: 80,
    maxWidth: 1400,
    alignSelf: "center" as const,
    width: "100%" as const,
  },
  leftRail: { width: 320 },
  authorRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14, marginBottom: 28 },
  authorAvatar: { width: 64, height: 64, borderRadius: 32 },
  authorName: { fontFamily: fonts.headlineRegular, fontSize: 18, color: colors.white },
  authorHandle: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  followBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignSelf: "flex-start" as const,
  },
  followBtnFollowing: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  followBtnText: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  followBtnTextFollowing: { color: colors.white },
  aboutCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
  },
  aboutLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 2.2,
    color: colors.onSurfaceVariant,
  },
  aboutGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginTop: 14,
  },
  aboutValue: {
    fontFamily: fonts.headlineRegular,
    fontSize: 18,
    color: colors.primary,
  },
  aboutSub: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.6,
    color: colors.onSurfaceVariant,
  },
  actionRow: { marginTop: 16, flexDirection: "row" as const, gap: 8 },
  ghostBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
  },
  ghostBtnText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },

  center: { flex: 1, maxWidth: 640, alignSelf: "center" as const, width: "100%" as const },
  stanza: { marginBottom: 44 },
  line: {
    fontFamily: fonts.body,
    fontSize: 24,
    lineHeight: 37,
    letterSpacing: -0.1,
  },
  endNote: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontStyle: "italic" as const,
    color: colors.onSurfaceVariant,
    opacity: 0.5,
    marginTop: 40,
  },
  commentsBlock: {
    marginTop: 64,
    paddingTop: 36,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  commentsHeader: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    justifyContent: "space-between" as const,
    marginBottom: 22,
  },
  commentsTitle: {
    fontFamily: fonts.headline,
    fontSize: 22,
    color: colors.white,
  },
  italicGreen: { fontFamily: fonts.headlineItalic, color: colors.primary },
  sectionLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
  },
  composeRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceLow,
    marginBottom: 24,
  },
  composeAvatar: { width: 32, height: 32, borderRadius: 16 },
  composeInput: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 13,
    outlineStyle: "none" as never,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  commentRow: { flexDirection: "row" as const, gap: 14, marginBottom: 22 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentAuthor: {
    fontFamily: fonts.headlineRegular,
    fontSize: 13,
    color: colors.white,
  },
  commentTime: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.onSurfaceVariant,
  },
  commentBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
    marginVertical: 6,
  },
  commentMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  commentMetaText: { fontSize: 11, color: colors.onSurfaceVariant, fontFamily: fonts.body },

  rightRail: { width: 280 },
  similarRow: { flexDirection: "row" as const, gap: 12 },
  similarCover: { width: 56, height: 56, borderRadius: 8 },
  similarTitle: { fontFamily: fonts.headlineRegular, fontSize: 13, color: colors.white },
  similarAuthor: { fontFamily: fonts.body, fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  similarRead: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.6,
    color: colors.primary,
    marginTop: 4,
  },
};
