import { Pressable, Text, View } from "react-native";
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
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <Pressable
            key={tab.id}
            onPress={tab.onPress}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface.default,
    padding: 4,
    borderRadius: theme.radius.component.chip || 20,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginHorizontal: theme.spacing.layout.pageX,
    marginVertical: theme.spacing.scale.xs,
    alignSelf: "center",
  },
  tab: {
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
