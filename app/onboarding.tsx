import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Particles } from "../components/Particles";
import { PrimaryButton } from "../components/Buttons";
import { LineReveal } from "../components/LineReveal";
import { colors, fonts } from "../theme";

const SLIDES = [
  {
    tag: "WELCOME",
    titleA: "A sanctuary",
    italic: "verses",
    titleB: "for ",
    titleC: ".",
    body: "Read, write and listen to poetry crafted by a community of voices in the dark.",
    cover: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=900&q=80",
  },
  {
    tag: "WRITE",
    titleA: "Words that ",
    italic: "breathe",
    titleB: "",
    titleC: ".",
    body: "A distraction-free canvas with syllable counters, voice recording and editorial backdrops.",
    cover: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=900&q=80",
  },
  {
    tag: "LISTEN",
    titleA: "Hear the ",
    italic: "cadence",
    titleB: "",
    titleC: ".",
    body: "Every poem can be played back in its author's own voice. Build playlists, set the mood.",
    cover: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=900&q=80",
  },
] as const;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const cur = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  function complete() {
    router.replace("/(tabs)");
  }

  return (
    <View style={styles.root}>
      <Image source={{ uri: cur.cover }} style={styles.cover} contentFit="cover" key={step} />
      <LinearGradient
        colors={["rgba(14,14,14,0.3)", "rgba(14,14,14,0.85)", colors.surface]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Particles count={10} />
      <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.brand}>VERSIFY</Text>
          <Pressable onPress={complete}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.spacer} />
        <LineReveal key={`s${step}`}>
          <View style={styles.tagRow}>
            <View style={styles.tagBar} />
            <Text style={styles.tagText}>{cur.tag}</Text>
          </View>
          <Text style={styles.title}>
            {cur.titleA}
            {cur.titleB}
            <Text style={styles.titleItalic}>{cur.italic}</Text>
            {cur.titleC}
          </Text>
          <Text style={styles.body}>{cur.body}</Text>
        </LineReveal>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  flex: i === step ? 2 : 1,
                  backgroundColor: i === step ? colors.primary : colors.hairlineStrong,
                },
              ]}
            />
          ))}
        </View>
        <PrimaryButton
          label={isLast ? "Begin" : "Continue"}
          onPress={() => (isLast ? complete() : setStep(step + 1))}
          style={{ marginHorizontal: 28, marginBottom: 28 }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  cover: { ...StyleSheet.absoluteFillObject, opacity: 0.55 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  brand: { fontFamily: fonts.headline, fontSize: 13, letterSpacing: 2.4, color: colors.white },
  skip: { fontFamily: fonts.bodyBold, color: colors.onSurfaceVariant, fontSize: 13 },
  spacer: { flex: 1 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16, paddingHorizontal: 28 },
  tagBar: { width: 24, height: 1, backgroundColor: colors.primary },
  tagText: { fontFamily: fonts.headline, fontSize: 11, letterSpacing: 2.4, color: colors.primary },
  title: {
    fontFamily: fonts.headline,
    fontSize: 48,
    lineHeight: 50,
    color: colors.white,
    letterSpacing: -0.6,
    paddingHorizontal: 28,
  },
  titleItalic: { fontFamily: fonts.headlineItalic, color: colors.primary },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.onSurfaceVariant,
    marginTop: 24,
    maxWidth: 320,
    paddingHorizontal: 28,
  },
  dots: { flexDirection: "row", gap: 6, marginHorizontal: 28, marginVertical: 28 },
  dot: { height: 3, borderRadius: 999 },
});
