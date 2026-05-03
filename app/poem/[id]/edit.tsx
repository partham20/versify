import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesktopShell } from "../../../components/desktop/DesktopShell";
import { Icon } from "../../../components/Icon";
import { useAuth } from "../../../lib/auth";
import { useIsDesktop } from "../../../lib/breakpoints";
import type { PoemWithStats } from "../../../lib/database.types";
import { fetchPoem, updatePoem } from "../../../lib/poems";
import { countSyllables } from "../../../lib/syllables";
import { colors, fonts } from "../../../theme";

const BACKDROPS = [
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80",
  "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&q=80",
  "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400&q=80",
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80",
];

const ALL_TAGS = [
  "Love", "Solitude", "Nature", "Urban", "Memory", "Night",
  "Haiku", "Ocean", "Abstract", "Rain",
];

type Visibility = "public" | "followers" | "draft";

const VIS_OPTIONS: Array<{ id: Visibility; icon: string; label: string }> = [
  { id: "public", icon: "public", label: "Public to Versify" },
  { id: "followers", icon: "group", label: "Followers only" },
  { id: "draft", icon: "edit_note", label: "Save as draft" },
];

const NO_OUTLINE = { outlineStyle: "none" } as unknown as never;

export default function EditPoemRoute() {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <DesktopShell>
        <EditPoemScreen />
      </DesktopShell>
    );
  }
  return <EditPoemScreen />;
}

function EditPoemScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [poem, setPoem] = useState<PoemWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPoem(id)
      .then((p) => {
        if (!p) {
          setError("Poem not found.");
          return;
        }
        setPoem(p);
        setTitle(p.title);
        // Join stanzas with a blank line so users see the structure they
        // originally typed; we re-split on \n\s*\n on save.
        setBody(p.body.join("\n\n"));
        setTags(p.tags);
        setVisibility(p.visibility);
        setCoverUrl(p.cover_url);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const stats = useMemo(() => {
    const lines = body.split("\n").filter(Boolean).length;
    const syl = countSyllables(body);
    return { lines, syl };
  }, [body]);

  async function save() {
    if (!poem) return;
    if (!body.trim()) {
      setError("Body can't be empty.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const stanzas = body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
      await updatePoem(poem.id, {
        title: title.trim() || "Untitled",
        body: stanzas.length > 0 ? stanzas : [body.trim()],
        tags,
        cover_url: coverUrl,
        visibility,
      });
      router.replace(`/poem/${poem.id}` as never);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!poem) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.notAllowed}>Poem not found.</Text>
      </View>
    );
  }

  // Server-side RLS already blocks update by non-authors. We additionally
  // hide the form on the client so non-authors get a clear message instead
  // of a save-time error.
  if (user?.id !== poem.author_id) {
    return (
      <View style={[styles.flex, styles.center, { padding: 24 }]}>
        <Icon name="close" size={32} color={colors.error} />
        <Text style={styles.notAllowed}>Only the author can edit this poem.</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scroll,
        isDesktop
          ? { paddingTop: 60, paddingBottom: 60 }
          : { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={[styles.card, isDesktop && styles.cardDesktop]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Icon name="close" size={isDesktop ? 18 : 16} color={colors.white} />
          </Pressable>
          <Text style={styles.title}>Edit poem</Text>
          <Pressable
            onPress={save}
            disabled={submitting}
            style={[styles.saveBtn, { opacity: submitting ? 0.5 : 1 }]}
          >
            <Text style={styles.saveBtnText}>{submitting ? "Saving…" : "Save"}</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Untitled"
          placeholderTextColor={colors.onSurfaceVariant}
          style={[styles.titleInput, NO_OUTLINE]}
          maxLength={120}
        />

        <View style={[styles.metaRow, { marginTop: 16, marginBottom: 12 }]}>
          <Text style={styles.label}>BODY</Text>
          <Text style={styles.metaText}>
            {stats.lines} lines · {stats.syl} syllables
            {stats.syl === 17 ? " · ✓ haiku" : ""}
          </Text>
        </View>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write your stanzas. Separate with a blank line."
          placeholderTextColor={colors.onSurfaceVariant}
          multiline
          style={[styles.bodyInput, NO_OUTLINE]}
        />

        <Text style={[styles.label, { marginTop: 24 }]}>BACKDROP</Text>
        <View style={styles.backdropGrid}>
          {BACKDROPS.map((b) => (
            <Pressable
              key={b}
              onPress={() => setCoverUrl(b)}
              style={[
                styles.backdropCell,
                coverUrl === b && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            >
              <Image source={{ uri: b }} style={styles.backdropImg} contentFit="cover" />
            </Pressable>
          ))}
          <Pressable
            onPress={() => setCoverUrl(null)}
            style={[
              styles.backdropCell,
              styles.backdropClear,
              coverUrl === null && { borderColor: colors.primary, borderWidth: 2 },
            ]}
          >
            <Icon name="close" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>TAGS</Text>
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

        <Text style={[styles.label, { marginTop: 24 }]}>VISIBILITY</Text>
        <View style={{ gap: 6 }}>
          {VIS_OPTIONS.map((opt) => {
            const active = visibility === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setVisibility(opt.id)}
                style={[
                  styles.visRow,
                  active && { backgroundColor: "rgba(87,244,127,0.08)" },
                ]}
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

        {error && (
          <View style={styles.errorBox}>
            <Icon name="close" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  scroll: { paddingHorizontal: 20 },

  card: { width: "100%", alignSelf: "center" },
  cardDesktop: {
    maxWidth: 720,
    backgroundColor: colors.surfaceLow,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: fonts.headline, fontSize: 20, color: colors.white },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  saveBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: 13 },

  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  metaText: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant },

  titleInput: {
    backgroundColor: "transparent",
    color: colors.white,
    fontFamily: fonts.headline,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
    marginTop: 8,
  },
  bodyInput: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    padding: 16,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    minHeight: 220,
    textAlignVertical: "top",
  },

  backdropGrid: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  backdropCell: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 0,
    borderColor: "transparent",
  },
  backdropImg: { width: "100%", height: "100%" },
  backdropClear: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },

  tagsRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  chipActive: { backgroundColor: colors.primaryChip },
  chipText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
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
  visLabel: { color: colors.white, fontSize: 13, fontFamily: fonts.body, flex: 1 },

  errorBox: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.2)",
  },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.error, flex: 1 },

  notAllowed: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.white,
    textAlign: "center",
  },
  backLink: { paddingVertical: 8, paddingHorizontal: 14 },
  backLinkText: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 12 },
});
