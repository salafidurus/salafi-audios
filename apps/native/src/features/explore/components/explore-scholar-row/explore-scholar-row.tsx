import type { ScholarChipDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { FlatList, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MarqueeText } from "@/shared/components/MarqueeText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { AppText } from "@/shared/ui";

/** Describes the inputs and callbacks accepted by Explore Scholar Row. */
/** Describes the inputs, callbacks, and optional state accepted by Explore Scholar Row. */
export type ExploreScholarRowProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

/** Renders the native explore scholar row surface and coordinates its user-facing state. */
export function ExploreScholarRow({ scholars, onScholarPress }: ExploreScholarRowProps) {
  function renderScholar({ item: scholar }: ListRenderItemInfo<ScholarChipDto>) {
    return (
      <Pressable
        onPress={() => onScholarPress?.(scholar.slug)}
        style={styles.scholar}
        testID={`scholar-card-${scholar.slug}`}
      >
        <View style={styles.scholarContent}>
          <UserAvatar image={scholar.imageUrl} name={scholar.name} size={48} />
          <MarqueeText text={scholar.name} variant="caption" style={styles.name} />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="titleMd" style={styles.heading}>
        Popular Scholars
      </AppText>
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
  scholarContent: {
    alignItems: "center",
    width: "100%",
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
