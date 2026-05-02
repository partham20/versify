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
import * as Haptics from "expo-haptics";
import { DesktopReader } from "../../components/desktop/DesktopReader";
import { DesktopShell } from "../../components/desktop/DesktopShell";
import { Glass } from "../../components/Glass";
import { Icon } from "../../components/Icon";
import { LineReveal } from "../../components/LineReveal";
import { Particles } from "../../components/Particles";
import { useAuth } from "../../lib/auth";
import { useIsDesktop } from "../../lib/breakpoints";
import type { PoemWithStats } from "../../lib/database.types";
import {
  fetchPoem,
  fetchUserBookmarks,
  fetchUserLikes,
  toggleBookmark as toggleBookmarkRemote,
  toggleLike as toggleLikeRemote,
} from "../../lib/poems";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts, motion, radius } from "../../theme";

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

  // Fake playback progress until expo-av is wired up to a real audio file.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.005));
    }, 200);
    return () => clearInterval(t);
  }, [playing]);

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
          <Pressable onPress={() => router.back()} style={styles.navBtn}>
            <Icon name="expand_more" size={22} color={colors.white} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.navOver}>NOW READING</Text>
            <Text style={styles.navBrand}>VERSIFY</Text>
          </View>
          <Pressable style={styles.navBtn}>
            <Icon name="more_horiz" size={20} color={colors.white} />
          </Pressable>
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

          <View style={styles.authorRow}>
            {poem.author_avatar && (
              <Image source={{ uri: poem.author_avatar }} style={styles.authorAvatar} contentFit="cover" />
            )}
            <View>
              <Text style={styles.authorName}>{poem.author_name}</Text>
              <Text style={styles.authorMeta}>
                PUBLISHED {poem.published_at ? new Date(poem.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase() : "—"}
              </Text>
            </View>
          </View>

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
              <Pressable style={styles.action}>
                <Icon name="ios_share" size={22} color={colors.white} />
                <Text style={styles.actionLabel}>SEND</Text>
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
                  <Text style={styles.playerSub}>DOLBY ATMOS</Text>
                </View>
              </View>
              <View style={styles.playerControls}>
                <Pressable>
                  <Icon name="skip_previous" size={22} color={colors.onSurfaceVariant} />
                </Pressable>
                <Pressable
                  onPress={() => setPlaying((p) => !p)}
                  style={styles.playBtn}
                >
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
