import { View, Text, useWindowDimensions } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { BrowseCard } from "./BrowseCard";
import { breakpoints } from "@/core/styles/breakpoints";

const browseCategories = [
  { name: "Senior Scholars", searchKey: "Senior Scholars" },
  { name: "Hadith", searchKKey: "Hadith" },
  { name: "Fiqh", searchKey: "Fiqh" },
  { name: "Tafsir", searchKey: "Tafsir" },
  { name: "Arabic", searchKey: "Arabic" },
  { name: "Farah", searchKey: "Farah" },
];

export function QuickBrowse() {
  const { theme } = useUnistyles();
  const { width } = useWindowDimensions();
  const numColumns = width >= breakpoints.md ? 4 : 2;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Browse all</Text>
      <View style={[styles.grid, { gap: theme.spacing.component.gapMd }]}>
        {browseCategories.map((category) => (
          <View key={category.name} style={[styles.cardWrapper, { width: `${96 / numColumns}%` }]}>
            <BrowseCard name={category.name} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    // flex: 1,
  },
  header: {
    fontFamily: theme.typography.titleMd.fontFamily,
    fontSize: theme.typography.titleMd.fontSize,
    lineHeight: theme.typography.titleMd.lineHeight,
    letterSpacing: theme.typography.titleMd.letterSpacing,
    color: theme.colors.content.strong,
    marginBottom: theme.spacing.component.gapMd,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardWrapper: {
    padding: 2,
  },
}));
