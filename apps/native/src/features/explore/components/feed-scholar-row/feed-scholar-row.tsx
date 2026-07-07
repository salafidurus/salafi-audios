import { View, Text, Pressable, FlatList } from "react-native";
import type { ListRenderItemInfo } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image } from "expo-image";
import type { ScholarChipDto } from "@sd/core-contracts";

export type FeedScholarRowProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

export function FeedScholarRow({ scholars, onScholarPress }: FeedScholarRowProps) {
  function renderScholar({ item: scholar }: ListRenderItemInfo<ScholarChipDto>) {
    return (
      <Pressable onPress={() => onScholarPress?.(scholar.slug)} style={styles.scholar}>
        <View style={styles.avatar}>
          {scholar.imageUrl && (
            <Image
              source={{ uri: scholar.imageUrl }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          )}
        </View>
        <Text numberOfLines={1} style={styles.name}>
          {scholar.name}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Popular Scholars</Text>
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
    paddingVertical: theme.spacing.scale.md,
  },
  heading: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.content.strong,
    marginBottom: theme.spacing.scale.sm,
    paddingStart: theme.spacing.scale.xs,
  },
  listContent: {
    gap: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.scale.xs,
  },
  scholar: {
    alignItems: "center",
    width: 72,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.subtle,
    marginBottom: theme.spacing.scale.xs,
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  name: {
    fontSize: 12,
    color: theme.colors.content.subtle,
    textAlign: "center",
    maxWidth: 72,
  },
}));
