import type { ScholarChipDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { FlatList, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MarqueeText } from "@/shared/components/MarqueeText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { NativeText } from "@/shared/ui";

export type ExploreScholarRowProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

export function ExploreScholarRow({ scholars, onScholarPress }: ExploreScholarRowProps) {
  function renderScholar({ item: scholar }: ListRenderItemInfo<ScholarChipDto>) {
    return (
      <Pressable
        onPress={() => onScholarPress?.(scholar.slug)}
        style={styles.scholar}
        testID={`scholar-chip-${scholar.slug}`}
      >
        <UserAvatar image={scholar.imageUrl} name={scholar.name} size={48} />
        <MarqueeText text={scholar.name} variant="caption" style={styles.name} />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <NativeText variant="titleMd" colorRole="strong">
        Popular Scholars
      </NativeText>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        data={scholars}
        keyExtractor={(item) => item.id}
        renderItem={renderScholar}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.scale.sm,
    paddingVertical: theme.spacing.scale.md,
  },
  listContent: {
    gap: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.scale.xs,
  },
  scholar: {
    alignItems: "center",
    width: 72,
  },
  name: {
    fontSize: 12,
    color: theme.colors.content.subtle,
    textAlign: "center",
    maxWidth: 72,
  },
}));
