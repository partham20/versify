import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Glass } from "../../components/Glass";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../lib/auth";
import { fetchComments, postComment } from "../../lib/poems";
import { colors, fonts, radius } from "../../theme";

type CommentItem = Awaited<ReturnType<typeof fetchComments>>[number];

export default function Comments() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchComments(id).then(setComments);
  }, [id]);

  async function submit() {
    if (!text.trim() || !user || !id) return;
    const body = text.trim();
    setText("");
    const optimistic: CommentItem = {
      id: `tmp-${Date.now()}`,
      poem_id: id,
      author_id: user.id,
      parent_id: null,
      body,
      created_at: new Date().toISOString(),
      author_name: profile?.display_name ?? "You",
      author_handle: profile?.handle ?? "you",
      author_avatar: profile?.avatar_url ?? null,
    };
    setComments((prev) => [optimistic, ...prev]);
    try {
      await postComment(id, user.id, body);
      const fresh = await fetchComments(id);
      setComments(fresh);
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Icon name="arrow_back_ios_new" size={16} color={colors.white} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.over}>{comments.length} STANZAS OF CONVERSATION</Text>
          <Text style={styles.title}>Comments</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {comments.map((c) => (
          <View key={c.id} style={styles.row}>
            {c.author_avatar ? (
              <Image source={{ uri: c.author_avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.surfaceHigh }]} />
            )}
            <View style={{ flex: 1 }}>
              <View style={styles.headRow}>
                <Text style={styles.author}>{c.author_name}</Text>
                <Text style={styles.time}>{relativeTime(c.created_at)}</Text>
              </View>
              <Text style={styles.body}>{c.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.composer}>
        <Glass intensity={40} rounded={999} style={{ padding: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.composerAvatar} contentFit="cover" />
          ) : (
            <View style={[styles.composerAvatar, { backgroundColor: colors.surfaceHigh }]} />
          )}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add a stanza of thought…"
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.composerInput}
            onSubmitEditing={submit}
            returnKeyType="send"
          />
          <Pressable
            onPress={submit}
            style={[
              styles.sendBtn,
              { backgroundColor: text.trim() ? colors.primary : colors.surfaceChip },
            ]}
          >
            <Icon
              name="arrow_upward"
              size={18}
              color={text.trim() ? colors.onPrimary : colors.onSurfaceVariant}
            />
          </Pressable>
        </Glass>
      </View>
    </KeyboardAvoidingView>
  );
}

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceChip,
    alignItems: "center",
    justifyContent: "center",
  },
  over: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2.4, color: colors.onSurfaceVariant },
  title: { fontFamily: fonts.headline, fontSize: 14, color: colors.white },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 24 },
  row: { flexDirection: "row", gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  headRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  author: { fontFamily: fonts.headlineRegular, fontSize: 13, color: colors.white },
  time: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.6, color: colors.onSurfaceVariant },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.white, marginTop: 6 },
  composer: { position: "absolute", left: 12, right: 12, bottom: 24 },
  composerAvatar: { width: 32, height: 32, borderRadius: 16, marginLeft: 6 },
  composerInput: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
