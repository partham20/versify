import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DesktopShell } from "../components/desktop/DesktopShell";
import { Icon, type IconName } from "../components/Icon";
import { useAuth } from "../lib/auth";
import { useIsDesktop } from "../lib/breakpoints";
import { colors, fonts } from "../theme";

export default function Settings() {
  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <DesktopShell>
        <SettingsScreen />
      </DesktopShell>
    );
  }
  return <SettingsScreen />;
}

function SettingsScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const isDesktop = useIsDesktop();
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } finally {
      setSigningOut(false);
    }
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
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <Section label="ACCOUNT">
          <Row
            icon="alternate_email"
            label="Email"
            value={user?.email ?? "—"}
          />
          <Row
            icon="person_add"
            label="Display name"
            value={profile?.display_name ?? "—"}
          />
          <Row
            icon="verified"
            label="Handle"
            value={profile?.handle ? `@${profile.handle}` : "—"}
          />
          <Pressable
            onPress={() => router.push("/profile/edit" as never)}
            style={styles.actionRow}
          >
            <Icon name="edit_note" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Edit profile</Text>
            <Icon name="arrow_forward_ios" size={14} color={colors.onSurfaceVariant} />
          </Pressable>
        </Section>

        <Section label="NOTIFICATIONS">
          <ToggleRow
            icon="notifications"
            label="Push notifications"
            help="Likes, echoes, and follows on this device."
            value={pushEnabled}
            onChange={setPushEnabled}
          />
          <ToggleRow
            icon="ios_share"
            label="Weekly email digest"
            help="A handful of poems we think you'll love."
            value={emailDigest}
            onChange={setEmailDigest}
          />
        </Section>

        <Section label="ABOUT">
          <Row icon="auto_stories" label="Versify" value="v0.1.0" />
          <Pressable style={styles.actionRow}>
            <Icon name="format_quote" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.actionTextMuted}>Terms & privacy</Text>
            <Icon name="arrow_forward_ios" size={14} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable style={styles.actionRow}>
            <Icon name="auto_awesome" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.actionTextMuted}>What's new</Text>
            <Icon name="arrow_forward_ios" size={14} color={colors.onSurfaceVariant} />
          </Pressable>
        </Section>

        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          style={[styles.signOutBtn, { opacity: signingOut ? 0.6 : 1 }]}
        >
          <Icon name="close" size={16} color={colors.error} />
          <Text style={styles.signOutText}>
            {signingOut ? "Signing out…" : "Sign out"}
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          Signed in as {user?.email ?? "—"}
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} color={colors.onSurfaceVariant} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  help,
  value,
  onChange,
}: {
  icon: IconName;
  label: string;
  help: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} color={colors.onSurfaceVariant} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHelp}>{help}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceHigh, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
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

  section: { marginBottom: 28 },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    marginBottom: 10,
  },
  sectionBody: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 14,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  rowLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.white, flex: 1 },
  rowValue: { fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant, maxWidth: 240 },
  rowHelp: { fontFamily: fonts.body, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary, flex: 1 },
  actionTextMuted: { fontFamily: fonts.body, fontSize: 14, color: colors.white, flex: 1 },

  signOutBtn: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,107,107,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  signOutText: { color: colors.error, fontFamily: fonts.bodyBold, fontSize: 14 },

  footer: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});
