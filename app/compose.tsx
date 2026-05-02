import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Chip } from "../components/Chip";
import { DesktopCompose } from "../components/desktop/DesktopCompose";
import { Glass } from "../components/Glass";
import { Icon } from "../components/Icon";
import { Particles } from "../components/Particles";
import { useIsDesktop } from "../lib/breakpoints";
import { publishPoem } from "../lib/poems";
import { countSyllables } from "../lib/syllables";
import { colors, fonts, radius } from "../theme";

const BACKDROPS = [
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80",
  "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&q=80",
  "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400&q=80",
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=400&q=80",
];
const ALL_TAGS = ["Love", "Solitude", "Nature", "Urban", "Memory", "Night", "Haiku", "Ocean"];
const STEP_TITLES = ["Write", "Dress it", "Publish"] as const;

type Visibility = "public" | "followers" | "draft";

export default function Compose() {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <DesktopCompose />;
  return <MobileCompose />;
}

function MobileCompose() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recording, setRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [backdrop, setBackdrop] = useState(0);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [tags, setTags] = useState<string[]>(["Solitude"]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const lines = body.split("\n").filter(Boolean).length;
    const syl = countSyllables(body);
    return { lines, syl };
  }, [body]);

  const hapticOnce = useRef(false);
  useEffect(() => {
    if (stats.syl === 17 && !hapticOnce.current) {
      hapticOnce.current = true;
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    } else if (stats.syl !== 17) {
      hapticOnce.current = false;
    }
  }, [stats.syl]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecDuration((d) => d + 0.1), 100);
    return () => clearInterval(t);
  }, [recording]);

  function next() {
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    void publish();
  }

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

  const showBackdrop = step === 1;

  return (
    <View style={styles.flex}>
      {showBackdrop && (
        <>
          <Image source={{ uri: BACKDROPS[backdrop] }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          <LinearGradient
            colors={["rgba(14,14,14,0.4)", "rgba(14,14,14,0.85)"]}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      )}
      <Particles count={6} />

      <View style={styles.header}>
        <Pressable
          onPress={() => (step === 0 ? router.back() : setStep(step - 1))}
          style={styles.headerBtn}
        >
          <Icon name={step === 0 ? "close" : "arrow_back_ios_new"} size={16} color={colors.white} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerStep}>STEP {step + 1} OF 3</Text>
          <Text style={styles.headerTitle}>{STEP_TITLES[step]}</Text>
        </View>
        <Pressable
          onPress={next}
          disabled={(step === 0 && !body.trim()) || submitting}
          style={styles.headerBtnRight}
        >
          <Text
            style={[
              styles.headerAction,
              {
                color:
                  (step === 0 && !body.trim()) || submitting
                    ? colors.onSurfaceVariant
                    : colors.primary,
              },
            ]}
          >
            {step === 2 ? (submitting ? "PUBLISHING…" : "PUBLISH") : "NEXT"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              { backgroundColor: i <= step ? colors.primary : colors.hairlineStrong },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {step === 0 && (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.writePanel}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Untitled"
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.titleInput}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Begin your stanza…"
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              autoFocus
              style={styles.bodyInput}
              selectionColor={colors.primary}
            />
          </ScrollView>
        )}

        {step === 1 && (
          <ScrollView contentContainerStyle={styles.dressPanel}>
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>{title || "Untitled"}</Text>
              <Text style={styles.previewBody}>{body || "Your verses will appear here…"}</Text>
            </View>

            <Text style={styles.sectionLabel}>CHOOSE A BACKDROP</Text>
            <View style={styles.grid}>
              {BACKDROPS.map((b, i) => (
                <Pressable
                  key={i}
                  onPress={() => setBackdrop(i)}
                  style={[
                    styles.gridItem,
                    i === backdrop && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  <Image source={{ uri: b }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                  {i === backdrop && (
                    <View style={styles.gridCheck}>
                      <Icon name="check" size={14} color={colors.onPrimary} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>TAGS</Text>
            <View style={styles.tagWrap}>
              {ALL_TAGS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={tags.includes(t)}
                  onPress={() =>
                    setTags((prev) =>
                      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                    )
                  }
                />
              ))}
            </View>
          </ScrollView>
        )}

        {step === 2 && (
          <ScrollView contentContainerStyle={styles.publishPanel}>
            <View style={styles.finalCard}>
              <Image source={{ uri: BACKDROPS[backdrop] }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.85)"]}
                locations={[0.3, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.finalChips}>
                {tags.slice(0, 3).map((t) => (
                  <Chip key={t} label={t} active />
                ))}
              </View>
              <View style={styles.finalFooter}>
                <Text style={styles.finalTitle}>{title || "Untitled"}</Text>
                <Text style={styles.finalBody} numberOfLines={3}>
                  {body}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>VISIBILITY</Text>
            <View style={{ gap: 8 }}>
              {(
                [
                  { id: "public" as Visibility, icon: "public", label: "Public to Versify", desc: "Visible to all readers" },
                  { id: "followers" as Visibility, icon: "group", label: "Followers only", desc: "Just the inner circle" },
                  { id: "draft" as Visibility, icon: "edit_note", label: "Save as draft", desc: "Keep it private" },
                ] as const
              ).map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setVisibility(v.id)}
                  style={[
                    styles.visRow,
                    visibility === v.id && {
                      backgroundColor: colors.primaryChipFaint,
                      borderColor: colors.primary,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.visIcon,
                      {
                        backgroundColor:
                          visibility === v.id ? colors.primary : colors.surfaceChip,
                      },
                    ]}
                  >
                    <Icon
                      name={v.icon}
                      size={20}
                      color={visibility === v.id ? colors.onPrimary : colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.visLabel}>{v.label}</Text>
                    <Text style={styles.visDesc}>{v.desc}</Text>
                  </View>
                  {visibility === v.id && (
                    <Icon name="check_circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Floating syllable counter (write step only) */}
      {step === 0 && (
        <View pointerEvents="box-none" style={styles.counterWrap}>
          <Glass intensity={40} rounded={radius.xl} style={styles.counter}>
            <View style={styles.counterStats}>
              <View>
                <Text style={styles.counterValue}>{stats.lines}</Text>
                <Text style={styles.counterLabel}>LINES</Text>
              </View>
              <View>
                <Text style={styles.counterValue}>{stats.syl}</Text>
                <Text style={styles.counterLabel}>SYLLABLES</Text>
              </View>
              <View>
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
            <Pressable
              onPress={() => setRecording((r) => !r)}
              style={[
                styles.recBtn,
                {
                  backgroundColor: recording ? colors.error : colors.primary,
                },
              ]}
            >
              <Icon
                name={recording ? "stop" : "mic"}
                size={20}
                color={recording ? colors.white : colors.onPrimary}
              />
            </Pressable>
          </Glass>
          {recording && (
            <Text style={styles.recText}>● RECORDING {recDuration.toFixed(1)}s</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 14,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceChip,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnRight: { paddingHorizontal: 4 },
  headerStep: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2.4, color: colors.onSurfaceVariant },
  headerTitle: { fontFamily: fonts.headline, fontSize: 14, color: colors.white },
  headerAction: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1.6 },
  progressBar: { flexDirection: "row", gap: 4, paddingHorizontal: 20, paddingBottom: 16 },
  progressSegment: { flex: 1, height: 2, borderRadius: 999 },
  writePanel: { paddingHorizontal: 28, paddingBottom: 200, paddingTop: 20 },
  titleInput: {
    fontFamily: fonts.headline,
    fontSize: 32,
    color: colors.white,
    letterSpacing: -0.6,
    marginBottom: 20,
  },
  bodyInput: {
    fontFamily: fonts.body,
    fontSize: 19,
    lineHeight: 30,
    color: colors.white,
    minHeight: 320,
    textAlignVertical: "top",
  },
  dressPanel: { paddingHorizontal: 24, paddingBottom: 80, paddingTop: 20 },
  publishPanel: { paddingHorizontal: 24, paddingBottom: 80, paddingTop: 20 },
  previewCard: {
    padding: 22,
    borderRadius: radius.xl,
    backgroundColor: "rgba(14,14,14,0.55)",
    borderColor: colors.hairline,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 28,
  },
  previewTitle: {
    fontFamily: fonts.headline,
    fontSize: 24,
    color: colors.white,
    letterSpacing: -0.4,
  },
  previewBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.onSurfaceVariant,
    marginTop: 12,
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
    marginTop: 4,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  gridItem: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.surfaceHigh,
  },
  gridCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  finalCard: {
    aspectRatio: 4 / 5,
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: colors.surfaceLow,
  },
  finalChips: { position: "absolute", top: 14, left: 14, flexDirection: "row", gap: 6, flexWrap: "wrap" },
  finalFooter: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 22 },
  finalTitle: {
    fontFamily: fonts.headline,
    fontSize: 28,
    color: colors.white,
    letterSpacing: -0.4,
  },
  finalBody: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 8 },
  visRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceLow,
  },
  visIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  visLabel: { fontFamily: fonts.headlineRegular, fontSize: 14, color: colors.white },
  visDesc: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  counterWrap: {
    position: "absolute",
    bottom: 28,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    width: "100%",
  },
  counterStats: { flexDirection: "row", gap: 18 },
  counterValue: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary },
  counterLabel: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.6, color: colors.onSurfaceVariant },
  recBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  recText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.error, letterSpacing: 1.8, marginTop: 8 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 16 },
});
