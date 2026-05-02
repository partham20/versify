import { Platform, useWindowDimensions } from "react-native";

// "Desktop" only means web AND wide enough. Mobile-web stays mobile-shaped.
// Native always returns false — phones get the existing tab UI.
export const DESKTOP_MIN_WIDTH = 1024;

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= DESKTOP_MIN_WIDTH;
}
