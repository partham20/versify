import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { DesktopExplore } from "../../components/desktop/DesktopExplore";
import { Icon } from "../../components/Icon";
import { Particles } from "../../components/Particles";
import { TopBar } from "../../components/TopBar";
import { useIsDesktop } from "../../lib/breakpoints";
import type { PoemWithStats } from "../../lib/database.types";
import { searchPoems } from "../../lib/poems";
import { colors, fonts, radius } from "../../theme";

const CATEGORIES = [
  { name: "Melancholy", grad: ["#1e3a8a", "#3b82f6"] as const, img: "https://images.unsplash.com/photo-1502209524164-acea936639a2?w=400&q=80" },
  { name: "Love", grad: ["#9f1239", "#fb7185"] as const, img: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400&q=80" },
  { name: "Abstract", grad: ["#7e22ce", "#c084fc"] as const, img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80" },
  { name: "Nature", grad: ["#065f46", "#34d399"] as const, img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
  { name: "Solitude", grad: ["#1c1917", "#57534e"] as const, img: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=80" },
  { name: "Urban", grad: ["#18181b", "#71717a"] as const, img: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80" },
];

export default function Explore() {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <DesktopExplore />;
  return <ExploreScreen />;
}

function ExploreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PoemWithStats[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const data = await searchPoems(query, 30);
        setResults(data);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <View style={styles.flex}>
      <Particles count={6} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <TopBar title="Search" showAvatar={false} />
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Text style={styles.heading}>Search</Text>
          <View style={styles.searchRow}>
            <Icon name="search" size={20} color={colors.onSurfaceVariant} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="What poem speaks to you?"
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.searchInput}
            />
          </View>
        </View>

        {results.length > 0 ? (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {results.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/poem/${p.id}`)} style={styles.resultRow}>
                {p.cover_url && (
                  <Image source={{ uri: p.cover_url }} style={styles.resultCover} contentFit="cover" />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultTitle}>{p.title}</Text>
                  <Text style={styles.resultAuthor}>{p.author_name}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
              <Text style={styles.section}>Browse moods</Text>
              <View style={styles.grid}>
                {CATEGORIES.map((c) => (
                  <Pressable key={c.name} style={styles.cat}>
                    <LinearGradient colors={c.grad} style={StyleSheet.absoluteFillObject} />
                    <Text style={styles.catName}>{c.name}</Text>
                    <Image source={{ uri: c.img }} style={styles.catImg} contentFit="cover" />
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  heading: {
    fontFamily: fonts.headline,
    fontSize: 32,
    color: colors.white,
    letterSpacing: -0.6,
    marginBottom: 18,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: fonts.headlineRegular,
    fontSize: 14,
    color: colors.white,
  },
  section: { fontFamily: fonts.headline, fontSize: 18, color: colors.white, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cat: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  catName: {
    position: "absolute",
    top: 16,
    left: 16,
    fontFamily: fonts.headline,
    color: colors.white,
    fontSize: 19,
    letterSpacing: -0.2,
  },
  catImg: {
    position: "absolute",
    bottom: -10,
    right: -16,
    width: "70%",
    height: "70%",
    borderRadius: 12,
    transform: [{ rotate: "12deg" }],
    opacity: 0.85,
  },
  resultRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  resultCover: { width: 56, height: 56, borderRadius: radius.md },
  resultTitle: { fontFamily: fonts.headline, fontSize: 14, color: colors.white },
  resultAuthor: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
});
