import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
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
  const { t } = useTranslation();

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
          accessibilityLabel={t("common.navigateUp")}
          hitSlop={8}
          onPress={onBack}
          testID="root-screen-back-button"
        >
          {/* RootScreenHeader owns the RN navigation shell; lucide keeps this icon out of the Compose boundary. */}
          <ArrowLeft
            color={theme.colors.content.strong}
            size={theme.spacing.scale["2xl"]}
            strokeWidth={2}
            style={theme.direction === "rtl" ? { transform: [{ rotate: "180deg" }] } : undefined}
          />
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
