// Versify design tokens — sourced from design/styles.css + design/app.jsx

export const colors = {
  surface: "#0e0e0e",
  surfaceLowest: "#000000",
  surfaceLow: "#181818",
  surfaceContainer: "#1a1a1a",
  surfaceHigh: "#232323",
  surfaceBright: "#2c2c2c",
  surfaceVariant: "#262626",

  onSurface: "#f6f5f2",
  onSurfaceVariant: "#9a9a96",

  primary: "#57f47f",
  primaryDim: "#3ec96a",
  primaryContainer: "#0ec557",
  onPrimary: "#003411",

  tertiary: "#88ebff",
  outline: "#767575",
  outlineVariant: "#484847",
  error: "#ff6b6b",

  // utility
  glassBg: "rgba(20, 20, 20, 0.7)",
  hairline: "rgba(255, 255, 255, 0.06)",
  hairlineStrong: "rgba(255, 255, 255, 0.12)",
  surfaceChip: "rgba(255, 255, 255, 0.06)",
  primaryChip: "rgba(87, 244, 127, 0.18)",
  primaryChipFaint: "rgba(87, 244, 127, 0.08)",
  black: "#000000",
  white: "#ffffff",
} as const;

export const fonts = {
  // headlines — italicizable serif (loaded via @expo-google-fonts/fraunces)
  headline: "Fraunces_800ExtraBold",
  headlineItalic: "Fraunces_800ExtraBold_Italic",
  headlineRegular: "Fraunces_700Bold",
  // body sans (loaded via @expo-google-fonts/manrope)
  body: "Manrope_500Medium",
  bodyBold: "Manrope_700Bold",
  bodySemiBold: "Manrope_600SemiBold",
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

export const space = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const motion = {
  lineRevealMs: 700,
  lineStaggerMs: 100,
  screenInMs: 500,
  recPulseMs: 1200,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const tracking = {
  tight: -0.02,
  tighter: -0.025,
  loose: 0.18,
  looser: 0.22,
} as const;

export const theme = { colors, fonts, radius, space, motion, shadows, tracking };
export type Theme = typeof theme;
