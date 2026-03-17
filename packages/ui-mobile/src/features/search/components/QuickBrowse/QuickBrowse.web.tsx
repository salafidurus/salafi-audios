import { View } from "react-native-unistyles/components/native/View";
import { Text } from "react-native-unistyles/components/native/Text";
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
    _web: {
      ...theme.typography.titleMd,
      marginBottom: theme.spacing.component.gapMd,
    },
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.component.gapMd,
  },
  cardWrapper: {
    _web: {
      padding: theme.spacing.scale.xs,
      // 2 columns on mobile, 4 columns on tablet+
      width: { xs: "48%", md: "23%" },
    },
  },
}));
