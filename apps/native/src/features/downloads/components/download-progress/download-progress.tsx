import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useDownload } from "@/features/downloads/hooks/use-download";

type DownloadProgressProps = {
  lectureId: string;
};

export function DownloadProgress({ lectureId }: DownloadProgressProps) {
  const { isDownloading, progress } = useDownload(lectureId);

  if (!isDownloading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.label}>{Math.round(progress)}%</Text>
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
