import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip } from "../../components/Chip";
import { DesktopInbox } from "../../components/desktop/DesktopInbox";
import { Icon } from "../../components/Icon";
import { Particles } from "../../components/Particles";
import { TopBar } from "../../components/TopBar";
import { useAuth } from "../../lib/auth";
import { useIsDesktop } from "../../lib/breakpoints";
import { supabase } from "../../lib/supabase";
import type { NotificationRow } from "../../lib/database.types";
import { colors, fonts } from "../../theme";

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

const ICON_MAP: Record<NotificationRow["type"], { icon: string; color: string }> = {
  like: { icon: "favorite", color: colors.primary },
  follow: { icon: "person_add", color: colors.tertiary },
  comment: { icon: "chat_bubble", color: colors.white },
  feature: { icon: "workspace_premium", color: colors.primary },
  mention: { icon: "alternate_email", color: colors.tertiary },
};

const FILTERS: Array<["all" | NotificationRow["type"], string]> = [
  ["all", "All"],
  ["like", "Likes"],
  ["comment", "Replies"],
  ["follow", "Follows"],
  ["mention", "Mentions"],
];

export default function Notif() {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <DesktopInbox />;
  return <NotifScreen />;
}

function NotifScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | NotificationRow["type"]>("all");
  const [items, setItems] = useState<EnrichedNotif[]>([]);

  useEffect(() => {
    if (!user) {
      setItems(DEMO_NOTIFS);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*, actor:users!notifications_actor_id_fkey(display_name, avatar_url), poem:poems!notifications_target_poem_id_fkey(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      const enriched = ((data ?? []) as any[]).map((r) => ({
        ...r,
        actor_name: r.actor?.display_name ?? null,
        actor_avatar: r.actor?.avatar_url ?? null,
        poem_title: r.poem?.title ?? null,
      }));
      setItems(enriched.length > 0 ? enriched : DEMO_NOTIFS);
    })();
  }, [user]);

  const filtered = filter === "all" ? items : items.filter((n) => n.type === filter);

  return (
    <View style={styles.flex}>
      <Particles count={5} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <TopBar title="Inbox" showAvatar={false} />
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
          <Text style={styles.heading}>
            Whispers <Text style={styles.italic}>back</Text>.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {FILTERS.map(([id, label]) => (
              <Chip key={id} label={label} active={filter === id} onPress={() => setFilter(id)} />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {filtered.length === 0 ? (
            <Text style={styles.empty}>No whispers yet.</Text>
          ) : (
            filtered.map((n) => {
              const { icon, color } = ICON_MAP[n.type];
              return (
                <View key={n.id} style={[styles.row, !n.read && styles.rowUnread]}>
                  <View style={styles.avatarWrap}>
                    {n.actor_avatar ? (
                      <Image source={{ uri: n.actor_avatar }} style={styles.avatar} contentFit="cover" />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: colors.primary }]} />
                    )}
                    <View style={styles.badge}>
                      <Icon name={icon} size={12} color={color} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.body}>
                      <Text style={styles.actor}>{n.actor_name ?? "Someone"}</Text>
                      <Text style={styles.action}> {bodyFor(n.type)} </Text>
                      {n.poem_title && <Text style={styles.target}>{n.poem_title}</Text>}
                    </Text>
                    <Text style={styles.time}>{relativeTime(n.created_at)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function bodyFor(t: NotificationRow["type"]): string {
  switch (t) {
    case "like": return "liked your poem";
    case "comment": return "commented on";
    case "follow": return "started following you";
    case "feature": return "featured your poem in";
    case "mention": return "mentioned you in";
  }
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  heading: {
    fontFamily: fonts.headline,
    fontSize: 32,
    color: colors.white,
    letterSpacing: -0.6,
    marginBottom: 18,
  },
  italic: { fontFamily: fonts.headlineItalic, color: colors.primary },
  filterRow: { gap: 8, paddingVertical: 4 },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  rowUnread: { backgroundColor: "rgba(87,244,127,0.04)" },
  avatarWrap: { position: "relative" },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { fontFamily: fonts.body, color: colors.white, fontSize: 13, lineHeight: 19 },
  actor: { fontFamily: fonts.headlineRegular, color: colors.white },
  action: { color: colors.onSurfaceVariant },
  target: { fontFamily: fonts.bodyBold, color: colors.primary },
  time: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.6, color: colors.onSurfaceVariant, marginTop: 4 },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant, textAlign: "center", marginTop: 40 },
});
