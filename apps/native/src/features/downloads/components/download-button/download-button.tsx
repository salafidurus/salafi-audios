import { ActivityIndicator, View, Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useDownload } from "@/features/downloads/hooks/use-download";
import { NativeBridgeHost, NativeText } from "@/shared/ui";

type DownloadButtonProps = {
  lectureId: string;
  audioUrl: string;
};

export function DownloadButton({ lectureId, audioUrl }: DownloadButtonProps) {
  const { status, isDownloaded, isDownloading, startDownload, removeDownload } = useDownload(
    lectureId,
    audioUrl,
  );
  const { theme } = useUnistyles();

  if (isDownloaded) {
    return (
      <Pressable
        onPress={removeDownload}
        style={[styles.pill, styles.downloadedPill]}
        accessibilityLabel="Remove download"
      >
        <NativeBridgeHost>
          <NativeText variant="caption" colorRole="success">
            ✓ Downloaded
          </NativeText>
        </NativeBridgeHost>
      </Pressable>
    );
  }

  if (isDownloading) {
    return (
      <View style={[styles.pill, styles.downloadingPill]}>
        <ActivityIndicator size="small" color={theme.colors.action.primary} />
        <NativeBridgeHost>
          <NativeText variant="caption" colorRole="primary">
            Downloading
          </NativeText>
        </NativeBridgeHost>
      </View>
    );
  }

  return (
    <Pressable
      onPress={startDownload}
      style={[styles.pill, styles.downloadPill]}
      accessibilityLabel="Download lecture"
    >
      <NativeBridgeHost>
        <NativeText variant="caption" colorRole="default">
          {status === "error" ? "⚠ Retry" : "↓ Download"}
        </NativeText>
      </NativeBridgeHost>
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
  downloadingPill: {
    backgroundColor: theme.colors.surface.primarySubtle,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  downloadPill: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
}));
