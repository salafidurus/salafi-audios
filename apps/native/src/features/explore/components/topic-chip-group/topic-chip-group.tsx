import type { TopicDetailDto } from "@sd/core-contracts";

import { getLocalizedName } from "@sd/core-i18n";
import { FlatList, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";

export type TopicChipGroupProps = {
  topics: TopicDetailDto[];
  selectedId: string | null;
  onSelect: (topic: TopicDetailDto) => void;
};

export function TopicChipGroup({ topics, selectedId, onSelect }: TopicChipGroupProps) {
  const { i18n } = useTranslation();

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={topics}
        keyExtractor={(item) => item.slug}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => {
          const isSelected = selectedId === item.slug;
          const label = getLocalizedName(item.name, i18n.language);
          return (
            <Pressable
              onPress={() => onSelect(item)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              accessibilityRole="button"
            >
              <AppText
                variant="labelMd"
                style={isSelected ? styles.chipSelectedText : styles.chipText}
              >
                {label}
              </AppText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.layout.pageX,
  },
  scrollContent: {
    gap: theme.spacing.scale.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.component.chipX,
    paddingVertical: theme.spacing.component.chipY,
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  chipSelected: {
    backgroundColor: theme.colors.action.primary,
  },
  chipText: {
    color: theme.colors.content.default,
  },
  chipSelectedText: {
    color: theme.colors.content.onPrimary,
  },
}));
