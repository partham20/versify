// Map Material Symbols names used in the design source to MaterialIcons
// from @expo/vector-icons. MaterialIcons is the closest stock alternative to
// Material Symbols Outlined and ships with Expo out of the box.

import { MaterialIcons } from "@expo/vector-icons";
import { type ComponentProps } from "react";

const NAME_MAP: Record<string, ComponentProps<typeof MaterialIcons>["name"]> = {
  home: "home",
  search: "search",
  edit: "edit",
  edit_note: "edit-note",
  notifications: "notifications",
  library_books: "library-books",
  settings: "settings",
  favorite: "favorite",
  chat_bubble: "chat-bubble",
  ios_share: "ios-share",
  bookmark: "bookmark",
  expand_more: "expand-more",
  more_horiz: "more-horiz",
  arrow_back_ios_new: "arrow-back-ios-new",
  arrow_upward: "arrow-upward",
  arrow_forward_ios: "arrow-forward-ios",
  play_arrow: "play-arrow",
  pause: "pause",
  skip_previous: "skip-previous",
  skip_next: "skip-next",
  graphic_eq: "graphic-eq",
  mic: "mic",
  stop: "stop",
  close: "close",
  check: "check",
  check_circle: "check-circle",
  public: "public",
  group: "group",
  format_quote: "format-quote",
  auto_stories: "auto-stories",
  add_circle: "add-circle",
  verified: "verified",
  workspace_premium: "workspace-premium",
  alternate_email: "alternate-email",
  person_add: "person-add",
  auto_awesome: "auto-awesome",
  shuffle: "shuffle",
  repeat: "repeat",
  repeat_one: "repeat-one",
  volume_up: "volume-up",
  volume_down: "volume-down",
  volume_off: "volume-off",
  favorite_border: "favorite-border",
  add: "add",
  queue_music: "queue-music",
  lyrics: "lyrics",
  playlist_add: "playlist-add",
  delete: "delete",
  more_vert: "more-vert",
};

export type IconName = keyof typeof NAME_MAP;

export function Icon({
  name,
  size = 24,
  color = "#fff",
}: {
  name: IconName | string;
  size?: number;
  color?: string;
  fill?: boolean; // accepted for parity with the design source; MaterialIcons are filled by default
}) {
  const mapped = (NAME_MAP[name as IconName] ?? (name as ComponentProps<typeof MaterialIcons>["name"]));
  return <MaterialIcons name={mapped} size={size} color={color} />;
}
