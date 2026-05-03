import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesktopShell } from "../../components/desktop/DesktopShell";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../lib/auth";
import { useIsDesktop } from "../../lib/breakpoints";
import { isHandleAvailable, updateProfile, uploadAvatar } from "../../lib/profile";
import { colors, fonts } from "../../theme";

export default function EditProfile() {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <DesktopShell>
        <EditProfileScreen />
      </DesktopShell>
    );
  }
  return <EditProfileScreen />;
}

function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const isDesktop = useIsDesktop();
  const insets = useSafeAreaInsets();

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setHandle(profile.handle);
    setBio(profile.bio ?? "");
    setAvatarUrl(profile.avatar_url ?? null);
  }, [profile]);

  // Debounced handle uniqueness check.
  useEffect(() => {
    if (!profile) return;
    const trimmed = handle.trim().toLowerCase();
    if (!trimmed || trimmed === profile.handle) {
      setHandleStatus("idle");
      return;
    }
    if (!/^[a-z0-9_.]{2,32}$/.test(trimmed)) {
      setHandleStatus("idle");
      return;
    }
    setHandleStatus("checking");
    const t = setTimeout(async () => {
      try {
        const free = await isHandleAvailable(trimmed, profile.id);
        setHandleStatus(free ? "free" : "taken");
      } catch {
        setHandleStatus("idle");
      }
    }, 350);
    return () => clearTimeout(t);
  }, [handle, profile]);

  async function pickFile() {
    setError(null);
    if (Platform.OS === "web") {
      fileInput.current?.click();
      return;
    }
    // Native: ask for photo-library permission, then launch the picker.
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo library permission denied. Enable it in Settings to change your photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset || !profile) return;
    setUploading(true);
    try {
      // Read the local file URI as a Blob so the same uploadAvatar() helper works.
      const res = await fetch(asset.uri);
      const blob = await res.blob();
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error("Image is over 5 MB. Pick something smaller.");
      }
      const mime = asset.mimeType ?? blob.type ?? "image/jpeg";
      const url = await uploadAvatar(profile.id, blob, mime);
      setAvatarUrl(url);
    } catch (e) {
      setError(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file || !profile) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is over 5 MB. Pick something smaller.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadAvatar(profile.id, file, file.type);
      setAvatarUrl(url);
    } catch (e) {
      setError(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!profile) return;
    const trimmedName = displayName.trim();
    const trimmedHandle = handle.trim().toLowerCase();
    if (!trimmedName) {
      setError("Display name can't be empty.");
      return;
    }
    if (!/^[a-z0-9_.]{2,32}$/.test(trimmedHandle)) {
      setError("Handle must be 2–32 chars: lowercase letters, numbers, underscore, dot.");
      return;
    }
    if (handleStatus === "taken") {
      setError("That handle is already taken.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile(profile.id, {
        display_name: trimmedName,
        handle: trimmedHandle,
        bio,
        avatar_url: avatarUrl,
      });
      await refreshProfile();
      router.back();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scroll,
        isDesktop
          ? { paddingTop: 60, paddingBottom: 60 }
          : { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={[styles.card, isDesktop && styles.cardDesktop]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Icon
              name={isDesktop ? "close" : "arrow_back_ios_new"}
              size={isDesktop ? 18 : 16}
              color={colors.white}
            />
          </Pressable>
          <Text style={styles.title}>Edit profile</Text>
          <Pressable
            onPress={save}
            disabled={saving || handleStatus === "taken"}
            style={[
              styles.saveBtn,
              { opacity: saving || handleStatus === "taken" ? 0.5 : 1 },
            ]}
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
          </Pressable>
        </View>

        <View style={styles.avatarRow}>
          <Pressable onPress={pickFile} style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarEmpty}>
                <Icon name="auto_stories" size={40} color={colors.onSurfaceVariant} />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              {uploading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Icon name="edit" size={18} color={colors.white} />
              )}
            </View>
          </Pressable>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.label}>PROFILE PHOTO</Text>
            <Text style={styles.help}>
              JPG, PNG, WEBP, or GIF. 5 MB max.
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={pickFile} style={styles.ghostBtn}>
                <Text style={styles.ghostBtnText}>
                  {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
                </Text>
              </Pressable>
              {avatarUrl && (
                <Pressable
                  onPress={() => setAvatarUrl(null)}
                  style={[styles.ghostBtn, { backgroundColor: "rgba(255,107,107,0.08)" }]}
                >
                  <Text style={[styles.ghostBtnText, { color: colors.error }]}>Remove</Text>
                </Pressable>
              )}
            </View>
            {Platform.OS === "web" && (
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            )}
          </View>
        </View>

        <Field label="DISPLAY NAME">
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={colors.onSurfaceVariant}
            style={[styles.input, NO_OUTLINE]}
            maxLength={80}
          />
        </Field>

        <Field
          label="HANDLE"
          hint={
            handleStatus === "checking"
              ? "Checking…"
              : handleStatus === "free"
                ? "Available"
                : handleStatus === "taken"
                  ? "Taken"
                  : "2–32 chars: a–z, 0–9, _ ."
          }
          hintTone={
            handleStatus === "free"
              ? "good"
              : handleStatus === "taken"
                ? "bad"
                : "muted"
          }
        >
          <View style={styles.handleRow}>
            <Text style={styles.handlePrefix}>@</Text>
            <TextInput
              value={handle}
              onChangeText={(v) => setHandle(v.toLowerCase())}
              placeholder="yourname"
              placeholderTextColor={colors.onSurfaceVariant}
              style={[styles.input, { flex: 1 }, NO_OUTLINE]}
              autoCapitalize="none"
              maxLength={32}
            />
          </View>
        </Field>

        <Field label="BIO" hint={`${bio.length} / 240`} hintTone="muted">
          <TextInput
            value={bio}
            onChangeText={(v) => v.length <= 240 && setBio(v)}
            placeholder="A line about yourself."
            placeholderTextColor={colors.onSurfaceVariant}
            style={[styles.input, styles.textarea, NO_OUTLINE]}
            multiline
          />
        </Field>

        {error && (
          <View style={styles.errorBox}>
            <Icon name="close" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  hint,
  hintTone = "muted",
  children,
}: {
  label: string;
  hint?: string;
  hintTone?: "muted" | "good" | "bad";
  children: React.ReactNode;
}) {
  const hintColor =
    hintTone === "good" ? colors.primary : hintTone === "bad" ? colors.error : colors.onSurfaceVariant;
  return (
    <View style={{ marginTop: 24 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={[styles.hint, { color: hintColor }]}>{hint}</Text>}
      </View>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

const NO_OUTLINE = { outlineStyle: "none" } as unknown as never;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 },

  card: { width: "100%", alignSelf: "center" },
  cardDesktop: {
    maxWidth: 720,
    backgroundColor: colors.surfaceLow,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: fonts.headline, fontSize: 20, color: colors.white },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  saveBtnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: 13 },

  avatarRow: { flexDirection: "row", gap: 20, alignItems: "center" },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    position: "relative",
  },
  avatar: { width: "100%", height: "100%" },
  avatarEmpty: {
    flex: 1,
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
  ghostBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ghostBtnText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 12 },

  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
  },
  hint: { fontFamily: fonts.body, fontSize: 11 },
  help: { fontFamily: fonts.body, fontSize: 12, color: colors.onSurfaceVariant },

  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  textarea: { minHeight: 96, textAlignVertical: "top" },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  handlePrefix: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
  },

  errorBox: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.2)",
  },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.error, flex: 1 },
});
