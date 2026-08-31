import { Column, Host } from "@expo/ui";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { toUniversalStyleFromRN } from "@/core/styles/expo-ui";
import { useDownload } from "@/features/downloads/hooks/use-download";
import { NativeProgress, NativeText } from "@/shared/ui";

/** Renders native transfer progress while the download hook owns lifecycle state. */
/**
 * Identifies the lecture whose active device-local transfer is displayed.
 * The component renders nothing for idle or completed states; progress values
 * remain owned by the download hook and are never mutated by this surface.
 */
export type DownloadProgressProps = {
  /** Identifies the lecture whose active device-local download percentage is displayed. */
  listingSlug: string;
};

/** Renders active device-local download progress and hides completed/idle states. */
export function DownloadProgress({ listingSlug }: DownloadProgressProps) {
  const { isDownloading, progress } = useDownload(listingSlug);
  const { theme } = useUnistyles();

  if (!isDownloading) return null;

  return (
    <Host>
      <Column spacing={theme.spacing.scale.xs} style={toUniversalStyleFromRN(styles.container)}>
        <NativeProgress variant="linear" value={progress / 100} testID="download-progress-bar" />
        <NativeText variant="caption" colorRole="muted">
          {`${Math.round(progress)}%`}
        </NativeText>
      </Column>
    </Host>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    alignSelf: "stretch",
  },
}));
