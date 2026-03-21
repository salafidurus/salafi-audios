import { View } from "react-native-unistyles/components/native/View";
import { StyleSheet } from "react-native-unistyles";
import { QuickBrowse } from "../../components/QuickBrowse/QuickBrowse.web";
import { SearchButton } from "../../components/SearchButton/SearchButton.web";
import { TitleText } from "../../components/TitleText/TitleText.web";
import { ScreenViewWeb } from "@sd/shared";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeMobileWebScreen({ onOpenSearch, onSelectCategory }: SearchHomeScreenProps) {
  return (
    <ScreenViewWeb center>
      <View style={styles.content}>
        <View style={styles.searchGroup}>
          <View style={styles.header}>
            <TitleText>Find a lesson</TitleText>
          </View>
          <SearchButton placeholder="What do you want to listen to?" onPress={onOpenSearch} />
        </View>
        <QuickBrowse onSelectCategory={onSelectCategory} />
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
