import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useNowPlaying } from "../../lib/nowPlaying";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";

export function NowPlayingBar() {
  const router = useRouter();
  const poem = useNowPlaying((s) => s.poem);
  const playing = useNowPlaying((s) => s.playing);
  const progress = useNowPlaying((s) => s.progress);
  const duration = useNowPlaying((s) => s.duration);
  const seekRequest = useNowPlaying((s) => s.seekRequest);
  const shuffle = useNowPlaying((s) => s.shuffle);
  const repeat = useNowPlaying((s) => s.repeat);
  const liked = useNowPlaying((s) => s.liked);
  const volume = useNowPlaying((s) => s.volume);
  const muted = useNowPlaying((s) => s.muted);
  const setPlaying = useNowPlaying((s) => s.setPlaying);
  const setProgress = useNowPlaying((s) => s.setProgress);
  const setDuration = useNowPlaying((s) => s.setDuration);
  const toggle = useNowPlaying((s) => s.toggle);
  const seek = useNowPlaying((s) => s.seek);
  const toggleShuffle = useNowPlaying((s) => s.toggleShuffle);
  const cycleRepeat = useNowPlaying((s) => s.cycleRepeat);
  const toggleLike = useNowPlaying((s) => s.toggleLike);
  const setVolume = useNowPlaying((s) => s.setVolume);
  const toggleMute = useNowPlaying((s) => s.toggleMute);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [volTrackWidth, setVolTrackWidth] = useState(0);
  const [shareLabel, setShareLabel] = useState<string | null>(null);

  const hasAudio = !!poem?.audio_url;
  const isLiked = poem ? liked.has(poem.id) : false;
  const effectiveVolume = muted ? 0 : volume;

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

  // Mirror the `playing` boolean onto the audio element.
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

  // Volume / mute → audio element. Re-applies when the source changes too,
  // because the browser resets audio.volume to 1.0 on every fresh load().
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = effectiveVolume;
  }, [effectiveVolume, poem?.audio_url]);

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
      // Read latest repeat from the store (closure would otherwise be stale).
      const r = useNowPlaying.getState().repeat;
      if (r === "one" || r === "all") {
        try {
          audio.currentTime = 0;
          audio.play().catch(() => setPlaying(false));
        } catch {
          setProgress(0);
          setPlaying(false);
        }
        return;
      }
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

  const totalSec = duration > 0 ? Math.round(duration) : poem ? poem.read_time_seconds : 204;
  const elapsedSec = Math.round(totalSec * progress);
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

  function handleTrackPress(e: { nativeEvent: { locationX?: number } }) {
    if (!hasAudio || trackWidth === 0) return;
    const x = e.nativeEvent.locationX ?? 0;
    seek(Math.min(1, Math.max(0, x / trackWidth)));
  }

  function handleVolPress(e: { nativeEvent: { locationX?: number } }) {
    if (volTrackWidth === 0) return;
    const x = e.nativeEvent.locationX ?? 0;
    setVolume(Math.min(1, Math.max(0, x / volTrackWidth)));
  }

  function handlePlayPress() {
    if (!hasAudio) return;
    toggle();
  }

  function handlePrev() {
    seek(0);
  }

  function handleNext() {
    // No track queue — emulate "end of track" by jumping to the end. The
    // ended handler then honours the repeat mode.
    seek(1);
  }

  function handleLike() {
    if (poem) toggleLike(poem.id);
  }

  function handleOpenReader() {
    if (poem) router.push(`/poem/${poem.id}`);
  }

  async function handleShare() {
    if (!poem) return;
    const url = `https://versify.app/p/${poem.id}`;
    const nav: Navigator | undefined =
      typeof navigator !== "undefined" ? navigator : undefined;
    let ok = false;
    if (nav?.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(url);
        ok = true;
      } catch {}
    }
    if (!ok && typeof document !== "undefined") {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
    }
    setShareLabel(ok ? "Copied" : "Failed");
    setTimeout(() => setShareLabel(null), 1500);
  }

  const repeatColor = repeat === "off" ? colors.onSurfaceVariant : colors.primary;
  const repeatIcon = repeat === "one" ? "repeat_one" : "repeat";
  const shuffleColor = shuffle ? colors.primary : colors.onSurfaceVariant;

  const volumeIcon = muted || effectiveVolume === 0
    ? "volume_off"
    : effectiveVolume < 0.4
      ? "volume_down"
      : "volume_up";

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
          <Pressable onPress={handleLike} hitSlop={8}>
            <Icon
              name={isLiked ? "favorite" : "favorite_border"}
              size={16}
              color={isLiked ? colors.primary : colors.onSurfaceVariant}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        <View style={styles.centerInner}>
          <View style={styles.transport}>
            <Pressable onPress={toggleShuffle} hitSlop={8}>
              <Icon name="shuffle" size={18} color={shuffleColor} />
            </Pressable>
            <Pressable onPress={handlePrev} disabled={!poem} hitSlop={8}>
              <Icon
                name="skip_previous"
                size={20}
                color={poem ? colors.white : colors.onSurfaceVariant}
              />
            </Pressable>
            <Pressable
              onPress={handlePlayPress}
              disabled={!hasAudio}
              style={[styles.playBtn, !hasAudio && { opacity: 0.4 }]}
            >
              <Icon name={playing ? "pause" : "play_arrow"} size={22} color="#000" />
            </Pressable>
            <Pressable onPress={handleNext} disabled={!poem} hitSlop={8}>
              <Icon
                name="skip_next"
                size={20}
                color={poem ? colors.white : colors.onSurfaceVariant}
              />
            </Pressable>
            <Pressable onPress={cycleRepeat} hitSlop={8}>
              <Icon name={repeatIcon} size={18} color={repeatColor} />
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
      </View>

      <View style={styles.right}>
        <Pressable onPress={handleShare} disabled={!poem} hitSlop={8}>
          <Icon
            name={shareLabel === "Copied" ? "check" : "format_quote"}
            size={18}
            color={
              shareLabel === "Copied"
                ? colors.primary
                : poem
                  ? colors.white
                  : colors.onSurfaceVariant
            }
          />
        </Pressable>
        <Pressable onPress={handleOpenReader} disabled={!poem} hitSlop={8}>
          <Icon
            name="library_books"
            size={18}
            color={poem ? colors.white : colors.onSurfaceVariant}
          />
        </Pressable>
        <Pressable onPress={toggleMute} hitSlop={8}>
          <Icon name={volumeIcon} size={18} color={colors.white} />
        </Pressable>
        <Pressable
          style={styles.volTrack}
          onLayout={(e) => setVolTrackWidth(e.nativeEvent.layout.width)}
          onPress={handleVolPress}
          hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
        >
          <View style={[styles.volFill, { width: `${effectiveVolume * 100}%` }]} />
          <View style={[styles.volThumb, { left: `${effectiveVolume * 100}%` }]} />
        </Pressable>
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
  author: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant },
  center: {
    flex: 1,
    alignItems: "center" as const,
    minWidth: 0,
  },
  centerInner: {
    width: "100%" as const,
    maxWidth: 720,
    gap: 6,
    alignItems: "center" as const,
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    flexShrink: 0,
    marginLeft: "auto" as const,
  },
  volTrack: {
    width: 100,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    position: "relative" as const,
    cursor: "pointer" as never,
  },
  volFill: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderRadius: 999,
  },
  volThumb: {
    position: "absolute" as const,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    marginLeft: -4,
  },
};
