import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { QuickBrowse } from "../../components/QuickBrowse/QuickBrowse.native";
import { SearchButton } from "../../components/SearchButton/SearchButton.native";
import { TitleText } from "../../components/TitleText/TitleText.native";
import { ScreenViewMobileNative } from "@sd/shared";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeMobileNativeScreen({
  onOpenSearch,
  onSelectCategory,
}: SearchHomeScreenProps) {
  return (
    <ScreenViewMobileNative center backgroundVariant="primaryWash">
      <View style={styles.content}>
        <View style={styles.searchGroup}>
          <View style={styles.header}>
            <TitleText>Find a lesson</TitleText>
          </View>
          <SearchButton placeholder="What do you want to listen to?" onPress={onOpenSearch} />
        </View>
        <QuickBrowse onSelectCategory={onSelectCategory} />
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
  },
}));
