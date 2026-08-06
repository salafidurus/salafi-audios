import { ChevronRight, Sparkles } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";

export type CuratedCollectionsBannerProps = {
  onPress?: () => void;
};

/**
 * Teaser banner at the bottom of the Home scroll view.
 * Matches the prototype's dashed-border "Curated collections — coming soon" card.
 */
export function CuratedCollectionsBanner({ onPress }: CuratedCollectionsBannerProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <Pressable
      testID="curated-collections-banner"
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={t("home.curatedCollections", "Curated collections")}
    >
      <View style={styles.iconWrapper}>
        <Sparkles size={20} color={theme.colors.action.primary} />
      </View>

      <View style={styles.textContainer}>
        <AppText variant="labelMd" color="strong" style={styles.title}>
          {t("home.curatedCollections", "Curated collections")}
        </AppText>
        <AppText variant="xs" color="muted" style={styles.subtitle}>
          {t("home.curatedCollectionsSub", "Themed learning paths — coming soon")}
        </AppText>
      </View>

      <ChevronRight size={16} color={theme.colors.content.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.subtle,
    padding: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 11,
  },
}));
