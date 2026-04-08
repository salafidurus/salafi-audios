import { View, Text } from "react-native";
import { useDownload } from "../../hooks/use-download";

type DownloadProgressNativeProps = {
  lectureId: string;
};

export function DownloadProgressNative({ lectureId }: DownloadProgressNativeProps) {
  const { isDownloading, progress } = useDownload(lectureId);

  if (!isDownloading) return null;

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          height: 3,
          backgroundColor: "#e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: "#2563eb",
            borderRadius: 2,
          }}
        />
      </View>
      <Text style={{ fontSize: 11, color: "#999" }}>{Math.round(progress)}%</Text>
    </View>
  );
}
