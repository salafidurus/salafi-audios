import { SearchButton } from "../components/SearchButton";
import { QuickBrowse } from "../components/QuickBrowse";
import { StyleSheet } from "react-native-unistyles";
import { View } from "react-native";
import { TitleText } from "../components/TitleText";
import { ScreenView } from "@/shared/components/ScreenView";

export function SearchHome() {
  return (
    <ScreenView center>
      <View style={styles.content}>
        <View style={styles.searchGroup}>
          <View style={styles.header}>
            <TitleText>Find a lesson</TitleText>
          </View>
          <SearchButton placeholder="What do you want to listen to?" />
        </View>
        <QuickBrowse />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.component.gapXl,
  },
  searchGroup: {
    gap: theme.spacing.component.gapMd,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
}));
