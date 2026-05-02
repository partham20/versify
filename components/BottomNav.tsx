import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme";
import { Icon, type IconName } from "./Icon";

export type TabId = "home" | "explore" | "compose" | "notif" | "profile";

const ITEMS: Array<{ id: TabId; label: string; icon: IconName }> = [
  { id: "home", label: "Home", icon: "home" },
  { id: "explore", label: "Search", icon: "search" },
  { id: "compose", label: "Write", icon: "edit_note" },
  { id: "notif", label: "Inbox", icon: "notifications" },
  { id: "profile", label: "Library", icon: "library_books" },
];

type Props = {
  active: TabId;
  onNav: (id: TabId) => void;
};

export function BottomNav({ active, onNav }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />
      <View style={styles.row}>
        {ITEMS.map((it) => {
          if (it.id === "compose") {
            return (
              <Pressable key={it.id} onPress={() => onNav(it.id)} style={styles.composeBtn}>
                <Icon name="edit_note" size={26} color={colors.onPrimary} />
              </Pressable>
            );
          }
          const isActive = active === it.id;
          return (
            <Pressable key={it.id} onPress={() => onNav(it.id)} style={styles.tabBtn}>
              <Icon
                name={it.icon}
                size={22}
                color={isActive ? colors.primary : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.onSurfaceVariant },
                ]}
              >
                {it.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: "rgba(14,14,14,0.85)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingBottom: 28,
    paddingHorizontal: 14,
  },
  composeBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -8,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tabBtn: {
    alignItems: "center",
    gap: 3,
    padding: 4,
  },
  tabLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.9,
  },
});
