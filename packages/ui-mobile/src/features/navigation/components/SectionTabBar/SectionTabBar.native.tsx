import { Pressable, View, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { TabConfig } from "../../types";

type Props = {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export function SectionTabBar({ tabs, activeTab, onTabChange }: Props) {
  const { theme } = useUnistyles();

  const handlePress = (tabId: string) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(tabId);
  };

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => handlePress(tab.id)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <EaseView
              animate={{
                scale: isActive ? 1 : 0.95,
              }}
              transition={{ type: "spring", damping: 12, stiffness: 150 }}
            >
              <View
                style={[
                  styles.pill,
                  isActive && {
                    backgroundColor: theme.colors.surface.subtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive ? theme.colors.content.primary : theme.colors.content.muted,
                      fontWeight: isActive ? "500" : "400",
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </EaseView>
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
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.xs,
    borderRadius: theme.radius.component.chip,
  },
  label: {
    fontSize: 13,
    textAlign: "center",
  },
}));
