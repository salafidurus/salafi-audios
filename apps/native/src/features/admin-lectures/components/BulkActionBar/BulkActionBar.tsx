import { Pressable, StyleSheet, Text, View } from "react-native";

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
    <View style={styles.container}>
      <Text style={styles.countText}>{selectedCount} selected</Text>
      <Pressable onPress={onPublish} disabled={isLoading} style={styles.publishBtn}>
        <Text style={styles.btnText}>Publish</Text>
      </Pressable>
      <Pressable onPress={onArchive} disabled={isLoading} style={styles.archiveBtn}>
        <Text style={styles.btnText}>Archive</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1a1a1a",
    gap: 8,
  },
  countText: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
  },
  publishBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#16a34a",
    borderRadius: 8,
  },
  archiveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#dc2626",
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
