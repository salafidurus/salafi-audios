import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type FeedSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

export function FeedSkeleton({ count = 6 }: FeedSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={`feed-skeleton-${i}`} style={styles.card}>
          <View style={[styles.line, styles.lineTitle]} />
          <View style={[styles.line, styles.lineMeta]} />
          <View style={[styles.line, styles.lineSub]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.scale.sm,
    gap: theme.spacing.scale.sm,
  },
  card: {
    padding: theme.spacing.scale.md,
    gap: theme.spacing.scale.sm,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.panelSm,
    backgroundColor: theme.colors.surface.default,
  },
  line: {
    height: 12,
    borderRadius: theme.radius.scale.xs,
    backgroundColor: theme.colors.surface.subtle,
  },
  lineTitle: {
    height: 16,
    width: "80%",
  },
  lineMeta: {
    width: "55%",
  },
  lineSub: {
    width: "35%",
  },
}));
