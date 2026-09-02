import type { MenuAction } from "@expo/ui/community/menu";
import type { MyLibraryItemDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";
import { formatScholarName, getMyLibraryItemPercent } from "@sd/domain-content";
import { View, type DimensionValue } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { AppText, List } from "@/shared/ui";

/**
 * Describes one virtualized library row, including its display variant and
 * optional long-press actions. The row owns title/artwork fallback and binds
 * item identity to its callbacks so list callers remain presentation-only.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the public prop contract is documented above.
export type MyLibraryItemRowProps = {
  item: MyLibraryItemDto;
  variant: "progress" | "saved" | "completed";
  onPress?: () => void;
  testID?: string;
  /** Actions shown in a native context menu opened by long-pressing the row. */
  actions?: MenuAction[];
  onAction?: (id: string) => void;
};

function ProgressBarFill({ percent }: { percent: number }) {
  const width = getPercentWidth(percent);

  return (
    <View style={styles.progressTrack} testID="my-library-progress-bar">
      <View style={[styles.progressFill, { width }]} />
    </View>
  );
}

function getPercentWidth(percent: number): DimensionValue {
  return `${Math.min(percent, 100)}%`;
}

function renderMeta(
  item: MyLibraryItemDto,
  variant: MyLibraryItemRowProps["variant"],
  progress: number | null,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const duration = item.durationSeconds
    ? t("lecture.minutes", "{{count}} min", { count: Math.round(item.durationSeconds / 60) })
    : "";
  const annotations = getMetaAnnotations(item, variant, progress, t);
  return `${duration}${annotations.map((part) => ` · ${part}`).join("")}`;
}

function getMetaAnnotations(
  item: MyLibraryItemDto,
  variant: MyLibraryItemRowProps["variant"],
  progress: number | null,
  t: ReturnType<typeof useTranslation>["t"],
) {
  return [
    variant === "progress" && progress !== null
      ? t("myLibrary.percentListened", "{{percent}}% listened", { percent: progress })
      : "",
    variant === "saved" && item.savedAt
      ? t("myLibrary.savedOn", "Saved {{date}}", {
          date: new Date(item.savedAt).toLocaleDateString(),
        })
      : "",
    variant === "completed" && item.completedAt
      ? t("myLibrary.completedOn", "Completed {{date}}", {
          date: new Date(item.completedAt).toLocaleDateString(),
        })
      : "",
  ].filter(Boolean);
}

function renderActions(
  actions: MenuAction[] | undefined,
  onAction: ((id: string) => void) | undefined,
) {
  if (!actions?.length || !onAction) return null;
  return <List.Item.Actions actions={actions} onAction={onAction} />;
}

/**
 * Renders the library row while retaining an RN fallback for progress fill,
 * marquee metadata, and saved/completed action-menu behavior.
 */
export function MyLibraryItemRow({
  item,
  variant,
  onPress,
  testID,
  actions,
  onAction,
}: MyLibraryItemRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const lectureTitle = pickContentField(item.listingTitle, item.originalListingTitle, showOriginal);
  const scholarName = formatScholarName(item.scholarName, item.scholarTitle, t);
  const progress = getMyLibraryItemPercent(item);

  return (
    <List.Item onPress={onPress} testID={testID}>
      <View style={styles.rowContent}>
        <View style={styles.rowLayout}>
          <UserAvatar
            image={item.coverImageUrl ?? item.scholarImageUrl}
            name={lectureTitle}
            size={64}
            testID={`my-library-${variant}-avatar`}
          />
          <View style={styles.content}>
            <View style={styles.columnLayout}>
              <AppText variant="bodyMd" numberOfLines={2}>
                {lectureTitle}
              </AppText>
              <MarqueeText
                text={`${scholarName}${item.seriesTitle ? ` · ${item.seriesTitle}` : ""}`}
                variant="caption"
                style={styles.subtitle}
              />
              <AppText variant="xs" style={styles.meta}>
                {renderMeta(item, variant, progress, t)}
              </AppText>
              {variant === "progress" && progress !== null ? (
                <ProgressBarFill percent={progress} />
              ) : null}
            </View>
          </View>
        </View>
      </View>
      {renderActions(actions, onAction)}
    </List.Item>
  );
}

const styles = StyleSheet.create((theme) => ({
  rowContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.scale.md,
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
  },
  columnLayout: {
    gap: theme.spacing.scale.xs,
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
