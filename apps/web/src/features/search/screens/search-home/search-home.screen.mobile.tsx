import { View } from "react-native-unistyles/components/native/View";
import { StyleSheet } from "react-native-unistyles";
import { QuickBrowseMobile } from "../../components/QuickBrowse/QuickBrowse.mobile";
import { SearchButtonMobile } from "../../components/SearchButton/SearchButton.mobile";
import { TitleTextMobile } from "../../components/TitleText/TitleText.mobile";
import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { useQuickBrowse } from "@sd/domain-search";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
};

export function SearchHomeMobileScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeScreenProps) {
  const { data } = useQuickBrowse();

  return (
    <ScreenView center>
      <View style={styles.content}>
        <View style={styles.searchGroup}>
          <View style={styles.header}>
            <TitleTextMobile>Find a lesson</TitleTextMobile>
          </View>
          <SearchButtonMobile
            placeholder="What do you want to listen to?"
            onPress={onOpenSearch}
          />
        </View>
        <QuickBrowseMobile
          scholars={data?.scholars}
          suggestions={data?.suggestions}
          recentProgress={data?.recentProgress}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
          onSelectCategory={onSelectCategory}
        />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.component.gapXl,
    width: "100%",
  },
  searchGroup: {
    gap: theme.spacing.component.gapMd,
  },
  header: {
    alignItems: "center",
  },
}));
