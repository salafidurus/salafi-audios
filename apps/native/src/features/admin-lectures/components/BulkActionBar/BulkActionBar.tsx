import { Pressable, Text, View } from "react-native";

type BulkActionBarProps = {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  isLoading?: boolean;
};

export function BulkActionBar({
  selectedCount,
  onPublish,
  onArchive,
  isLoading,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#1a1a1a",
        gap: 8,
      }}
    >
      <Text style={{ flex: 1, color: "#fff", fontSize: 13 }}>{selectedCount} selected</Text>
      <Pressable
        onPress={onPublish}
        disabled={isLoading}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#16a34a",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Publish</Text>
      </Pressable>
      <Pressable
        onPress={onArchive}
        disabled={isLoading}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#dc2626",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Archive</Text>
      </Pressable>
    </View>
  );
}
