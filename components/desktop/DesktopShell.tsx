import { type ReactNode } from "react";
import { View } from "react-native";
import { colors } from "../../theme";
import { NavRail } from "./NavRail";
import { NowPlayingBar } from "./NowPlayingBar";

type Props = {
  children: ReactNode;
  /** Hide the chrome (NavRail + NowPlayingBar). Used for compose. */
  bare?: boolean;
};

// Fills the viewport with: [NavRail | content] above [NowPlayingBar].
// `bare` skips the chrome — used for full-bleed flows like Compose.
export function DesktopShell({ children, bare = false }: Props) {
  if (bare) {
    return <View style={styles.root}>{children}</View>;
  }
  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <NavRail />
        <View style={styles.content}>{children}</View>
      </View>
      <NowPlayingBar />
    </View>
  );
}

const styles = {
  root: {
    // 100vh on web ensures the shell fills the viewport. On native this branch
    // never renders so the cast is safe.
    height: "100vh" as unknown as number,
    width: "100%" as const,
    backgroundColor: colors.surface,
    flexDirection: "column" as const,
    overflow: "hidden" as const,
  },
  body: {
    flex: 1,
    flexDirection: "row" as const,
    minHeight: 0,
    overflow: "hidden" as const,
  },
  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden" as const,
  },
};
