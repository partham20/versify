import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import { AddToPlaylistModal } from "../../../components/AddToPlaylistModal";
import { DesktopReader } from "../../../components/desktop/DesktopReader";
import { DesktopShell } from "../../../components/desktop/DesktopShell";
import { Glass } from "../../../components/Glass";
import { Icon } from "../../../components/Icon";
import { LineReveal } from "../../../components/LineReveal";
import { Particles } from "../../../components/Particles";
import { useAuth } from "../../../lib/auth";
import { useIsDesktop } from "../../../lib/breakpoints";
import type { PoemWithStats } from "../../../lib/database.types";
import {
  deletePoem,
  fetchPoem,
  fetchUserBookmarks,
  fetchUserLikes,
  toggleBookmark as toggleBookmarkRemote,
  toggleLike as toggleLikeRemote,
} from "../../../lib/poems";
import { formatReadTime } from "../../../lib/syllables";
import { colors, fonts, motion, radius } from "../../../theme";

export default function PoemScreen() {
  const isDesktop = useIsDesktop();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [poemForDesktop, setPoemForDesktop] = useState<PoemWithStats | null>(null);

  useEffect(() => {
    if (!isDesktop || !id) return;
    fetchPoem(id).then(setPoemForDesktop).catch(() => {});
  }, [isDesktop, id]);

  if (isDesktop) {
    if (!poemForDesktop) {
      return (
        <DesktopShell>
          <View style={[styles.flex, styles.center]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        </DesktopShell>
      );
    }
    return (
      <DesktopShell>
        <DesktopReader poem={poemForDesktop} />
      </DesktopShell>
    );
  }
  return <MobileReader />;
}

function MobileReader() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [poem, setPoem] = useState<PoemWithStats | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);

  const isAuthor = !!user && !!poem && user.id === poem.author_id;

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as never);
  }

  function confirmDelete() {
    if (!poem) return;
    const msg = `Delete "${poem.title}"? This is permanent and removes likes, bookmarks, and comments too.`;
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(msg)) doDelete();
      return;
    }
    Alert.alert("Delete poem?", msg, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doDelete },
    ]);
  }

  async function doDelete() {
    if (!poem) return;
    setDeleting(true);
    try {
      await deletePoem(poem.id);
      router.replace("/(tabs)" as never);
    } catch (e) {
      setDeleting(false);
      const msg = `Couldn't delete: ${(e as Error).message}`;
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert(msg);
      } else {
        Alert.alert("Delete failed", msg);
      }
    }
  }

  useEffect(() => {
    if (!id) return;
    (async () => {
      const p = await fetchPoem(id);
      setPoem(p);
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const [likes, bookmarks] = await Promise.all([
        fetchUserLikes(user.id),
        fetchUserBookmarks(user.id),
      ]);
      setLiked(likes.has(id));
      setBookmarked(bookmarks.has(id));
    })();
  }, [id, user]);

  // Load the poem's narration into expo-av Audio.Sound when the poem changes.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Tear down whatever is currently loaded before swapping.
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }
      setPlaying(false);
      setProgress(0);
      setDuration(0);
      setAudioError(null);
      if (!poem?.audio_url) return;
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: poem.audio_url },
          { shouldPlay: false },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            const d = status.durationMillis ?? 0;
            const p = status.positionMillis ?? 0;
            setDuration(d / 1000);
            setProgress(d > 0 ? p / d : 0);
            setPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setPlaying(false);
              setProgress(0);
              sound.setPositionAsync(0).catch(() => {});
            }
          }
        );
        if (cancelled) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch (e) {
        if (!cancelled) setAudioError((e as Error).message);
      }
    }
    void load();
    return () => {
      cancelled = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [poem?.id, poem?.audio_url]);

  async function togglePlay() {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      if (playing) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (e) {
      setAudioError((e as Error).message);
    }
  }

  async function onToggleLike() {
    if (!user || !poem) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    try {
      await toggleLikeRemote(user.id, poem.id, wasLiked);
    } catch {
      setLiked(wasLiked);
    }
  }

  async function onToggleBookmark() {
    if (!user || !poem) return;
    const wasBook = bookmarked;
    setBookmarked(!wasBook);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    try {
      await toggleBookmarkRemote(user.id, poem.id, wasBook);
    } catch {
      setBookmarked(wasBook);
    }
  }

  if (!poem) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const titleWords = poem.title.split(" ");
  const headWord = titleWords[0];
  const tailWords = titleWords.slice(1).join(" ");

  return (
    <View style={styles.flex}>
      <View style={styles.coverWrap}>
        {poem.cover_url ? (
          <Image source={{ uri: poem.cover_url }} style={styles.cover} contentFit="cover" />
        ) : null}
        <LinearGradient
          colors={["rgba(14,14,14,0.2)", "rgba(14,14,14,0.7)", colors.surface]}
          locations={[0, 0.5, 0.95]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <Particles count={6} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topNav}>
          <Pressable onPress={goBack} style={styles.navBtn}>
            <Icon name="expand_more" size={22} color={colors.white} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.navOver}>NOW READING</Text>
            <Text style={styles.navBrand}>VERSIFY</Text>
          </View>
          {isAuthor ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => router.push(`/poem/${poem.id}/edit` as never)}
                style={styles.navBtn}
              >
                <Icon name="edit" size={18} color={colors.white} />
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                disabled={deleting}
                style={[styles.navBtn, { opacity: deleting ? 0.5 : 1 }]}
              >
                <Icon name="close" size={18} color={colors.error} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setAddToPlaylistOpen(true)}
              style={styles.navBtn}
              accessibilityLabel="Add to playlist"
            >
              <Icon name="playlist_add" size={20} color={colors.white} />
            </Pressable>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.tagRow}>
            <View style={styles.tagBar} />
            <Text style={styles.tagText}>{poem.tags.join(" · ").toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>
            {headWord}
            {tailWords ? "\n" : ""}
            {tailWords && <Text style={styles.titleItalic}>{tailWords}</Text>}
          </Text>

          <Pressable
            onPress={() =>
              poem.author_handle && router.push(`/u/${poem.author_handle}` as never)
            }
            style={styles.authorRow}
          >
            {poem.author_avatar && (
              <Image source={{ uri: poem.author_avatar }} style={styles.authorAvatar} contentFit="cover" />
            )}
            <View>
              <Text style={styles.authorName}>{poem.author_name}</Text>
              <Text style={styles.authorMeta}>
                PUBLISHED {poem.published_at ? new Date(poem.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase() : "—"}
              </Text>
            </View>
          </Pressable>

          <View style={styles.article}>
            {poem.body.map((stanza, i) =>
              stanza.split("\n").map((line, j) => {
                const globalIndex = poem.body
                  .slice(0, i)
                  .reduce((acc, s) => acc + s.split("\n").length, 0) + j;
                return (
                  <LineReveal
                    key={`${i}-${j}`}
                    delayMs={globalIndex * motion.lineStaggerMs}
                  >
                    <Text style={styles.line}>{line}</Text>
                  </LineReveal>
                );
              })
            )}
          </View>

          <View style={styles.statsCard}>
            {[
              [formatReadTime(poem.read_time_seconds), "READ TIME"],
              [String(poem.syllables), "SYLLABLES"],
              [String(poem.like_count + (liked ? 1 : 0)), "LIKES"],
            ].map(([v, l], i) => (
              <View key={l} style={[styles.statCol, i > 0 && styles.statColBorder]}>
                <Text style={styles.statValue}>{v}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <View style={{ flexDirection: "row", gap: 22 }}>
              <Pressable onPress={onToggleLike} style={styles.action}>
                <Icon
                  name="favorite"
                  size={22}
                  color={liked ? colors.primary : colors.white}
                />
                <Text style={styles.actionLabel}>
                  {(poem.like_count + (liked ? 1 : 0)).toLocaleString()}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push(`/comments/${poem.id}`)}
                style={styles.action}
              >
                <Icon name="chat_bubble" size={22} color={colors.white} />
                <Text style={styles.actionLabel}>{poem.comment_count}</Text>
              </Pressable>
              <Pressable onPress={() => setAddToPlaylistOpen(true)} style={styles.action}>
                <Icon name="playlist_add" size={22} color={colors.white} />
                <Text style={styles.actionLabel}>ADD TO</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={onToggleBookmark}
              style={[
                styles.bookmarkBtn,
                { backgroundColor: bookmarked ? colors.primary : colors.white },
              ]}
            >
              <Icon
                name="bookmark"
                size={22}
                color={bookmarked ? colors.onPrimary : colors.black}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Glass audio player */}
      {poem.audio_url && (
        <View style={styles.player}>
          <Glass intensity={40} rounded={radius.xl} style={{ padding: 16 }}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
            </View>
            <View style={styles.playerRow}>
              <View style={styles.playerLeft}>
                <View style={styles.playerCover}>
                  <Icon name="graphic_eq" size={20} color={colors.onPrimary} />
                </View>
                <View>
                  <Text style={styles.playerTitle}>
                    Narrated by {poem.author_name.split(" ")[0]}
                  </Text>
                  <Text style={styles.playerSub}>
                    {audioError
                      ? "AUDIO UNAVAILABLE"
                      : duration > 0
                        ? `${Math.floor((duration * progress) / 60)}:${String(Math.floor((duration * progress) % 60)).padStart(2, "0")} / ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`
                        : "LOADING…"}
                  </Text>
                </View>
              </View>
              <View style={styles.playerControls}>
                <Pressable>
                  <Icon name="skip_previous" size={22} color={colors.onSurfaceVariant} />
                </Pressable>
                <Pressable onPress={togglePlay} style={styles.playBtn}>
                  <Icon
                    name={playing ? "pause" : "play_arrow"}
                    size={26}
                    color={colors.black}
                  />
                </Pressable>
                <Pressable>
                  <Icon name="skip_next" size={22} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>
            </View>
          </Glass>
        </View>
      )}

      <AddToPlaylistModal
        visible={addToPlaylistOpen}
        poemId={poem.id}
        onClose={() => setAddToPlaylistOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },
  coverWrap: { position: "absolute", top: 0, left: 0, right: 0, height: 480, overflow: "hidden" },
  cover: { width: "100%", height: "100%", opacity: 0.7 },
  content: { paddingBottom: 200 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 14,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(38,38,38,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  navOver: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2.4, color: colors.onSurfaceVariant },
  navBrand: { fontFamily: fonts.headline, fontSize: 11, letterSpacing: 2, color: colors.white },
  body: { paddingHorizontal: 28, paddingTop: 40 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  tagBar: { width: 22, height: 1, backgroundColor: colors.primary },
  tagText: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2.4, color: colors.primary },
  title: {
    fontFamily: fonts.headline,
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: -0.8,
    color: colors.white,
  },
  titleItalic: { fontFamily: fonts.headlineItalic, color: colors.primary },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24 },
  authorAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  authorName: { fontFamily: fonts.headlineRegular, fontSize: 13, color: colors.white },
  authorMeta: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.8, color: colors.onSurfaceVariant, marginTop: 2 },
  article: { marginTop: 50, gap: 8 },
  line: {
    fontFamily: fonts.body,
    fontSize: 19,
    lineHeight: 30,
    color: colors.white,
  },
  statsCard: {
    marginTop: 48,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceLow,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCol: { flex: 1, alignItems: "center" },
  statColBorder: { borderLeftColor: colors.hairline, borderLeftWidth: StyleSheet.hairlineWidth },
  statValue: { fontFamily: fonts.headline, fontSize: 18, color: colors.primary },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.8, color: colors.onSurfaceVariant, marginTop: 2 },
  actionsRow: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  action: { alignItems: "center", gap: 4 },
  actionLabel: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.5, color: colors.onSurfaceVariant },
  bookmarkBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  player: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
  progressTrack: {
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 14,
  },
  progressFill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: colors.primary, borderRadius: 999 },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    marginLeft: -5,
  },
  playerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  playerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  playerCover: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  playerTitle: { fontFamily: fonts.headlineRegular, fontSize: 12, color: colors.white },
  playerSub: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 1.8, color: colors.primary },
  playerControls: { flexDirection: "row", alignItems: "center", gap: 14 },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
