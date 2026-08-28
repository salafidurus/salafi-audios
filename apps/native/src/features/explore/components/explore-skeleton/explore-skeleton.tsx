import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

/** Composes native explore and catalog surfaces for browsing available content. */
/** Describes the inputs, callbacks, and optional state accepted by Explore Skeleton. */
export type ExploreSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

/** Defines the native explore skeleton contract used by this module. */
export function ExploreSkeleton({ count = 6 }: ExploreSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={`explore-skeleton-${i}`} style={styles.card}>
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
