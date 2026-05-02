import { Image, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { colors, fonts } from "../theme";
import { Icon } from "./Icon";

type Props = {
  title?: string;
  avatarUri?: string | null;
  showAvatar?: boolean;
  onAvatarPress?: () => void;
  action?: ReactNode;
  style?: ViewStyle;
};

export function TopBar({
  title = "Versify",
  avatarUri,
  showAvatar = true,
  onAvatarPress,
  action,
  style,
}: Props) {
  return (
    <View style={[styles.bar, style]}>
      <View style={styles.left}>
        {showAvatar && (
          <Pressable onPress={onAvatarPress} style={styles.avatarBtn}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, styles.avatarPlaceholder]} />
            )}
          </Pressable>
        )}
        <Text style={styles.title}>{title.toUpperCase()}</Text>
      </View>
      {action ?? (
        <Pressable style={styles.iconBtn}>
          <Icon name="settings" size={20} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.surfaceHigh,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    backgroundColor: colors.surfaceHigh,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 13,
    letterSpacing: 2.4,
    color: colors.white,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceChip,
    alignItems: "center",
    justifyContent: "center",
  },
});
