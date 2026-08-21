import type { MenuAction } from "@expo/ui/community/menu";
import type { LibraryItemDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";
import { getLibraryItemPercent } from "@sd/domain-content";
import { Bookmark, Clock, CheckCircle } from "lucide-react-native";
import { View, type DimensionValue } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";

export type LibraryItemRowProps = {
  item: LibraryItemDto;
  variant: "progress" | "saved" | "completed";
  onPress?: () => void;
  hideBorder?: boolean;
  testID?: string;
  /** Actions shown in a native context menu opened by long-pressing the row. */
  actions?: MenuAction[];
  onAction?: (id: string) => void;
};

type LibraryItemIconProps = {
  variant: "progress" | "saved" | "completed";
};

function LibraryItemIcon({ variant }: LibraryItemIconProps) {
  const { theme } = useUnistyles();
  const iconProps = { size: 20, color: theme.colors.content.muted };
  const icon = (() => {
    switch (variant) {
      case "saved":
        return <Bookmark {...iconProps} />;
      case "progress":
        return <Clock {...iconProps} />;
      case "completed":
        return <CheckCircle {...iconProps} />;
    }
  })();

  const testID = `library-item-icon-${variant}`;

  return <View testID={testID}>{icon}</View>;
}

function ProgressBarFill({ percent }: { percent: number }) {
  const width = getPercentWidth(percent);

  return (
    <View style={styles.progressTrack} testID="library-progress-bar">
      <View style={[styles.progressFill, { width }]} />
    </View>
  );
}

function getPercentWidth(percent: number): DimensionValue {
  return `${Math.min(percent, 100)}%`;
}

export function LibraryItemRow({
  item,
  variant,
  onPress,
  hideBorder = false,
  testID,
  actions,
  onAction,
}: LibraryItemRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const lectureTitle = pickContentField(item.listingTitle, item.originalListingTitle, showOriginal);
  const progress = getLibraryItemPercent(item);

  return (
    <List.Item onPress={onPress} hideBorder={hideBorder} testID={testID}>
      <View style={styles.rowContent}>
        <View style={styles.iconContainer}>
          <LibraryItemIcon variant={variant} />
        </View>
        <View style={styles.content}>
          <AppText variant="bodyMd" numberOfLines={2}>
            {lectureTitle}
          </AppText>
          <MarqueeText
            text={`${item.scholarName}${item.seriesTitle ? ` · ${item.seriesTitle}` : ""}`}
            variant="caption"
            style={styles.subtitle}
          />
          <AppText variant="xs" style={styles.meta}>
            {item.durationSeconds
              ? t("lecture.minutes", "{{count}} min", {
                  count: Math.round(item.durationSeconds / 60),
                })
              : ""}
            {variant === "progress" && progress !== null
              ? ` · ${t("library.percentListened", "{{percent}}% listened", { percent: progress })}`
              : ""}
            {variant === "saved" && item.savedAt
              ? ` · ${t("library.savedOn", "Saved {{date}}", {
                  date: new Date(item.savedAt).toLocaleDateString(),
                })}`
              : ""}
            {variant === "completed" && item.completedAt
              ? ` · ${t("library.completedOn", "Completed {{date}}", {
                  date: new Date(item.completedAt).toLocaleDateString(),
                })}`
              : ""}
          </AppText>
          {variant === "progress" && progress !== null ? (
            <ProgressBarFill percent={progress} />
          ) : null}
        </View>
      </View>
      {actions?.length && onAction ? (
        <List.Item.Actions actions={actions} onAction={onAction} />
      ) : null}
    </List.Item>
  );
}

const styles = StyleSheet.create((theme) => ({
  rowContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.scale.md,
  },
  iconContainer: {
    paddingTop: theme.spacing.scale.xs,
  },
  content: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  subtitle: {
    color: theme.colors.content.muted,
  },
  meta: {
    color: theme.colors.content.muted,
  },
  progressTrack: {
    height: 3,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.scale.full,
    marginTop: theme.spacing.scale.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.content.strong,
    borderRadius: theme.radius.scale.full,
  },
}));
