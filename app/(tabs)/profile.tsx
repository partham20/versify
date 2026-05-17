import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GhostButton, PrimaryButton } from "../../components/Buttons";
import { DesktopProfile } from "../../components/desktop/DesktopProfile";
import { Icon } from "../../components/Icon";
import { Particles } from "../../components/Particles";
import { TopBar } from "../../components/TopBar";
import { useAuth } from "../../lib/auth";
import { useIsDesktop } from "../../lib/breakpoints";
import type { PoemWithStats } from "../../lib/database.types";
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
import { fetchLikedPoems, fetchPoemsByAuthor } from "../../lib/poems";
import { shareProfile } from "../../lib/share";
import { colors, fonts, radius } from "../../theme";

type Tab = "poems" | "playlists" | "liked" | "following";

export default function Profile() {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <DesktopProfile />;
  return <ProfileScreen />;
}

function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("poems");
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [stats, setStats] = useState({ poems: 0, followers: 0, following: 0 });
  const [shareLabel, setShareLabel] = useState("Share");
  const [playlists, setPlaylists] = useState<PlaylistWithCount[]>([]);
  const [playlistsLoaded, setPlaylistsLoaded] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [likedPoems, setLikedPoems] = useState<PoemWithStats[]>([]);
  const [likedLoaded, setLikedLoaded] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<PublicUser[]>([]);
  const [followingLoaded, setFollowingLoaded] = useState(false);

  async function onShare() {
    if (!profile) return;
    const result = await shareProfile(profile.handle, profile.display_name);
    if (result === "copied") {
      setShareLabel("Copied");
      setTimeout(() => setShareLabel("Share"), 1800);
    } else if (result === "shared") {
      setShareLabel("Shared");
      setTimeout(() => setShareLabel("Share"), 1800);
    } else if (result === "error") {
      setShareLabel("Failed");
      setTimeout(() => setShareLabel("Share"), 1800);
    }
  }

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const list = await fetchPoemsByAuthor(profile.id);
      setPoems(list);
      setStats((s) => ({ ...s, poems: list.length }));
    })();
    fetchFollowStats(profile.id)
      .then(({ followers, following }) =>
        setStats((s) => ({ ...s, followers, following })),
      )
      .catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!profile || tab !== "following") return;
    fetchFollowing(profile.id)
      .then(setFollowingUsers)
      .catch(() => setFollowingUsers([]))
      .finally(() => setFollowingLoaded(true));
  }, [profile, tab]);

  // Lazy-load playlists when the tab is first opened.
  useEffect(() => {
    if (!profile || tab !== "playlists" || playlistsLoaded) return;
    fetchUserPlaylists(profile.id)
      .then(setPlaylists)
      .catch(() => setPlaylists([]))
      .finally(() => setPlaylistsLoaded(true));
  }, [profile, tab, playlistsLoaded]);

  // Lazy-load liked poems. Re-fetch each time the tab is reopened so likes
  // toggled elsewhere in the session show up.
  useEffect(() => {
    if (!profile || tab !== "liked") return;
    fetchLikedPoems(profile.id)
      .then(setLikedPoems)
      .catch(() => setLikedPoems([]))
      .finally(() => setLikedLoaded(true));
  }, [profile, tab]);

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

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={["rgba(87,244,127,0.18)", "transparent"]}
        style={[StyleSheet.absoluteFillObject, { height: 360 }]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.2, y: 1 }}
      />
      <Particles count={5} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <TopBar
          title="Profile"
          showAvatar={false}
          action={
            <Pressable onPress={() => router.push("/settings")} style={styles.iconBtn}>
              <Icon name="settings" size={20} color={colors.white} />
            </Pressable>
          }
        />
        <View style={styles.header}>
          <View style={styles.avatarBig}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: colors.surfaceHigh }} />
            )}
          </View>
          {profile.verified && (
            <View style={styles.verifiedRow}>
              <Icon name="verified" size={14} color={colors.primary} />
              <Text style={styles.verifiedText}>VERIFIED POET</Text>
            </View>
          )}
          <Text style={styles.name}>
            {profile.display_name.split(" ")[0]}
            {profile.display_name.includes(" ") && (
              <>
                {"\n"}
                <Text style={styles.nameItalic}>
                  {profile.display_name.split(" ").slice(1).join(" ")}
                </Text>
              </>
            )}
          </Text>
          {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View style={styles.statsRow}>
            {[
              [String(stats.poems), "POEMS"],
              [stats.followers.toString(), "FOLLOWERS"],
              [stats.following.toString(), "FOLLOWING"],
            ].map(([v, l], i) => (
              <Pressable
                key={l}
                onPress={() => l === "FOLLOWING" && setTab("following")}
                disabled={l !== "FOLLOWING"}
              >
                <Text style={[styles.statValue, i === 0 && { color: colors.primary }]}>{v}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <PrimaryButton
              label="Edit Profile"
              style={{ flex: 1 }}
              onPress={() => router.push("/profile/edit" as never)}
            />
            <GhostButton label={shareLabel} style={{ width: 110 }} onPress={onShare} />
          </View>
        </View>

        <View style={styles.tabsRow}>
          {(["poems", "playlists", "liked", "following"] as Tab[]).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
              <Text style={[styles.tabLabel, tab === t && { color: colors.white }]}>
                {t.toUpperCase()}
              </Text>
              {tab === t && <View style={styles.tabUnderline} />}
            </Pressable>
          ))}
        </View>

        {tab === "poems" && (
          <View style={{ padding: 20, gap: 12 }}>
            {poems.length === 0 ? (
              <Text style={styles.empty}>No poems published yet.</Text>
            ) : (
              poems.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/poem/${p.id}`)}
                  style={styles.poemTile}
                >
                  <Text style={styles.poemTitle}>{p.title}</Text>
                  <Text style={styles.poemExcerpt} numberOfLines={3}>
                    {p.body[0]?.replace(/\n/g, " ") ?? ""}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        {tab === "playlists" && (
          <View style={{ padding: 20, gap: 12 }}>
            <Pressable
              onPress={onCreatePlaylist}
              disabled={creatingPlaylist}
              style={[styles.createPlaylistBtn, creatingPlaylist && { opacity: 0.6 }]}
            >
              <View style={styles.createPlaylistIcon}>
                <Icon name="add" size={20} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.createPlaylistTitle}>
                  {creatingPlaylist ? "Creating…" : "Create playlist"}
                </Text>
                <Text style={styles.createPlaylistSub}>
                  A fresh place for poems you love
                </Text>
              </View>
            </Pressable>

            {!playlistsLoaded ? (
              <Text style={styles.empty}>Loading…</Text>
            ) : playlists.length === 0 ? (
              <Text style={styles.empty}>
                You haven&apos;t created any playlists yet.
              </Text>
            ) : (
              playlists.map((pl) => (
                <Pressable
                  key={pl.id}
                  onPress={() => router.push(`/playlist/${pl.id}` as never)}
                  style={styles.playlistRow}
                >
                  {pl.cover_url ? (
                    <Image
                      source={{ uri: pl.cover_url }}
                      style={styles.playlistThumb}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.playlistThumb, styles.playlistThumbEmpty]}>
                      <Icon
                        name="library_books"
                        size={22}
                        color={colors.onSurfaceVariant}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.playlistName} numberOfLines={1}>
                      {pl.name}
                    </Text>
                    <Text style={styles.playlistMeta} numberOfLines={1}>
                      {pl.poem_count} {pl.poem_count === 1 ? "poem" : "poems"}
                    </Text>
                  </View>
                  <Icon
                    name="arrow_forward_ios"
                    size={14}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              ))
            )}
          </View>
        )}
        {tab === "liked" && (
          <View style={{ padding: 20, gap: 12 }}>
            {!likedLoaded ? (
              <Text style={styles.empty}>Loading…</Text>
            ) : likedPoems.length === 0 ? (
              <Text style={styles.empty}>No liked poems yet.</Text>
            ) : (
              likedPoems.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/poem/${p.id}`)}
                  style={styles.poemTile}
                >
                  <Text style={styles.poemTitle}>{p.title}</Text>
                  <Text style={styles.poemExcerpt} numberOfLines={3}>
                    {p.body[0]?.replace(/\n/g, " ") ?? ""}
                  </Text>
                  <View style={styles.likedMetaRow}>
                    <Text style={styles.likedAuthor} numberOfLines={1}>
                      {p.author_name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Icon name="favorite" size={12} color={colors.primary} />
                      <Text style={styles.likedCount}>
                        {p.like_count.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {tab === "following" && (
          <View style={{ padding: 20, gap: 10 }}>
            {!followingLoaded ? (
              <Text style={styles.empty}>Loading…</Text>
            ) : followingUsers.length === 0 ? (
              <Text style={styles.empty}>
                You aren&apos;t following anyone yet.
              </Text>
            ) : (
              followingUsers.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => router.push(`/u/${u.handle}` as never)}
                  style={styles.followRow}
                >
                  <View style={styles.followRowAvatar}>
                    {u.avatar_url ? (
                      <Image
                        source={{ uri: u.avatar_url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <Icon
                        name="auto_stories"
                        size={20}
                        color={colors.onSurfaceVariant}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={styles.followRowName} numberOfLines={1}>
                        {u.display_name}
                      </Text>
                      {u.verified && (
                        <Icon name="verified" size={12} color={colors.primary} />
                      )}
                    </View>
                    <Text style={styles.followRowHandle} numberOfLines={1}>
                      @{u.handle}
                    </Text>
                  </View>
                  <Icon
                    name="arrow_forward_ios"
                    size={14}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceChip,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  avatarBig: {
    width: 110,
    height: 110,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceHigh,
  },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 18 },
  verifiedText: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2.4, color: colors.white },
  name: {
    fontFamily: fonts.headline,
    fontSize: 44,
    lineHeight: 44,
    letterSpacing: -0.6,
    color: colors.white,
    marginTop: 6,
  },
  nameItalic: { fontFamily: fonts.headlineItalic, color: colors.primary },
  bio: { fontFamily: fonts.body, color: colors.onSurfaceVariant, fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 280 },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 22 },
  statValue: { fontFamily: fonts.headline, fontSize: 20, color: colors.white },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.8, color: colors.onSurfaceVariant },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 22 },
  tabsRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomColor: colors.hairline,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 14, position: "relative" },
  tabLabel: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, color: colors.onSurfaceVariant },
  tabUnderline: { position: "absolute", bottom: -1, left: 14, right: 14, height: 2, backgroundColor: colors.primary },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant, textAlign: "center", paddingVertical: 32 },
  poemTile: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.surfaceHigh },
  poemTitle: { fontFamily: fonts.headline, fontSize: 16, color: colors.white },
  poemExcerpt: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 6, lineHeight: 18 },

  createPlaylistBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  createPlaylistIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.surfaceBright,
    alignItems: "center",
    justifyContent: "center",
  },
  createPlaylistTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.white },
  createPlaylistSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLow,
  },
  playlistThumb: { width: 52, height: 52, borderRadius: 8 },
  playlistThumbEmpty: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
  playlistMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  likedMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  likedAuthor: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  likedCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  followRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceLow,
  },
  followRowAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  followRowName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
  followRowHandle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
