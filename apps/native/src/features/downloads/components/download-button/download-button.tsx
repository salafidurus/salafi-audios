import { ActivityIndicator, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useDownload } from "@/features/downloads/hooks/use-download";
import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/Button/Button";

/** Implements the native offline-download lifecycle, persistence, and synchronization boundary. */
type DownloadButtonProps = {
  /** Carries the canonical lecture identity used to reconcile local and remote state. */
  listingSlug: string;
  audioUrl: string;
};

/** Renders the native download button surface and coordinates its user-facing state. */
export function DownloadButton({ listingSlug, audioUrl }: DownloadButtonProps) {
  const { status, isDownloaded, isDownloading, startDownload, removeDownload } = useDownload(
    listingSlug,
    audioUrl,
  );
  const { theme } = useUnistyles();

  if (isDownloaded) {
    return (
      <Button
        label="✓ Downloaded"
        variant="surface"
        onPress={removeDownload}
        accessibilityLabel="Remove download"
        style={[styles.pill, styles.downloadedPill]}
        testID="remove-download"
      />
    );
  }

  if (isDownloading) {
    return (
      <View style={[styles.pill, styles.downloadingPill]}>
        <ActivityIndicator size="small" color={theme.colors.action.primary} />
        <AppText variant="caption" style={styles.downloadingLabel}>
          Downloading
        </AppText>
      </View>
    );
  }

  return (
    <Button
      label={status === "error" ? "⚠ Retry" : "↓ Download"}
      variant="outline"
      onPress={startDownload}
      accessibilityLabel="Download lecture"
      style={[styles.pill, styles.downloadPill]}
      testID="download-lecture"
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  pill: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadedPill: {
    backgroundColor: theme.colors.state.successSurface,
  },
  downloadedLabel: {
    fontSize: 13,
    color: theme.colors.state.success,
    fontWeight: "600",
  },
  downloadingPill: {
    backgroundColor: theme.colors.surface.primarySubtle,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  downloadingLabel: {
    fontSize: 13,
    color: theme.colors.action.primary,
  },
  downloadPill: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  downloadLabel: {
    fontSize: 13,
    color: theme.colors.content.default,
  },
}));
