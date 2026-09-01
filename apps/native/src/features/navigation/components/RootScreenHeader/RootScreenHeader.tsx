import { Host } from "@expo/ui";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText, NativeIcon } from "@/shared/ui";

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
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Navigate up"
          hitSlop={8}
          onPress={onBack}
          testID="root-screen-back-button"
        >
          <Host>
            <NativeIcon name="back" colorRole="strong" size={24} />
          </Host>
        </Pressable>
      ) : null}
      <AppText variant="titleLg" style={styles.title}>
        {title}
      </AppText>
      {showSearch ? <GlobalSearchButton /> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: theme.spacing.layout.pageY,
    paddingBottom: theme.spacing.scale.sm,
    backgroundColor: theme.colors.surface.canvas,
  },
  title: {
    flex: 1,
  },
}));
