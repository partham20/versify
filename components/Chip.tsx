import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts, radius } from "../theme";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: object;
};

export function Chip({ label, active, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && styles.chipActive,
        style,
      ]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceChip,
  },
  chipActive: {
    backgroundColor: colors.primaryChip,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.onSurfaceVariant,
  },
  textActive: {
    color: colors.primary,
  },
});
