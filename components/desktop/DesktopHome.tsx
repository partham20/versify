import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../lib/auth";
import type { PoemWithStats } from "../../lib/database.types";
import { useNowPlaying } from "../../lib/nowPlaying";
import { fetchFeed, searchPoems } from "../../lib/poems";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts, radius } from "../../theme";
import { Icon } from "../Icon";
import { Particles } from "../Particles";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CATEGORIES: Array<{
  name: string;
  grad: readonly [string, string];
  img: string;
}> = [
  {
    name: "Melancholy",
    grad: ["#1e3a8a", "#3b82f6"],
    img: "https://images.unsplash.com/photo-1502209524164-acea936639a2?w=400&q=80",
  },
  {
    name: "Love",
    grad: ["#9f1239", "#fb7185"],
    img: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400&q=80",
  },
  {
    name: "Abstract",
    grad: ["#7e22ce", "#c084fc"],
    img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80",
  },
  {
    name: "Nature",
    grad: ["#065f46", "#34d399"],
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
  },
  {
    name: "Solitude",
    grad: ["#1c1917", "#57534e"],
    img: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=80",
  },
  {
    name: "Urban",
    grad: ["#18181b", "#71717a"],
    img: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80",
  },
  {
    name: "Memory",
    grad: ["#78350f", "#fbbf24"],
    img: "https://images.unsplash.com/photo-1474968600831-eaf3a8ed8e21?w=400&q=80",
  },
];

export function DesktopHome() {
  const router = useRouter();
  const { profile } = useAuth();
  const play = useNowPlaying((s) => s.play);
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PoemWithStats[]>([]);

  const load = useCallback(async () => {
    const data = await fetchFeed(20);
    setPoems(data);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await searchPoems(q, 12);
        if (!cancelled) setResults(r);
      } catch {}
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const today = DAYS[new Date().getDay()];
  const hero = poems[0];
  const followFeed = poems.slice(1, 7);
  const recent = poems.slice(0, 8);
  const showResults = query.trim().length > 0;

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.heroBg} pointerEvents="none">
        <LinearGradient
          colors={["rgba(87,244,127,0.12)", "transparent"]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.3, y: 0.6 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 520 }}
        />
      </View>
      <Particles count={10} />

      <View style={styles.topBar}>
        <View style={styles.navArrows}>
          <Pressable style={styles.navArrow}>
            <Icon name="arrow_back_ios_new" size={14} color={colors.white} />
          </Pressable>
          <Pressable style={styles.navArrow}>
            <Icon name="arrow_forward_ios" size={14} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <View style={styles.searchIcon}>
            <Icon name="search" size={18} color={colors.onSurfaceVariant} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="What poem speaks to you?"
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.topRight}>
          <Pressable style={styles.premiumBtn}>
            <Icon name="workspace_premium" size={14} color={colors.primary} />
            <Text style={styles.premiumText}>Premium</Text>
          </Pressable>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.profileBtn} contentFit="cover" />
          ) : (
            <View style={[styles.profileBtn, { backgroundColor: colors.surfaceHigh }]} />
          )}
        </View>
      </View>

      {showResults ? (
        <SearchResults results={results} onOpen={(id) => router.push(`/poem/${id}`)} />
      ) : (
        <>
          {hero && (
            <View style={styles.heroSection}>
              <View style={styles.tagRow}>
                <View style={styles.tagDash} />
                <Text style={styles.tagText}>{today.toUpperCase()} · POEM OF THE DAY</Text>
              </View>
              <View style={styles.heroGrid}>
                <Pressable
                  onPress={() => router.push(`/poem/${hero.id}`)}
                  style={styles.heroCard}
                >
                  {hero.cover_url && (
                    <Image
                      source={{ uri: hero.cover_url }}
                      style={styles.heroImg}
                      contentFit="cover"
                    />
                  )}
                  <LinearGradient
                    colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.85)"]}
                    locations={[0, 0.5, 1]}
                    style={styles.heroOverlay}
                  />
                  <View style={styles.heroChips}>
                    {hero.tags.slice(0, 2).map((t) => (
                      <View key={t} style={styles.chipActive}>
                        <Text style={styles.chipActiveText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.heroFooter}>
                    <Text style={styles.heroTitle}>
                      {hero.title.split(" ")[0]}
                      {"\n"}
                      <Text style={styles.heroTitleItalic}>
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
                      <View style={{ flex: 1 }}>
                        <Text style={styles.heroAuthor}>{hero.author_name}</Text>
                        <Text style={styles.heroSub}>
                          {formatReadTime(hero.read_time_seconds).toUpperCase()} ·{" "}
                          {hero.syllables} SYLLABLES
                        </Text>
                      </View>
                      <Pressable
                        onPress={(e) => {
                          (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
                          play(hero);
                        }}
                        style={styles.heroPlay}
                      >
                        <Icon name="play_arrow" size={28} color={colors.onPrimary} />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>

                <View style={{ gap: 16 }}>
                  <View style={styles.editorNote}>
                    <Text style={styles.editorLabel}>EDITOR'S NOTE</Text>
                    <Text style={styles.editorBody}>
                      "{hero.author_name} treats the verse as a living organism — every line
                      breathes. Read this aloud at dusk."
                    </Text>
                    <Text style={styles.editorByline}>— SORA ITO, EDITOR</Text>
                  </View>
                  <View style={styles.statsGrid}>
                    {[
                      [hero.like_count.toLocaleString(), "LIKES"],
                      [`${hero.comment_count}`, "ECHOES"],
                      [formatReadTime(hero.read_time_seconds), "READ TIME"],
                    ].map(([v, l]) => (
                      <View key={l} style={styles.statCell}>
                        <Text style={styles.statValue}>{v}</Text>
                        <Text style={styles.statLabel}>{l}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Browse <Text style={styles.italicGreen}>moods</Text>
              </Text>
              <Pressable>
                <Text style={styles.sectionLink}>SHOW ALL →</Text>
              </Pressable>
            </View>
            <View style={styles.moodGrid}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.name}
                  onPress={() => router.push("/(tabs)/explore")}
                  style={styles.moodCard}
                >
                  <LinearGradient
                    colors={c.grad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: "absolute", inset: 0 } as never}
                  />
                  <Text style={styles.moodName}>{c.name}</Text>
                  <Image source={{ uri: c.img }} style={styles.moodImg} contentFit="cover" />
                </Pressable>
              ))}
            </View>
          </View>

          {followFeed.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  From poets you <Text style={styles.italicGreen}>follow</Text>
                </Text>
              </View>
              <View style={styles.followGrid}>
                {followFeed.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/poem/${p.id}`)}
                    style={styles.followCard}
                  >
                    <View style={styles.followCover}>
                      {p.cover_url && (
                        <Image
                          source={{ uri: p.cover_url }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      )}
                      <Pressable
                        onPress={(e) => {
                          (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
                          play(p);
                        }}
                        style={styles.followPlay}
                      >
                        <Icon name="play_arrow" size={20} color={colors.onPrimary} />
                      </Pressable>
                    </View>
                    <Text style={styles.followTitle} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={styles.followAuthor} numberOfLines={1}>
                      {p.author_name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {recent.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Recently <Text style={styles.italicGreen}>published</Text>
                </Text>
              </View>
              <View style={styles.tableWrap}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.thCell, { flex: 0.4 }]}>#</Text>
                  <Text style={[styles.thCell, { flex: 3 }]}>TITLE</Text>
                  <Text style={[styles.thCell, { flex: 2 }]}>AUTHOR</Text>
                  <Text style={[styles.thCell, { flex: 2 }]}>TAGS</Text>
                  <Text style={[styles.thCell, { flex: 1, textAlign: "right" }]}>READ</Text>
                  <View style={{ width: 40 }} />
                </View>
                {recent.map((p, i) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/poem/${p.id}`)}
                    style={[
                      styles.tableRow,
                      i < recent.length - 1 && styles.tableRowBorder,
                    ]}
                  >
                    <Text style={[styles.tdCell, { flex: 0.4, color: colors.onSurfaceVariant }]}>
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                    <View style={[{ flex: 3, flexDirection: "row", alignItems: "center", gap: 12 }]}>
                      {p.cover_url ? (
                        <Image
                          source={{ uri: p.cover_url }}
                          style={styles.rowCover}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.rowCover, { backgroundColor: colors.surfaceHigh }]} />
                      )}
                      <View style={{ minWidth: 0 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {p.published_at
                            ? new Date(p.published_at).toLocaleDateString()
                            : "Draft"}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.tdCell, { flex: 2 }]} numberOfLines={1}>
                      {p.author_name}
                    </Text>
                    <View style={{ flex: 2, flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                      {p.tags.slice(0, 2).map((t) => (
                        <View key={t} style={styles.smallChip}>
                          <Text style={styles.smallChipText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.tdCell,
                        { flex: 1, textAlign: "right", fontFamily: fonts.bodySemiBold },
                      ]}
                    >
                      {formatReadTime(p.read_time_seconds)}
                    </Text>
                    <View style={{ width: 40, alignItems: "flex-end" }}>
                      <Icon name="favorite" size={16} color={colors.onSurfaceVariant} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function SearchResults({
  results,
  onOpen,
}: {
  results: PoemWithStats[];
  onOpen: (id: string) => void;
}) {
  if (results.length === 0) {
    return (
      <View style={[styles.section, { paddingTop: 40 }]}>
        <Text style={styles.empty}>No matches yet — keep typing.</Text>
      </View>
    );
  }
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Search <Text style={styles.italicGreen}>results</Text>
        </Text>
      </View>
      <View style={styles.followGrid}>
        {results.map((p) => (
          <Pressable key={p.id} onPress={() => onOpen(p.id)} style={styles.followCard}>
            <View style={styles.followCover}>
              {p.cover_url && (
                <Image
                  source={{ uri: p.cover_url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              )}
            </View>
            <Text style={styles.followTitle} numberOfLines={1}>
              {p.title}
            </Text>
            <Text style={styles.followAuthor} numberOfLines={1}>
              {p.author_name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = {
  flex: { flex: 1 },
  center: { alignItems: "center" as const, justifyContent: "center" as const },
  heroBg: { position: "absolute" as const, top: 0, left: 0, right: 0, height: 520 },

  topBar: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 24,
    zIndex: 30,
  },
  navArrows: { flexDirection: "row" as const, gap: 8 },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  searchWrap: { width: 360, position: "relative" as const },
  searchIcon: {
    position: "absolute" as const,
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center" as const,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    paddingVertical: 10,
    paddingLeft: 44,
    paddingRight: 16,
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.body,
    outlineStyle: "none" as never,
  },
  topRight: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14 },
  premiumBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  premiumText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodySemiBold },
  profileBtn: { width: 36, height: 36, borderRadius: 18 },

  heroSection: { paddingHorizontal: 40, paddingTop: 20, paddingBottom: 40 },
  tagRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, marginBottom: 16 },
  tagDash: { width: 28, height: 1, backgroundColor: colors.primary },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.4,
    color: colors.primary,
  },
  heroGrid: {
    flexDirection: "row" as const,
    gap: 32,
    alignItems: "stretch" as const,
  },
  heroCard: {
    flex: 1.4,
    minHeight: 360,
    borderRadius: 24,
    overflow: "hidden" as const,
    backgroundColor: colors.surfaceLow,
    position: "relative" as const,
  },
  heroImg: { position: "absolute" as const, inset: 0, width: "100%" as const, height: "100%" as const } as never,
  heroOverlay: { position: "absolute" as const, inset: 0 } as never,
  heroChips: {
    position: "absolute" as const,
    top: 24,
    left: 24,
    flexDirection: "row" as const,
    gap: 6,
  },
  chipActive: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: colors.primaryChip,
  },
  chipActiveText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    letterSpacing: 0.4,
  },
  heroFooter: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
  },
  heroTitle: {
    fontFamily: fonts.headline,
    fontSize: 64,
    lineHeight: 60,
    color: colors.white,
    letterSpacing: -1.6,
  },
  heroTitleItalic: { fontFamily: fonts.headlineItalic, color: colors.primary },
  heroMeta: {
    marginTop: 24,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
  },
  heroAvatar: { width: 36, height: 36, borderRadius: 18 },
  heroAuthor: { fontFamily: fonts.headlineRegular, color: colors.white, fontSize: 14 },
  heroSub: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  heroPlay: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  editorNote: {
    flex: 1,
    padding: 28,
    borderRadius: 24,
    backgroundColor: "rgba(87,244,127,0.04)",
    borderWidth: 1,
    borderColor: "rgba(87,244,127,0.15)",
  },
  editorLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.8,
    color: colors.primary,
  },
  editorBody: {
    fontFamily: fonts.headlineItalic,
    fontSize: 19,
    lineHeight: 26,
    color: colors.white,
    marginTop: 14,
  },
  editorByline: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
    marginTop: 16,
  },
  statsGrid: { flexDirection: "row" as const, gap: 12 },
  statCell: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceLow,
  },
  statValue: { fontFamily: fonts.headline, fontSize: 22, color: colors.primary },
  statLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },

  section: { paddingHorizontal: 40, paddingVertical: 20 },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    justifyContent: "space-between" as const,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.headline,
    fontSize: 28,
    color: colors.white,
    letterSpacing: -0.6,
  },
  italicGreen: { fontFamily: fonts.headlineItalic, color: colors.primary },
  sectionLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
  },

  moodGrid: { flexDirection: "row" as const, gap: 12, flexWrap: "wrap" as const },
  moodCard: {
    flex: 1,
    minWidth: 118,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  moodName: {
    position: "absolute" as const,
    top: 12,
    left: 12,
    fontFamily: fonts.headline,
    fontSize: 15,
    color: colors.white,
    letterSpacing: -0.2,
    zIndex: 2,
  },
  moodImg: {
    position: "absolute" as const,
    bottom: -12,
    right: -16,
    width: "70%" as const,
    height: "70%" as const,
    borderRadius: 10,
    transform: [{ rotate: "15deg" }],
    opacity: 0.85,
  },

  followGrid: { flexDirection: "row" as const, gap: 14, flexWrap: "wrap" as const },
  followCard: {
    flex: 1,
    minWidth: 168,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceLow,
  },
  followCover: {
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden" as const,
    marginBottom: 12,
    backgroundColor: colors.surfaceHigh,
    position: "relative" as const,
  },
  followPlay: {
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
  followTitle: { fontFamily: fonts.headlineRegular, fontSize: 14, color: colors.white },
  followAuthor: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 3,
  },

  tableWrap: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 18,
    overflow: "hidden" as const,
  },
  tableHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  thCell: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
  },
  tableRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  rowCover: { width: 40, height: 40, borderRadius: 6 },
  rowTitle: { fontFamily: fonts.headlineRegular, fontSize: 13, color: colors.white },
  rowSub: { fontFamily: fonts.body, fontSize: 10, color: colors.onSurfaceVariant },
  tdCell: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceVariant },
  smallChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  smallChipText: { fontSize: 10, color: colors.onSurfaceVariant, fontFamily: fonts.bodySemiBold },

  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: "center" as const,
  },
};
