import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

export const COVER_MAX_BYTES = 10 * 1024 * 1024;
export const ACCEPT_MIMES = "image/jpeg,image/png,image/webp,image/gif";

// Uploads a poem cover image to the `covers` bucket under
// <userId>/<timestamp>.<ext>. Returns the public URL. Caller persists it
// onto the poem as `cover_url`.
export async function uploadCover(
  userId: string,
  file: Blob,
  mime?: string
): Promise<string> {
  const detectedMime = mime ?? file.type ?? "image/jpeg";
  const ext = detectedMime.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("covers")
    .upload(path, file, {
      contentType: detectedMime,
      upsert: true,
      cacheControl: "3600",
    });
  if (error) throw error;

  const { data } = supabase.storage.from("covers").getPublicUrl(path);
  return data.publicUrl;
}

// Native image picker — opens the OS picker, returns a Blob ready for
// uploadCover(). Returns null on cancel; throws on permission denial or
// validation failure.
export async function pickNativeCover(): Promise<Blob | null> {
  if (Platform.OS === "web") {
    throw new Error("Use the file input on web instead.");
  }
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error("Photo library permission denied. Enable it in Settings.");
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 5],
    quality: 0.85,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;

  const res = await fetch(asset.uri);
  const blob = await res.blob();
  if (blob.size > COVER_MAX_BYTES) {
    throw new Error("Image is over 10 MB. Pick something smaller.");
  }
  return blob;
}
