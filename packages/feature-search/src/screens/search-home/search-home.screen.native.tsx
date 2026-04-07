import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenViewMobileNative } from "@sd/shared";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeMobileNativeScreen({
  onOpenSearch,
  onSelectCategory,
}: SearchHomeScreenProps) {
  const quickLinks = [
    { label: "Senior Scholars", searchKey: "Senior Scholars" },
    { label: "Hadith", searchKey: "Hadith" },
    { label: "Fiqh", searchKey: "Fiqh" },
    { label: "Tafsir", searchKey: "Tafsir" },
  ] as const;

  return (
    <ScreenViewMobileNative center>
      <View style={styles.content}>
        <View style={styles.searchGroup}>
          <View style={styles.header}>
            <Text style={styles.title}>Find a lesson</Text>
            <Text style={styles.subtitle}>Search lectures, scholars, and topics.</Text>
          </View>
          <Pressable
            onPress={onOpenSearch}
            style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
          >
            <Text style={styles.searchButtonText}>What do you want to listen to?</Text>
          </Pressable>
        </View>
        <View style={styles.quickBrowse}>
          <Text style={styles.quickBrowseTitle}>Browse all</Text>
          <View style={styles.quickBrowseGrid}>
            {quickLinks.map((item) => (
              <Pressable
                key={item.searchKey}
                onPress={() => onSelectCategory?.(item.searchKey)}
                style={({ pressed }) => [styles.quickBrowseCard, pressed && styles.pressed]}
              >
                <Text style={styles.quickBrowseCardText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScreenViewMobileNative>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    width: "100%",
    gap: theme.spacing.component.gapXl,
  },
  searchGroup: {
    width: "100%",
    gap: theme.spacing.component.gapMd,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    gap: theme.spacing.scale.xs,
  },
  title: {
    color: theme.colors.content.primary,
    textAlign: "center",
    ...theme.typography.displayMd,
  },
  subtitle: {
    color: theme.colors.content.muted,
    textAlign: "center",
    ...theme.typography.bodyMd,
  },
  searchButton: {
    width: "100%",
    borderRadius: theme.radius.component.panelSm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.default,
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.md,
  },
  searchButtonText: {
    color: theme.colors.content.muted,
    ...theme.typography.bodyMd,
  },
  quickBrowse: {
    width: "100%",
    gap: theme.spacing.component.gapMd,
  },
  quickBrowseTitle: {
    color: theme.colors.content.strong,
    ...theme.typography.titleMd,
  },
  quickBrowseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.component.gapMd,
  },
  quickBrowseCard: {
    width: "48%",
    minHeight: 96,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.component.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.default,
    paddingHorizontal: theme.spacing.component.cardPadding,
    paddingVertical: theme.spacing.component.gapLg,
  },
  quickBrowseCardText: {
    color: theme.colors.content.default,
    textAlign: "center",
    ...theme.typography.labelMd,
  },
  pressed: {
    opacity: 0.82,
  },
}));
