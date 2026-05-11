import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../lib/auth";
import type { NotificationRow } from "../../lib/database.types";
import { supabase } from "../../lib/supabase";
import { colors, fonts } from "../../theme";
import { Icon } from "../Icon";
import { Particles } from "../Particles";

type EnrichedNotif = NotificationRow & {
  actor_name: string | null;
  actor_avatar: string | null;
  poem_title: string | null;
};

const DEMO_NOTIFS: EnrichedNotif[] = [
  {
    id: "demo-1",
    user_id: "demo",
    actor_id: "u1",
    type: "like",
    target_poem_id: "p1",
    target_comment_id: null,
    read: false,
    created_at: new Date(Date.now() - 4 * 60_000).toISOString(),
    actor_name: "Sora Ito",
    actor_avatar: "https://i.pravatar.cc/120?img=47",
    poem_title: "Solitude in Stanza",
  },
  {
    id: "demo-2",
    user_id: "demo",
    actor_id: "u2",
    type: "comment",
    target_poem_id: "p2",
    target_comment_id: "c1",
    read: false,
    created_at: new Date(Date.now() - 22 * 60_000).toISOString(),
    actor_name: "Mira Okafor",
    actor_avatar: "https://i.pravatar.cc/120?img=32",
    poem_title: "Quiet Tides",
  },
  {
    id: "demo-3",
    user_id: "demo",
    actor_id: "u3",
    type: "follow",
    target_poem_id: null,
    target_comment_id: null,
    read: true,
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    actor_name: "Kenji Park",
    actor_avatar: "https://i.pravatar.cc/120?img=12",
    poem_title: null,
  },
  {
    id: "demo-4",
    user_id: "demo",
    actor_id: "u4",
    type: "feature",
    target_poem_id: "p3",
    target_comment_id: null,
    read: true,
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
    actor_name: "Editorial",
    actor_avatar: "https://i.pravatar.cc/120?img=5",
    poem_title: "Daybreak Mosaic",
  },
  {
    id: "demo-5",
    user_id: "demo",
    actor_id: "u5",
    type: "mention",
    target_poem_id: "p4",
    target_comment_id: null,
    read: true,
    created_at: new Date(Date.now() - 26 * 3600_000).toISOString(),
    actor_name: "Lila Chen",
    actor_avatar: "https://i.pravatar.cc/120?img=23",
    poem_title: "After the Frost",
  },
  {
    id: "demo-6",
    user_id: "demo",
    actor_id: "u6",
    type: "like",
    target_poem_id: "p5",
    target_comment_id: null,
    read: true,
    created_at: new Date(Date.now() - 3 * 86400_000).toISOString(),
    actor_name: "Anaya Roy",
    actor_avatar: "https://i.pravatar.cc/120?img=68",
    poem_title: "Pale Lanterns",
  },
];

const ICON_MAP: Record<NotificationRow["type"], { icon: string; color: string; verb: string }> = {
  like: { icon: "favorite", color: colors.primary, verb: "loved" },
  comment: { icon: "chat_bubble", color: colors.tertiary, verb: "echoed" },
  follow: { icon: "person_add", color: colors.primary, verb: "started following you" },
  feature: { icon: "auto_awesome", color: "#fbbf24", verb: "featured" },
  mention: { icon: "alternate_email", color: colors.tertiary, verb: "mentioned you in" },
};

const FILTERS: Array<["all" | NotificationRow["type"], string]> = [
  ["all", "All"],
  ["like", "Likes"],
  ["comment", "Echoes"],
  ["follow", "Follows"],
  ["feature", "Features"],
  ["mention", "Mentions"],
];

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function DesktopInbox() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | NotificationRow["type"]>("all");
  const [items, setItems] = useState<EnrichedNotif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems(DEMO_NOTIFS);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select(
          "*, actor:users!notifications_actor_id_fkey(display_name, avatar_url), poem:poems!notifications_target_poem_id_fkey(title)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(80);
      const enriched = ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
        ...(r as unknown as NotificationRow),
        actor_name:
          ((r.actor as { display_name?: string } | null)?.display_name) ?? null,
        actor_avatar:
          ((r.actor as { avatar_url?: string } | null)?.avatar_url) ?? null,
        poem_title: ((r.poem as { title?: string } | null)?.title) ?? null,
      }));
      setItems(enriched.length > 0 ? enriched : DEMO_NOTIFS);
      setLoading(false);
    })();
  }, [user]);

  const filtered = filter === "all" ? items : items.filter((n) => n.type === filter);
  const unread = items.filter((n) => !n.read).length;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 60 }}>
      <Particles count={5} />

      <View style={styles.heroSection}>
        <Text style={styles.kicker}>INBOX</Text>
        <Text style={styles.heading}>
          Whispers <Text style={styles.italicGreen}>back</Text>.
        </Text>
        <Text style={styles.sub}>
          {loading
            ? "Loading…"
            : unread > 0
              ? `${unread} unread · ${items.length} total`
              : `${items.length} ${items.length === 1 ? "notification" : "notifications"}`}
        </Text>

        <View style={styles.chipsRow}>
          {FILTERS.map(([id, label]) => {
            const active = filter === id;
            const count =
              id === "all" ? items.length : items.filter((n) => n.type === id).length;
            return (
              <Pressable
                key={id}
                onPress={() => setFilter(id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {label}
                </Text>
                {count > 0 && (
                  <Text style={[styles.chipCount, active && { color: colors.primary }]}>
                    {count}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="notifications" size={32} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>
              {loading ? "Loading…" : "No whispers yet."}
            </Text>
            <Text style={styles.emptySub}>
              Likes, echoes, and follows will appear here.
            </Text>
          </View>
        ) : (
          filtered.map((n) => {
            const meta = ICON_MAP[n.type];
            return (
              <View key={n.id} style={[styles.row, !n.read && styles.rowUnread]}>
                <View style={styles.avatarWrap}>
                  {n.actor_avatar ? (
                    <Image
                      source={{ uri: n.actor_avatar }}
                      style={styles.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Icon name="auto_stories" size={16} color={colors.onSurfaceVariant} />
                    </View>
                  )}
                  <View style={styles.badge}>
                    <Icon name={meta.icon} size={11} color={meta.color} />
                  </View>
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.body}>
                    <Text style={styles.actor}>{n.actor_name ?? "Someone"}</Text>
                    <Text style={styles.action}> {meta.verb}</Text>
                    {n.poem_title && (
                      <>
                        <Text style={styles.action}> </Text>
                        <Text style={styles.target}>{n.poem_title}</Text>
                      </>
                    )}
                  </Text>
                  <Text style={styles.time}>{relativeTime(n.created_at)}</Text>
                </View>

                {!n.read && <View style={styles.unreadDot} />}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
  flex: { flex: 1, backgroundColor: colors.surface },

  heroSection: { paddingHorizontal: 40, paddingTop: 40, paddingBottom: 24 },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.8,
    color: colors.primary,
    marginBottom: 12,
  },
  heading: {
    fontFamily: fonts.headline,
    fontSize: 56,
    lineHeight: 56,
    color: colors.white,
    letterSpacing: -1.6,
  },
  italicGreen: { fontFamily: fonts.headlineItalic, color: colors.primary },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 12,
  },

  chipsRow: {
    marginTop: 24,
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  chipActive: { backgroundColor: colors.primaryChip },
  chipText: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  chipTextActive: { color: colors.primary },
  chipCount: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    color: colors.onSurfaceVariant,
  },

  list: {
    paddingHorizontal: 40,
    paddingTop: 12,
    maxWidth: 880,
    width: "100%" as const,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  rowUnread: { backgroundColor: "rgba(87,244,127,0.04)" },

  avatarWrap: { width: 48, height: 48, position: "relative" as const, flexShrink: 0 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  badge: {
    position: "absolute" as const,
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 2,
    borderColor: colors.surfaceLow,
  },

  body: { lineHeight: 22 },
  actor: {
    fontFamily: fonts.headlineRegular,
    fontSize: 14,
    color: colors.white,
  },
  action: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  target: {
    fontFamily: fonts.headlineItalic,
    fontSize: 14,
    color: colors.primary,
  },
  time: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },

  empty: {
    paddingVertical: 80,
    alignItems: "center" as const,
    gap: 10,
  },
  emptyText: { fontFamily: fonts.headlineRegular, fontSize: 16, color: colors.white },
  emptySub: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceVariant },
};
