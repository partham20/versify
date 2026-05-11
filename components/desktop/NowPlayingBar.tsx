import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useNowPlaying } from "../../lib/nowPlaying";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";

export function NowPlayingBar() {
  const poem = useNowPlaying((s) => s.poem);
  const playing = useNowPlaying((s) => s.playing);
  const progress = useNowPlaying((s) => s.progress);
  const duration = useNowPlaying((s) => s.duration);
  const seekRequest = useNowPlaying((s) => s.seekRequest);
  const setPlaying = useNowPlaying((s) => s.setPlaying);
  const setProgress = useNowPlaying((s) => s.setProgress);
  const setDuration = useNowPlaying((s) => s.setDuration);
  const toggle = useNowPlaying((s) => s.toggle);
  const seek = useNowPlaying((s) => s.seek);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  const hasAudio = !!poem?.audio_url;

  // Load a fresh audio source when the poem (or its url) changes.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const audio = audioRef.current;
    if (!audio) return;
    if (!poem?.audio_url) {
      audio.removeAttribute("src");
      audio.load();
      return;
    }
    audio.src = poem.audio_url;
    audio.load();
  }, [poem?.id, poem?.audio_url]);

  // Mirror the `playing` boolean onto the audio element. Browsers may reject
  // play() if there hasn't been a user gesture; we surface that by flipping
  // the store back to paused.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, hasAudio, poem?.audio_url, setPlaying]);

  // Apply seek requests from the store (clicking the progress bar).
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const audio = audioRef.current;
    if (!audio || !audio.duration || !isFinite(audio.duration)) return;
    audio.currentTime = audio.duration * seekRequest.value;
  }, [seekRequest.token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to the audio element's events ONCE.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!audio.duration || !isFinite(audio.duration)) return;
      setProgress(audio.currentTime / audio.duration);
    };
    const onLoaded = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => {
      setProgress(0);
      setPlaying(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [setProgress, setDuration, setPlaying]);

  // For poems with no audio, the read_time_seconds gives us SOMETHING to
  // show in the bar; we just leave the play button disabled.
  const totalSec = duration > 0 ? Math.round(duration) : poem ? poem.read_time_seconds : 204;
  const elapsedSec = Math.round(totalSec * progress);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

  function handleTrackPress(e: { nativeEvent: { locationX?: number } }) {
    if (!hasAudio || trackWidth === 0) return;
    const x = e.nativeEvent.locationX ?? 0;
    seek(Math.min(1, Math.max(0, x / trackWidth)));
  }

  function handlePlayPress() {
    if (!hasAudio) return;
    toggle();
  }

  return (
    <View style={styles.bar}>
      {Platform.OS === "web" && <audio ref={audioRef} preload="metadata" />}

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
            {poem?.author_name ??
              (Platform.OS === "web"
                ? "Press play on a poem with narration"
                : "Press play on a poem to listen")}
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
            <Icon name="shuffle" size={16} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable>
            <Icon name="skip_previous" size={18} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={handlePlayPress}
            disabled={!hasAudio}
            style={[styles.playBtn, !hasAudio && { opacity: 0.4 }]}
          >
            <Icon name={playing ? "pause" : "play_arrow"} size={18} color="#000" />
          </Pressable>
          <Pressable>
            <Icon name="skip_next" size={18} color={colors.white} />
          </Pressable>
          <Pressable>
            <Icon name="repeat" size={16} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.timeText}>{fmt(elapsedSec)}</Text>
          <Pressable
            style={styles.track}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            onPress={handleTrackPress}
            disabled={!hasAudio}
          >
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
            <View style={[styles.trackThumb, { left: `${progress * 100}%` }]} />
          </Pressable>
          <Text style={[styles.timeText, { textAlign: "left" }]}>{fmt(totalSec)}</Text>
        </View>
        {poem && !hasAudio && (
          <Text style={styles.noAudio}>This poem has no narration yet.</Text>
        )}
      </View>

      <View style={styles.right}>
        <Pressable>
          <Icon name="format_quote" size={16} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable>
          <Icon name="library_books" size={16} color={colors.onSurfaceVariant} />
        </Pressable>
        <Pressable>
          <Icon name="volume_up" size={16} color={colors.onSurfaceVariant} />
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
    height: 64,
    backgroundColor: "#070707",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    gap: 16,
    flexShrink: 0,
  },
  left: {
    width: 260,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flexShrink: 0,
  },
  cover: { width: 40, height: 40, borderRadius: 4 },
  coverEmpty: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.white,
  },
  author: { fontFamily: fonts.body, fontSize: 10, color: colors.onSurfaceVariant, marginTop: 1 },
  center: {
    flex: 1,
    alignItems: "center" as const,
    gap: 4,
    maxWidth: 660,
    alignSelf: "center" as const,
  },
  transport: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14 },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  progressRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    width: "100%" as const,
  },
  timeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    minWidth: 30,
    textAlign: "right" as const,
  },
  track: {
    flex: 1,
    height: 4,
    justifyContent: "center" as const,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    marginLeft: -5,
  },
  noAudio: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    fontStyle: "italic" as const,
  },
  right: {
    width: 260,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    gap: 10,
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
