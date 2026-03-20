import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { QuickBrowse } from "../components/QuickBrowse";
import { SearchButton } from "../components/SearchButton";
import { TitleText } from "../components/TitleText";
import { ScreenView } from "@sd/shared";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeScreen({ onOpenSearch, onSelectCategory }: SearchHomeScreenProps) {
  return (
    <ScreenView center>
      <View style={styles.content}>
        <View style={styles.searchGroup}>
          <View style={styles.header}>
            <TitleText>Find a lesson</TitleText>
          </View>
          <SearchButton placeholder="What do you want to listen to?" onPress={onOpenSearch} />
        </View>
        <QuickBrowse onSelectCategory={onSelectCategory} />
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
