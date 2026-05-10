import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../../components/Logo";
import { Particles } from "../../components/Particles";
import { PrimaryButton } from "../../components/Buttons";
import { useAuth } from "../../lib/auth";
import { useIsDesktop } from "../../lib/breakpoints";
import { colors, fonts, radius } from "../../theme";

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const isDesktop = useIsDesktop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/(tabs)");
  }

  const form = (
    <>
      {!isDesktop && (
        <View style={{ marginBottom: 24 }}>
          <Logo height={64} />
        </View>
      )}
      <View style={styles.tagRow}>
        <View style={styles.tagBar} />
        <Text style={styles.tagText}>WELCOME BACK</Text>
      </View>
      <Text style={[styles.title, isDesktop && styles.titleDesktop]}>
        A sanctuary{"\n"}for <Text style={styles.titleItalic}>verses</Text>.
      </Text>
      <Text style={styles.sub}>Sign in to read, write, and listen.</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>EMAIL</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.onSurfaceVariant}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>PASSWORD</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          style={styles.input}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        label={submitting ? "Signing in…" : "Continue"}
        onPress={onSubmit}
        disabled={submitting || !email || !password}
        style={{ marginTop: 24 }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable>
            <Text style={styles.footerLink}>Create one</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.desktopHero}>
          <LinearGradient
            colors={["#0b2615", "#0e0e0e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Particles count={14} />
          <View style={styles.desktopHeroInner}>
            <Logo height={96} />
            <View style={{ flex: 1 }} />
            <Text style={styles.heroQuote}>
              "Poetry is not a turning loose of emotion, but an{" "}
              <Text style={styles.heroQuoteItalic}>escape</Text> from emotion."
            </Text>
            <Text style={styles.heroAttribution}>— T. S. Eliot</Text>
          </View>
        </View>
        <View style={styles.desktopFormSide}>
          <View style={styles.desktopFormCard}>{form}</View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
      <Particles count={10} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.body}>{form}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 80 },

  desktopRoot: { flex: 1, flexDirection: "row", backgroundColor: colors.surface },
  desktopHero: {
    flex: 1,
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: colors.hairline,
  },
  desktopHeroInner: {
    flex: 1,
    paddingHorizontal: 64,
    paddingVertical: 56,
  },
  heroQuote: {
    fontFamily: fonts.headlineRegular,
    fontSize: 32,
    lineHeight: 42,
    color: colors.white,
    letterSpacing: -0.4,
    maxWidth: 480,
  },
  heroQuoteItalic: {
    fontFamily: fonts.headlineItalic,
    color: colors.primary,
  },
  heroAttribution: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 16,
    letterSpacing: 1.6,
  },
  desktopFormSide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  desktopFormCard: {
    width: "100%",
    maxWidth: 440,
  },

  tagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  tagBar: { width: 24, height: 1, backgroundColor: colors.primary },
  tagText: {
    fontFamily: fonts.headline,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 48,
    lineHeight: 50,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  titleDesktop: {
    fontSize: 40,
    lineHeight: 44,
  },
  titleItalic: {
    fontFamily: fonts.headlineItalic,
    color: colors.primary,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    marginBottom: 40,
  },
  field: { marginBottom: 18 },
  fieldLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
  },
  error: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: { color: colors.onSurfaceVariant, fontFamily: fonts.body, fontSize: 13 },
  footerLink: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 13 },
});
