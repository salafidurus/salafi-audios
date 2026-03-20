import { View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { BrowseCard } from "../BrowseCard";

const browseCategories = [
  { name: "Senior Scholars", searchKey: "Senior Scholars" },
  { name: "Hadith", searchKey: "Hadith" },
  { name: "Fiqh", searchKey: "Fiqh" },
  { name: "Tafsir", searchKey: "Tafsir" },
  { name: "Arabic", searchKey: "Arabic" },
  { name: "Farah", searchKey: "Farah" },
] as const;

export type QuickBrowseProps = {
  onSelectCategory?: (searchKey: string) => void;
};

export function QuickBrowse({ onSelectCategory }: QuickBrowseProps) {
  return (
    <View>
      <Text style={styles.header}>Browse all</Text>
      <View style={styles.grid}>
        {browseCategories.map((category) => (
          <View key={category.name} style={styles.cardWrapper}>
            <BrowseCard
              name={category.name}
              onPress={() => onSelectCategory?.(category.searchKey)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    color: theme.colors.content.strong,
    marginBottom: theme.spacing.component.gapMd,
    ...theme.typography.titleMd,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.component.gapMd,
  },
  cardWrapper: {
    width: "48%",
  },
}));
