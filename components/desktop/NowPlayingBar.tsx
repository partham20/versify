import { Image } from "expo-image";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useNowPlaying } from "../../lib/nowPlaying";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";

export function NowPlayingBar() {
  const { poem, playing, progress, toggle, setProgress } = useNowPlaying();

  // Fake progress until expo-av is wired up. Mirrors the mobile reader's behavior.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const next = progress >= 1 ? 0 : progress + 0.003;
      setProgress(next);
    }, 200);
    return () => clearInterval(t);
  }, [playing, progress, setProgress]);

  const totalSec = poem ? poem.read_time_seconds : 204;
  const elapsedSec = Math.round(totalSec * progress);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        {poem?.cover_url ? (
          <Image source={{ uri: poem.cover_url }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.coverEmpty]}>
            <Icon name="auto_stories" size={20} color={colors.onSurfaceVariant} />
          </View>
        )}
        <View style={{ minWidth: 0, flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {poem?.title ?? "Nothing playing"}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {poem?.author_name ?? "Press play on a poem to listen"}
          </Text>
        </View>
        {poem && (
          <Pressable>
            <Icon name="favorite" size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <View style={styles.transport}>
          <Pressable>
            <Icon name="shuffle" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable>
            <Icon name="skip_previous" size={20} color={colors.white} />
          </Pressable>
          <Pressable onPress={toggle} style={styles.playBtn}>
            <Icon name={playing ? "pause" : "play_arrow"} size={22} color="#000" />
          </Pressable>
          <Pressable>
            <Icon name="skip_next" size={20} color={colors.white} />
          </Pressable>
          <Pressable>
            <Icon name="repeat" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.timeText}>{fmt(elapsedSec)}</Text>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
            <View style={[styles.trackThumb, { left: `${progress * 100}%` }]} />
          </View>
          <Text style={[styles.timeText, { textAlign: "left" }]}>{fmt(totalSec)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Pressable>
          <Icon name="format_quote" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable>
          <Icon name="library_books" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable>
          <Icon name="volume_up" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
        <View style={styles.volTrack}>
          <View style={styles.volFill} />
        </View>
      </View>
    </View>
  );
}

const styles = {
  bar: {
    height: 78,
    backgroundColor: "#070707",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 24,
    gap: 24,
    flexShrink: 0,
  },
  left: {
    width: 280,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flexShrink: 0,
  },
  cover: { width: 50, height: 50, borderRadius: 8 },
  coverEmpty: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: {
    fontFamily: fonts.headlineRegular,
    fontSize: 13,
    color: colors.white,
  },
  author: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant },
  center: {
    flex: 1,
    alignItems: "center" as const,
    gap: 8,
    maxWidth: 720,
    alignSelf: "center" as const,
  },
  transport: { flexDirection: "row" as const, alignItems: "center" as const, gap: 18 },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  progressRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, width: "100%" as const },
  timeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    minWidth: 32,
    textAlign: "right" as const,
  },
  track: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    position: "relative" as const,
  },
  trackFill: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  trackThumb: {
    position: "absolute" as const,
    top: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.white,
    marginLeft: -4,
  },
  right: {
    width: 280,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    gap: 12,
    flexShrink: 0,
  },
  volTrack: {
    width: 80,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  volFill: { width: "60%" as const, height: 3, backgroundColor: colors.white, borderRadius: 999 },
};
