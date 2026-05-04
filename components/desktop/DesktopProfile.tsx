import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../lib/auth";
import type { PoemWithStats } from "../../lib/database.types";
import { useNowPlaying } from "../../lib/nowPlaying";
import { fetchPoemsByAuthor, fetchUserBookmarks, fetchUserLikes } from "../../lib/poems";
import { shareProfile } from "../../lib/share";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";

type Tab = "poems" | "playlists" | "liked";

export function DesktopProfile() {
  const router = useRouter();
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("poems");
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [shareLabel, setShareLabel] = useState("Share");

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
  }, [profile]);

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
            <Stat value="0" label="FOLLOWERS" />
            <View style={styles.statDivider} />
            <Stat value="0" label="FOLLOWING" />
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
        {(["poems", "playlists", "liked"] as Tab[]).map((t) => {
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
          poems={display.filter((p) => likedIds.has(p.id))}
          empty="No liked poems yet."
          onOpen={(id) => router.push(`/poem/${id}`)}
          likedIds={likedIds}
        />
      )}
      {tab === "playlists" && (
        <View style={styles.section}>
          <View style={styles.empty}>
            <Icon name="library_books" size={32} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>Playlists coming soon.</Text>
            <Text style={styles.emptySub}>Group poems by mood, season, or feeling.</Text>
          </View>
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
};
