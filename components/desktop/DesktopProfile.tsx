import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../lib/auth";
import type { PoemWithStats } from "../../lib/database.types";
import { useNowPlaying } from "../../lib/nowPlaying";
import {
  fetchFollowing,
  fetchFollowStats,
  type PublicUser,
} from "../../lib/follows";
import {
  createPlaylist,
  fetchUserPlaylists,
  type PlaylistWithCount,
} from "../../lib/playlists";
import {
  fetchLikedPoems,
  fetchPoemsByAuthor,
  fetchUserBookmarks,
  fetchUserLikes,
} from "../../lib/poems";
import { shareProfile } from "../../lib/share";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";

type Tab = "poems" | "playlists" | "liked" | "following";

export function DesktopProfile() {
  const router = useRouter();
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("poems");
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [likedPoems, setLikedPoems] = useState<PoemWithStats[]>([]);
  const [likedLoaded, setLikedLoaded] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [shareLabel, setShareLabel] = useState("Share");
  const [playlists, setPlaylists] = useState<PlaylistWithCount[]>([]);
  const [playlistsLoaded, setPlaylistsLoaded] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [followingUsers, setFollowingUsers] = useState<PublicUser[]>([]);
  const [followingLoaded, setFollowingLoaded] = useState(false);

  async function onShare() {
    if (!profile) return;
    const result = await shareProfile(profile.handle, profile.display_name);
    if (result === "copied") {
      setShareLabel("Link copied");
      setTimeout(() => setShareLabel("Share"), 1800);
    } else if (result === "shared") {
      setShareLabel("Shared");
      setTimeout(() => setShareLabel("Share"), 1800);
    } else if (result === "error") {
      setShareLabel("Couldn't share");
      setTimeout(() => setShareLabel("Share"), 1800);
    }
  }

  useEffect(() => {
    if (!profile) return;
    fetchPoemsByAuthor(profile.id).then(setPoems).catch(() => {});
    fetchUserLikes(profile.id).then(setLikedIds).catch(() => {});
    fetchUserBookmarks(profile.id).then(setBookmarkIds).catch(() => {});
    fetchFollowStats(profile.id).then(setFollowStats).catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!profile || tab !== "following" || followingLoaded) return;
    fetchFollowing(profile.id)
      .then(setFollowingUsers)
      .catch(() => setFollowingUsers([]))
      .finally(() => setFollowingLoaded(true));
  }, [profile, tab, followingLoaded]);

  // Lazy-load the user's liked poems (their full rows, not just ids) when the
  // tab is first opened. Re-fetch each time the tab is reopened so likes done
  // elsewhere in the session show up.
  useEffect(() => {
    if (!profile || tab !== "liked") return;
    fetchLikedPoems(profile.id)
      .then(setLikedPoems)
      .catch(() => setLikedPoems([]))
      .finally(() => setLikedLoaded(true));
  }, [profile, tab]);

  // Lazy-load playlists when the tab is first opened.
  useEffect(() => {
    if (!profile || tab !== "playlists" || playlistsLoaded) return;
    fetchUserPlaylists(profile.id)
      .then(setPlaylists)
      .catch(() => setPlaylists([]))
      .finally(() => setPlaylistsLoaded(true));
  }, [profile, tab, playlistsLoaded]);

  async function onCreatePlaylist() {
    if (!profile || creatingPlaylist) return;
    setCreatingPlaylist(true);
    try {
      const created = await createPlaylist(
        profile.id,
        `My Playlist #${playlists.length + 1}`,
      );
      setPlaylists((prev) => [...prev, { ...created, poem_count: 0 }]);
      router.push(`/playlist/${created.id}?edit=1` as never);
    } catch {
      // surface silently; user can retry
    } finally {
      setCreatingPlaylist(false);
    }
  }

  if (!profile) return null;

  const display = poems;
  const firstName = profile.display_name.split(" ")[0];
  const restName = profile.display_name.split(" ").slice(1).join(" ");

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={["rgba(87,244,127,0.18)", "rgba(14,14,14,0.9)", colors.surface]}
          locations={[0, 0.7, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.heroGradient}
        />
        {profile.avatar_url && (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.heroBlur}
            contentFit="cover"
            blurRadius={40}
          />
        )}
      </View>

      <View style={styles.headerRow}>
        <View style={styles.avatarLarge}>
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder]}>
              <Icon name="auto_stories" size={48} color={colors.onSurfaceVariant} />
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          {profile.verified && (
            <View style={styles.verifiedRow}>
              <Icon name="verified" size={14} color={colors.primary} />
              <Text style={styles.verifiedText}>VERIFIED POET</Text>
            </View>
          )}
          <Text style={styles.displayName}>
            {firstName}
            {restName ? (
              <>
                {" "}
                <Text style={styles.displayNameItalic}>{restName}</Text>
              </>
            ) : null}
          </Text>
          <Text style={styles.handle}>@{profile.handle}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={styles.statsRow}>
            <Stat value={poems.length.toLocaleString()} label="POEMS" />
            <View style={styles.statDivider} />
            <Stat value={followStats.followers.toLocaleString()} label="FOLLOWERS" />
            <View style={styles.statDivider} />
            <Pressable onPress={() => setTab("following")}>
              <Stat value={followStats.following.toLocaleString()} label="FOLLOWING" />
            </Pressable>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => router.push("/profile/edit" as never)}
              style={styles.primaryBtn}
            >
              <Icon name="edit_note" size={16} color={colors.onPrimary} />
              <Text style={styles.primaryBtnText}>Edit profile</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/compose")} style={styles.ghostBtn}>
              <Icon name="edit" size={14} color={colors.white} />
              <Text style={styles.ghostBtnText}>Write a poem</Text>
            </Pressable>
            <Pressable onPress={onShare} style={styles.ghostBtn}>
              {(() => {
                const success =
                  shareLabel === "Link copied" || shareLabel === "Shared";
                return (
                  <Icon
                    name={success ? "check" : "ios_share"}
                    size={14}
                    color={success ? colors.primary : colors.white}
                  />
                );
              })()}
              <Text style={styles.ghostBtnText}>{shareLabel}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/settings")}
              style={styles.iconOnlyBtn}
            >
              <Icon name="settings" size={18} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["poems", "playlists", "liked", "following"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.toUpperCase()}
              </Text>
              {active && <View style={styles.tabUnderline} />}
            </Pressable>
          );
        })}
      </View>

      {tab === "poems" && (
        <PoemGrid
          poems={display}
          empty="No poems yet — start your first stanza."
          onOpen={(id) => router.push(`/poem/${id}`)}
          likedIds={likedIds}
        />
      )}
      {tab === "liked" && (
        <PoemGrid
          poems={likedPoems}
          empty={likedLoaded ? "No liked poems yet." : "Loading…"}
          onOpen={(id) => router.push(`/poem/${id}`)}
          likedIds={likedIds}
        />
      )}
      {tab === "playlists" && (
        <View style={styles.section}>
          <View style={styles.playlistsGrid}>
            <Pressable
              onPress={onCreatePlaylist}
              disabled={creatingPlaylist}
              style={[styles.createCard, creatingPlaylist && { opacity: 0.6 }]}
            >
              <View style={styles.createCover}>
                <Icon name="add" size={36} color={colors.white} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {creatingPlaylist ? "Creating…" : "Create playlist"}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                A fresh place for poems you love
              </Text>
            </Pressable>

            {playlistsLoaded &&
              playlists.map((pl) => (
                <Pressable
                  key={pl.id}
                  onPress={() => router.push(`/playlist/${pl.id}` as never)}
                  style={styles.card}
                >
                  <View style={styles.cover}>
                    {pl.cover_url ? (
                      <Image
                        source={{ uri: pl.cover_url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.coverEmpty}>
                        <Icon
                          name="library_books"
                          size={28}
                          color={colors.onSurfaceVariant}
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {pl.name}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {pl.poem_count} {pl.poem_count === 1 ? "POEM" : "POEMS"}
                  </Text>
                </Pressable>
              ))}
          </View>

          {playlistsLoaded && playlists.length === 0 && (
            <Text style={styles.playlistsHint}>
              Tap “Create playlist” to start a new one.
            </Text>
          )}
        </View>
      )}

      {tab === "following" && (
        <View style={styles.section}>
          {!followingLoaded ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Loading…</Text>
            </View>
          ) : followingUsers.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="person_add" size={32} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>You aren&apos;t following anyone yet.</Text>
              <Text style={styles.emptySub}>
                Tap a poet&apos;s name on any poem to visit their profile.
              </Text>
            </View>
          ) : (
            <View style={styles.followingGrid}>
              {followingUsers.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => router.push(`/u/${u.handle}` as never)}
                  style={styles.followCard}
                >
                  <View style={styles.followAvatar}>
                    {u.avatar_url ? (
                      <Image
                        source={{ uri: u.avatar_url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <Icon name="auto_stories" size={28} color={colors.onSurfaceVariant} />
                    )}
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {u.display_name}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    @{u.handle}
                    {u.verified ? " · Verified" : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PoemGrid({
  poems,
  empty,
  onOpen,
  likedIds,
}: {
  poems: PoemWithStats[];
  empty: string;
  onOpen: (id: string) => void;
  likedIds: Set<string>;
}) {
  const play = useNowPlaying((s) => s.play);

  if (poems.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{empty}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.section}>
      <View style={styles.grid}>
        {poems.map((p) => (
          <Pressable key={p.id} onPress={() => onOpen(p.id)} style={styles.card}>
            <View style={styles.cover}>
              {p.cover_url ? (
                <Image
                  source={{ uri: p.cover_url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.coverEmpty}>
                  <Icon name="auto_stories" size={28} color={colors.onSurfaceVariant} />
                </View>
              )}
              <Pressable
                onPress={(e) => {
                  (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
                  play(p);
                }}
                style={styles.coverPlay}
              >
                <Icon name="play_arrow" size={20} color={colors.onPrimary} />
              </Pressable>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {p.title}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardSub} numberOfLines={1}>
                {formatReadTime(p.read_time_seconds).toUpperCase()} · {p.syllables} SYL
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon
                  name="favorite"
                  size={12}
                  color={likedIds.has(p.id) ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={styles.cardSub}>{p.like_count.toLocaleString()}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = {
  flex: { flex: 1, backgroundColor: colors.surface },

  heroWrap: { height: 280, position: "relative" as const },
  heroGradient: {
    position: "absolute" as const,
    inset: 0,
    zIndex: 2,
  } as never,
  heroBlur: {
    position: "absolute" as const,
    inset: 0,
    width: "100%" as const,
    height: "100%" as const,
    opacity: 0.4,
  } as never,

  headerRow: {
    marginTop: -120,
    paddingHorizontal: 40,
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    gap: 32,
    zIndex: 3,
  },
  avatarLarge: {
    width: 200,
    height: 200,
    borderRadius: 24,
    overflow: "hidden" as const,
    backgroundColor: colors.surfaceLow,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerInfo: { flex: 1, minWidth: 0, paddingBottom: 8 },
  verifiedRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 8,
  },
  verifiedText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.4,
    color: colors.primary,
  },
  displayName: {
    fontFamily: fonts.headline,
    fontSize: 56,
    color: colors.white,
    letterSpacing: -1.6,
    lineHeight: 56,
  },
  displayNameItalic: {
    fontFamily: fonts.headlineItalic,
    color: colors.primary,
  },
  handle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  bio: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
    marginTop: 12,
    maxWidth: 640,
  },

  statsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 24,
    marginTop: 20,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statValue: { fontFamily: fonts.headline, fontSize: 22, color: colors.white },
  statLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  actionsRow: {
    marginTop: 24,
    flexDirection: "row" as const,
    gap: 10,
    alignItems: "center" as const,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  ghostBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  ghostBtnText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 13 },
  iconOnlyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  tabRow: {
    flexDirection: "row" as const,
    gap: 32,
    paddingHorizontal: 40,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  tabBtn: { paddingBottom: 12, position: "relative" as const },
  tabText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 2.2,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: { color: colors.white },
  tabUnderline: {
    position: "absolute" as const,
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },

  section: { paddingHorizontal: 40, paddingTop: 28 },
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 18,
  },
  card: {
    width: 220,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
  },
  cover: {
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden" as const,
    marginBottom: 14,
    backgroundColor: colors.surfaceHigh,
    position: "relative" as const,
  },
  coverEmpty: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  coverPlay: {
    position: "absolute" as const,
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardTitle: { fontFamily: fonts.headlineRegular, fontSize: 14, color: colors.white },
  cardMeta: {
    marginTop: 6,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  cardSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  empty: {
    paddingVertical: 60,
    alignItems: "center" as const,
    gap: 12,
  },
  emptyText: { fontFamily: fonts.headlineRegular, fontSize: 16, color: colors.white },
  emptySub: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceVariant },

  playlistsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 18,
  },
  createCard: {
    width: 220,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  createCover: {
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  playlistsHint: {
    marginTop: 20,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  followingGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 18,
  },
  followCard: {
    width: 200,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
    alignItems: "center" as const,
  },
  followAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden" as const,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 14,
  },
};
