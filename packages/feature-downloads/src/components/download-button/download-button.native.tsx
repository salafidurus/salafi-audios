import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useDownload } from "../../hooks/use-download";

type DownloadButtonNativeProps = {
  lectureId: string;
  audioUrl: string;
};

export function DownloadButtonNative({ lectureId }: DownloadButtonNativeProps) {
  const { status, isDownloaded, isDownloading, startDownload, removeDownload } =
    useDownload(lectureId);

  if (isDownloaded) {
    return (
      <TouchableOpacity
        onPress={removeDownload}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 6,
          backgroundColor: "#f0fdf4",
        }}
        accessibilityLabel="Remove download"
      >
        <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>✓ Downloaded</Text>
      </TouchableOpacity>
    );
  }

  if (isDownloading) {
    return (
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 6,
          backgroundColor: "#eff6ff",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={{ fontSize: 13, color: "#2563eb" }}>Downloading</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={startDownload}
      disabled={status === "error"}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#d1d5db",
      }}
      accessibilityLabel="Download lecture"
    >
      <Text style={{ fontSize: 13, color: "#374151" }}>
        {status === "error" ? "⚠ Retry" : "↓ Download"}
      </Text>
    </TouchableOpacity>
  );
}
