import { View, Pressable, Text, ActivityIndicator } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDownload } from "@/features/downloads/hooks/use-download";

type DownloadButtonProps = {
  lectureId: string;
  audioUrl: string;
};

export function DownloadButton({ lectureId }: DownloadButtonProps) {
  const { status, isDownloaded, isDownloading, startDownload, removeDownload } =
    useDownload(lectureId);
  const { theme } = useUnistyles();

  if (isDownloaded) {
    return (
      <Pressable
        onPress={removeDownload}
        style={[styles.pill, styles.downloadedPill]}
        accessibilityLabel="Remove download"
      >
        <Text style={styles.downloadedLabel}>✓ Downloaded</Text>
      </Pressable>
    );
  }

  if (isDownloading) {
    return (
      <View style={[styles.pill, styles.downloadingPill]}>
        <ActivityIndicator size="small" color={theme.colors.action.primary} />
        <Text style={styles.downloadingLabel}>Downloading</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={startDownload}
      disabled={status === "error"}
      style={[styles.pill, styles.downloadPill]}
      accessibilityLabel="Download lecture"
    >
      <Text style={styles.downloadLabel}>{status === "error" ? "⚠ Retry" : "↓ Download"}</Text>
    </Pressable>
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
