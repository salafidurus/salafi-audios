import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { AppText } from "@/shared/ui";

import { GlobalSearchButton } from "../GlobalSearchButton/GlobalSearchButton";

/** Provides the visible root-page header used when native stack chrome is hidden. */
/** Describes title, search, and back actions for a listener-facing screen header. */
export type RootScreenHeaderProps = {
  title: string;
  showSearch?: boolean;
  onBack?: () => void;
};

/** Renders an accessible in-content header for root and pushed native screens. */
export function RootScreenHeader({ title, showSearch = true, onBack }: RootScreenHeaderProps) {
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.container,
        {
          gap: theme.spacing.scale.md,
          paddingTop: theme.spacing.layout.pageY,
          paddingBottom: theme.spacing.scale.sm,
          backgroundColor: theme.colors.surface.canvas,
        },
      ]}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Navigate up"
          hitSlop={8}
          onPress={onBack}
          testID="root-screen-back-button"
        >
          <ArrowLeft color={theme.colors.content.strong} size={24} strokeWidth={2} />
        </Pressable>
      ) : null}
      <AppText variant="titleLg" style={styles.title}>
        {title}
      </AppText>
      {showSearch ? <GlobalSearchButton /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
  },
});
