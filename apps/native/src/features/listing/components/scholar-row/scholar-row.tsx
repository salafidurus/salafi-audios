import type { ScholarListItemDto } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MarqueeText } from "@/shared/components/MarqueeText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { AppText } from "@/shared/ui";

/** Builds native lecture and scholar content surfaces from canonical identities. */
/** Describes the inputs and callbacks accepted by Scholar Row. */
export type ScholarRowProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

/**
 * Renders a scholar row through the RN fallback because its callers use a
 * virtualized FlatList; native List.Item cannot be nested in that cell safely.
 */
export function ScholarRow({ scholar, onPress }: ScholarRowProps) {
  const formatScholarName = useFormatScholarName();

  return (
    <Pressable
      onPress={() => onPress?.(scholar.slug)}
      accessibilityRole="button"
      testID="scholar-row"
      style={styles.row}
    >
      <UserAvatar
        image={scholar.imageUrl}
        name={scholar.name}
        size={48}
        testID={scholar.imageUrl ? "scholar-row-avatar" : "scholar-row-avatar-placeholder"}
      />
      <View style={styles.content}>
        <MarqueeText text={formatScholarName(scholar)} variant="titleMd" />
        <View style={styles.subtitle}>
          {scholar.mainLanguage ? (
            <AppText variant="xs" style={styles.metaText}>
              {scholar.mainLanguage}
            </AppText>
          ) : null}
          <AppText variant="xs" style={styles.metaText}>
            {scholar.lectureCount} lectures
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
  },
  content: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  subtitle: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
  },
  metaText: {
    color: theme.colors.content.subtle,
  },
}));
