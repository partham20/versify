import { Tabs, useRouter } from "expo-router";
import { View } from "react-native";
import { BottomNav, type TabId } from "../../components/BottomNav";
import { colors } from "../../theme";

// We hide the default tab bar and render our custom BottomNav inside each
// screen via the layout. Compose is a modal route, not a tab — pressing it
// pushes /compose.
export default function TabsLayout() {
  const router = useRouter();

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
