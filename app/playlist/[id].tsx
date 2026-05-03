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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesktopShell } from "../../components/desktop/DesktopShell";
import { Icon } from "../../components/Icon";
import { useIsDesktop } from "../../lib/breakpoints";
import type { PlaylistRow, PoemWithStats } from "../../lib/database.types";
import { useNowPlaying } from "../../lib/nowPlaying";
import { fetchPlaylist, fetchPlaylistPoems } from "../../lib/playlists";
import { formatReadTime } from "../../lib/syllables";
import { colors, fonts } from "../../theme";

export default function PlaylistRoute() {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <DesktopShell>
        <PlaylistScreen />
      </DesktopShell>
    );
  }
  return <PlaylistScreen />;
}

function PlaylistScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDesktop = useIsDesktop();
  const insets = useSafeAreaInsets();
  const play = useNowPlaying((s) => s.play);

  const [playlist, setPlaylist] = useState<PlaylistRow | null>(null);
  const [poems, setPoems] = useState<PoemWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchPlaylist(id), fetchPlaylistPoems(id)])
      .then(([pl, ps]) => {
        setPlaylist(pl);
        setPoems(ps);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!playlist) {
    return (
      <View style={[styles.flex, styles.center]}>
        <Text style={styles.emptyText}>Playlist not found.</Text>
      </View>
    );
  }

  const totalSeconds = poems.reduce((s, p) => s + p.read_time_seconds, 0);
  const totalMin = Math.max(1, Math.round(totalSeconds / 60));

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        { paddingBottom: 60 },
        !isDesktop && { paddingTop: insets.top },
      ]}
    >
      <View style={styles.hero}>
        {playlist.cover_url && (
          <Image
            source={{ uri: playlist.cover_url }}
            style={styles.heroImg}
            contentFit="cover"
            blurRadius={20}
          />
        )}
        <LinearGradient
          colors={["rgba(14,14,14,0.4)", "rgba(14,14,14,0.85)", colors.surface]}
          locations={[0, 0.6, 1]}
          style={styles.heroOverlay}
        />

        <View style={[styles.heroHeader, isDesktop && { paddingHorizontal: 40 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Icon name="arrow_back_ios_new" size={14} color={colors.white} />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        </View>

        <View style={[styles.heroBody, isDesktop && { paddingHorizontal: 40, gap: 32 }]}>
          {playlist.cover_url ? (
            <Image
              source={{ uri: playlist.cover_url }}
              style={[styles.coverArt, isDesktop && { width: 220, height: 220 }]}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.coverArt,
                styles.coverArtEmpty,
                isDesktop && { width: 220, height: 220 },
              ]}
            >
              <Icon name="library_books" size={48} color={colors.onSurfaceVariant} />
            </View>
          )}
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.kicker}>PLAYLIST</Text>
            <Text style={[styles.title, isDesktop && { fontSize: 64, lineHeight: 64 }]}>
              {playlist.name}
            </Text>
            <Text style={styles.meta}>
              {poems.length} {poems.length === 1 ? "poem" : "poems"} · {totalMin} min
            </Text>

            <View style={styles.actionRow}>
              <Pressable
                onPress={() => poems[0] && play(poems[0])}
                style={styles.playBtn}
                disabled={poems.length === 0}
              >
                <Icon name="play_arrow" size={22} color={colors.onPrimary} />
                <Text style={styles.playText}>Play all</Text>
              </Pressable>
              <Pressable style={styles.iconBtn}>
                <Icon name="favorite" size={18} color={colors.white} />
              </Pressable>
              <Pressable style={styles.iconBtn}>
                <Icon name="ios_share" size={16} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.list, isDesktop && { paddingHorizontal: 40, maxWidth: 1100 }]}>
        {poems.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="library_books" size={32} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>This playlist is empty.</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 0.4 }]}>#</Text>
              <Text style={[styles.th, { flex: 3 }]}>TITLE</Text>
              <Text style={[styles.th, { flex: 2 }]}>AUTHOR</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>READ</Text>
              <View style={{ width: 40 }} />
            </View>
            {poems.map((p, i) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/poem/${p.id}` as never)}
                style={styles.row}
              >
                <Text style={[styles.tdMuted, { flex: 0.4 }]}>
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <View style={{ flex: 3, flexDirection: "row", alignItems: "center", gap: 12 }}>
                  {p.cover_url ? (
                    <Image source={{ uri: p.cover_url }} style={styles.rowCover} contentFit="cover" />
                  ) : (
                    <View style={[styles.rowCover, styles.rowCoverEmpty]}>
                      <Icon name="auto_stories" size={16} color={colors.onSurfaceVariant} />
                    </View>
                  )}
                  <View style={{ minWidth: 0, flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={styles.rowSub} numberOfLines={1}>
                      {p.tags.slice(0, 3).join(" · ")}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>
                  {p.author_name}
                </Text>
                <Text style={[styles.tdMuted, { flex: 1, textAlign: "right" }]}>
                  {formatReadTime(p.read_time_seconds)}
                </Text>
                <View style={{ width: 40, alignItems: "flex-end" }}>
                  <Icon name="favorite" size={16} color={colors.onSurfaceVariant} />
                </View>
              </Pressable>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },

  hero: { position: "relative", paddingBottom: 24 },
  heroImg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 360,
    opacity: 0.4,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 360,
  },
  heroHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtnText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodySemiBold },

  heroBody: {
    marginTop: 32,
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-end",
  },
  coverArt: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
  },
  coverArtEmpty: { alignItems: "center", justifyContent: "center" },

  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2.4,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 36,
    lineHeight: 38,
    color: colors.white,
    letterSpacing: -1,
  },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant },

  actionRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: 13 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  list: { marginTop: 20, paddingHorizontal: 20, alignSelf: "center", width: "100%" },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  th: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  rowCover: { width: 44, height: 44, borderRadius: 6 },
  rowCoverEmpty: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontFamily: fonts.headlineRegular, fontSize: 14, color: colors.white },
  rowSub: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  td: { fontFamily: fonts.body, fontSize: 13, color: colors.white },
  tdMuted: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceVariant },

  empty: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.onSurfaceVariant },
});
