import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { PoemWithStats } from "../../lib/database.types";
import { fetchFeed, searchPoems } from "../../lib/poems";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";
import { Particles } from "../Particles";

const CATEGORIES: Array<{
  name: string;
  grad: readonly [string, string];
  img: string;
}> = [
  { name: "Melancholy", grad: ["#1e3a8a", "#3b82f6"], img: "https://images.unsplash.com/photo-1502209524164-acea936639a2?w=400&q=80" },
  { name: "Love", grad: ["#9f1239", "#fb7185"], img: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400&q=80" },
  { name: "Abstract", grad: ["#7e22ce", "#c084fc"], img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80" },
  { name: "Nature", grad: ["#065f46", "#34d399"], img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
  { name: "Solitude", grad: ["#1c1917", "#57534e"], img: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=80" },
  { name: "Urban", grad: ["#18181b", "#71717a"], img: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80" },
  { name: "Memory", grad: ["#831843", "#ec4899"], img: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=400&q=80" },
  { name: "Night", grad: ["#020617", "#1e293b"], img: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&q=80" },
];

const CHIPS = ["All", "Trending", "Haiku", "Sonnet", "Free verse", "Spoken word"];

export function DesktopExplore() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState("All");
  const [results, setResults] = useState<PoemWithStats[]>([]);
  const [trending, setTrending] = useState<PoemWithStats[]>([]);

  useEffect(() => {
    fetchFeed(20).then(setTrending).catch(() => {});
  }, []);

  // When `?q=` changes (e.g. tapping a mood on Home while already on Explore),
  // sync the search input so results update.
  useEffect(() => {
    if (typeof params.q === "string") setQuery(params.q);
  }, [params.q]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await searchPoems(q, 24);
        if (!cancelled) setResults(r);
      } catch {}
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const showResults = query.trim().length > 0;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 60 }}>
      <Particles count={8} />

      <View style={styles.heroSection}>
        <Text style={styles.kicker}>SEARCH</Text>
        <Text style={styles.heading}>
          What poem speaks <Text style={styles.italicGreen}>to you?</Text>
        </Text>

        <View style={styles.searchBox}>
          <Icon name="search" size={20} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Try 'rain at midnight' or 'urban solitude'…"
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.searchInput}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} style={styles.clearBtn}>
              <Icon name="close" size={14} color={colors.onSurfaceVariant} />
            </Pressable>
          )}
        </View>

        <View style={styles.chipsRow}>
          {CHIPS.map((c) => {
            const active = filter === c;
            return (
              <Pressable
                key={c}
                onPress={() => setFilter(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {showResults ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {results.length} <Text style={styles.italicGreen}>matches</Text>
            </Text>
          </View>
          {results.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="search" size={32} color={colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>No matches yet — keep typing.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {results.map((p) => (
                <PoemCard key={p.id} poem={p} onOpen={() => router.push(`/poem/${p.id}`)} />
              ))}
            </View>
          )}
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Browse <Text style={styles.italicGreen}>moods</Text>
              </Text>
            </View>
            <View style={styles.moodGrid}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.name}
                  onPress={() => setQuery(c.name)}
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

          {trending.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Trending <Text style={styles.italicGreen}>now</Text>
                </Text>
                <Text style={styles.sectionLink}>SHOW ALL →</Text>
              </View>
              <View style={styles.grid}>
                {trending.slice(0, 12).map((p) => (
                  <PoemCard key={p.id} poem={p} onOpen={() => router.push(`/poem/${p.id}`)} />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function PoemCard({ poem, onOpen }: { poem: PoemWithStats; onOpen: () => void }) {
  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <View style={styles.cover}>
        {poem.cover_url ? (
          <Image
            source={{ uri: poem.cover_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View style={styles.coverEmpty}>
            <Icon name="auto_stories" size={28} color={colors.onSurfaceVariant} />
          </View>
        )}
        <View style={styles.coverPlay}>
          <Icon name="play_arrow" size={20} color={colors.onPrimary} />
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {poem.title}
      </Text>
      <Text style={styles.cardSub} numberOfLines={1}>
        {poem.author_name}
      </Text>
      <Text style={styles.cardMeta}>
        {formatReadTime(poem.read_time_seconds).toUpperCase()} ·{" "}
        {poem.like_count.toLocaleString()} ♥
      </Text>
    </Pressable>
  );
}

const styles = {
  flex: { flex: 1, backgroundColor: colors.surface },

  heroSection: {
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 24,
    maxWidth: 1100,
    width: "100%" as const,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.8,
    color: colors.primary,
    marginBottom: 12,
  },
  heading: {
    fontFamily: fonts.headline,
    fontSize: 56,
    lineHeight: 56,
    color: colors.white,
    letterSpacing: -1.6,
  },
  italicGreen: { fontFamily: fonts.headlineItalic, color: colors.primary },

  searchBox: {
    marginTop: 28,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    maxWidth: 720,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
    outlineStyle: "none" as never,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  chipsRow: {
    marginTop: 16,
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  chipActive: { backgroundColor: colors.primaryChip },
  chipText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  chipTextActive: { color: colors.primary },

  section: { paddingHorizontal: 40, paddingTop: 32 },
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
  sectionLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
  },

  moodGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 14,
  },
  moodCard: {
    width: 200,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  moodName: {
    position: "absolute" as const,
    top: 14,
    left: 14,
    fontFamily: fonts.headline,
    fontSize: 18,
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
  cardSub: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 4 },
  cardMeta: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },

  empty: {
    paddingVertical: 60,
    alignItems: "center" as const,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
};
