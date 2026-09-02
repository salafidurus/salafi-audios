import { Host, Row } from "@expo/ui";
import { StyleSheet } from "react-native-unistyles";

import { toUniversalStyleFromRN } from "@/core/styles/expo-ui";
import { useDownload } from "@/features/downloads/hooks/use-download";
import { NativeButton, NativeProgress, NativeText } from "@/shared/ui";

/** Renders native download actions while the download hook owns lifecycle state. */
/**
 * Carries the stable lecture identity and source URL into the download button.
 * The component uses these values to start, retry, or remove the device-local
 * artifact while the download hook remains the owner of lifecycle state.
 */
export type DownloadButtonProps = {
  /** Identifies the lecture and its remote audio source for the download lifecycle. */
  listingSlug: string;
  audioUrl: string;
};

/**
 * Renders device-local download actions.
 *
 * The hook remains authoritative for lifecycle status; this component only
 * maps idle/error, active, and complete states to native presentation and
 * forwards start/remove side effects to the hook.
 */
export function DownloadButton({ listingSlug, audioUrl }: DownloadButtonProps) {
  const { status, isDownloaded, isDownloading, startDownload, removeDownload } = useDownload(
    listingSlug,
    audioUrl,
  );
  if (isDownloaded) {
    return (
      <Host>
        <NativeButton
          label="✓ Downloaded"
          variant="surface"
          onPress={removeDownload}
          accessibilityLabel="Remove download"
          style={toUniversalStyleFromRN([styles.pill, styles.downloadedPill])}
          testID="remove-download"
        />
      </Host>
    );
  }

  if (isDownloading) {
    return (
      <Host>
        <Row
          alignment="center"
          spacing={6}
          style={toUniversalStyleFromRN([styles.pill, styles.downloadingPill])}
        >
          <NativeProgress variant="circular" value={0.5} testID="download-progress-spinner" />
          <NativeText variant="caption" colorRole="primary">
            Downloading
          </NativeText>
        </Row>
      </Host>
    );
  }

  return (
    <Host>
      <NativeButton
        label={status === "error" ? "⚠ Retry" : "↓ Download"}
        variant="outline"
        onPress={startDownload}
        accessibilityLabel="Download lecture"
        style={toUniversalStyleFromRN([styles.pill, styles.downloadPill])}
        testID="download-lecture"
      />
    </Host>
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
  downloadingPill: {
    backgroundColor: theme.colors.surface.primarySubtle,
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
