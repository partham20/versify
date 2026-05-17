import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../lib/auth";
import {
  addPoemToPlaylist,
  createPlaylist,
  fetchPlaylistPoemIds,
  fetchUserPlaylists,
  removePoemFromPlaylist,
  type PlaylistWithCount,
} from "../lib/playlists";
import { colors, fonts, radius } from "../theme";
import { Icon } from "./Icon";

// StyleSheet.create doesn't type `outlineStyle`, but we need it on web to
// strip the browser focus ring. Same trick as desktop compose/edit screens.
const NO_OUTLINE = { outlineStyle: "none" } as unknown as never;

type Props = {
  visible: boolean;
  poemId: string | null;
  onClose: () => void;
  onChanged?: () => void;
};

export function AddToPlaylistModal({ visible, poemId, onClose, onChanged }: Props) {
  const { profile } = useAuth();
  const [playlists, setPlaylists] = useState<PlaylistWithCount[]>([]);
  const [memberships, setMemberships] = useState<Map<string, Set<string>>>(new Map());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!visible || !profile) return;
    setLoading(true);
    setQuery("");
    fetchUserPlaylists(profile.id)
      .then(async (pls) => {
        setPlaylists(pls);
        if (poemId && pls.length > 0) {
          const mem = await fetchPlaylistPoemIds(pls.map((p) => p.id));
          setMemberships(mem);
        } else {
          setMemberships(new Map());
        }
      })
      .catch(() => {
        setPlaylists([]);
        setMemberships(new Map());
      })
      .finally(() => setLoading(false));
  }, [visible, profile, poemId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter((p) => p.name.toLowerCase().includes(q));
  }, [playlists, query]);

  function isMember(playlistId: string): boolean {
    return memberships.get(playlistId)?.has(poemId ?? "") ?? false;
  }

  async function toggleMembership(pl: PlaylistWithCount) {
    if (!poemId || pending.has(pl.id)) return;
    const wasMember = isMember(pl.id);
    setPending((prev) => new Set(prev).add(pl.id));

    // Optimistic update of both membership set and the visible poem_count.
    setMemberships((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(pl.id) ?? []);
      if (wasMember) set.delete(poemId);
      else set.add(poemId);
      next.set(pl.id, set);
      return next;
    });
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === pl.id ? { ...p, poem_count: Math.max(0, p.poem_count + (wasMember ? -1 : 1)) } : p,
      ),
    );

    try {
      if (wasMember) await removePoemFromPlaylist(pl.id, poemId);
      else await addPoemToPlaylist(pl.id, poemId);
      onChanged?.();
    } catch {
      // Revert
      setMemberships((prev) => {
        const next = new Map(prev);
        const set = new Set(next.get(pl.id) ?? []);
        if (wasMember) set.add(poemId);
        else set.delete(poemId);
        next.set(pl.id, set);
        return next;
      });
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === pl.id
            ? { ...p, poem_count: Math.max(0, p.poem_count + (wasMember ? 1 : -1)) }
            : p,
        ),
      );
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(pl.id);
        return next;
      });
    }
  }

  async function onCreateAndAdd() {
    if (!profile || !poemId || creating) return;
    setCreating(true);
    try {
      const name = query.trim() || `My Playlist #${playlists.length + 1}`;
      const created = await createPlaylist(profile.id, name);
      await addPoemToPlaylist(created.id, poemId);
      const withCount: PlaylistWithCount = { ...created, poem_count: 1 };
      setPlaylists((prev) => [...prev, withCount]);
      setMemberships((prev) => {
        const next = new Map(prev);
        next.set(created.id, new Set([poemId]));
        return next;
      });
      setQuery("");
      onChanged?.();
    } catch {
      // surface failure silently — the row simply won't appear
    } finally {
      setCreating(false);
    }
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable onPress={onClose} style={styles.scrim}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to playlist</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Icon name="close" size={18} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <Icon name="search" size={16} color={colors.onSurfaceVariant} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Find a playlist"
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.searchInput}
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={onCreateAndAdd}
            disabled={!profile || creating}
            style={[styles.row, styles.createRow, (!profile || creating) && { opacity: 0.5 }]}
          >
            <View style={styles.createThumb}>
              <Icon name="add" size={22} color={colors.white} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.rowName}>
                {query.trim() ? `Create "${query.trim()}"` : "New playlist"}
              </Text>
              <Text style={styles.rowSub}>
                {creating ? "Creating…" : "Create a new playlist with this poem"}
              </Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {query.trim() ? "No playlists match." : "You haven't created any playlists yet."}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={{ paddingVertical: 4 }}
              showsVerticalScrollIndicator={false}
            >
              {filtered.map((pl) => {
                const member = isMember(pl.id);
                const isPending = pending.has(pl.id);
                return (
                  <Pressable
                    key={pl.id}
                    onPress={() => toggleMembership(pl)}
                    disabled={isPending}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && { backgroundColor: colors.surfaceHigh },
                    ]}
                  >
                    {pl.cover_url ? (
                      <Image source={{ uri: pl.cover_url }} style={styles.thumb} contentFit="cover" />
                    ) : (
                      <View style={[styles.thumb, styles.thumbEmpty]}>
                        <Icon name="library_books" size={18} color={colors.onSurfaceVariant} />
                      </View>
                    )}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.rowName} numberOfLines={1}>
                        {pl.name}
                      </Text>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {pl.poem_count} {pl.poem_count === 1 ? "poem" : "poems"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkBtn,
                        member && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                    >
                      {isPending ? (
                        <ActivityIndicator size="small" color={member ? colors.onPrimary : colors.white} />
                      ) : member ? (
                        <Icon name="check" size={14} color={colors.onPrimary} />
                      ) : (
                        <Icon name="add" size={14} color={colors.white} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "85%",
    backgroundColor: "#1f1f1f",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fonts.headlineRegular,
    fontSize: 18,
    color: colors.white,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceHigh,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 13,
    ...(NO_OUTLINE as object),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  createRow: { marginTop: 4 },
  createThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: { width: 44, height: 44, borderRadius: 6 },
  thumbEmpty: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  rowName: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
  rowSub: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 4 },
  list: { flexShrink: 1 },
  loading: { paddingVertical: 32, alignItems: "center" },
  empty: { paddingVertical: 28, paddingHorizontal: 20, alignItems: "center" },
  emptyText: { fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant, textAlign: "center" },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  doneBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: 13 },
});
