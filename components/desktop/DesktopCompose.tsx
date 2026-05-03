import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  isRecordingSupported,
  startRecording,
  uploadAudio,
  type AudioRecorder,
} from "../../lib/audio";
import { useAuth } from "../../lib/auth";
import { ACCEPT_MIMES, COVER_MAX_BYTES, uploadCover } from "../../lib/covers";
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
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverUrl, setCoverUrl] = useState<string>(BACKDROPS[0]);
  // Track whether the active cover is a user upload so we can offer "Remove".
  const [isCustomCover, setIsCustomCover] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement | null>(null);
  const [tags, setTags] = useState<string[]>(["Solitude"]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Narration recording state
  const [recorder, setRecorder] = useState<AudioRecorder | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioFileInput = useRef<HTMLInputElement | null>(null);

  // Tick the elapsed counter while recording.
  useEffect(() => {
    if (!recorder) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    setElapsedMs(0);
    tickRef.current = setInterval(() => {
      setElapsedMs(Date.now() - recorder.startedAt);
    }, 200);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [recorder]);

  const stats = useMemo(() => {
    const lines = body.split("\n").filter(Boolean).length;
    const syl = countSyllables(body);
    return { lines, syl };
  }, [body]);

  async function toggleRecording() {
    setAudioError(null);
    if (recorder) {
      // Stopping
      try {
        const blob = await recorder.stop();
        setRecorder(null);
        if (!user) {
          setAudioError("Sign in to upload narration.");
          return;
        }
        setUploadingAudio(true);
        const url = await uploadAudio(user.id, blob);
        setAudioUrl(url);
      } catch (e) {
        setAudioError(`Recording failed: ${(e as Error).message}`);
      } finally {
        setUploadingAudio(false);
      }
      return;
    }

    // Starting
    if (!isRecordingSupported()) {
      setAudioError("Microphone recording isn't supported in this browser.");
      return;
    }
    try {
      const r = await startRecording();
      setRecorder(r);
    } catch (e) {
      // startRecording() already returns a user-actionable message for
      // common permission / no-device / busy-mic cases.
      setAudioError((e as Error).message);
    }
  }

  function clearAudio() {
    setAudioUrl(null);
    setAudioError(null);
  }

  function pickAudioFile() {
    setAudioError(null);
    audioFileInput.current?.click();
  }

  async function handleAudioFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    if (!user) {
      setAudioError("Sign in to upload narration.");
      return;
    }
    if (!file.type.startsWith("audio/")) {
      setAudioError("That doesn't look like an audio file. Try MP3, M4A, WAV, OGG, or WebM.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setAudioError("Audio file is over 25 MB. Pick something smaller or trim it.");
      return;
    }
    setUploadingAudio(true);
    try {
      const url = await uploadAudio(user.id, file);
      setAudioUrl(url);
    } catch (e) {
      setAudioError(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploadingAudio(false);
    }
  }

  function pickCoverFile() {
    setCoverError(null);
    coverInput.current?.click();
  }

  async function handleCoverFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    if (!user) {
      setCoverError("Sign in to upload a cover.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setCoverError("That doesn't look like an image. Try JPG, PNG, WEBP, or GIF.");
      return;
    }
    if (file.size > COVER_MAX_BYTES) {
      setCoverError("Image is over 10 MB. Pick something smaller.");
      return;
    }
    setUploadingCover(true);
    try {
      const url = await uploadCover(user.id, file, file.type);
      setCoverUrl(url);
      setIsCustomCover(true);
    } catch (e) {
      setCoverError(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploadingCover(false);
    }
  }

  async function publish() {
    if (!body.trim()) return;
    if (recorder) {
      setError("Stop recording before publishing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const stanzas = body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
      await publishPoem({
        title: title.trim() || "Untitled",
        body: stanzas.length > 0 ? stanzas : [body.trim()],
        tags,
        cover_url: coverUrl,
        audio_url: audioUrl,
        visibility,
      });
      router.replace("/(tabs)");
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  const isRecording = !!recorder;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const elapsedLabel = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

  return (
    <View style={styles.flex}>
      <Image
        source={{ uri: coverUrl }}
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

          <Pressable
            onPress={toggleRecording}
            disabled={uploadingAudio}
            style={[
              styles.recordBtn,
              isRecording
                ? { backgroundColor: "rgba(255,107,107,0.18)", borderColor: colors.error }
                : null,
              audioUrl && !isRecording
                ? { backgroundColor: "rgba(87,244,127,0.08)", borderColor: "rgba(87,244,127,0.25)" }
                : null,
            ]}
          >
            {uploadingAudio ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.recordText}>UPLOADING…</Text>
              </>
            ) : isRecording ? (
              <>
                <View style={styles.recDot} />
                <Text style={styles.recordText}>STOP · {elapsedLabel}</Text>
              </>
            ) : audioUrl ? (
              <>
                <Icon name="check_circle" size={16} color={colors.primary} />
                <Text style={[styles.recordText, { color: colors.primary }]}>
                  RE-RECORD NARRATION
                </Text>
              </>
            ) : (
              <>
                <Icon name="mic" size={16} color={colors.error} />
                <Text style={styles.recordText}>RECORD NARRATION</Text>
              </>
            )}
          </Pressable>

          {!isRecording && !uploadingAudio && !audioUrl && (
            <View style={styles.uploadAltRow}>
              <View style={styles.uploadAltLine} />
              <Text style={styles.uploadAltLabel}>OR</Text>
              <View style={styles.uploadAltLine} />
            </View>
          )}

          {!isRecording && !uploadingAudio && !audioUrl && (
            <Pressable onPress={pickAudioFile} style={styles.uploadAudioBtn}>
              <Icon name="add_circle" size={16} color={colors.white} />
              <Text style={styles.uploadAudioText}>UPLOAD AUDIO FILE</Text>
            </Pressable>
          )}

          <input
            ref={audioFileInput}
            type="file"
            accept="audio/*"
            onChange={handleAudioFile}
            style={{ display: "none" }}
          />

          {audioUrl && !isRecording && !uploadingAudio && (
            <View style={styles.audioPreview}>
              {/*
                react-native-web preserves <audio> as a real HTML element when
                rendered inline. Wrapped in a View so it lays out correctly.
              */}
              <View style={{ width: "100%" }}>
                <audio src={audioUrl} controls style={{ width: "100%" }} />
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable onPress={pickAudioFile} style={styles.removeAudioBtn}>
                  <Icon name="add_circle" size={12} color={colors.onSurfaceVariant} />
                  <Text style={styles.removeAudioText}>Replace</Text>
                </Pressable>
                <Pressable onPress={clearAudio} style={styles.removeAudioBtn}>
                  <Icon name="close" size={12} color={colors.onSurfaceVariant} />
                  <Text style={styles.removeAudioText}>Remove narration</Text>
                </Pressable>
              </View>
            </View>
          )}

          {audioError && <Text style={styles.audioErrorText}>{audioError}</Text>}

          <Text style={[styles.railLabel, { marginTop: 28 }]}>BACKDROP</Text>
          <View style={styles.backdropGrid}>
            {isCustomCover && (
              <Pressable
                onPress={() => setIsCustomCover(true)}
                style={[styles.backdropCell, { borderColor: colors.primary, borderWidth: 2 }]}
              >
                <Image
                  source={{ uri: coverUrl }}
                  style={styles.backdropImg}
                  contentFit="cover"
                />
              </Pressable>
            )}
            {BACKDROPS.map((b) => {
              const active = !isCustomCover && coverUrl === b;
              return (
                <Pressable
                  key={b}
                  onPress={() => {
                    setCoverUrl(b);
                    setIsCustomCover(false);
                  }}
                  style={[
                    styles.backdropCell,
                    active && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  <Image source={{ uri: b }} style={styles.backdropImg} contentFit="cover" />
                </Pressable>
              );
            })}
            <Pressable
              onPress={pickCoverFile}
              disabled={uploadingCover}
              style={[styles.backdropCell, styles.uploadCoverTile]}
            >
              {uploadingCover ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Icon name="add_circle" size={20} color={colors.onSurfaceVariant} />
                  <Text style={styles.uploadCoverText}>UPLOAD</Text>
                </>
              )}
            </Pressable>
          </View>

          <input
            ref={coverInput}
            type="file"
            accept={ACCEPT_MIMES}
            onChange={handleCoverFile}
            style={{ display: "none" }}
          />

          {coverError && <Text style={styles.audioErrorText}>{coverError}</Text>}

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
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  audioPreview: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    gap: 8,
  },
  removeAudioBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  removeAudioText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 11,
  },
  audioErrorText: {
    marginTop: 8,
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
  uploadAltRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  uploadAltLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  uploadAltLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  uploadAudioBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  uploadAudioText: {
    color: colors.white,
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
  uploadCoverTile: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  uploadCoverText: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 1.4,
  },
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
