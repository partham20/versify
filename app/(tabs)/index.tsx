import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Chip } from "../../components/Chip";
import { DesktopHome } from "../../components/desktop/DesktopHome";
import { Icon } from "../../components/Icon";
import { LineReveal } from "../../components/LineReveal";
import { Particles } from "../../components/Particles";
import { PoemCard } from "../../components/PoemCard";
import { TopBar } from "../../components/TopBar";
import { useAuth } from "../../lib/auth";
import { useIsDesktop } from "../../lib/breakpoints";
import type { PoemWithStats } from "../../lib/database.types";
import {
  fetchFeed,
  fetchUserLikes,
  toggleLike as toggleLikeRemote,
} from "../../lib/poems";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts, radius } from "../../theme";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function HomeFeed() {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <DesktopHome />;
  return <MobileHome />;
}

function MobileHome() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchFeed(20);
    setPoems(data);
    if (user) {
      const likeSet = await fetchUserLikes(user.id);
      setLiked(likeSet);
    }
  }, [user]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onToggleLike(poemId: string) {
    if (!user) return;
    const wasLiked = liked.has(poemId);
    // optimistic
    setLiked((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(poemId);
      else next.add(poemId);
      return next;
    });
    try {
      await toggleLikeRemote(user.id, poemId, wasLiked);
    } catch {
      // revert
      setLiked((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(poemId);
        else next.delete(poemId);
        return next;
      });
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const today = DAYS[new Date().getDay()];
  const hero = poems[0];
  const haikus = poems.filter((p) => p.tags.includes("Haiku")).slice(0, 5);
  const remaining = hero ? poems.slice(1) : poems;

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Particles count={8} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <TopBar avatarUri={profile?.avatar_url ?? undefined} />
        <View style={styles.section}>
          <Text style={styles.tagline}>{today.toUpperCase()} · POEM OF THE DAY</Text>
          <Text style={styles.heading}>
            Your Daily{"\n"}<Text style={styles.headingItalic}>Mix</Text>.
          </Text>

          {hero && (
            <Pressable onPress={() => router.push(`/poem/${hero.id}`)} style={styles.hero}>
              {hero.cover_url ? (
                <Image source={{ uri: hero.cover_url }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.surfaceLow }]} />
              )}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.85)"]}
                locations={[0.3, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.heroChips}>
                {hero.tags.slice(0, 2).map((t) => (
                  <Chip key={t} label={t} active />
                ))}
              </View>
              <View style={styles.heroPlay}>
                <Icon name="play_arrow" size={22} color={colors.onPrimary} />
              </View>
              <View style={styles.heroFooter}>
                <Text style={styles.heroTitle}>
                  {hero.title.split(" ")[0]}
                  {"\n"}
                  <Text style={styles.headingItalic}>
                    {hero.title.split(" ").slice(1).join(" ")}
                  </Text>
                </Text>
                <View style={styles.heroMeta}>
                  {hero.author_avatar && (
                    <Image
                      source={{ uri: hero.author_avatar }}
                      style={styles.heroAvatar}
                      contentFit="cover"
                    />
                  )}
                  <Text style={styles.heroAuthor}>{hero.author_name}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.heroReadTime}>
                    {formatReadTime(hero.read_time_seconds).toUpperCase()}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        </View>

        {haikus.length > 0 && (
          <View style={styles.haikuSection}>
            <View style={styles.haikuHeader}>
              <Text style={styles.sectionTitle}>Trending haikus</Text>
              <Text style={styles.sectionLink}>SEE ALL</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.haikuRail}
            >
              {haikus.map((p) => {
                const lines = (p.body[0] ?? "").split("\n").slice(0, 3);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/poem/${p.id}`)}
                    style={styles.haikuCard}
                  >
                    {lines.map((line, j) => (
                      <LineReveal key={j} delayMs={j * 150}>
                        <Text style={styles.haikuLine}>{line}</Text>
                      </LineReveal>
                    ))}
                    <View style={styles.haikuFooter}>
                      <Text style={styles.haikuHandle}>@{p.author_handle}</Text>
                      <View style={styles.metaInline}>
                        <Icon
                          name="favorite"
                          size={14}
                          color={liked.has(p.id) ? colors.primary : colors.onSurfaceVariant}
                        />
                        <Text style={styles.haikuLikeCount}>
                          {(p.like_count + (liked.has(p.id) ? 1 : 0)).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>From poets you follow</Text>
          <View style={{ gap: 28, marginTop: 20 }}>
            {remaining.map((p) => (
              <PoemCard
                key={p.id}
                poem={p}
                liked={liked.has(p.id)}
                onPress={() => router.push(`/poem/${p.id}`)}
                onToggleLike={() => onToggleLike(p.id)}
              />
            ))}
          </View>
          {remaining.length === 0 && (
            <Text style={styles.empty}>No poems yet. Be the first to publish.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: 140 },
  section: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  tagline: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.primary,
    marginBottom: 8,
  },
  heading: {
    fontFamily: fonts.headline,
    fontSize: 32,
    lineHeight: 34,
    color: colors.white,
    letterSpacing: -0.6,
    marginBottom: 18,
  },
  headingItalic: {
    fontFamily: fonts.headlineItalic,
    color: colors.primary,
  },
  hero: {
    aspectRatio: 4 / 5,
    borderRadius: radius.xxl,
    overflow: "hidden",
    backgroundColor: colors.surfaceLow,
  },
  heroChips: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    gap: 6,
  },
  heroPlay: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  heroTitle: {
    fontFamily: fonts.headline,
    fontSize: 36,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: colors.white,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  heroAvatar: { width: 28, height: 28, borderRadius: 14 },
  heroAuthor: { fontFamily: fonts.headlineRegular, color: colors.white, fontSize: 13 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.4)" },
  heroReadTime: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.onSurfaceVariant,
  },
  haikuSection: { paddingTop: 24, paddingBottom: 8 },
  haikuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontFamily: fonts.headline, color: colors.white, fontSize: 18 },
  sectionLink: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.8, color: colors.primary },
  haikuRail: { paddingHorizontal: 20, gap: 12, paddingBottom: 8 },
  haikuCard: {
    minWidth: 220,
    padding: 22,
    borderRadius: radius.xxl,
    backgroundColor: colors.surfaceLow,
    gap: 6,
  },
  haikuLine: {
    fontFamily: fonts.body,
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  haikuFooter: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  haikuHandle: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant },
  metaInline: { flexDirection: "row", alignItems: "center", gap: 4 },
  haikuLikeCount: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.onSurfaceVariant },
  feedSection: { paddingHorizontal: 20, paddingTop: 24 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: 24,
  },
});
