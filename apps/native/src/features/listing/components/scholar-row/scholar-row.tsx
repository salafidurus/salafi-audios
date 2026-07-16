import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";

export type ScholarRowProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarRow({ scholar, onPress }: ScholarRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(scholar.slug)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      testID="scholar-row"
    >
      <View style={styles.avatarContainer}>
        {scholar.imageUrl ? (
          <Image
            source={{ uri: scholar.imageUrl }}
            style={styles.avatar}
            testID="scholar-row-avatar"
          />
        ) : (
          <View style={styles.avatarPlaceholder} testID="scholar-row-avatar-placeholder" />
        )}
      </View>
      <View style={styles.content}>
        <AppText variant="bodyMd" numberOfLines={1}>
          {scholar.name}
        </AppText>
        <View style={styles.subtitle}>
          {scholar.mainLanguage ? (
            <AppText variant="caption">{scholar.mainLanguage}</AppText>
          ) : null}
          <AppText variant="caption">{scholar.lectureCount} lectures</AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    borderBottomWidth: theme.border.width.default,
    borderBottomColor: theme.colors.border.subtle,
  },
  pressed: {
    opacity: 0.7,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: theme.colors.surface.subtle,
  },
  content: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  subtitle: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
  },
}));
