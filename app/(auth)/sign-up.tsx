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
import { Particles } from "../../components/Particles";
import { PrimaryButton } from "../../components/Buttons";
import { useAuth } from "../../lib/auth";
import { colors, fonts, radius } from "../../theme";

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    const { error } = await signUp(email.trim(), password, name.trim());
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/onboarding");
  }

  return (
    <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
      <Particles count={10} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.body}>
          <View style={styles.tagRow}>
            <View style={styles.tagBar} />
            <Text style={styles.tagText}>JOIN VERSIFY</Text>
          </View>
          <Text style={styles.title}>
            Words that{"\n"}<Text style={styles.titleItalic}>breathe</Text>.
          </Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.input}
            />
          </View>
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
              autoComplete="new-password"
              style={styles.input}
            />
            <Text style={styles.hint}>At least 8 characters.</Text>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <PrimaryButton
            label={submitting ? "Creating account…" : "Begin"}
            onPress={onSubmit}
            disabled={submitting || !email || password.length < 8 || !name}
            style={{ marginTop: 24 }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 80 },
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
    marginBottom: 32,
  },
  titleItalic: {
    fontFamily: fonts.headlineItalic,
    color: colors.primary,
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
  },
  hint: { color: colors.onSurfaceVariant, fontFamily: fonts.body, fontSize: 11, marginTop: 6 },
  error: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 8,
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: colors.onSurfaceVariant, fontFamily: fonts.body, fontSize: 13 },
  footerLink: { color: colors.primary, fontFamily: fonts.bodyBold, fontSize: 13 },
});
