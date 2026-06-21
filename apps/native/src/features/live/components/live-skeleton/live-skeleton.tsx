import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type LiveSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

export function LiveSkeleton({ count = 2 }: LiveSkeletonProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={`live-skeleton-${i}`} style={styles.card}>
          <View style={[styles.line, styles.lineTitle]} />
          <View style={[styles.line, styles.lineMeta]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.spacing.component.gapSm,
  },
  card: {
    gap: theme.spacing.component.gapSm,
    padding: theme.spacing.component.cardPadding,
    borderRadius: theme.radius.component.card,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.default,
  },
  line: {
    height: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.surface.subtle,
  },
  lineTitle: {
    height: 16,
    width: "70%",
  },
  lineMeta: {
    width: "45%",
  },
}));
