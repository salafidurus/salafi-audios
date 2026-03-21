import { View } from "react-native-unistyles/components/native/View";
import { StyleSheet } from "react-native-unistyles";
import { QuickBrowseMobileWeb } from "../../components/QuickBrowse/QuickBrowse.mobile.web";
import { SearchButtonMobileWeb } from "../../components/SearchButton/SearchButton.mobile.web";
import { TitleTextMobileWeb } from "../../components/TitleText/TitleText.mobile.web";
import { ScreenViewWeb } from "@sd/shared";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeMobileWebScreen({
  onOpenSearch,
  onSelectCategory,
}: SearchHomeScreenProps) {
  return (
    <ScreenViewWeb center>
      <View style={styles.content}>
        <View style={styles.searchGroup}>
          <View style={styles.header}>
            <TitleTextMobileWeb>Find a lesson</TitleTextMobileWeb>
          </View>
          <SearchButtonMobileWeb
            placeholder="What do you want to listen to?"
            onPress={onOpenSearch}
          />
        </View>
        <QuickBrowseMobileWeb onSelectCategory={onSelectCategory} />
      </View>
    </ScreenViewWeb>
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
