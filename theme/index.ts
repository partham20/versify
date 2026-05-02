export const colors = {
  bg: "#0A0A0F",
  bgElevated: "#13131B",
  surface: "rgba(255, 255, 255, 0.04)",
  surfaceStrong: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  text: "#F5F2EA",
  textMuted: "#9A9AA8",
  textFaint: "#5A5A66",
  accent: "#D4B896",
  accentStrong: "#E8CFA8",
  haiku: "#7FE3B0",
  danger: "#FF6B7A",
  overlay: "rgba(10, 10, 15, 0.72)",
} as const;

export const fonts = {
  serif: "Georgia",
  sans: "System",
  mono: "Menlo",
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const motion = {
  lineRevealMs: 700,
  lineStaggerMs: 80,
  springSnappy: { damping: 20, stiffness: 220 },
  springSoft: { damping: 18, stiffness: 110 },
} as const;

export type Theme = {
  colors: typeof colors;
  fonts: typeof fonts;
  radius: typeof radius;
  space: typeof space;
  motion: typeof motion;
};

export const theme: Theme = { colors, fonts, radius, space, motion };
