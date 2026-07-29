import type { ScholarListItemDto } from "@sd/core-contracts";

import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";

export type ScholarRowProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
  hideBorder?: boolean;
};

export function ScholarRow({ scholar, onPress, hideBorder }: ScholarRowProps) {
  return (
    <List.Item onPress={() => onPress?.(scholar.slug)} hideBorder={hideBorder}>
      <View style={styles.rowContent} testID="scholar-row">
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
          <MarqueeText text={scholar.name} variant="bodyMd" />
          <View style={styles.subtitle}>
            {scholar.mainLanguage ? (
              <AppText variant="caption">{scholar.mainLanguage}</AppText>
            ) : null}
            <AppText variant="caption">{scholar.lectureCount} lectures</AppText>
          </View>
        </View>
      </View>
    </List.Item>
  );
}

const styles = StyleSheet.create((theme) => ({
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
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
