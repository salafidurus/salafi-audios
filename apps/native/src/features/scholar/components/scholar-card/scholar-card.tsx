import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image } from "expo-image";
import type { ScholarListItemDto } from "@sd/core-contracts";

export type ScholarCardProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarCard({ scholar, onPress }: ScholarCardProps) {
  return (
    <Pressable onPress={() => onPress?.(scholar.slug)} style={styles.card}>
      <View style={styles.avatar}>
        {scholar.imageUrl && (
          <Image source={{ uri: scholar.imageUrl }} style={styles.avatarImage} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {scholar.name}
      </Text>
      {scholar.mainLanguage && <Text style={styles.language}>{scholar.mainLanguage}</Text>}
      <Text style={styles.lectureCount}>{scholar.lectureCount} lectures</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 12,
    padding: theme.spacing.scale.md,
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.surface.default,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: theme.colors.surface.subtle,
  },
  avatarImage: {
    width: 64,
    height: 64,
  },
  name: {
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
    color: theme.colors.content.strong,
  },
  language: {
    fontSize: 12,
    color: theme.colors.content.muted,
  },
  lectureCount: {
    fontSize: 12,
    color: theme.colors.content.disabled,
  },
}));
