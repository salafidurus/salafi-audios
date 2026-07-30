import React, { useCallback } from "react";
import { FlatList, Pressable, Text, type ListRenderItem } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type SubrouteTabItem = {
  id: string;
  label: string;
  onPress: () => void;
};

export type SubrouteTabsProps = {
  tabs: SubrouteTabItem[];
  activeTabId: string;
};

export function SubrouteTabs({ tabs, activeTabId }: SubrouteTabsProps) {
  const renderTab: ListRenderItem<SubrouteTabItem> = useCallback(
    ({ item: tab }) => {
      const isActive = tab.id === activeTabId;
      return (
        <Pressable onPress={tab.onPress} style={[styles.tab, isActive && styles.tabActive]}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.label, isActive && styles.labelActive]}
          >
            {tab.label}
          </Text>
        </Pressable>
      );
    },
    [activeTabId],
  );

  return (
    <FlatList
      horizontal
      data={tabs}
      keyExtractor={(item) => item.id}
      renderItem={renderTab}
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radius.component.chip || 20,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginHorizontal: theme.spacing.layout.pageX,
    marginVertical: theme.spacing.scale.xs,
    alignSelf: "center",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.scale.md || 16,
    paddingVertical: theme.spacing.scale.xs || 8,
    borderRadius: theme.radius.component.chip || 18,
  },
  tabActive: {
    backgroundColor: theme.colors.surface.subtle || "#eaeaea",
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.content.muted,
  },
  labelActive: {
    color: theme.colors.content.primary,
    fontWeight: "bold",
  },
}));
