import type { MenuAction } from "@expo/ui/community/menu";
import type { LibraryItemDto } from "@sd/core-contracts";

import { Column, Row } from "@expo/ui";
import { pickContentField } from "@sd/core-i18n";
import { getLibraryItemPercent } from "@sd/domain-content";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { NativeIcon, NativeProgress, NativeText } from "@/shared/ui";

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
  const iconName = (() => {
    switch (variant) {
      case "saved":
        return "bookmark" as const;
      case "progress":
        return "clock" as const;
      case "completed":
        return "check" as const;
    }
  })();

  const testID = `library-item-icon-${variant}`;

  return <NativeIcon testID={testID} name={iconName} size={20} colorRole="muted" />;
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
  const { theme } = useUnistyles();
  const lectureTitle = pickContentField(item.listingTitle, item.originalListingTitle, showOriginal);
  const progress = getLibraryItemPercent(item);

  return (
    <List.Item onPress={onPress} hideBorder={hideBorder} testID={testID}>
      <Row alignment="center" spacing={theme.spacing.scale.md}>
        <Column>
          <LibraryItemIcon variant={variant} />
        </Column>
        <Column spacing={theme.spacing.scale.xs}>
          <NativeText variant="bodyMd" colorRole="strong" numberOfLines={2}>
            {lectureTitle}
          </NativeText>
          <MarqueeText
            text={`${item.scholarName}${item.seriesTitle ? ` · ${item.seriesTitle}` : ""}`}
            variant="caption"
          />
          <NativeText variant="caption" colorRole="muted">
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
          </NativeText>
          {variant === "progress" && progress !== null ? (
            <NativeProgress value={progress / 100} variant="linear" testID="library-progress-bar" />
          ) : null}
        </Column>
      </Row>
      {actions?.length && onAction ? (
        <List.Item.Actions actions={actions} onAction={onAction} />
      ) : null}
    </List.Item>
  );
}
