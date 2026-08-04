import { Column } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

export type ExploreSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

export function ExploreSkeleton({ count = 6 }: ExploreSkeletonProps) {
  const { theme } = useUnistyles();

  return (
    <Column spacing={theme.spacing.scale.sm} style={{ padding: theme.spacing.scale.sm }}>
      {Array.from({ length: count }).map((_, i) => (
        <Column
          key={`explore-skeleton-${i}`}
          spacing={theme.spacing.scale.sm}
          style={{
            padding: theme.spacing.scale.md,
            borderWidth: theme.border.width.default,
            borderColor: theme.colors.border.subtle,
            borderRadius: theme.radius.component.panelSm,
            backgroundColor: theme.colors.surface.default,
          }}
        >
          <Column
            style={{
              height: 16,
              borderRadius: theme.radius.scale.xs,
              backgroundColor: theme.colors.surface.subtle,
            }}
          />
          <Column
            style={{
              height: 12,
              borderRadius: theme.radius.scale.xs,
              backgroundColor: theme.colors.surface.subtle,
            }}
          />
          <Column
            style={{
              height: 12,
              borderRadius: theme.radius.scale.xs,
              backgroundColor: theme.colors.surface.subtle,
            }}
          />
        </Column>
      ))}
    </Column>
  );
}
