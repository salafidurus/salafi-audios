import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useDownload } from "@/features/downloads/hooks/use-download";
import { AppText } from "@/shared/components/AppText/AppText";

/** Implements the native offline-download lifecycle, persistence, and synchronization boundary. */
type DownloadProgressProps = {
  /** Carries the canonical lecture identity used to reconcile local and remote state. */
  listingSlug: string;
};

/** Renders the native download progress surface and coordinates its user-facing state. */
export function DownloadProgress({ listingSlug }: DownloadProgressProps) {
  const { isDownloading, progress } = useDownload(listingSlug);

  if (!isDownloading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <AppText variant="caption" style={styles.label}>
        {Math.round(progress)}%
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.scale.xs,
  },
  track: {
    height: 3,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: theme.colors.action.primary,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    color: theme.colors.content.muted,
  },
}));
