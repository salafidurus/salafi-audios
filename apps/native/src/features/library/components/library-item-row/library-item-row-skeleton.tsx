import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Skeleton } from "@/shared/components/Skeleton/Skeleton";

export type LibraryItemRowSkeletonProps = {
  count?: number;
};

export function LibraryItemRowSkeleton({ count = 4 }: LibraryItemRowSkeletonProps) {
  return (
    <View testID="library-item-row-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <View key={`library-skeleton-${i}`} style={[styles.row, i < count - 1 && styles.rowBorder]}>
          <View style={styles.iconContainer}>
            <Skeleton width={20} height={20} borderRadius={4} />
          </View>
          <View style={styles.content}>
            <Skeleton width="80%" height={16} style={styles.skeletonLine} />
            <Skeleton width="60%" height={12} style={[styles.skeletonLine, styles.skeletonLine2]} />
            <Skeleton width="40%" height={11} style={[styles.skeletonLine, styles.skeletonLine3]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    width: 28,
    alignItems: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  skeletonLine: {
    opacity: 0.5,
  },
  skeletonLine2: {
    marginTop: 2,
  },
  skeletonLine3: {
    marginTop: 2,
  },
});
