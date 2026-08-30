import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/Button/Button";

/** Provides authenticated native administration workflows and their data boundaries. */
type BulkActionBarProps = {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  canPublish: boolean;
  canArchive: boolean;
  isLoading?: boolean;
};

/** Renders the native bulk action bar surface and coordinates its user-facing state. */
export function BulkActionBar({
  selectedCount,
  onPublish,
  onArchive,
  canPublish,
  canArchive,
  isLoading,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  if (!canPublish && !canArchive) return null;
  return (
    <View style={styles.container}>
      <AppText variant="caption" style={styles.countText}>
        {selectedCount} selected
      </AppText>
      {canPublish ? (
        <Button
          label="Publish"
          variant="surface"
          onPress={onPublish}
          disabled={isLoading}
          style={styles.publishBtn}
        />
      ) : null}
      {canArchive ? (
        <Button
          label="Archive"
          variant="danger"
          onPress={onArchive}
          disabled={isLoading}
          style={styles.archiveBtn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.scale.md,
    backgroundColor: theme.colors.surface.inverse,
    gap: theme.spacing.scale.sm,
  },
  countText: {
    flex: 1,
    color: theme.colors.content.inverse,
    fontSize: 13,
  },
  publishBtn: {
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.sm,
    backgroundColor: theme.colors.action.success,
    borderRadius: theme.radius.scale.sm,
  },
  archiveBtn: {
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.sm,
    backgroundColor: theme.colors.action.danger,
    borderRadius: theme.radius.scale.sm,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  publishBtnText: {
    color: theme.colors.content.onSuccess,
  },
  archiveBtnText: {
    color: theme.colors.content.onDanger,
  },
}));
