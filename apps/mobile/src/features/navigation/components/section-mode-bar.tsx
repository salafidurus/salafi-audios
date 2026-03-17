import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Search, Cloud, Mic, CassetteTape, Settings } from "lucide-react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SectionTabBar } from "./section-tab-bar";
import type { Section, TabConfig } from "../types";
import type { ComponentType } from "react";

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

const SECTION_ICONS: Record<Section, IconComponent> = {
  feed: Cloud as IconComponent,
  live: Mic as IconComponent,
  library: CassetteTape as IconComponent,
  account: Settings as IconComponent,
};

const SearchIcon = Search as IconComponent;

type Props = {
  currentSection: Section;
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSectionPress: () => void;
  onSearchPress: () => void;
};

export function SectionModeBar({
  currentSection,
  tabs,
  activeTab,
  onTabChange,
  onSectionPress,
  onSearchPress,
}: Props) {
  const { theme } = useUnistyles();
  const SectionIcon = SECTION_ICONS[currentSection];

  const handleIconPress = (callback: () => void) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    callback();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => handleIconPress(onSectionPress)}
        style={styles.iconButton}
        accessibilityLabel={`Switch from ${currentSection}`}
        accessibilityRole="button"
      >
        <EaseView
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
        >
          <SectionIcon color={theme.colors.content.primary} size={22} strokeWidth={1.5} />
        </EaseView>
      </Pressable>

      <SectionTabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      <Pressable
        onPress={() => handleIconPress(onSearchPress)}
        style={styles.iconButton}
        accessibilityLabel="Open search"
        accessibilityHint="Go back to search home"
        accessibilityRole="button"
      >
        <EaseView
          animate={{ scale: 1, opacity: 0.72 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
        >
          <SearchIcon color={theme.colors.content.muted} size={22} strokeWidth={2} />
        </EaseView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
}));
