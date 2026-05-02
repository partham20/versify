import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { publishPoem } from "../../lib/poems";
import { countSyllables } from "../../lib/syllables";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";

const BACKDROPS = [
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80",
  "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&q=80",
  "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400&q=80",
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80",
];

const ALL_TAGS = ["Love", "Solitude", "Nature", "Urban", "Memory", "Night", "Haiku", "Ocean"];

type Visibility = "public" | "followers" | "draft";

// Strip the browser's default text-input focus ring on web. RN's type defs
// don't expose outlineStyle; we cast through unknown to apply it cleanly.
const NO_OUTLINE = { outlineStyle: "none" } as unknown as never;

const VIS_OPTIONS: Array<{ id: Visibility; icon: string; label: string }> = [
  { id: "public", icon: "public", label: "Public to Versify" },
  { id: "followers", icon: "group", label: "Followers only" },
  { id: "draft", icon: "edit_note", label: "Save as draft" },
];

export function DesktopCompose() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [backdrop, setBackdrop] = useState(0);
  const [tags, setTags] = useState<string[]>(["Solitude"]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const lines = body.split("\n").filter(Boolean).length;
    const syl = countSyllables(body);
    return { lines, syl };
  }, [body]);

  async function publish() {
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const stanzas = body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
      await publishPoem({
        title: title.trim() || "Untitled",
        body: stanzas.length > 0 ? stanzas : [body.trim()],
        tags,
        cover_url: BACKDROPS[backdrop],
        visibility,
      });
      router.replace("/(tabs)");
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.flex}>
      <Image
        source={{ uri: BACKDROPS[backdrop] }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(12,12,12,0.4)", "rgba(12,12,12,0.92)"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.discardBtn}>
          <Icon name="close" size={16} color={colors.white} />
          <Text style={styles.discardText}>Discard</Text>
        </Pressable>

        <View style={styles.savedTag}>
          <View style={styles.savedDot} />
          <Text style={styles.savedText}>AUTO-SAVED</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => {
              setVisibility("draft");
              void publish();
            }}
            style={styles.draftBtn}
          >
            <Text style={styles.draftBtnText}>Save draft</Text>
          </Pressable>
          <Pressable
            onPress={publish}
            disabled={submitting || !body.trim()}
            style={[
              styles.publishBtn,
              { opacity: !body.trim() || submitting ? 0.4 : 1 },
            ]}
          >
            <Text style={styles.publishBtnText}>
              {submitting ? "Publishing…" : "Publish to Versify"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.canvasScroll}
          contentContainerStyle={styles.canvasInner}
        >
          <View style={styles.canvas}>
            <View style={styles.tagRow}>
              <View style={styles.tagDash} />
              <Text style={styles.tagText}>NEW POEM · UNTITLED DRAFT</Text>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Untitled"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={[styles.titleInput, NO_OUTLINE]}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Begin your stanza…"
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              style={[styles.bodyInput, NO_OUTLINE]}
              autoFocus
            />
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        </ScrollView>

        <ScrollView style={styles.settingsRail} contentContainerStyle={{ padding: 24 }}>
          <Text style={styles.railLabel}>LIVE COUNTERS</Text>
          <View style={styles.countersRow}>
            <View style={styles.counter}>
              <Text style={styles.counterValue}>{stats.lines}</Text>
              <Text style={styles.counterLabel}>LINES</Text>
            </View>
            <View style={styles.counter}>
              <Text style={styles.counterValue}>{stats.syl}</Text>
              <Text style={styles.counterLabel}>SYLLABLES</Text>
            </View>
            <View
              style={[
                styles.counter,
                stats.syl === 17 && { backgroundColor: "rgba(87,244,127,0.1)" },
              ]}
            >
              <Text
                style={[
                  styles.counterValue,
                  { color: stats.syl === 17 ? colors.primary : colors.onSurfaceVariant },
                ]}
              >
                {stats.syl === 17 ? "✓" : "17"}
              </Text>
              <Text style={styles.counterLabel}>HAIKU</Text>
            </View>
          </View>

          <Pressable style={styles.recordBtn}>
            <Icon name="mic" size={16} color={colors.error} />
            <Text style={styles.recordText}>RECORD NARRATION</Text>
          </Pressable>

          <Text style={[styles.railLabel, { marginTop: 28 }]}>BACKDROP</Text>
          <View style={styles.backdropGrid}>
            {BACKDROPS.map((b, i) => (
              <Pressable
                key={i}
                onPress={() => setBackdrop(i)}
                style={[
                  styles.backdropCell,
                  i === backdrop && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                <Image source={{ uri: b }} style={styles.backdropImg} contentFit="cover" />
              </Pressable>
            ))}
          </View>

          <Text style={[styles.railLabel, { marginTop: 28 }]}>TAGS</Text>
          <View style={styles.tagsRow}>
            {ALL_TAGS.map((t) => {
              const active = tags.includes(t);
              return (
                <Pressable
                  key={t}
                  onPress={() =>
                    setTags(active ? tags.filter((x) => x !== t) : [...tags, t])
                  }
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && { color: colors.primary }]}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.railLabel, { marginTop: 28 }]}>VISIBILITY</Text>
          <View style={{ gap: 6 }}>
            {VIS_OPTIONS.map((opt) => {
              const active = visibility === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setVisibility(opt.id)}
                  style={[styles.visRow, active && { backgroundColor: "rgba(87,244,127,0.08)" }]}
                >
                  <Icon
                    name={opt.icon}
                    size={16}
                    color={active ? colors.primary : colors.onSurfaceVariant}
                  />
                  <Text style={styles.visLabel}>{opt.label}</Text>
                  {active && <Icon name="check" size={14} color={colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(12,12,12,0.6)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  discardBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discardText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodySemiBold },
  savedTag: {
    backgroundColor: "rgba(87,244,127,0.08)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  savedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  savedText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.6,
  },
  draftBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  draftBtnText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodyBold },
  publishBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  publishBtnText: { color: colors.onPrimary, fontSize: 12, fontFamily: fonts.bodyBold },

  body: { flex: 1, flexDirection: "row" },
  canvasScroll: { flex: 1 },
  canvasInner: { paddingTop: 60, paddingBottom: 100, paddingHorizontal: 80 },
  canvas: { maxWidth: 720, alignSelf: "center", width: "100%" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  tagDash: { width: 24, height: 1, backgroundColor: colors.primary },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.8,
    color: colors.primary,
  },
  titleInput: {
    color: colors.white,
    fontFamily: fonts.headline,
    fontSize: 64,
    letterSpacing: -1.6,
    lineHeight: 64,
    marginBottom: 28,
    backgroundColor: "transparent",
  },
  bodyInput: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 22,
    lineHeight: 34,
    backgroundColor: "transparent",
    minHeight: 400,
    textAlignVertical: "top" as const,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    marginTop: 16,
  },

  settingsRail: {
    width: 320,
    backgroundColor: "rgba(8,8,8,0.7)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.04)",
  },
  railLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.2,
    color: colors.onSurfaceVariant,
    marginBottom: 14,
  },
  countersRow: { flexDirection: "row", gap: 8, marginBottom: 28 },
  counter: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceLow,
  },
  counterValue: {
    fontFamily: fonts.headlineRegular,
    fontSize: 18,
    color: colors.primary,
  },
  counterLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.onSurfaceVariant,
  },
  recordBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  recordText: {
    color: colors.error,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  backdropGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  backdropCell: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
  },
  backdropImg: { width: "100%", height: "100%" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  chipActive: { backgroundColor: colors.primaryChip },
  chipText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
  },
  visRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  visLabel: { color: colors.white, fontSize: 12, fontFamily: fonts.body, flex: 1 },
});
