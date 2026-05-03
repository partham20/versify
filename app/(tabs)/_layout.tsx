import { Slot, Tabs, useRouter } from "expo-router";
import { View } from "react-native";
import { BottomNav, type TabId } from "../../components/BottomNav";
import { DesktopShell } from "../../components/desktop/DesktopShell";
import { useIsDesktop } from "../../lib/breakpoints";

// Mobile (and mobile-web): hide the default tab bar and render our custom
// BottomNav inside each screen via the layout. Compose is a modal route, not
// a tab — pressing it pushes /compose.
//
// Desktop web (>=1024px): swap to a Spotify-style left rail + persistent
// now-playing bar, rendered around a plain <Slot/>. Each tab screen renders
// its own desktop variant when useIsDesktop() returns true.
export default function TabsLayout() {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <DesktopShell>
        <Slot />
      </DesktopShell>
    );
  }

  return (
    <Tabs
      tabBar={(props) => {
        const routeName = props.state.routes[props.state.index]?.name;
        const map: Record<string, TabId> = {
          index: "home",
          explore: "explore",
          notif: "notif",
          profile: "profile",
        };
        const active = map[routeName] ?? "home";
        return (
          <View pointerEvents="box-none">
            <BottomNav
              active={active}
              onNav={(id) => {
                if (id === "compose") {
                  router.push("/compose");
                  return;
                }
                if (id === "home") props.navigation.navigate("index");
                else props.navigation.navigate(id);
              }}
            />
          </View>
        );
      }}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="notif" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
