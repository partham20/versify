import { Platform, Share } from "react-native";

export type ShareResult = "shared" | "copied" | "cancelled" | "error";

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Share a public profile. On native we use the OS share sheet. On mobile web
// we try navigator.share first (gives the native share sheet), otherwise we
// always fall back to copying the URL to the clipboard — including a legacy
// execCommand path so it works on insecure contexts (http://) where
// navigator.clipboard is unavailable.
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

    const isMobileWeb =
      !!nav?.userAgent && /android|iphone|ipad|ipod/i.test(nav.userAgent);

    if (isMobileWeb && nav && typeof nav.share === "function") {
      try {
        await nav.share({ title, text: message, url });
        return "shared";
      } catch (e) {
        if ((e as Error).name === "AbortError") return "cancelled";
        // fall through to clipboard
      }
    }

    if (nav?.clipboard && typeof nav.clipboard.writeText === "function") {
      try {
        await nav.clipboard.writeText(url);
        return "copied";
      } catch {
        // fall through to legacy
      }
    }

    return legacyCopy(url) ? "copied" : "error";
  }

  try {
    const result = await Share.share({ title, message, url });
    if (result.action === Share.dismissedAction) return "cancelled";
    return "shared";
  } catch {
    return "error";
  }
}
