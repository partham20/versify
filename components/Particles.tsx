import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme";

// Ambient drift particles. 10–20 of them slowly float up-and-out and re-emerge.

type Props = { count?: number };

function Particle({ index, total }: { index: number; total: number }) {
  const left = (index * 41) % 100;
  const top = (index * 67) % 100;
  const dx = Math.sin(index) * 60;
  const dy = -100 - ((index * 9) % 80);
  const durationMs = (8 + (index % 6) * 2) * 1000;
  const delayMs = ((index * 700) % 6000) | 0;
  const sz = 2 + (index % 3);
  const tint = index % 3 === 0 ? colors.tertiary : colors.primary;

  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delayMs,
      withRepeat(withTiming(1, { duration: durationMs, easing: Easing.linear }), -1, false)
    );
  }, [t, durationMs, delayMs]);

  const style = useAnimatedStyle(() => {
    const opacity = t.value < 0.1 || t.value > 0.9 ? 0 : 0.6;
    return {
      transform: [
        { translateX: t.value * dx },
        { translateY: t.value * dy },
        { scale: 1 + t.value * 0.2 },
      ],
      opacity,
    };
  });

  void total;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: `${left}%`,
          top: `${top}%`,
          width: sz,
          height: sz,
          backgroundColor: tint,
        },
        style,
      ]}
    />
  );
}

export function Particles({ count = 14 }: Props) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <Particle key={i} index={i} total={count} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0,
  },
});
