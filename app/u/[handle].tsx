import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesktopShell } from "../../components/desktop/DesktopShell";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../lib/auth";
import { useIsDesktop } from "../../lib/breakpoints";
import type { PoemWithStats } from "../../lib/database.types";
import {
  fetchFollowStats,
  fetchUserByHandle,
  followUser,
  isFollowing,
  type PublicUser,
  unfollowUser,
} from "../../lib/follows";
import { fetchPoemsByAuthor } from "../../lib/poems";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts, radius } from "../../theme";

export default function PublicProfileRoute() {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <DesktopShell>
        <PublicProfileScreen />
      </DesktopShell>
    );
  }
  return <PublicProfileScreen />;
}

function PublicProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { user, profile: ownProfile } = useAuth();

  const [target, setTarget] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const isSelf = !!ownProfile && !!target && ownProfile.id === target.id;

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setTarget(null);
    setPoems([]);
    setStats({ followers: 0, following: 0 });
    setFollowing(false);

    (async () => {
      const u = await fetchUserByHandle(handle);
      if (!u) {
        setLoading(false);
        return;
      }
      setTarget(u);
      const [authorPoems, followStats] = await Promise.all([
        fetchPoemsByAuthor(u.id),
        fetchFollowStats(u.id),
      ]);
      setPoems(authorPoems);
      setStats(followStats);
      if (user && user.id !== u.id) {
        setFollowing(await isFollowing(user.id, u.id));
      }
      setLoading(false);
    })();
  }, [handle, user]);

  // Redirect signed-in users viewing their own handle to the editable Profile
  // tab — saves them a roundtrip back.
  useEffect(() => {
    if (isSelf) router.replace("/(tabs)/profile" as never);
  }, [isSelf, router]);

  async function onToggleFollow() {
    if (!user || !target || followBusy || isSelf) return;
    const was = following;
    setFollowing(!was);
    setStats((s) => ({ ...s, followers: Math.max(0, s.followers + (was ? -1 : 1)) }));
    setFollowBusy(true);
    try {
      if (was) await unfollowUser(user.id, target.id);
      else await followUser(user.id, target.id);
    } catch {
      setFollowing(was);
      setStats((s) => ({ ...s, followers: Math.max(0, s.followers + (was ? 1 : -1)) }));
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!target) {
    return (
      <View style={[styles.flex, styles.center, !isDesktop && { paddingTop: insets.top }]}>
        <Icon name="search" size={32} color={colors.onSurfaceVariant} />
        <Text style={styles.emptyText}>No one with that handle.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const firstName = target.display_name.split(" ")[0] ?? target.display_name;
  const restName = target.display_name.split(" ").slice(1).join(" ");

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        { paddingBottom: 80 },
        !isDesktop && { paddingTop: insets.top },
      ]}
    >
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={["rgba(87,244,127,0.18)", "rgba(14,14,14,0.9)", colors.surface]}
          locations={[0, 0.7, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {target.avatar_url && (
          <Image
            source={{ uri: target.avatar_url }}
            style={styles.heroBlur}
            contentFit="cover"
            blurRadius={40}
          />
        )}
        <View style={[styles.heroHeader, isDesktop && { paddingHorizontal: 40 }]}>
          <Pressable onPress={() => router.back()} style={styles.backChip}>
            <Icon name="arrow_back_ios_new" size={14} color={colors.white} />
            <Text style={styles.backChipText}>Back</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.headerRow, isDesktop && styles.headerRowDesktop]}>
        <View style={[styles.avatarLarge, isDesktop && styles.avatarLargeDesktop]}>
          {target.avatar_url ? (
            <Image
              source={{ uri: target.avatar_url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="auto_stories" size={48} color={colors.onSurfaceVariant} />
            </View>
          )}
        </View>

        <View style={[styles.headerInfo, isDesktop && { paddingBottom: 8 }]}>
          {target.verified && (
            <View style={styles.verifiedRow}>
              <Icon name="verified" size={14} color={colors.primary} />
              <Text style={styles.verifiedText}>VERIFIED POET</Text>
            </View>
          )}
          <Text style={[styles.displayName, isDesktop && styles.displayNameDesktop]}>
            {firstName}
            {restName ? (
              <>
                {" "}
                <Text style={styles.displayNameItalic}>{restName}</Text>
              </>
            ) : null}
          </Text>
          <Text style={styles.handle}>@{target.handle}</Text>
          {target.bio ? <Text style={styles.bio}>{target.bio}</Text> : null}

          <View style={styles.statsRow}>
            <Stat value={poems.length.toLocaleString()} label="POEMS" highlight />
            <View style={styles.statDivider} />
            <Stat value={stats.followers.toLocaleString()} label="FOLLOWERS" />
            <View style={styles.statDivider} />
            <Stat value={stats.following.toLocaleString()} label="FOLLOWING" />
          </View>

          {!!user && (
            <View style={styles.actionsRow}>
              <Pressable
                onPress={onToggleFollow}
                disabled={followBusy}
                style={[
                  following ? styles.ghostBtn : styles.primaryBtn,
                  followBusy && { opacity: 0.6 },
                ]}
              >
                {following ? (
                  <>
                    <Icon name="check" size={14} color={colors.white} />
                    <Text style={styles.ghostBtnText}>Following</Text>
                  </>
                ) : (
                  <>
                    <Icon name="person_add" size={14} color={colors.onPrimary} />
                    <Text style={styles.primaryBtnText}>Follow</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.section, isDesktop && { paddingHorizontal: 40 }]}>
        <Text style={styles.sectionLabel}>POEMS BY {firstName.toUpperCase()}</Text>
        {poems.length === 0 ? (
          <Text style={styles.empty}>This poet hasn&apos;t published yet.</Text>
        ) : (
          <View style={styles.grid}>
            {poems.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/poem/${p.id}` as never)}
                style={[styles.card, isDesktop ? styles.cardDesktop : styles.cardMobile]}
              >
                <View style={styles.cover}>
                  {p.cover_url ? (
                    <Image
                      source={{ uri: p.cover_url }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.coverEmpty}>
                      <Icon name="auto_stories" size={26} color={colors.onSurfaceVariant} />
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {p.title}
                </Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {formatReadTime(p.read_time_seconds).toUpperCase()} · {p.syllables} SYL
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="favorite" size={12} color={colors.onSurfaceVariant} />
                    <Text style={styles.cardSub}>{p.like_count.toLocaleString()}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <View>
      <Text style={[styles.statValue, highlight && { color: colors.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },

  heroWrap: { height: 240, position: "relative" },
  heroBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  heroHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    zIndex: 2,
  },
  backChip: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backChipText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodySemiBold },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceHigh,
  },
  backBtnText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 13 },

  headerRow: {
    marginTop: -90,
    paddingHorizontal: 24,
    flexDirection: "column",
    gap: 16,
    zIndex: 3,
  },
  headerRowDesktop: {
    marginTop: -120,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 32,
  },
  avatarLarge: {
    width: 110,
    height: 110,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceLow,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  avatarLargeDesktop: {
    width: 200,
    height: 200,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1, minWidth: 0 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  verifiedText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.4,
    color: colors.primary,
  },
  displayName: {
    fontFamily: fonts.headline,
    fontSize: 36,
    color: colors.white,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  displayNameDesktop: { fontSize: 56, lineHeight: 56, letterSpacing: -1.6 },
  displayNameItalic: { fontFamily: fonts.headlineItalic, color: colors.primary },
  handle: { fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant, marginTop: 6 },
  bio: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
    marginTop: 12,
    maxWidth: 640,
  },

  statsRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 18 },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statValue: { fontFamily: fonts.headline, fontSize: 20, color: colors.white },
  statLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  actionsRow: { marginTop: 18, flexDirection: "row", gap: 10 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: 13 },
  ghostBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  ghostBtnText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 13 },

  section: { paddingHorizontal: 24, paddingTop: 36 },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.4,
    color: colors.onSurfaceVariant,
    marginBottom: 16,
  },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant },
  emptyText: { fontFamily: fonts.headlineRegular, fontSize: 16, color: colors.white },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: { padding: 14, borderRadius: 16, backgroundColor: colors.surfaceLow },
  cardDesktop: { width: 220, padding: 16 },
  cardMobile: { width: "100%" },
  cover: {
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: colors.surfaceHigh,
  },
  coverEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: fonts.headlineRegular, fontSize: 14, color: colors.white },
  cardMeta: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardSub: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant },
});
