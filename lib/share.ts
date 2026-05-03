import { Platform, Share } from "react-native";

export type ShareResult = "shared" | "copied" | "cancelled" | "error";

// Share a public profile. Native uses the OS share sheet; mobile-web uses
// navigator.share when available; desktop-web falls back to copying the URL
// to the clipboard so the caller can show a "Copied!" confirmation.
export async function shareProfile(
  handle: string,
  displayName: string
): Promise<ShareResult> {
  const url = `https://versify.app/u/${handle}`;
  const title = `${displayName} on Versify`;
  const message = `Read ${displayName}'s poetry on Versify — @${handle}\n${url}`;

  if (Platform.OS === "web") {
    const nav: Navigator | undefined =
      typeof navigator !== "undefined" ? navigator : undefined;

    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({ title, text: message, url });
        return "shared";
      } catch (e) {
        if ((e as Error).name === "AbortError") return "cancelled";
        // fall through to clipboard
      }
    }

    if (nav && nav.clipboard && typeof nav.clipboard.writeText === "function") {
      try {
        await nav.clipboard.writeText(url);
        return "copied";
      } catch {
        return "error";
      }
    }
    return "error";
  }

  try {
    const result = await Share.share({ title, message, url });
    if (result.action === Share.dismissedAction) return "cancelled";
    return "shared";
  } catch {
    return "error";
  }
}
