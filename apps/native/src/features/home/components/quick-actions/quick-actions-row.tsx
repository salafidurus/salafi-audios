import { Bookmark, GraduationCap, ListMusic } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components";

export type QuickActionsRowProps = {
  onNavigateToAllLectures?: () => void;
  onNavigateToScholars?: () => void;
  onNavigateToSaved?: () => void;
};

export function QuickActionsRow({
  onNavigateToAllLectures,
  onNavigateToScholars,
  onNavigateToSaved,
}: QuickActionsRowProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <View style={styles.container} testID="quick-actions-row">
      <Pressable
        testID="action-all-lectures"
        onPress={onNavigateToAllLectures}
        style={styles.pillButton}
        accessibilityRole="button"
      >
        <View style={styles.iconWrapper}>
          <ListMusic size={16} color={theme.colors.action.primary} />
        </View>
        <AppText variant="caption" color="strong" style={styles.pillText}>
          {t("navigation.subnav.explore.all", "All Lectures")}
        </AppText>
      </Pressable>

      <Pressable
        testID="action-scholars"
        onPress={onNavigateToScholars}
        style={styles.pillButton}
        accessibilityRole="button"
      >
        <View style={styles.iconWrapper}>
          <GraduationCap size={16} color={theme.colors.action.primary} />
        </View>
        <AppText variant="caption" color="strong" style={styles.pillText}>
          {t("navigation.subnav.explore.scholars", "Scholars")}
        </AppText>
      </Pressable>

      <Pressable
        testID="action-saved"
        onPress={onNavigateToSaved}
        style={styles.pillButton}
        accessibilityRole="button"
      >
        <View style={styles.iconWrapper}>
          <Bookmark size={16} color={theme.colors.action.primary} />
        </View>
        <AppText variant="caption" color="strong" style={styles.pillText}>
          {t("navigation.saved", "Saved")}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  pillButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  iconWrapper: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
}));
