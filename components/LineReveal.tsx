import { useEffect, type ReactNode } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { motion } from "../theme";

// Line-by-line reveal. translateY + fade. Reanimated doesn't expose blur on
// native View transforms — close enough for parity. 700ms ease, 80–100ms stagger.

type Props = {
  children: ReactNode;
  delayMs?: number;
  durationMs?: number;
  style?: unknown;
};

export function LineReveal({ children, delayMs = 0, durationMs = motion.lineRevealMs, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delayMs,
      withTiming(1, { duration: durationMs, easing: Easing.bezier(0.2, 0.9, 0.3, 1) })
    );
  }, [t, delayMs, durationMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * 10 }],
  }));

  return <Animated.View style={[animatedStyle, style as object]}>{children}</Animated.View>;
}
