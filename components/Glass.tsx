import { BlurView } from "expo-blur";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius } from "../theme";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  intensity?: number;
  style?: ViewStyle | ViewStyle[];
  rounded?: number;
  bordered?: boolean;
};

export function Glass({ children, intensity = 30, style, rounded = radius.xl, bordered = true }: Props) {
  return (
    <View
      style={[
        styles.wrap,
        { borderRadius: rounded, borderColor: bordered ? colors.hairline : "transparent" },
        style,
      ]}
    >
      <BlurView tint="dark" intensity={intensity} style={[StyleSheet.absoluteFill, { borderRadius: rounded }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassBg, borderRadius: rounded }]} />
      <View style={{ position: "relative" }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
