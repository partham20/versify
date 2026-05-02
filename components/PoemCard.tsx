import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme";
import { Icon } from "./Icon";
import type { PoemWithStats } from "../lib/database.types";
import { formatReadTime } from "../lib/syllables";

type Props = {
  poem: PoemWithStats;
  liked: boolean;
  onPress: () => void;
  onToggleLike: () => void;
};

// "From poets you follow" row card — image left, title + excerpt + meta right.
export function PoemCard({ poem, liked, onPress, onToggleLike }: Props) {
  const excerpt = poem.body[0]?.replace(/\n/g, " ").slice(0, 160) ?? "";
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.cover}>
        {poem.cover_url ? (
          <Image source={{ uri: poem.cover_url }} style={styles.coverImg} />
        ) : (
          <View style={[styles.coverImg, { backgroundColor: colors.surfaceHigh }]} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.author}>{poem.author_name.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {poem.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={3}>
          “{excerpt}”
        </Text>
        <View style={styles.meta}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleLike();
            }}
            style={styles.metaItem}
          >
            <Icon name="favorite" size={16} color={liked ? colors.primary : colors.onSurfaceVariant} />
            <Text style={[styles.metaText, liked && { color: colors.primary }]}>
              {(poem.like_count + (liked ? 1 : 0)).toLocaleString()}
            </Text>
          </Pressable>
          <View style={styles.metaItem}>
            <Icon name="chat_bubble" size={15} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{poem.comment_count}</Text>
          </View>
          <Text style={styles.readTime}>{formatReadTime(poem.read_time_seconds)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  cover: {
    width: 100,
    height: 132,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceHigh,
  },
  coverImg: {
    width: "100%",
    height: "100%",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  author: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 22,
    color: colors.white,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  excerpt: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 19,
    color: colors.onSurfaceVariant,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  readTime: {
    marginLeft: "auto",
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.onSurfaceVariant,
  },
});
