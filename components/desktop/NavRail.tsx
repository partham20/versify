import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useSegments } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../lib/auth";
import { colors, fonts, radius } from "../../theme";
import { Icon, type IconName } from "../Icon";

const NAV_ITEMS: Array<{ id: string; label: string; icon: IconName; href: string }> = [
  { id: "index", label: "Home", icon: "home", href: "/(tabs)" },
  { id: "explore", label: "Search", icon: "search", href: "/(tabs)/explore" },
  { id: "notif", label: "Inbox", icon: "notifications", href: "/(tabs)/notif" },
  { id: "profile", label: "Library", icon: "library_books", href: "/(tabs)/profile" },
];

const PLAYLISTS = [
  { name: "Rainy Day Sonnets", count: 18 },
  { name: "Midnight Monologues", count: 24 },
  { name: "Classical Reimagined", count: 12 },
  { name: "Urban Solitude", count: 31 },
  { name: "Drafts", count: 12, ghost: true },
];

export function NavRail() {
  const router = useRouter();
  const segments = useSegments();
  const { profile } = useAuth();

  const inTabs = segments[0] === "(tabs)";
  const tabName = inTabs ? (segments[1] ?? "index") : "index";

  return (
    <View style={[styles.rail]}>
      <View style={styles.brandRow}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <Icon name="auto_stories" size={18} color={colors.onPrimary} />
        </LinearGradient>
        <View>
          <Text style={styles.brand}>
            Versify<Text style={{ color: colors.primary }}>.</Text>
          </Text>
          <Text style={styles.brandSub}>POEMS, IN STEREO</Text>
        </View>
      </View>

      <Pressable onPress={() => router.push("/compose")} style={styles.composeBtnWrap}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.composeBtn}
        >
          <Icon name="edit_note" size={20} color={colors.onPrimary} />
          <Text style={styles.composeText}>Begin a stanza</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.nav}>
        {NAV_ITEMS.map((it) => {
          const active = tabName === it.id || (it.id === "index" && !segments[1] && inTabs);
          return (
            <Pressable
              key={it.id}
              onPress={() => router.push(it.href as never)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <Icon
                name={it.icon}
                size={20}
                color={active ? colors.primary : colors.onSurfaceVariant}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{it.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.plHeader}>
        <Text style={styles.plHeaderText}>YOUR PLAYLISTS</Text>
        <Pressable>
          <Icon name="add_circle" size={16} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView style={styles.plList} contentContainerStyle={{ paddingBottom: 12 }}>
        {PLAYLISTS.map((p) => (
          <Pressable key={p.name} style={styles.plItem}>
            <View
              style={[
                styles.plThumb,
                p.ghost && {
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderStyle: "dashed",
                },
              ]}
            >
              <Icon
                name={p.ghost ? "edit_note" : "library_books"}
                size={16}
                color={colors.onSurfaceVariant}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.plName} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.plCount}>{p.count} poems</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.userFooter}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.userAvatar} contentFit="cover" />
        ) : (
          <View style={[styles.userAvatar, { backgroundColor: colors.surfaceHigh }]} />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.userName} numberOfLines={1}>
            {profile?.display_name ?? "Guest"}
          </Text>
          <Text style={styles.userHandle} numberOfLines={1}>
            @{profile?.handle ?? "—"}
            {profile?.verified ? " · Verified" : ""}
          </Text>
        </View>
        <Pressable>
          <Icon name="settings" size={18} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = {
  rail: {
    width: 260,
    alignSelf: "stretch" as const,
    backgroundColor: "#0a0a0a",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.04)",
    flexShrink: 0,
    flexDirection: "column" as const,
  },
  brandRow: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  brand: {
    fontFamily: fonts.headline,
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  brandSub: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  composeBtnWrap: { marginHorizontal: 18, marginBottom: 18 },
  composeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  composeText: {
    color: colors.onPrimary,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  nav: { paddingHorizontal: 12, gap: 2 },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  navItemActive: { backgroundColor: "rgba(87,244,127,0.08)" },
  navLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  navLabelActive: { color: colors.white, fontFamily: fonts.bodyBold },
  plHeader: {
    marginTop: 24,
    marginHorizontal: 22,
    marginBottom: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  plHeaderText: {
    fontSize: 9,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1.8,
    color: colors.onSurfaceVariant,
  },
  plList: { flex: 1, paddingHorizontal: 12 },
  plItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  plThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  plName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.white,
  },
  plCount: { fontFamily: fonts.body, fontSize: 10, color: colors.onSurfaceVariant },
  userFooter: {
    padding: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  userAvatar: { width: 32, height: 32, borderRadius: 16 },
  userName: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.white },
  userHandle: { fontFamily: fonts.body, fontSize: 10, color: colors.onSurfaceVariant },
};
