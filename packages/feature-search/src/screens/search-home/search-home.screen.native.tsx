import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenViewMobileNative } from "@sd/shared";
import { QuickBrowse } from "../../components/QuickBrowse/QuickBrowse.native";
import { useQuickBrowse } from "../../hooks/use-quickbrowse";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
};

export function SearchHomeMobileNativeScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeScreenProps) {
  const { data } = useQuickBrowse();

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
        <QuickBrowse
          scholars={data?.scholars}
          suggestions={data?.suggestions}
          recentProgress={data?.recentProgress}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
          onSelectCategory={onSelectCategory}
        />
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
  pressed: {
    opacity: 0.82,
  },
}));
