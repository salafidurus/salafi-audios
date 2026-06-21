import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

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
        <Text style={[styles.btnText, styles.publishBtnText]}>Publish</Text>
      </Pressable>
      <Pressable onPress={onArchive} disabled={isLoading} style={styles.archiveBtn}>
        <Text style={[styles.btnText, styles.archiveBtnText]}>Archive</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: theme.colors.surface.inverse,
    gap: 8,
  },
  countText: {
    flex: 1,
    color: theme.colors.content.inverse,
    fontSize: 13,
  },
  publishBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.action.success,
    borderRadius: 8,
  },
  archiveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.action.danger,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  publishBtnText: {
    color: theme.colors.content.onSuccess,
  },
  archiveBtnText: {
    color: theme.colors.content.onDanger,
  },
}));
