import type { ScholarListItemDto } from "@sd/core-contracts";

import { useFormatScholarName } from "@sd/domain-content";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

/** Provides the native features listing components scholar-row scholar-row module responsibility. */
/** Describes the ScholarRowProps native type contract and behavior. */
export type ScholarRowProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
  hideBorder?: boolean;
};

/** Describes the ScholarRow native function contract and behavior. */
export function ScholarRow({ scholar, onPress, hideBorder }: ScholarRowProps) {
  const formatScholarName = useFormatScholarName();

  return (
    <List.Item onPress={() => onPress?.(scholar.slug)} hideBorder={hideBorder}>
      <View style={styles.rowContent} testID="scholar-row">
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
  metaText: {
    color: theme.colors.content.subtle,
  },
}));
